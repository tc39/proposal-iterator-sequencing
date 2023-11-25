declare var Iterator: {};

if (typeof Iterator === 'undefined' || Iterator == null) {
  globalThis.Iterator = function() {};
}

function getIteratorFlattenable(obj: any, stringHandling: 'iterate-strings' | 'reject-strings'): Iterator<unknown, unknown, unknown> {
  if (Object(obj) !== obj) {
    if (stringHandling === 'reject-strings' || typeof obj != 'string') {
      throw new TypeError;
    }
  }
  let iter = Symbol.iterator in obj ? obj[Symbol.iterator]() : obj as Iterator<unknown>;
  if (Object(iter) !== iter) {
    throw new TypeError;
  }
  return iter;
}

function isObject(obj: unknown): obj is Object {
  return Object(obj) === obj;
}

type IteratorOrIterable<A> = Iterable<A> | Iterator<A>

function liftIterator<A>(iter: Iterator<A, unknown, unknown>): Iterable<A> {
  return { [Symbol.iterator]() { return iter; } };
}

function concatImpl<A>(iterators: IteratorOrIterable<IteratorOrIterable<A>>): Generator<A>
function concatImpl(iterators: IteratorOrIterable<IteratorOrIterable<unknown>>): Generator<unknown>
function* concatImpl(iterators: IteratorOrIterable<IteratorOrIterable<unknown>>): Generator<unknown> {
  for (const iter of liftIterator(getIteratorFlattenable(iterators, 'reject-strings'))) {
    // TODO: I don't know why TypeScript won't let me use yield* here
    for (const v of liftIterator(getIteratorFlattenable(iter, 'reject-strings'))) {
      yield v;
    }
  }
}

// NOTE: this line makes concat non-constructible, and gives it the appropriate name and length
const concat = (iterators: IteratorOrIterable<IteratorOrIterable<unknown>>) => concatImpl(iterators);

Object.defineProperty(Iterator, 'concat', {
  configurable: true,
  writable: true,
  enumerable: false,
  value: concat,
});