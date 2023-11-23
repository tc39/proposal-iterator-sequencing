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

function concatImpl<A>(...iterators: Array<IteratorOrIterable<A>>): Generator<A>
function concatImpl<A, B>(iteratorA: IteratorOrIterable<A>, iteratorB: IteratorOrIterable<B>): Generator<A | B>
function concatImpl<A, B, C>(iteratorA: IteratorOrIterable<A>, iteratorB: IteratorOrIterable<B>, iteratorC: IteratorOrIterable<C>): Generator<A | B | C>
function concatImpl<A, B, C, D>(iteratorA: IteratorOrIterable<A>, iteratorB: IteratorOrIterable<B>, iteratorC: IteratorOrIterable<C>, iteratorD: IteratorOrIterable<D>): Generator<A | B | C | D>
function concatImpl<A, B, C, D, E>(iteratorA: IteratorOrIterable<A>, iteratorB: IteratorOrIterable<B>, iteratorC: IteratorOrIterable<C>, iteratorD: IteratorOrIterable<D>, iteratorE: IteratorOrIterable<E>): Generator<A | B | C | D | E>
function concatImpl(...iterators: Array<IteratorOrIterable<unknown>>): Generator<unknown>
function* concatImpl(...iterators: Array<unknown>): Generator<unknown> {
  for (const iter of iterators) {
    yield* { [Symbol.iterator]() { return getIteratorFlattenable(iter, 'reject-strings'); } };
  }
}

// NOTE: this line makes concat non-constructible, and gives it the appropriate name and length
const concat = (...iterators: Array<any>) => concatImpl(...iterators);

Object.defineProperty(Iterator, 'concat', {
  configurable: true,
  writable: true,
  enumerable: false,
  value: concat,
});