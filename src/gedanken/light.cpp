#include <iostream>

int f(int light, int range) {
  auto b = 0;

  light += -7;
  light -= range;
  if (light < 0) {
    --b;
    if (-7 < light) {
      b = (1 << -(light + 1)); } }
  return b; }

int f2(int light, int range) {
  light = light - 6 - range;
  if (0 < light)
    return 0;
  else if (light < -5)
    return -1;
  else
    return 1 << (-light);
 }


int main(int, char* []) {
  for (auto light = 0; light < 18; ++light) {
    std::cout << light << ": ";
    for (auto range = 0; range < 10; ++range) {
      std::cout << f(light, range) << " "; }
    std::cout << std::endl; }

  for (auto light = 0; light < 18; ++light) {
    std::cout << light << ": ";
    for (auto range = 0; range < 10; ++range) {
      std::cout << f2(light, range) << " "; }
    std::cout << std::endl; }

  return 0; }
