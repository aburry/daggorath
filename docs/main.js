
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		return '<function>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$singleton = function (value) {
	return {
		ctor: '::',
		_0: value,
		_1: {ctor: '[]'}
	};
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(value)
	{
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		currentSend(result._0);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Platform$sendToApp(router),
				_p1._0));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (convert, task) {
		return A2(
			_elm_lang$core$Task$onError,
			function (_p2) {
				return _elm_lang$core$Task$fail(
					convert(_p2));
			},
			task);
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											},
											taskE);
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p3 = tasks;
	if (_p3.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_p3._0,
			_elm_lang$core$Task$sequence(_p3._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p4) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p7, _p6, _p5) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$Perform = function (a) {
	return {ctor: 'Perform', _0: a};
};
var _elm_lang$core$Task$perform = F2(
	function (toMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(_elm_lang$core$Task$map, toMessage, task)));
	});
var _elm_lang$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(
					_elm_lang$core$Task$onError,
					function (_p8) {
						return _elm_lang$core$Task$succeed(
							resultToMessage(
								_elm_lang$core$Result$Err(_p8)));
					},
					A2(
						_elm_lang$core$Task$andThen,
						function (_p9) {
							return _elm_lang$core$Task$succeed(
								resultToMessage(
									_elm_lang$core$Result$Ok(_p9)));
						},
						task))));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$Perform(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _elm_lang$core$Native_List.fromArray(is);
}


function toInt(s)
{
	var len = s.length;

	// if empty
	if (len === 0)
	{
		return intErr(s);
	}

	// if hex
	var c = s[0];
	if (c === '0' && s[1] === 'x')
	{
		for (var i = 2; i < len; ++i)
		{
			var c = s[i];
			if (('0' <= c && c <= '9') || ('A' <= c && c <= 'F') || ('a' <= c && c <= 'f'))
			{
				continue;
			}
			return intErr(s);
		}
		return _elm_lang$core$Result$Ok(parseInt(s, 16));
	}

	// is decimal
	if (c > '9' || (c < '0' && c !== '-' && c !== '+'))
	{
		return intErr(s);
	}
	for (var i = 1; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return intErr(s);
		}
	}

	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function intErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int");
}


function toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return floatErr(s);
	}
	var n = +s;
	// faster isNaN check
	return n === n ? _elm_lang$core$Result$Ok(n) : floatErr(s);
}

function floatErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float");
}


function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function() {

var now = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
});

function setInterval_(interval, task)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = setInterval(function() {
			_elm_lang$core$Native_Scheduler.rawSpawn(task);
		}, interval);

		return function() { clearInterval(id); };
	});
}

return {
	now: now,
	setInterval_: F2(setInterval_)
};

}();
var _elm_lang$core$Time$setInterval = _elm_lang$core$Native_Time.setInterval_;
var _elm_lang$core$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		var _p0 = intervals;
		if (_p0.ctor === '[]') {
			return _elm_lang$core$Task$succeed(processes);
		} else {
			var _p1 = _p0._0;
			var spawnRest = function (id) {
				return A3(
					_elm_lang$core$Time$spawnHelp,
					router,
					_p0._1,
					A3(_elm_lang$core$Dict$insert, _p1, id, processes));
			};
			var spawnTimer = _elm_lang$core$Native_Scheduler.spawn(
				A2(
					_elm_lang$core$Time$setInterval,
					_p1,
					A2(_elm_lang$core$Platform$sendToSelf, router, _p1)));
			return A2(_elm_lang$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var _elm_lang$core$Time$addMySub = F2(
	function (_p2, state) {
		var _p3 = _p2;
		var _p6 = _p3._1;
		var _p5 = _p3._0;
		var _p4 = A2(_elm_lang$core$Dict$get, _p5, state);
		if (_p4.ctor === 'Nothing') {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{
					ctor: '::',
					_0: _p6,
					_1: {ctor: '[]'}
				},
				state);
		} else {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{ctor: '::', _0: _p6, _1: _p4._0},
				state);
		}
	});
var _elm_lang$core$Time$inMilliseconds = function (t) {
	return t;
};
var _elm_lang$core$Time$millisecond = 1;
var _elm_lang$core$Time$second = 1000 * _elm_lang$core$Time$millisecond;
var _elm_lang$core$Time$minute = 60 * _elm_lang$core$Time$second;
var _elm_lang$core$Time$hour = 60 * _elm_lang$core$Time$minute;
var _elm_lang$core$Time$inHours = function (t) {
	return t / _elm_lang$core$Time$hour;
};
var _elm_lang$core$Time$inMinutes = function (t) {
	return t / _elm_lang$core$Time$minute;
};
var _elm_lang$core$Time$inSeconds = function (t) {
	return t / _elm_lang$core$Time$second;
};
var _elm_lang$core$Time$now = _elm_lang$core$Native_Time.now;
var _elm_lang$core$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _p7 = A2(_elm_lang$core$Dict$get, interval, state.taggers);
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var tellTaggers = function (time) {
				return _elm_lang$core$Task$sequence(
					A2(
						_elm_lang$core$List$map,
						function (tagger) {
							return A2(
								_elm_lang$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						_p7._0));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p8) {
					return _elm_lang$core$Task$succeed(state);
				},
				A2(_elm_lang$core$Task$andThen, tellTaggers, _elm_lang$core$Time$now));
		}
	});
var _elm_lang$core$Time$subscription = _elm_lang$core$Native_Platform.leaf('Time');
var _elm_lang$core$Time$State = F2(
	function (a, b) {
		return {taggers: a, processes: b};
	});
var _elm_lang$core$Time$init = _elm_lang$core$Task$succeed(
	A2(_elm_lang$core$Time$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$core$Time$onEffects = F3(
	function (router, subs, _p9) {
		var _p10 = _p9;
		var rightStep = F3(
			function (_p12, id, _p11) {
				var _p13 = _p11;
				return {
					ctor: '_Tuple3',
					_0: _p13._0,
					_1: _p13._1,
					_2: A2(
						_elm_lang$core$Task$andThen,
						function (_p14) {
							return _p13._2;
						},
						_elm_lang$core$Native_Scheduler.kill(id))
				};
			});
		var bothStep = F4(
			function (interval, taggers, id, _p15) {
				var _p16 = _p15;
				return {
					ctor: '_Tuple3',
					_0: _p16._0,
					_1: A3(_elm_lang$core$Dict$insert, interval, id, _p16._1),
					_2: _p16._2
				};
			});
		var leftStep = F3(
			function (interval, taggers, _p17) {
				var _p18 = _p17;
				return {
					ctor: '_Tuple3',
					_0: {ctor: '::', _0: interval, _1: _p18._0},
					_1: _p18._1,
					_2: _p18._2
				};
			});
		var newTaggers = A3(_elm_lang$core$List$foldl, _elm_lang$core$Time$addMySub, _elm_lang$core$Dict$empty, subs);
		var _p19 = A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			_p10.processes,
			{
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _elm_lang$core$Dict$empty,
				_2: _elm_lang$core$Task$succeed(
					{ctor: '_Tuple0'})
			});
		var spawnList = _p19._0;
		var existingDict = _p19._1;
		var killTask = _p19._2;
		return A2(
			_elm_lang$core$Task$andThen,
			function (newProcesses) {
				return _elm_lang$core$Task$succeed(
					A2(_elm_lang$core$Time$State, newTaggers, newProcesses));
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (_p20) {
					return A3(_elm_lang$core$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var _elm_lang$core$Time$Every = F2(
	function (a, b) {
		return {ctor: 'Every', _0: a, _1: b};
	});
var _elm_lang$core$Time$every = F2(
	function (interval, tagger) {
		return _elm_lang$core$Time$subscription(
			A2(_elm_lang$core$Time$Every, interval, tagger));
	});
var _elm_lang$core$Time$subMap = F2(
	function (f, _p21) {
		var _p22 = _p21;
		return A2(
			_elm_lang$core$Time$Every,
			_p22._0,
			function (_p23) {
				return f(
					_p22._1(_p23));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Time'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Time$init, onEffects: _elm_lang$core$Time$onEffects, onSelfMsg: _elm_lang$core$Time$onSelfMsg, tag: 'sub', subMap: _elm_lang$core$Time$subMap};

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

//import Maybe, Native.List //

var _elm_lang$core$Native_Regex = function() {

function escape(str)
{
	return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
function caseInsensitive(re)
{
	return new RegExp(re.source, 'gi');
}
function regex(raw)
{
	return new RegExp(raw, 'g');
}

function contains(re, string)
{
	return string.match(re) !== null;
}

function find(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var out = [];
	var number = 0;
	var string = str;
	var lastIndex = re.lastIndex;
	var prevLastIndex = -1;
	var result;
	while (number++ < n && (result = re.exec(string)))
	{
		if (prevLastIndex === re.lastIndex) break;
		var i = result.length - 1;
		var subs = new Array(i);
		while (i > 0)
		{
			var submatch = result[i];
			subs[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		out.push({
			match: result[0],
			submatches: _elm_lang$core$Native_List.fromArray(subs),
			index: result.index,
			number: number
		});
		prevLastIndex = re.lastIndex;
	}
	re.lastIndex = lastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

function replace(n, re, replacer, string)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var count = 0;
	function jsReplacer(match)
	{
		if (count++ >= n)
		{
			return match;
		}
		var i = arguments.length - 3;
		var submatches = new Array(i);
		while (i > 0)
		{
			var submatch = arguments[i];
			submatches[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		return replacer({
			match: match,
			submatches: _elm_lang$core$Native_List.fromArray(submatches),
			index: arguments[arguments.length - 2],
			number: count
		});
	}
	return string.replace(re, jsReplacer);
}

function split(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	if (n === Infinity)
	{
		return _elm_lang$core$Native_List.fromArray(str.split(re));
	}
	var string = str;
	var result;
	var out = [];
	var start = re.lastIndex;
	var restoreLastIndex = re.lastIndex;
	while (n--)
	{
		if (!(result = re.exec(string))) break;
		out.push(string.slice(start, result.index));
		start = re.lastIndex;
	}
	out.push(string.slice(start));
	re.lastIndex = restoreLastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

return {
	regex: regex,
	caseInsensitive: caseInsensitive,
	escape: escape,

	contains: F2(contains),
	find: F3(find),
	replace: F4(replace),
	split: F3(split)
};

}();

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

var _elm_lang$core$Random$onSelfMsg = F3(
	function (_p1, _p0, seed) {
		return _elm_lang$core$Task$succeed(seed);
	});
var _elm_lang$core$Random$magicNum8 = 2147483562;
var _elm_lang$core$Random$range = function (_p2) {
	return {ctor: '_Tuple2', _0: 0, _1: _elm_lang$core$Random$magicNum8};
};
var _elm_lang$core$Random$magicNum7 = 2147483399;
var _elm_lang$core$Random$magicNum6 = 2147483563;
var _elm_lang$core$Random$magicNum5 = 3791;
var _elm_lang$core$Random$magicNum4 = 40692;
var _elm_lang$core$Random$magicNum3 = 52774;
var _elm_lang$core$Random$magicNum2 = 12211;
var _elm_lang$core$Random$magicNum1 = 53668;
var _elm_lang$core$Random$magicNum0 = 40014;
var _elm_lang$core$Random$step = F2(
	function (_p3, seed) {
		var _p4 = _p3;
		return _p4._0(seed);
	});
var _elm_lang$core$Random$onEffects = F3(
	function (router, commands, seed) {
		var _p5 = commands;
		if (_p5.ctor === '[]') {
			return _elm_lang$core$Task$succeed(seed);
		} else {
			var _p6 = A2(_elm_lang$core$Random$step, _p5._0._0, seed);
			var value = _p6._0;
			var newSeed = _p6._1;
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p7) {
					return A3(_elm_lang$core$Random$onEffects, router, _p5._1, newSeed);
				},
				A2(_elm_lang$core$Platform$sendToApp, router, value));
		}
	});
var _elm_lang$core$Random$listHelp = F4(
	function (list, n, generate, seed) {
		listHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 1) < 0) {
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$List$reverse(list),
					_1: seed
				};
			} else {
				var _p8 = generate(seed);
				var value = _p8._0;
				var newSeed = _p8._1;
				var _v2 = {ctor: '::', _0: value, _1: list},
					_v3 = n - 1,
					_v4 = generate,
					_v5 = newSeed;
				list = _v2;
				n = _v3;
				generate = _v4;
				seed = _v5;
				continue listHelp;
			}
		}
	});
var _elm_lang$core$Random$minInt = -2147483648;
var _elm_lang$core$Random$maxInt = 2147483647;
var _elm_lang$core$Random$iLogBase = F2(
	function (b, i) {
		return (_elm_lang$core$Native_Utils.cmp(i, b) < 0) ? 1 : (1 + A2(_elm_lang$core$Random$iLogBase, b, (i / b) | 0));
	});
var _elm_lang$core$Random$command = _elm_lang$core$Native_Platform.leaf('Random');
var _elm_lang$core$Random$Generator = function (a) {
	return {ctor: 'Generator', _0: a};
};
var _elm_lang$core$Random$list = F2(
	function (n, _p9) {
		var _p10 = _p9;
		return _elm_lang$core$Random$Generator(
			function (seed) {
				return A4(
					_elm_lang$core$Random$listHelp,
					{ctor: '[]'},
					n,
					_p10._0,
					seed);
			});
	});
var _elm_lang$core$Random$map = F2(
	function (func, _p11) {
		var _p12 = _p11;
		return _elm_lang$core$Random$Generator(
			function (seed0) {
				var _p13 = _p12._0(seed0);
				var a = _p13._0;
				var seed1 = _p13._1;
				return {
					ctor: '_Tuple2',
					_0: func(a),
					_1: seed1
				};
			});
	});
var _elm_lang$core$Random$map2 = F3(
	function (func, _p15, _p14) {
		var _p16 = _p15;
		var _p17 = _p14;
		return _elm_lang$core$Random$Generator(
			function (seed0) {
				var _p18 = _p16._0(seed0);
				var a = _p18._0;
				var seed1 = _p18._1;
				var _p19 = _p17._0(seed1);
				var b = _p19._0;
				var seed2 = _p19._1;
				return {
					ctor: '_Tuple2',
					_0: A2(func, a, b),
					_1: seed2
				};
			});
	});
var _elm_lang$core$Random$pair = F2(
	function (genA, genB) {
		return A3(
			_elm_lang$core$Random$map2,
			F2(
				function (v0, v1) {
					return {ctor: '_Tuple2', _0: v0, _1: v1};
				}),
			genA,
			genB);
	});
var _elm_lang$core$Random$map3 = F4(
	function (func, _p22, _p21, _p20) {
		var _p23 = _p22;
		var _p24 = _p21;
		var _p25 = _p20;
		return _elm_lang$core$Random$Generator(
			function (seed0) {
				var _p26 = _p23._0(seed0);
				var a = _p26._0;
				var seed1 = _p26._1;
				var _p27 = _p24._0(seed1);
				var b = _p27._0;
				var seed2 = _p27._1;
				var _p28 = _p25._0(seed2);
				var c = _p28._0;
				var seed3 = _p28._1;
				return {
					ctor: '_Tuple2',
					_0: A3(func, a, b, c),
					_1: seed3
				};
			});
	});
var _elm_lang$core$Random$map4 = F5(
	function (func, _p32, _p31, _p30, _p29) {
		var _p33 = _p32;
		var _p34 = _p31;
		var _p35 = _p30;
		var _p36 = _p29;
		return _elm_lang$core$Random$Generator(
			function (seed0) {
				var _p37 = _p33._0(seed0);
				var a = _p37._0;
				var seed1 = _p37._1;
				var _p38 = _p34._0(seed1);
				var b = _p38._0;
				var seed2 = _p38._1;
				var _p39 = _p35._0(seed2);
				var c = _p39._0;
				var seed3 = _p39._1;
				var _p40 = _p36._0(seed3);
				var d = _p40._0;
				var seed4 = _p40._1;
				return {
					ctor: '_Tuple2',
					_0: A4(func, a, b, c, d),
					_1: seed4
				};
			});
	});
var _elm_lang$core$Random$map5 = F6(
	function (func, _p45, _p44, _p43, _p42, _p41) {
		var _p46 = _p45;
		var _p47 = _p44;
		var _p48 = _p43;
		var _p49 = _p42;
		var _p50 = _p41;
		return _elm_lang$core$Random$Generator(
			function (seed0) {
				var _p51 = _p46._0(seed0);
				var a = _p51._0;
				var seed1 = _p51._1;
				var _p52 = _p47._0(seed1);
				var b = _p52._0;
				var seed2 = _p52._1;
				var _p53 = _p48._0(seed2);
				var c = _p53._0;
				var seed3 = _p53._1;
				var _p54 = _p49._0(seed3);
				var d = _p54._0;
				var seed4 = _p54._1;
				var _p55 = _p50._0(seed4);
				var e = _p55._0;
				var seed5 = _p55._1;
				return {
					ctor: '_Tuple2',
					_0: A5(func, a, b, c, d, e),
					_1: seed5
				};
			});
	});
var _elm_lang$core$Random$andThen = F2(
	function (callback, _p56) {
		var _p57 = _p56;
		return _elm_lang$core$Random$Generator(
			function (seed) {
				var _p58 = _p57._0(seed);
				var result = _p58._0;
				var newSeed = _p58._1;
				var _p59 = callback(result);
				var genB = _p59._0;
				return genB(newSeed);
			});
	});
var _elm_lang$core$Random$State = F2(
	function (a, b) {
		return {ctor: 'State', _0: a, _1: b};
	});
var _elm_lang$core$Random$initState = function (seed) {
	var s = A2(_elm_lang$core$Basics$max, seed, 0 - seed);
	var q = (s / (_elm_lang$core$Random$magicNum6 - 1)) | 0;
	var s2 = A2(_elm_lang$core$Basics_ops['%'], q, _elm_lang$core$Random$magicNum7 - 1);
	var s1 = A2(_elm_lang$core$Basics_ops['%'], s, _elm_lang$core$Random$magicNum6 - 1);
	return A2(_elm_lang$core$Random$State, s1 + 1, s2 + 1);
};
var _elm_lang$core$Random$next = function (_p60) {
	var _p61 = _p60;
	var _p63 = _p61._1;
	var _p62 = _p61._0;
	var k2 = (_p63 / _elm_lang$core$Random$magicNum3) | 0;
	var rawState2 = (_elm_lang$core$Random$magicNum4 * (_p63 - (k2 * _elm_lang$core$Random$magicNum3))) - (k2 * _elm_lang$core$Random$magicNum5);
	var newState2 = (_elm_lang$core$Native_Utils.cmp(rawState2, 0) < 0) ? (rawState2 + _elm_lang$core$Random$magicNum7) : rawState2;
	var k1 = (_p62 / _elm_lang$core$Random$magicNum1) | 0;
	var rawState1 = (_elm_lang$core$Random$magicNum0 * (_p62 - (k1 * _elm_lang$core$Random$magicNum1))) - (k1 * _elm_lang$core$Random$magicNum2);
	var newState1 = (_elm_lang$core$Native_Utils.cmp(rawState1, 0) < 0) ? (rawState1 + _elm_lang$core$Random$magicNum6) : rawState1;
	var z = newState1 - newState2;
	var newZ = (_elm_lang$core$Native_Utils.cmp(z, 1) < 0) ? (z + _elm_lang$core$Random$magicNum8) : z;
	return {
		ctor: '_Tuple2',
		_0: newZ,
		_1: A2(_elm_lang$core$Random$State, newState1, newState2)
	};
};
var _elm_lang$core$Random$split = function (_p64) {
	var _p65 = _p64;
	var _p68 = _p65._1;
	var _p67 = _p65._0;
	var _p66 = _elm_lang$core$Tuple$second(
		_elm_lang$core$Random$next(_p65));
	var t1 = _p66._0;
	var t2 = _p66._1;
	var new_s2 = _elm_lang$core$Native_Utils.eq(_p68, 1) ? (_elm_lang$core$Random$magicNum7 - 1) : (_p68 - 1);
	var new_s1 = _elm_lang$core$Native_Utils.eq(_p67, _elm_lang$core$Random$magicNum6 - 1) ? 1 : (_p67 + 1);
	return {
		ctor: '_Tuple2',
		_0: A2(_elm_lang$core$Random$State, new_s1, t2),
		_1: A2(_elm_lang$core$Random$State, t1, new_s2)
	};
};
var _elm_lang$core$Random$Seed = function (a) {
	return {ctor: 'Seed', _0: a};
};
var _elm_lang$core$Random$int = F2(
	function (a, b) {
		return _elm_lang$core$Random$Generator(
			function (_p69) {
				var _p70 = _p69;
				var _p75 = _p70._0;
				var base = 2147483561;
				var f = F3(
					function (n, acc, state) {
						f:
						while (true) {
							var _p71 = n;
							if (_p71 === 0) {
								return {ctor: '_Tuple2', _0: acc, _1: state};
							} else {
								var _p72 = _p75.next(state);
								var x = _p72._0;
								var nextState = _p72._1;
								var _v27 = n - 1,
									_v28 = x + (acc * base),
									_v29 = nextState;
								n = _v27;
								acc = _v28;
								state = _v29;
								continue f;
							}
						}
					});
				var _p73 = (_elm_lang$core$Native_Utils.cmp(a, b) < 0) ? {ctor: '_Tuple2', _0: a, _1: b} : {ctor: '_Tuple2', _0: b, _1: a};
				var lo = _p73._0;
				var hi = _p73._1;
				var k = (hi - lo) + 1;
				var n = A2(_elm_lang$core$Random$iLogBase, base, k);
				var _p74 = A3(f, n, 1, _p75.state);
				var v = _p74._0;
				var nextState = _p74._1;
				return {
					ctor: '_Tuple2',
					_0: lo + A2(_elm_lang$core$Basics_ops['%'], v, k),
					_1: _elm_lang$core$Random$Seed(
						_elm_lang$core$Native_Utils.update(
							_p75,
							{state: nextState}))
				};
			});
	});
var _elm_lang$core$Random$bool = A2(
	_elm_lang$core$Random$map,
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.eq(x, y);
		})(1),
	A2(_elm_lang$core$Random$int, 0, 1));
var _elm_lang$core$Random$float = F2(
	function (a, b) {
		return _elm_lang$core$Random$Generator(
			function (seed) {
				var _p76 = A2(
					_elm_lang$core$Random$step,
					A2(_elm_lang$core$Random$int, _elm_lang$core$Random$minInt, _elm_lang$core$Random$maxInt),
					seed);
				var number = _p76._0;
				var newSeed = _p76._1;
				var negativeOneToOne = _elm_lang$core$Basics$toFloat(number) / _elm_lang$core$Basics$toFloat(_elm_lang$core$Random$maxInt - _elm_lang$core$Random$minInt);
				var _p77 = (_elm_lang$core$Native_Utils.cmp(a, b) < 0) ? {ctor: '_Tuple2', _0: a, _1: b} : {ctor: '_Tuple2', _0: b, _1: a};
				var lo = _p77._0;
				var hi = _p77._1;
				var scaled = ((lo + hi) / 2) + ((hi - lo) * negativeOneToOne);
				return {ctor: '_Tuple2', _0: scaled, _1: newSeed};
			});
	});
var _elm_lang$core$Random$initialSeed = function (n) {
	return _elm_lang$core$Random$Seed(
		{
			state: _elm_lang$core$Random$initState(n),
			next: _elm_lang$core$Random$next,
			split: _elm_lang$core$Random$split,
			range: _elm_lang$core$Random$range
		});
};
var _elm_lang$core$Random$init = A2(
	_elm_lang$core$Task$andThen,
	function (t) {
		return _elm_lang$core$Task$succeed(
			_elm_lang$core$Random$initialSeed(
				_elm_lang$core$Basics$round(t)));
	},
	_elm_lang$core$Time$now);
var _elm_lang$core$Random$Generate = function (a) {
	return {ctor: 'Generate', _0: a};
};
var _elm_lang$core$Random$generate = F2(
	function (tagger, generator) {
		return _elm_lang$core$Random$command(
			_elm_lang$core$Random$Generate(
				A2(_elm_lang$core$Random$map, tagger, generator)));
	});
var _elm_lang$core$Random$cmdMap = F2(
	function (func, _p78) {
		var _p79 = _p78;
		return _elm_lang$core$Random$Generate(
			A2(_elm_lang$core$Random$map, func, _p79._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Random'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Random$init, onEffects: _elm_lang$core$Random$onEffects, onSelfMsg: _elm_lang$core$Random$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Random$cmdMap};

var _elm_lang$core$Regex$split = _elm_lang$core$Native_Regex.split;
var _elm_lang$core$Regex$replace = _elm_lang$core$Native_Regex.replace;
var _elm_lang$core$Regex$find = _elm_lang$core$Native_Regex.find;
var _elm_lang$core$Regex$contains = _elm_lang$core$Native_Regex.contains;
var _elm_lang$core$Regex$caseInsensitive = _elm_lang$core$Native_Regex.caseInsensitive;
var _elm_lang$core$Regex$regex = _elm_lang$core$Native_Regex.regex;
var _elm_lang$core$Regex$escape = _elm_lang$core$Native_Regex.escape;
var _elm_lang$core$Regex$Match = F4(
	function (a, b, c, d) {
		return {match: a, submatches: b, index: c, number: d};
	});
var _elm_lang$core$Regex$Regex = {ctor: 'Regex'};
var _elm_lang$core$Regex$AtMost = function (a) {
	return {ctor: 'AtMost', _0: a};
};
var _elm_lang$core$Regex$All = {ctor: 'All'};

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';

var localDoc = typeof document !== 'undefined' ? document : {};


////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else if (key === 'className')
		{
			var classes = facts[key];
			facts[key] = typeof classes === 'undefined'
				? entry.value
				: classes + ' ' + entry.value;
		}
 		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (a.options !== b.options)
	{
		if (a.options.stopPropagation !== b.options.stopPropagation || a.options.preventDefault !== b.options.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}


function mapProperty(func, property)
{
	if (property.key !== EVENT_KEY)
	{
		return property;
	}
	return on(
		property.realKey,
		property.value.options,
		A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder)
	);
}


////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = { tagger: tagger, parent: eventNode };
			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return localDoc.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			if (typeof domNode.elm_event_node_ref !== 'undefined')
			{
				domNode.elm_event_node_ref.tagger = patch.data;
			}
			else
			{
				domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
			}
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = localDoc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}


// PROGRAMS

var program = makeProgram(checkNoFlags);
var programWithFlags = makeProgram(checkYesFlags);

function makeProgram(flagChecker)
{
	return F2(function(debugWrap, impl)
	{
		return function(flagDecoder)
		{
			return function(object, moduleName, debugMetadata)
			{
				var checker = flagChecker(flagDecoder, moduleName);
				if (typeof debugMetadata === 'undefined')
				{
					normalSetup(impl, object, moduleName, checker);
				}
				else
				{
					debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
				}
			};
		};
	});
}

function staticProgram(vNode)
{
	var nothing = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		_elm_lang$core$Platform_Cmd$none
	);
	return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
		init: nothing,
		view: function() { return vNode; },
		update: F2(function() { return nothing; }),
		subscriptions: function() { return _elm_lang$core$Platform_Sub$none; }
	})();
}


// FLAG CHECKERS

function checkNoFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flags === 'undefined')
		{
			return init;
		}

		var errorMessage =
			'The `' + moduleName + '` module does not need flags.\n'
			+ 'Initialize it with no arguments and you should be all set!';

		crash(errorMessage, domNode);
	};
}

function checkYesFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flagDecoder === 'undefined')
		{
			var errorMessage =
				'Are you trying to sneak a Never value into Elm? Trickster!\n'
				+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
				+ 'Use `program` instead if you do not want flags.'

			crash(errorMessage, domNode);
		}

		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Ok')
		{
			return init(result._0);
		}

		var errorMessage =
			'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n'
			+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
			+ result._0;

		crash(errorMessage, domNode);
	};
}

function crash(errorMessage, domNode)
{
	if (domNode)
	{
		domNode.innerHTML =
			'<div style="padding-left:1em;">'
			+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
			+ '<pre style="padding-left:1em;">' + errorMessage + '</pre>'
			+ '</div>';
	}

	throw new Error(errorMessage);
}


//  NORMAL SETUP

function normalSetup(impl, object, moduleName, flagChecker)
{
	object['embed'] = function embed(node, flags)
	{
		while (node.lastChild)
		{
			node.removeChild(node.lastChild);
		}

		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update,
			impl.subscriptions,
			normalRenderer(node, impl.view)
		);
	};

	object['fullscreen'] = function fullscreen(flags)
	{
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update,
			impl.subscriptions,
			normalRenderer(document.body, impl.view)
		);
	};
}

function normalRenderer(parentNode, view)
{
	return function(tagger, initialModel)
	{
		var eventNode = { tagger: tagger, parent: undefined };
		var initialVirtualNode = view(initialModel);
		var domNode = render(initialVirtualNode, eventNode);
		parentNode.appendChild(domNode);
		return makeStepper(domNode, view, initialVirtualNode, eventNode);
	};
}


// STEPPER

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { setTimeout(callback, 1000 / 60); };

function makeStepper(domNode, view, initialVirtualNode, eventNode)
{
	var state = 'NO_REQUEST';
	var currNode = initialVirtualNode;
	var nextModel;

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var nextNode = view(nextModel);
				var patches = diff(currNode, nextNode);
				domNode = applyPatches(domNode, currNode, patches, eventNode);
				currNode = nextNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return function stepper(model)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextModel = model;
	};
}


// DEBUG SETUP

function debugSetup(impl, object, moduleName, flagChecker)
{
	object['fullscreen'] = function fullscreen(flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};

	object['embed'] = function fullscreen(node, flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};
}

function scrollTask(popoutRef)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var doc = popoutRef.doc;
		if (doc)
		{
			var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
			if (msgs)
			{
				msgs.scrollTop = msgs.scrollHeight;
			}
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut)
{
	return function(tagger, initialModel)
	{
		var appEventNode = { tagger: tagger, parent: undefined };
		var eventNode = { tagger: tagger, parent: undefined };

		// make normal stepper
		var appVirtualNode = view(initialModel);
		var appNode = render(appVirtualNode, appEventNode);
		parentNode.appendChild(appNode);
		var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

		// make overlay stepper
		var overVirtualNode = viewIn(initialModel)._1;
		var overNode = render(overVirtualNode, eventNode);
		parentNode.appendChild(overNode);
		var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
		var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

		// make debugger stepper
		var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

		return function stepper(model)
		{
			appStepper(model);
			overStepper(model);
			debugStepper(model);
		}
	};
}

function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef)
{
	var curr;
	var domNode;

	return function stepper(model)
	{
		if (!model.isDebuggerOpen)
		{
			return;
		}

		if (!popoutRef.doc)
		{
			curr = view(model);
			domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
			return;
		}

		// switch to document of popout
		localDoc = popoutRef.doc;

		var next = view(model);
		var patches = diff(curr, next);
		domNode = applyPatches(domNode, curr, patches, eventNode);
		curr = next;

		// switch back to normal document
		localDoc = document;
	};
}

function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode)
{
	var w = 900;
	var h = 360;
	var x = screen.width - w;
	var y = screen.height - h;
	var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

	// switch to window document
	localDoc = debugWindow.document;

	popoutRef.doc = localDoc;
	localDoc.title = 'Debugger - ' + moduleName;
	localDoc.body.style.margin = '0';
	localDoc.body.style.padding = '0';
	var domNode = render(virtualNode, eventNode);
	localDoc.body.appendChild(domNode);

	localDoc.addEventListener('keydown', function(event) {
		if (event.metaKey && event.which === 82)
		{
			window.location.reload();
		}
		if (event.which === 38)
		{
			eventNode.tagger({ ctor: 'Up' });
			event.preventDefault();
		}
		if (event.which === 40)
		{
			eventNode.tagger({ ctor: 'Down' });
			event.preventDefault();
		}
	});

	function close()
	{
		popoutRef.doc = undefined;
		debugWindow.close();
	}
	window.addEventListener('unload', close);
	debugWindow.addEventListener('unload', function() {
		popoutRef.doc = undefined;
		window.removeEventListener('unload', close);
		eventNode.tagger({ ctor: 'Close' });
	});

	// switch back to the normal document
	localDoc = document;

	return domNode;
}


// BLOCK EVENTS

function wrapViewIn(appEventNode, overlayNode, viewIn)
{
	var ignorer = makeIgnorer(overlayNode);
	var blocking = 'Normal';
	var overflow;

	var normalTagger = appEventNode.tagger;
	var blockTagger = function() {};

	return function(model)
	{
		var tuple = viewIn(model);
		var newBlocking = tuple._0.ctor;
		appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
		if (blocking !== newBlocking)
		{
			traverse('removeEventListener', ignorer, blocking);
			traverse('addEventListener', ignorer, newBlocking);

			if (blocking === 'Normal')
			{
				overflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			}

			if (newBlocking === 'Normal')
			{
				document.body.style.overflow = overflow;
			}

			blocking = newBlocking;
		}
		return tuple._1;
	}
}

function traverse(verbEventListener, ignorer, blocking)
{
	switch(blocking)
	{
		case 'Normal':
			return;

		case 'Pause':
			return traverseHelp(verbEventListener, ignorer, mostEvents);

		case 'Message':
			return traverseHelp(verbEventListener, ignorer, allEvents);
	}
}

function traverseHelp(verbEventListener, handler, eventNames)
{
	for (var i = 0; i < eventNames.length; i++)
	{
		document.body[verbEventListener](eventNames[i], handler, true);
	}
}

function makeIgnorer(overlayNode)
{
	return function(event)
	{
		if (event.type === 'keydown' && event.metaKey && event.which === 82)
		{
			return;
		}

		var isScroll = event.type === 'scroll' || event.type === 'wheel';

		var node = event.target;
		while (node !== null)
		{
			if (node.className === 'elm-overlay-message-details' && isScroll)
			{
				return;
			}

			if (node === overlayNode && !isScroll)
			{
				return;
			}
			node = node.parentNode;
		}

		event.stopPropagation();
		event.preventDefault();
	}
}

var mostEvents = [
	'click', 'dblclick', 'mousemove',
	'mouseup', 'mousedown', 'mouseenter', 'mouseleave',
	'touchstart', 'touchend', 'touchcancel', 'touchmove',
	'pointerdown', 'pointerup', 'pointerover', 'pointerout',
	'pointerenter', 'pointerleave', 'pointermove', 'pointercancel',
	'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
	'keyup', 'keydown', 'keypress',
	'input', 'change',
	'focus', 'blur'
];

var allEvents = mostEvents.concat('wheel', 'scroll');


return {
	node: node,
	text: text,
	custom: custom,
	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),
	mapProperty: F2(mapProperty),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	program: program,
	programWithFlags: programWithFlags,
	staticProgram: staticProgram
};

}();

var _elm_lang$virtual_dom$VirtualDom$programWithFlags = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.programWithFlags, _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags, impl);
};
var _elm_lang$virtual_dom$VirtualDom$program = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, impl);
};
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$mapProperty = _elm_lang$virtual_dom$Native_VirtualDom.mapProperty;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html$program = _elm_lang$virtual_dom$VirtualDom$program;
var _elm_lang$html$Html$beginnerProgram = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$html$Html$program(
		{
			init: A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_p1.model,
				{ctor: '[]'}),
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p1.update, msg, model),
						{ctor: '[]'});
				}),
			view: _p1.view,
			subscriptions: function (_p2) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main_ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$html$Html_Attributes$map = _elm_lang$virtual_dom$VirtualDom$mapProperty;
var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'charset', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'form', value);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'media', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'rel', value);
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type_ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Tuple$second, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

var _elm_lang$html$Html_Events$keyCode = A2(_elm_lang$core$Json_Decode$field, 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$html$Html_Events$targetChecked = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'checked',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$bool);
var _elm_lang$html$Html_Events$targetValue = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'value',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$string);
var _elm_lang$html$Html_Events$defaultOptions = _elm_lang$virtual_dom$VirtualDom$defaultOptions;
var _elm_lang$html$Html_Events$onWithOptions = _elm_lang$virtual_dom$VirtualDom$onWithOptions;
var _elm_lang$html$Html_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$html$Html_Events$onFocus = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onBlur = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onSubmitOptions = _elm_lang$core$Native_Utils.update(
	_elm_lang$html$Html_Events$defaultOptions,
	{preventDefault: true});
var _elm_lang$html$Html_Events$onSubmit = function (msg) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'submit',
		_elm_lang$html$Html_Events$onSubmitOptions,
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onCheck = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetChecked));
};
var _elm_lang$html$Html_Events$onInput = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetValue));
};
var _elm_lang$html$Html_Events$onMouseOut = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseOver = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseLeave = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseEnter = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseUp = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseDown = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onDoubleClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});

var _elm_lang$svg$Svg$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$svg$Svg$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$svg$Svg$svgNamespace = A2(
	_elm_lang$virtual_dom$VirtualDom$property,
	'namespace',
	_elm_lang$core$Json_Encode$string('http://www.w3.org/2000/svg'));
var _elm_lang$svg$Svg$node = F3(
	function (name, attributes, children) {
		return A3(
			_elm_lang$virtual_dom$VirtualDom$node,
			name,
			{ctor: '::', _0: _elm_lang$svg$Svg$svgNamespace, _1: attributes},
			children);
	});
var _elm_lang$svg$Svg$svg = _elm_lang$svg$Svg$node('svg');
var _elm_lang$svg$Svg$foreignObject = _elm_lang$svg$Svg$node('foreignObject');
var _elm_lang$svg$Svg$animate = _elm_lang$svg$Svg$node('animate');
var _elm_lang$svg$Svg$animateColor = _elm_lang$svg$Svg$node('animateColor');
var _elm_lang$svg$Svg$animateMotion = _elm_lang$svg$Svg$node('animateMotion');
var _elm_lang$svg$Svg$animateTransform = _elm_lang$svg$Svg$node('animateTransform');
var _elm_lang$svg$Svg$mpath = _elm_lang$svg$Svg$node('mpath');
var _elm_lang$svg$Svg$set = _elm_lang$svg$Svg$node('set');
var _elm_lang$svg$Svg$a = _elm_lang$svg$Svg$node('a');
var _elm_lang$svg$Svg$defs = _elm_lang$svg$Svg$node('defs');
var _elm_lang$svg$Svg$g = _elm_lang$svg$Svg$node('g');
var _elm_lang$svg$Svg$marker = _elm_lang$svg$Svg$node('marker');
var _elm_lang$svg$Svg$mask = _elm_lang$svg$Svg$node('mask');
var _elm_lang$svg$Svg$pattern = _elm_lang$svg$Svg$node('pattern');
var _elm_lang$svg$Svg$switch = _elm_lang$svg$Svg$node('switch');
var _elm_lang$svg$Svg$symbol = _elm_lang$svg$Svg$node('symbol');
var _elm_lang$svg$Svg$desc = _elm_lang$svg$Svg$node('desc');
var _elm_lang$svg$Svg$metadata = _elm_lang$svg$Svg$node('metadata');
var _elm_lang$svg$Svg$title = _elm_lang$svg$Svg$node('title');
var _elm_lang$svg$Svg$feBlend = _elm_lang$svg$Svg$node('feBlend');
var _elm_lang$svg$Svg$feColorMatrix = _elm_lang$svg$Svg$node('feColorMatrix');
var _elm_lang$svg$Svg$feComponentTransfer = _elm_lang$svg$Svg$node('feComponentTransfer');
var _elm_lang$svg$Svg$feComposite = _elm_lang$svg$Svg$node('feComposite');
var _elm_lang$svg$Svg$feConvolveMatrix = _elm_lang$svg$Svg$node('feConvolveMatrix');
var _elm_lang$svg$Svg$feDiffuseLighting = _elm_lang$svg$Svg$node('feDiffuseLighting');
var _elm_lang$svg$Svg$feDisplacementMap = _elm_lang$svg$Svg$node('feDisplacementMap');
var _elm_lang$svg$Svg$feFlood = _elm_lang$svg$Svg$node('feFlood');
var _elm_lang$svg$Svg$feFuncA = _elm_lang$svg$Svg$node('feFuncA');
var _elm_lang$svg$Svg$feFuncB = _elm_lang$svg$Svg$node('feFuncB');
var _elm_lang$svg$Svg$feFuncG = _elm_lang$svg$Svg$node('feFuncG');
var _elm_lang$svg$Svg$feFuncR = _elm_lang$svg$Svg$node('feFuncR');
var _elm_lang$svg$Svg$feGaussianBlur = _elm_lang$svg$Svg$node('feGaussianBlur');
var _elm_lang$svg$Svg$feImage = _elm_lang$svg$Svg$node('feImage');
var _elm_lang$svg$Svg$feMerge = _elm_lang$svg$Svg$node('feMerge');
var _elm_lang$svg$Svg$feMergeNode = _elm_lang$svg$Svg$node('feMergeNode');
var _elm_lang$svg$Svg$feMorphology = _elm_lang$svg$Svg$node('feMorphology');
var _elm_lang$svg$Svg$feOffset = _elm_lang$svg$Svg$node('feOffset');
var _elm_lang$svg$Svg$feSpecularLighting = _elm_lang$svg$Svg$node('feSpecularLighting');
var _elm_lang$svg$Svg$feTile = _elm_lang$svg$Svg$node('feTile');
var _elm_lang$svg$Svg$feTurbulence = _elm_lang$svg$Svg$node('feTurbulence');
var _elm_lang$svg$Svg$font = _elm_lang$svg$Svg$node('font');
var _elm_lang$svg$Svg$linearGradient = _elm_lang$svg$Svg$node('linearGradient');
var _elm_lang$svg$Svg$radialGradient = _elm_lang$svg$Svg$node('radialGradient');
var _elm_lang$svg$Svg$stop = _elm_lang$svg$Svg$node('stop');
var _elm_lang$svg$Svg$circle = _elm_lang$svg$Svg$node('circle');
var _elm_lang$svg$Svg$ellipse = _elm_lang$svg$Svg$node('ellipse');
var _elm_lang$svg$Svg$image = _elm_lang$svg$Svg$node('image');
var _elm_lang$svg$Svg$line = _elm_lang$svg$Svg$node('line');
var _elm_lang$svg$Svg$path = _elm_lang$svg$Svg$node('path');
var _elm_lang$svg$Svg$polygon = _elm_lang$svg$Svg$node('polygon');
var _elm_lang$svg$Svg$polyline = _elm_lang$svg$Svg$node('polyline');
var _elm_lang$svg$Svg$rect = _elm_lang$svg$Svg$node('rect');
var _elm_lang$svg$Svg$use = _elm_lang$svg$Svg$node('use');
var _elm_lang$svg$Svg$feDistantLight = _elm_lang$svg$Svg$node('feDistantLight');
var _elm_lang$svg$Svg$fePointLight = _elm_lang$svg$Svg$node('fePointLight');
var _elm_lang$svg$Svg$feSpotLight = _elm_lang$svg$Svg$node('feSpotLight');
var _elm_lang$svg$Svg$altGlyph = _elm_lang$svg$Svg$node('altGlyph');
var _elm_lang$svg$Svg$altGlyphDef = _elm_lang$svg$Svg$node('altGlyphDef');
var _elm_lang$svg$Svg$altGlyphItem = _elm_lang$svg$Svg$node('altGlyphItem');
var _elm_lang$svg$Svg$glyph = _elm_lang$svg$Svg$node('glyph');
var _elm_lang$svg$Svg$glyphRef = _elm_lang$svg$Svg$node('glyphRef');
var _elm_lang$svg$Svg$textPath = _elm_lang$svg$Svg$node('textPath');
var _elm_lang$svg$Svg$text_ = _elm_lang$svg$Svg$node('text');
var _elm_lang$svg$Svg$tref = _elm_lang$svg$Svg$node('tref');
var _elm_lang$svg$Svg$tspan = _elm_lang$svg$Svg$node('tspan');
var _elm_lang$svg$Svg$clipPath = _elm_lang$svg$Svg$node('clipPath');
var _elm_lang$svg$Svg$colorProfile = _elm_lang$svg$Svg$node('colorProfile');
var _elm_lang$svg$Svg$cursor = _elm_lang$svg$Svg$node('cursor');
var _elm_lang$svg$Svg$filter = _elm_lang$svg$Svg$node('filter');
var _elm_lang$svg$Svg$script = _elm_lang$svg$Svg$node('script');
var _elm_lang$svg$Svg$style = _elm_lang$svg$Svg$node('style');
var _elm_lang$svg$Svg$view = _elm_lang$svg$Svg$node('view');

var _elm_lang$svg$Svg_Attributes$writingMode = _elm_lang$virtual_dom$VirtualDom$attribute('writing-mode');
var _elm_lang$svg$Svg_Attributes$wordSpacing = _elm_lang$virtual_dom$VirtualDom$attribute('word-spacing');
var _elm_lang$svg$Svg_Attributes$visibility = _elm_lang$virtual_dom$VirtualDom$attribute('visibility');
var _elm_lang$svg$Svg_Attributes$unicodeBidi = _elm_lang$virtual_dom$VirtualDom$attribute('unicode-bidi');
var _elm_lang$svg$Svg_Attributes$textRendering = _elm_lang$virtual_dom$VirtualDom$attribute('text-rendering');
var _elm_lang$svg$Svg_Attributes$textDecoration = _elm_lang$virtual_dom$VirtualDom$attribute('text-decoration');
var _elm_lang$svg$Svg_Attributes$textAnchor = _elm_lang$virtual_dom$VirtualDom$attribute('text-anchor');
var _elm_lang$svg$Svg_Attributes$stroke = _elm_lang$virtual_dom$VirtualDom$attribute('stroke');
var _elm_lang$svg$Svg_Attributes$strokeWidth = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-width');
var _elm_lang$svg$Svg_Attributes$strokeOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-opacity');
var _elm_lang$svg$Svg_Attributes$strokeMiterlimit = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-miterlimit');
var _elm_lang$svg$Svg_Attributes$strokeLinejoin = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-linejoin');
var _elm_lang$svg$Svg_Attributes$strokeLinecap = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-linecap');
var _elm_lang$svg$Svg_Attributes$strokeDashoffset = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-dashoffset');
var _elm_lang$svg$Svg_Attributes$strokeDasharray = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-dasharray');
var _elm_lang$svg$Svg_Attributes$stopOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('stop-opacity');
var _elm_lang$svg$Svg_Attributes$stopColor = _elm_lang$virtual_dom$VirtualDom$attribute('stop-color');
var _elm_lang$svg$Svg_Attributes$shapeRendering = _elm_lang$virtual_dom$VirtualDom$attribute('shape-rendering');
var _elm_lang$svg$Svg_Attributes$pointerEvents = _elm_lang$virtual_dom$VirtualDom$attribute('pointer-events');
var _elm_lang$svg$Svg_Attributes$overflow = _elm_lang$virtual_dom$VirtualDom$attribute('overflow');
var _elm_lang$svg$Svg_Attributes$opacity = _elm_lang$virtual_dom$VirtualDom$attribute('opacity');
var _elm_lang$svg$Svg_Attributes$mask = _elm_lang$virtual_dom$VirtualDom$attribute('mask');
var _elm_lang$svg$Svg_Attributes$markerStart = _elm_lang$virtual_dom$VirtualDom$attribute('marker-start');
var _elm_lang$svg$Svg_Attributes$markerMid = _elm_lang$virtual_dom$VirtualDom$attribute('marker-mid');
var _elm_lang$svg$Svg_Attributes$markerEnd = _elm_lang$virtual_dom$VirtualDom$attribute('marker-end');
var _elm_lang$svg$Svg_Attributes$lightingColor = _elm_lang$virtual_dom$VirtualDom$attribute('lighting-color');
var _elm_lang$svg$Svg_Attributes$letterSpacing = _elm_lang$virtual_dom$VirtualDom$attribute('letter-spacing');
var _elm_lang$svg$Svg_Attributes$kerning = _elm_lang$virtual_dom$VirtualDom$attribute('kerning');
var _elm_lang$svg$Svg_Attributes$imageRendering = _elm_lang$virtual_dom$VirtualDom$attribute('image-rendering');
var _elm_lang$svg$Svg_Attributes$glyphOrientationVertical = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-orientation-vertical');
var _elm_lang$svg$Svg_Attributes$glyphOrientationHorizontal = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-orientation-horizontal');
var _elm_lang$svg$Svg_Attributes$fontWeight = _elm_lang$virtual_dom$VirtualDom$attribute('font-weight');
var _elm_lang$svg$Svg_Attributes$fontVariant = _elm_lang$virtual_dom$VirtualDom$attribute('font-variant');
var _elm_lang$svg$Svg_Attributes$fontStyle = _elm_lang$virtual_dom$VirtualDom$attribute('font-style');
var _elm_lang$svg$Svg_Attributes$fontStretch = _elm_lang$virtual_dom$VirtualDom$attribute('font-stretch');
var _elm_lang$svg$Svg_Attributes$fontSize = _elm_lang$virtual_dom$VirtualDom$attribute('font-size');
var _elm_lang$svg$Svg_Attributes$fontSizeAdjust = _elm_lang$virtual_dom$VirtualDom$attribute('font-size-adjust');
var _elm_lang$svg$Svg_Attributes$fontFamily = _elm_lang$virtual_dom$VirtualDom$attribute('font-family');
var _elm_lang$svg$Svg_Attributes$floodOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('flood-opacity');
var _elm_lang$svg$Svg_Attributes$floodColor = _elm_lang$virtual_dom$VirtualDom$attribute('flood-color');
var _elm_lang$svg$Svg_Attributes$filter = _elm_lang$virtual_dom$VirtualDom$attribute('filter');
var _elm_lang$svg$Svg_Attributes$fill = _elm_lang$virtual_dom$VirtualDom$attribute('fill');
var _elm_lang$svg$Svg_Attributes$fillRule = _elm_lang$virtual_dom$VirtualDom$attribute('fill-rule');
var _elm_lang$svg$Svg_Attributes$fillOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('fill-opacity');
var _elm_lang$svg$Svg_Attributes$enableBackground = _elm_lang$virtual_dom$VirtualDom$attribute('enable-background');
var _elm_lang$svg$Svg_Attributes$dominantBaseline = _elm_lang$virtual_dom$VirtualDom$attribute('dominant-baseline');
var _elm_lang$svg$Svg_Attributes$display = _elm_lang$virtual_dom$VirtualDom$attribute('display');
var _elm_lang$svg$Svg_Attributes$direction = _elm_lang$virtual_dom$VirtualDom$attribute('direction');
var _elm_lang$svg$Svg_Attributes$cursor = _elm_lang$virtual_dom$VirtualDom$attribute('cursor');
var _elm_lang$svg$Svg_Attributes$color = _elm_lang$virtual_dom$VirtualDom$attribute('color');
var _elm_lang$svg$Svg_Attributes$colorRendering = _elm_lang$virtual_dom$VirtualDom$attribute('color-rendering');
var _elm_lang$svg$Svg_Attributes$colorProfile = _elm_lang$virtual_dom$VirtualDom$attribute('color-profile');
var _elm_lang$svg$Svg_Attributes$colorInterpolation = _elm_lang$virtual_dom$VirtualDom$attribute('color-interpolation');
var _elm_lang$svg$Svg_Attributes$colorInterpolationFilters = _elm_lang$virtual_dom$VirtualDom$attribute('color-interpolation-filters');
var _elm_lang$svg$Svg_Attributes$clip = _elm_lang$virtual_dom$VirtualDom$attribute('clip');
var _elm_lang$svg$Svg_Attributes$clipRule = _elm_lang$virtual_dom$VirtualDom$attribute('clip-rule');
var _elm_lang$svg$Svg_Attributes$clipPath = _elm_lang$virtual_dom$VirtualDom$attribute('clip-path');
var _elm_lang$svg$Svg_Attributes$baselineShift = _elm_lang$virtual_dom$VirtualDom$attribute('baseline-shift');
var _elm_lang$svg$Svg_Attributes$alignmentBaseline = _elm_lang$virtual_dom$VirtualDom$attribute('alignment-baseline');
var _elm_lang$svg$Svg_Attributes$zoomAndPan = _elm_lang$virtual_dom$VirtualDom$attribute('zoomAndPan');
var _elm_lang$svg$Svg_Attributes$z = _elm_lang$virtual_dom$VirtualDom$attribute('z');
var _elm_lang$svg$Svg_Attributes$yChannelSelector = _elm_lang$virtual_dom$VirtualDom$attribute('yChannelSelector');
var _elm_lang$svg$Svg_Attributes$y2 = _elm_lang$virtual_dom$VirtualDom$attribute('y2');
var _elm_lang$svg$Svg_Attributes$y1 = _elm_lang$virtual_dom$VirtualDom$attribute('y1');
var _elm_lang$svg$Svg_Attributes$y = _elm_lang$virtual_dom$VirtualDom$attribute('y');
var _elm_lang$svg$Svg_Attributes$xmlSpace = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:space');
var _elm_lang$svg$Svg_Attributes$xmlLang = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:lang');
var _elm_lang$svg$Svg_Attributes$xmlBase = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:base');
var _elm_lang$svg$Svg_Attributes$xlinkType = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:type');
var _elm_lang$svg$Svg_Attributes$xlinkTitle = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:title');
var _elm_lang$svg$Svg_Attributes$xlinkShow = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:show');
var _elm_lang$svg$Svg_Attributes$xlinkRole = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:role');
var _elm_lang$svg$Svg_Attributes$xlinkHref = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:href');
var _elm_lang$svg$Svg_Attributes$xlinkArcrole = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:arcrole');
var _elm_lang$svg$Svg_Attributes$xlinkActuate = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:actuate');
var _elm_lang$svg$Svg_Attributes$xChannelSelector = _elm_lang$virtual_dom$VirtualDom$attribute('xChannelSelector');
var _elm_lang$svg$Svg_Attributes$x2 = _elm_lang$virtual_dom$VirtualDom$attribute('x2');
var _elm_lang$svg$Svg_Attributes$x1 = _elm_lang$virtual_dom$VirtualDom$attribute('x1');
var _elm_lang$svg$Svg_Attributes$xHeight = _elm_lang$virtual_dom$VirtualDom$attribute('x-height');
var _elm_lang$svg$Svg_Attributes$x = _elm_lang$virtual_dom$VirtualDom$attribute('x');
var _elm_lang$svg$Svg_Attributes$widths = _elm_lang$virtual_dom$VirtualDom$attribute('widths');
var _elm_lang$svg$Svg_Attributes$width = _elm_lang$virtual_dom$VirtualDom$attribute('width');
var _elm_lang$svg$Svg_Attributes$viewTarget = _elm_lang$virtual_dom$VirtualDom$attribute('viewTarget');
var _elm_lang$svg$Svg_Attributes$viewBox = _elm_lang$virtual_dom$VirtualDom$attribute('viewBox');
var _elm_lang$svg$Svg_Attributes$vertOriginY = _elm_lang$virtual_dom$VirtualDom$attribute('vert-origin-y');
var _elm_lang$svg$Svg_Attributes$vertOriginX = _elm_lang$virtual_dom$VirtualDom$attribute('vert-origin-x');
var _elm_lang$svg$Svg_Attributes$vertAdvY = _elm_lang$virtual_dom$VirtualDom$attribute('vert-adv-y');
var _elm_lang$svg$Svg_Attributes$version = _elm_lang$virtual_dom$VirtualDom$attribute('version');
var _elm_lang$svg$Svg_Attributes$values = _elm_lang$virtual_dom$VirtualDom$attribute('values');
var _elm_lang$svg$Svg_Attributes$vMathematical = _elm_lang$virtual_dom$VirtualDom$attribute('v-mathematical');
var _elm_lang$svg$Svg_Attributes$vIdeographic = _elm_lang$virtual_dom$VirtualDom$attribute('v-ideographic');
var _elm_lang$svg$Svg_Attributes$vHanging = _elm_lang$virtual_dom$VirtualDom$attribute('v-hanging');
var _elm_lang$svg$Svg_Attributes$vAlphabetic = _elm_lang$virtual_dom$VirtualDom$attribute('v-alphabetic');
var _elm_lang$svg$Svg_Attributes$unitsPerEm = _elm_lang$virtual_dom$VirtualDom$attribute('units-per-em');
var _elm_lang$svg$Svg_Attributes$unicodeRange = _elm_lang$virtual_dom$VirtualDom$attribute('unicode-range');
var _elm_lang$svg$Svg_Attributes$unicode = _elm_lang$virtual_dom$VirtualDom$attribute('unicode');
var _elm_lang$svg$Svg_Attributes$underlineThickness = _elm_lang$virtual_dom$VirtualDom$attribute('underline-thickness');
var _elm_lang$svg$Svg_Attributes$underlinePosition = _elm_lang$virtual_dom$VirtualDom$attribute('underline-position');
var _elm_lang$svg$Svg_Attributes$u2 = _elm_lang$virtual_dom$VirtualDom$attribute('u2');
var _elm_lang$svg$Svg_Attributes$u1 = _elm_lang$virtual_dom$VirtualDom$attribute('u1');
var _elm_lang$svg$Svg_Attributes$type_ = _elm_lang$virtual_dom$VirtualDom$attribute('type');
var _elm_lang$svg$Svg_Attributes$transform = _elm_lang$virtual_dom$VirtualDom$attribute('transform');
var _elm_lang$svg$Svg_Attributes$to = _elm_lang$virtual_dom$VirtualDom$attribute('to');
var _elm_lang$svg$Svg_Attributes$title = _elm_lang$virtual_dom$VirtualDom$attribute('title');
var _elm_lang$svg$Svg_Attributes$textLength = _elm_lang$virtual_dom$VirtualDom$attribute('textLength');
var _elm_lang$svg$Svg_Attributes$targetY = _elm_lang$virtual_dom$VirtualDom$attribute('targetY');
var _elm_lang$svg$Svg_Attributes$targetX = _elm_lang$virtual_dom$VirtualDom$attribute('targetX');
var _elm_lang$svg$Svg_Attributes$target = _elm_lang$virtual_dom$VirtualDom$attribute('target');
var _elm_lang$svg$Svg_Attributes$tableValues = _elm_lang$virtual_dom$VirtualDom$attribute('tableValues');
var _elm_lang$svg$Svg_Attributes$systemLanguage = _elm_lang$virtual_dom$VirtualDom$attribute('systemLanguage');
var _elm_lang$svg$Svg_Attributes$surfaceScale = _elm_lang$virtual_dom$VirtualDom$attribute('surfaceScale');
var _elm_lang$svg$Svg_Attributes$style = _elm_lang$virtual_dom$VirtualDom$attribute('style');
var _elm_lang$svg$Svg_Attributes$string = _elm_lang$virtual_dom$VirtualDom$attribute('string');
var _elm_lang$svg$Svg_Attributes$strikethroughThickness = _elm_lang$virtual_dom$VirtualDom$attribute('strikethrough-thickness');
var _elm_lang$svg$Svg_Attributes$strikethroughPosition = _elm_lang$virtual_dom$VirtualDom$attribute('strikethrough-position');
var _elm_lang$svg$Svg_Attributes$stitchTiles = _elm_lang$virtual_dom$VirtualDom$attribute('stitchTiles');
var _elm_lang$svg$Svg_Attributes$stemv = _elm_lang$virtual_dom$VirtualDom$attribute('stemv');
var _elm_lang$svg$Svg_Attributes$stemh = _elm_lang$virtual_dom$VirtualDom$attribute('stemh');
var _elm_lang$svg$Svg_Attributes$stdDeviation = _elm_lang$virtual_dom$VirtualDom$attribute('stdDeviation');
var _elm_lang$svg$Svg_Attributes$startOffset = _elm_lang$virtual_dom$VirtualDom$attribute('startOffset');
var _elm_lang$svg$Svg_Attributes$spreadMethod = _elm_lang$virtual_dom$VirtualDom$attribute('spreadMethod');
var _elm_lang$svg$Svg_Attributes$speed = _elm_lang$virtual_dom$VirtualDom$attribute('speed');
var _elm_lang$svg$Svg_Attributes$specularExponent = _elm_lang$virtual_dom$VirtualDom$attribute('specularExponent');
var _elm_lang$svg$Svg_Attributes$specularConstant = _elm_lang$virtual_dom$VirtualDom$attribute('specularConstant');
var _elm_lang$svg$Svg_Attributes$spacing = _elm_lang$virtual_dom$VirtualDom$attribute('spacing');
var _elm_lang$svg$Svg_Attributes$slope = _elm_lang$virtual_dom$VirtualDom$attribute('slope');
var _elm_lang$svg$Svg_Attributes$seed = _elm_lang$virtual_dom$VirtualDom$attribute('seed');
var _elm_lang$svg$Svg_Attributes$scale = _elm_lang$virtual_dom$VirtualDom$attribute('scale');
var _elm_lang$svg$Svg_Attributes$ry = _elm_lang$virtual_dom$VirtualDom$attribute('ry');
var _elm_lang$svg$Svg_Attributes$rx = _elm_lang$virtual_dom$VirtualDom$attribute('rx');
var _elm_lang$svg$Svg_Attributes$rotate = _elm_lang$virtual_dom$VirtualDom$attribute('rotate');
var _elm_lang$svg$Svg_Attributes$result = _elm_lang$virtual_dom$VirtualDom$attribute('result');
var _elm_lang$svg$Svg_Attributes$restart = _elm_lang$virtual_dom$VirtualDom$attribute('restart');
var _elm_lang$svg$Svg_Attributes$requiredFeatures = _elm_lang$virtual_dom$VirtualDom$attribute('requiredFeatures');
var _elm_lang$svg$Svg_Attributes$requiredExtensions = _elm_lang$virtual_dom$VirtualDom$attribute('requiredExtensions');
var _elm_lang$svg$Svg_Attributes$repeatDur = _elm_lang$virtual_dom$VirtualDom$attribute('repeatDur');
var _elm_lang$svg$Svg_Attributes$repeatCount = _elm_lang$virtual_dom$VirtualDom$attribute('repeatCount');
var _elm_lang$svg$Svg_Attributes$renderingIntent = _elm_lang$virtual_dom$VirtualDom$attribute('rendering-intent');
var _elm_lang$svg$Svg_Attributes$refY = _elm_lang$virtual_dom$VirtualDom$attribute('refY');
var _elm_lang$svg$Svg_Attributes$refX = _elm_lang$virtual_dom$VirtualDom$attribute('refX');
var _elm_lang$svg$Svg_Attributes$radius = _elm_lang$virtual_dom$VirtualDom$attribute('radius');
var _elm_lang$svg$Svg_Attributes$r = _elm_lang$virtual_dom$VirtualDom$attribute('r');
var _elm_lang$svg$Svg_Attributes$primitiveUnits = _elm_lang$virtual_dom$VirtualDom$attribute('primitiveUnits');
var _elm_lang$svg$Svg_Attributes$preserveAspectRatio = _elm_lang$virtual_dom$VirtualDom$attribute('preserveAspectRatio');
var _elm_lang$svg$Svg_Attributes$preserveAlpha = _elm_lang$virtual_dom$VirtualDom$attribute('preserveAlpha');
var _elm_lang$svg$Svg_Attributes$pointsAtZ = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtZ');
var _elm_lang$svg$Svg_Attributes$pointsAtY = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtY');
var _elm_lang$svg$Svg_Attributes$pointsAtX = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtX');
var _elm_lang$svg$Svg_Attributes$points = _elm_lang$virtual_dom$VirtualDom$attribute('points');
var _elm_lang$svg$Svg_Attributes$pointOrder = _elm_lang$virtual_dom$VirtualDom$attribute('point-order');
var _elm_lang$svg$Svg_Attributes$patternUnits = _elm_lang$virtual_dom$VirtualDom$attribute('patternUnits');
var _elm_lang$svg$Svg_Attributes$patternTransform = _elm_lang$virtual_dom$VirtualDom$attribute('patternTransform');
var _elm_lang$svg$Svg_Attributes$patternContentUnits = _elm_lang$virtual_dom$VirtualDom$attribute('patternContentUnits');
var _elm_lang$svg$Svg_Attributes$pathLength = _elm_lang$virtual_dom$VirtualDom$attribute('pathLength');
var _elm_lang$svg$Svg_Attributes$path = _elm_lang$virtual_dom$VirtualDom$attribute('path');
var _elm_lang$svg$Svg_Attributes$panose1 = _elm_lang$virtual_dom$VirtualDom$attribute('panose-1');
var _elm_lang$svg$Svg_Attributes$overlineThickness = _elm_lang$virtual_dom$VirtualDom$attribute('overline-thickness');
var _elm_lang$svg$Svg_Attributes$overlinePosition = _elm_lang$virtual_dom$VirtualDom$attribute('overline-position');
var _elm_lang$svg$Svg_Attributes$origin = _elm_lang$virtual_dom$VirtualDom$attribute('origin');
var _elm_lang$svg$Svg_Attributes$orientation = _elm_lang$virtual_dom$VirtualDom$attribute('orientation');
var _elm_lang$svg$Svg_Attributes$orient = _elm_lang$virtual_dom$VirtualDom$attribute('orient');
var _elm_lang$svg$Svg_Attributes$order = _elm_lang$virtual_dom$VirtualDom$attribute('order');
var _elm_lang$svg$Svg_Attributes$operator = _elm_lang$virtual_dom$VirtualDom$attribute('operator');
var _elm_lang$svg$Svg_Attributes$offset = _elm_lang$virtual_dom$VirtualDom$attribute('offset');
var _elm_lang$svg$Svg_Attributes$numOctaves = _elm_lang$virtual_dom$VirtualDom$attribute('numOctaves');
var _elm_lang$svg$Svg_Attributes$name = _elm_lang$virtual_dom$VirtualDom$attribute('name');
var _elm_lang$svg$Svg_Attributes$mode = _elm_lang$virtual_dom$VirtualDom$attribute('mode');
var _elm_lang$svg$Svg_Attributes$min = _elm_lang$virtual_dom$VirtualDom$attribute('min');
var _elm_lang$svg$Svg_Attributes$method = _elm_lang$virtual_dom$VirtualDom$attribute('method');
var _elm_lang$svg$Svg_Attributes$media = _elm_lang$virtual_dom$VirtualDom$attribute('media');
var _elm_lang$svg$Svg_Attributes$max = _elm_lang$virtual_dom$VirtualDom$attribute('max');
var _elm_lang$svg$Svg_Attributes$mathematical = _elm_lang$virtual_dom$VirtualDom$attribute('mathematical');
var _elm_lang$svg$Svg_Attributes$maskUnits = _elm_lang$virtual_dom$VirtualDom$attribute('maskUnits');
var _elm_lang$svg$Svg_Attributes$maskContentUnits = _elm_lang$virtual_dom$VirtualDom$attribute('maskContentUnits');
var _elm_lang$svg$Svg_Attributes$markerWidth = _elm_lang$virtual_dom$VirtualDom$attribute('markerWidth');
var _elm_lang$svg$Svg_Attributes$markerUnits = _elm_lang$virtual_dom$VirtualDom$attribute('markerUnits');
var _elm_lang$svg$Svg_Attributes$markerHeight = _elm_lang$virtual_dom$VirtualDom$attribute('markerHeight');
var _elm_lang$svg$Svg_Attributes$local = _elm_lang$virtual_dom$VirtualDom$attribute('local');
var _elm_lang$svg$Svg_Attributes$limitingConeAngle = _elm_lang$virtual_dom$VirtualDom$attribute('limitingConeAngle');
var _elm_lang$svg$Svg_Attributes$lengthAdjust = _elm_lang$virtual_dom$VirtualDom$attribute('lengthAdjust');
var _elm_lang$svg$Svg_Attributes$lang = _elm_lang$virtual_dom$VirtualDom$attribute('lang');
var _elm_lang$svg$Svg_Attributes$keyTimes = _elm_lang$virtual_dom$VirtualDom$attribute('keyTimes');
var _elm_lang$svg$Svg_Attributes$keySplines = _elm_lang$virtual_dom$VirtualDom$attribute('keySplines');
var _elm_lang$svg$Svg_Attributes$keyPoints = _elm_lang$virtual_dom$VirtualDom$attribute('keyPoints');
var _elm_lang$svg$Svg_Attributes$kernelUnitLength = _elm_lang$virtual_dom$VirtualDom$attribute('kernelUnitLength');
var _elm_lang$svg$Svg_Attributes$kernelMatrix = _elm_lang$virtual_dom$VirtualDom$attribute('kernelMatrix');
var _elm_lang$svg$Svg_Attributes$k4 = _elm_lang$virtual_dom$VirtualDom$attribute('k4');
var _elm_lang$svg$Svg_Attributes$k3 = _elm_lang$virtual_dom$VirtualDom$attribute('k3');
var _elm_lang$svg$Svg_Attributes$k2 = _elm_lang$virtual_dom$VirtualDom$attribute('k2');
var _elm_lang$svg$Svg_Attributes$k1 = _elm_lang$virtual_dom$VirtualDom$attribute('k1');
var _elm_lang$svg$Svg_Attributes$k = _elm_lang$virtual_dom$VirtualDom$attribute('k');
var _elm_lang$svg$Svg_Attributes$intercept = _elm_lang$virtual_dom$VirtualDom$attribute('intercept');
var _elm_lang$svg$Svg_Attributes$in2 = _elm_lang$virtual_dom$VirtualDom$attribute('in2');
var _elm_lang$svg$Svg_Attributes$in_ = _elm_lang$virtual_dom$VirtualDom$attribute('in');
var _elm_lang$svg$Svg_Attributes$ideographic = _elm_lang$virtual_dom$VirtualDom$attribute('ideographic');
var _elm_lang$svg$Svg_Attributes$id = _elm_lang$virtual_dom$VirtualDom$attribute('id');
var _elm_lang$svg$Svg_Attributes$horizOriginY = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-origin-y');
var _elm_lang$svg$Svg_Attributes$horizOriginX = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-origin-x');
var _elm_lang$svg$Svg_Attributes$horizAdvX = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-adv-x');
var _elm_lang$svg$Svg_Attributes$height = _elm_lang$virtual_dom$VirtualDom$attribute('height');
var _elm_lang$svg$Svg_Attributes$hanging = _elm_lang$virtual_dom$VirtualDom$attribute('hanging');
var _elm_lang$svg$Svg_Attributes$gradientUnits = _elm_lang$virtual_dom$VirtualDom$attribute('gradientUnits');
var _elm_lang$svg$Svg_Attributes$gradientTransform = _elm_lang$virtual_dom$VirtualDom$attribute('gradientTransform');
var _elm_lang$svg$Svg_Attributes$glyphRef = _elm_lang$virtual_dom$VirtualDom$attribute('glyphRef');
var _elm_lang$svg$Svg_Attributes$glyphName = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-name');
var _elm_lang$svg$Svg_Attributes$g2 = _elm_lang$virtual_dom$VirtualDom$attribute('g2');
var _elm_lang$svg$Svg_Attributes$g1 = _elm_lang$virtual_dom$VirtualDom$attribute('g1');
var _elm_lang$svg$Svg_Attributes$fy = _elm_lang$virtual_dom$VirtualDom$attribute('fy');
var _elm_lang$svg$Svg_Attributes$fx = _elm_lang$virtual_dom$VirtualDom$attribute('fx');
var _elm_lang$svg$Svg_Attributes$from = _elm_lang$virtual_dom$VirtualDom$attribute('from');
var _elm_lang$svg$Svg_Attributes$format = _elm_lang$virtual_dom$VirtualDom$attribute('format');
var _elm_lang$svg$Svg_Attributes$filterUnits = _elm_lang$virtual_dom$VirtualDom$attribute('filterUnits');
var _elm_lang$svg$Svg_Attributes$filterRes = _elm_lang$virtual_dom$VirtualDom$attribute('filterRes');
var _elm_lang$svg$Svg_Attributes$externalResourcesRequired = _elm_lang$virtual_dom$VirtualDom$attribute('externalResourcesRequired');
var _elm_lang$svg$Svg_Attributes$exponent = _elm_lang$virtual_dom$VirtualDom$attribute('exponent');
var _elm_lang$svg$Svg_Attributes$end = _elm_lang$virtual_dom$VirtualDom$attribute('end');
var _elm_lang$svg$Svg_Attributes$elevation = _elm_lang$virtual_dom$VirtualDom$attribute('elevation');
var _elm_lang$svg$Svg_Attributes$edgeMode = _elm_lang$virtual_dom$VirtualDom$attribute('edgeMode');
var _elm_lang$svg$Svg_Attributes$dy = _elm_lang$virtual_dom$VirtualDom$attribute('dy');
var _elm_lang$svg$Svg_Attributes$dx = _elm_lang$virtual_dom$VirtualDom$attribute('dx');
var _elm_lang$svg$Svg_Attributes$dur = _elm_lang$virtual_dom$VirtualDom$attribute('dur');
var _elm_lang$svg$Svg_Attributes$divisor = _elm_lang$virtual_dom$VirtualDom$attribute('divisor');
var _elm_lang$svg$Svg_Attributes$diffuseConstant = _elm_lang$virtual_dom$VirtualDom$attribute('diffuseConstant');
var _elm_lang$svg$Svg_Attributes$descent = _elm_lang$virtual_dom$VirtualDom$attribute('descent');
var _elm_lang$svg$Svg_Attributes$decelerate = _elm_lang$virtual_dom$VirtualDom$attribute('decelerate');
var _elm_lang$svg$Svg_Attributes$d = _elm_lang$virtual_dom$VirtualDom$attribute('d');
var _elm_lang$svg$Svg_Attributes$cy = _elm_lang$virtual_dom$VirtualDom$attribute('cy');
var _elm_lang$svg$Svg_Attributes$cx = _elm_lang$virtual_dom$VirtualDom$attribute('cx');
var _elm_lang$svg$Svg_Attributes$contentStyleType = _elm_lang$virtual_dom$VirtualDom$attribute('contentStyleType');
var _elm_lang$svg$Svg_Attributes$contentScriptType = _elm_lang$virtual_dom$VirtualDom$attribute('contentScriptType');
var _elm_lang$svg$Svg_Attributes$clipPathUnits = _elm_lang$virtual_dom$VirtualDom$attribute('clipPathUnits');
var _elm_lang$svg$Svg_Attributes$class = _elm_lang$virtual_dom$VirtualDom$attribute('class');
var _elm_lang$svg$Svg_Attributes$capHeight = _elm_lang$virtual_dom$VirtualDom$attribute('cap-height');
var _elm_lang$svg$Svg_Attributes$calcMode = _elm_lang$virtual_dom$VirtualDom$attribute('calcMode');
var _elm_lang$svg$Svg_Attributes$by = _elm_lang$virtual_dom$VirtualDom$attribute('by');
var _elm_lang$svg$Svg_Attributes$bias = _elm_lang$virtual_dom$VirtualDom$attribute('bias');
var _elm_lang$svg$Svg_Attributes$begin = _elm_lang$virtual_dom$VirtualDom$attribute('begin');
var _elm_lang$svg$Svg_Attributes$bbox = _elm_lang$virtual_dom$VirtualDom$attribute('bbox');
var _elm_lang$svg$Svg_Attributes$baseProfile = _elm_lang$virtual_dom$VirtualDom$attribute('baseProfile');
var _elm_lang$svg$Svg_Attributes$baseFrequency = _elm_lang$virtual_dom$VirtualDom$attribute('baseFrequency');
var _elm_lang$svg$Svg_Attributes$azimuth = _elm_lang$virtual_dom$VirtualDom$attribute('azimuth');
var _elm_lang$svg$Svg_Attributes$autoReverse = _elm_lang$virtual_dom$VirtualDom$attribute('autoReverse');
var _elm_lang$svg$Svg_Attributes$attributeType = _elm_lang$virtual_dom$VirtualDom$attribute('attributeType');
var _elm_lang$svg$Svg_Attributes$attributeName = _elm_lang$virtual_dom$VirtualDom$attribute('attributeName');
var _elm_lang$svg$Svg_Attributes$ascent = _elm_lang$virtual_dom$VirtualDom$attribute('ascent');
var _elm_lang$svg$Svg_Attributes$arabicForm = _elm_lang$virtual_dom$VirtualDom$attribute('arabic-form');
var _elm_lang$svg$Svg_Attributes$amplitude = _elm_lang$virtual_dom$VirtualDom$attribute('amplitude');
var _elm_lang$svg$Svg_Attributes$allowReorder = _elm_lang$virtual_dom$VirtualDom$attribute('allowReorder');
var _elm_lang$svg$Svg_Attributes$alphabetic = _elm_lang$virtual_dom$VirtualDom$attribute('alphabetic');
var _elm_lang$svg$Svg_Attributes$additive = _elm_lang$virtual_dom$VirtualDom$attribute('additive');
var _elm_lang$svg$Svg_Attributes$accumulate = _elm_lang$virtual_dom$VirtualDom$attribute('accumulate');
var _elm_lang$svg$Svg_Attributes$accelerate = _elm_lang$virtual_dom$VirtualDom$attribute('accelerate');
var _elm_lang$svg$Svg_Attributes$accentHeight = _elm_lang$virtual_dom$VirtualDom$attribute('accent-height');

var _user$project$LocalStoragePort$loadCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'loadCmd',
	function (v) {
		return v;
	});
var _user$project$LocalStoragePort$loadSub = _elm_lang$core$Native_Platform.incomingPort(
	'loadSub',
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (level) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (x) {
					return A2(
						_elm_lang$core$Json_Decode$andThen,
						function (y) {
							return A2(
								_elm_lang$core$Json_Decode$andThen,
								function (power) {
									return A2(
										_elm_lang$core$Json_Decode$andThen,
										function (damage) {
											return A2(
												_elm_lang$core$Json_Decode$andThen,
												function (response) {
													return A2(
														_elm_lang$core$Json_Decode$andThen,
														function (seed) {
															return A2(
																_elm_lang$core$Json_Decode$andThen,
																function (weight) {
																	return A2(
																		_elm_lang$core$Json_Decode$andThen,
																		function (bpm) {
																			return A2(
																				_elm_lang$core$Json_Decode$andThen,
																				function (display) {
																					return A2(
																						_elm_lang$core$Json_Decode$andThen,
																						function (frame) {
																							return A2(
																								_elm_lang$core$Json_Decode$andThen,
																								function (heart) {
																									return A2(
																										_elm_lang$core$Json_Decode$andThen,
																										function (history) {
																											return A2(
																												_elm_lang$core$Json_Decode$andThen,
																												function (input) {
																													return A2(
																														_elm_lang$core$Json_Decode$andThen,
																														function (good) {
																															return A2(
																																_elm_lang$core$Json_Decode$andThen,
																																function (inventory) {
																																	return A2(
																																		_elm_lang$core$Json_Decode$andThen,
																																		function (leftHand) {
																																			return A2(
																																				_elm_lang$core$Json_Decode$andThen,
																																				function (rightHand) {
																																					return A2(
																																						_elm_lang$core$Json_Decode$andThen,
																																						function (status) {
																																							return A2(
																																								_elm_lang$core$Json_Decode$andThen,
																																								function (orientation) {
																																									return A2(
																																										_elm_lang$core$Json_Decode$andThen,
																																										function (monsters) {
																																											return A2(
																																												_elm_lang$core$Json_Decode$andThen,
																																												function (treasure) {
																																													return _elm_lang$core$Json_Decode$succeed(
																																														{level: level, x: x, y: y, power: power, damage: damage, response: response, seed: seed, weight: weight, bpm: bpm, display: display, frame: frame, heart: heart, history: history, input: input, good: good, inventory: inventory, leftHand: leftHand, rightHand: rightHand, status: status, orientation: orientation, monsters: monsters, treasure: treasure});
																																												},
																																												A2(
																																													_elm_lang$core$Json_Decode$field,
																																													'treasure',
																																													_elm_lang$core$Json_Decode$list(
																																														A2(
																																															_elm_lang$core$Json_Decode$andThen,
																																															function (level) {
																																																return A2(
																																																	_elm_lang$core$Json_Decode$andThen,
																																																	function (x) {
																																																		return A2(
																																																			_elm_lang$core$Json_Decode$andThen,
																																																			function (y) {
																																																				return A2(
																																																					_elm_lang$core$Json_Decode$andThen,
																																																					function (object) {
																																																						return _elm_lang$core$Json_Decode$succeed(
																																																							{level: level, x: x, y: y, object: object});
																																																					},
																																																					A2(
																																																						_elm_lang$core$Json_Decode$field,
																																																						'object',
																																																						A2(
																																																							_elm_lang$core$Json_Decode$andThen,
																																																							function (clazz) {
																																																								return A2(
																																																									_elm_lang$core$Json_Decode$andThen,
																																																									function (id) {
																																																										return A2(
																																																											_elm_lang$core$Json_Decode$andThen,
																																																											function (attack) {
																																																												return A2(
																																																													_elm_lang$core$Json_Decode$andThen,
																																																													function (defence) {
																																																														return A2(
																																																															_elm_lang$core$Json_Decode$andThen,
																																																															function (magic) {
																																																																return A2(
																																																																	_elm_lang$core$Json_Decode$andThen,
																																																																	function (resistance) {
																																																																		return A2(
																																																																			_elm_lang$core$Json_Decode$andThen,
																																																																			function (charges) {
																																																																				return A2(
																																																																					_elm_lang$core$Json_Decode$andThen,
																																																																					function (flag) {
																																																																						return A2(
																																																																							_elm_lang$core$Json_Decode$andThen,
																																																																							function (magicLight) {
																																																																								return A2(
																																																																									_elm_lang$core$Json_Decode$andThen,
																																																																									function (normalLight) {
																																																																										return A2(
																																																																											_elm_lang$core$Json_Decode$andThen,
																																																																											function (power) {
																																																																												return A2(
																																																																													_elm_lang$core$Json_Decode$andThen,
																																																																													function (weight) {
																																																																														return A2(
																																																																															_elm_lang$core$Json_Decode$andThen,
																																																																															function (adj) {
																																																																																return A2(
																																																																																	_elm_lang$core$Json_Decode$andThen,
																																																																																	function (noun) {
																																																																																		return A2(
																																																																																			_elm_lang$core$Json_Decode$andThen,
																																																																																			function (revealed) {
																																																																																				return _elm_lang$core$Json_Decode$succeed(
																																																																																					{clazz: clazz, id: id, attack: attack, defence: defence, magic: magic, resistance: resistance, charges: charges, flag: flag, magicLight: magicLight, normalLight: normalLight, power: power, weight: weight, adj: adj, noun: noun, revealed: revealed});
																																																																																			},
																																																																																			A2(_elm_lang$core$Json_Decode$field, 'revealed', _elm_lang$core$Json_Decode$bool));
																																																																																	},
																																																																																	A2(_elm_lang$core$Json_Decode$field, 'noun', _elm_lang$core$Json_Decode$string));
																																																																															},
																																																																															A2(_elm_lang$core$Json_Decode$field, 'adj', _elm_lang$core$Json_Decode$string));
																																																																													},
																																																																													A2(_elm_lang$core$Json_Decode$field, 'weight', _elm_lang$core$Json_Decode$float));
																																																																											},
																																																																											A2(_elm_lang$core$Json_Decode$field, 'power', _elm_lang$core$Json_Decode$float));
																																																																									},
																																																																									A2(_elm_lang$core$Json_Decode$field, 'normalLight', _elm_lang$core$Json_Decode$int));
																																																																							},
																																																																							A2(_elm_lang$core$Json_Decode$field, 'magicLight', _elm_lang$core$Json_Decode$int));
																																																																					},
																																																																					A2(_elm_lang$core$Json_Decode$field, 'flag', _elm_lang$core$Json_Decode$bool));
																																																																			},
																																																																			A2(_elm_lang$core$Json_Decode$field, 'charges', _elm_lang$core$Json_Decode$int));
																																																																	},
																																																																	A2(_elm_lang$core$Json_Decode$field, 'resistance', _elm_lang$core$Json_Decode$float));
																																																															},
																																																															A2(_elm_lang$core$Json_Decode$field, 'magic', _elm_lang$core$Json_Decode$float));
																																																													},
																																																													A2(_elm_lang$core$Json_Decode$field, 'defence', _elm_lang$core$Json_Decode$float));
																																																											},
																																																											A2(_elm_lang$core$Json_Decode$field, 'attack', _elm_lang$core$Json_Decode$float));
																																																									},
																																																									A2(_elm_lang$core$Json_Decode$field, 'id', _elm_lang$core$Json_Decode$int));
																																																							},
																																																							A2(_elm_lang$core$Json_Decode$field, 'clazz', _elm_lang$core$Json_Decode$string))));
																																																			},
																																																			A2(_elm_lang$core$Json_Decode$field, 'y', _elm_lang$core$Json_Decode$int));
																																																	},
																																																	A2(_elm_lang$core$Json_Decode$field, 'x', _elm_lang$core$Json_Decode$int));
																																															},
																																															A2(_elm_lang$core$Json_Decode$field, 'level', _elm_lang$core$Json_Decode$int)))));
																																										},
																																										A2(
																																											_elm_lang$core$Json_Decode$field,
																																											'monsters',
																																											_elm_lang$core$Json_Decode$list(
																																												A2(
																																													_elm_lang$core$Json_Decode$andThen,
																																													function (level) {
																																														return A2(
																																															_elm_lang$core$Json_Decode$andThen,
																																															function (x) {
																																																return A2(
																																																	_elm_lang$core$Json_Decode$andThen,
																																																	function (y) {
																																																		return A2(
																																																			_elm_lang$core$Json_Decode$andThen,
																																																			function (orientation) {
																																																				return A2(
																																																					_elm_lang$core$Json_Decode$andThen,
																																																					function (actionCounter) {
																																																						return A2(
																																																							_elm_lang$core$Json_Decode$andThen,
																																																							function (inventory) {
																																																								return A2(
																																																									_elm_lang$core$Json_Decode$andThen,
																																																									function (statistics) {
																																																										return _elm_lang$core$Json_Decode$succeed(
																																																											{level: level, x: x, y: y, orientation: orientation, actionCounter: actionCounter, inventory: inventory, statistics: statistics});
																																																									},
																																																									A2(
																																																										_elm_lang$core$Json_Decode$field,
																																																										'statistics',
																																																										A2(
																																																											_elm_lang$core$Json_Decode$andThen,
																																																											function (creature) {
																																																												return A2(
																																																													_elm_lang$core$Json_Decode$andThen,
																																																													function (attack) {
																																																														return A2(
																																																															_elm_lang$core$Json_Decode$andThen,
																																																															function (defence) {
																																																																return A2(
																																																																	_elm_lang$core$Json_Decode$andThen,
																																																																	function (magic) {
																																																																		return A2(
																																																																			_elm_lang$core$Json_Decode$andThen,
																																																																			function (resistance) {
																																																																				return A2(
																																																																					_elm_lang$core$Json_Decode$andThen,
																																																																					function (attackRate) {
																																																																						return A2(
																																																																							_elm_lang$core$Json_Decode$andThen,
																																																																							function (moveRate) {
																																																																								return A2(
																																																																									_elm_lang$core$Json_Decode$andThen,
																																																																									function (power) {
																																																																										return A2(
																																																																											_elm_lang$core$Json_Decode$andThen,
																																																																											function (damage) {
																																																																												return _elm_lang$core$Json_Decode$succeed(
																																																																													{creature: creature, attack: attack, defence: defence, magic: magic, resistance: resistance, attackRate: attackRate, moveRate: moveRate, power: power, damage: damage});
																																																																											},
																																																																											A2(_elm_lang$core$Json_Decode$field, 'damage', _elm_lang$core$Json_Decode$float));
																																																																									},
																																																																									A2(_elm_lang$core$Json_Decode$field, 'power', _elm_lang$core$Json_Decode$float));
																																																																							},
																																																																							A2(_elm_lang$core$Json_Decode$field, 'moveRate', _elm_lang$core$Json_Decode$int));
																																																																					},
																																																																					A2(_elm_lang$core$Json_Decode$field, 'attackRate', _elm_lang$core$Json_Decode$int));
																																																																			},
																																																																			A2(_elm_lang$core$Json_Decode$field, 'resistance', _elm_lang$core$Json_Decode$float));
																																																																	},
																																																																	A2(_elm_lang$core$Json_Decode$field, 'magic', _elm_lang$core$Json_Decode$float));
																																																															},
																																																															A2(_elm_lang$core$Json_Decode$field, 'defence', _elm_lang$core$Json_Decode$float));
																																																													},
																																																													A2(_elm_lang$core$Json_Decode$field, 'attack', _elm_lang$core$Json_Decode$float));
																																																											},
																																																											A2(_elm_lang$core$Json_Decode$field, 'creature', _elm_lang$core$Json_Decode$string))));
																																																							},
																																																							A2(
																																																								_elm_lang$core$Json_Decode$field,
																																																								'inventory',
																																																								_elm_lang$core$Json_Decode$list(
																																																									A2(
																																																										_elm_lang$core$Json_Decode$andThen,
																																																										function (clazz) {
																																																											return A2(
																																																												_elm_lang$core$Json_Decode$andThen,
																																																												function (id) {
																																																													return A2(
																																																														_elm_lang$core$Json_Decode$andThen,
																																																														function (attack) {
																																																															return A2(
																																																																_elm_lang$core$Json_Decode$andThen,
																																																																function (defence) {
																																																																	return A2(
																																																																		_elm_lang$core$Json_Decode$andThen,
																																																																		function (magic) {
																																																																			return A2(
																																																																				_elm_lang$core$Json_Decode$andThen,
																																																																				function (resistance) {
																																																																					return A2(
																																																																						_elm_lang$core$Json_Decode$andThen,
																																																																						function (charges) {
																																																																							return A2(
																																																																								_elm_lang$core$Json_Decode$andThen,
																																																																								function (flag) {
																																																																									return A2(
																																																																										_elm_lang$core$Json_Decode$andThen,
																																																																										function (magicLight) {
																																																																											return A2(
																																																																												_elm_lang$core$Json_Decode$andThen,
																																																																												function (normalLight) {
																																																																													return A2(
																																																																														_elm_lang$core$Json_Decode$andThen,
																																																																														function (power) {
																																																																															return A2(
																																																																																_elm_lang$core$Json_Decode$andThen,
																																																																																function (weight) {
																																																																																	return A2(
																																																																																		_elm_lang$core$Json_Decode$andThen,
																																																																																		function (adj) {
																																																																																			return A2(
																																																																																				_elm_lang$core$Json_Decode$andThen,
																																																																																				function (noun) {
																																																																																					return A2(
																																																																																						_elm_lang$core$Json_Decode$andThen,
																																																																																						function (revealed) {
																																																																																							return _elm_lang$core$Json_Decode$succeed(
																																																																																								{clazz: clazz, id: id, attack: attack, defence: defence, magic: magic, resistance: resistance, charges: charges, flag: flag, magicLight: magicLight, normalLight: normalLight, power: power, weight: weight, adj: adj, noun: noun, revealed: revealed});
																																																																																						},
																																																																																						A2(_elm_lang$core$Json_Decode$field, 'revealed', _elm_lang$core$Json_Decode$bool));
																																																																																				},
																																																																																				A2(_elm_lang$core$Json_Decode$field, 'noun', _elm_lang$core$Json_Decode$string));
																																																																																		},
																																																																																		A2(_elm_lang$core$Json_Decode$field, 'adj', _elm_lang$core$Json_Decode$string));
																																																																																},
																																																																																A2(_elm_lang$core$Json_Decode$field, 'weight', _elm_lang$core$Json_Decode$float));
																																																																														},
																																																																														A2(_elm_lang$core$Json_Decode$field, 'power', _elm_lang$core$Json_Decode$float));
																																																																												},
																																																																												A2(_elm_lang$core$Json_Decode$field, 'normalLight', _elm_lang$core$Json_Decode$int));
																																																																										},
																																																																										A2(_elm_lang$core$Json_Decode$field, 'magicLight', _elm_lang$core$Json_Decode$int));
																																																																								},
																																																																								A2(_elm_lang$core$Json_Decode$field, 'flag', _elm_lang$core$Json_Decode$bool));
																																																																						},
																																																																						A2(_elm_lang$core$Json_Decode$field, 'charges', _elm_lang$core$Json_Decode$int));
																																																																				},
																																																																				A2(_elm_lang$core$Json_Decode$field, 'resistance', _elm_lang$core$Json_Decode$float));
																																																																		},
																																																																		A2(_elm_lang$core$Json_Decode$field, 'magic', _elm_lang$core$Json_Decode$float));
																																																																},
																																																																A2(_elm_lang$core$Json_Decode$field, 'defence', _elm_lang$core$Json_Decode$float));
																																																														},
																																																														A2(_elm_lang$core$Json_Decode$field, 'attack', _elm_lang$core$Json_Decode$float));
																																																												},
																																																												A2(_elm_lang$core$Json_Decode$field, 'id', _elm_lang$core$Json_Decode$int));
																																																										},
																																																										A2(_elm_lang$core$Json_Decode$field, 'clazz', _elm_lang$core$Json_Decode$string)))));
																																																					},
																																																					A2(_elm_lang$core$Json_Decode$field, 'actionCounter', _elm_lang$core$Json_Decode$int));
																																																			},
																																																			A2(_elm_lang$core$Json_Decode$field, 'orientation', _elm_lang$core$Json_Decode$int));
																																																	},
																																																	A2(_elm_lang$core$Json_Decode$field, 'y', _elm_lang$core$Json_Decode$int));
																																															},
																																															A2(_elm_lang$core$Json_Decode$field, 'x', _elm_lang$core$Json_Decode$int));
																																													},
																																													A2(_elm_lang$core$Json_Decode$field, 'level', _elm_lang$core$Json_Decode$int)))));
																																								},
																																								A2(_elm_lang$core$Json_Decode$field, 'orientation', _elm_lang$core$Json_Decode$int));
																																						},
																																						A2(_elm_lang$core$Json_Decode$field, 'status', _elm_lang$core$Json_Decode$string));
																																				},
																																				A2(
																																					_elm_lang$core$Json_Decode$field,
																																					'rightHand',
																																					_elm_lang$core$Json_Decode$list(
																																						A2(
																																							_elm_lang$core$Json_Decode$andThen,
																																							function (clazz) {
																																								return A2(
																																									_elm_lang$core$Json_Decode$andThen,
																																									function (id) {
																																										return A2(
																																											_elm_lang$core$Json_Decode$andThen,
																																											function (attack) {
																																												return A2(
																																													_elm_lang$core$Json_Decode$andThen,
																																													function (defence) {
																																														return A2(
																																															_elm_lang$core$Json_Decode$andThen,
																																															function (magic) {
																																																return A2(
																																																	_elm_lang$core$Json_Decode$andThen,
																																																	function (resistance) {
																																																		return A2(
																																																			_elm_lang$core$Json_Decode$andThen,
																																																			function (charges) {
																																																				return A2(
																																																					_elm_lang$core$Json_Decode$andThen,
																																																					function (flag) {
																																																						return A2(
																																																							_elm_lang$core$Json_Decode$andThen,
																																																							function (magicLight) {
																																																								return A2(
																																																									_elm_lang$core$Json_Decode$andThen,
																																																									function (normalLight) {
																																																										return A2(
																																																											_elm_lang$core$Json_Decode$andThen,
																																																											function (power) {
																																																												return A2(
																																																													_elm_lang$core$Json_Decode$andThen,
																																																													function (weight) {
																																																														return A2(
																																																															_elm_lang$core$Json_Decode$andThen,
																																																															function (adj) {
																																																																return A2(
																																																																	_elm_lang$core$Json_Decode$andThen,
																																																																	function (noun) {
																																																																		return A2(
																																																																			_elm_lang$core$Json_Decode$andThen,
																																																																			function (revealed) {
																																																																				return _elm_lang$core$Json_Decode$succeed(
																																																																					{clazz: clazz, id: id, attack: attack, defence: defence, magic: magic, resistance: resistance, charges: charges, flag: flag, magicLight: magicLight, normalLight: normalLight, power: power, weight: weight, adj: adj, noun: noun, revealed: revealed});
																																																																			},
																																																																			A2(_elm_lang$core$Json_Decode$field, 'revealed', _elm_lang$core$Json_Decode$bool));
																																																																	},
																																																																	A2(_elm_lang$core$Json_Decode$field, 'noun', _elm_lang$core$Json_Decode$string));
																																																															},
																																																															A2(_elm_lang$core$Json_Decode$field, 'adj', _elm_lang$core$Json_Decode$string));
																																																													},
																																																													A2(_elm_lang$core$Json_Decode$field, 'weight', _elm_lang$core$Json_Decode$float));
																																																											},
																																																											A2(_elm_lang$core$Json_Decode$field, 'power', _elm_lang$core$Json_Decode$float));
																																																									},
																																																									A2(_elm_lang$core$Json_Decode$field, 'normalLight', _elm_lang$core$Json_Decode$int));
																																																							},
																																																							A2(_elm_lang$core$Json_Decode$field, 'magicLight', _elm_lang$core$Json_Decode$int));
																																																					},
																																																					A2(_elm_lang$core$Json_Decode$field, 'flag', _elm_lang$core$Json_Decode$bool));
																																																			},
																																																			A2(_elm_lang$core$Json_Decode$field, 'charges', _elm_lang$core$Json_Decode$int));
																																																	},
																																																	A2(_elm_lang$core$Json_Decode$field, 'resistance', _elm_lang$core$Json_Decode$float));
																																															},
																																															A2(_elm_lang$core$Json_Decode$field, 'magic', _elm_lang$core$Json_Decode$float));
																																													},
																																													A2(_elm_lang$core$Json_Decode$field, 'defence', _elm_lang$core$Json_Decode$float));
																																											},
																																											A2(_elm_lang$core$Json_Decode$field, 'attack', _elm_lang$core$Json_Decode$float));
																																									},
																																									A2(_elm_lang$core$Json_Decode$field, 'id', _elm_lang$core$Json_Decode$int));
																																							},
																																							A2(_elm_lang$core$Json_Decode$field, 'clazz', _elm_lang$core$Json_Decode$string)))));
																																		},
																																		A2(
																																			_elm_lang$core$Json_Decode$field,
																																			'leftHand',
																																			_elm_lang$core$Json_Decode$list(
																																				A2(
																																					_elm_lang$core$Json_Decode$andThen,
																																					function (clazz) {
																																						return A2(
																																							_elm_lang$core$Json_Decode$andThen,
																																							function (id) {
																																								return A2(
																																									_elm_lang$core$Json_Decode$andThen,
																																									function (attack) {
																																										return A2(
																																											_elm_lang$core$Json_Decode$andThen,
																																											function (defence) {
																																												return A2(
																																													_elm_lang$core$Json_Decode$andThen,
																																													function (magic) {
																																														return A2(
																																															_elm_lang$core$Json_Decode$andThen,
																																															function (resistance) {
																																																return A2(
																																																	_elm_lang$core$Json_Decode$andThen,
																																																	function (charges) {
																																																		return A2(
																																																			_elm_lang$core$Json_Decode$andThen,
																																																			function (flag) {
																																																				return A2(
																																																					_elm_lang$core$Json_Decode$andThen,
																																																					function (magicLight) {
																																																						return A2(
																																																							_elm_lang$core$Json_Decode$andThen,
																																																							function (normalLight) {
																																																								return A2(
																																																									_elm_lang$core$Json_Decode$andThen,
																																																									function (power) {
																																																										return A2(
																																																											_elm_lang$core$Json_Decode$andThen,
																																																											function (weight) {
																																																												return A2(
																																																													_elm_lang$core$Json_Decode$andThen,
																																																													function (adj) {
																																																														return A2(
																																																															_elm_lang$core$Json_Decode$andThen,
																																																															function (noun) {
																																																																return A2(
																																																																	_elm_lang$core$Json_Decode$andThen,
																																																																	function (revealed) {
																																																																		return _elm_lang$core$Json_Decode$succeed(
																																																																			{clazz: clazz, id: id, attack: attack, defence: defence, magic: magic, resistance: resistance, charges: charges, flag: flag, magicLight: magicLight, normalLight: normalLight, power: power, weight: weight, adj: adj, noun: noun, revealed: revealed});
																																																																	},
																																																																	A2(_elm_lang$core$Json_Decode$field, 'revealed', _elm_lang$core$Json_Decode$bool));
																																																															},
																																																															A2(_elm_lang$core$Json_Decode$field, 'noun', _elm_lang$core$Json_Decode$string));
																																																													},
																																																													A2(_elm_lang$core$Json_Decode$field, 'adj', _elm_lang$core$Json_Decode$string));
																																																											},
																																																											A2(_elm_lang$core$Json_Decode$field, 'weight', _elm_lang$core$Json_Decode$float));
																																																									},
																																																									A2(_elm_lang$core$Json_Decode$field, 'power', _elm_lang$core$Json_Decode$float));
																																																							},
																																																							A2(_elm_lang$core$Json_Decode$field, 'normalLight', _elm_lang$core$Json_Decode$int));
																																																					},
																																																					A2(_elm_lang$core$Json_Decode$field, 'magicLight', _elm_lang$core$Json_Decode$int));
																																																			},
																																																			A2(_elm_lang$core$Json_Decode$field, 'flag', _elm_lang$core$Json_Decode$bool));
																																																	},
																																																	A2(_elm_lang$core$Json_Decode$field, 'charges', _elm_lang$core$Json_Decode$int));
																																															},
																																															A2(_elm_lang$core$Json_Decode$field, 'resistance', _elm_lang$core$Json_Decode$float));
																																													},
																																													A2(_elm_lang$core$Json_Decode$field, 'magic', _elm_lang$core$Json_Decode$float));
																																											},
																																											A2(_elm_lang$core$Json_Decode$field, 'defence', _elm_lang$core$Json_Decode$float));
																																									},
																																									A2(_elm_lang$core$Json_Decode$field, 'attack', _elm_lang$core$Json_Decode$float));
																																							},
																																							A2(_elm_lang$core$Json_Decode$field, 'id', _elm_lang$core$Json_Decode$int));
																																					},
																																					A2(_elm_lang$core$Json_Decode$field, 'clazz', _elm_lang$core$Json_Decode$string)))));
																																},
																																A2(
																																	_elm_lang$core$Json_Decode$field,
																																	'inventory',
																																	_elm_lang$core$Json_Decode$list(
																																		A2(
																																			_elm_lang$core$Json_Decode$andThen,
																																			function (clazz) {
																																				return A2(
																																					_elm_lang$core$Json_Decode$andThen,
																																					function (id) {
																																						return A2(
																																							_elm_lang$core$Json_Decode$andThen,
																																							function (attack) {
																																								return A2(
																																									_elm_lang$core$Json_Decode$andThen,
																																									function (defence) {
																																										return A2(
																																											_elm_lang$core$Json_Decode$andThen,
																																											function (magic) {
																																												return A2(
																																													_elm_lang$core$Json_Decode$andThen,
																																													function (resistance) {
																																														return A2(
																																															_elm_lang$core$Json_Decode$andThen,
																																															function (charges) {
																																																return A2(
																																																	_elm_lang$core$Json_Decode$andThen,
																																																	function (flag) {
																																																		return A2(
																																																			_elm_lang$core$Json_Decode$andThen,
																																																			function (magicLight) {
																																																				return A2(
																																																					_elm_lang$core$Json_Decode$andThen,
																																																					function (normalLight) {
																																																						return A2(
																																																							_elm_lang$core$Json_Decode$andThen,
																																																							function (power) {
																																																								return A2(
																																																									_elm_lang$core$Json_Decode$andThen,
																																																									function (weight) {
																																																										return A2(
																																																											_elm_lang$core$Json_Decode$andThen,
																																																											function (adj) {
																																																												return A2(
																																																													_elm_lang$core$Json_Decode$andThen,
																																																													function (noun) {
																																																														return A2(
																																																															_elm_lang$core$Json_Decode$andThen,
																																																															function (revealed) {
																																																																return _elm_lang$core$Json_Decode$succeed(
																																																																	{clazz: clazz, id: id, attack: attack, defence: defence, magic: magic, resistance: resistance, charges: charges, flag: flag, magicLight: magicLight, normalLight: normalLight, power: power, weight: weight, adj: adj, noun: noun, revealed: revealed});
																																																															},
																																																															A2(_elm_lang$core$Json_Decode$field, 'revealed', _elm_lang$core$Json_Decode$bool));
																																																													},
																																																													A2(_elm_lang$core$Json_Decode$field, 'noun', _elm_lang$core$Json_Decode$string));
																																																											},
																																																											A2(_elm_lang$core$Json_Decode$field, 'adj', _elm_lang$core$Json_Decode$string));
																																																									},
																																																									A2(_elm_lang$core$Json_Decode$field, 'weight', _elm_lang$core$Json_Decode$float));
																																																							},
																																																							A2(_elm_lang$core$Json_Decode$field, 'power', _elm_lang$core$Json_Decode$float));
																																																					},
																																																					A2(_elm_lang$core$Json_Decode$field, 'normalLight', _elm_lang$core$Json_Decode$int));
																																																			},
																																																			A2(_elm_lang$core$Json_Decode$field, 'magicLight', _elm_lang$core$Json_Decode$int));
																																																	},
																																																	A2(_elm_lang$core$Json_Decode$field, 'flag', _elm_lang$core$Json_Decode$bool));
																																															},
																																															A2(_elm_lang$core$Json_Decode$field, 'charges', _elm_lang$core$Json_Decode$int));
																																													},
																																													A2(_elm_lang$core$Json_Decode$field, 'resistance', _elm_lang$core$Json_Decode$float));
																																											},
																																											A2(_elm_lang$core$Json_Decode$field, 'magic', _elm_lang$core$Json_Decode$float));
																																									},
																																									A2(_elm_lang$core$Json_Decode$field, 'defence', _elm_lang$core$Json_Decode$float));
																																							},
																																							A2(_elm_lang$core$Json_Decode$field, 'attack', _elm_lang$core$Json_Decode$float));
																																					},
																																					A2(_elm_lang$core$Json_Decode$field, 'id', _elm_lang$core$Json_Decode$int));
																																			},
																																			A2(_elm_lang$core$Json_Decode$field, 'clazz', _elm_lang$core$Json_Decode$string)))));
																														},
																														A2(_elm_lang$core$Json_Decode$field, 'good', _elm_lang$core$Json_Decode$bool));
																												},
																												A2(_elm_lang$core$Json_Decode$field, 'input', _elm_lang$core$Json_Decode$string));
																										},
																										A2(
																											_elm_lang$core$Json_Decode$field,
																											'history',
																											_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string)));
																								},
																								A2(_elm_lang$core$Json_Decode$field, 'heart', _elm_lang$core$Json_Decode$string));
																						},
																						A2(_elm_lang$core$Json_Decode$field, 'frame', _elm_lang$core$Json_Decode$int));
																				},
																				A2(_elm_lang$core$Json_Decode$field, 'display', _elm_lang$core$Json_Decode$string));
																		},
																		A2(_elm_lang$core$Json_Decode$field, 'bpm', _elm_lang$core$Json_Decode$float));
																},
																A2(_elm_lang$core$Json_Decode$field, 'weight', _elm_lang$core$Json_Decode$float));
														},
														A2(_elm_lang$core$Json_Decode$field, 'seed', _elm_lang$core$Json_Decode$string));
												},
												A2(_elm_lang$core$Json_Decode$field, 'response', _elm_lang$core$Json_Decode$string));
										},
										A2(_elm_lang$core$Json_Decode$field, 'damage', _elm_lang$core$Json_Decode$float));
								},
								A2(_elm_lang$core$Json_Decode$field, 'power', _elm_lang$core$Json_Decode$float));
						},
						A2(_elm_lang$core$Json_Decode$field, 'y', _elm_lang$core$Json_Decode$int));
				},
				A2(_elm_lang$core$Json_Decode$field, 'x', _elm_lang$core$Json_Decode$int));
		},
		A2(_elm_lang$core$Json_Decode$field, 'level', _elm_lang$core$Json_Decode$int)));
var _user$project$LocalStoragePort$errorSub = _elm_lang$core$Native_Platform.incomingPort('errorSub', _elm_lang$core$Json_Decode$string);
var _user$project$LocalStoragePort$saveCmd = _elm_lang$core$Native_Platform.outgoingPort(
	'saveCmd',
	function (v) {
		return [
			v._0,
			{
			level: v._1.level,
			x: v._1.x,
			y: v._1.y,
			power: v._1.power,
			damage: v._1.damage,
			response: v._1.response,
			seed: v._1.seed,
			weight: v._1.weight,
			bpm: v._1.bpm,
			display: v._1.display,
			frame: v._1.frame,
			heart: v._1.heart,
			history: _elm_lang$core$Native_List.toArray(v._1.history).map(
				function (v) {
					return v;
				}),
			input: v._1.input,
			good: v._1.good,
			inventory: _elm_lang$core$Native_List.toArray(v._1.inventory).map(
				function (v) {
					return {clazz: v.clazz, id: v.id, attack: v.attack, defence: v.defence, magic: v.magic, resistance: v.resistance, charges: v.charges, flag: v.flag, magicLight: v.magicLight, normalLight: v.normalLight, power: v.power, weight: v.weight, adj: v.adj, noun: v.noun, revealed: v.revealed};
				}),
			leftHand: _elm_lang$core$Native_List.toArray(v._1.leftHand).map(
				function (v) {
					return {clazz: v.clazz, id: v.id, attack: v.attack, defence: v.defence, magic: v.magic, resistance: v.resistance, charges: v.charges, flag: v.flag, magicLight: v.magicLight, normalLight: v.normalLight, power: v.power, weight: v.weight, adj: v.adj, noun: v.noun, revealed: v.revealed};
				}),
			rightHand: _elm_lang$core$Native_List.toArray(v._1.rightHand).map(
				function (v) {
					return {clazz: v.clazz, id: v.id, attack: v.attack, defence: v.defence, magic: v.magic, resistance: v.resistance, charges: v.charges, flag: v.flag, magicLight: v.magicLight, normalLight: v.normalLight, power: v.power, weight: v.weight, adj: v.adj, noun: v.noun, revealed: v.revealed};
				}),
			status: v._1.status,
			orientation: v._1.orientation,
			monsters: _elm_lang$core$Native_List.toArray(v._1.monsters).map(
				function (v) {
					return {
						level: v.level,
						x: v.x,
						y: v.y,
						orientation: v.orientation,
						actionCounter: v.actionCounter,
						inventory: _elm_lang$core$Native_List.toArray(v.inventory).map(
							function (v) {
								return {clazz: v.clazz, id: v.id, attack: v.attack, defence: v.defence, magic: v.magic, resistance: v.resistance, charges: v.charges, flag: v.flag, magicLight: v.magicLight, normalLight: v.normalLight, power: v.power, weight: v.weight, adj: v.adj, noun: v.noun, revealed: v.revealed};
							}),
						statistics: {creature: v.statistics.creature, attack: v.statistics.attack, defence: v.statistics.defence, magic: v.statistics.magic, resistance: v.statistics.resistance, attackRate: v.statistics.attackRate, moveRate: v.statistics.moveRate, power: v.statistics.power, damage: v.statistics.damage}
					};
				}),
			treasure: _elm_lang$core$Native_List.toArray(v._1.treasure).map(
				function (v) {
					return {
						level: v.level,
						x: v.x,
						y: v.y,
						object: {clazz: v.object.clazz, id: v.object.id, attack: v.object.attack, defence: v.object.defence, magic: v.object.magic, resistance: v.object.resistance, charges: v.object.charges, flag: v.object.flag, magicLight: v.object.magicLight, normalLight: v.object.normalLight, power: v.object.power, weight: v.object.weight, adj: v.object.adj, noun: v.object.noun, revealed: v.object.revealed}
					};
				})
		}
		];
	});
var _user$project$LocalStoragePort$SerializedModel = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return function (o) {
															return function (p) {
																return function (q) {
																	return function (r) {
																		return function (s) {
																			return function (t) {
																				return function (u) {
																					return function (v) {
																						return {level: a, x: b, y: c, power: d, damage: e, response: f, seed: g, weight: h, bpm: i, display: j, frame: k, heart: l, history: m, input: n, good: o, inventory: p, leftHand: q, rightHand: r, status: s, orientation: t, monsters: u, treasure: v};
																					};
																				};
																			};
																		};
																	};
																};
															};
														};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};

var _user$project$Maze$mazeData4 = '\nWOWWWSOOWOWSWOWOWOWOWOSOWOWOWOWOWOOOWOWOWOWOWODOWOWOWDWOWDWDWOWDWOWOWOWOWODOWOWOWDWOWOODWOWOWOSOWOWOWDWOWSWDWOWSWOWOWOWOWOWOWWOO\nWWWWOWSWWWWWWWWWWWWWSWOWWWWWWWWWOWOWWWWWWWWWDWSWWWWWWWWWWWWWWWWWWWWWWWWWDWOWWWWWWWWWOWOWWWWWSWDWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOW\nWWWWSWOWWWWWWWWWWWWWOWDWWWWWWWWWOWOWWWWWWWWWSWDWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOOWWWOWODOWOWOWOWOWOWOWOWOWOWOWOWOWOWOWOOWOO\nWWWWOWDWWWWWWWWWWWWWDWOWWWWWWWWWOWDWWWWWWWWWDWOWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWDW\nWWWWDWOWWWWWWWWWWWWWOWOWWWWWWWWWDWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWODWWOWOWOWOWOWOWOWOWOOOWOWOWSWOWOWSWOWOWOWODWDO\nWOOWOOWOWOOOWOWOWDWOODODWDWDWOWDOOSOWOWOWOWOOOOOWOWOWOOOWOWOWOWOWOWOWOWOODOOWOWDDWOOWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWDWOW\nOWOWWWWWOWOWWWWWWWWWOWOWWWWWWWWWSWDWWWWWWWWWOWOWWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWOWSWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWOOWWOWOOWOO\nOWOWWWWWOWOWWWWWWWWWOWOWWWWWWWWWDWOWWWWWWWWWOWOWWWWWOWOWWWWWWWWWWWWWWWWWODWWWOWDSOOOWOWOWDWOWOWDWOWOOOOOWWWOWWWWWWWWOWDWWWWWOWOW\nODSWWOWDOOOOWOWOWOOOOOWOWOWOWOWOOODOWSWOWOWSOWOOWWWWOWOWWWWWWWWWWWWWWWDWWWWWWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWWOOWWOWODOOOWSWOOWOS\nSWOWWWWWOWSWWWWWOWOWWWWWWWWWWWWWDWOWWWWWWWWWOOOWWOWOOOOOWOWOWOWOWOWODOSOWOWOWOWOOWOOWWWWWWWWWWWWWWWWOWDWWWWWOWOWWWWWOWOWWWWWOWOW\nOWOWWWWWSWOWWWWWOWDWWWWWWWWWWWWWOWSWWWWWWWWWOWOWWWWWOWOWWWWWWWWWWWWWSWOWWWWWWWWWOWDWWWWWWWWWWWWWWWWWDWOWWWWWOWOWWWWWOWSWWWWWOWOW\nODOWWSWDOOOSWOWODWWOWWWWWWWWWWWWSWOWWWWWWWWWOSWWWOWSOOOOWSWOWOWSWOWOOOSOWDWOWOWDDOOOWOWOWOOOWOWOWOWOOOOOWOWOOOWOWODOSOWOWOWOOWOO\nOWOWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWSWOWWWWWWWWWOWOWWWWWOWOWWWWWWWWWOWOWWWWWWWWWDWOWWWWWWWWWOWOW\nOWOWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWOWWWWWWWWWWWWOWWOOOOWOWOWOWOOOSOWOWOODWOWOWDWSWOOOOSWOWOWOWOODOOWOWDWOWOOWWO\nOOWWWSWOOOOSWOWOWSWOWDWSWOWDWOWOOOWOWWOOWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWSWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWW\nWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWOOWOSWOWODSWOWOWOWOWSWOOWOSWWWWWWWWOWOWWWWWWWWWWWWW\nWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWOOOWWOWOWOWOWOWOWSWOWSWSWOWSWOWOOOOOWOWOOWDOWWWWDWOWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWW\nWDOWWSWDODOSWDWDWOWDWOWOWSWOWOWSWOWOOWDOWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWDWOWWWWWOOSWWOWOWOWOWOWOOWDOWWWWWWWWOWOWWWWWWWWWWWWW\nOWOWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWDWSWWWWWWWWWWWWWWWWWWWWWWWWWWWWWODOWWOWDOOOOWOWOSWDOWWWWWWWWWWWWDODWWOWOWOWOOWOOWWWWWWWWWWWW\nOWOWWWWWOWSWWWWWWWWWWWWWWWWWWWWWWWWWSWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWWDWOWWWWWWWWWWWWWDWSWWWWWWWWWOWOWWWWWWWWWWWWW\nOWOWWWWWSWDWWWWWWWWWWWWWWWWWWWWWWOOWOWWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWSWWWWWOOOWWOWOODDOWOWDWOWOWOWOSOWOWOWOWOWOOOOOWOWOWOWOWWOO\nOWOWWWWWDWDWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWSWSWWWWWOWOWWWWWDWOWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWOW\nOWOWWWWWDOOWWOWOWOWOWOWOWOWOWOWOODOOWOWDWOWOWDWOWOWDWOWOWOWOWOWOWDWOSODDWDWOOSWDWDOSOOWDWDWOWOWDWOWOWOWOWOWOWDWOOOODWOWOWOWOOWSO\nOOOWWOWOOWOOWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWDWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWDWWWWWWWWWSWOW\nOWOWWWWWOOOWWOWOWOWOWOWOWOWOWOWOOWOOWWWWWWWWWWWWWOWWWOWOWOWOWOWOWOWOOOOOWOWOWOWOOWWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWDWDWWWWWWWWWOWOW\nOOOWWOWOOWOOWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWOWWWWWWWWWWWWWWWWWWWWWOWDWWWWWWWWWWWWWWWWWWWWWWSOWWOWSWDWOWOWDWOWODWOOWWWWWWWWOWOW\nOWOWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWDWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWOW\nOWOWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWDWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWOWSWWWWWWWWWOWOW\nOWOWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOOWWWOOOWOWOOSOOWOWSWWWOWWWWWWWWWWWWDWOWWWWWWWWWWWWWWWWWWWWWOODWWOWOWOWOWDWOWOWDSOOOWOWOWOOOOWWO\nODOWWOWDOOOOWOWOWOWOWOWOWOWOWWWOWWWWOWDWWWWWOWSWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWDWOWWWWWWWWWWWWWWWWWOWOWWWWWOWSWWWWW\nOWOWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWDWSWWWWWSWDWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWSWDWWWWW\nOOWWWOWOOSWOWOWSWOWOWOWOWDWOWOWDWOWOSOWOWOWODOWOWOWOWOWOWOWOWDWOWOWDOOWOWOWOWOWOWWWOWWWWWWWWOOWWWOWOWOWOWOWOWOWOOOWOWDWODOWDWWWO\n';
var _user$project$Maze$mazeData3 = '\nWSOWWOWSWOWOWSWOWOOSWDWOWDWDWWSDWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWWWWWWWWWWWWWWOOWWOWOWSWOWOOSWOWOWOWOWWOO\nOWOWWWWWWWWWWWWWOWOWWWWWWWWWSWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWWWWWWWWWWWWWWWOWWWWWOODWWOWOWSWOWOWSOWOOWWWWWWWWOWOWWWWWWWWWOWOW\nOWOWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWODSWWOWDWOWOWSWOOWOSWWWWDWOWWWWWWWWWWWWWOOOWWOWOWDWOOOODWDWOWOWDOWDO\nOOOWWOWOWOWOWDWOOOODWSWOWOWSOWOOWWWWWWWWWWWWWWWWWWWWWWWWWWWWSWSWWWWWWWWWWWWWOODWWOWOODOOWOWDWOWOWOWOOWOOWWWWWWWWOWOWWWWWWWWWDWOW\nOWSWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWSWOWWWWWWWWWWWWWDWOWWWWWOWOWWWWWWWWWWWWWOWOWWWWWWWWWOWSWWWWWWWWWOWOW\nSWOWWWWWWWWWWWWWOWOWWWWWWWWWOWDWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOOOWWSWOWOWSWOWOOOOOWOWOOSDOWOWSWOWOWOWOODDOWOWDWOWOSWOOWWWWWWWWOWOW\nOWOWWWWWWWWWWWWWOWOWWWWWWWWWDWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWOWOWWWWWDWOWWWWWWWWWWWWWDWOWWWWWWWWWOWOWWWWWWWWWOWOW\nOOOWWDWOWOWDWDWOOOODWSWOWSWSOWOSWWWWWWWWWWWWWWWWWWWWWWWWWWWWODOWWDWDWOWDWOWOOOOOWDWOOOWDWODOWOWOWOWOOOOOWOWOWOWOOWSOWWWWWWWWOWOW\nOWDWWWWWWWWWWWWWOWOWWWWWWWWWOWDWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWOWDWWWWWWWWWDWOWWWWWWWWWOWOWWWWWWWWWSOWWWOWOWOWOOWWO\nDOSWWOWOWDWOWOWDOOOOWOWOWOOODOWOWOWOWOWOWOOOWOWOWOWOWDWOWDWDOWSDWWWWWWWWWWWWDWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWW\nSWOWWWWWWWWWWWWWOWOWWWWWOWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWSWOWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWOWWWWW\nOOOWWOWOWSWOWOWSOWSOWWWWWWWWWDOWWOWDWOWOOWOOWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWOWSWWWWW\nOWOWWWWWWWWWWWWWSODWWDWOWOWDOWDOWWWWWWWWOWSWWWWWWWWWWWOWWWWWOWDWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWOWDWWWWWWWWWWWWWWWWWSWOWWWWW\nOOOWWSWOWOOSWOWODWDOWWWWWWWWDWOWWWWWWWWWSWOWWWWWWWWWOWOWWWWWDWOWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWDWOWWWWWWWWWWOOWWOWOOODOWWWO\nOWOWWWWWOWOWWWWWDWOWWWWWWWWWOWDWWWWWWWWWOWOWWWWWWWWWOWOWWWWWOWOWWWWWWWWWWWWWOWOWWWWWWWWWOWDWWWWWWWWWODOWWOWDWOWOOWSOWWWWDWOWWWWW\nOOOWWSWOOOWSWOWOOOOOWOWOWDOODOWDWDSOWOWDOOOOWOWOWOWOOSDOWOWSOWOOWWWWWWWWWWWWOWDWWWWWWWWWDWDWWWWWWWWWOWOWWWWWWWWWSOOWWOWOOWOOWWWW\nOWOWWWWWWWWWWWWWOWOWWWWWOWOWWWWWSWDWWWWWOWOWWWWWWWWWDWOWWWWWOWOWWWWWWWWWWWWWDWOWWWWWWWWWDWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWOWDWWWWW\nOOOWWOWOWOWOWSWOOODSWOWOOODOWOWODOOOWOWOOOOOWOWOWODOOOWOWOWOOOOOWSWOWWDSWWWWOWSWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWDWOWWWWW\nOWOWWWWWWWWWWWWWDWOWWWWWDWOWWWWWOWOWWWWWOWOWWWWWDWOWWWWWWWWWOWOWWWWWDOSWWOWOSOOOWOWOWSWOOSWSWOWSWSWOOODSWOWOWDWOODODWOWDODSOWWWD\nOWOWWWWWWWWWWWWWOWOWWWWWOWOWWWWWOOSWWOWOOWWOWWWWOWOWWWWWWWWWOWSWWWWWSWOWWWWWOWOWWWWWWWWWWWWWWWWWWWWWDWOWWWWWWWWWOWOWWWWWSWSWWWWW\nOWOWWWWWWWWWWWWWOWOWWWWWOOOWWOWOSWOOWWWWWWWWWWWWOWOWWWWWWWWWSWOWWWWWOWOWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWSWOWWWWW\nOOOWWOWOWOWOWSWOOOOSWOWOOWSOWWWWODOWWOWDWOWOWOWOOWWOWWWWWWWWOOOWWOWOOOOOWOWOOWWOWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWOWOWWWWW\nOWOWWWWWWWWWWWWWOWOWWWWWSWOWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWWWWWWWWWWWWWWWOOWWOWOWOWOOOOOWDWOWOWDOWDOWWWWOWSWWWWW\nOWDWWWWWWWWWWWWWOWOWWWWWOWOWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWOOWWWOWOOOOOWOWOWWOOWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWDWSWWWWWSWOWWWWW\nDWOWWWWWWWWWWWWWOWOWWWWWOWOWWWWWOWDWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWWWWWWOWOWWWWWWWWWOOOWWOWOWOWOSOOOWOWOOOWOWWWO\nOWOWWWWWWWWWWWWWOWOWWWWWOWOWWWWWDWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWW\nOWOWWWWWWWWWWWWWOWOWWWWWOOOWWOWOOOWOWOWOWOWOWOWOWOOOWOWOWWOOWWWWWWWWOWOWWWWWOODWWOWOWOWOOOOOWOWOWOOOOOWOWOOOWDWOOOWDWOWOWWWOWWWW\nOWOWWWWWWWWWWWWWOWOWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOSOWWDWSWOWDOWOOWWWWDWDWWWWWWWWWOWOWWWWWOWOWWWWWOWOWWWWWWWWWWWWWWWWWWWWW\nOWOWWWWWWWWWWWWWOOWWWDWOOOODWOWOWDWOWWODWWWWWWWWOWOWWWWWOWOWWWWWWWWWOOWWWOWODOOOWOWOWOWOOODOWOWOOWOOWWWWOWOWWWWWWWWWWWWWWWWWWWWW\nOWOWWWWWWWWWWWWWWWWWWWWWOWSWWWWWWWWWOWOWWWWWWWWWOWOWWWWWOWSWWWWWWWWWWWWWWWWWOWOWWWWWWWWWDWOWWWWWOOOWWOWOOOOOWOWOWOWOWDWOWOWDWWWO\nOOWWWOWOWOWOWOWOWOWOWOWOSOOOWDWOWOWDOWOOWWWWWWWWOWOWWWWWSWOWWWWWWWWWWOOWWOWOOODOWOWOWOWOOWOOWWWWOWOWWWWWOWOWWWWWWWWWWWWWWWWWWWWW\nWWWWWWWWWWWWWWWWWWWWWWWWOWWWWWWWWWWWODWWWOWDWOWOOOWOWDWOOOWDWOWOWOWOOWWOWWWWDWWWWWWWWWWWOOWWWOWOOOWOWOWOOOWOWDWOWOWDWOWOWOWOWWWO\n';
var _user$project$Maze$mazeData2 = '\nWOOWWOWOWOWOWOOOWOWOWOWOWOOOWDWOWOWDWWWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWWWWWWWWWWWDWWWWWWOOWWOWOWSWOWOOSWOWOWOWOWOWOWOOOWWWO\nOWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWSWWWOWSWSWOOOOSWOWOWDWODOODWOWOOWWOWWWWWWWWOWOWWWWWWWWWWWWWOWOWWWWW\nOWDWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWOWDWWWWWWWWWWWWWOWOWWWWW\nDWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOOWWWOWOWOWOWOWOWOWODOWOWOWOWOWOWOWOODSOWWWD\nOOOWWOWOWOWOOOOOWOWOWOWOOWOOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWSWSWWWWW\nOWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWDDWWDWDWOWDWOWOWOWOWOWOWOWOWOWOWOWOWOWOWOWOWOWOWOWOWOWOWOWOWSWOWSWSWOWSWOWOWOWOWDWOSWWDWWWW\nOWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWDWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW\nOWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWOOOWWOWOWOWOWOWOWOWOWSWOWOWSWSWOWOWSWOWOWOWOWWOOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW\nOOOWWOWOWOOOOOWOWOWOWDWOOOWDWOWOWOWOOWOOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW\nOWOWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWOOWWOWOWOWOWWOOWWWWWWWWWWWWWWWWWWWWWWWW\nOWSWWWWWOOWWWOWOWOWOWOWOWOWOWOWOWOWOODWOWOODWOWOWOWOWSOOWOWSWOWOWOWOWWWOWWWWWWWWOWOWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWW\nSWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWW\nOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWOWDWWWWWOWSWWWWWWWWWOWDWWWWWWWWWWWWWWWWWWWWWWWWW\nOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWDWOWWWWWSWOWWWWWWWWWDWOWWWWWWWWWWWWWWWWWWWWWWWWW\nOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWODOWWOWDOODOWOWOWOWOODOOWOWDWOWOWOWOWOWOWOWOWOWOOOSOWDWOOOODWOWOWOWOOOOOWSWOWOWSWWOOWWWWWWWWWWWW\nOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWDWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWSWOWWWWWOWOWWWWWWWWWOWDWWWWWWWWWOWOWWWWWWWWWWWWW\nOWSWWWWWWWWWWWWWWWWWWOOWWOWOWOWOOOSOWOWOODOOWOWDWDSOOOWDWOSOWOWOWOWOWOSOWOWOWOWOOOOOWOWOOOOOWOWOWDWODDDDWWWDWWWWOOWWWDWOWOWDWWOO\nSWOWWWWWWWWWWWWWWWWWOWDWWWWWWWWWSWOWWWWWOWOWWWWWSWOWWWWWSWOWWWWWWWWWSWDWWWWWWWWWOWOWWWWWOWOWWWWWWWWWDWDWWWWWWWWWWWWWWWWWWWWWOWOW\nOSSWWOWSWOWOWDWOWOWDDOOOWOWOWDWOOOODWOWOOOWOWOWOOODOWOWOOSSOWOWSWOWODSWOWOOSWOWOOODOWDWOODODWOWDWOWODOOOWOWOWOWOWOWOWOWOWOWOOWSO\nSWDWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWDWDWWWWWSWSWWWWWWWWWWWWWOWDWWWWWDWOWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWSWOW\nDWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWDWSWWWWWSWOWWWWWWWWWWWWWDWOWWWWWOWOWWWWWOWDWWWWWWWWWOWSWWWWWWWWWWWWWWOOWWOWOOWOO\nOWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWSOOWWOWOOOOOWOWOWOOOWOWOOOOOWOWOOOWOWOSODOWOWOOOWOWOSODOWOWOWOOOWOWOOWSOWWWWOWOW\nOWOWWWWWWWWWWWWWWWWWOOOWWOWOWOWOODDOWDWDWDWDWOWDOWOOWWWWOWDWWWWWOWOWWWWWOWDWWWWWWWWWSWOWWWWWOWOWWWWWDWDWWWWWOWOWWWWWSSOWWOWSOWOO\nOWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWDWOWWWWWWWWWWWWWOWOWWWWWDWOWWWWWOWOWWWWWDOOWWOWOWOWOOOOOWOWOOOOOWOWODWOOWWWWOWOWWWWWOWOWWWWWOWOW\nOODWWOWOWOWOWOWOWOWOOOOOWOWOWOWOOWDOWWWWWDDWWOWDOOOOWOWOOWOOWWWWOWOWWWWWOWSWWWWWWWWWOWOWWWWWOWOWWWWWOOWWWOOOOSWOWOWSOOOOWOWOOWOO\nDWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWDWOWWWWWDWOWWWWWOWOWWWWWOWOWWWWWOWOWWWWWSWOWWWWWWWWWOWOWWWWWOWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWOWOW\nOWOWWWWWWWWWWWWWWWWWOOWWWOWOWOWOOOOOWDWOOOODWDWOOSWDWOOSOOWOWOWOOOOOWOWOOWWOWWWWWWWWOWSWWWWWOOOWWOWOWDWOOOODWOWOWDWOOOODWDWOOWOD\nOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWWWWWWOWDWWWWWWWWWOWDWWWWWWWWWWWOWWWWWSWOWWWWWOWDWWWWWWWWWOWDWWWWWWWWWOWOWWWWWOWOW\nOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWSWWWWWWWWWDODWWDWOWOWDDSDOWOWSWOWOODOOWOWDOOOOWOWODOSOWDWOWOWDDDOOWOWDWOWOOSOOWSWSOWOS\nOOSWWOWOWOWOWDWOWOWDWWOOWWWWWWWWOOWWWDWOSSODWOWSWOWODWSOWWWWWWWWDWOWWWWWWWWWOWOWWWWWOWWWWWWWSWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWOWOW\nSWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWSOOWWOWOWOOOOOWOWDOOWOWDOOWOWWDOWWWWWWWWOWOWWWWWWWWWOOOWWOWOWOWOOWOOWWWWOWSW\nOWWWWWWWWWWWWWWWWWWWOOWWWSWOWOWSWOWOWOWOOOWOWOWOWDWOOWWDWWWWOWWWWWWWOWWWWWWWWWWWDOWWWOWOWOWOOOWOWOWOWOWOOWWOWWWWWWWWOOWWWOWOSWWO\n';
var _user$project$Maze$mazeData1 = '\nWWWWWWWWWWWWWOOWWOWOWOOOWOWOWOWOWDWOWDWDWOODWOWOWSWOWOWSWOOOWOWOWOWOWOWOWWOOWWWWWWWWWWWWWWWWWOOWWSWOWOOSWOWOWWOOWWWWWWWWWWWWWWWW\nWWWWWWWWWWWWOWSWWWWWOWOWWWWWWWWWWWWWWWWWOWSWWWWWWWWWWWWWOWOWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWWOWOWWWWWWWWWWWWWWWWW\nWWWWWWWWWWWWSWWWWWWWOWDWWWWWWWWWWWWWWWWWSWOWWWWWWWWWWWWWOWOWWWWWWWWWWWWWOWDWWWWWWWWWWWWWWWWWOWOWWWWWODOWWDWDOOODWDWOWOWDWWOOWWWW\nWWWWWWWWWWWWWWWWWWWWDWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWOWOWWWWWWWWWWWWWDWOWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWWOWSWWWWWWWWWOOOWWWWO\nWSDWWOWSWOWOWOWOWOWOOOOOWOWOWOWOWOWOWOOOODWOWOWDWOWOWOOOOSWOWSWSWOWSWOWOOOOOWOWOWOOOWOWOWOOOOOWOWOWOOOSOWOWOSOOOWSWOWOWSOWDOWWWW\nDWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWOWOWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWWOWOWWWWWWWWWSWOWWWWWOWOWWWWWWWWWDWOWWWWW\nOWOWWWWWWWWWWWWWWWWWOOWWWSWOWWDSWWWWOWDWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWOWSWWWWWOWSWWWWWOWOWWWWWWWWWOWOWWWWWOWOWWWWWWWWWOWOWWWWW\nOWDWWWWWWWWWWWWWWWWWWWWWWWWWDWOWWWWWDWSWWWWWWWWWWWWWOOOWWOWOWOWOWOWOWOWOSOOOWOWOSDOOWOWDOOWOWOOOWOWOOSOOWOWSOOWOWOOOWOWOOOOOWWWO\nDWOWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWSWDWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWWWWWWOWOWWWWWOWOWWWWWWWWWOWOWWWWWOWDWWWWW\nOWOWWWWWWWWWWWWWWOOWWOWOWOWOOOOOWOWODOOOWDWOWDWDWDWDOWODWWWWWWWWWOWWWOOOOOWOWOWOOOOOWOWOWOWOOOWOWOWOODWOWOODWSWOOOOSWOWODWOOWWWW\nOWOWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWOWOWWWWWWWWWWWWWOOWWWWOOWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWWOWOWWWWW\nOWDWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWWOWOWWWWW\nDWOWWWWWWWOWWWWWOWOWWWWWWWWWOWOWWWWWOWDWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWWOWOWWWWW\nOWDWWWWWOWOWWWWWOWOWWWWWWWWWOWOWWWWWDWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOOOWWOWOWOWOOOOOWDWOWOWDWOWOWDWOWOWDOSOOWOWSOSOOWSWSOOOSWWWO\nDWOWWWWWOWOWWWWWOOSWWOWOWOWOOOWOWDWOOOODWWWOWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWWOWOWWWWW\nODOWWOWDOSOOWOWSSWOOWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOOOWWOWOOOWOWWDO\nOWOWWWWWOWOWWWWWOWOWWWWWWWWWWWWWWWWWOWDWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWWWWWWDWOW\nOWOWWWWWOWOWWWWWOWOWWWWWWWWWWWWWWWWWDWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOOOWWOWOWOWOOOWOWDWOWOWDWSWOWSWSWOWSOOOOWOWOOOOOWOWOWOWOOWOO\nOWOWWWWWOWOWWWWWOWOWWWWWWWWWWWWWWWWWOOOWWOWOWOWOWOOOWOWOOOWOWOWOWOWOOWOOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWSWWWWWOWOWWWWWWWWWOWOW\nOWOWWWWWOWSWWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWOODWWOWOWDOOWOWDWOWOWSWOWDOSWOWDWDWOSDODWDWDOOODWDWOWDWDOWSD\nOODWWSWOSOSSWOWOOOOOWOWOWOWOWSWOWSWSOWOSWWWWWWWWOWOWWWWWWWWWWWWWWWWWDWOWWWWWOWOWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWOWDWWWWWWWWWSWOW\nDWOWWWWWSWOWWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOODWWOWOWOWOWDWOWOWDOOOOWOWOOWWOWWWWWWWWWWWWOWOWWWWWWWWWOOWWWDWODOODWOWOWSWOOWOS\nOOOWWDWOOWDDWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWDWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWOWDWWWWWWWWWOWDW\nOWOWWWWWDWOWWWWWOOWWWOWOWSWOWSDSWOWSOWWOWWWWWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWDWSWWWWWWWWWDWDW\nOWOWWWWWOWOWWWWWWWWWWWWWWWWWDWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWSOWWWWOOWWWWDWOW\nOWOWWWWWOWOWWWWWWWWWWWWWWWWWOWDWWWWWWWWWWWWWWWWWOOOWWSWOWOWSWOWOWOWOOODOWOWOWOWOWOWOWWOOWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWDW\nOOOWWOWOOOOOWOWOWOWOWOWOWOWODOOOWOWOWOWOWWOOWWWWOWOWWWWWWWWWWWWWWWWWDWOWWWWWWWWWWWWWOWSWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWDWOW\nOWOWWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOODWWSWOOWWSWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWSWDWWWWWOWDWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWDW\nOOOWWOWOOOOOWSWOWOWSWOWOWOWOOODOWOWOWDWODWODWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWDWSWWWWWDWOWWWWWWWWWWOOWWOWOWDWOOODDWOWODWOO\nOWOWWWWWOWOWWWWWWWWWWWWWWWWWDWOWWWWWWWWWODWWWSWDWOWSWOWOWOWOWOWOWOWOOOOOWOWOWDWOWOWDSWOOWWWWOWDWWWWWWWWWOWOWWWWWWWWWDWOWWWWWOWOW\nOWOWWWWWOWOWWWWWWWWWWWWWWWWWOWDWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWOWOWWWWWDWOWWWWWWWWWOWOWWWWWWWWWOOOWWOWOOWOO\nOOWWWOWOOOWOWOWOWOWOWDWOWOWDDOWOWOWOWOWOWDWOWOWDWSWOWDWSWSWDWOWSWOWOODWOWOWDWOWOWOWOOOWOWOWOOSWOWDWSWOWDOOWOWSWOWDWSOWWDWWWWOWWW\n';
var _user$project$Maze$mazeData0 = '\nWOOWWOWOWOWOWOWOWDWOWOWDWWDOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWWWWWWWWWWWWWWWWWWWOWWWWWWWWWWWWWWWWWWWWWWDOWWOWDWWOO\nOWOWWWWWWWWWWWWWWWWWWWWWDWOWWWWWWDDWWOWDWOWOWOWOWSWOWDWSWOWDWSOOWOWSWOWOOOSOWOWOWOOOWOWOWOWOOODOWOWOWOWOWOWOWOWOWOWOOWDOWWWWOWOW\nOWOWWWWWWODWWOWOWWSOWWWWOWOWWWWWDWOWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWSWOWWWWWOWOWWWWWWWWWDWOWWWWWWWWWWWWWWWWWWWWWDWOWWWWWOWOW\nOWOWWWWWDWOWWWWWSOOWWSWOOOOSWOWOOWWOWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWOWOWWWWWWWWWOSOWWOWSWDWOWOWDWOWOWOWOOODOWOWOOWOO\nOOOWWOWOOOOOWOWOOWOOWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWOOWWWOWOWOWOOWOOWWWWWWWWWWWWWWWWWWWWDWOWWWWWOWOW\nOWOWWWWWOWOWWWWWOWOWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWSWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOOOWWOWOOWOO\nOOOWWOWOOWWOWWWWOWOWWWWWOOSWWOWOWOSOWOWOWOWOWSWOWDWSWOWDWOWOOWOOWWWWWWWWSOOWWOWOWWDOWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWOW\nOWOWWWWWWWWWWWWWOWOWWWWWSWOWWWWWSWOWWWWWWWWWWWWWWWWWWWWWWWWWOWDWWWWWWWWWOWOWWWWWDWSWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWSW\nOWSWWWWWWWWWWWWWOWOWWWWWOWOWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWDWOWWWWWWWWWOWDWWWWWSWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWODOWWOWDSWSO\nSWOWWWWWWWWWWWWWOWOWWWWWOWOWWWWWOWOWWWWWWWWWWWSWWWWWWWWWWWWWOOWWWOWOWSWODOOSWOWOOOOOWDWOWOWDOOOOWOWOWOWOWOWOWOWOWOOOOWWOWWWWSWSW\nOWDWWWWWWWWWWWWWOWOWWWWWOWOWWWWWOWDWWWWWWWWWSWOWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWSWOW\nDWOWWWWWWWWWWWWWOWSWWWWWOWOWWWWWDWDWWWWWWWWWOWOWWWWWWWWWWWWWWODWWDWOWOWDOWWOWWWWOWOWWWWWWWWWOOOWWOWOWOWOWSWOWDWSOOSDWDWOWOWDOWDO\nOOOWWOWOWSWOWOWSSOOOWOWOOOWOWDWODOWDWOOOWOWOOOOOWSWOWWWSWWWWDWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWSWOWWWWWWWWWDWOW\nOWDWWWWWWWWWWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWWWWWWWWWWOOOWWOWOWDDOWOWDWOWOOOWOWDOOWOWDOOOOWOWOWSWOWSWSWSWSOODSWWWOWWWWOWOW\nDWSWWWWWWWWWWWWWOWOWWWWWWWWWWWDWWWWWOWOWWWWWOWOWWWWWWWWWWWWWOWDWWWWWDWOWWWWWWWWWWWWWOWDWWWWWOWOWWWWWWWWWWWWWWWWWDWDWWWWWWWWWOWOW\nSOWWWOSOWOWOWOWOOWOOWWWWWWWWDWOWWWWWOWOWWWWWOWOWWWWWWWWWWWWWDWSWWWWWOOOWWOWOWSWOWOOSDWWOWWWWOWOWWWWWWWWWWWOWWWWWDWOWWWWWWWWWOWDW\nWWWWSWOWWWWWWWWWOWDWWWWWWWWWOWOWWWWWOWDWWWWWOWOWWWWWWWWWWWWWSWDWWWWWOWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWOWSWWWWWWWWWDWOW\nWWWWOWOWWWWWWWWWDODWWDWOWOWDOOOOWOWODOWOWDOOOWWDWWWWWWWWWWWWDWOWWWWWOWOWWWWWWWWWOWOWWWWWWWWWOOWWWOWOWOWOOWOOWWWWSWOWWWWWWWWWOWOW\nWWWWOWOWWWWWWWWWDWOWWWWWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWOWDWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWSWWWWWOWOWWWWWWWWWOWOW\nWWWWOODWWOWOWDWOOOODWOWOWOWOOWDOWWWWWWWWOWOWWWWWWWWWWWWWWWWWDWOWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWSWOWWWWWOWOWWWWWWWWWOWOW\nWWWWDWOWWWWWWWWWOWOWWWWWWWWWDSOWWOWSWSWOOSOSWDWSWOODWOWOWOWOOOOOWOWOOOOOWOWOWOWOOOOOWOWOWOWOWOWOWOWOWOWOOOOOWSWOOOOSWOWOWDWOOWWD\nWWWWOODWWOWOWOWOOSWOWOOSWOWOOWOOWWWWWWWWOWOWWWWWOWDWWWWWWWWWOWOWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWWWWWWWWWW\nWWWWDWDWWWWWWWWWWWWWOWOWWWWWOWDWWWWWWWWWOWOWWWWWDWSWWWWWWWWWOWOWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWWWWWWWWWW\nWOWWDOOOWOWOWOWOWOWOOODOWDWODOODWDWOWOWDOWWOWWWWSWOWWWWWWWWWOOOWWOWOODOOWOWDWOWOOOOOWOWOWDWOWOWDWOWOWOWOOOOOWOWOODSOWOWDWWOOWWWW\nWWWWOWOWWWWWWWWWWWWWDWOWWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWOWDWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWOWOWWWWWSWOWWWWWOWOWWWWW\nWWWWOWOWWWWWWWWWWWWWOWOWWWWWOWOWWWWWWWWWWWWWWWWWOWOWWWWWWWWWDWOWWWWWOWOWWWWWWWWWODOWWOWDWOWOWDWOWOWDWOWOOWWOWWWWOWOWWWWWOWOWWWWW\nWOSWOOWOWOWOWOWOWOWOOOOOWOWOOWDOWWWWWWWWWWWWWWWWOWDWWWWWWWWWOOOWWDWOOOODWOWOWOWOOWOOWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWW\nSWOWWWWWWWWWWWWWWWWWOWOWWWWWDOOWWOWOWOWOWOWOWDWODWWDWWWWWWWWOWOWWWWWOWOWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWOWWWWW\nOOOWWOWOWOWOWSWOWDWSOWODWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWOWSWWWWWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOOOWWOWOOWWOWWWW\nOWOWWWWWWWWWWWWWWWWWOWOWWWWWODOWWOWDWDWOWOWDWOWOWOWOWOWOWOWOOOWOWSWOSWOSWWWWWWWWOWDWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWW\nOWOWWWWWWWWWWWWWWWWWOWSWWWWWOWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWDWOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOWOWWWWWWWWWWWWW\nOOWWWOWOWOWOWOWOWOWOSOWOWOWOOOWOWSWOWOWSWOWOWOWOWDWOWOWDWWWOWWWWWWWWOOWWWOWOWOWOOOWOWSWOWOWSWOWOWOWOWOWOWOWOWOWOOWWOWWWWWWWWWWWW\n';
var _user$project$Maze$Room = F6(
	function (a, b, c, d, e, f) {
		return {north: a, east: b, south: c, west: d, floor: e, ceiling: f};
	});
var _user$project$Maze$Ladder = {ctor: 'Ladder'};
var _user$project$Maze$MagicDoor = {ctor: 'MagicDoor'};
var _user$project$Maze$Door = {ctor: 'Door'};
var _user$project$Maze$Open = {ctor: 'Open'};
var _user$project$Maze$holeData0 = {
	ctor: '::',
	_0: {x: 23, y: 0, feature: _user$project$Maze$Ladder},
	_1: {
		ctor: '::',
		_0: {x: 4, y: 15, feature: _user$project$Maze$Open},
		_1: {
			ctor: '::',
			_0: {x: 17, y: 20, feature: _user$project$Maze$Open},
			_1: {
				ctor: '::',
				_0: {x: 30, y: 28, feature: _user$project$Maze$Ladder},
				_1: {ctor: '[]'}
			}
		}
	}
};
var _user$project$Maze$holeData1 = {
	ctor: '::',
	_0: {x: 3, y: 2, feature: _user$project$Maze$Ladder},
	_1: {
		ctor: '::',
		_0: {x: 31, y: 3, feature: _user$project$Maze$Open},
		_1: {
			ctor: '::',
			_0: {x: 20, y: 19, feature: _user$project$Maze$Open},
			_1: {
				ctor: '::',
				_0: {x: 0, y: 31, feature: _user$project$Maze$Open},
				_1: {ctor: '[]'}
			}
		}
	}
};
var _user$project$Maze$holeData2 = {
	ctor: '::',
	_0: {x: 31, y: 0, feature: _user$project$Maze$Open},
	_1: {
		ctor: '::',
		_0: {x: 0, y: 5, feature: _user$project$Maze$Open},
		_1: {
			ctor: '::',
			_0: {x: 28, y: 22, feature: _user$project$Maze$Open},
			_1: {
				ctor: '::',
				_0: {x: 16, y: 31, feature: _user$project$Maze$Open},
				_1: {ctor: '[]'}
			}
		}
	}
};
var _user$project$Maze$level = function (lvl) {
	level:
	while (true) {
		var _p0 = lvl;
		switch (_p0) {
			case 0:
				return {
					maze: _user$project$Maze$mazeData0,
					floor: _user$project$Maze$holeData0,
					ceiling: {ctor: '[]'}
				};
			case 1:
				return {maze: _user$project$Maze$mazeData1, floor: _user$project$Maze$holeData1, ceiling: _user$project$Maze$holeData0};
			case 2:
				return {
					maze: _user$project$Maze$mazeData2,
					floor: {ctor: '[]'},
					ceiling: _user$project$Maze$holeData1
				};
			case 3:
				return {
					maze: _user$project$Maze$mazeData3,
					floor: _user$project$Maze$holeData2,
					ceiling: {ctor: '[]'}
				};
			case 4:
				return {
					maze: _user$project$Maze$mazeData4,
					floor: {ctor: '[]'},
					ceiling: _user$project$Maze$holeData2
				};
			default:
				var _v1 = 0;
				lvl = _v1;
				continue level;
		}
	}
};
var _user$project$Maze$Solid = {ctor: 'Solid'};
var _user$project$Maze$dictLetter2Feature = _elm_lang$core$Dict$fromList(
	{
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: 'W', _1: _user$project$Maze$Solid},
		_1: {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: 'D', _1: _user$project$Maze$Door},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'O', _1: _user$project$Maze$Open},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'S', _1: _user$project$Maze$MagicDoor},
					_1: {ctor: '[]'}
				}
			}
		}
	});
var _user$project$Maze$getFeature = F4(
	function (level, x, y, features) {
		var matchPosition = function (e) {
			return _elm_lang$core$Native_Utils.eq(
				{ctor: '_Tuple2', _0: e.x, _1: e.y},
				{ctor: '_Tuple2', _0: x, _1: y});
		};
		var feature = A2(
			_elm_lang$core$List$map,
			function (_) {
				return _.feature;
			},
			A2(_elm_lang$core$List$filter, matchPosition, features));
		return A2(
			_elm_lang$core$Maybe$withDefault,
			_user$project$Maze$Solid,
			_elm_lang$core$List$head(feature));
	});
var _user$project$Maze$getRoom = F3(
	function (lvl, x, y) {
		var lookup = F2(
			function (str, pos) {
				return A2(
					_elm_lang$core$Maybe$withDefault,
					_user$project$Maze$Solid,
					A2(
						_elm_lang$core$Dict$get,
						A3(_elm_lang$core$String$slice, pos, pos + 1, str),
						_user$project$Maze$dictLetter2Feature));
			});
		var i = (((y * 32) + x) * 4) + (1 + y);
		var room = A3(
			_elm_lang$core$String$slice,
			i,
			i + 4,
			_user$project$Maze$level(lvl).maze);
		return {
			north: A2(lookup, room, 0),
			east: A2(lookup, room, 1),
			south: A2(lookup, room, 2),
			west: A2(lookup, room, 3),
			floor: A4(
				_user$project$Maze$getFeature,
				lvl,
				x,
				y,
				_user$project$Maze$level(lvl).floor),
			ceiling: A4(
				_user$project$Maze$getFeature,
				lvl,
				x,
				y,
				_user$project$Maze$level(lvl).ceiling)
		};
	});

var _user$project$SoundPort$playSound = _elm_lang$core$Native_Platform.outgoingPort(
	'playSound',
	function (v) {
		return {url: v.url, volume: v.volume};
	});
var _user$project$SoundPort$Sound = F2(
	function (a, b) {
		return {url: a, volume: b};
	});

var _user$project$Thing$serializeThing = function (x) {
	var _p0 = x;
	switch (_p0.ctor) {
		case 'Error':
			return 'Error';
		case 'Shield':
			return 'Shield';
		case 'Torch':
			return 'Torch';
		case 'Sword':
			return 'Sword';
		case 'Flask':
			return 'Flask';
		case 'Ring':
			return 'Ring';
		case 'Scroll':
			return 'Scroll';
		case 'Empty':
			return 'Empty';
		case 'LeatherShield':
			return 'LeatherShield';
		case 'BronzeShield':
			return 'BronzeShield';
		case 'MithrilShield':
			return 'MithrilShield';
		case 'GiantShield':
			return 'GiantShield';
		case 'WoodenSword':
			return 'WoodenSword';
		case 'IronSword':
			return 'IronSword';
		case 'ElvishSword':
			return 'ElvishSword';
		case 'DeadTorch':
			return 'DeadTorch';
		case 'PineTorch':
			return 'PineTorch';
		case 'LunarTorch':
			return 'LunarTorch';
		case 'SolarTorch':
			return 'SolarTorch';
		case 'EmptyFlask':
			return 'EmptyFlask';
		case 'HaleFlask':
			return 'HaleFlask';
		case 'AbyeFlask':
			return 'AbyeFlask';
		case 'ThewsFlask':
			return 'ThewsFlask';
		case 'GoldRing':
			return 'GoldRing';
		case 'VulcanRing':
			return 'VulcanRing';
		case 'FireRing':
			return 'FireRing';
		case 'SupremeRing':
			return 'SupremeRing';
		case 'FinalRing':
			return 'FinalRing';
		case 'JouleRing':
			return 'JouleRing';
		case 'RimeRing':
			return 'RimeRing';
		case 'EnergyRing':
			return 'EnergyRing';
		case 'IceRing':
			return 'IceRing';
		case 'VisionScroll':
			return 'VisionScroll';
		case 'SeerScroll':
			return 'SeerScroll';
		case 'LeftWall':
			return 'LeftWall';
		case 'LeftOpen':
			return 'LeftOpen';
		case 'LeftDoor':
			return 'LeftDoor';
		case 'LeftMagicDoor':
			return 'LeftMagicDoor';
		case 'RightWall':
			return 'RightWall';
		case 'RightOpen':
			return 'RightOpen';
		case 'RightDoor':
			return 'RightDoor';
		case 'RightMagicDoor':
			return 'RightMagicDoor';
		case 'FrontWall':
			return 'FrontWall';
		case 'FrontOpen':
			return 'FrontOpen';
		case 'FrontDoor':
			return 'FrontDoor';
		case 'FrontMagicDoor':
			return 'FrontMagicDoor';
		case 'LadderCeiling':
			return 'LadderCeiling';
		case 'BackWall':
			return 'BackWall';
		case 'BackOpen':
			return 'BackOpen';
		case 'BackDoor':
			return 'BackDoor';
		case 'BackMagicDoor':
			return 'BackMagicDoor';
		case 'LadderFloor':
			return 'LadderFloor';
		case 'HoleFloor':
			return 'HoleFloor';
		case 'HoleCeiling':
			return 'HoleCeiling';
		case 'Ceiling':
			return 'Ceiling';
		case 'Floor':
			return 'Floor';
		case 'CreatureLeft':
			return 'CreatureLeft';
		case 'CreatureRight':
			return 'CreatureRight';
		case 'Spider':
			return 'Spider';
		case 'Viper':
			return 'Viper';
		case 'ClubGiant':
			return 'ClubGiant';
		case 'Blob':
			return 'Blob';
		case 'HatchetGiant':
			return 'HatchetGiant';
		case 'Knight':
			return 'Knight';
		case 'ShieldKnight':
			return 'ShieldKnight';
		case 'Scorpion':
			return 'Scorpion';
		case 'Demon':
			return 'Demon';
		case 'Wraith':
			return 'Wraith';
		case 'Galdrog':
			return 'Galdrog';
		case 'MoonWizard':
			return 'MoonWizard';
		case 'StarWizard':
			return 'StarWizard';
		case 'Border':
			return 'Border';
		case 'Heart':
			return 'Heart';
		case 'CreatureDied':
			return 'CreatureDied';
		case 'CreatureHitPlayer':
			return 'CreatureHitPlayer';
		case 'PlayerHitCreature':
			return 'PlayerHitCreature';
		case 'PlayerHitWall':
			return 'PlayerHitWall';
		case 'WizardFadeBuzz':
			return 'WizardFadeBuzz';
		default:
			return 'WizardFadeCrash';
	}
};
var _user$project$Thing$WizardFadeCrash = {ctor: 'WizardFadeCrash'};
var _user$project$Thing$WizardFadeBuzz = {ctor: 'WizardFadeBuzz'};
var _user$project$Thing$PlayerHitWall = {ctor: 'PlayerHitWall'};
var _user$project$Thing$PlayerHitCreature = {ctor: 'PlayerHitCreature'};
var _user$project$Thing$CreatureHitPlayer = {ctor: 'CreatureHitPlayer'};
var _user$project$Thing$CreatureDied = {ctor: 'CreatureDied'};
var _user$project$Thing$Heart = {ctor: 'Heart'};
var _user$project$Thing$Border = {ctor: 'Border'};
var _user$project$Thing$StarWizard = {ctor: 'StarWizard'};
var _user$project$Thing$MoonWizard = {ctor: 'MoonWizard'};
var _user$project$Thing$Galdrog = {ctor: 'Galdrog'};
var _user$project$Thing$Wraith = {ctor: 'Wraith'};
var _user$project$Thing$Demon = {ctor: 'Demon'};
var _user$project$Thing$Scorpion = {ctor: 'Scorpion'};
var _user$project$Thing$ShieldKnight = {ctor: 'ShieldKnight'};
var _user$project$Thing$Knight = {ctor: 'Knight'};
var _user$project$Thing$HatchetGiant = {ctor: 'HatchetGiant'};
var _user$project$Thing$Blob = {ctor: 'Blob'};
var _user$project$Thing$ClubGiant = {ctor: 'ClubGiant'};
var _user$project$Thing$Viper = {ctor: 'Viper'};
var _user$project$Thing$Spider = {ctor: 'Spider'};
var _user$project$Thing$CreatureRight = {ctor: 'CreatureRight'};
var _user$project$Thing$CreatureLeft = {ctor: 'CreatureLeft'};
var _user$project$Thing$Floor = {ctor: 'Floor'};
var _user$project$Thing$Ceiling = {ctor: 'Ceiling'};
var _user$project$Thing$HoleCeiling = {ctor: 'HoleCeiling'};
var _user$project$Thing$HoleFloor = {ctor: 'HoleFloor'};
var _user$project$Thing$LadderFloor = {ctor: 'LadderFloor'};
var _user$project$Thing$BackMagicDoor = {ctor: 'BackMagicDoor'};
var _user$project$Thing$BackDoor = {ctor: 'BackDoor'};
var _user$project$Thing$BackOpen = {ctor: 'BackOpen'};
var _user$project$Thing$BackWall = {ctor: 'BackWall'};
var _user$project$Thing$LadderCeiling = {ctor: 'LadderCeiling'};
var _user$project$Thing$FrontMagicDoor = {ctor: 'FrontMagicDoor'};
var _user$project$Thing$FrontDoor = {ctor: 'FrontDoor'};
var _user$project$Thing$FrontOpen = {ctor: 'FrontOpen'};
var _user$project$Thing$FrontWall = {ctor: 'FrontWall'};
var _user$project$Thing$RightMagicDoor = {ctor: 'RightMagicDoor'};
var _user$project$Thing$RightDoor = {ctor: 'RightDoor'};
var _user$project$Thing$RightOpen = {ctor: 'RightOpen'};
var _user$project$Thing$RightWall = {ctor: 'RightWall'};
var _user$project$Thing$LeftMagicDoor = {ctor: 'LeftMagicDoor'};
var _user$project$Thing$LeftDoor = {ctor: 'LeftDoor'};
var _user$project$Thing$LeftOpen = {ctor: 'LeftOpen'};
var _user$project$Thing$LeftWall = {ctor: 'LeftWall'};
var _user$project$Thing$SeerScroll = {ctor: 'SeerScroll'};
var _user$project$Thing$VisionScroll = {ctor: 'VisionScroll'};
var _user$project$Thing$IceRing = {ctor: 'IceRing'};
var _user$project$Thing$RimeRing = {ctor: 'RimeRing'};
var _user$project$Thing$EnergyRing = {ctor: 'EnergyRing'};
var _user$project$Thing$JouleRing = {ctor: 'JouleRing'};
var _user$project$Thing$FinalRing = {ctor: 'FinalRing'};
var _user$project$Thing$SupremeRing = {ctor: 'SupremeRing'};
var _user$project$Thing$FireRing = {ctor: 'FireRing'};
var _user$project$Thing$VulcanRing = {ctor: 'VulcanRing'};
var _user$project$Thing$GoldRing = {ctor: 'GoldRing'};
var _user$project$Thing$ThewsFlask = {ctor: 'ThewsFlask'};
var _user$project$Thing$AbyeFlask = {ctor: 'AbyeFlask'};
var _user$project$Thing$HaleFlask = {ctor: 'HaleFlask'};
var _user$project$Thing$EmptyFlask = {ctor: 'EmptyFlask'};
var _user$project$Thing$SolarTorch = {ctor: 'SolarTorch'};
var _user$project$Thing$LunarTorch = {ctor: 'LunarTorch'};
var _user$project$Thing$PineTorch = {ctor: 'PineTorch'};
var _user$project$Thing$DeadTorch = {ctor: 'DeadTorch'};
var _user$project$Thing$ElvishSword = {ctor: 'ElvishSword'};
var _user$project$Thing$IronSword = {ctor: 'IronSword'};
var _user$project$Thing$WoodenSword = {ctor: 'WoodenSword'};
var _user$project$Thing$GiantShield = {ctor: 'GiantShield'};
var _user$project$Thing$MithrilShield = {ctor: 'MithrilShield'};
var _user$project$Thing$BronzeShield = {ctor: 'BronzeShield'};
var _user$project$Thing$LeatherShield = {ctor: 'LeatherShield'};
var _user$project$Thing$Empty = {ctor: 'Empty'};
var _user$project$Thing$Scroll = {ctor: 'Scroll'};
var _user$project$Thing$Ring = {ctor: 'Ring'};
var _user$project$Thing$Flask = {ctor: 'Flask'};
var _user$project$Thing$Sword = {ctor: 'Sword'};
var _user$project$Thing$Torch = {ctor: 'Torch'};
var _user$project$Thing$Shield = {ctor: 'Shield'};
var _user$project$Thing$Error = {ctor: 'Error'};
var _user$project$Thing$deserializeThing = function (x) {
	var dict = _elm_lang$core$Dict$fromList(
		{
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: 'Error', _1: _user$project$Thing$Error},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'Shield', _1: _user$project$Thing$Shield},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'Torch', _1: _user$project$Thing$Torch},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'Sword', _1: _user$project$Thing$Sword},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'Flask', _1: _user$project$Thing$Flask},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'Ring', _1: _user$project$Thing$Ring},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'Scroll', _1: _user$project$Thing$Scroll},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'Empty', _1: _user$project$Thing$Empty},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'LeatherShield', _1: _user$project$Thing$LeatherShield},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'BronzeShield', _1: _user$project$Thing$BronzeShield},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'MithrilShield', _1: _user$project$Thing$MithrilShield},
													_1: {
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'GiantShield', _1: _user$project$Thing$GiantShield},
														_1: {
															ctor: '::',
															_0: {ctor: '_Tuple2', _0: 'WoodenSword', _1: _user$project$Thing$WoodenSword},
															_1: {
																ctor: '::',
																_0: {ctor: '_Tuple2', _0: 'IronSword', _1: _user$project$Thing$IronSword},
																_1: {
																	ctor: '::',
																	_0: {ctor: '_Tuple2', _0: 'ElvishSword', _1: _user$project$Thing$ElvishSword},
																	_1: {
																		ctor: '::',
																		_0: {ctor: '_Tuple2', _0: 'DeadTorch', _1: _user$project$Thing$DeadTorch},
																		_1: {
																			ctor: '::',
																			_0: {ctor: '_Tuple2', _0: 'PineTorch', _1: _user$project$Thing$PineTorch},
																			_1: {
																				ctor: '::',
																				_0: {ctor: '_Tuple2', _0: 'LunarTorch', _1: _user$project$Thing$LunarTorch},
																				_1: {
																					ctor: '::',
																					_0: {ctor: '_Tuple2', _0: 'SolarTorch', _1: _user$project$Thing$SolarTorch},
																					_1: {
																						ctor: '::',
																						_0: {ctor: '_Tuple2', _0: 'EmptyFlask', _1: _user$project$Thing$EmptyFlask},
																						_1: {
																							ctor: '::',
																							_0: {ctor: '_Tuple2', _0: 'HaleFlask', _1: _user$project$Thing$HaleFlask},
																							_1: {
																								ctor: '::',
																								_0: {ctor: '_Tuple2', _0: 'AbyeFlask', _1: _user$project$Thing$AbyeFlask},
																								_1: {
																									ctor: '::',
																									_0: {ctor: '_Tuple2', _0: 'ThewsFlask', _1: _user$project$Thing$ThewsFlask},
																									_1: {
																										ctor: '::',
																										_0: {ctor: '_Tuple2', _0: 'GoldRing', _1: _user$project$Thing$GoldRing},
																										_1: {
																											ctor: '::',
																											_0: {ctor: '_Tuple2', _0: 'VulcanRing', _1: _user$project$Thing$VulcanRing},
																											_1: {
																												ctor: '::',
																												_0: {ctor: '_Tuple2', _0: 'FireRing', _1: _user$project$Thing$FireRing},
																												_1: {
																													ctor: '::',
																													_0: {ctor: '_Tuple2', _0: 'SupremeRing', _1: _user$project$Thing$SupremeRing},
																													_1: {
																														ctor: '::',
																														_0: {ctor: '_Tuple2', _0: 'FinalRing', _1: _user$project$Thing$FinalRing},
																														_1: {
																															ctor: '::',
																															_0: {ctor: '_Tuple2', _0: 'JouleRing', _1: _user$project$Thing$JouleRing},
																															_1: {
																																ctor: '::',
																																_0: {ctor: '_Tuple2', _0: 'RimeRing', _1: _user$project$Thing$RimeRing},
																																_1: {
																																	ctor: '::',
																																	_0: {ctor: '_Tuple2', _0: 'EnergyRing', _1: _user$project$Thing$EnergyRing},
																																	_1: {
																																		ctor: '::',
																																		_0: {ctor: '_Tuple2', _0: 'IceRing', _1: _user$project$Thing$IceRing},
																																		_1: {
																																			ctor: '::',
																																			_0: {ctor: '_Tuple2', _0: 'VisionScroll', _1: _user$project$Thing$VisionScroll},
																																			_1: {
																																				ctor: '::',
																																				_0: {ctor: '_Tuple2', _0: 'SeerScroll', _1: _user$project$Thing$SeerScroll},
																																				_1: {
																																					ctor: '::',
																																					_0: {ctor: '_Tuple2', _0: 'LeftWall', _1: _user$project$Thing$LeftWall},
																																					_1: {
																																						ctor: '::',
																																						_0: {ctor: '_Tuple2', _0: 'LeftOpen', _1: _user$project$Thing$LeftOpen},
																																						_1: {
																																							ctor: '::',
																																							_0: {ctor: '_Tuple2', _0: 'LeftDoor', _1: _user$project$Thing$LeftDoor},
																																							_1: {
																																								ctor: '::',
																																								_0: {ctor: '_Tuple2', _0: 'LeftMagicDoor', _1: _user$project$Thing$LeftMagicDoor},
																																								_1: {
																																									ctor: '::',
																																									_0: {ctor: '_Tuple2', _0: 'RightWall', _1: _user$project$Thing$RightWall},
																																									_1: {
																																										ctor: '::',
																																										_0: {ctor: '_Tuple2', _0: 'RightOpen', _1: _user$project$Thing$RightOpen},
																																										_1: {
																																											ctor: '::',
																																											_0: {ctor: '_Tuple2', _0: 'RightDoor', _1: _user$project$Thing$RightDoor},
																																											_1: {
																																												ctor: '::',
																																												_0: {ctor: '_Tuple2', _0: 'RightMagicDoor', _1: _user$project$Thing$RightMagicDoor},
																																												_1: {
																																													ctor: '::',
																																													_0: {ctor: '_Tuple2', _0: 'FrontWall', _1: _user$project$Thing$FrontWall},
																																													_1: {
																																														ctor: '::',
																																														_0: {ctor: '_Tuple2', _0: 'FrontOpen', _1: _user$project$Thing$FrontOpen},
																																														_1: {
																																															ctor: '::',
																																															_0: {ctor: '_Tuple2', _0: 'FrontDoor', _1: _user$project$Thing$FrontDoor},
																																															_1: {
																																																ctor: '::',
																																																_0: {ctor: '_Tuple2', _0: 'FrontMagicDoor', _1: _user$project$Thing$FrontMagicDoor},
																																																_1: {
																																																	ctor: '::',
																																																	_0: {ctor: '_Tuple2', _0: 'LadderCeiling', _1: _user$project$Thing$LadderCeiling},
																																																	_1: {
																																																		ctor: '::',
																																																		_0: {ctor: '_Tuple2', _0: 'BackWall', _1: _user$project$Thing$BackWall},
																																																		_1: {
																																																			ctor: '::',
																																																			_0: {ctor: '_Tuple2', _0: 'BackOpen', _1: _user$project$Thing$BackOpen},
																																																			_1: {
																																																				ctor: '::',
																																																				_0: {ctor: '_Tuple2', _0: 'BackDoor', _1: _user$project$Thing$BackDoor},
																																																				_1: {
																																																					ctor: '::',
																																																					_0: {ctor: '_Tuple2', _0: 'BackMagicDoor', _1: _user$project$Thing$BackMagicDoor},
																																																					_1: {
																																																						ctor: '::',
																																																						_0: {ctor: '_Tuple2', _0: 'LadderFloor', _1: _user$project$Thing$LadderFloor},
																																																						_1: {
																																																							ctor: '::',
																																																							_0: {ctor: '_Tuple2', _0: 'HoleFloor', _1: _user$project$Thing$HoleFloor},
																																																							_1: {
																																																								ctor: '::',
																																																								_0: {ctor: '_Tuple2', _0: 'HoleCeiling', _1: _user$project$Thing$HoleCeiling},
																																																								_1: {
																																																									ctor: '::',
																																																									_0: {ctor: '_Tuple2', _0: 'Ceiling', _1: _user$project$Thing$Ceiling},
																																																									_1: {
																																																										ctor: '::',
																																																										_0: {ctor: '_Tuple2', _0: 'Floor', _1: _user$project$Thing$Floor},
																																																										_1: {
																																																											ctor: '::',
																																																											_0: {ctor: '_Tuple2', _0: 'CreatureLeft', _1: _user$project$Thing$CreatureLeft},
																																																											_1: {
																																																												ctor: '::',
																																																												_0: {ctor: '_Tuple2', _0: 'CreatureRight', _1: _user$project$Thing$CreatureRight},
																																																												_1: {
																																																													ctor: '::',
																																																													_0: {ctor: '_Tuple2', _0: 'Spider', _1: _user$project$Thing$Spider},
																																																													_1: {
																																																														ctor: '::',
																																																														_0: {ctor: '_Tuple2', _0: 'Viper', _1: _user$project$Thing$Viper},
																																																														_1: {
																																																															ctor: '::',
																																																															_0: {ctor: '_Tuple2', _0: 'ClubGiant', _1: _user$project$Thing$ClubGiant},
																																																															_1: {
																																																																ctor: '::',
																																																																_0: {ctor: '_Tuple2', _0: 'Blob', _1: _user$project$Thing$Blob},
																																																																_1: {
																																																																	ctor: '::',
																																																																	_0: {ctor: '_Tuple2', _0: 'HatchetGiant', _1: _user$project$Thing$HatchetGiant},
																																																																	_1: {
																																																																		ctor: '::',
																																																																		_0: {ctor: '_Tuple2', _0: 'Knight', _1: _user$project$Thing$Knight},
																																																																		_1: {
																																																																			ctor: '::',
																																																																			_0: {ctor: '_Tuple2', _0: 'ShieldKnight', _1: _user$project$Thing$ShieldKnight},
																																																																			_1: {
																																																																				ctor: '::',
																																																																				_0: {ctor: '_Tuple2', _0: 'Scorpion', _1: _user$project$Thing$Scorpion},
																																																																				_1: {
																																																																					ctor: '::',
																																																																					_0: {ctor: '_Tuple2', _0: 'Demon', _1: _user$project$Thing$Demon},
																																																																					_1: {
																																																																						ctor: '::',
																																																																						_0: {ctor: '_Tuple2', _0: 'Wraith', _1: _user$project$Thing$Wraith},
																																																																						_1: {
																																																																							ctor: '::',
																																																																							_0: {ctor: '_Tuple2', _0: 'Galdrog', _1: _user$project$Thing$Galdrog},
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: {ctor: '_Tuple2', _0: 'MoonWizard', _1: _user$project$Thing$MoonWizard},
																																																																								_1: {
																																																																									ctor: '::',
																																																																									_0: {ctor: '_Tuple2', _0: 'StarWizard', _1: _user$project$Thing$StarWizard},
																																																																									_1: {
																																																																										ctor: '::',
																																																																										_0: {ctor: '_Tuple2', _0: 'Border', _1: _user$project$Thing$Border},
																																																																										_1: {
																																																																											ctor: '::',
																																																																											_0: {ctor: '_Tuple2', _0: 'Heart', _1: _user$project$Thing$Heart},
																																																																											_1: {
																																																																												ctor: '::',
																																																																												_0: {ctor: '_Tuple2', _0: 'CreatureDied', _1: _user$project$Thing$CreatureDied},
																																																																												_1: {
																																																																													ctor: '::',
																																																																													_0: {ctor: '_Tuple2', _0: 'CreatureHitPlayer', _1: _user$project$Thing$CreatureHitPlayer},
																																																																													_1: {
																																																																														ctor: '::',
																																																																														_0: {ctor: '_Tuple2', _0: 'PlayerHitCreature', _1: _user$project$Thing$PlayerHitCreature},
																																																																														_1: {
																																																																															ctor: '::',
																																																																															_0: {ctor: '_Tuple2', _0: 'PlayerHitWall', _1: _user$project$Thing$PlayerHitWall},
																																																																															_1: {
																																																																																ctor: '::',
																																																																																_0: {ctor: '_Tuple2', _0: 'WizardFadeBuzz', _1: _user$project$Thing$WizardFadeBuzz},
																																																																																_1: {
																																																																																	ctor: '::',
																																																																																	_0: {ctor: '_Tuple2', _0: 'WizardFadeCrash', _1: _user$project$Thing$WizardFadeCrash},
																																																																																	_1: {ctor: '[]'}
																																																																																}
																																																																															}
																																																																														}
																																																																													}
																																																																												}
																																																																											}
																																																																										}
																																																																									}
																																																																								}
																																																																							}
																																																																						}
																																																																					}
																																																																				}
																																																																			}
																																																																		}
																																																																	}
																																																																}
																																																															}
																																																														}
																																																													}
																																																												}
																																																											}
																																																										}
																																																									}
																																																								}
																																																							}
																																																						}
																																																					}
																																																				}
																																																			}
																																																		}
																																																	}
																																																}
																																															}
																																														}
																																													}
																																												}
																																											}
																																										}
																																									}
																																								}
																																							}
																																						}
																																					}
																																				}
																																			}
																																		}
																																	}
																																}
																															}
																														}
																													}
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		});
	var e = A2(_elm_lang$core$Dict$get, x, dict);
	var _p1 = e;
	if (_p1.ctor === 'Nothing') {
		return _user$project$Thing$Error;
	} else {
		return _p1._0;
	}
};

var _user$project$Main$image = F2(
	function (color, img) {
		var _p0 = img;
		switch (_p0.ctor) {
			case 'Ceiling':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 47 28 L 209 28'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			case 'Border':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 0 0 L 255 0 L 255 151 L 0 151 Z'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			case 'LeftWall':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 27 16 L 64 38 L 64 114 L 27 136'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			case 'RightWall':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 229 16 L 192 38 L 192 114 L 229 136'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			case 'Shield':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 172 134 L 192 128 L 186 122 L 168 128 l -4 6 l 8 0'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			case 'Torch':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 60 118 l 14 -2 l -2 -2 l -12 4'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			case 'Sword':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 80 114 L 100 124'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 82 118 L 86 114'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}
				};
			case 'Flask':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 162 110 l 2 10 l -4 0 l 2 -10'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			case 'Ring':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 60 122 l 2 2 l -2 2 l -2 -2 l 2 -2'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			case 'Scroll':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 194 118 l -2 2 l 8 6 l 2 -2 l -8 -6'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			case 'FrontWall':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 64 38 L 192 38'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 64 114 L 192 114'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}
				};
			case 'LeftOpen':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 27 38 L 64 38 L 64 114 L 27 114'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 27 16 L 64 38'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}
				};
			case 'RightOpen':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 229 38 L 192 38 L 192 114 L 229 114'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 229 16 L 192 38'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}
				};
			case 'FrontOpen':
				return {ctor: '[]'};
			case 'Floor':
				return {ctor: '[]'};
			case 'LeftDoor':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 40 128 L 40 65 L 56 68 L 56 119'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 48 92 L 52 93'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$path,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke(color),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d('M 27 16 L 64 38 L 64 114 L 27 136'),
											_1: {ctor: '[]'}
										}
									}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}
					}
				};
			case 'RightDoor':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 216 128 L 216 65 L 200 68 L 200 119'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 208 92 L 204 93'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$path,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke(color),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d('M 229 16 L 192 38 L 192 114 L 229 136'),
											_1: {ctor: '[]'}
										}
									}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}
					}
				};
			case 'FrontDoor':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 108 114 L 108 67 L 148 67 L 148 114'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 126 94 L 130 94'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$path,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke(color),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d('M 64 38 L 192 38'),
											_1: {ctor: '[]'}
										}
									}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg$path,
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$stroke(color),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$d('M 64 114 L 192 114'),
												_1: {ctor: '[]'}
											}
										}
									},
									{ctor: '[]'}),
								_1: {ctor: '[]'}
							}
						}
					}
				};
			case 'LeftMagicDoor':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 40 128 L 50 66 L 58 117'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			case 'RightMagicDoor':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 216 128 L 206 66 L 198 117'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			case 'FrontMagicDoor':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 108 114 L 128 67 L 148 114'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			case 'CreatureLeft':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 28 100 l 8 8 l -4 4 l 4 8 l -8 8'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			case 'CreatureRight':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 228 100 l -8 8 l 4 4 l -4 8 l 8 8'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				};
			case 'LadderCeiling':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 116 24 L 116 128'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 140 24 L 140 128'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$path,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke(color),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d('M 116 28 L 140 28'),
											_1: {ctor: '[]'}
										}
									}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg$path,
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$stroke(color),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$d('M 116 40 L 140 40'),
												_1: {ctor: '[]'}
											}
										}
									},
									{ctor: '[]'}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$svg$Svg$path,
										{
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$stroke(color),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$d('M 116 52 L 140 52'),
													_1: {ctor: '[]'}
												}
											}
										},
										{ctor: '[]'}),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$svg$Svg$path,
											{
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$stroke(color),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$d('M 116 64 L 140 64'),
														_1: {ctor: '[]'}
													}
												}
											},
											{ctor: '[]'}),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$svg$Svg$path,
												{
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$stroke(color),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$d('M 116 76 L 140 76'),
															_1: {ctor: '[]'}
														}
													}
												},
												{ctor: '[]'}),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$svg$Svg$path,
													{
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$stroke(color),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
															_1: {
																ctor: '::',
																_0: _elm_lang$svg$Svg_Attributes$d('M 116 88 L 140 88'),
																_1: {ctor: '[]'}
															}
														}
													},
													{ctor: '[]'}),
												_1: {
													ctor: '::',
													_0: A2(
														_elm_lang$svg$Svg$path,
														{
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$stroke(color),
															_1: {
																ctor: '::',
																_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
																_1: {
																	ctor: '::',
																	_0: _elm_lang$svg$Svg_Attributes$d('M 116 100 L 140 100'),
																	_1: {ctor: '[]'}
																}
															}
														},
														{ctor: '[]'}),
													_1: {
														ctor: '::',
														_0: A2(
															_elm_lang$svg$Svg$path,
															{
																ctor: '::',
																_0: _elm_lang$svg$Svg_Attributes$stroke(color),
																_1: {
																	ctor: '::',
																	_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$svg$Svg_Attributes$d('M 116 112 L 140 112'),
																		_1: {ctor: '[]'}
																	}
																}
															},
															{ctor: '[]'}),
														_1: {
															ctor: '::',
															_0: A2(
																_elm_lang$svg$Svg$path,
																{
																	ctor: '::',
																	_0: _elm_lang$svg$Svg_Attributes$stroke(color),
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$svg$Svg_Attributes$d('M 116 123 L 140 123'),
																			_1: {ctor: '[]'}
																		}
																	}
																},
																{ctor: '[]'}),
															_1: {
																ctor: '::',
																_0: A2(
																	_elm_lang$svg$Svg$path,
																	{
																		ctor: '::',
																		_0: _elm_lang$svg$Svg_Attributes$stroke(color),
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
																			_1: {
																				ctor: '::',
																				_0: _elm_lang$svg$Svg_Attributes$d('M 100 34 L 92 24 L 164 24 L 156 34 L 100 34 L 100 24'),
																				_1: {ctor: '[]'}
																			}
																		}
																	},
																	{ctor: '[]'}),
																_1: {
																	ctor: '::',
																	_0: A2(
																		_elm_lang$svg$Svg$path,
																		{
																			ctor: '::',
																			_0: _elm_lang$svg$Svg_Attributes$stroke(color),
																			_1: {
																				ctor: '::',
																				_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
																				_1: {
																					ctor: '::',
																					_0: _elm_lang$svg$Svg_Attributes$d('M 156 34 L 156 24'),
																					_1: {ctor: '[]'}
																				}
																			}
																		},
																		{ctor: '[]'}),
																	_1: {
																		ctor: '::',
																		_0: A2(
																			_elm_lang$svg$Svg$path,
																			{
																				ctor: '::',
																				_0: _elm_lang$svg$Svg_Attributes$stroke(color),
																				_1: {
																					ctor: '::',
																					_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
																					_1: {
																						ctor: '::',
																						_0: _elm_lang$svg$Svg_Attributes$d('M 47 28 L 96 28'),
																						_1: {ctor: '[]'}
																					}
																				}
																			},
																			{ctor: '[]'}),
																		_1: {
																			ctor: '::',
																			_0: A2(
																				_elm_lang$svg$Svg$path,
																				{
																					ctor: '::',
																					_0: _elm_lang$svg$Svg_Attributes$stroke(color),
																					_1: {
																						ctor: '::',
																						_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
																						_1: {
																							ctor: '::',
																							_0: _elm_lang$svg$Svg_Attributes$d('M 161 28 L 210 28'),
																							_1: {ctor: '[]'}
																						}
																					}
																				},
																				{ctor: '[]'}),
																			_1: {ctor: '[]'}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				};
			case 'LadderFloor':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 116 24 L 116 128'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 140 24 L 140 128'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$path,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke(color),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d('M 116 28 L 140 28'),
											_1: {ctor: '[]'}
										}
									}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg$path,
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$stroke(color),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$d('M 116 40 L 140 40'),
												_1: {ctor: '[]'}
											}
										}
									},
									{ctor: '[]'}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$svg$Svg$path,
										{
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$stroke(color),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$d('M 116 52 L 140 52'),
													_1: {ctor: '[]'}
												}
											}
										},
										{ctor: '[]'}),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$svg$Svg$path,
											{
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$stroke(color),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$d('M 116 64 L 140 64'),
														_1: {ctor: '[]'}
													}
												}
											},
											{ctor: '[]'}),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$svg$Svg$path,
												{
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$stroke(color),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$d('M 116 76 L 140 76'),
															_1: {ctor: '[]'}
														}
													}
												},
												{ctor: '[]'}),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$svg$Svg$path,
													{
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$stroke(color),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
															_1: {
																ctor: '::',
																_0: _elm_lang$svg$Svg_Attributes$d('M 116 88 L 140 88'),
																_1: {ctor: '[]'}
															}
														}
													},
													{ctor: '[]'}),
												_1: {
													ctor: '::',
													_0: A2(
														_elm_lang$svg$Svg$path,
														{
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$stroke(color),
															_1: {
																ctor: '::',
																_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
																_1: {
																	ctor: '::',
																	_0: _elm_lang$svg$Svg_Attributes$d('M 116 100 L 140 100'),
																	_1: {ctor: '[]'}
																}
															}
														},
														{ctor: '[]'}),
													_1: {
														ctor: '::',
														_0: A2(
															_elm_lang$svg$Svg$path,
															{
																ctor: '::',
																_0: _elm_lang$svg$Svg_Attributes$stroke(color),
																_1: {
																	ctor: '::',
																	_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$svg$Svg_Attributes$d('M 116 112 L 140 112'),
																		_1: {ctor: '[]'}
																	}
																}
															},
															{ctor: '[]'}),
														_1: {
															ctor: '::',
															_0: A2(
																_elm_lang$svg$Svg$path,
																{
																	ctor: '::',
																	_0: _elm_lang$svg$Svg_Attributes$stroke(color),
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$svg$Svg_Attributes$d('M 116 123 L 140 123'),
																			_1: {ctor: '[]'}
																		}
																	}
																},
																{ctor: '[]'}),
															_1: {
																ctor: '::',
																_0: A2(
																	_elm_lang$svg$Svg$path,
																	{
																		ctor: '::',
																		_0: _elm_lang$svg$Svg_Attributes$stroke(color),
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
																			_1: {
																				ctor: '::',
																				_0: _elm_lang$svg$Svg_Attributes$d('M 100 118 L 92 128 L 164 128 L 156 118 L 100 118 L 100 128'),
																				_1: {ctor: '[]'}
																			}
																		}
																	},
																	{ctor: '[]'}),
																_1: {
																	ctor: '::',
																	_0: A2(
																		_elm_lang$svg$Svg$path,
																		{
																			ctor: '::',
																			_0: _elm_lang$svg$Svg_Attributes$stroke(color),
																			_1: {
																				ctor: '::',
																				_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
																				_1: {
																					ctor: '::',
																					_0: _elm_lang$svg$Svg_Attributes$d('M 156 118 L 156 128'),
																					_1: {ctor: '[]'}
																				}
																			}
																		},
																		{ctor: '[]'}),
																	_1: {
																		ctor: '::',
																		_0: A2(
																			_elm_lang$svg$Svg$path,
																			{
																				ctor: '::',
																				_0: _elm_lang$svg$Svg_Attributes$stroke(color),
																				_1: {
																					ctor: '::',
																					_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
																					_1: {
																						ctor: '::',
																						_0: _elm_lang$svg$Svg_Attributes$d('M 47 28 L 210 28'),
																						_1: {ctor: '[]'}
																					}
																				}
																			},
																			{ctor: '[]'}),
																		_1: {ctor: '[]'}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				};
			case 'HoleCeiling':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 100 34 L 92 24 L 164 24 L 156 34 L 100 34 L 100 24'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 156 34 L 156 24'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$path,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke(color),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d('M 47 28 L 96 28'),
											_1: {ctor: '[]'}
										}
									}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg$path,
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$stroke(color),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$d('M 161 28 L 210 28'),
												_1: {ctor: '[]'}
											}
										}
									},
									{ctor: '[]'}),
								_1: {ctor: '[]'}
							}
						}
					}
				};
			case 'HoleFloor':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 100 118 L 92 128 L 164 128 L 156 118 L 100 118 L 100 128'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 156 118 L 156 128'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$path,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke(color),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d('M 47 28 L 210 28'),
											_1: {ctor: '[]'}
										}
									}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}
					}
				};
			case 'ClubGiant':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 98 104 l 14 -6 l 8 -6 l 8 2 l 4 2 l 0 6 l -6 2 l -6 0 l -6 -2 l -14 4'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 132 102 l 4 0 l 12 10 l 12 10 l 14 2 l -4 -4 l 4 0 l -12 -4 l -10 -10 l -10 -10 l -12 -4 l -12 -4'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$path,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke(color),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d('M 92 78 l 4 -8 l 2 10 l -4 6 l -2 -8 l -8 -2 l 4 8 l 6 2'),
											_1: {ctor: '[]'}
										}
									}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg$path,
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$stroke(color),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$d('M 90 106 l -4 2 l 2 2 l 6 -2 l 4 12 l -14 6 l 4 -4 l -8 0 l 8 -4 l -12 -16 l 4 -4'),
												_1: {ctor: '[]'}
											}
										}
									},
									{ctor: '[]'}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$svg$Svg$path,
										{
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$stroke(color),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$d('M 84 86 l 8 10 l 10 12 l -4 4 l -12 -8 l -12 -10 l 2 -12 l 8 -6 l -4 -4 l 4 2 l 4 -6 l 6 2 l 2 -4 l 0 4 l 12 -2 l 8 4 l 4 14 l -16 10 l -4 -4 l 10 -8 l -4 -10'),
													_1: {ctor: '[]'}
												}
											}
										},
										{ctor: '[]'}),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				};
			case 'HatchetGiant':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 98 104 L 124 94 L 126 96 L 100 106'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 132 102 L 114 92 L 118 102 L 114 110 L 132 102'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$path,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke(color),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d('M 132 102 l 4 0 l 12 10 l 12 10 l 14 2 l -4 -4 l 4 0 l -12 -4 l -10 -10 l -10 -10 l -12 -4 l -12 -4'),
											_1: {ctor: '[]'}
										}
									}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg$path,
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$stroke(color),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$d('M 92 78 l 4 -8 l 2 10 l -4 6 l -2 -8 l -8 -2 l 4 8 l 6 2'),
												_1: {ctor: '[]'}
											}
										}
									},
									{ctor: '[]'}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$svg$Svg$path,
										{
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$stroke(color),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$d('M 90 106 l -4 2 l 2 2 l 6 -2 l 4 12 l -14 6 l 4 -4 l -8 0 l 8 -4 l -12 -16 l 4 -4'),
													_1: {ctor: '[]'}
												}
											}
										},
										{ctor: '[]'}),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$svg$Svg$path,
											{
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$stroke(color),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$d('M 84 86 l 8 10 l 10 12 l -4 4 l -12 -8 l -12 -10 l 2 -12 l 8 -6 l -4 -4 l 4 2 l 4 -6 l 6 2 l 2 -4 l 0 4 l 12 -2 l 8 4 l 4 14 l -16 10 l -4 -4 l 10 -8 l -4 -10'),
														_1: {ctor: '[]'}
													}
												}
											},
											{ctor: '[]'}),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				};
			case 'Galdrog':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 124 80 L 114 94 L 120 110 L 112 132 L 78 104 L 48 132 L 72 68 L 32 84 L 88 22 L 114 52 L 128 92 L 142 52 L 168 22 L 224 88 L 184 68 L 208 132 L 178 112 L 144 132 L 136 110 L 142 94 L 132 80'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 112 132 l 10 -8 l 4 -14 l -4 -10 l 6 -8 l 6 8 l -4 10 l 4 14 l 10 8'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$path,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke(color),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d('M 122 82 l -16 14 l -14 -4 l -6 -16 l -8 -4 l 6 6 l -8 0 l 8 4 l 4 14 l 14 8 l 14 -4'),
											_1: {ctor: '[]'}
										}
									}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg$path,
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$stroke(color),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$d('M 168 22 l -6 4 l 4 -8 l -6 6 l 0 6 l -10 8 l -10 8 l -6 -4 l 4 -10 l -6 -14 l 2 14 l -6 6 l -6 -6 l 2 -14 l -6 14 l 4 10 l 6 12 l 6 -12 l -6 4 l -6 -4 l -6 4 l -10 -8 l -10 -8 l 0 -6 l -6 -6 l 4 8 l -6 -4'),
												_1: {ctor: '[]'}
											}
										}
									},
									{ctor: '[]'}),
								_1: {ctor: '[]'}
							}
						}
					}
				};
			case 'Wraith':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 68 62 L 88 68 L 100 56'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 90 74 L 74 70 l 6 6 l 10 -2 l 10 -2 l 2 -8 l -12 10 l 4 12 l -4 0'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$path,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke(color),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d('M 80 100 l 6 -10 l 14 2 l 8 6 l -10 -4 l -12 0 l -6 6'),
											_1: {ctor: '[]'}
										}
									}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}
					}
				};
			case 'Spider':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 160 124 l 4 -8 l 4 4 l 8 -4 l 8 4 l -8 4 l -8 -4 l 8 0 l 8 0 l 4 -4 l 4 8'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 168 124 l 2 -8 l 2 4 l 4 2 l 4 -2 l 2 -4 l 2 8'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}
				};
			case 'Scorpion':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 74 112 l 0 -4 l -4 -4 l -8 4 l 4 8 l 8 2 l 8 2 l 0 4 l -8 0 l -8 -8 l 4 4 l -8 0 l 4 4'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 90 124 l 0 -4 l -8 0 l -8 4 l 0 4 l 8 0'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}
				};
			case 'Blob':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 130 82 l -16 4 l -6 14 l -2 10 l 0 10 l -10 10 l 10 -2 l -2 4 l 10 -6 l 14 2 l 14 2 l 6 -2 l 4 4 l 2 -4 l 8 2 l -6 -6 l -2 -16 l -6 -16 l -10 -6 l -8 -4'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 130 86 l 6 6 l 2 6 l -10 2 l 2 -14 l -10 6 l -2 10 l 10 -2'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$path,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke(color),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d('M 116 108 L 118 114 L 144 120'),
											_1: {ctor: '[]'}
										}
									}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}
					}
				};
			case 'Knight':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 124 34 l 8 0 l -2 2 l -4 0 l -2 -2'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 142 80 L 136 64 L 146 46 L 156 64 L 140 82 L 136 76 L 146 64 L 140 58'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$path,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke(color),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d('M 140 80 L 152 128 L 160 132 L 144 132 L 144 126 L 130 84'),
											_1: {ctor: '[]'}
										}
									}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg$path,
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$stroke(color),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$d('M 126 84 L 110 126 L 110 132 L 92 132 L 102 128 L 116 80'),
												_1: {ctor: '[]'}
											}
										}
									},
									{ctor: '[]'}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$svg$Svg$path,
										{
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$stroke(color),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$d('M 140 80 l -12 6 l -14 -6 l 6 -16 l -4 -6 l -6 -12 l 12 -4 l 2 -12 l 4 -4 l 4 4 l 2 12 l 12 4 l -12 -4 l 0 4 l -6 6 l -6 -6 l 0 -4'),
													_1: {ctor: '[]'}
												}
											}
										},
										{ctor: '[]'}),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$svg$Svg$path,
											{
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$stroke(color),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$d('M 128 52 L 128 20 l -4 0 l 2 4 l 4 0 l 2 -4 l -4 0'),
														_1: {ctor: '[]'}
													}
												}
											},
											{ctor: '[]'}),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$svg$Svg$path,
												{
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$stroke(color),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$d('M 102 74 l 0 -4 l 4 0 l 0 -6 l -16 0 l 0 6 l 4 0 l 0 4 l 2 0 l 0 6 l 4 0 l 0 -6 l 2 0 l 14 -16'),
															_1: {ctor: '[]'}
														}
													}
												},
												{ctor: '[]'}),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$svg$Svg$path,
													{
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$stroke(color),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
															_1: {
																ctor: '::',
																_0: _elm_lang$svg$Svg_Attributes$d('M 110 46 L 102 64 L 100 64 L 102 30 L 98 20 L 94 30 L 96 64 L 98 64 L 98 20'),
																_1: {ctor: '[]'}
															}
														}
													},
													{ctor: '[]'}),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}
				};
			case 'ShieldKnight':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 126 30 l 0 10 l -2 0 l 0 -4'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 150 44 L 166 52 L 164 76 L 150 92 L 136 76 L 134 52 L 150 44'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$path,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke(color),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d('M 140 80 L 152 128 L 160 132 L 144 132 L 144 126 L 130 84'),
											_1: {ctor: '[]'}
										}
									}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg$path,
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$stroke(color),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$d('M 126 84 L 110 126 L 110 132 L 92 132 L 102 128 L 116 80'),
												_1: {ctor: '[]'}
											}
										}
									},
									{ctor: '[]'}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$svg$Svg$path,
										{
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$stroke(color),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$d('M 140 80 l -12 6 l -14 -6 l 6 -16 l -4 -6 l -6 -12 l 12 -4 l 2 -12 l 4 -4 l 4 4 l 2 12 l 12 4 l -12 -4 l 0 4 l -6 6 l -6 -6 l 0 -4'),
													_1: {ctor: '[]'}
												}
											}
										},
										{ctor: '[]'}),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$svg$Svg$path,
											{
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$stroke(color),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$d('M 128 52 L 128 20 l -4 0 l 2 4 l 4 0 l 2 -4 l -4 0'),
														_1: {ctor: '[]'}
													}
												}
											},
											{ctor: '[]'}),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$svg$Svg$path,
												{
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$stroke(color),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$d('M 102 74 l 0 -4 l 4 0 l 0 -6 l -16 0 l 0 6 l 4 0 l 0 4 l 2 0 l 0 6 l 4 0 l 0 -6 l 2 0 l 14 -16'),
															_1: {ctor: '[]'}
														}
													}
												},
												{ctor: '[]'}),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$svg$Svg$path,
													{
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$stroke(color),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
															_1: {
																ctor: '::',
																_0: _elm_lang$svg$Svg_Attributes$d('M 110 46 L 102 64 L 100 64 L 102 30 L 98 20 L 94 30 L 96 64 L 98 64 L 98 20'),
																_1: {ctor: '[]'}
															}
														}
													},
													{ctor: '[]'}),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}
				};
			case 'MoonWizard':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 98 46 l 2 4 l -2 4 l -6 4 l -6 -2 l -4 -8 l 4 -8 l 4 -2 l 4 2 l -2 0 l -4 2 l -2 6 l 2 4 l 4 2 l 6 -4 l 0 -4'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 154 104 l 2 4 l -2 4 l -6 4 l -6 -2 l -4 -8 l 4 -8 l 4 -2 l 4 2 l -2 0 l -4 2 l -2 6 l 4 4 l 4 2 l 4 -4 l 0 -4'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$path,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke(color),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d('M 124 64 l -4 8 l 0 -8 l -10 14 l -8 -14 l 8 -6 l 8 -4 l 2 -4 l 2 -4 l -6 -6 l -8 2 l 12 -14 l 6 0'),
											_1: {ctor: '[]'}
										}
									}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg$path,
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$stroke(color),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$d('M 130 28 l 6 0 l 10 8 l 2 14 l -12 -6 l -4 2 l 2 2 l 2 -4'),
												_1: {ctor: '[]'}
											}
										}
									},
									{ctor: '[]'}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$svg$Svg$path,
										{
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$stroke(color),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$d('M 134 48 L 142 54 L 164 116 L 132 132 L 118 130 L 94 120 L 110 90 L 132 132 L 106 72'),
													_1: {ctor: '[]'}
												}
											}
										},
										{ctor: '[]'}),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$svg$Svg$path,
											{
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$stroke(color),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$d('M 102 64 l -2 2 l -6 -10 l 2 -2 l 6 10'),
														_1: {ctor: '[]'}
													}
												}
											},
											{ctor: '[]'}),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$svg$Svg$path,
												{
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$stroke(color),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$d('M 102 66 l -4 2 l 4 6 l 2 2 l 6 14'),
															_1: {ctor: '[]'}
														}
													}
												},
												{ctor: '[]'}),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$svg$Svg$path,
													{
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$stroke(color),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
															_1: {
																ctor: '::',
																_0: _elm_lang$svg$Svg_Attributes$d('M 112 88 L 120 72'),
																_1: {ctor: '[]'}
															}
														}
													},
													{ctor: '[]'}),
												_1: {
													ctor: '::',
													_0: A2(
														_elm_lang$svg$Svg$path,
														{
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$stroke(color),
															_1: {
																ctor: '::',
																_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
																_1: {
																	ctor: '::',
																	_0: _elm_lang$svg$Svg_Attributes$d('M 132 62 L 128 20 L 122 52 L 122 64 L 124 60 L 128 114 L 130 80 L 130 68 L 132 62'),
																	_1: {ctor: '[]'}
																}
															}
														},
														{ctor: '[]'}),
													_1: {
														ctor: '::',
														_0: A2(
															_elm_lang$svg$Svg$path,
															{
																ctor: '::',
																_0: _elm_lang$svg$Svg_Attributes$stroke(color),
																_1: {
																	ctor: '::',
																	_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$svg$Svg_Attributes$d('M 130 40 l -2 -2 l -4 2 l 2 2 l 4 -2 l -2 6 l 0 4 l -2 0 l 0 -8 l -2 -2 l 2 6'),
																		_1: {ctor: '[]'}
																	}
																}
															},
															{ctor: '[]'}),
														_1: {ctor: '[]'}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				};
			case 'StarWizard':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 86 40 L 92 64 L 100 42 L 82 54 L 104 56 L 86 40'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 140 66 l 0 14 l -6 -12 l 10 6 l -10 2 l 6 -10'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$path,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke(color),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d('M 146 96 L 148 120 L 136 100 L 154 106 L 138 116 L 146 96'),
											_1: {ctor: '[]'}
										}
									}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg$path,
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$stroke(color),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$d('M 116 80 l 6 10 l -8 -4 l 8 -4 l -6 8 l 0 -10'),
												_1: {ctor: '[]'}
											}
										}
									},
									{ctor: '[]'}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$svg$Svg$path,
										{
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$stroke(color),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$d('M 124 64 l -4 8 l 0 -8 l -10 14 l -8 -14 l 8 -6 l 8 -4 l 2 -4 l 2 -4 l -6 -6 l -8 2 l 12 -14 l 6 0'),
													_1: {ctor: '[]'}
												}
											}
										},
										{ctor: '[]'}),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$svg$Svg$path,
											{
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$stroke(color),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$d('M 130 28 l 6 0 l 10 8 l 2 14 l -12 -6 l -4 2 l 2 2 l 2 -4'),
														_1: {ctor: '[]'}
													}
												}
											},
											{ctor: '[]'}),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$svg$Svg$path,
												{
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$stroke(color),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$d('M 134 48 L 142 54 L 164 116 L 132 132 L 118 130 L 94 120 L 110 90 L 132 132 L 106 72'),
															_1: {ctor: '[]'}
														}
													}
												},
												{ctor: '[]'}),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$svg$Svg$path,
													{
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$stroke(color),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
															_1: {
																ctor: '::',
																_0: _elm_lang$svg$Svg_Attributes$d('M 102 64 l -2 2 l -6 -10 l 2 -2 l 6 10'),
																_1: {ctor: '[]'}
															}
														}
													},
													{ctor: '[]'}),
												_1: {
													ctor: '::',
													_0: A2(
														_elm_lang$svg$Svg$path,
														{
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$stroke(color),
															_1: {
																ctor: '::',
																_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
																_1: {
																	ctor: '::',
																	_0: _elm_lang$svg$Svg_Attributes$d('M 102 66 l -4 2 l 4 6 l 2 2 l 6 14'),
																	_1: {ctor: '[]'}
																}
															}
														},
														{ctor: '[]'}),
													_1: {
														ctor: '::',
														_0: A2(
															_elm_lang$svg$Svg$path,
															{
																ctor: '::',
																_0: _elm_lang$svg$Svg_Attributes$stroke(color),
																_1: {
																	ctor: '::',
																	_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$svg$Svg_Attributes$d('M 112 88 L 120 72'),
																		_1: {ctor: '[]'}
																	}
																}
															},
															{ctor: '[]'}),
														_1: {
															ctor: '::',
															_0: A2(
																_elm_lang$svg$Svg$path,
																{
																	ctor: '::',
																	_0: _elm_lang$svg$Svg_Attributes$stroke(color),
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$svg$Svg_Attributes$d('M 132 62 L 128 20 L 122 52 L 122 64 L 124 60 L 128 114 L 130 80 L 130 68 L 132 62'),
																			_1: {ctor: '[]'}
																		}
																	}
																},
																{ctor: '[]'}),
															_1: {
																ctor: '::',
																_0: A2(
																	_elm_lang$svg$Svg$path,
																	{
																		ctor: '::',
																		_0: _elm_lang$svg$Svg_Attributes$stroke(color),
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
																			_1: {
																				ctor: '::',
																				_0: _elm_lang$svg$Svg_Attributes$d('M 130 40 l -2 -2 l -4 2 l 2 2 l 4 -2 l -2 6 l 0 4 l -2 0 l 0 -8 l -2 -2 l 2 6'),
																				_1: {ctor: '[]'}
																			}
																		}
																	},
																	{ctor: '[]'}),
																_1: {ctor: '[]'}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				};
			case 'Demon':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 124 64 l -4 8 l 0 -8 l -10 14 l -8 -14 l 8 -6 l 8 -4 l 2 -4 l 2 -4 l -6 -6 l -8 2 l 12 -14 l 6 0'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 130 28 l 6 0 l 10 8 l 2 14 l -12 -6 l -4 2 l 2 2 l 2 -4'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$path,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke(color),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$d('M 134 48 L 142 54 L 164 116 L 132 132 L 118 130 L 94 120 L 110 90 L 132 132 L 106 72'),
											_1: {ctor: '[]'}
										}
									}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg$path,
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$stroke(color),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$d('M 102 64 l -2 2 l -6 -10 l 2 -2 l 6 10'),
												_1: {ctor: '[]'}
											}
										}
									},
									{ctor: '[]'}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$svg$Svg$path,
										{
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$stroke(color),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$d('M 102 66 l -4 2 l 4 6 l 2 2 l 6 14'),
													_1: {ctor: '[]'}
												}
											}
										},
										{ctor: '[]'}),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$svg$Svg$path,
											{
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$stroke(color),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$d('M 112 88 L 120 72'),
														_1: {ctor: '[]'}
													}
												}
											},
											{ctor: '[]'}),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$svg$Svg$path,
												{
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$stroke(color),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$d('M 132 62 L 128 20 L 122 52 L 122 64 L 124 60 L 128 114 L 130 80 L 130 68 L 132 62'),
															_1: {ctor: '[]'}
														}
													}
												},
												{ctor: '[]'}),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$svg$Svg$path,
													{
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$stroke(color),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
															_1: {
																ctor: '::',
																_0: _elm_lang$svg$Svg_Attributes$d('M 130 40 l -2 -2 l -4 2 l 2 2 l 4 -2 l -2 6 l 0 4 l -2 0 l 0 -8 l -2 -2 l 2 6'),
																_1: {ctor: '[]'}
															}
														}
													},
													{ctor: '[]'}),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}
				};
			case 'Viper':
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(color),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 130 132 L 122 112 L 124 92 L 126 94 L 130 94 L 132 92 L 130 112 L 140 128 L 136 132 L 114 132 L 108 120 L 118 106 L 112 120 L 116 124 L 126 124'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$stroke(color),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('transparent'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M 120 100 l 0 -4 l 4 -4 l -4 -4 l 0 -4 l 2 -2 l 4 4 l -4 -4 l 12 0 l -4 4 l 4 -4 l 2 2 l 0 4 l -4 4 l 4 4 l 0 4'),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}
				};
			default:
				return {ctor: '[]'};
		}
	});
var _user$project$Main$vocab_noun = {
	ctor: '::',
	_0: 'Flask',
	_1: {
		ctor: '::',
		_0: 'Ring',
		_1: {
			ctor: '::',
			_0: 'Scroll',
			_1: {
				ctor: '::',
				_0: 'Shield',
				_1: {
					ctor: '::',
					_0: 'Sword',
					_1: {
						ctor: '::',
						_0: 'Torch',
						_1: {ctor: '[]'}
					}
				}
			}
		}
	}
};
var _user$project$Main$vocab_adjective = {
	ctor: '::',
	_0: 'Abye',
	_1: {
		ctor: '::',
		_0: 'Bronze',
		_1: {
			ctor: '::',
			_0: 'Dead',
			_1: {
				ctor: '::',
				_0: 'Elvish',
				_1: {
					ctor: '::',
					_0: 'Empty',
					_1: {
						ctor: '::',
						_0: 'Energy',
						_1: {
							ctor: '::',
							_0: 'Final',
							_1: {
								ctor: '::',
								_0: 'Fire',
								_1: {
									ctor: '::',
									_0: 'Gold',
									_1: {
										ctor: '::',
										_0: 'Hale',
										_1: {
											ctor: '::',
											_0: 'Ice',
											_1: {
												ctor: '::',
												_0: 'Iron',
												_1: {
													ctor: '::',
													_0: 'Joule',
													_1: {
														ctor: '::',
														_0: 'Leather',
														_1: {
															ctor: '::',
															_0: 'Lunar',
															_1: {
																ctor: '::',
																_0: 'Mithril',
																_1: {
																	ctor: '::',
																	_0: 'Pine',
																	_1: {
																		ctor: '::',
																		_0: 'Rime',
																		_1: {
																			ctor: '::',
																			_0: 'Seer',
																			_1: {
																				ctor: '::',
																				_0: 'Solar',
																				_1: {
																					ctor: '::',
																					_0: 'Supreme',
																					_1: {
																						ctor: '::',
																						_0: 'Thews',
																						_1: {
																							ctor: '::',
																							_0: 'Vision',
																							_1: {
																								ctor: '::',
																								_0: 'Vulcan',
																								_1: {
																									ctor: '::',
																									_0: 'Wooden',
																									_1: {ctor: '[]'}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};
var _user$project$Main$vocab_adverb = {
	ctor: '::',
	_0: 'Around',
	_1: {
		ctor: '::',
		_0: 'Back',
		_1: {
			ctor: '::',
			_0: 'Down',
			_1: {
				ctor: '::',
				_0: 'Left',
				_1: {
					ctor: '::',
					_0: 'Right',
					_1: {
						ctor: '::',
						_0: 'Up',
						_1: {
							ctor: '::',
							_0: 'Fire',
							_1: {
								ctor: '::',
								_0: 'Ice',
								_1: {
									ctor: '::',
									_0: 'Energy',
									_1: {
										ctor: '::',
										_0: 'Final',
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};
var _user$project$Main$vocab_verb = {
	ctor: '::',
	_0: 'Attack',
	_1: {
		ctor: '::',
		_0: 'Climb',
		_1: {
			ctor: '::',
			_0: 'Drop',
			_1: {
				ctor: '::',
				_0: 'Examine',
				_1: {
					ctor: '::',
					_0: 'Get',
					_1: {
						ctor: '::',
						_0: 'Incant',
						_1: {
							ctor: '::',
							_0: 'Look',
							_1: {
								ctor: '::',
								_0: 'Move',
								_1: {
									ctor: '::',
									_0: 'Pull',
									_1: {
										ctor: '::',
										_0: 'Reveal',
										_1: {
											ctor: '::',
											_0: 'Stow',
											_1: {
												ctor: '::',
												_0: 'Turn',
												_1: {
													ctor: '::',
													_0: 'Use',
													_1: {
														ctor: '::',
														_0: 'Zsave',
														_1: {
															ctor: '::',
															_0: 'Zload',
															_1: {ctor: '[]'}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};
var _user$project$Main$sounds = _elm_lang$core$Dict$fromList(
	{
		ctor: '::',
		_0: {
			ctor: '_Tuple2',
			_0: _user$project$Thing$serializeThing(_user$project$Thing$Shield),
			_1: 'shield'
		},
		_1: {
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: _user$project$Thing$serializeThing(_user$project$Thing$Torch),
				_1: 'torch'
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: _user$project$Thing$serializeThing(_user$project$Thing$Sword),
					_1: 'sword'
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: _user$project$Thing$serializeThing(_user$project$Thing$Flask),
						_1: 'flask'
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: _user$project$Thing$serializeThing(_user$project$Thing$Ring),
							_1: 'ring'
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: _user$project$Thing$serializeThing(_user$project$Thing$Scroll),
								_1: 'scroll'
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: _user$project$Thing$serializeThing(_user$project$Thing$Spider),
									_1: 'spider'
								},
								_1: {
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: _user$project$Thing$serializeThing(_user$project$Thing$Viper),
										_1: 'viper'
									},
									_1: {
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: _user$project$Thing$serializeThing(_user$project$Thing$ClubGiant),
											_1: 'club-giant'
										},
										_1: {
											ctor: '::',
											_0: {
												ctor: '_Tuple2',
												_0: _user$project$Thing$serializeThing(_user$project$Thing$Blob),
												_1: 'blob'
											},
											_1: {
												ctor: '::',
												_0: {
													ctor: '_Tuple2',
													_0: _user$project$Thing$serializeThing(_user$project$Thing$HatchetGiant),
													_1: 'axe-giant'
												},
												_1: {
													ctor: '::',
													_0: {
														ctor: '_Tuple2',
														_0: _user$project$Thing$serializeThing(_user$project$Thing$Knight),
														_1: 'knight'
													},
													_1: {
														ctor: '::',
														_0: {
															ctor: '_Tuple2',
															_0: _user$project$Thing$serializeThing(_user$project$Thing$ShieldKnight),
															_1: 'shield-knight'
														},
														_1: {
															ctor: '::',
															_0: {
																ctor: '_Tuple2',
																_0: _user$project$Thing$serializeThing(_user$project$Thing$Scorpion),
																_1: 'scorpion'
															},
															_1: {
																ctor: '::',
																_0: {
																	ctor: '_Tuple2',
																	_0: _user$project$Thing$serializeThing(_user$project$Thing$Demon),
																	_1: 'wizard'
																},
																_1: {
																	ctor: '::',
																	_0: {
																		ctor: '_Tuple2',
																		_0: _user$project$Thing$serializeThing(_user$project$Thing$Wraith),
																		_1: 'wraith'
																	},
																	_1: {
																		ctor: '::',
																		_0: {
																			ctor: '_Tuple2',
																			_0: _user$project$Thing$serializeThing(_user$project$Thing$Galdrog),
																			_1: 'galdrog'
																		},
																		_1: {
																			ctor: '::',
																			_0: {
																				ctor: '_Tuple2',
																				_0: _user$project$Thing$serializeThing(_user$project$Thing$MoonWizard),
																				_1: 'wizard'
																			},
																			_1: {
																				ctor: '::',
																				_0: {
																					ctor: '_Tuple2',
																					_0: _user$project$Thing$serializeThing(_user$project$Thing$Heart),
																					_1: 'heart'
																				},
																				_1: {
																					ctor: '::',
																					_0: {
																						ctor: '_Tuple2',
																						_0: _user$project$Thing$serializeThing(_user$project$Thing$CreatureDied),
																						_1: 'creature-died'
																					},
																					_1: {
																						ctor: '::',
																						_0: {
																							ctor: '_Tuple2',
																							_0: _user$project$Thing$serializeThing(_user$project$Thing$CreatureHitPlayer),
																							_1: 'creature-hit-player'
																						},
																						_1: {
																							ctor: '::',
																							_0: {
																								ctor: '_Tuple2',
																								_0: _user$project$Thing$serializeThing(_user$project$Thing$PlayerHitCreature),
																								_1: 'player-hit-creature'
																							},
																							_1: {
																								ctor: '::',
																								_0: {
																									ctor: '_Tuple2',
																									_0: _user$project$Thing$serializeThing(_user$project$Thing$PlayerHitWall),
																									_1: 'wall'
																								},
																								_1: {
																									ctor: '::',
																									_0: {
																										ctor: '_Tuple2',
																										_0: _user$project$Thing$serializeThing(_user$project$Thing$WizardFadeBuzz),
																										_1: 'wizard-fade-buzz'
																									},
																									_1: {
																										ctor: '::',
																										_0: {
																											ctor: '_Tuple2',
																											_0: _user$project$Thing$serializeThing(_user$project$Thing$WizardFadeCrash),
																											_1: 'wizard-fade-crash'
																										},
																										_1: {ctor: '[]'}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});
var _user$project$Main$sound = function (img) {
	var base = A2(
		_elm_lang$core$Dict$get,
		_user$project$Thing$serializeThing(img),
		_user$project$Main$sounds);
	var path = 'snd/';
	var extension = '.mp3';
	var _p1 = base;
	if (_p1.ctor === 'Nothing') {
		return '';
	} else {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			path,
			A2(_elm_lang$core$Basics_ops['++'], _p1._0, extension));
	}
};
var _user$project$Main$item = F2(
	function (img, num) {
		item:
		while (true) {
			var _p2 = img;
			switch (_p2.ctor) {
				case 'Empty':
					return {charges: 0, magicLight: 0, normalLight: 0, adj: '', noun: 'Empty', flag: false, magic: 0, resistance: 128, weight: 0, attack: 5, defence: 128, power: 0, revealed: true, $class: _user$project$Thing$Empty, id: 0};
				case 'LeatherShield':
					return {charges: 0, magicLight: 0, normalLight: 0, adj: 'Leather', noun: 'Shield', flag: false, magic: 0, resistance: 128, weight: 25, attack: 10, defence: 108, power: 125, revealed: false, $class: _user$project$Thing$Shield, id: num};
				case 'BronzeShield':
					return {charges: 0, magicLight: 0, normalLight: 0, adj: 'Bronze', noun: 'Shield', flag: false, magic: 0, resistance: 128, weight: 25, attack: 26, defence: 64, power: 625, revealed: false, $class: _user$project$Thing$Shield, id: num};
				case 'MithrilShield':
					return {charges: 0, magicLight: 0, normalLight: 0, adj: 'Mithril', noun: 'Shield', flag: false, magic: 13, resistance: 64, weight: 25, attack: 26, defence: 128, power: 3500, revealed: false, $class: _user$project$Thing$Shield, id: num};
				case 'GiantShield':
					return {charges: 0, magicLight: 0, normalLight: 0, adj: 'Isaac', noun: 'Shield', flag: false, magic: 255, resistance: 0, weight: 0, attack: 255, defence: 0, power: 0, revealed: true, $class: _user$project$Thing$Shield, id: num};
				case 'WoodenSword':
					return {charges: 0, magicLight: 0, normalLight: 0, adj: 'Wooden', noun: 'Sword', flag: false, magic: 0, resistance: 128, weight: 25, attack: 16, defence: 128, power: 125, revealed: false, $class: _user$project$Thing$Sword, id: num};
				case 'IronSword':
					return {charges: 0, magicLight: 0, normalLight: 0, adj: 'Iron', noun: 'Sword', flag: false, magic: 0, resistance: 128, weight: 25, attack: 40, defence: 128, power: 325, revealed: false, $class: _user$project$Thing$Sword, id: num};
				case 'ElvishSword':
					return {charges: 0, magicLight: 0, normalLight: 0, adj: 'Elvish', noun: 'Sword', flag: false, magic: 64, resistance: 128, weight: 25, attack: 64, defence: 128, power: 3750, revealed: false, $class: _user$project$Thing$Sword, id: num};
				case 'DeadTorch':
					return {charges: 0, magicLight: 0, normalLight: 0, adj: 'Dead', noun: 'Torch', flag: false, magic: 0, resistance: 128, weight: 10, attack: 5, defence: 128, power: 0, revealed: true, $class: _user$project$Thing$Torch, id: num};
				case 'PineTorch':
					return {charges: 15, magicLight: 0, normalLight: 7, adj: 'Pine', noun: 'Torch', flag: false, magic: 0, resistance: 128, weight: 10, attack: 5, defence: 128, power: 125, revealed: false, $class: _user$project$Thing$Torch, id: num};
				case 'LunarTorch':
					return {charges: 30, magicLight: 4, normalLight: 10, adj: 'Lunar', noun: 'Torch', flag: false, magic: 0, resistance: 128, weight: 10, attack: 5, defence: 128, power: 625, revealed: false, $class: _user$project$Thing$Torch, id: num};
				case 'SolarTorch':
					return {charges: 60, magicLight: 11, normalLight: 13, adj: 'Solar', noun: 'Torch', flag: false, magic: 0, resistance: 128, weight: 10, attack: 5, defence: 128, power: 1750, revealed: false, $class: _user$project$Thing$Torch, id: num};
				case 'ThewsFlask':
					return {charges: 1, magicLight: 0, normalLight: 0, adj: 'Thews', noun: 'Flask', flag: false, magic: 0, resistance: 128, weight: 5, attack: 5, defence: 128, power: 1750, revealed: false, $class: _user$project$Thing$Flask, id: num};
				case 'AbyeFlask':
					return {charges: 1, magicLight: 0, normalLight: 0, adj: 'Abye', noun: 'Flask', flag: false, magic: 0, resistance: 128, weight: 5, attack: 5, defence: 128, power: 1200, revealed: false, $class: _user$project$Thing$Flask, id: num};
				case 'HaleFlask':
					return {charges: 1, magicLight: 0, normalLight: 0, adj: 'Hale', noun: 'Flask', flag: false, magic: 0, resistance: 128, weight: 5, attack: 5, defence: 128, power: 1000, revealed: false, $class: _user$project$Thing$Flask, id: num};
				case 'EmptyFlask':
					return {charges: 0, magicLight: 0, normalLight: 0, adj: 'Empty', noun: 'Flask', flag: false, magic: 0, resistance: 128, weight: 5, attack: 5, defence: 128, power: 0, revealed: true, $class: _user$project$Thing$Flask, id: num};
				case 'SupremeRing':
					return {charges: 0, magicLight: 0, normalLight: 0, adj: 'Supreme', noun: 'Ring', flag: false, magic: 0, resistance: 128, weight: 5, attack: 5, defence: 128, power: 6375, revealed: false, $class: _user$project$Thing$Ring, id: num};
				case 'JouleRing':
					return {charges: 0, magicLight: 0, normalLight: 0, adj: 'Joule', noun: 'Ring', flag: false, magic: 0, resistance: 128, weight: 5, attack: 5, defence: 128, power: 4250, revealed: false, $class: _user$project$Thing$Ring, id: num};
				case 'RimeRing':
					return {charges: 0, magicLight: 0, normalLight: 0, adj: 'Rime', noun: 'Ring', flag: false, magic: 0, resistance: 128, weight: 5, attack: 5, defence: 128, power: 1300, revealed: false, $class: _user$project$Thing$Ring, id: num};
				case 'VulcanRing':
					return {charges: 0, magicLight: 0, normalLight: 0, adj: 'Vulcan', noun: 'Ring', flag: false, magic: 0, resistance: 128, weight: 5, attack: 5, defence: 128, power: 325, revealed: false, $class: _user$project$Thing$Ring, id: num};
				case 'FireRing':
					return {charges: 3, magicLight: 0, normalLight: 0, adj: 'Fire', noun: 'Ring', flag: false, magic: 255, resistance: 128, weight: 5, attack: 255, defence: 128, power: 325, revealed: true, $class: _user$project$Thing$Ring, id: num};
				case 'IceRing':
					return {charges: 3, magicLight: 0, normalLight: 0, adj: 'Ice', noun: 'Ring', flag: false, magic: 255, resistance: 128, weight: 5, attack: 255, defence: 128, power: 1300, revealed: true, $class: _user$project$Thing$Ring, id: num};
				case 'FinalRing':
					return {charges: 3, magicLight: 0, normalLight: 0, adj: 'Final', noun: 'Ring', flag: false, magic: 255, resistance: 128, weight: 5, attack: 255, defence: 128, power: 6375, revealed: true, $class: _user$project$Thing$Ring, id: num};
				case 'EnergyRing':
					return {charges: 3, magicLight: 0, normalLight: 0, adj: 'Energy', noun: 'Ring', flag: false, magic: 255, resistance: 128, weight: 5, attack: 255, defence: 128, power: 4250, revealed: true, $class: _user$project$Thing$Ring, id: num};
				case 'GoldRing':
					return {charges: 0, magicLight: 0, normalLight: 0, adj: 'Gold', noun: 'Ring', flag: false, magic: 0, resistance: 128, weight: 5, attack: 5, defence: 128, power: 0, revealed: true, $class: _user$project$Thing$Ring, id: num};
				case 'SeerScroll':
					return {charges: 0, magicLight: 0, normalLight: 0, adj: 'Seer', noun: 'Scroll', flag: false, magic: 0, resistance: 128, weight: 10, attack: 5, defence: 128, power: 3250, revealed: false, $class: _user$project$Thing$Scroll, id: num};
				case 'VisionScroll':
					return {charges: 0, magicLight: 0, normalLight: 0, adj: 'Vision', noun: 'Scroll', flag: false, magic: 0, resistance: 128, weight: 10, attack: 5, defence: 128, power: 1250, revealed: false, $class: _user$project$Thing$Scroll, id: num};
				default:
					var _v3 = _user$project$Thing$Empty,
						_v4 = 0;
					img = _v3;
					num = _v4;
					continue item;
			}
		}
	});
var _user$project$Main$creature = function (img) {
	creature:
	while (true) {
		var _p3 = img;
		switch (_p3.ctor) {
			case 'Spider':
				return {power: 32, damage: 0, moveRate: 23, attackRate: 11, attack: 128, defence: 255, magic: 0, resistance: 255, creature: _user$project$Thing$Spider};
			case 'Viper':
				return {power: 56, damage: 0, moveRate: 15, attackRate: 7, attack: 80, defence: 128, magic: 0, resistance: 255, creature: _user$project$Thing$Viper};
			case 'ClubGiant':
				return {power: 200, damage: 0, moveRate: 29, attackRate: 23, attack: 52, defence: 192, magic: 0, resistance: 255, creature: _user$project$Thing$ClubGiant};
			case 'Blob':
				return {power: 304, damage: 0, moveRate: 31, attackRate: 31, attack: 96, defence: 192, magic: 0, resistance: 255, creature: _user$project$Thing$Blob};
			case 'HatchetGiant':
				return {power: 704, damage: 0, moveRate: 17, attackRate: 13, attack: 128, defence: 48, magic: 0, resistance: 128, creature: _user$project$Thing$HatchetGiant};
			case 'Knight':
				return {power: 504, damage: 0, moveRate: 13, attackRate: 7, attack: 96, defence: 60, magic: 0, resistance: 128, creature: _user$project$Thing$Knight};
			case 'ShieldKnight':
				return {power: 800, damage: 0, moveRate: 13, attackRate: 7, attack: 255, defence: 8, magic: 0, resistance: 64, creature: _user$project$Thing$ShieldKnight};
			case 'Scorpion':
				return {power: 400, damage: 0, moveRate: 5, attackRate: 4, attack: 255, defence: 128, magic: 255, resistance: 128, creature: _user$project$Thing$Scorpion};
			case 'Demon':
				return {power: 1000, damage: 0, moveRate: 13, attackRate: 7, attack: 255, defence: 0, magic: 255, resistance: 6, creature: _user$project$Thing$Demon};
			case 'Wraith':
				return {power: 800, damage: 0, moveRate: 3, attackRate: 3, attack: 192, defence: 8, magic: 192, resistance: 16, creature: _user$project$Thing$Wraith};
			case 'Galdrog':
				return {power: 1000, damage: 0, moveRate: 4, attackRate: 3, attack: 255, defence: 3, magic: 255, resistance: 5, creature: _user$project$Thing$Galdrog};
			case 'MoonWizard':
				return {power: 8000, damage: 0, moveRate: 13, attackRate: 7, attack: 255, defence: 0, magic: 255, resistance: 6, creature: _user$project$Thing$MoonWizard};
			default:
				var _v6 = _user$project$Thing$Spider;
				img = _v6;
				continue creature;
		}
	}
};
var _user$project$Main$wizardBuzzOut = F2(
	function (creature, frame) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'width', _1: '768px'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'margin-left', _1: 'auto'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'margin-right', _1: 'auto'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'display', _1: 'block'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'font-size', _1: '16px'},
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$style(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'font-size', _1: '16px'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'font-family', _1: 'fantasy'},
									_1: {ctor: '[]'}
								}
							}),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$svg,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$width('768'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$height('456'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 256 152'),
										_1: {ctor: '[]'}
									}
								}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg$g,
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$strokeDasharray(
											A2(
												_elm_lang$core$Basics_ops['++'],
												'1,',
												_elm_lang$core$Basics$toString(2 * frame))),
										_1: {ctor: '[]'}
									},
									A2(_user$project$Main$image, 'black', creature)),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Main$wizardMessage = F4(
	function (creature, line1, line2, line3) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'width', _1: '768px'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'margin-left', _1: 'auto'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'margin-right', _1: 'auto'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'display', _1: 'block'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'font-size', _1: '16px'},
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$style(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'font-size', _1: '16px'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'font-family', _1: 'fantasy'},
									_1: {ctor: '[]'}
								}
							}),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$svg,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$width('768'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$height('456'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 256 152'),
										_1: {ctor: '[]'}
									}
								}
							},
							A2(_user$project$Main$image, 'black', creature)),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$style(
										{
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'width', _1: '768px'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'center'},
												_1: {ctor: '[]'}
											}
										}),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(line1),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$style(
											{
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'width', _1: '768px'},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'center'},
													_1: {ctor: '[]'}
												}
											}),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text(line2),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$div,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$style(
												{
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'width', _1: '768px'},
													_1: {
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'center'},
														_1: {ctor: '[]'}
													}
												}),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text(line3),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							}
						}
					}),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Main$wizardBuzzIn = F2(
	function (creature, frame) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'width', _1: '768px'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'margin-left', _1: 'auto'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'margin-right', _1: 'auto'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'display', _1: 'block'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'font-size', _1: '16px'},
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$style(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'font-size', _1: '16px'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'font-family', _1: 'fantasy'},
									_1: {ctor: '[]'}
								}
							}),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$svg,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$width('768'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$height('456'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 256 152'),
										_1: {ctor: '[]'}
									}
								}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg$g,
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$strokeDasharray(
											A2(
												_elm_lang$core$Basics_ops['++'],
												'1,',
												_elm_lang$core$Basics$toString(32 - (2 * frame)))),
										_1: {ctor: '[]'}
									},
									A2(_user$project$Main$image, 'black', creature)),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Main$viewIntro = function (model) {
	return (_elm_lang$core$Native_Utils.cmp(model.frame, 17) < 0) ? A2(_user$project$Main$wizardBuzzIn, _user$project$Thing$MoonWizard, model.frame) : ((_elm_lang$core$Native_Utils.cmp(model.frame, 25) < 0) ? A4(_user$project$Main$wizardMessage, _user$project$Thing$MoonWizard, 'I dare ye enter...', '...the Dungeons of Daggorath!!!', '') : ((_elm_lang$core$Native_Utils.cmp(model.frame, 33) < 0) ? A4(_user$project$Main$wizardMessage, _user$project$Thing$MoonWizard, 'I dare ye enter...', '...the Dungeons of Daggorath!!!', '(tribute)') : A2(_user$project$Main$wizardBuzzOut, _user$project$Thing$MoonWizard, model.frame - 33)));
};
var _user$project$Main$viewDead = function (model) {
	return (_elm_lang$core$Native_Utils.cmp(model.frame, 17) < 0) ? A2(_user$project$Main$wizardBuzzIn, _user$project$Thing$MoonWizard, model.frame) : ((_elm_lang$core$Native_Utils.cmp(model.frame, 33) < 0) ? A4(_user$project$Main$wizardMessage, _user$project$Thing$MoonWizard, 'Yet another does not return...', '', '') : A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{ctor: '[]'}));
};
var _user$project$Main$viewIntermission = function (model) {
	return (_elm_lang$core$Native_Utils.cmp(model.frame, 17) < 0) ? A2(_user$project$Main$wizardBuzzIn, _user$project$Thing$MoonWizard, model.frame) : ((_elm_lang$core$Native_Utils.cmp(model.frame, 33) < 0) ? A4(_user$project$Main$wizardMessage, _user$project$Thing$MoonWizard, 'Enough! I tire of this play...', 'prepare to meet thy doom!!!', '') : A2(_user$project$Main$wizardBuzzOut, _user$project$Thing$MoonWizard, model.frame - 33));
};
var _user$project$Main$viewEnding = function (model) {
	return (_elm_lang$core$Native_Utils.cmp(model.frame, 17) < 0) ? A2(_user$project$Main$wizardBuzzIn, _user$project$Thing$StarWizard, model.frame) : A4(_user$project$Main$wizardMessage, _user$project$Thing$StarWizard, 'Behold! Destiny awaits the hand', 'of a new wizard...', '');
};
var _user$project$Main$foregroundColor = function (model) {
	return _elm_lang$core$Native_Utils.eq(
		A2(_elm_lang$core$Basics_ops['%'], model.level, 2),
		0) ? 'white' : 'black';
};
var _user$project$Main$backgroundColor = function (model) {
	return _user$project$Main$foregroundColor(
		_elm_lang$core$Native_Utils.update(
			model,
			{level: model.level + 1}));
};
var _user$project$Main$prepare = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'width', _1: '768px'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'margin-left', _1: 'auto'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'margin-right', _1: 'auto'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'display', _1: 'block'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'font-size', _1: '16px'},
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'align-items', _1: 'center'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'height', _1: '456px'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'display', _1: 'flex'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'justify-content', _1: 'center'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'font-family', _1: 'fantasy'},
											_1: {
												ctor: '::',
												_0: {
													ctor: '_Tuple2',
													_0: 'color',
													_1: _user$project$Main$foregroundColor(model)
												},
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('Prepare!'),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		});
};
var _user$project$Main$name = function (object) {
	return (object.revealed && (!_elm_lang$core$Native_Utils.eq(object.adj, ''))) ? A2(
		_elm_lang$core$Basics_ops['++'],
		object.adj,
		A2(_elm_lang$core$Basics_ops['++'], ' ', object.noun)) : object.noun;
};
var _user$project$Main$isMagic = function (x) {
	return A2(
		_elm_lang$core$List$member,
		x,
		{
			ctor: '::',
			_0: _user$project$Thing$LeftMagicDoor,
			_1: {
				ctor: '::',
				_0: _user$project$Thing$RightMagicDoor,
				_1: {
					ctor: '::',
					_0: _user$project$Thing$FrontMagicDoor,
					_1: {
						ctor: '::',
						_0: _user$project$Thing$Scorpion,
						_1: {
							ctor: '::',
							_0: _user$project$Thing$MoonWizard,
							_1: {
								ctor: '::',
								_0: _user$project$Thing$Demon,
								_1: {
									ctor: '::',
									_0: _user$project$Thing$Galdrog,
									_1: {
										ctor: '::',
										_0: _user$project$Thing$Wraith,
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			}
		});
};
var _user$project$Main$features = function (room) {
	var ceilingFeatures = function (f) {
		var _p4 = f;
		switch (_p4.ctor) {
			case 'Open':
				return {
					ctor: '::',
					_0: _user$project$Thing$HoleCeiling,
					_1: {ctor: '[]'}
				};
			case 'Ladder':
				return {
					ctor: '::',
					_0: _user$project$Thing$LadderCeiling,
					_1: {ctor: '[]'}
				};
			default:
				return {
					ctor: '::',
					_0: _user$project$Thing$Ceiling,
					_1: {ctor: '[]'}
				};
		}
	};
	var floorFeatures = function (f) {
		var _p5 = f;
		switch (_p5.ctor) {
			case 'Open':
				return {
					ctor: '::',
					_0: _user$project$Thing$HoleFloor,
					_1: {ctor: '[]'}
				};
			case 'Ladder':
				return {
					ctor: '::',
					_0: _user$project$Thing$LadderFloor,
					_1: {ctor: '[]'}
				};
			default:
				return {
					ctor: '::',
					_0: _user$project$Thing$Floor,
					_1: {ctor: '[]'}
				};
		}
	};
	var frontFeatures = function (f) {
		var _p6 = f;
		switch (_p6.ctor) {
			case 'Open':
				return {
					ctor: '::',
					_0: _user$project$Thing$FrontOpen,
					_1: {ctor: '[]'}
				};
			case 'Door':
				return {
					ctor: '::',
					_0: _user$project$Thing$FrontDoor,
					_1: {ctor: '[]'}
				};
			case 'MagicDoor':
				return {
					ctor: '::',
					_0: _user$project$Thing$FrontMagicDoor,
					_1: {
						ctor: '::',
						_0: _user$project$Thing$FrontWall,
						_1: {ctor: '[]'}
					}
				};
			default:
				return {
					ctor: '::',
					_0: _user$project$Thing$FrontWall,
					_1: {ctor: '[]'}
				};
		}
	};
	var rightFeatures = function (f) {
		var _p7 = f;
		switch (_p7.ctor) {
			case 'Open':
				return {
					ctor: '::',
					_0: _user$project$Thing$RightOpen,
					_1: {ctor: '[]'}
				};
			case 'Door':
				return {
					ctor: '::',
					_0: _user$project$Thing$RightDoor,
					_1: {ctor: '[]'}
				};
			case 'MagicDoor':
				return {
					ctor: '::',
					_0: _user$project$Thing$RightMagicDoor,
					_1: {
						ctor: '::',
						_0: _user$project$Thing$RightWall,
						_1: {ctor: '[]'}
					}
				};
			default:
				return {
					ctor: '::',
					_0: _user$project$Thing$RightWall,
					_1: {ctor: '[]'}
				};
		}
	};
	var leftFeatures = function (f) {
		var _p8 = f;
		switch (_p8.ctor) {
			case 'Open':
				return {
					ctor: '::',
					_0: _user$project$Thing$LeftOpen,
					_1: {ctor: '[]'}
				};
			case 'Door':
				return {
					ctor: '::',
					_0: _user$project$Thing$LeftDoor,
					_1: {ctor: '[]'}
				};
			case 'MagicDoor':
				return {
					ctor: '::',
					_0: _user$project$Thing$LeftMagicDoor,
					_1: {
						ctor: '::',
						_0: _user$project$Thing$LeftWall,
						_1: {ctor: '[]'}
					}
				};
			default:
				return {
					ctor: '::',
					_0: _user$project$Thing$LeftWall,
					_1: {ctor: '[]'}
				};
		}
	};
	return _elm_lang$core$List$concat(
		{
			ctor: '::',
			_0: leftFeatures(room.left),
			_1: {
				ctor: '::',
				_0: rightFeatures(room.right),
				_1: {
					ctor: '::',
					_0: frontFeatures(room.front),
					_1: {
						ctor: '::',
						_0: floorFeatures(room.floor),
						_1: {
							ctor: '::',
							_0: ceilingFeatures(room.ceiling),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		});
};
var _user$project$Main$absRoom2relRoom = F2(
	function (room, orientation) {
		var _p9 = function () {
			var _p10 = orientation;
			switch (_p10) {
				case 1:
					return {
						ctor: '_Tuple6',
						_0: function (_) {
							return _.north;
						},
						_1: function (_) {
							return _.east;
						},
						_2: function (_) {
							return _.south;
						},
						_3: function (_) {
							return _.west;
						},
						_4: function (_) {
							return _.floor;
						},
						_5: function (_) {
							return _.ceiling;
						}
					};
				case 2:
					return {
						ctor: '_Tuple6',
						_0: function (_) {
							return _.east;
						},
						_1: function (_) {
							return _.south;
						},
						_2: function (_) {
							return _.west;
						},
						_3: function (_) {
							return _.north;
						},
						_4: function (_) {
							return _.floor;
						},
						_5: function (_) {
							return _.ceiling;
						}
					};
				case 3:
					return {
						ctor: '_Tuple6',
						_0: function (_) {
							return _.south;
						},
						_1: function (_) {
							return _.west;
						},
						_2: function (_) {
							return _.north;
						},
						_3: function (_) {
							return _.east;
						},
						_4: function (_) {
							return _.floor;
						},
						_5: function (_) {
							return _.ceiling;
						}
					};
				default:
					return {
						ctor: '_Tuple6',
						_0: function (_) {
							return _.west;
						},
						_1: function (_) {
							return _.north;
						},
						_2: function (_) {
							return _.east;
						},
						_3: function (_) {
							return _.south;
						},
						_4: function (_) {
							return _.floor;
						},
						_5: function (_) {
							return _.ceiling;
						}
					};
			}
		}();
		var left = _p9._0;
		var front = _p9._1;
		var right = _p9._2;
		var back = _p9._3;
		var floor = _p9._4;
		var ceiling = _p9._5;
		return {
			left: left(room),
			front: front(room),
			right: right(room),
			back: back(room),
			floor: floor(room),
			ceiling: ceiling(room)
		};
	});
var _user$project$Main$step = F4(
	function (level, x, y, d) {
		var relativeRoom = A2(
			_user$project$Main$absRoom2relRoom,
			A3(_user$project$Maze$getRoom, level, x, y),
			d);
		var _p11 = function () {
			var _p12 = d;
			switch (_p12) {
				case 0:
					return {
						ctor: '_Tuple2',
						_0: x,
						_1: A2(_elm_lang$core$Basics$max, 0, y - 1)
					};
				case 1:
					return {
						ctor: '_Tuple2',
						_0: A2(_elm_lang$core$Basics$min, 31, x + 1),
						_1: y
					};
				case 2:
					return {
						ctor: '_Tuple2',
						_0: x,
						_1: A2(_elm_lang$core$Basics$min, 31, y + 1)
					};
				case 3:
					return {
						ctor: '_Tuple2',
						_0: A2(_elm_lang$core$Basics$max, 0, x - 1),
						_1: y
					};
				default:
					return {ctor: '_Tuple2', _0: x, _1: y};
			}
		}();
		var nx = _p11._0;
		var ny = _p11._1;
		return _elm_lang$core$Native_Utils.eq(relativeRoom.front, _user$project$Maze$Solid) ? {ctor: '_Tuple2', _0: x, _1: y} : {ctor: '_Tuple2', _0: nx, _1: ny};
	});
var _user$project$Main$distance = function (d) {
	var scale = Math.pow((192 - 64) / (229 - 27), d - 1);
	var dx = _elm_lang$core$Basics$toString((256 * (1 - scale)) / 2);
	var dy = _elm_lang$core$Basics$toString((152 * (1 - scale)) / 2);
	var s = _elm_lang$core$Basics$toString(scale);
	return _elm_lang$core$String$concat(
		{
			ctor: '::',
			_0: 'translate(',
			_1: {
				ctor: '::',
				_0: dx,
				_1: {
					ctor: '::',
					_0: ' ',
					_1: {
						ctor: '::',
						_0: dy,
						_1: {
							ctor: '::',
							_0: ') scale(',
							_1: {
								ctor: '::',
								_0: s,
								_1: {
									ctor: '::',
									_0: ')',
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			}
		});
};
var _user$project$Main$sndCreature = F2(
	function (_p13, creature) {
		var _p14 = _p13;
		var _p18 = _p14._0;
		var _p17 = _p14._1;
		var _p15 = {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Basics$abs(_p18.x - creature.x),
			_1: _elm_lang$core$Basics$abs(_p18.y - creature.y)
		};
		var dx = _p15._0;
		var dy = _p15._1;
		var distance = (((_elm_lang$core$Native_Utils.cmp(dx, 9) < 0) && (_elm_lang$core$Native_Utils.cmp(dy, 9) < 0)) && (!((_elm_lang$core$Native_Utils.cmp(2, dx) < 0) && (_elm_lang$core$Native_Utils.cmp(2, dy) < 0)))) ? A2(_elm_lang$core$Basics$max, dx, dy) : 9;
		var vol = (9.0 - _elm_lang$core$Basics$toFloat(distance)) / 9.0;
		var _p16 = A2(
			_elm_lang$core$Random$step,
			A2(_elm_lang$core$Random$int, 0, 1),
			_p18.seed);
		var randomNoise = _p16._0;
		var seed1 = _p16._1;
		return (_elm_lang$core$Native_Utils.eq(_p18.level, creature.level) && ((_elm_lang$core$Native_Utils.cmp(distance, 9) < 0) && _elm_lang$core$Native_Utils.eq(randomNoise, 1))) ? {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				_p18,
				{seed: seed1}),
			_1: _elm_lang$core$Platform_Cmd$batch(
				{
					ctor: '::',
					_0: _p17,
					_1: {
						ctor: '::',
						_0: _user$project$SoundPort$playSound(
							{
								url: _user$project$Main$sound(creature.statistics.creature),
								volume: vol
							}),
						_1: {ctor: '[]'}
					}
				})
		} : {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				_p18,
				{seed: seed1}),
			_1: _p17
		};
	});
var _user$project$Main$solid = {north: _user$project$Maze$Solid, east: _user$project$Maze$Solid, south: _user$project$Maze$Solid, west: _user$project$Maze$Solid, floor: _user$project$Maze$Solid, ceiling: _user$project$Maze$Solid};
var _user$project$Main$viewScroll = F2(
	function (adj, model) {
		var hole = F3(
			function (x, y, colour) {
				return A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$transform(
							A2(
								_elm_lang$core$Basics_ops['++'],
								'translate(',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(x),
									A2(
										_elm_lang$core$Basics_ops['++'],
										' ',
										A2(
											_elm_lang$core$Basics_ops['++'],
											_elm_lang$core$Basics$toString(y),
											')'))))),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(colour),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(colour),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 1 1 L 2 1 L 2 2 L 1 2 Z'),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					{ctor: '[]'});
			});
		var thing = F3(
			function (x, y, colour) {
				return A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$transform(
							A2(
								_elm_lang$core$Basics_ops['++'],
								'translate(',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(x),
									A2(
										_elm_lang$core$Basics_ops['++'],
										' ',
										A2(
											_elm_lang$core$Basics_ops['++'],
											_elm_lang$core$Basics$toString(y),
											')'))))),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(colour),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(colour),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 0 0 L 3 3 M 0 3 L 3 0'),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					{ctor: '[]'});
			});
		var player = {
			ctor: '::',
			_0: A3(
				thing,
				model.x * 4,
				model.y * 4,
				_user$project$Main$backgroundColor(model)),
			_1: {ctor: '[]'}
		};
		var creatures = A2(
			_elm_lang$core$List$map,
			function (e) {
				return A3(thing, e.x * 4, e.y * 4, 'red');
			},
			A2(
				_elm_lang$core$List$filter,
				function (e) {
					return _elm_lang$core$Native_Utils.eq(e.level, model.level);
				},
				model.monsters));
		var treasure = A2(
			_elm_lang$core$List$map,
			function (e) {
				return A3(thing, e.x * 4, e.y * 4, 'green');
			},
			A2(
				_elm_lang$core$List$filter,
				function (e) {
					return _elm_lang$core$Native_Utils.eq(e.level, model.level);
				},
				model.treasure));
		var block = F3(
			function (x, y, colour) {
				return A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$transform(
							A2(
								_elm_lang$core$Basics_ops['++'],
								'translate(',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(x),
									A2(
										_elm_lang$core$Basics_ops['++'],
										' ',
										A2(
											_elm_lang$core$Basics_ops['++'],
											_elm_lang$core$Basics$toString(y),
											')'))))),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(colour),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(colour),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M 0 0 L 3 0 L 3 3 L 0 3 Z'),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					{ctor: '[]'});
			});
		var map = _elm_lang$core$List$concat(
			A2(
				_elm_lang$core$List$map,
				function (x) {
					return A2(
						_elm_lang$core$List$map,
						function (y) {
							var room = A3(_user$project$Maze$getRoom, model.level, x, y);
							return _elm_lang$core$Native_Utils.eq(room, _user$project$Main$solid) ? A3(
								block,
								x * 4,
								y * 4,
								_user$project$Main$backgroundColor(model)) : (((!_elm_lang$core$Native_Utils.eq(room.floor, _user$project$Maze$Solid)) || (!_elm_lang$core$Native_Utils.eq(room.ceiling, _user$project$Maze$Solid))) ? A2(
								_elm_lang$svg$Svg$g,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: A3(
										block,
										x * 4,
										y * 4,
										_user$project$Main$foregroundColor(model)),
									_1: {
										ctor: '::',
										_0: A3(hole, x * 4, y * 4, 'blue'),
										_1: {ctor: '[]'}
									}
								}) : A3(
								block,
								x * 4,
								y * 4,
								_user$project$Main$foregroundColor(model)));
						},
						A2(_elm_lang$core$List$range, 0, 31));
				},
				A2(_elm_lang$core$List$range, 0, 31)));
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width('768'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height('456'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 256 152'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$g,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$transform(
							A2(
								_elm_lang$core$Basics_ops['++'],
								'translate(',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString((256 - (32 * 4)) / 2),
									A2(
										_elm_lang$core$Basics_ops['++'],
										',',
										A2(
											_elm_lang$core$Basics_ops['++'],
											_elm_lang$core$Basics$toString((152 - (32 * 4)) / 2),
											')'))))),
						_1: {ctor: '[]'}
					},
					_elm_lang$core$Native_Utils.eq(adj, 'seer') ? _elm_lang$core$List$concat(
						{
							ctor: '::',
							_0: map,
							_1: {
								ctor: '::',
								_0: player,
								_1: {
									ctor: '::',
									_0: treasure,
									_1: {
										ctor: '::',
										_0: creatures,
										_1: {ctor: '[]'}
									}
								}
							}
						}) : _elm_lang$core$List$concat(
						{
							ctor: '::',
							_0: map,
							_1: {
								ctor: '::',
								_0: player,
								_1: {ctor: '[]'}
							}
						})),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Main$loadError = function (history) {
	return A2(
		_elm_lang$core$List$indexedMap,
		F2(
			function (n, e) {
				return _elm_lang$core$Native_Utils.eq(
					n,
					_elm_lang$core$List$length(history) - 1) ? A2(_elm_lang$core$Basics_ops['++'], e, ' ???') : e;
			}),
		history);
};
var _user$project$Main$findFirst = F2(
	function (predicate, xs) {
		findFirst:
		while (true) {
			var _p19 = xs;
			if (_p19.ctor === '[]') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p20 = _p19._0;
				if (predicate(_p20)) {
					return _elm_lang$core$Maybe$Just(_p20);
				} else {
					var _v16 = predicate,
						_v17 = _p19._1;
					predicate = _v16;
					xs = _v17;
					continue findFirst;
				}
			}
		}
	});
var _user$project$Main$randomHit = F4(
	function (model, defenderPower, defenderDamage, attackerPower) {
		var _p21 = A2(
			_elm_lang$core$Random$step,
			A2(_elm_lang$core$Random$int, 0, 255),
			model.seed);
		var rnd = _p21._0;
		var seed1 = _p21._1;
		var effectiveDefenderPower = A2(_elm_lang$core$Basics$min, 3.75 * attackerPower, defenderPower - defenderDamage);
		var norm = 3 - (effectiveDefenderPower / attackerPower);
		var threshold = (_elm_lang$core$Native_Utils.cmp(0, norm) < 0) ? (127 - (40 * norm)) : (127 - (100 * norm));
		var isHit = _elm_lang$core$Native_Utils.cmp(
			_elm_lang$core$Basics$truncate(threshold),
			rnd) < 1;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{seed: seed1}),
			_1: isHit
		};
	});
var _user$project$Main$calcDamage = F5(
	function (attackerPower, attackerMagicalOffence, defenderMagicalDefence, attackerPhysicalOffence, defenderPhysicalDefence) {
		return (attackerPower * ((attackerMagicalOffence * defenderMagicalDefence) + (attackerPhysicalOffence * defenderPhysicalDefence))) / (128 * 128);
	});
var _user$project$Main$calcWeight = function (model) {
	return ((_elm_lang$core$Native_Utils.cmp(2, model.level) < 0) ? 200 : 0) + _elm_lang$core$List$sum(
		_elm_lang$core$List$concat(
			{
				ctor: '::',
				_0: A2(
					_elm_lang$core$List$map,
					function (_) {
						return _.weight;
					},
					model.leftHand),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$core$List$map,
						function (_) {
							return _.weight;
						},
						model.rightHand),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$core$List$map,
							function (_) {
								return _.weight;
							},
							model.inventory),
						_1: {ctor: '[]'}
					}
				}
			}));
};
var _user$project$Main$v_zload = F5(
	function (len, adverb, adjectives, nouns, model) {
		return (!_elm_lang$core$Native_Utils.eq(adverb, '')) ? {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{good: true}),
			_1: _user$project$LocalStoragePort$loadCmd(
				_elm_lang$core$String$toLower(adverb))
		} : {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
	});
var _user$project$Main$serialize = function (model) {
	var serializeTreasure = function (t) {
		return {
			clazz: _user$project$Thing$serializeThing(t.$class),
			id: t.id,
			attack: t.attack,
			defence: t.defence,
			magic: t.magic,
			resistance: t.resistance,
			charges: t.charges,
			flag: t.flag,
			magicLight: t.magicLight,
			normalLight: t.normalLight,
			power: t.power,
			weight: t.weight,
			adj: t.adj,
			noun: t.noun,
			revealed: t.revealed
		};
	};
	var serializeDungeonTreasure = function (t) {
		return {
			level: t.level,
			x: t.x,
			y: t.y,
			object: serializeTreasure(t.object)
		};
	};
	var serializeCreature = function (c) {
		return {
			creature: _user$project$Thing$serializeThing(c.creature),
			attack: c.attack,
			defence: c.defence,
			magic: c.magic,
			resistance: c.resistance,
			attackRate: c.attackRate,
			moveRate: c.moveRate,
			power: c.power,
			damage: c.damage
		};
	};
	var serializeDungeonCreature = function (c) {
		return {
			level: c.level,
			x: c.x,
			y: c.y,
			orientation: c.orientation,
			actionCounter: c.actionCounter,
			inventory: A2(_elm_lang$core$List$map, serializeTreasure, c.inventory),
			statistics: serializeCreature(c.statistics)
		};
	};
	var translate = function (m) {
		return {
			level: m.level,
			x: m.x,
			y: m.y,
			power: m.power,
			damage: m.damage,
			response: m.response,
			seed: '',
			weight: m.weight,
			bpm: m.bpm,
			display: m.display,
			frame: m.frame,
			heart: m.heart,
			history: m.history,
			input: m.input,
			good: m.good,
			inventory: A2(_elm_lang$core$List$map, serializeTreasure, m.inventory),
			leftHand: A2(_elm_lang$core$List$map, serializeTreasure, m.leftHand),
			rightHand: A2(_elm_lang$core$List$map, serializeTreasure, m.rightHand),
			status: m.status,
			orientation: m.orientation,
			monsters: A2(_elm_lang$core$List$map, serializeDungeonCreature, m.monsters),
			treasure: A2(_elm_lang$core$List$map, serializeDungeonTreasure, m.treasure)
		};
	};
	return translate(model);
};
var _user$project$Main$v_zsave = F5(
	function (len, adverb, adjectives, nouns, model) {
		return (!_elm_lang$core$Native_Utils.eq(adverb, '')) ? {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{good: true}),
			_1: _user$project$LocalStoragePort$saveCmd(
				{
					ctor: '_Tuple2',
					_0: _elm_lang$core$String$toLower(adverb),
					_1: _user$project$Main$serialize(model)
				})
		} : {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
	});
var _user$project$Main$deserialize = function (data) {
	var translateTreasure = function (t) {
		return {
			$class: _user$project$Thing$deserializeThing(t.clazz),
			id: t.id,
			attack: t.attack,
			defence: t.defence,
			magic: t.magic,
			resistance: t.resistance,
			charges: t.charges,
			flag: t.flag,
			magicLight: t.magicLight,
			normalLight: t.normalLight,
			power: t.power,
			weight: t.weight,
			adj: t.adj,
			noun: t.noun,
			revealed: t.revealed
		};
	};
	var translateDungeonTreasure = function (t) {
		return {
			level: t.level,
			x: t.x,
			y: t.y,
			object: translateTreasure(t.object)
		};
	};
	var translateCreature = function (c) {
		return {
			creature: _user$project$Thing$deserializeThing(c.creature),
			attack: c.attack,
			defence: c.defence,
			magic: c.magic,
			resistance: c.resistance,
			attackRate: c.attackRate,
			moveRate: c.moveRate,
			power: c.power,
			damage: c.damage
		};
	};
	var translateDungeonCreature = function (c) {
		return {
			level: c.level,
			x: c.x,
			y: c.y,
			orientation: c.orientation,
			actionCounter: c.actionCounter,
			inventory: A2(_elm_lang$core$List$map, translateTreasure, c.inventory),
			statistics: translateCreature(c.statistics)
		};
	};
	var translate = function (m) {
		return {
			level: m.level,
			x: m.x,
			y: m.y,
			power: m.power,
			damage: m.damage,
			response: m.response,
			seed: _elm_lang$core$Random$initialSeed(31415),
			weight: m.weight,
			bpm: m.bpm,
			display: m.display,
			frame: m.frame,
			heart: m.heart,
			history: m.history,
			input: m.input,
			good: m.good,
			status: m.status,
			orientation: m.orientation,
			inventory: A2(_elm_lang$core$List$map, translateTreasure, m.inventory),
			leftHand: A2(_elm_lang$core$List$map, translateTreasure, m.leftHand),
			rightHand: A2(_elm_lang$core$List$map, translateTreasure, m.rightHand),
			monsters: A2(_elm_lang$core$List$map, translateDungeonCreature, m.monsters),
			treasure: A2(_elm_lang$core$List$map, translateDungeonTreasure, m.treasure)
		};
	};
	return translate(data);
};
var _user$project$Main$v_look = F3(
	function (len, adverbs, model) {
		var _p22 = len;
		if (_p22 === 1) {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{good: true, display: 'dungeon'}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		} else {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{good: false}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		}
	});
var _user$project$Main$v_incant = F3(
	function (len, adverb, model) {
		var endGame = function (model) {
			var $final = A2(
				_elm_lang$core$List$filter,
				function (e) {
					return _elm_lang$core$Native_Utils.eq(e.adj, 'Final');
				},
				_elm_lang$core$List$concat(
					{
						ctor: '::',
						_0: model.leftHand,
						_1: {
							ctor: '::',
							_0: model.rightHand,
							_1: {ctor: '[]'}
						}
					}));
			return _elm_lang$core$List$isEmpty($final) ? model : _elm_lang$core$Native_Utils.update(
				model,
				{display: 'final', frame: 0});
		};
		var activate = F2(
			function (ring, newring) {
				return _elm_lang$core$List$map(
					function (e) {
						return (_elm_lang$core$Native_Utils.eq(e.$class, _user$project$Thing$Ring) && (e.revealed && _elm_lang$core$Native_Utils.eq(
							e.adj,
							A2(_user$project$Main$item, ring, 0).adj))) ? A2(_user$project$Main$item, newring, e.id) : e;
					});
			});
		var incant = F2(
			function (ring, newring) {
				return _elm_lang$core$Native_Utils.update(
					model,
					{
						rightHand: A3(activate, ring, newring, model.rightHand),
						leftHand: A3(activate, ring, newring, model.leftHand)
					});
			});
		var action = function () {
			var _p23 = adverb;
			switch (_p23) {
				case 'Final':
					return A2(incant, _user$project$Thing$SupremeRing, _user$project$Thing$FinalRing);
				case 'Energy':
					return A2(incant, _user$project$Thing$JouleRing, _user$project$Thing$EnergyRing);
				case 'Ice':
					return A2(incant, _user$project$Thing$RimeRing, _user$project$Thing$IceRing);
				case 'Fire':
					return A2(incant, _user$project$Thing$VulcanRing, _user$project$Thing$FireRing);
				default:
					return model;
			}
		}();
		var $final = endGame(action);
		var _p24 = len;
		if (_p24 === 2) {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					$final,
					{good: true}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		} else {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{good: false}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		}
	});
var _user$project$Main$v_examine = F2(
	function (len, model) {
		var _p25 = len;
		if (_p25 === 1) {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{good: true, display: 'inventory'}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		} else {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{good: false}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		}
	});
var _user$project$Main$uniqPrefixMatch = F2(
	function (xs, x) {
		var ciMatch = function (regex) {
			return _elm_lang$core$Regex$contains(
				_elm_lang$core$Regex$caseInsensitive(
					_elm_lang$core$Regex$regex(regex)));
		};
		var matches = A2(
			_elm_lang$core$List$filter,
			ciMatch(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'^',
					_elm_lang$core$Regex$escape(x))),
			xs);
		var _p26 = matches;
		if ((_p26.ctor === '::') && (_p26._1.ctor === '[]')) {
			return _p26._0;
		} else {
			return x;
		}
	});
var _user$project$Main$lex = function (input) {
	var words = _elm_lang$core$Array$fromList(
		_elm_lang$core$String$words(input));
	var get = function (x) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			'',
			A2(_elm_lang$core$Array$get, x, words));
	};
	var find = F2(
		function (vocab, pos) {
			return A2(
				_user$project$Main$uniqPrefixMatch,
				vocab,
				get(pos));
		});
	var _p27 = _elm_lang$core$Array$length(words);
	switch (_p27) {
		case 1:
			return {
				ctor: '_Tuple5',
				_0: 1,
				_1: A2(find, _user$project$Main$vocab_verb, 0),
				_2: '',
				_3: '',
				_4: ''
			};
		case 2:
			return {
				ctor: '_Tuple5',
				_0: 2,
				_1: A2(find, _user$project$Main$vocab_verb, 0),
				_2: A2(find, _user$project$Main$vocab_adverb, 1),
				_3: '',
				_4: ''
			};
		case 3:
			return {
				ctor: '_Tuple5',
				_0: 3,
				_1: A2(find, _user$project$Main$vocab_verb, 0),
				_2: A2(find, _user$project$Main$vocab_adverb, 1),
				_3: '',
				_4: A2(find, _user$project$Main$vocab_noun, 2)
			};
		case 4:
			return {
				ctor: '_Tuple5',
				_0: 4,
				_1: A2(find, _user$project$Main$vocab_verb, 0),
				_2: A2(find, _user$project$Main$vocab_adverb, 1),
				_3: A2(find, _user$project$Main$vocab_adjective, 2),
				_4: A2(find, _user$project$Main$vocab_noun, 3)
			};
		default:
			return {
				ctor: '_Tuple5',
				_0: _elm_lang$core$Array$length(words),
				_1: '',
				_2: '',
				_3: '',
				_4: ''
			};
	}
};
var _user$project$Main$matchPosition = F2(
	function (position, xs) {
		return A2(
			_elm_lang$core$List$filter,
			function (e) {
				return _elm_lang$core$Native_Utils.eq(
					{ctor: '_Tuple3', _0: e.level, _1: e.x, _2: e.y},
					position);
			},
			xs);
	});
var _user$project$Main$thereIsAThing = F2(
	function (position, xs) {
		return !_elm_lang$core$List$isEmpty(
			A2(_user$project$Main$matchPosition, position, xs));
	});
var _user$project$Main$push = F2(
	function (element, queue) {
		return A2(
			_elm_lang$core$List$append,
			A2(_elm_lang$core$List$drop, 1, queue),
			{
				ctor: '::',
				_0: element,
				_1: {ctor: '[]'}
			});
	});
var _user$project$Main$long = F4(
	function (verb, adverb, adjective, noun) {
		return _elm_lang$core$String$trim(
			A2(
				_elm_lang$core$String$join,
				' ',
				{
					ctor: '::',
					_0: verb,
					_1: {
						ctor: '::',
						_0: adverb,
						_1: {
							ctor: '::',
							_0: adjective,
							_1: {
								ctor: '::',
								_0: noun,
								_1: {ctor: '[]'}
							}
						}
					}
				}));
	});
var _user$project$Main$moveItem = F4(
	function (object, remove, insert, model) {
		return A2(
			insert,
			object,
			A2(remove, object, model));
	});
var _user$project$Main$calcBpm = function (model) {
	return 3600 / (((model.power * 64) / (model.power + (2 * model.damage))) - 19);
};
var _user$project$Main$updateBpm = function (model) {
	return _elm_lang$core$Native_Utils.update(
		model,
		{
			bpm: _user$project$Main$calcBpm(model)
		});
};
var _user$project$Main$updateWeight = function (model) {
	return _elm_lang$core$Native_Utils.update(
		model,
		{
			weight: _user$project$Main$calcWeight(model)
		});
};
var _user$project$Main$cwTurn = F2(
	function (orient, rightTurns) {
		return A2(_elm_lang$core$Basics_ops['%'], orient + rightTurns, 4);
	});
var _user$project$Main$v_move = F3(
	function (len, adverbs, model) {
		var damage = (model.damage + (model.weight / 8)) + 3;
		var mv = function (delta) {
			return A4(
				_user$project$Main$step,
				model.level,
				model.x,
				model.y,
				A2(_user$project$Main$cwTurn, model.orientation, delta));
		};
		var _p28 = function () {
			var _p29 = adverbs;
			switch (_p29) {
				case '':
					return mv(0);
				case 'Right':
					return mv(1);
				case 'Back':
					return mv(2);
				case 'Left':
					return mv(-1);
				default:
					return {ctor: '_Tuple2', _0: model.x, _1: model.y};
			}
		}();
		var nx = _p28._0;
		var ny = _p28._1;
		var cmd = _elm_lang$core$Native_Utils.eq(
			{ctor: '_Tuple2', _0: model.x, _1: model.y},
			{ctor: '_Tuple2', _0: nx, _1: ny}) ? _user$project$SoundPort$playSound(
			{
				url: _user$project$Main$sound(_user$project$Thing$PlayerHitWall),
				volume: 1.0
			}) : _elm_lang$core$Platform_Cmd$none;
		var ret = {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{good: true, x: nx, y: ny, damage: damage}),
			_1: cmd
		};
		var _p30 = {ctor: '_Tuple2', _0: len, _1: adverbs};
		_v25_4:
		do {
			if (_p30.ctor === '_Tuple2') {
				switch (_p30._0) {
					case 1:
						if (_p30._1 === '') {
							return ret;
						} else {
							break _v25_4;
						}
					case 2:
						switch (_p30._1) {
							case 'Right':
								return ret;
							case 'Left':
								return ret;
							case 'Back':
								return ret;
							default:
								break _v25_4;
						}
					default:
						break _v25_4;
				}
			} else {
				break _v25_4;
			}
		} while(false);
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{good: false}),
			_1: cmd
		};
	});
var _user$project$Main$v_turn = F3(
	function (len, adverbs, model) {
		var action = function (delta) {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{
						good: true,
						orientation: A2(_user$project$Main$cwTurn, model.orientation, delta)
					}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		};
		var _p31 = {ctor: '_Tuple2', _0: len, _1: adverbs};
		_v26_3:
		do {
			if ((_p31.ctor === '_Tuple2') && (_p31._0 === 2)) {
				switch (_p31._1) {
					case 'Right':
						return action(1);
					case 'Left':
						return action(-1);
					case 'Around':
						return action(2);
					default:
						break _v26_3;
				}
			} else {
				break _v26_3;
			}
		} while(false);
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{good: false}),
			_1: _elm_lang$core$Platform_Cmd$none
		};
	});
var _user$project$Main$equalPosition = F2(
	function (a, b) {
		return _elm_lang$core$Native_Utils.eq(
			{ctor: '_Tuple3', _0: a.level, _1: a.x, _2: a.y},
			{ctor: '_Tuple3', _0: b.level, _1: b.x, _2: b.y});
	});
var _user$project$Main$damageCreature = F3(
	function (model, damage, _p32) {
		var _p33 = _p32;
		var _p35 = _p33.statistics;
		var _p34 = _p33;
		return A2(_user$project$Main$equalPosition, model, _p34) ? _elm_lang$core$Native_Utils.update(
			_p34,
			{
				statistics: _elm_lang$core$Native_Utils.update(
					_p35,
					{damage: _p35.damage + damage})
			}) : _p34;
	});
var _user$project$Main$moveCreature = F2(
	function (creature, _p36) {
		var _p37 = _p36;
		var _p51 = _p37._0;
		var randomChoice = function (choices) {
			var _p38 = A2(
				_elm_lang$core$Random$step,
				A2(
					_elm_lang$core$Random$int,
					0,
					_elm_lang$core$List$length(choices) - 1),
				_p51.seed);
			var rnd = _p38._0;
			var seed1 = _p38._1;
			return {
				ctor: '_Tuple2',
				_0: A2(
					_elm_lang$core$Maybe$withDefault,
					{wall: _user$project$Maze$Open, turn: 2},
					A2(
						_elm_lang$core$Array$get,
						rnd,
						_elm_lang$core$Array$fromList(choices))).turn,
				_1: seed1
			};
		};
		var findMonster = function (turn) {
			var _p39 = A4(
				_user$project$Main$step,
				creature.level,
				creature.x,
				creature.y,
				A2(_user$project$Main$cwTurn, creature.orientation, turn));
			var mx = _p39._0;
			var my = _p39._1;
			return A2(
				_user$project$Main$thereIsAThing,
				{ctor: '_Tuple3', _0: creature.level, _1: mx, _2: my},
				_p51.monsters);
		};
		var relRoomCalc = F3(
			function (x, y, orientation) {
				return A2(
					_user$project$Main$absRoom2relRoom,
					A3(_user$project$Maze$getRoom, creature.level, x, y),
					orientation);
			});
		var relRoom = A3(relRoomCalc, creature.x, creature.y, creature.orientation);
		var choices = A2(
			_elm_lang$core$List$filter,
			function (e) {
				return !_elm_lang$core$Native_Utils.eq(e.wall, _user$project$Maze$Solid);
			},
			{
				ctor: '::',
				_0: {wall: relRoom.left, turn: -1},
				_1: {
					ctor: '::',
					_0: {wall: relRoom.front, turn: 0},
					_1: {
						ctor: '::',
						_0: {wall: relRoom.right, turn: 1},
						_1: {
							ctor: '::',
							_0: {wall: relRoom.back, turn: 2},
							_1: {ctor: '[]'}
						}
					}
				}
			});
		var seek = F3(
			function (_p40, orientation, seeSomething) {
				seek:
				while (true) {
					var _p41 = _p40;
					var _p43 = _p41._1;
					var _p42 = _p41._0;
					if (seeSomething(
						{ctor: '_Tuple2', _0: _p42, _1: _p43})) {
						return true;
					} else {
						if (_elm_lang$core$Native_Utils.eq(
							A3(relRoomCalc, _p42, _p43, orientation).front,
							_user$project$Maze$Solid)) {
							return false;
						} else {
							var _v30 = A4(_user$project$Main$step, creature.level, _p42, _p43, orientation),
								_v31 = orientation,
								_v32 = seeSomething;
							_p40 = _v30;
							orientation = _v31;
							seeSomething = _v32;
							continue seek;
						}
					}
				}
			});
		var findPlayer = function (turn) {
			return A3(
				seek,
				{ctor: '_Tuple2', _0: creature.x, _1: creature.y},
				A2(_user$project$Main$cwTurn, creature.orientation, turn),
				function (_p44) {
					var _p45 = _p44;
					return _elm_lang$core$Native_Utils.eq(
						{ctor: '_Tuple3', _0: creature.level, _1: _p45._0, _2: _p45._1},
						{ctor: '_Tuple3', _0: _p51.level, _1: _p51.x, _2: _p51.y});
				});
		};
		var findTreasure = function (turn) {
			return A3(
				seek,
				{ctor: '_Tuple2', _0: creature.x, _1: creature.y},
				A2(_user$project$Main$cwTurn, creature.orientation, turn),
				function (_p46) {
					var _p47 = _p46;
					return A2(
						_user$project$Main$thereIsAThing,
						{ctor: '_Tuple3', _0: creature.level, _1: _p47._0, _2: _p47._1},
						_p51.treasure);
				});
		};
		var _p48 = function () {
			var nomonsters = A2(
				_elm_lang$core$List$filter,
				function (e) {
					return !findMonster(e.turn);
				},
				choices);
			var treasure = A2(
				_elm_lang$core$List$filter,
				function (e) {
					return findTreasure(e.turn);
				},
				choices);
			var player = A2(
				_elm_lang$core$List$filter,
				function (e) {
					return findPlayer(e.turn);
				},
				choices);
			return (!_elm_lang$core$List$isEmpty(player)) ? randomChoice(player) : ((!_elm_lang$core$List$isEmpty(treasure)) ? randomChoice(treasure) : randomChoice(
				(_elm_lang$core$Native_Utils.cmp(
					_elm_lang$core$List$length(nomonsters),
					2) < 0) ? nomonsters : A2(
					_elm_lang$core$List$filter,
					function (e) {
						return !_elm_lang$core$Native_Utils.eq(e.turn, 2);
					},
					nomonsters)));
		}();
		var direction = _p48._0;
		var seed1 = _p48._1;
		var _p49 = A4(
			_user$project$Main$step,
			creature.level,
			creature.x,
			creature.y,
			A2(_user$project$Main$cwTurn, creature.orientation, direction));
		var nx = _p49._0;
		var ny = _p49._1;
		var _p50 = _elm_lang$core$List$isEmpty(
			A2(
				_user$project$Main$matchPosition,
				{ctor: '_Tuple3', _0: creature.level, _1: nx, _2: ny},
				_p51.monsters)) ? {ctor: '_Tuple2', _0: nx, _1: ny} : {ctor: '_Tuple2', _0: creature.x, _1: creature.y};
		var xx = _p50._0;
		var yy = _p50._1;
		var ncreature = _elm_lang$core$Native_Utils.update(
			creature,
			{
				x: xx,
				y: yy,
				orientation: A2(_user$project$Main$cwTurn, creature.orientation, direction)
			});
		var monsters = {
			ctor: '::',
			_0: ncreature,
			_1: A2(
				_elm_lang$core$List$filter,
				function (e) {
					return !A2(_user$project$Main$equalPosition, creature, e);
				},
				_p51.monsters)
		};
		return A2(
			_user$project$Main$sndCreature,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					_p51,
					{seed: seed1, monsters: monsters}),
				_1: _p37._1
			},
			ncreature);
	});
var _user$project$Main$isDeadCreature = function (creature) {
	return _elm_lang$core$Native_Utils.cmp(creature.statistics.power, creature.statistics.damage) < 1;
};
var _user$project$Main$isTimeToAttack = function (creature) {
	return _elm_lang$core$Native_Utils.cmp(creature.statistics.attackRate, creature.actionCounter) < 0;
};
var _user$project$Main$isTimeToMove = function (creature) {
	return _elm_lang$core$Native_Utils.cmp(creature.statistics.moveRate, creature.actionCounter) < 0;
};
var _user$project$Main$isFainted = function (model) {
	return _elm_lang$core$Native_Utils.cmp(1200, model.bpm) < 1;
};
var _user$project$Main$canClimbDown = function (x) {
	return A2(
		_elm_lang$core$List$member,
		x,
		{
			ctor: '::',
			_0: _user$project$Maze$Open,
			_1: {
				ctor: '::',
				_0: _user$project$Maze$Ladder,
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Main$canClimbUp = function (x) {
	return A2(
		_elm_lang$core$List$member,
		x,
		{
			ctor: '::',
			_0: _user$project$Maze$Ladder,
			_1: {ctor: '[]'}
		});
};
var _user$project$Main$v_climb = F3(
	function (len, adverbs, model) {
		var room = A3(_user$project$Maze$getRoom, model.level, model.x, model.y);
		var _p52 = {ctor: '_Tuple2', _0: len, _1: adverbs};
		_v35_2:
		do {
			if ((_p52.ctor === '_Tuple2') && (_p52._0 === 2)) {
				switch (_p52._1) {
					case 'Up':
						return _user$project$Main$canClimbUp(room.ceiling) ? {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{good: true, level: model.level - 1, display: 'prepare'}),
							_1: _elm_lang$core$Platform_Cmd$none
						} : {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{good: true}),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					case 'Down':
						return _user$project$Main$canClimbDown(room.floor) ? {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{good: true, level: model.level + 1, display: 'prepare'}),
							_1: _elm_lang$core$Platform_Cmd$none
						} : {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{good: true}),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					default:
						break _v35_2;
				}
			} else {
				break _v35_2;
			}
		} while(false);
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{good: false}),
			_1: _elm_lang$core$Platform_Cmd$none
		};
	});
var _user$project$Main$canReveal = F2(
	function (x, model) {
		return _elm_lang$core$Native_Utils.cmp(x.power, model.power) < 0;
	});
var _user$project$Main$isIncantedRing = function (weapon) {
	return _elm_lang$core$Native_Utils.eq(weapon.$class, _user$project$Thing$Ring) && (_elm_lang$core$Native_Utils.cmp(0, weapon.charges) < 0);
};
var _user$project$Main$consumeRingCharge = function (weapon) {
	return _user$project$Main$isIncantedRing(weapon) ? ((_elm_lang$core$Native_Utils.cmp(1, weapon.charges) < 0) ? _elm_lang$core$Native_Utils.update(
		weapon,
		{charges: weapon.charges - 1}) : A2(_user$project$Main$item, _user$project$Thing$GoldRing, weapon.id)) : weapon;
};
var _user$project$Main$isRevealedScroll = function (x) {
	return x.revealed && (_elm_lang$core$Native_Utils.eq(x.adj, 'Vision') || _elm_lang$core$Native_Utils.eq(x.adj, 'Seer'));
};
var _user$project$Main$useScroll = F2(
	function (object, model) {
		return _user$project$Main$isRevealedScroll(object) ? {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{
					display: _elm_lang$core$String$toLower(object.adj)
				}),
			_1: _user$project$SoundPort$playSound(
				{
					url: _user$project$Main$sound(_user$project$Thing$Scroll),
					volume: 1.0
				})
		} : {
			ctor: '_Tuple2',
			_0: model,
			_1: _user$project$SoundPort$playSound(
				{
					url: _user$project$Main$sound(_user$project$Thing$Scroll),
					volume: 1.0
				})
		};
	});
var _user$project$Main$isLitTorch = function (x) {
	return x.flag && _elm_lang$core$Native_Utils.eq(x.$class, _user$project$Thing$Torch);
};
var _user$project$Main$gotoLevelFour = F2(
	function (model, creature) {
		var emptyInventory = function (inventory) {
			return A2(_elm_lang$core$List$filter, _user$project$Main$isLitTorch, inventory);
		};
		return (!_elm_lang$core$Native_Utils.eq(creature.statistics.creature, _user$project$Thing$Demon)) ? model : _elm_lang$core$Native_Utils.update(
			model,
			{
				level: 3,
				x: 10,
				y: 16,
				display: 'intermission',
				inventory: emptyInventory(model.inventory)
			});
	});
var _user$project$Main$updateTorch = function (model) {
	var consumeTorch = function (object) {
		return (_user$project$Main$isLitTorch(object) && (_elm_lang$core$Native_Utils.cmp(0, object.charges) < 0)) ? _elm_lang$core$Native_Utils.update(
			object,
			{
				adj: (_elm_lang$core$Native_Utils.cmp(object.charges, 7) < 0) ? 'Dead' : object.adj,
				normalLight: A2(_elm_lang$core$Basics$min, object.charges - 1, object.normalLight),
				magicLight: A2(_elm_lang$core$Basics$min, object.charges - 1, object.magicLight),
				charges: object.charges - 1,
				revealed: (_elm_lang$core$Native_Utils.cmp(object.charges, 7) < 0) ? true : object.revealed
			}) : object;
	};
	return {
		ctor: '_Tuple2',
		_0: _elm_lang$core$Native_Utils.update(
			model,
			{
				inventory: A2(_elm_lang$core$List$map, consumeTorch, model.inventory)
			}),
		_1: _elm_lang$core$Platform_Cmd$none
	};
};
var _user$project$Main$backpack = F2(
	function (model, object) {
		return _user$project$Main$isLitTorch(object) ? A2(
			_elm_lang$html$Html$span,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					{
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'color',
							_1: _user$project$Main$backgroundColor(model)
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 'background-color',
								_1: _user$project$Main$foregroundColor(model)
							},
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(
					_user$project$Main$name(object)),
				_1: {ctor: '[]'}
			}) : A2(
			_elm_lang$html$Html$span,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(
					_user$project$Main$name(object)),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Main$viewText = function (model) {
	var objects = A2(
		_elm_lang$core$List$map,
		function (e) {
			return _user$project$Main$name(e.object);
		},
		A2(
			_elm_lang$core$List$filter,
			_user$project$Main$equalPosition(model),
			model.treasure));
	var rowsHtml = function (lst) {
		var _p53 = lst;
		if (_p53.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			if (_p53._1.ctor === '[]') {
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$tr,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$style(
								{
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'width', _1: '100%'},
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$td,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$style(
										{
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'padding', _1: '0px 20px'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'right'},
												_1: {ctor: '[]'}
											}
										}),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _p53._0,
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$td,
									{ctor: '[]'},
									{ctor: '[]'}),
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				};
			} else {
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$tr,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$style(
								{
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'width', _1: '100%'},
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$td,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$style(
										{
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'padding', _1: '0px 20px'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'right'},
												_1: {ctor: '[]'}
											}
										}),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _p53._0,
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$td,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$style(
											{
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'padding', _1: '0px 20px'},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'left'},
													_1: {ctor: '[]'}
												}
											}),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _p53._1._0,
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						}),
					_1: rowsHtml(_p53._1._1)
				};
			}
		}
	};
	var rows = function (lst) {
		var _p54 = lst;
		if (_p54.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			if (_p54._1.ctor === '[]') {
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$tr,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$style(
								{
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'width', _1: '100%'},
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$td,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$style(
										{
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'padding', _1: '0px 20px'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'right'},
												_1: {ctor: '[]'}
											}
										}),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(_p54._0),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$td,
									{ctor: '[]'},
									{ctor: '[]'}),
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				};
			} else {
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$tr,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$style(
								{
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'width', _1: '100%'},
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$td,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$style(
										{
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'padding', _1: '0px 20px'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'right'},
												_1: {ctor: '[]'}
											}
										}),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(_p54._0),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$td,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$style(
											{
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'padding', _1: '0px 20px'},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'left'},
													_1: {ctor: '[]'}
												}
											}),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text(_p54._1._0),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						}),
					_1: rows(_p54._1._1)
				};
			}
		}
	};
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'color',
						_1: _user$project$Main$foregroundColor(model)
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'background',
							_1: _user$project$Main$backgroundColor(model)
						},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'font-family', _1: 'fantasy'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'width', _1: '768px'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'height', _1: '456px'},
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$table,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'width', _1: '100%'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'table-layout', _1: 'fixed'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'border', _1: 'none'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'border-spacing', _1: '0px'},
										_1: {ctor: '[]'}
									}
								}
							}
						}),
					_1: {ctor: '[]'}
				},
				_elm_lang$core$List$concat(
					{
						ctor: '::',
						_0: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$tr,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$style(
										{
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'width', _1: '100%'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'center'},
												_1: {ctor: '[]'}
											}
										}),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$td,
										{
											ctor: '::',
											_0: A2(_elm_lang$html$Html_Attributes$attribute, 'colspan', '2'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$span,
												{
													ctor: '::',
													_0: _elm_lang$html$Html_Attributes$style(
														{
															ctor: '::',
															_0: {ctor: '_Tuple2', _0: 'font-style', _1: 'italic'},
															_1: {ctor: '[]'}
														}),
													_1: {ctor: '[]'}
												},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('- In This Room -'),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}),
							_1: rows(
								A2(
									_elm_lang$core$List$any,
									_user$project$Main$equalPosition(model),
									model.monsters) ? {ctor: '::', _0: '! Creature !', _1: objects} : objects)
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$tr,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$style(
											{
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'width', _1: '100%'},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'center'},
													_1: {ctor: '[]'}
												}
											}),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$td,
											{
												ctor: '::',
												_0: A2(_elm_lang$html$Html_Attributes$attribute, 'colspan', '2'),
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text(
													A2(_elm_lang$core$String$repeat, 41, ' ')),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$tr,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$style(
												{
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'width', _1: '100%'},
													_1: {
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'center'},
														_1: {ctor: '[]'}
													}
												}),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$td,
												{
													ctor: '::',
													_0: A2(_elm_lang$html$Html_Attributes$attribute, 'colspan', '2'),
													_1: {ctor: '[]'}
												},
												{
													ctor: '::',
													_0: A2(
														_elm_lang$html$Html$span,
														{
															ctor: '::',
															_0: _elm_lang$html$Html_Attributes$style(
																{
																	ctor: '::',
																	_0: {ctor: '_Tuple2', _0: 'font-style', _1: 'italic'},
																	_1: {ctor: '[]'}
																}),
															_1: {ctor: '[]'}
														},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text('- Backpack -'),
															_1: {ctor: '[]'}
														}),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}),
									_1: rowsHtml(
										A2(
											_elm_lang$core$List$map,
											function (e) {
												return A2(_user$project$Main$backpack, model, e);
											},
											model.inventory))
								},
								_1: {ctor: '[]'}
							}
						}
					})),
			_1: {ctor: '[]'}
		});
};
var _user$project$Main$isDead = function (model) {
	return _elm_lang$core$Native_Utils.cmp(model.power, model.damage) < 0;
};
var _user$project$Main$updateHeart = function (model) {
	var status = _user$project$Main$isDead(model) ? 'dead' : (_user$project$Main$isFainted(model) ? 'fainted' : 'alive');
	var toggleHeart = _elm_lang$core$Native_Utils.eq(model.heart, 'xx-small') ? 'medium' : 'xx-small';
	var bpm = _user$project$Main$calcBpm(model);
	return {
		ctor: '_Tuple2',
		_0: _elm_lang$core$Native_Utils.update(
			model,
			{heart: toggleHeart, damage: model.damage * (63 / 64), bpm: bpm, status: status}),
		_1: _user$project$SoundPort$playSound(
			{
				url: _user$project$Main$sound(_user$project$Thing$Heart),
				volume: 0.25
			})
	};
};
var _user$project$Main$emptyHand = A2(_user$project$Main$item, _user$project$Thing$Empty, 0);
var _user$project$Main$isEmptyItem = function (obj) {
	return _elm_lang$core$Native_Utils.eq(obj, _user$project$Main$emptyHand);
};
var _user$project$Main$treasureCreature = F2(
	function (creature, _p55) {
		var _p56 = _p55;
		var _p57 = _p56._0;
		var treasure = A2(
			_user$project$Main$findFirst,
			_user$project$Main$equalPosition(creature),
			_p57.treasure);
		var treasure1 = A2(
			_elm_lang$core$List$filter,
			F2(
				function (x, y) {
					return !_elm_lang$core$Native_Utils.eq(x, y);
				})(
				A2(
					_elm_lang$core$Maybe$withDefault,
					{level: 0, x: 0, y: 0, object: _user$project$Main$emptyHand},
					treasure)),
			_p57.treasure);
		var ncreature = _elm_lang$core$Native_Utils.update(
			creature,
			{
				inventory: {
					ctor: '::',
					_0: A2(
						_elm_lang$core$Maybe$withDefault,
						{level: 0, x: 0, y: 0, object: _user$project$Main$emptyHand},
						treasure).object,
					_1: creature.inventory
				}
			});
		var monsters = {
			ctor: '::',
			_0: ncreature,
			_1: A2(
				_elm_lang$core$List$filter,
				function (e) {
					return !A2(_user$project$Main$equalPosition, creature, e);
				},
				_p57.monsters)
		};
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				_p57,
				{treasure: treasure1, monsters: monsters}),
			_1: _p56._1
		};
	});
var _user$project$Main$getRightHand = function (model) {
	return A2(
		_elm_lang$core$Maybe$withDefault,
		_user$project$Main$emptyHand,
		_elm_lang$core$List$head(model.rightHand));
};
var _user$project$Main$getLeftHand = function (model) {
	return A2(
		_elm_lang$core$Maybe$withDefault,
		_user$project$Main$emptyHand,
		_elm_lang$core$List$head(model.leftHand));
};
var _user$project$Main$calcDefence = function (model) {
	return {
		resistance: A2(
			_elm_lang$core$Basics$min,
			_user$project$Main$getLeftHand(model).resistance,
			_user$project$Main$getRightHand(model).resistance),
		defence: A2(
			_elm_lang$core$Basics$min,
			_user$project$Main$getLeftHand(model).defence,
			_user$project$Main$getRightHand(model).defence)
	};
};
var _user$project$Main$creatureAttacks = F2(
	function (creature, _p58) {
		var _p59 = _p58;
		var _p61 = _p59._0;
		var snd = _elm_lang$core$Platform_Cmd$batch(
			{
				ctor: '::',
				_0: _p59._1,
				_1: {
					ctor: '::',
					_0: _user$project$SoundPort$playSound(
						{
							url: _user$project$Main$sound(creature.statistics.creature),
							volume: 1.0
						}),
					_1: {ctor: '[]'}
				}
			});
		var monsters = {
			ctor: '::',
			_0: creature,
			_1: A2(
				_elm_lang$core$List$filter,
				function (e) {
					return !A2(_user$project$Main$equalPosition, creature, e);
				},
				_p61.monsters)
		};
		var _p60 = A4(_user$project$Main$randomHit, _p61, _p61.power, _p61.damage, creature.statistics.power);
		var model1 = _p60._0;
		var isHit = _p60._1;
		var damage = isHit ? A5(
			_user$project$Main$calcDamage,
			creature.statistics.power,
			creature.statistics.magic,
			_user$project$Main$calcDefence(_p61).resistance,
			creature.statistics.attack,
			_user$project$Main$calcDefence(_p61).defence) : 0;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				_p61,
				{seed: model1.seed, monsters: monsters, damage: _p61.damage + damage}),
			_1: snd
		};
	});
var _user$project$Main$updateCreature = F2(
	function (creature, _p62) {
		var _p63 = _p62;
		var _p66 = _p63._0;
		var _p65 = _p63._1;
		var player = A2(_user$project$Main$equalPosition, _p66, creature);
		var treasure = A2(
			_user$project$Main$findFirst,
			_user$project$Main$equalPosition(creature),
			_p66.treasure);
		var action = ((!_elm_lang$core$Native_Utils.eq(treasure, _elm_lang$core$Maybe$Nothing)) && (!A2(
			_elm_lang$core$List$member,
			creature.statistics.creature,
			{
				ctor: '::',
				_0: _user$project$Thing$Scorpion,
				_1: {
					ctor: '::',
					_0: _user$project$Thing$MoonWizard,
					_1: {
						ctor: '::',
						_0: _user$project$Thing$Demon,
						_1: {ctor: '[]'}
					}
				}
			}))) ? 'treasure' : (player ? 'attack' : 'move');
		var _p64 = action;
		switch (_p64) {
			case 'treasure':
				return _user$project$Main$isTimeToAttack(creature) ? A2(
					_user$project$Main$treasureCreature,
					_elm_lang$core$Native_Utils.update(
						creature,
						{actionCounter: 0}),
					{ctor: '_Tuple2', _0: _p66, _1: _p65}) : {ctor: '_Tuple2', _0: _p66, _1: _p65};
			case 'attack':
				return _user$project$Main$isTimeToAttack(creature) ? A2(
					_user$project$Main$creatureAttacks,
					_elm_lang$core$Native_Utils.update(
						creature,
						{actionCounter: 0}),
					{ctor: '_Tuple2', _0: _p66, _1: _p65}) : {ctor: '_Tuple2', _0: _p66, _1: _p65};
			case 'move':
				return _user$project$Main$isTimeToMove(creature) ? A2(
					_user$project$Main$moveCreature,
					_elm_lang$core$Native_Utils.update(
						creature,
						{actionCounter: 0}),
					{ctor: '_Tuple2', _0: _p66, _1: _p65}) : {ctor: '_Tuple2', _0: _p66, _1: _p65};
			default:
				return {ctor: '_Tuple2', _0: _p66, _1: _p65};
		}
	});
var _user$project$Main$updateCreatures = function (model) {
	var creatures_a = A2(
		_elm_lang$core$List$map,
		function (e) {
			return _elm_lang$core$Native_Utils.update(
				e,
				{actionCounter: e.actionCounter + 1});
		},
		model.monsters);
	var _p67 = A3(
		_elm_lang$core$List$foldl,
		F2(
			function (e, _p68) {
				var _p69 = _p68;
				return A2(
					_user$project$Main$updateCreature,
					e,
					{ctor: '_Tuple2', _0: _p69._0, _1: _p69._1});
			}),
		{
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{monsters: creatures_a}),
			_1: _elm_lang$core$Platform_Cmd$none
		},
		creatures_a);
	var nmodel = _p67._0;
	var ncmd = _p67._1;
	return (_elm_lang$core$Native_Utils.cmp(model.damage, nmodel.damage) < 0) ? {
		ctor: '_Tuple2',
		_0: nmodel,
		_1: _elm_lang$core$Platform_Cmd$batch(
			{
				ctor: '::',
				_0: ncmd,
				_1: {
					ctor: '::',
					_0: _user$project$SoundPort$playSound(
						{
							url: _user$project$Main$sound(_user$project$Thing$CreatureHitPlayer),
							volume: 1.0
						}),
					_1: {ctor: '[]'}
				}
			})
	} : {ctor: '_Tuple2', _0: nmodel, _1: ncmd};
};
var _user$project$Main$statusBar = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'color',
						_1: _user$project$Main$backgroundColor(model)
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'background',
							_1: _user$project$Main$foregroundColor(model)
						},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'font-family', _1: 'fantasy'},
							_1: {ctor: '[]'}
						}
					}
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$table,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'width', _1: '100%'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'table-layout', _1: 'fixed'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'padding', _1: '0px'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'border', _1: 'none'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'border-spacing', _1: '0px'},
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$tr,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$td,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$style(
										{
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'left'},
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(
										_user$project$Main$name(
											_user$project$Main$getLeftHand(model))),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$td,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$style(
											{
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'center'},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'height', _1: '30px'},
													_1: {
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'font-size', _1: model.heart},
														_1: {ctor: '[]'}
													}
												}
											}),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text(
											_elm_lang$core$String$fromChar(
												_elm_lang$core$Char$fromCode(9829))),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$td,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$style(
												{
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'right'},
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text(
												_user$project$Main$name(
													_user$project$Main$getRightHand(model))),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							}
						}),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		});
};
var _user$project$Main$setInventory = F2(
	function (model, xs) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{inventory: xs});
	});
var _user$project$Main$setTreasure = F2(
	function (model, xs) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{treasure: xs});
	});
var _user$project$Main$setLeftHand = F2(
	function (model, x) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{
				leftHand: {
					ctor: '::',
					_0: x,
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Main$setRightHand = F2(
	function (model, x) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{
				rightHand: {
					ctor: '::',
					_0: x,
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Main$hand = function (adverb) {
	var _p70 = adverb;
	switch (_p70) {
		case 'Right':
			return {get: _user$project$Main$getRightHand, set: _user$project$Main$setRightHand};
		case 'Left':
			return {get: _user$project$Main$getLeftHand, set: _user$project$Main$setLeftHand};
		default:
			return {
				get: function (model) {
					return _user$project$Main$emptyHand;
				},
				set: F2(
					function (model, _p71) {
						return model;
					})
			};
	}
};
var _user$project$Main$useTorch = F5(
	function (len, adverbs, adjectives, nouns, model) {
		var insert = F2(
			function (object, model) {
				return _elm_lang$core$Native_Utils.update(
					model,
					{
						inventory: A2(
							_elm_lang$core$List$append,
							A2(
								_elm_lang$core$List$map,
								function (e) {
									return _user$project$Main$isLitTorch(e) ? _elm_lang$core$Native_Utils.update(
										e,
										{flag: false}) : e;
								},
								model.inventory),
							{
								ctor: '::',
								_0: object,
								_1: {ctor: '[]'}
							})
					});
			});
		var source = _user$project$Main$hand(adverbs);
		var object = source.get(model);
		var remove = F2(
			function (object, model) {
				return A2(source.set, model, _user$project$Main$emptyHand);
			});
		var action = function (model) {
			return A4(
				_user$project$Main$moveItem,
				_elm_lang$core$Native_Utils.update(
					object,
					{flag: true}),
				remove,
				insert,
				model);
		};
		return {
			ctor: '_Tuple2',
			_0: action(model),
			_1: _user$project$SoundPort$playSound(
				{
					url: _user$project$Main$sound(_user$project$Thing$Torch),
					volume: 1.0
				})
		};
	});
var _user$project$Main$useFlask = F2(
	function (adverbs, model) {
		var target = _user$project$Main$hand(adverbs);
		var obj = target.get(model);
		var modelp = function () {
			var _p72 = obj.adj;
			switch (_p72) {
				case 'Abye':
					return _elm_lang$core$Native_Utils.update(
						model,
						{damage: model.damage + (0.8 * model.power)});
				case 'Hale':
					return _elm_lang$core$Native_Utils.update(
						model,
						{damage: 0});
				case 'Thews':
					return _elm_lang$core$Native_Utils.update(
						model,
						{power: model.power + 1000});
				default:
					return model;
			}
		}();
		var modelq = A2(
			target.set,
			modelp,
			A2(_user$project$Main$item, _user$project$Thing$EmptyFlask, obj.id));
		return {
			ctor: '_Tuple2',
			_0: modelq,
			_1: _user$project$SoundPort$playSound(
				{
					url: _user$project$Main$sound(_user$project$Thing$Flask),
					volume: 1.0
				})
		};
	});
var _user$project$Main$v_use = F5(
	function (len, adverbs, adjectives, nouns, model) {
		var target = _user$project$Main$hand(adverbs);
		var obj = target.get(model);
		var action = F2(
			function (nouns, model) {
				var _p73 = target.get(model).noun;
				switch (_p73) {
					case 'Torch':
						var _p74 = obj.adj;
						switch (_p74) {
							case 'Dead':
								return A5(_user$project$Main$useTorch, len, adverbs, adjectives, nouns, model);
							case 'Pine':
								return A5(_user$project$Main$useTorch, len, adverbs, adjectives, nouns, model);
							case 'Lunar':
								return A5(_user$project$Main$useTorch, len, adverbs, adjectives, nouns, model);
							case 'Solar':
								return A5(_user$project$Main$useTorch, len, adverbs, adjectives, nouns, model);
							default:
								return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
						}
					case 'Scroll':
						var _p75 = obj.adj;
						switch (_p75) {
							case 'Vision':
								return A2(_user$project$Main$useScroll, obj, model);
							case 'Seer':
								return A2(_user$project$Main$useScroll, obj, model);
							default:
								return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
						}
					case 'Flask':
						var _p76 = obj.adj;
						switch (_p76) {
							case 'Abye':
								return A2(_user$project$Main$useFlask, adverbs, model);
							case 'Hale':
								return A2(_user$project$Main$useFlask, adverbs, model);
							case 'Thews':
								return A2(_user$project$Main$useFlask, adverbs, model);
							default:
								return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
						}
					default:
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{good: false}),
							_1: _elm_lang$core$Platform_Cmd$none
						};
				}
			});
		var _p77 = {ctor: '_Tuple2', _0: len, _1: adverbs};
		_v49_2:
		do {
			if ((_p77.ctor === '_Tuple2') && (_p77._0 === 2)) {
				switch (_p77._1) {
					case 'Left':
						return A2(
							action,
							nouns,
							_elm_lang$core$Native_Utils.update(
								model,
								{good: true}));
					case 'Right':
						return A2(
							action,
							nouns,
							_elm_lang$core$Native_Utils.update(
								model,
								{good: true}));
					default:
						break _v49_2;
				}
			} else {
				break _v49_2;
			}
		} while(false);
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{good: false}),
			_1: _elm_lang$core$Platform_Cmd$none
		};
	});
var _user$project$Main$v_drop = F3(
	function (len, adverbs, model) {
		var insert = F2(
			function (object, model) {
				return _elm_lang$core$Native_Utils.update(
					model,
					{
						treasure: {
							ctor: '::',
							_0: {level: model.level, x: model.x, y: model.y, object: object},
							_1: model.treasure
						}
					});
			});
		var source = _user$project$Main$hand(adverbs);
		var obj = source.get(model);
		var remove = F2(
			function (object, model) {
				return _user$project$Main$updateWeight(
					A2(source.set, model, _user$project$Main$emptyHand));
			});
		var action = function (model) {
			return A4(_user$project$Main$moveItem, obj, remove, insert, model);
		};
		var _p78 = {ctor: '_Tuple2', _0: len, _1: adverbs};
		_v50_2:
		do {
			if ((_p78.ctor === '_Tuple2') && (_p78._0 === 2)) {
				switch (_p78._1) {
					case 'Right':
						return _user$project$Main$isEmptyItem(obj) ? {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{good: true, response: ' ???'}),
							_1: _elm_lang$core$Platform_Cmd$none
						} : {
							ctor: '_Tuple2',
							_0: action(
								_elm_lang$core$Native_Utils.update(
									model,
									{good: true})),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					case 'Left':
						return _user$project$Main$isEmptyItem(obj) ? {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{good: true, response: ' ???'}),
							_1: _elm_lang$core$Platform_Cmd$none
						} : {
							ctor: '_Tuple2',
							_0: action(
								_elm_lang$core$Native_Utils.update(
									model,
									{good: true})),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					default:
						break _v50_2;
				}
			} else {
				break _v50_2;
			}
		} while(false);
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{good: false}),
			_1: _elm_lang$core$Platform_Cmd$none
		};
	});
var _user$project$Main$v_stow = F3(
	function (len, adverbs, model) {
		var insert = F2(
			function (object, model) {
				return _elm_lang$core$Native_Utils.update(
					model,
					{
						inventory: {ctor: '::', _0: object, _1: model.inventory}
					});
			});
		var source = _user$project$Main$hand(adverbs);
		var obj = source.get(model);
		var remove = F2(
			function (object, model) {
				return A2(source.set, model, _user$project$Main$emptyHand);
			});
		var action = function (model) {
			return A4(_user$project$Main$moveItem, obj, remove, insert, model);
		};
		var _p79 = {ctor: '_Tuple2', _0: len, _1: adverbs};
		_v51_2:
		do {
			if ((_p79.ctor === '_Tuple2') && (_p79._0 === 2)) {
				switch (_p79._1) {
					case 'Right':
						return _user$project$Main$isEmptyItem(obj) ? {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{good: true, response: ' ???'}),
							_1: _elm_lang$core$Platform_Cmd$none
						} : {
							ctor: '_Tuple2',
							_0: action(
								_elm_lang$core$Native_Utils.update(
									model,
									{good: true})),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					case 'Left':
						return _user$project$Main$isEmptyItem(obj) ? {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{good: true, response: ' ???'}),
							_1: _elm_lang$core$Platform_Cmd$none
						} : {
							ctor: '_Tuple2',
							_0: action(
								_elm_lang$core$Native_Utils.update(
									model,
									{good: true})),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					default:
						break _v51_2;
				}
			} else {
				break _v51_2;
			}
		} while(false);
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{good: false}),
			_1: _elm_lang$core$Platform_Cmd$none
		};
	});
var _user$project$Main$v_get = F5(
	function (len, adverbs, adjectives, nouns, model) {
		var match = F4(
			function (adj, noun, model, obj) {
				return _elm_lang$core$Native_Utils.eq(obj.object.noun, noun) && (A2(_user$project$Main$equalPosition, obj, model) && (_elm_lang$core$Native_Utils.eq(adj, '') || (_elm_lang$core$Native_Utils.eq(obj.object.adj, adj) && obj.object.revealed)));
			});
		var remove = F2(
			function (object, model) {
				return _elm_lang$core$Native_Utils.update(
					model,
					{
						treasure: A2(
							_elm_lang$core$List$filter,
							F2(
								function (x, y) {
									return !_elm_lang$core$Native_Utils.eq(x, y);
								})(object),
							model.treasure)
					});
			});
		var object = A2(
			_elm_lang$core$Maybe$withDefault,
			{level: 0, x: 0, y: 0, object: _user$project$Main$emptyHand},
			A2(
				_user$project$Main$findFirst,
				A3(match, adjectives, nouns, model),
				model.treasure));
		var target = _user$project$Main$hand(adverbs);
		var handFull = !_elm_lang$core$Native_Utils.eq(
			target.get(model),
			_user$project$Main$emptyHand);
		var insert = F2(
			function (object, model) {
				return _user$project$Main$updateWeight(
					A2(target.set, model, object.object));
			});
		var action = function (model) {
			return A4(_user$project$Main$moveItem, object, remove, insert, model);
		};
		var exec = handFull ? {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{good: true, response: ' ???'}),
			_1: _elm_lang$core$Platform_Cmd$none
		} : {
			ctor: '_Tuple2',
			_0: action(
				_elm_lang$core$Native_Utils.update(
					model,
					{good: true})),
			_1: _elm_lang$core$Platform_Cmd$none
		};
		var _p80 = {ctor: '_Tuple4', _0: len, _1: adverbs, _2: adjectives, _3: nouns};
		_v52_4:
		do {
			if (_p80.ctor === '_Tuple4') {
				switch (_p80._0) {
					case 3:
						if (_p80._2 === '') {
							switch (_p80._1) {
								case 'Left':
									return exec;
								case 'Right':
									return exec;
								default:
									break _v52_4;
							}
						} else {
							break _v52_4;
						}
					case 4:
						switch (_p80._1) {
							case 'Left':
								return exec;
							case 'Right':
								return exec;
							default:
								break _v52_4;
						}
					default:
						break _v52_4;
				}
			} else {
				break _v52_4;
			}
		} while(false);
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{good: false}),
			_1: _elm_lang$core$Platform_Cmd$none
		};
	});
var _user$project$Main$v_pull = F5(
	function (len, adverbs, adjectives, nouns, model) {
		var match = F4(
			function (adj, noun, model, obj) {
				return _elm_lang$core$Native_Utils.eq(obj.noun, noun) && (_elm_lang$core$Native_Utils.eq(adj, '') || (_elm_lang$core$Native_Utils.eq(obj.adj, adj) && obj.revealed));
			});
		var object = A2(
			_elm_lang$core$Maybe$withDefault,
			_user$project$Main$emptyHand,
			A2(
				_user$project$Main$findFirst,
				A3(match, adjectives, nouns, model),
				model.inventory));
		var remove = F2(
			function (object, model) {
				return _elm_lang$core$Native_Utils.update(
					model,
					{
						inventory: A2(
							_elm_lang$core$List$filter,
							F2(
								function (x, y) {
									return !_elm_lang$core$Native_Utils.eq(x, y);
								})(object),
							model.inventory)
					});
			});
		var target = _user$project$Main$hand(adverbs);
		var handFull = !_elm_lang$core$Native_Utils.eq(
			target.get(model),
			_user$project$Main$emptyHand);
		var insert = F2(
			function (object, model) {
				return A2(
					target.set,
					model,
					_user$project$Main$isLitTorch(object) ? _elm_lang$core$Native_Utils.update(
						object,
						{flag: false}) : object);
			});
		var action = function (model) {
			return A4(_user$project$Main$moveItem, object, remove, insert, model);
		};
		var exec = handFull ? {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{good: true, response: ' ???'}),
			_1: _elm_lang$core$Platform_Cmd$none
		} : {
			ctor: '_Tuple2',
			_0: action(
				_elm_lang$core$Native_Utils.update(
					model,
					{good: true})),
			_1: _elm_lang$core$Platform_Cmd$none
		};
		var _p81 = {ctor: '_Tuple4', _0: len, _1: adverbs, _2: adjectives, _3: nouns};
		_v53_4:
		do {
			if (_p81.ctor === '_Tuple4') {
				switch (_p81._0) {
					case 3:
						if (_p81._2 === '') {
							switch (_p81._1) {
								case 'Left':
									return exec;
								case 'Right':
									return exec;
								default:
									break _v53_4;
							}
						} else {
							break _v53_4;
						}
					case 4:
						switch (_p81._1) {
							case 'Left':
								return exec;
							case 'Right':
								return exec;
							default:
								break _v53_4;
						}
					default:
						break _v53_4;
				}
			} else {
				break _v53_4;
			}
		} while(false);
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{good: false}),
			_1: _elm_lang$core$Platform_Cmd$none
		};
	});
var _user$project$Main$v_attack = F3(
	function (len, adverbs, model) {
		var monster = A2(
			_elm_lang$core$List$filter,
			_user$project$Main$equalPosition(model),
			model.monsters);
		var m = A2(
			_elm_lang$core$Maybe$withDefault,
			{
				level: 0,
				x: 0,
				y: 0,
				orientation: 0,
				actionCounter: 0,
				statistics: _user$project$Main$creature(_user$project$Thing$Spider),
				inventory: {ctor: '[]'}
			},
			_elm_lang$core$List$head(monster));
		var target = _user$project$Main$hand(adverbs);
		var weapon = target.get(model);
		var selfDamage = ((model.power * (weapon.attack + weapon.magic)) / 8) / 128;
		var workingTorch = _elm_lang$core$Native_Utils.cmp(
			0,
			_elm_lang$core$List$length(
				A2(
					_elm_lang$core$List$filter,
					function (e) {
						return _user$project$Main$isLitTorch(e) && (!_elm_lang$core$Native_Utils.eq(e.adj, 'Dead'));
					},
					model.inventory))) < 0;
		var _p82 = A4(_user$project$Main$randomHit, model, m.statistics.power, m.statistics.damage, model.power);
		var model1 = _p82._0;
		var isHit = _p82._1;
		var _p83 = A2(
			_elm_lang$core$Random$step,
			A2(_elm_lang$core$Random$int, 0, 255),
			model1.seed);
		var rnd = _p83._0;
		var seed2 = _p83._1;
		var isHailMaryHit = _elm_lang$core$Native_Utils.cmp(rnd, 64) < 0;
		var model2 = A2(
			target.set,
			_elm_lang$core$Native_Utils.update(
				model,
				{good: true, seed: seed2, response: ' !!!', damage: model.damage + selfDamage}),
			_user$project$Main$consumeRingCharge(weapon));
		var damage = _elm_lang$core$List$isEmpty(monster) ? 0 : (_user$project$Main$isIncantedRing(weapon) ? A5(_user$project$Main$calcDamage, model.power, weapon.magic, m.statistics.resistance, weapon.attack, m.statistics.defence) : ((workingTorch && isHit) ? A5(_user$project$Main$calcDamage, model.power, weapon.magic, m.statistics.resistance, weapon.attack, m.statistics.defence) : (((!workingTorch) && isHailMaryHit) ? A5(_user$project$Main$calcDamage, model.power, weapon.magic, m.statistics.resistance, weapon.attack, m.statistics.defence) : 0)));
		var damagedCreature = A3(_user$project$Main$damageCreature, model, damage, m);
		var _p84 = monster;
		if ((_p84.ctor === '::') && (_p84._1.ctor === '[]')) {
			var _p85 = _p84._0;
			return _user$project$Main$isDeadCreature(damagedCreature) ? {
				ctor: '_Tuple2',
				_0: A2(
					_user$project$Main$gotoLevelFour,
					_elm_lang$core$Native_Utils.update(
						model2,
						{
							monsters: A2(
								_elm_lang$core$List$filter,
								function (e) {
									return !A2(_user$project$Main$equalPosition, model, e);
								},
								model.monsters),
							treasure: A2(
								_elm_lang$core$List$append,
								model.treasure,
								A2(
									_elm_lang$core$List$map,
									function (e) {
										return {level: model.level, x: model.x, y: model.y, object: e};
									},
									_p85.inventory)),
							power: model.power + ((1 / 8) * _p85.statistics.power)
						}),
					damagedCreature),
				_1: _elm_lang$core$Platform_Cmd$batch(
					{
						ctor: '::',
						_0: _user$project$SoundPort$playSound(
							{
								url: _user$project$Main$sound(weapon.$class),
								volume: 1.0
							}),
						_1: {
							ctor: '::',
							_0: _user$project$SoundPort$playSound(
								{
									url: _user$project$Main$sound(_user$project$Thing$PlayerHitCreature),
									volume: 1.0
								}),
							_1: {
								ctor: '::',
								_0: _user$project$SoundPort$playSound(
									{
										url: _user$project$Main$sound(_user$project$Thing$CreatureDied),
										volume: 1.0
									}),
								_1: {ctor: '[]'}
							}
						}
					})
			} : {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model2,
					{
						monsters: A2(
							_elm_lang$core$List$map,
							A2(_user$project$Main$damageCreature, model, damage),
							model.monsters)
					}),
				_1: _elm_lang$core$Platform_Cmd$batch(
					{
						ctor: '::',
						_0: _user$project$SoundPort$playSound(
							{
								url: _user$project$Main$sound(weapon.$class),
								volume: 1.0
							}),
						_1: {
							ctor: '::',
							_0: _user$project$SoundPort$playSound(
								{
									url: _user$project$Main$sound(_user$project$Thing$PlayerHitCreature),
									volume: 1.0
								}),
							_1: {ctor: '[]'}
						}
					})
			};
		} else {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model2,
					{response: ''}),
				_1: _user$project$SoundPort$playSound(
					{
						url: _user$project$Main$sound(weapon.$class),
						volume: 1.0
					})
			};
		}
	});
var _user$project$Main$setFlagged = function (x) {
	return _elm_lang$core$Native_Utils.update(
		x,
		{flag: true});
};
var _user$project$Main$setRevealed = function (x) {
	return _elm_lang$core$Native_Utils.update(
		x,
		{revealed: true});
};
var _user$project$Main$v_reveal = F3(
	function (len, adverbs, model) {
		var reveal = function (x) {
			return A2(_user$project$Main$canReveal, x, model) ? _user$project$Main$setRevealed(x) : x;
		};
		var target = _user$project$Main$hand(adverbs);
		var action = function (model) {
			return {
				ctor: '_Tuple2',
				_0: A2(
					target.set,
					model,
					reveal(
						target.get(model))),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		};
		var _p86 = {ctor: '_Tuple2', _0: len, _1: adverbs};
		_v55_2:
		do {
			if ((_p86.ctor === '_Tuple2') && (_p86._0 === 2)) {
				switch (_p86._1) {
					case 'Right':
						return action(
							_elm_lang$core$Native_Utils.update(
								model,
								{good: true}));
					case 'Left':
						return action(
							_elm_lang$core$Native_Utils.update(
								model,
								{good: true}));
					default:
						break _v55_2;
				}
			} else {
				break _v55_2;
			}
		} while(false);
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{good: false}),
			_1: _elm_lang$core$Platform_Cmd$none
		};
	});
var _user$project$Main$eval = F2(
	function (_p87, model) {
		var _p88 = _p87;
		var _p93 = _p88._4;
		var _p92 = _p88._0;
		var _p91 = _p88._2;
		var _p90 = _p88._3;
		var _p89 = _p88._1;
		switch (_p89) {
			case 'Attack':
				return A3(_user$project$Main$v_attack, _p92, _p91, model);
			case 'Climb':
				return A3(_user$project$Main$v_climb, _p92, _p91, model);
			case 'Drop':
				return A3(_user$project$Main$v_drop, _p92, _p91, model);
			case 'Examine':
				return A2(_user$project$Main$v_examine, _p92, model);
			case 'Get':
				return A5(_user$project$Main$v_get, _p92, _p91, _p90, _p93, model);
			case 'Incant':
				return A3(_user$project$Main$v_incant, _p92, _p91, model);
			case 'Look':
				return A3(_user$project$Main$v_look, _p92, _p91, model);
			case 'Move':
				return A3(_user$project$Main$v_move, _p92, _p91, model);
			case 'Pull':
				return A5(_user$project$Main$v_pull, _p92, _p91, _p90, _p93, model);
			case 'Reveal':
				return A3(_user$project$Main$v_reveal, _p92, _p91, model);
			case 'Stow':
				return A3(_user$project$Main$v_stow, _p92, _p91, model);
			case 'Turn':
				return A3(_user$project$Main$v_turn, _p92, _p91, model);
			case 'Use':
				return A5(_user$project$Main$v_use, _p92, _p91, _p90, _p93, model);
			case 'Zsave':
				return A5(_user$project$Main$v_zsave, _p92, _p91, _p90, _p93, model);
			case 'Zload':
				return A5(_user$project$Main$v_zload, _p92, _p91, _p90, _p93, model);
			default:
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{good: false}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
		}
	});
var _user$project$Main$parse = function (model) {
	var _p94 = _user$project$Main$lex(model.input);
	var len = _p94._0;
	var verb = _p94._1;
	var adverb = _p94._2;
	var adjective = _p94._3;
	var noun = _p94._4;
	var _p95 = A2(
		_user$project$Main$eval,
		{ctor: '_Tuple5', _0: len, _1: verb, _2: adverb, _3: adjective, _4: noun},
		model);
	var modelp = _p95._0;
	var cmd = _p95._1;
	var interpretation = modelp.good ? A2(
		_elm_lang$core$Basics_ops['++'],
		A4(_user$project$Main$long, verb, adverb, adjective, noun),
		modelp.response) : A2(_elm_lang$core$Basics_ops['++'], modelp.input, ' ???');
	return {
		ctor: '_Tuple2',
		_0: _elm_lang$core$Native_Utils.update(
			modelp,
			{
				input: '',
				response: '',
				history: A2(_user$project$Main$push, interpretation, modelp.history)
			}),
		_1: cmd
	};
};
var _user$project$Main$modelStart = {
	level: 0,
	x: 11,
	y: 16,
	orientation: 0,
	heart: 'medium',
	bpm: 0,
	power: 160,
	damage: 0,
	status: 'alive',
	display: 'intro',
	frame: 0,
	seed: _elm_lang$core$Random$initialSeed(31415),
	weight: 0,
	input: '',
	response: '',
	good: false,
	history: A2(_elm_lang$core$List$repeat, 3, ''),
	rightHand: {
		ctor: '::',
		_0: _user$project$Main$emptyHand,
		_1: {ctor: '[]'}
	},
	leftHand: {
		ctor: '::',
		_0: _user$project$Main$emptyHand,
		_1: {ctor: '[]'}
	},
	inventory: {ctor: '[]'},
	treasure: {ctor: '[]'},
	monsters: {ctor: '[]'}
};
var _user$project$Main$displayIntermission = function (model) {
	return _elm_lang$core$Native_Utils.eq(model.display, 'intermission');
};
var _user$project$Main$displayPrepare = function (model) {
	return _elm_lang$core$Native_Utils.eq(model.display, 'prepare');
};
var _user$project$Main$displayEnding = function (model) {
	return _elm_lang$core$Native_Utils.eq(model.display, 'final');
};
var _user$project$Main$displayWizardDied = function (model) {
	return _elm_lang$core$List$isEmpty(
		A2(
			_elm_lang$core$List$filter,
			function (e) {
				return _elm_lang$core$Native_Utils.eq(e.statistics.creature, _user$project$Thing$MoonWizard);
			},
			model.monsters));
};
var _user$project$Main$tunnel = F5(
	function (x, y, t, dir, model) {
		var peekingCreature = F3(
			function (turn, thing, side) {
				var _p96 = A4(
					_user$project$Main$step,
					model.level,
					x,
					y,
					A2(_user$project$Main$cwTurn, dir, turn));
				var nx = _p96._0;
				var ny = _p96._1;
				return (_elm_lang$core$Native_Utils.eq(side, _user$project$Maze$Open) && A2(
					_user$project$Main$thereIsAThing,
					{ctor: '_Tuple3', _0: model.level, _1: nx, _2: ny},
					model.monsters)) ? {
					ctor: '::',
					_0: thing,
					_1: {ctor: '[]'}
				} : {ctor: '[]'};
			});
		var relativeRoom = A2(
			_user$project$Main$absRoom2relRoom,
			A3(_user$project$Maze$getRoom, model.level, x, y),
			model.orientation);
		var _p97 = A4(_user$project$Main$step, model.level, x, y, dir);
		var nx = _p97._0;
		var ny = _p97._1;
		var darkness = F3(
			function (model, dist, getLight) {
				var activeTorch = A2(
					_elm_lang$core$Maybe$withDefault,
					A2(_user$project$Main$item, _user$project$Thing$Empty, 0),
					_elm_lang$core$List$head(
						A2(_elm_lang$core$List$filter, _user$project$Main$isLitTorch, model.inventory)));
				var exponent = (6 + _elm_lang$core$Basics$round(dist)) - A2(getLight, model, activeTorch);
				var pixelGap = (_elm_lang$core$Native_Utils.cmp(exponent, 0) < 0) ? 0 : ((_elm_lang$core$Native_Utils.cmp(5, exponent) < 0) ? -1 : Math.pow(2, exponent));
				return pixelGap;
			});
		var magicLight = F2(
			function (model, obj) {
				return _user$project$Main$displayWizardDied(model) ? 19 : obj.magicLight;
			});
		var normalLight = F2(
			function (model, obj) {
				return _user$project$Main$displayWizardDied(model) ? 7 : obj.normalLight;
			});
		var thisRoom = _elm_lang$core$List$concat(
			{
				ctor: '::',
				_0: _user$project$Main$features(relativeRoom),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$core$List$map,
						function (_p98) {
							return function (_) {
								return _.$class;
							}(
								function (_) {
									return _.object;
								}(_p98));
						},
						A2(
							_user$project$Main$matchPosition,
							{ctor: '_Tuple3', _0: model.level, _1: x, _2: y},
							model.treasure)),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$core$List$map,
							function (_p99) {
								return function (_) {
									return _.creature;
								}(
									function (_) {
										return _.statistics;
									}(_p99));
							},
							A2(
								_user$project$Main$matchPosition,
								{ctor: '_Tuple3', _0: model.level, _1: x, _2: y},
								model.monsters)),
						_1: {
							ctor: '::',
							_0: A3(peekingCreature, -1, _user$project$Thing$CreatureLeft, relativeRoom.left),
							_1: {
								ctor: '::',
								_0: A3(peekingCreature, 1, _user$project$Thing$CreatureRight, relativeRoom.right),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			});
		var _p100 = A2(_elm_lang$core$List$partition, _user$project$Main$isMagic, thisRoom);
		var thisRoomMagic = _p100._0;
		var thisRoomNormal = _p100._1;
		var svgNormal = (_elm_lang$core$Native_Utils.cmp(
			-1,
			A3(darkness, model, t, normalLight)) < 0) ? {
			ctor: '::',
			_0: A2(
				_elm_lang$svg$Svg$g,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$transform(
						_user$project$Main$distance(t)),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$strokeDasharray(
							A2(
								_elm_lang$core$Basics_ops['++'],
								'1, ',
								_elm_lang$core$Basics$toString(
									A3(darkness, model, t, normalLight)))),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$strokeDashoffset('5'),
							_1: {ctor: '[]'}
						}
					}
				},
				_elm_lang$core$List$concat(
					A2(
						_elm_lang$core$List$map,
						function (e) {
							return A2(
								_user$project$Main$image,
								_user$project$Main$foregroundColor(model),
								e);
						},
						thisRoomNormal))),
			_1: {ctor: '[]'}
		} : {ctor: '[]'};
		var svgMagic = (_elm_lang$core$Native_Utils.cmp(
			-1,
			A3(darkness, model, t, magicLight)) < 0) ? {
			ctor: '::',
			_0: A2(
				_elm_lang$svg$Svg$g,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$transform(
						_user$project$Main$distance(t)),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$strokeDasharray(
							A2(
								_elm_lang$core$Basics_ops['++'],
								'1, ',
								_elm_lang$core$Basics$toString(
									A3(darkness, model, t, magicLight)))),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$strokeDashoffset('5'),
							_1: {ctor: '[]'}
						}
					}
				},
				_elm_lang$core$List$concat(
					A2(
						_elm_lang$core$List$map,
						function (e) {
							return A2(
								_user$project$Main$image,
								_user$project$Main$foregroundColor(model),
								e);
						},
						thisRoomMagic))),
			_1: {ctor: '[]'}
		} : {ctor: '[]'};
		var svg = _elm_lang$core$List$concat(
			{
				ctor: '::',
				_0: svgNormal,
				_1: {
					ctor: '::',
					_0: svgMagic,
					_1: {ctor: '[]'}
				}
			});
		return ((!_elm_lang$core$Native_Utils.eq(relativeRoom.front, _user$project$Maze$Open)) || _elm_lang$core$Native_Utils.eq(
			{ctor: '_Tuple2', _0: nx, _1: ny},
			{ctor: '_Tuple2', _0: x, _1: y})) ? svg : _elm_lang$core$List$concat(
			{
				ctor: '::',
				_0: A5(_user$project$Main$tunnel, nx, ny, t + 1, dir, model),
				_1: {
					ctor: '::',
					_0: svg,
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Main$viewDungeon = function (model) {
	return A2(
		_elm_lang$svg$Svg$svg,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$width('768'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$height('456'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 256 152'),
					_1: {ctor: '[]'}
				}
			}
		},
		A5(_user$project$Main$tunnel, model.x, model.y, 0, model.orientation, model));
};
var _user$project$Main$displayPlayerDied = function (model) {
	return _elm_lang$core$Native_Utils.eq(model.status, 'dead');
};
var _user$project$Main$displayIntro = function (model) {
	return _elm_lang$core$Native_Utils.eq(model.display, 'intro');
};
var _user$project$Main$init = F2(
	function (model, cmd) {
		var inventory = {
			ctor: '::',
			_0: _user$project$Main$setRevealed(
				A2(_user$project$Main$item, _user$project$Thing$PineTorch, 1)),
			_1: {
				ctor: '::',
				_0: _user$project$Main$setRevealed(
					A2(_user$project$Main$item, _user$project$Thing$WoodenSword, 2)),
				_1: {ctor: '[]'}
			}
		};
		var treasure = {ctor: '[]'};
		var creatures = {
			ctor: '::',
			_0: {
				statistics: _user$project$Main$creature(_user$project$Thing$Spider),
				level: 0,
				x: 16,
				y: 11,
				orientation: 0,
				actionCounter: 0,
				inventory: {ctor: '[]'}
			},
			_1: {
				ctor: '::',
				_0: {
					statistics: _user$project$Main$creature(_user$project$Thing$Spider),
					level: 0,
					x: 15,
					y: 5,
					orientation: 0,
					actionCounter: 0,
					inventory: {ctor: '[]'}
				},
				_1: {
					ctor: '::',
					_0: {
						statistics: _user$project$Main$creature(_user$project$Thing$Spider),
						level: 0,
						x: 29,
						y: 28,
						orientation: 0,
						actionCounter: 0,
						inventory: {ctor: '[]'}
					},
					_1: {
						ctor: '::',
						_0: {
							statistics: _user$project$Main$creature(_user$project$Thing$Spider),
							level: 0,
							x: 23,
							y: 15,
							orientation: 0,
							actionCounter: 0,
							inventory: {ctor: '[]'}
						},
						_1: {
							ctor: '::',
							_0: {
								statistics: _user$project$Main$creature(_user$project$Thing$Spider),
								level: 0,
								x: 30,
								y: 3,
								orientation: 0,
								actionCounter: 0,
								inventory: {ctor: '[]'}
							},
							_1: {
								ctor: '::',
								_0: {
									statistics: _user$project$Main$creature(_user$project$Thing$Spider),
									level: 0,
									x: 8,
									y: 6,
									orientation: 0,
									actionCounter: 0,
									inventory: {ctor: '[]'}
								},
								_1: {
									ctor: '::',
									_0: {
										statistics: _user$project$Main$creature(_user$project$Thing$Spider),
										level: 0,
										x: 26,
										y: 20,
										orientation: 0,
										actionCounter: 0,
										inventory: {ctor: '[]'}
									},
									_1: {
										ctor: '::',
										_0: {
											statistics: _user$project$Main$creature(_user$project$Thing$Spider),
											level: 0,
											x: 17,
											y: 26,
											orientation: 0,
											actionCounter: 0,
											inventory: {ctor: '[]'}
										},
										_1: {
											ctor: '::',
											_0: {
												statistics: _user$project$Main$creature(_user$project$Thing$Spider),
												level: 0,
												x: 21,
												y: 14,
												orientation: 0,
												actionCounter: 0,
												inventory: {ctor: '[]'}
											},
											_1: {
												ctor: '::',
												_0: {
													statistics: _user$project$Main$creature(_user$project$Thing$Viper),
													level: 0,
													x: 3,
													y: 21,
													orientation: 0,
													actionCounter: 0,
													inventory: {ctor: '[]'}
												},
												_1: {
													ctor: '::',
													_0: {
														statistics: _user$project$Main$creature(_user$project$Thing$Viper),
														level: 0,
														x: 2,
														y: 19,
														orientation: 0,
														actionCounter: 0,
														inventory: {ctor: '[]'}
													},
													_1: {
														ctor: '::',
														_0: {
															statistics: _user$project$Main$creature(_user$project$Thing$Viper),
															level: 0,
															x: 21,
															y: 31,
															orientation: 0,
															actionCounter: 0,
															inventory: {ctor: '[]'}
														},
														_1: {
															ctor: '::',
															_0: {
																statistics: _user$project$Main$creature(_user$project$Thing$Viper),
																level: 0,
																x: 24,
																y: 20,
																orientation: 0,
																actionCounter: 0,
																inventory: {ctor: '[]'}
															},
															_1: {
																ctor: '::',
																_0: {
																	statistics: _user$project$Main$creature(_user$project$Thing$Viper),
																	level: 0,
																	x: 11,
																	y: 31,
																	orientation: 0,
																	actionCounter: 0,
																	inventory: {ctor: '[]'}
																},
																_1: {
																	ctor: '::',
																	_0: {
																		statistics: _user$project$Main$creature(_user$project$Thing$Viper),
																		level: 0,
																		x: 30,
																		y: 28,
																		orientation: 0,
																		actionCounter: 0,
																		inventory: {ctor: '[]'}
																	},
																	_1: {
																		ctor: '::',
																		_0: {
																			statistics: _user$project$Main$creature(_user$project$Thing$Viper),
																			level: 0,
																			x: 20,
																			y: 11,
																			orientation: 0,
																			actionCounter: 0,
																			inventory: {
																				ctor: '::',
																				_0: A2(_user$project$Main$item, _user$project$Thing$WoodenSword, 11),
																				_1: {ctor: '[]'}
																			}
																		},
																		_1: {
																			ctor: '::',
																			_0: {
																				statistics: _user$project$Main$creature(_user$project$Thing$Viper),
																				level: 0,
																				x: 21,
																				y: 15,
																				orientation: 0,
																				actionCounter: 0,
																				inventory: {
																					ctor: '::',
																					_0: A2(_user$project$Main$item, _user$project$Thing$LeatherShield, 11),
																					_1: {ctor: '[]'}
																				}
																			},
																			_1: {
																				ctor: '::',
																				_0: {
																					statistics: _user$project$Main$creature(_user$project$Thing$ClubGiant),
																					level: 0,
																					x: 25,
																					y: 17,
																					orientation: 0,
																					actionCounter: 0,
																					inventory: {
																						ctor: '::',
																						_0: A2(_user$project$Main$item, _user$project$Thing$PineTorch, 11),
																						_1: {ctor: '[]'}
																					}
																				},
																				_1: {
																					ctor: '::',
																					_0: {
																						statistics: _user$project$Main$creature(_user$project$Thing$ClubGiant),
																						level: 0,
																						x: 5,
																						y: 28,
																						orientation: 0,
																						actionCounter: 0,
																						inventory: {
																							ctor: '::',
																							_0: A2(_user$project$Main$item, _user$project$Thing$PineTorch, 12),
																							_1: {ctor: '[]'}
																						}
																					},
																					_1: {
																						ctor: '::',
																						_0: {
																							statistics: _user$project$Main$creature(_user$project$Thing$ClubGiant),
																							level: 0,
																							x: 15,
																							y: 19,
																							orientation: 0,
																							actionCounter: 0,
																							inventory: {
																								ctor: '::',
																								_0: A2(_user$project$Main$item, _user$project$Thing$LunarTorch, 11),
																								_1: {ctor: '[]'}
																							}
																						},
																						_1: {
																							ctor: '::',
																							_0: {
																								statistics: _user$project$Main$creature(_user$project$Thing$ClubGiant),
																								level: 0,
																								x: 2,
																								y: 0,
																								orientation: 0,
																								actionCounter: 0,
																								inventory: {
																									ctor: '::',
																									_0: A2(_user$project$Main$item, _user$project$Thing$LunarTorch, 12),
																									_1: {ctor: '[]'}
																								}
																							},
																							_1: {
																								ctor: '::',
																								_0: {
																									statistics: _user$project$Main$creature(_user$project$Thing$Blob),
																									level: 0,
																									x: 3,
																									y: 12,
																									orientation: 0,
																									actionCounter: 0,
																									inventory: {
																										ctor: '::',
																										_0: A2(_user$project$Main$item, _user$project$Thing$IronSword, 11),
																										_1: {ctor: '[]'}
																									}
																								},
																								_1: {
																									ctor: '::',
																									_0: {
																										statistics: _user$project$Main$creature(_user$project$Thing$Blob),
																										level: 0,
																										x: 30,
																										y: 20,
																										orientation: 0,
																										actionCounter: 0,
																										inventory: {
																											ctor: '::',
																											_0: A2(_user$project$Main$item, _user$project$Thing$VulcanRing, 11),
																											_1: {ctor: '[]'}
																										}
																									},
																									_1: {
																										ctor: '::',
																										_0: {
																											statistics: _user$project$Main$creature(_user$project$Thing$Spider),
																											level: 1,
																											x: 14,
																											y: 12,
																											orientation: 0,
																											actionCounter: 0,
																											inventory: {ctor: '[]'}
																										},
																										_1: {
																											ctor: '::',
																											_0: {
																												statistics: _user$project$Main$creature(_user$project$Thing$Spider),
																												level: 1,
																												x: 12,
																												y: 18,
																												orientation: 0,
																												actionCounter: 0,
																												inventory: {ctor: '[]'}
																											},
																											_1: {
																												ctor: '::',
																												_0: {
																													statistics: _user$project$Main$creature(_user$project$Thing$Viper),
																													level: 1,
																													x: 6,
																													y: 26,
																													orientation: 0,
																													actionCounter: 0,
																													inventory: {ctor: '[]'}
																												},
																												_1: {
																													ctor: '::',
																													_0: {
																														statistics: _user$project$Main$creature(_user$project$Thing$Viper),
																														level: 1,
																														x: 30,
																														y: 9,
																														orientation: 0,
																														actionCounter: 0,
																														inventory: {ctor: '[]'}
																													},
																													_1: {
																														ctor: '::',
																														_0: {
																															statistics: _user$project$Main$creature(_user$project$Thing$Viper),
																															level: 1,
																															x: 21,
																															y: 9,
																															orientation: 0,
																															actionCounter: 0,
																															inventory: {ctor: '[]'}
																														},
																														_1: {
																															ctor: '::',
																															_0: {
																																statistics: _user$project$Main$creature(_user$project$Thing$Viper),
																																level: 1,
																																x: 17,
																																y: 0,
																																orientation: 0,
																																actionCounter: 0,
																																inventory: {ctor: '[]'}
																															},
																															_1: {
																																ctor: '::',
																																_0: {
																																	statistics: _user$project$Main$creature(_user$project$Thing$Blob),
																																	level: 1,
																																	x: 28,
																																	y: 19,
																																	orientation: 0,
																																	actionCounter: 0,
																																	inventory: {ctor: '[]'}
																																},
																																_1: {
																																	ctor: '::',
																																	_0: {
																																		statistics: _user$project$Main$creature(_user$project$Thing$Blob),
																																		level: 1,
																																		x: 4,
																																		y: 12,
																																		orientation: 0,
																																		actionCounter: 0,
																																		inventory: {ctor: '[]'}
																																	},
																																	_1: {
																																		ctor: '::',
																																		_0: {
																																			statistics: _user$project$Main$creature(_user$project$Thing$Blob),
																																			level: 1,
																																			x: 14,
																																			y: 4,
																																			orientation: 0,
																																			actionCounter: 0,
																																			inventory: {ctor: '[]'}
																																		},
																																		_1: {
																																			ctor: '::',
																																			_0: {
																																				statistics: _user$project$Main$creature(_user$project$Thing$Blob),
																																				level: 1,
																																				x: 3,
																																				y: 1,
																																				orientation: 0,
																																				actionCounter: 0,
																																				inventory: {
																																					ctor: '::',
																																					_0: A2(_user$project$Main$item, _user$project$Thing$WoodenSword, 21),
																																					_1: {ctor: '[]'}
																																				}
																																			},
																																			_1: {
																																				ctor: '::',
																																				_0: {
																																					statistics: _user$project$Main$creature(_user$project$Thing$Blob),
																																					level: 1,
																																					x: 14,
																																					y: 29,
																																					orientation: 0,
																																					actionCounter: 0,
																																					inventory: {
																																						ctor: '::',
																																						_0: A2(_user$project$Main$item, _user$project$Thing$IronSword, 21),
																																						_1: {ctor: '[]'}
																																					}
																																				},
																																				_1: {
																																					ctor: '::',
																																					_0: {
																																						statistics: _user$project$Main$creature(_user$project$Thing$Blob),
																																						level: 1,
																																						x: 10,
																																						y: 9,
																																						orientation: 0,
																																						actionCounter: 0,
																																						inventory: {
																																							ctor: '::',
																																							_0: A2(_user$project$Main$item, _user$project$Thing$LeatherShield, 21),
																																							_1: {ctor: '[]'}
																																						}
																																					},
																																					_1: {
																																						ctor: '::',
																																						_0: {
																																							statistics: _user$project$Main$creature(_user$project$Thing$Knight),
																																							level: 1,
																																							x: 26,
																																							y: 15,
																																							orientation: 0,
																																							actionCounter: 0,
																																							inventory: {
																																								ctor: '::',
																																								_0: A2(_user$project$Main$item, _user$project$Thing$BronzeShield, 21),
																																								_1: {ctor: '[]'}
																																							}
																																						},
																																						_1: {
																																							ctor: '::',
																																							_0: {
																																								statistics: _user$project$Main$creature(_user$project$Thing$Knight),
																																								level: 1,
																																								x: 7,
																																								y: 24,
																																								orientation: 0,
																																								actionCounter: 0,
																																								inventory: {
																																									ctor: '::',
																																									_0: A2(_user$project$Main$item, _user$project$Thing$BronzeShield, 22),
																																									_1: {ctor: '[]'}
																																								}
																																							},
																																							_1: {
																																								ctor: '::',
																																								_0: {
																																									statistics: _user$project$Main$creature(_user$project$Thing$Knight),
																																									level: 1,
																																									x: 24,
																																									y: 0,
																																									orientation: 0,
																																									actionCounter: 0,
																																									inventory: {
																																										ctor: '::',
																																										_0: A2(_user$project$Main$item, _user$project$Thing$PineTorch, 21),
																																										_1: {ctor: '[]'}
																																									}
																																								},
																																								_1: {
																																									ctor: '::',
																																									_0: {
																																										statistics: _user$project$Main$creature(_user$project$Thing$Knight),
																																										level: 1,
																																										x: 0,
																																										y: 6,
																																										orientation: 0,
																																										actionCounter: 0,
																																										inventory: {
																																											ctor: '::',
																																											_0: A2(_user$project$Main$item, _user$project$Thing$PineTorch, 22),
																																											_1: {ctor: '[]'}
																																										}
																																									},
																																									_1: {
																																										ctor: '::',
																																										_0: {
																																											statistics: _user$project$Main$creature(_user$project$Thing$Knight),
																																											level: 1,
																																											x: 14,
																																											y: 25,
																																											orientation: 0,
																																											actionCounter: 0,
																																											inventory: {
																																												ctor: '::',
																																												_0: A2(_user$project$Main$item, _user$project$Thing$LunarTorch, 21),
																																												_1: {ctor: '[]'}
																																											}
																																										},
																																										_1: {
																																											ctor: '::',
																																											_0: {
																																												statistics: _user$project$Main$creature(_user$project$Thing$Knight),
																																												level: 1,
																																												x: 17,
																																												y: 4,
																																												orientation: 0,
																																												actionCounter: 0,
																																												inventory: {
																																													ctor: '::',
																																													_0: A2(_user$project$Main$item, _user$project$Thing$LunarTorch, 22),
																																													_1: {ctor: '[]'}
																																												}
																																											},
																																											_1: {
																																												ctor: '::',
																																												_0: {
																																													statistics: _user$project$Main$creature(_user$project$Thing$HatchetGiant),
																																													level: 1,
																																													x: 18,
																																													y: 4,
																																													orientation: 0,
																																													actionCounter: 0,
																																													inventory: {
																																														ctor: '::',
																																														_0: A2(_user$project$Main$item, _user$project$Thing$SolarTorch, 21),
																																														_1: {ctor: '[]'}
																																													}
																																												},
																																												_1: {
																																													ctor: '::',
																																													_0: {
																																														statistics: _user$project$Main$creature(_user$project$Thing$HatchetGiant),
																																														level: 1,
																																														x: 19,
																																														y: 4,
																																														orientation: 0,
																																														actionCounter: 0,
																																														inventory: {
																																															ctor: '::',
																																															_0: A2(_user$project$Main$item, _user$project$Thing$AbyeFlask, 21),
																																															_1: {ctor: '[]'}
																																														}
																																													},
																																													_1: {
																																														ctor: '::',
																																														_0: {
																																															statistics: _user$project$Main$creature(_user$project$Thing$HatchetGiant),
																																															level: 1,
																																															x: 20,
																																															y: 4,
																																															orientation: 0,
																																															actionCounter: 0,
																																															inventory: {
																																																ctor: '::',
																																																_0: A2(_user$project$Main$item, _user$project$Thing$AbyeFlask, 22),
																																																_1: {ctor: '[]'}
																																															}
																																														},
																																														_1: {
																																															ctor: '::',
																																															_0: {
																																																statistics: _user$project$Main$creature(_user$project$Thing$HatchetGiant),
																																																level: 1,
																																																x: 21,
																																																y: 4,
																																																orientation: 0,
																																																actionCounter: 0,
																																																inventory: {
																																																	ctor: '::',
																																																	_0: A2(_user$project$Main$item, _user$project$Thing$HaleFlask, 21),
																																																	_1: {ctor: '[]'}
																																																}
																																															},
																																															_1: {
																																																ctor: '::',
																																																_0: {
																																																	statistics: _user$project$Main$creature(_user$project$Thing$HatchetGiant),
																																																	level: 1,
																																																	x: 22,
																																																	y: 4,
																																																	orientation: 0,
																																																	actionCounter: 0,
																																																	inventory: {
																																																		ctor: '::',
																																																		_0: A2(_user$project$Main$item, _user$project$Thing$VisionScroll, 21),
																																																		_1: {ctor: '[]'}
																																																	}
																																																},
																																																_1: {
																																																	ctor: '::',
																																																	_0: {
																																																		statistics: _user$project$Main$creature(_user$project$Thing$HatchetGiant),
																																																		level: 1,
																																																		x: 23,
																																																		y: 4,
																																																		orientation: 0,
																																																		actionCounter: 0,
																																																		inventory: {
																																																			ctor: '::',
																																																			_0: A2(_user$project$Main$item, _user$project$Thing$RimeRing, 21),
																																																			_1: {ctor: '[]'}
																																																		}
																																																	},
																																																	_1: {
																																																		ctor: '::',
																																																		_0: {
																																																			statistics: _user$project$Main$creature(_user$project$Thing$Blob),
																																																			level: 2,
																																																			x: 1,
																																																			y: 18,
																																																			orientation: 0,
																																																			actionCounter: 0,
																																																			inventory: {ctor: '[]'}
																																																		},
																																																		_1: {
																																																			ctor: '::',
																																																			_0: {
																																																				statistics: _user$project$Main$creature(_user$project$Thing$Blob),
																																																				level: 2,
																																																				x: 2,
																																																				y: 18,
																																																				orientation: 0,
																																																				actionCounter: 0,
																																																				inventory: {ctor: '[]'}
																																																			},
																																																			_1: {
																																																				ctor: '::',
																																																				_0: {
																																																					statistics: _user$project$Main$creature(_user$project$Thing$Blob),
																																																					level: 2,
																																																					x: 3,
																																																					y: 18,
																																																					orientation: 0,
																																																					actionCounter: 0,
																																																					inventory: {ctor: '[]'}
																																																				},
																																																				_1: {
																																																					ctor: '::',
																																																					_0: {
																																																						statistics: _user$project$Main$creature(_user$project$Thing$Blob),
																																																						level: 2,
																																																						x: 4,
																																																						y: 18,
																																																						orientation: 0,
																																																						actionCounter: 0,
																																																						inventory: {ctor: '[]'}
																																																					},
																																																					_1: {
																																																						ctor: '::',
																																																						_0: {
																																																							statistics: _user$project$Main$creature(_user$project$Thing$HatchetGiant),
																																																							level: 2,
																																																							x: 5,
																																																							y: 18,
																																																							orientation: 0,
																																																							actionCounter: 0,
																																																							inventory: {ctor: '[]'}
																																																						},
																																																						_1: {
																																																							ctor: '::',
																																																							_0: {
																																																								statistics: _user$project$Main$creature(_user$project$Thing$HatchetGiant),
																																																								level: 2,
																																																								x: 6,
																																																								y: 18,
																																																								orientation: 0,
																																																								actionCounter: 0,
																																																								inventory: {ctor: '[]'}
																																																							},
																																																							_1: {
																																																								ctor: '::',
																																																								_0: {
																																																									statistics: _user$project$Main$creature(_user$project$Thing$HatchetGiant),
																																																									level: 2,
																																																									x: 7,
																																																									y: 18,
																																																									orientation: 0,
																																																									actionCounter: 0,
																																																									inventory: {ctor: '[]'}
																																																								},
																																																								_1: {
																																																									ctor: '::',
																																																									_0: {
																																																										statistics: _user$project$Main$creature(_user$project$Thing$HatchetGiant),
																																																										level: 2,
																																																										x: 8,
																																																										y: 18,
																																																										orientation: 0,
																																																										actionCounter: 0,
																																																										inventory: {ctor: '[]'}
																																																									},
																																																									_1: {
																																																										ctor: '::',
																																																										_0: {
																																																											statistics: _user$project$Main$creature(_user$project$Thing$HatchetGiant),
																																																											level: 2,
																																																											x: 9,
																																																											y: 18,
																																																											orientation: 0,
																																																											actionCounter: 0,
																																																											inventory: {ctor: '[]'}
																																																										},
																																																										_1: {
																																																											ctor: '::',
																																																											_0: {
																																																												statistics: _user$project$Main$creature(_user$project$Thing$HatchetGiant),
																																																												level: 2,
																																																												x: 10,
																																																												y: 18,
																																																												orientation: 0,
																																																												actionCounter: 0,
																																																												inventory: {
																																																													ctor: '::',
																																																													_0: A2(_user$project$Main$item, _user$project$Thing$WoodenSword, 31),
																																																													_1: {ctor: '[]'}
																																																												}
																																																											},
																																																											_1: {
																																																												ctor: '::',
																																																												_0: {
																																																													statistics: _user$project$Main$creature(_user$project$Thing$Scorpion),
																																																													level: 2,
																																																													x: 11,
																																																													y: 18,
																																																													orientation: 0,
																																																													actionCounter: 0,
																																																													inventory: {
																																																														ctor: '::',
																																																														_0: A2(_user$project$Main$item, _user$project$Thing$IronSword, 31),
																																																														_1: {ctor: '[]'}
																																																													}
																																																												},
																																																												_1: {
																																																													ctor: '::',
																																																													_0: {
																																																														statistics: _user$project$Main$creature(_user$project$Thing$Scorpion),
																																																														level: 2,
																																																														x: 12,
																																																														y: 18,
																																																														orientation: 0,
																																																														actionCounter: 0,
																																																														inventory: {
																																																															ctor: '::',
																																																															_0: A2(_user$project$Main$item, _user$project$Thing$LeatherShield, 31),
																																																															_1: {ctor: '[]'}
																																																														}
																																																													},
																																																													_1: {
																																																														ctor: '::',
																																																														_0: {
																																																															statistics: _user$project$Main$creature(_user$project$Thing$Scorpion),
																																																															level: 2,
																																																															x: 13,
																																																															y: 18,
																																																															orientation: 0,
																																																															actionCounter: 0,
																																																															inventory: {
																																																																ctor: '::',
																																																																_0: A2(_user$project$Main$item, _user$project$Thing$BronzeShield, 31),
																																																																_1: {ctor: '[]'}
																																																															}
																																																														},
																																																														_1: {
																																																															ctor: '::',
																																																															_0: {
																																																																statistics: _user$project$Main$creature(_user$project$Thing$Scorpion),
																																																																level: 2,
																																																																x: 14,
																																																																y: 18,
																																																																orientation: 0,
																																																																actionCounter: 0,
																																																																inventory: {
																																																																	ctor: '::',
																																																																	_0: A2(_user$project$Main$item, _user$project$Thing$BronzeShield, 32),
																																																																	_1: {ctor: '[]'}
																																																																}
																																																															},
																																																															_1: {
																																																																ctor: '::',
																																																																_0: {
																																																																	statistics: _user$project$Main$creature(_user$project$Thing$Scorpion),
																																																																	level: 2,
																																																																	x: 15,
																																																																	y: 18,
																																																																	orientation: 0,
																																																																	actionCounter: 0,
																																																																	inventory: {
																																																																		ctor: '::',
																																																																		_0: A2(_user$project$Main$item, _user$project$Thing$PineTorch, 31),
																																																																		_1: {ctor: '[]'}
																																																																	}
																																																																},
																																																																_1: {
																																																																	ctor: '::',
																																																																	_0: {
																																																																		statistics: _user$project$Main$creature(_user$project$Thing$Scorpion),
																																																																		level: 2,
																																																																		x: 16,
																																																																		y: 18,
																																																																		orientation: 0,
																																																																		actionCounter: 0,
																																																																		inventory: {
																																																																			ctor: '::',
																																																																			_0: A2(_user$project$Main$item, _user$project$Thing$LunarTorch, 31),
																																																																			_1: {ctor: '[]'}
																																																																		}
																																																																	},
																																																																	_1: {
																																																																		ctor: '::',
																																																																		_0: {
																																																																			statistics: _user$project$Main$creature(_user$project$Thing$Scorpion),
																																																																			level: 2,
																																																																			x: 17,
																																																																			y: 18,
																																																																			orientation: 0,
																																																																			actionCounter: 0,
																																																																			inventory: {
																																																																				ctor: '::',
																																																																				_0: A2(_user$project$Main$item, _user$project$Thing$AbyeFlask, 31),
																																																																				_1: {ctor: '[]'}
																																																																			}
																																																																		},
																																																																		_1: {
																																																																			ctor: '::',
																																																																			_0: {
																																																																				statistics: _user$project$Main$creature(_user$project$Thing$Scorpion),
																																																																				level: 2,
																																																																				x: 18,
																																																																				y: 18,
																																																																				orientation: 0,
																																																																				actionCounter: 0,
																																																																				inventory: {
																																																																					ctor: '::',
																																																																					_0: A2(_user$project$Main$item, _user$project$Thing$AbyeFlask, 31),
																																																																					_1: {ctor: '[]'}
																																																																				}
																																																																			},
																																																																			_1: {
																																																																				ctor: '::',
																																																																				_0: {
																																																																					statistics: _user$project$Main$creature(_user$project$Thing$ShieldKnight),
																																																																					level: 2,
																																																																					x: 19,
																																																																					y: 18,
																																																																					orientation: 0,
																																																																					actionCounter: 0,
																																																																					inventory: {
																																																																						ctor: '::',
																																																																						_0: A2(_user$project$Main$item, _user$project$Thing$ThewsFlask, 31),
																																																																						_1: {ctor: '[]'}
																																																																					}
																																																																				},
																																																																				_1: {
																																																																					ctor: '::',
																																																																					_0: {
																																																																						statistics: _user$project$Main$creature(_user$project$Thing$ShieldKnight),
																																																																						level: 2,
																																																																						x: 20,
																																																																						y: 18,
																																																																						orientation: 0,
																																																																						actionCounter: 0,
																																																																						inventory: {
																																																																							ctor: '::',
																																																																							_0: A2(_user$project$Main$item, _user$project$Thing$SolarTorch, 32),
																																																																							_1: {ctor: '[]'}
																																																																						}
																																																																					},
																																																																					_1: {
																																																																						ctor: '::',
																																																																						_0: {
																																																																							statistics: _user$project$Main$creature(_user$project$Thing$ShieldKnight),
																																																																							level: 2,
																																																																							x: 21,
																																																																							y: 18,
																																																																							orientation: 0,
																																																																							actionCounter: 0,
																																																																							inventory: {
																																																																								ctor: '::',
																																																																								_0: A2(_user$project$Main$item, _user$project$Thing$HaleFlask, 31),
																																																																								_1: {ctor: '[]'}
																																																																							}
																																																																						},
																																																																						_1: {
																																																																							ctor: '::',
																																																																							_0: {
																																																																								statistics: _user$project$Main$creature(_user$project$Thing$ShieldKnight),
																																																																								level: 2,
																																																																								x: 22,
																																																																								y: 18,
																																																																								orientation: 0,
																																																																								actionCounter: 0,
																																																																								inventory: {
																																																																									ctor: '::',
																																																																									_0: A2(_user$project$Main$item, _user$project$Thing$VisionScroll, 31),
																																																																									_1: {ctor: '[]'}
																																																																								}
																																																																							},
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: {
																																																																									statistics: _user$project$Main$creature(_user$project$Thing$Demon),
																																																																									level: 2,
																																																																									x: 23,
																																																																									y: 18,
																																																																									orientation: 0,
																																																																									actionCounter: 0,
																																																																									inventory: {
																																																																										ctor: '::',
																																																																										_0: A2(_user$project$Main$item, _user$project$Thing$SeerScroll, 31),
																																																																										_1: {ctor: '[]'}
																																																																									}
																																																																								},
																																																																								_1: {
																																																																									ctor: '::',
																																																																									_0: {
																																																																										statistics: _user$project$Main$creature(_user$project$Thing$Scorpion),
																																																																										level: 3,
																																																																										x: 0,
																																																																										y: 24,
																																																																										orientation: 0,
																																																																										actionCounter: 0,
																																																																										inventory: {ctor: '[]'}
																																																																									},
																																																																									_1: {
																																																																										ctor: '::',
																																																																										_0: {
																																																																											statistics: _user$project$Main$creature(_user$project$Thing$Scorpion),
																																																																											level: 3,
																																																																											x: 2,
																																																																											y: 9,
																																																																											orientation: 0,
																																																																											actionCounter: 0,
																																																																											inventory: {ctor: '[]'}
																																																																										},
																																																																										_1: {
																																																																											ctor: '::',
																																																																											_0: {
																																																																												statistics: _user$project$Main$creature(_user$project$Thing$Scorpion),
																																																																												level: 3,
																																																																												x: 2,
																																																																												y: 14,
																																																																												orientation: 0,
																																																																												actionCounter: 0,
																																																																												inventory: {ctor: '[]'}
																																																																											},
																																																																											_1: {
																																																																												ctor: '::',
																																																																												_0: {
																																																																													statistics: _user$project$Main$creature(_user$project$Thing$Scorpion),
																																																																													level: 3,
																																																																													x: 3,
																																																																													y: 15,
																																																																													orientation: 0,
																																																																													actionCounter: 0,
																																																																													inventory: {ctor: '[]'}
																																																																												},
																																																																												_1: {
																																																																													ctor: '::',
																																																																													_0: {
																																																																														statistics: _user$project$Main$creature(_user$project$Thing$Scorpion),
																																																																														level: 3,
																																																																														x: 4,
																																																																														y: 27,
																																																																														orientation: 0,
																																																																														actionCounter: 0,
																																																																														inventory: {ctor: '[]'}
																																																																													},
																																																																													_1: {
																																																																														ctor: '::',
																																																																														_0: {
																																																																															statistics: _user$project$Main$creature(_user$project$Thing$Scorpion),
																																																																															level: 3,
																																																																															x: 4,
																																																																															y: 24,
																																																																															orientation: 0,
																																																																															actionCounter: 0,
																																																																															inventory: {ctor: '[]'}
																																																																														},
																																																																														_1: {
																																																																															ctor: '::',
																																																																															_0: {
																																																																																statistics: _user$project$Main$creature(_user$project$Thing$Scorpion),
																																																																																level: 3,
																																																																																x: 4,
																																																																																y: 16,
																																																																																orientation: 0,
																																																																																actionCounter: 0,
																																																																																inventory: {ctor: '[]'}
																																																																															},
																																																																															_1: {
																																																																																ctor: '::',
																																																																																_0: {
																																																																																	statistics: _user$project$Main$creature(_user$project$Thing$Scorpion),
																																																																																	level: 3,
																																																																																	x: 6,
																																																																																	y: 18,
																																																																																	orientation: 0,
																																																																																	actionCounter: 0,
																																																																																	inventory: {ctor: '[]'}
																																																																																},
																																																																																_1: {
																																																																																	ctor: '::',
																																																																																	_0: {
																																																																																		statistics: _user$project$Main$creature(_user$project$Thing$ShieldKnight),
																																																																																		level: 3,
																																																																																		x: 6,
																																																																																		y: 9,
																																																																																		orientation: 0,
																																																																																		actionCounter: 0,
																																																																																		inventory: {ctor: '[]'}
																																																																																	},
																																																																																	_1: {
																																																																																		ctor: '::',
																																																																																		_0: {
																																																																																			statistics: _user$project$Main$creature(_user$project$Thing$ShieldKnight),
																																																																																			level: 3,
																																																																																			x: 8,
																																																																																			y: 15,
																																																																																			orientation: 0,
																																																																																			actionCounter: 0,
																																																																																			inventory: {ctor: '[]'}
																																																																																		},
																																																																																		_1: {
																																																																																			ctor: '::',
																																																																																			_0: {
																																																																																				statistics: _user$project$Main$creature(_user$project$Thing$ShieldKnight),
																																																																																				level: 3,
																																																																																				x: 10,
																																																																																				y: 15,
																																																																																				orientation: 0,
																																																																																				actionCounter: 0,
																																																																																				inventory: {
																																																																																					ctor: '::',
																																																																																					_0: A2(_user$project$Main$item, _user$project$Thing$PineTorch, 41),
																																																																																					_1: {ctor: '[]'}
																																																																																				}
																																																																																			},
																																																																																			_1: {
																																																																																				ctor: '::',
																																																																																				_0: {
																																																																																					statistics: _user$project$Main$creature(_user$project$Thing$ShieldKnight),
																																																																																					level: 3,
																																																																																					x: 11,
																																																																																					y: 9,
																																																																																					orientation: 0,
																																																																																					actionCounter: 0,
																																																																																					inventory: {
																																																																																						ctor: '::',
																																																																																						_0: A2(_user$project$Main$item, _user$project$Thing$WoodenSword, 41),
																																																																																						_1: {ctor: '[]'}
																																																																																					}
																																																																																				},
																																																																																				_1: {
																																																																																					ctor: '::',
																																																																																					_0: {
																																																																																						statistics: _user$project$Main$creature(_user$project$Thing$ShieldKnight),
																																																																																						level: 3,
																																																																																						x: 13,
																																																																																						y: 9,
																																																																																						orientation: 0,
																																																																																						actionCounter: 0,
																																																																																						inventory: {
																																																																																							ctor: '::',
																																																																																							_0: A2(_user$project$Main$item, _user$project$Thing$IronSword, 41),
																																																																																							_1: {ctor: '[]'}
																																																																																						}
																																																																																					},
																																																																																					_1: {
																																																																																						ctor: '::',
																																																																																						_0: {
																																																																																							statistics: _user$project$Main$creature(_user$project$Thing$ShieldKnight),
																																																																																							level: 3,
																																																																																							x: 15,
																																																																																							y: 3,
																																																																																							orientation: 0,
																																																																																							actionCounter: 0,
																																																																																							inventory: {
																																																																																								ctor: '::',
																																																																																								_0: A2(_user$project$Main$item, _user$project$Thing$BronzeShield, 41),
																																																																																								_1: {ctor: '[]'}
																																																																																							}
																																																																																						},
																																																																																						_1: {
																																																																																							ctor: '::',
																																																																																							_0: {
																																																																																								statistics: _user$project$Main$creature(_user$project$Thing$Wraith),
																																																																																								level: 3,
																																																																																								x: 15,
																																																																																								y: 13,
																																																																																								orientation: 0,
																																																																																								actionCounter: 0,
																																																																																								inventory: {
																																																																																									ctor: '::',
																																																																																									_0: A2(_user$project$Main$item, _user$project$Thing$ThewsFlask, 41),
																																																																																									_1: {ctor: '[]'}
																																																																																								}
																																																																																							},
																																																																																							_1: {
																																																																																								ctor: '::',
																																																																																								_0: {
																																																																																									statistics: _user$project$Main$creature(_user$project$Thing$Wraith),
																																																																																									level: 3,
																																																																																									x: 15,
																																																																																									y: 18,
																																																																																									orientation: 0,
																																																																																									actionCounter: 0,
																																																																																									inventory: {
																																																																																										ctor: '::',
																																																																																										_0: A2(_user$project$Main$item, _user$project$Thing$HaleFlask, 41),
																																																																																										_1: {ctor: '[]'}
																																																																																									}
																																																																																								},
																																																																																								_1: {
																																																																																									ctor: '::',
																																																																																									_0: {
																																																																																										statistics: _user$project$Main$creature(_user$project$Thing$Wraith),
																																																																																										level: 3,
																																																																																										x: 17,
																																																																																										y: 30,
																																																																																										orientation: 0,
																																																																																										actionCounter: 0,
																																																																																										inventory: {
																																																																																											ctor: '::',
																																																																																											_0: A2(_user$project$Main$item, _user$project$Thing$LunarTorch, 41),
																																																																																											_1: {ctor: '[]'}
																																																																																										}
																																																																																									},
																																																																																									_1: {
																																																																																										ctor: '::',
																																																																																										_0: {
																																																																																											statistics: _user$project$Main$creature(_user$project$Thing$Wraith),
																																																																																											level: 3,
																																																																																											x: 19,
																																																																																											y: 17,
																																																																																											orientation: 0,
																																																																																											actionCounter: 0,
																																																																																											inventory: {
																																																																																												ctor: '::',
																																																																																												_0: A2(_user$project$Main$item, _user$project$Thing$SolarTorch, 41),
																																																																																												_1: {ctor: '[]'}
																																																																																											}
																																																																																										},
																																																																																										_1: {
																																																																																											ctor: '::',
																																																																																											_0: {
																																																																																												statistics: _user$project$Main$creature(_user$project$Thing$Wraith),
																																																																																												level: 3,
																																																																																												x: 19,
																																																																																												y: 30,
																																																																																												orientation: 0,
																																																																																												actionCounter: 0,
																																																																																												inventory: {
																																																																																													ctor: '::',
																																																																																													_0: A2(_user$project$Main$item, _user$project$Thing$AbyeFlask, 41),
																																																																																													_1: {ctor: '[]'}
																																																																																												}
																																																																																											},
																																																																																											_1: {
																																																																																												ctor: '::',
																																																																																												_0: {
																																																																																													statistics: _user$project$Main$creature(_user$project$Thing$Wraith),
																																																																																													level: 3,
																																																																																													x: 21,
																																																																																													y: 2,
																																																																																													orientation: 0,
																																																																																													actionCounter: 0,
																																																																																													inventory: {
																																																																																														ctor: '::',
																																																																																														_0: A2(_user$project$Main$item, _user$project$Thing$MithrilShield, 41),
																																																																																														_1: {ctor: '[]'}
																																																																																													}
																																																																																												},
																																																																																												_1: {
																																																																																													ctor: '::',
																																																																																													_0: {
																																																																																														statistics: _user$project$Main$creature(_user$project$Thing$Galdrog),
																																																																																														level: 3,
																																																																																														x: 21,
																																																																																														y: 26,
																																																																																														orientation: 0,
																																																																																														actionCounter: 0,
																																																																																														inventory: {
																																																																																															ctor: '::',
																																																																																															_0: A2(_user$project$Main$item, _user$project$Thing$ElvishSword, 41),
																																																																																															_1: {ctor: '[]'}
																																																																																														}
																																																																																													},
																																																																																													_1: {
																																																																																														ctor: '::',
																																																																																														_0: {
																																																																																															statistics: _user$project$Main$creature(_user$project$Thing$Galdrog),
																																																																																															level: 3,
																																																																																															x: 24,
																																																																																															y: 26,
																																																																																															orientation: 0,
																																																																																															actionCounter: 0,
																																																																																															inventory: {
																																																																																																ctor: '::',
																																																																																																_0: A2(_user$project$Main$item, _user$project$Thing$VisionScroll, 41),
																																																																																																_1: {ctor: '[]'}
																																																																																															}
																																																																																														},
																																																																																														_1: {
																																																																																															ctor: '::',
																																																																																															_0: {
																																																																																																statistics: _user$project$Main$creature(_user$project$Thing$Galdrog),
																																																																																																level: 3,
																																																																																																x: 24,
																																																																																																y: 7,
																																																																																																orientation: 0,
																																																																																																actionCounter: 0,
																																																																																																inventory: {
																																																																																																	ctor: '::',
																																																																																																	_0: A2(_user$project$Main$item, _user$project$Thing$SeerScroll, 41),
																																																																																																	_1: {ctor: '[]'}
																																																																																																}
																																																																																															},
																																																																																															_1: {
																																																																																																ctor: '::',
																																																																																																_0: {
																																																																																																	statistics: _user$project$Main$creature(_user$project$Thing$Galdrog),
																																																																																																	level: 3,
																																																																																																	x: 30,
																																																																																																	y: 20,
																																																																																																	orientation: 0,
																																																																																																	actionCounter: 0,
																																																																																																	inventory: {
																																																																																																		ctor: '::',
																																																																																																		_0: A2(_user$project$Main$item, _user$project$Thing$JouleRing, 41),
																																																																																																		_1: {ctor: '[]'}
																																																																																																	}
																																																																																																},
																																																																																																_1: {
																																																																																																	ctor: '::',
																																																																																																	_0: {
																																																																																																		statistics: _user$project$Main$creature(_user$project$Thing$Spider),
																																																																																																		level: 4,
																																																																																																		x: 0,
																																																																																																		y: 21,
																																																																																																		orientation: 0,
																																																																																																		actionCounter: 0,
																																																																																																		inventory: {ctor: '[]'}
																																																																																																	},
																																																																																																	_1: {
																																																																																																		ctor: '::',
																																																																																																		_0: {
																																																																																																			statistics: _user$project$Main$creature(_user$project$Thing$Spider),
																																																																																																			level: 4,
																																																																																																			x: 1,
																																																																																																			y: 11,
																																																																																																			orientation: 0,
																																																																																																			actionCounter: 0,
																																																																																																			inventory: {ctor: '[]'}
																																																																																																		},
																																																																																																		_1: {
																																																																																																			ctor: '::',
																																																																																																			_0: {
																																																																																																				statistics: _user$project$Main$creature(_user$project$Thing$Viper),
																																																																																																				level: 4,
																																																																																																				x: 4,
																																																																																																				y: 10,
																																																																																																				orientation: 0,
																																																																																																				actionCounter: 0,
																																																																																																				inventory: {ctor: '[]'}
																																																																																																			},
																																																																																																			_1: {
																																																																																																				ctor: '::',
																																																																																																				_0: {
																																																																																																					statistics: _user$project$Main$creature(_user$project$Thing$Viper),
																																																																																																					level: 4,
																																																																																																					x: 6,
																																																																																																					y: 31,
																																																																																																					orientation: 0,
																																																																																																					actionCounter: 0,
																																																																																																					inventory: {ctor: '[]'}
																																																																																																				},
																																																																																																				_1: {
																																																																																																					ctor: '::',
																																																																																																					_0: {
																																																																																																						statistics: _user$project$Main$creature(_user$project$Thing$ClubGiant),
																																																																																																						level: 4,
																																																																																																						x: 7,
																																																																																																						y: 5,
																																																																																																						orientation: 0,
																																																																																																						actionCounter: 0,
																																																																																																						inventory: {ctor: '[]'}
																																																																																																					},
																																																																																																					_1: {
																																																																																																						ctor: '::',
																																																																																																						_0: {
																																																																																																							statistics: _user$project$Main$creature(_user$project$Thing$ClubGiant),
																																																																																																							level: 4,
																																																																																																							x: 7,
																																																																																																							y: 14,
																																																																																																							orientation: 0,
																																																																																																							actionCounter: 0,
																																																																																																							inventory: {ctor: '[]'}
																																																																																																						},
																																																																																																						_1: {
																																																																																																							ctor: '::',
																																																																																																							_0: {
																																																																																																								statistics: _user$project$Main$creature(_user$project$Thing$Blob),
																																																																																																								level: 4,
																																																																																																								x: 8,
																																																																																																								y: 27,
																																																																																																								orientation: 0,
																																																																																																								actionCounter: 0,
																																																																																																								inventory: {ctor: '[]'}
																																																																																																							},
																																																																																																							_1: {
																																																																																																								ctor: '::',
																																																																																																								_0: {
																																																																																																									statistics: _user$project$Main$creature(_user$project$Thing$Blob),
																																																																																																									level: 4,
																																																																																																									x: 9,
																																																																																																									y: 31,
																																																																																																									orientation: 0,
																																																																																																									actionCounter: 0,
																																																																																																									inventory: {ctor: '[]'}
																																																																																																								},
																																																																																																								_1: {
																																																																																																									ctor: '::',
																																																																																																									_0: {
																																																																																																										statistics: _user$project$Main$creature(_user$project$Thing$Knight),
																																																																																																										level: 4,
																																																																																																										x: 9,
																																																																																																										y: 0,
																																																																																																										orientation: 0,
																																																																																																										actionCounter: 0,
																																																																																																										inventory: {ctor: '[]'}
																																																																																																									},
																																																																																																									_1: {
																																																																																																										ctor: '::',
																																																																																																										_0: {
																																																																																																											statistics: _user$project$Main$creature(_user$project$Thing$Knight),
																																																																																																											level: 4,
																																																																																																											x: 9,
																																																																																																											y: 20,
																																																																																																											orientation: 0,
																																																																																																											actionCounter: 0,
																																																																																																											inventory: {ctor: '[]'}
																																																																																																										},
																																																																																																										_1: {
																																																																																																											ctor: '::',
																																																																																																											_0: {
																																																																																																												statistics: _user$project$Main$creature(_user$project$Thing$HatchetGiant),
																																																																																																												level: 4,
																																																																																																												x: 9,
																																																																																																												y: 28,
																																																																																																												orientation: 0,
																																																																																																												actionCounter: 0,
																																																																																																												inventory: {ctor: '[]'}
																																																																																																											},
																																																																																																											_1: {
																																																																																																												ctor: '::',
																																																																																																												_0: {
																																																																																																													statistics: _user$project$Main$creature(_user$project$Thing$HatchetGiant),
																																																																																																													level: 4,
																																																																																																													x: 11,
																																																																																																													y: 8,
																																																																																																													orientation: 0,
																																																																																																													actionCounter: 0,
																																																																																																													inventory: {ctor: '[]'}
																																																																																																												},
																																																																																																												_1: {
																																																																																																													ctor: '::',
																																																																																																													_0: {
																																																																																																														statistics: _user$project$Main$creature(_user$project$Thing$Scorpion),
																																																																																																														level: 4,
																																																																																																														x: 15,
																																																																																																														y: 0,
																																																																																																														orientation: 0,
																																																																																																														actionCounter: 0,
																																																																																																														inventory: {ctor: '[]'}
																																																																																																													},
																																																																																																													_1: {
																																																																																																														ctor: '::',
																																																																																																														_0: {
																																																																																																															statistics: _user$project$Main$creature(_user$project$Thing$Scorpion),
																																																																																																															level: 4,
																																																																																																															x: 17,
																																																																																																															y: 9,
																																																																																																															orientation: 0,
																																																																																																															actionCounter: 0,
																																																																																																															inventory: {ctor: '[]'}
																																																																																																														},
																																																																																																														_1: {
																																																																																																															ctor: '::',
																																																																																																															_0: {
																																																																																																																statistics: _user$project$Main$creature(_user$project$Thing$ShieldKnight),
																																																																																																																level: 4,
																																																																																																																x: 17,
																																																																																																																y: 11,
																																																																																																																orientation: 0,
																																																																																																																actionCounter: 0,
																																																																																																																inventory: {ctor: '[]'}
																																																																																																															},
																																																																																																															_1: {
																																																																																																																ctor: '::',
																																																																																																																_0: {
																																																																																																																	statistics: _user$project$Main$creature(_user$project$Thing$ShieldKnight),
																																																																																																																	level: 4,
																																																																																																																	x: 18,
																																																																																																																	y: 0,
																																																																																																																	orientation: 0,
																																																																																																																	actionCounter: 0,
																																																																																																																	inventory: {ctor: '[]'}
																																																																																																																},
																																																																																																																_1: {
																																																																																																																	ctor: '::',
																																																																																																																	_0: {
																																																																																																																		statistics: _user$project$Main$creature(_user$project$Thing$Wraith),
																																																																																																																		level: 4,
																																																																																																																		x: 20,
																																																																																																																		y: 13,
																																																																																																																		orientation: 0,
																																																																																																																		actionCounter: 0,
																																																																																																																		inventory: {ctor: '[]'}
																																																																																																																	},
																																																																																																																	_1: {
																																																																																																																		ctor: '::',
																																																																																																																		_0: {
																																																																																																																			statistics: _user$project$Main$creature(_user$project$Thing$Wraith),
																																																																																																																			level: 4,
																																																																																																																			x: 20,
																																																																																																																			y: 11,
																																																																																																																			orientation: 0,
																																																																																																																			actionCounter: 0,
																																																																																																																			inventory: {
																																																																																																																				ctor: '::',
																																																																																																																				_0: A2(_user$project$Main$item, _user$project$Thing$PineTorch, 51),
																																																																																																																				_1: {ctor: '[]'}
																																																																																																																			}
																																																																																																																		},
																																																																																																																		_1: {
																																																																																																																			ctor: '::',
																																																																																																																			_0: {
																																																																																																																				statistics: _user$project$Main$creature(_user$project$Thing$Galdrog),
																																																																																																																				level: 4,
																																																																																																																				x: 21,
																																																																																																																				y: 18,
																																																																																																																				orientation: 0,
																																																																																																																				actionCounter: 0,
																																																																																																																				inventory: {
																																																																																																																					ctor: '::',
																																																																																																																					_0: A2(_user$project$Main$item, _user$project$Thing$BronzeShield, 51),
																																																																																																																					_1: {ctor: '[]'}
																																																																																																																				}
																																																																																																																			},
																																																																																																																			_1: {
																																																																																																																				ctor: '::',
																																																																																																																				_0: {
																																																																																																																					statistics: _user$project$Main$creature(_user$project$Thing$Galdrog),
																																																																																																																					level: 4,
																																																																																																																					x: 21,
																																																																																																																					y: 15,
																																																																																																																					orientation: 0,
																																																																																																																					actionCounter: 0,
																																																																																																																					inventory: {
																																																																																																																						ctor: '::',
																																																																																																																						_0: A2(_user$project$Main$item, _user$project$Thing$HaleFlask, 51),
																																																																																																																						_1: {ctor: '[]'}
																																																																																																																					}
																																																																																																																				},
																																																																																																																				_1: {
																																																																																																																					ctor: '::',
																																																																																																																					_0: {
																																																																																																																						statistics: _user$project$Main$creature(_user$project$Thing$Galdrog),
																																																																																																																						level: 4,
																																																																																																																						x: 22,
																																																																																																																						y: 2,
																																																																																																																						orientation: 0,
																																																																																																																						actionCounter: 0,
																																																																																																																						inventory: {
																																																																																																																							ctor: '::',
																																																																																																																							_0: A2(_user$project$Main$item, _user$project$Thing$AbyeFlask, 51),
																																																																																																																							_1: {ctor: '[]'}
																																																																																																																						}
																																																																																																																					},
																																																																																																																					_1: {
																																																																																																																						ctor: '::',
																																																																																																																						_0: {
																																																																																																																							statistics: _user$project$Main$creature(_user$project$Thing$Galdrog),
																																																																																																																							level: 4,
																																																																																																																							x: 23,
																																																																																																																							y: 30,
																																																																																																																							orientation: 0,
																																																																																																																							actionCounter: 0,
																																																																																																																							inventory: {
																																																																																																																								ctor: '::',
																																																																																																																								_0: A2(_user$project$Main$item, _user$project$Thing$SolarTorch, 51),
																																																																																																																								_1: {ctor: '[]'}
																																																																																																																							}
																																																																																																																						},
																																																																																																																						_1: {
																																																																																																																							ctor: '::',
																																																																																																																							_0: {
																																																																																																																								statistics: _user$project$Main$creature(_user$project$Thing$Galdrog),
																																																																																																																								level: 4,
																																																																																																																								x: 24,
																																																																																																																								y: 7,
																																																																																																																								orientation: 0,
																																																																																																																								actionCounter: 0,
																																																																																																																								inventory: {
																																																																																																																									ctor: '::',
																																																																																																																									_0: A2(_user$project$Main$item, _user$project$Thing$ThewsFlask, 51),
																																																																																																																									_1: {ctor: '[]'}
																																																																																																																								}
																																																																																																																							},
																																																																																																																							_1: {
																																																																																																																								ctor: '::',
																																																																																																																								_0: {
																																																																																																																									statistics: _user$project$Main$creature(_user$project$Thing$Galdrog),
																																																																																																																									level: 4,
																																																																																																																									x: 25,
																																																																																																																									y: 11,
																																																																																																																									orientation: 0,
																																																																																																																									actionCounter: 0,
																																																																																																																									inventory: {
																																																																																																																										ctor: '::',
																																																																																																																										_0: A2(_user$project$Main$item, _user$project$Thing$LunarTorch, 51),
																																																																																																																										_1: {ctor: '[]'}
																																																																																																																									}
																																																																																																																								},
																																																																																																																								_1: {
																																																																																																																									ctor: '::',
																																																																																																																									_0: {
																																																																																																																										statistics: _user$project$Main$creature(_user$project$Thing$Galdrog),
																																																																																																																										level: 4,
																																																																																																																										x: 28,
																																																																																																																										y: 8,
																																																																																																																										orientation: 0,
																																																																																																																										actionCounter: 0,
																																																																																																																										inventory: {
																																																																																																																											ctor: '::',
																																																																																																																											_0: A2(_user$project$Main$item, _user$project$Thing$MithrilShield, 51),
																																																																																																																											_1: {ctor: '[]'}
																																																																																																																										}
																																																																																																																									},
																																																																																																																									_1: {
																																																																																																																										ctor: '::',
																																																																																																																										_0: {
																																																																																																																											statistics: _user$project$Main$creature(_user$project$Thing$Galdrog),
																																																																																																																											level: 4,
																																																																																																																											x: 29,
																																																																																																																											y: 22,
																																																																																																																											orientation: 0,
																																																																																																																											actionCounter: 0,
																																																																																																																											inventory: {
																																																																																																																												ctor: '::',
																																																																																																																												_0: A2(_user$project$Main$item, _user$project$Thing$SeerScroll, 51),
																																																																																																																												_1: {ctor: '[]'}
																																																																																																																											}
																																																																																																																										},
																																																																																																																										_1: {
																																																																																																																											ctor: '::',
																																																																																																																											_0: {
																																																																																																																												statistics: _user$project$Main$creature(_user$project$Thing$MoonWizard),
																																																																																																																												level: 4,
																																																																																																																												x: 31,
																																																																																																																												y: 6,
																																																																																																																												orientation: 0,
																																																																																																																												actionCounter: 0,
																																																																																																																												inventory: {
																																																																																																																													ctor: '::',
																																																																																																																													_0: A2(_user$project$Main$item, _user$project$Thing$SupremeRing, 51),
																																																																																																																													_1: {ctor: '[]'}
																																																																																																																												}
																																																																																																																											},
																																																																																																																											_1: {ctor: '[]'}
																																																																																																																										}
																																																																																																																									}
																																																																																																																								}
																																																																																																																							}
																																																																																																																						}
																																																																																																																					}
																																																																																																																				}
																																																																																																																			}
																																																																																																																		}
																																																																																																																	}
																																																																																																																}
																																																																																																															}
																																																																																																														}
																																																																																																													}
																																																																																																												}
																																																																																																											}
																																																																																																										}
																																																																																																									}
																																																																																																								}
																																																																																																							}
																																																																																																						}
																																																																																																					}
																																																																																																				}
																																																																																																			}
																																																																																																		}
																																																																																																	}
																																																																																																}
																																																																																															}
																																																																																														}
																																																																																													}
																																																																																												}
																																																																																											}
																																																																																										}
																																																																																									}
																																																																																								}
																																																																																							}
																																																																																						}
																																																																																					}
																																																																																				}
																																																																																			}
																																																																																		}
																																																																																	}
																																																																																}
																																																																															}
																																																																														}
																																																																													}
																																																																												}
																																																																											}
																																																																										}
																																																																									}
																																																																								}
																																																																							}
																																																																						}
																																																																					}
																																																																				}
																																																																			}
																																																																		}
																																																																	}
																																																																}
																																																															}
																																																														}
																																																													}
																																																												}
																																																											}
																																																										}
																																																									}
																																																								}
																																																							}
																																																						}
																																																					}
																																																				}
																																																			}
																																																		}
																																																	}
																																																}
																																															}
																																														}
																																													}
																																												}
																																											}
																																										}
																																									}
																																								}
																																							}
																																						}
																																					}
																																				}
																																			}
																																		}
																																	}
																																}
																															}
																														}
																													}
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		};
		return {
			ctor: '_Tuple2',
			_0: _user$project$Main$updateBpm(
				_user$project$Main$updateWeight(
					_elm_lang$core$Native_Utils.update(
						model,
						{monsters: creatures, treasure: treasure, inventory: inventory}))),
			_1: cmd
		};
	});
var _user$project$Main$update = F2(
	function (msg, model) {
		var _p101 = msg;
		switch (_p101.ctor) {
			case 'Command':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{input: _p101._0}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Tick':
				return _user$project$Main$updateHeart(model);
			case 'Torch':
				return _user$project$Main$updateTorch(model);
			case 'Submit':
				return _user$project$Main$parse(model);
			case 'Creatures':
				return _user$project$Main$updateCreatures(model);
			case 'Load':
				return {
					ctor: '_Tuple2',
					_0: _user$project$Main$deserialize(_p101._0),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'LoadError':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							history: _user$project$Main$loadError(model.history)
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'PrepareTick':
				return (_elm_lang$core$Native_Utils.cmp(model.frame, 16) < 0) ? {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{frame: model.frame + 1}),
					_1: _elm_lang$core$Platform_Cmd$none
				} : {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{display: 'dungeon', frame: 0}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'IntroTick':
				return (_elm_lang$core$Native_Utils.cmp(model.frame, 16) < 0) ? {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{frame: model.frame + 1}),
					_1: _elm_lang$core$Native_Utils.eq(
						A2(_elm_lang$core$Basics_ops['%'], model.frame, 4),
						0) ? _user$project$SoundPort$playSound(
						{
							url: _user$project$Main$sound(_user$project$Thing$WizardFadeBuzz),
							volume: _elm_lang$core$Basics$toFloat(model.frame) / 15.0
						}) : _elm_lang$core$Platform_Cmd$none
				} : (_elm_lang$core$Native_Utils.eq(model.frame, 16) ? {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{frame: model.frame + 1}),
					_1: _user$project$SoundPort$playSound(
						{
							url: _user$project$Main$sound(_user$project$Thing$WizardFadeCrash),
							volume: 1.0
						})
				} : ((_elm_lang$core$Native_Utils.cmp(model.frame, 32) < 0) ? {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{frame: model.frame + 1}),
					_1: _elm_lang$core$Platform_Cmd$none
				} : (_elm_lang$core$Native_Utils.eq(model.frame, 32) ? {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{frame: model.frame + 1}),
					_1: _user$project$SoundPort$playSound(
						{
							url: _user$project$Main$sound(_user$project$Thing$WizardFadeCrash),
							volume: 1.0
						})
				} : ((_elm_lang$core$Native_Utils.cmp(model.frame, 48) < 0) ? {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{frame: model.frame + 1}),
					_1: _elm_lang$core$Native_Utils.eq(
						A2(_elm_lang$core$Basics_ops['%'], model.frame, 4),
						0) ? _user$project$SoundPort$playSound(
						{
							url: _user$project$Main$sound(_user$project$Thing$WizardFadeBuzz),
							volume: 1.0 - (_elm_lang$core$Basics$toFloat(model.frame - 33) / 15.0)
						}) : _elm_lang$core$Platform_Cmd$none
				} : {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{display: 'prepare', frame: 0}),
					_1: _elm_lang$core$Platform_Cmd$none
				}))));
			case 'DeadTick':
				return (_elm_lang$core$Native_Utils.cmp(model.frame, 16) < 0) ? {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{frame: model.frame + 1}),
					_1: _elm_lang$core$Native_Utils.eq(
						A2(_elm_lang$core$Basics_ops['%'], model.frame, 4),
						0) ? _user$project$SoundPort$playSound(
						{
							url: _user$project$Main$sound(_user$project$Thing$WizardFadeBuzz),
							volume: _elm_lang$core$Basics$toFloat(model.frame) / 15.0
						}) : _elm_lang$core$Platform_Cmd$none
				} : (_elm_lang$core$Native_Utils.eq(model.frame, 16) ? {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{frame: model.frame + 1}),
					_1: _user$project$SoundPort$playSound(
						{
							url: _user$project$Main$sound(_user$project$Thing$WizardFadeCrash),
							volume: 1.0
						})
				} : ((_elm_lang$core$Native_Utils.cmp(model.frame, 32) < 0) ? {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{frame: model.frame + 1}),
					_1: _elm_lang$core$Platform_Cmd$none
				} : A2(
					_user$project$Main$init,
					_elm_lang$core$Native_Utils.update(
						_user$project$Main$modelStart,
						{display: 'dungeon', frame: 0}),
					_elm_lang$core$Platform_Cmd$none)));
			case 'FinalTick':
				return (_elm_lang$core$Native_Utils.cmp(model.frame, 16) < 0) ? {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{frame: model.frame + 1}),
					_1: _elm_lang$core$Native_Utils.eq(
						A2(_elm_lang$core$Basics_ops['%'], model.frame, 4),
						0) ? _user$project$SoundPort$playSound(
						{
							url: _user$project$Main$sound(_user$project$Thing$WizardFadeBuzz),
							volume: _elm_lang$core$Basics$toFloat(model.frame) / 15.0
						}) : _elm_lang$core$Platform_Cmd$none
				} : (_elm_lang$core$Native_Utils.eq(model.frame, 16) ? {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{frame: model.frame + 1}),
					_1: _user$project$SoundPort$playSound(
						{
							url: _user$project$Main$sound(_user$project$Thing$WizardFadeCrash),
							volume: 1.0
						})
				} : {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{frame: model.frame + 1}),
					_1: _elm_lang$core$Platform_Cmd$none
				});
			default:
				return (_elm_lang$core$Native_Utils.cmp(model.frame, 16) < 0) ? {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{frame: model.frame + 1}),
					_1: _elm_lang$core$Native_Utils.eq(
						A2(_elm_lang$core$Basics_ops['%'], model.frame, 4),
						0) ? _user$project$SoundPort$playSound(
						{
							url: _user$project$Main$sound(_user$project$Thing$WizardFadeBuzz),
							volume: _elm_lang$core$Basics$toFloat(model.frame) / 15.0
						}) : _elm_lang$core$Platform_Cmd$none
				} : (_elm_lang$core$Native_Utils.eq(model.frame, 16) ? {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{frame: model.frame + 1}),
					_1: _user$project$SoundPort$playSound(
						{
							url: _user$project$Main$sound(_user$project$Thing$WizardFadeCrash),
							volume: 1.0
						})
				} : ((_elm_lang$core$Native_Utils.cmp(model.frame, 32) < 0) ? {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{frame: model.frame + 1}),
					_1: _elm_lang$core$Platform_Cmd$none
				} : (_elm_lang$core$Native_Utils.eq(model.frame, 32) ? {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{frame: model.frame + 1}),
					_1: _user$project$SoundPort$playSound(
						{
							url: _user$project$Main$sound(_user$project$Thing$WizardFadeCrash),
							volume: 1.0
						})
				} : ((_elm_lang$core$Native_Utils.cmp(model.frame, 48) < 0) ? {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{frame: model.frame + 1}),
					_1: _elm_lang$core$Native_Utils.eq(
						A2(_elm_lang$core$Basics_ops['%'], model.frame, 4),
						0) ? _user$project$SoundPort$playSound(
						{
							url: _user$project$Main$sound(_user$project$Thing$WizardFadeBuzz),
							volume: 1.0 - (_elm_lang$core$Basics$toFloat(model.frame - 33) / 15.0)
						}) : _elm_lang$core$Platform_Cmd$none
				} : {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{display: 'prepare', frame: 0}),
					_1: _elm_lang$core$Platform_Cmd$none
				}))));
		}
	});
var _user$project$Main$Creature = F9(
	function (a, b, c, d, e, f, g, h, i) {
		return {creature: a, attack: b, defence: c, magic: d, resistance: e, attackRate: f, moveRate: g, power: h, damage: i};
	});
var _user$project$Main$DungeonCreature = F7(
	function (a, b, c, d, e, f, g) {
		return {level: a, x: b, y: c, orientation: d, actionCounter: e, inventory: f, statistics: g};
	});
var _user$project$Main$Treasure = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return function (o) {
															return {$class: a, id: b, attack: c, defence: d, magic: e, resistance: f, charges: g, flag: h, magicLight: i, normalLight: j, power: k, weight: l, adj: m, noun: n, revealed: o};
														};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _user$project$Main$DungeonTreasure = F4(
	function (a, b, c, d) {
		return {level: a, x: b, y: c, object: d};
	});
var _user$project$Main$Model = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return function (o) {
															return function (p) {
																return function (q) {
																	return function (r) {
																		return function (s) {
																			return function (t) {
																				return function (u) {
																					return function (v) {
																						return {level: a, x: b, y: c, power: d, damage: e, response: f, seed: g, weight: h, bpm: i, display: j, frame: k, heart: l, history: m, input: n, good: o, inventory: p, leftHand: q, rightHand: r, status: s, orientation: t, monsters: u, treasure: v};
																					};
																				};
																			};
																		};
																	};
																};
															};
														};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _user$project$Main$RelativeRoom = F6(
	function (a, b, c, d, e, f) {
		return {left: a, front: b, right: c, back: d, floor: e, ceiling: f};
	});
var _user$project$Main$LoadError = function (a) {
	return {ctor: 'LoadError', _0: a};
};
var _user$project$Main$Load = function (a) {
	return {ctor: 'Load', _0: a};
};
var _user$project$Main$Torch = function (a) {
	return {ctor: 'Torch', _0: a};
};
var _user$project$Main$IntermissionTick = function (a) {
	return {ctor: 'IntermissionTick', _0: a};
};
var _user$project$Main$PrepareTick = function (a) {
	return {ctor: 'PrepareTick', _0: a};
};
var _user$project$Main$FinalTick = function (a) {
	return {ctor: 'FinalTick', _0: a};
};
var _user$project$Main$DeadTick = function (a) {
	return {ctor: 'DeadTick', _0: a};
};
var _user$project$Main$IntroTick = function (a) {
	return {ctor: 'IntroTick', _0: a};
};
var _user$project$Main$Submit = {ctor: 'Submit'};
var _user$project$Main$Creatures = function (a) {
	return {ctor: 'Creatures', _0: a};
};
var _user$project$Main$Tick = function (a) {
	return {ctor: 'Tick', _0: a};
};
var _user$project$Main$subscriptions = function (model) {
	return _user$project$Main$displayIntro(model) ? _elm_lang$core$Platform_Sub$batch(
		{
			ctor: '::',
			_0: A2(_elm_lang$core$Time$every, _elm_lang$core$Time$second / 4, _user$project$Main$IntroTick),
			_1: {ctor: '[]'}
		}) : (_user$project$Main$displayPlayerDied(model) ? _elm_lang$core$Platform_Sub$batch(
		{
			ctor: '::',
			_0: A2(_elm_lang$core$Time$every, _elm_lang$core$Time$second / 4, _user$project$Main$DeadTick),
			_1: {ctor: '[]'}
		}) : (_user$project$Main$displayEnding(model) ? _elm_lang$core$Platform_Sub$batch(
		{
			ctor: '::',
			_0: A2(_elm_lang$core$Time$every, _elm_lang$core$Time$second / 4, _user$project$Main$FinalTick),
			_1: {ctor: '[]'}
		}) : (_user$project$Main$displayPrepare(model) ? _elm_lang$core$Platform_Sub$batch(
		{
			ctor: '::',
			_0: A2(_elm_lang$core$Time$every, _elm_lang$core$Time$second / 4, _user$project$Main$PrepareTick),
			_1: {ctor: '[]'}
		}) : (_user$project$Main$displayIntermission(model) ? _elm_lang$core$Platform_Sub$batch(
		{
			ctor: '::',
			_0: A2(_elm_lang$core$Time$every, _elm_lang$core$Time$second / 4, _user$project$Main$IntermissionTick),
			_1: {ctor: '[]'}
		}) : (_user$project$Main$displayWizardDied(model) ? _elm_lang$core$Platform_Sub$batch(
		{
			ctor: '::',
			_0: A2(
				_elm_lang$core$Time$every,
				A2(_elm_lang$core$Basics$max, (60.0 / model.bpm) * _elm_lang$core$Time$second, _elm_lang$core$Time$second / 60.0),
				_user$project$Main$Tick),
			_1: {
				ctor: '::',
				_0: _user$project$LocalStoragePort$loadSub(_user$project$Main$Load),
				_1: {
					ctor: '::',
					_0: _user$project$LocalStoragePort$errorSub(_user$project$Main$LoadError),
					_1: {ctor: '[]'}
				}
			}
		}) : _elm_lang$core$Platform_Sub$batch(
		{
			ctor: '::',
			_0: A2(
				_elm_lang$core$Time$every,
				A2(_elm_lang$core$Basics$max, (60.0 / model.bpm) * _elm_lang$core$Time$second, _elm_lang$core$Time$second / 60.0),
				_user$project$Main$Tick),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Time$every, _elm_lang$core$Time$second * 0.25, _user$project$Main$Creatures),
				_1: {
					ctor: '::',
					_0: A2(_elm_lang$core$Time$every, _elm_lang$core$Time$second * 60, _user$project$Main$Torch),
					_1: {
						ctor: '::',
						_0: _user$project$LocalStoragePort$loadSub(_user$project$Main$Load),
						_1: {
							ctor: '::',
							_0: _user$project$LocalStoragePort$errorSub(_user$project$Main$LoadError),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		}))))));
};
var _user$project$Main$Command = function (a) {
	return {ctor: 'Command', _0: a};
};
var _user$project$Main$inputWindow = function (model) {
	var get = function (n) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			'',
			A2(
				_elm_lang$core$Array$get,
				n,
				_elm_lang$core$Array$fromList(model.history)));
	};
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'color',
						_1: _user$project$Main$foregroundColor(model)
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'background',
							_1: _user$project$Main$backgroundColor(model)
						},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'font-family', _1: 'fantasy'},
							_1: {ctor: '[]'}
						}
					}
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text(
						_elm_lang$core$String$concat(
							{
								ctor: '::',
								_0: '. ',
								_1: {
									ctor: '::',
									_0: get(0),
									_1: {ctor: '[]'}
								}
							})),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(
							_elm_lang$core$String$concat(
								{
									ctor: '::',
									_0: '. ',
									_1: {
										ctor: '::',
										_0: get(1),
										_1: {ctor: '[]'}
									}
								})),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text(
								_elm_lang$core$String$concat(
									{
										ctor: '::',
										_0: '. ',
										_1: {
											ctor: '::',
											_0: get(2),
											_1: {ctor: '[]'}
										}
									})),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$form,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$style(
									{ctor: '[]'}),
								_1: {
									ctor: '::',
									_0: A3(
										_elm_lang$html$Html_Events$onWithOptions,
										'submit',
										{preventDefault: true, stopPropagation: false},
										_elm_lang$core$Json_Decode$succeed(_user$project$Main$Submit)),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$style(
											{
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'float', _1: 'left'},
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('. '),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$div,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$style(
												{
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'overflow', _1: 'hidden'},
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$input,
												{
													ctor: '::',
													_0: _elm_lang$html$Html_Attributes$style(
														{
															ctor: '::',
															_0: {
																ctor: '_Tuple2',
																_0: 'color',
																_1: _user$project$Main$foregroundColor(model)
															},
															_1: {
																ctor: '::',
																_0: {
																	ctor: '_Tuple2',
																	_0: 'background',
																	_1: _user$project$Main$backgroundColor(model)
																},
																_1: {
																	ctor: '::',
																	_0: {ctor: '_Tuple2', _0: 'font-family', _1: 'fantasy'},
																	_1: {
																		ctor: '::',
																		_0: {ctor: '_Tuple2', _0: 'padding', _1: '0px'},
																		_1: {
																			ctor: '::',
																			_0: {ctor: '_Tuple2', _0: 'width', _1: '100%'},
																			_1: {
																				ctor: '::',
																				_0: {ctor: '_Tuple2', _0: 'outline', _1: 'none'},
																				_1: {
																					ctor: '::',
																					_0: {ctor: '_Tuple2', _0: 'border', _1: 'none'},
																					_1: {
																						ctor: '::',
																						_0: {ctor: '_Tuple2', _0: 'font-size', _1: '16px'},
																						_1: {ctor: '[]'}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}),
													_1: {
														ctor: '::',
														_0: _elm_lang$html$Html_Attributes$autofocus(true),
														_1: {
															ctor: '::',
															_0: _elm_lang$html$Html_Attributes$autocomplete(false),
															_1: {
																ctor: '::',
																_0: _elm_lang$html$Html_Events$onInput(_user$project$Main$Command),
																_1: {
																	ctor: '::',
																	_0: _elm_lang$html$Html_Attributes$value(model.input),
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$html$Html_Attributes$id('cli'),
																		_1: {ctor: '[]'}
																	}
																}
															}
														}
													}
												},
												{ctor: '[]'}),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							}),
						_1: {ctor: '[]'}
					}
				}
			}
		});
};
var _user$project$Main$view = function (model) {
	return _user$project$Main$displayEnding(model) ? _user$project$Main$viewEnding(model) : (_user$project$Main$displayIntermission(model) ? _user$project$Main$viewIntermission(model) : (_user$project$Main$displayPlayerDied(model) ? _user$project$Main$viewDead(model) : (((!_elm_lang$core$Native_Utils.eq(model.display, 'intro')) && ((!_user$project$Main$isFainted(model)) && (!_elm_lang$core$Native_Utils.eq(model.status, 'dead')))) ? A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'width', _1: '768px'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'margin-left', _1: 'auto'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'margin-right', _1: 'auto'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'display', _1: 'block'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'font-size', _1: '16px'},
									_1: {
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: 'background',
											_1: _user$project$Main$backgroundColor(model)
										},
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: function () {
				var _p102 = model.display;
				switch (_p102) {
					case 'dungeon':
						return _user$project$Main$viewDungeon;
					case 'wizarddead':
						return _user$project$Main$viewDungeon;
					case 'seer':
						return _user$project$Main$viewScroll('seer');
					case 'vision':
						return _user$project$Main$viewScroll('vision');
					case 'prepare':
						return _user$project$Main$prepare;
					default:
						return _user$project$Main$viewText;
				}
			}()(model),
			_1: {
				ctor: '::',
				_0: _user$project$Main$statusBar(model),
				_1: {
					ctor: '::',
					_0: (!_user$project$Main$isFainted(model)) ? _user$project$Main$inputWindow(model) : A2(
						_elm_lang$html$Html$div,
						{ctor: '[]'},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$style(
									{
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'display', _1: 'none'},
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text(
									_elm_lang$core$Basics$toString(model)),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}
			}
		}) : _user$project$Main$viewIntro(model))));
};
var _user$project$Main$main = _elm_lang$html$Html$program(
	{
		init: A2(_user$project$Main$init, _user$project$Main$modelStart, _elm_lang$core$Platform_Cmd$none),
		view: _user$project$Main$view,
		update: _user$project$Main$update,
		subscriptions: _user$project$Main$subscriptions
	})();

var Elm = {};
Elm['Main'] = Elm['Main'] || {};
if (typeof _user$project$Main$main !== 'undefined') {
    _user$project$Main$main(Elm['Main'], 'Main', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);

