#include <iostream>
#include <vector>


unsigned popcount(unsigned x) {
  unsigned count = 0;
  for (auto shift = 8 * sizeof(x); 0 < shift; --shift) {
    count += (x & 1);
    x = x >> 1; }
  return count; };


class Random {
public:
  Random() : seed(0x005dc773) {}
  explicit Random(unsigned s) : seed(s) {}

  unsigned operator()() {
    // linear feedback shift register pseudo random number generator
    for (auto i = 0; i < 8; ++i) {
      unsigned carry = popcount(seed & 0x00e10000) & 1;
      seed = ((seed << 1) & 0x00ffffff) + carry; }
    return seed & 0x000000ff; }

private:
  unsigned seed; };


class Direction {
public:
  Direction(Random& rnd) : v(normalize(rnd())) {}
  explicit Direction(int d = 0) : v(normalize(d)) {}
  friend Direction reverse(Direction d);
  operator int() { return v; }

private:
  int v;
  int normalize(int d) { return d & 3; }};

Direction reverse(Direction d) { return Direction(d.v + 2); }


class Room {
public:
  enum WallState { OPEN = 0, DOOR = 1, SECRET = 2, SOLID = 3 };
  Room() : v(0xff) {}
  explicit Room(int x) : v(x) {}
  void set(Direction d, WallState s) {
    clear(d);
    v |= (s << shift(d)); }
  WallState get(Direction d) { return WallState((v & ~mask(d)) >> shift(d)); }
  operator unsigned char() const { return v; }

private:
  unsigned char v;
  void clear(Direction d) { v &= mask(d); }
  int shift(Direction d) const { return d << 1; }
  unsigned char mask(Direction d) { return ~(0x03 << shift(d)); }};


class Position;
Position make(int r, int c);


class Position {
public:
  int col;
  int row;
  Position(Random& rnd) : col(normalize(rnd())) , row(normalize(rnd())) {}
  Position(int r, int c) : col(normalize(c)), row(normalize(r)) {}
  Position() : col(0), row(0) {}
  operator int() const { return row * 32 + col; }
  Position move(Direction d) const {
    const int dr[4] = { -1, 0, 1, 0 };
    const int dc[4] = { 0, 1, 0, -1 };
    return make(row + dr[d], col + dc[d]); }
  bool normal() { return normalize(row) == row && normalize(col) == col; }

private:
  int normalize(int x) { return x & 0x1f; }};


Position make(int r, int c) {
  Position p;
  p.row = r;
  p.col = c;
  return p; }


class Maze {
public:
  std::vector<Room> maze;
  enum { DIM = 32 };

  char cell(int x) {
    if (x == Room()) { return '.'; }
    for (int i = 0; i < 4; ++i) {
      auto wall = Room(x).get(Direction(i));
      if (wall == Room::DOOR || wall == Room::SECRET) { return 'D'; }}
    return '@'; }

  std::string elm_cell(int x) {
    std::string str = "";
    for (int i = 0; i < 4; ++i) {
      auto wall = Room(x).get(Direction(i));
      switch (wall) {
      case Room::DOOR: str += "D"; break;
      case Room::SECRET: str += "S"; break;
      case Room::SOLID: str += "W"; break;
      case Room::OPEN: str += "O"; break; }}
    return str; }

  std::ostream& print(std::ostream& os) {
    for (auto i = 0UL; i < maze.size(); ++i) {
      os << elm_cell(maze[i]) << ((i + 1) % DIM ? "" : "\n"); }
    //  os << cell(maze[i]) << ((i + 1) % DIM ? "" : "\n"); }
    return os; }

  Maze(Random& rnd) : maze(DIM * DIM) {
    gen(rnd); }

  void find_neighbours(int arr[9], Position position) {
    auto u = 0;
    for (auto r = position.row - 1; r < position.row + 2; ++r) {
      for (auto c = position.col - 1; c < position.col + 2; ++c) {
        Position p = make(r, c);
        arr[u] = p.normal() ? maze[p] : Room();
        ++u; }}}

  bool can_tunnel(const int n[9]) {
    // do not allow 2x2 open space
    return (n[3] == Room() || n[0] == Room() || n[1] == Room())
        && (n[1] == Room() || n[2] == Room() || n[5] == Room())
        && (n[5] == Room() || n[8] == Room() || n[7] == Room())
        && (n[7] == Room() || n[6] == Room() || n[3] == Room()); }


  void gen(Random& rnd) {
    gen_tunnel(rnd);

    for (int i = 0; i < 70; ++i) {
      gen_door(rnd, Room::DOOR); }

    for (int i = 0; i < 45; ++i) {
      gen_door(rnd, Room::SECRET); }}


  void gen_tunnel(Random& rnd) {
    int neighbour[9] = { 0, 0, 0, 0, 0, 0, 0, 0, 0 };
    Position p_position(rnd);
    Position position;

    auto cells = 499;
    while (0 < cells) {
      auto direction = Direction(rnd);
      auto distance = rnd_distance(rnd);
      while (0 < distance && 0 < cells) {
        position = p_position.move(direction);
        find_neighbours(&neighbour[0], position);
        if (position.normal() && can_tunnel(&neighbour[0])) {
          if (maze[position] == Room()) {
              --cells; }
          set_feature(p_position, direction, Room::OPEN);
          for (auto i = 0; i < 4; ++i) {
            Position p = position.move(Direction(i));
            if (p.normal() && maze[p] != Room()) {
              set_feature(position, Direction(i), Room::OPEN); }}
            
          p_position = position;
          --distance; }
        else {
          break; }}}}


  void set_feature(Position position, Direction direction, Room::WallState feature) {
    maze[position].set(direction, feature);
    maze[position.move(direction)].set(reverse(direction), feature); }


  void gen_door(Random& rnd, Room::WallState feature) {
    Position position;
    Direction direction;

    do {
      do {
        position = Position(rnd); }
      while (maze[position] == Room());
      direction = Direction(rnd); }
    while (maze[position].get(direction) != Room::OPEN);

    set_feature(position, direction, feature); }


  int rnd_distance(Random& r) { return (r() & 7) + 1; }
};


int main(int, char* []) {
  Random rnd0(0x005dc773);
  Random rnd1(0x00975dc7);
  Random rnd2(0x00f3975d);
  Random rnd3(0x0013f397);
  Random rnd4(0x008713f3);
  Maze m0(rnd0);
  Maze m1(rnd1);
  Maze m2(rnd2);
  Maze m3(rnd3);
  Maze m4(rnd4);
  m0.print(std::cout);
std::cout << "\n\n";
  m1.print(std::cout);
std::cout << "\n\n";
  m2.print(std::cout);
std::cout << "\n\n";
  m3.print(std::cout);
std::cout << "\n\n";
  m4.print(std::cout);

  return 0; }
