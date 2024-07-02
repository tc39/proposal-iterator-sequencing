declare var Iterator: {};

if (typeof Iterator === 'undefined' || Iterator == null) {
  globalThis.Iterator = function() {};
}

const IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([].values()))

function getIteratorFlattenable<A>(obj: IteratorOrIterable<A>, stringHandling: 'iterate-strings' | 'reject-strings'): Iterator<A>
function getIteratorFlattenable(obj: any, stringHandling: 'iterate-strings' | 'reject-strings'): Iterator<unknown>
function getIteratorFlattenable(obj: any, stringHandling: 'iterate-strings' | 'reject-strings'): Iterator<unknown> {
  if (Object(obj) !== obj) {
    if (stringHandling === 'reject-strings' || typeof obj != 'string') {
      throw new TypeError;
    }
    obj = Object(obj);
  }
  let iter = Symbol.iterator in obj ? obj[Symbol.iterator]() : obj as Iterator<unknown>;
  if (Object(iter) !== iter) {
    throw new TypeError;
  }
  return iter;
}

type IteratorOrIterable<A> = Iterable<A> | Iterator<A>
interface Iterable<T> {
    [Symbol.iterator](): Iterator<T, unknown, unknown>;
}

function liftIterator<A>(iter: Iterator<A>): Iterable<A> {
  return { [Symbol.iterator]() { return iter; } };
}

function isCloseableIterator(obj: any): obj is { return(): IteratorResult<void> } {
  return obj != null &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.next === 'function' && typeof obj.return === 'function';
}

function concatImpl<A>(...iterators: Array<IteratorOrIterable<A>>): Generator<A>
function concatImpl(): Generator<never>
function concatImpl<A>(iteratorA: IteratorOrIterable<A>): Generator<A>
function concatImpl<A, B>(iteratorA: IteratorOrIterable<A>, iteratorB: IteratorOrIterable<B>): Generator<A | B>
function concatImpl<A, B, C>(iteratorA: IteratorOrIterable<A>, iteratorB: IteratorOrIterable<B>, iteratorC: IteratorOrIterable<C>): Generator<A | B | C>
function concatImpl<A, B, C, D>(iteratorA: IteratorOrIterable<A>, iteratorB: IteratorOrIterable<B>, iteratorC: IteratorOrIterable<C>, iteratorD: IteratorOrIterable<D>): Generator<A | B | C | D>
function concatImpl<A, B, C, D, E>(iteratorA: IteratorOrIterable<A>, iteratorB: IteratorOrIterable<B>, iteratorC: IteratorOrIterable<C>, iteratorD: IteratorOrIterable<D>, iteratorE: IteratorOrIterable<E>): Generator<A | B | C | D | E>
function concatImpl(...iterators: Array<IteratorOrIterable<unknown>>): Generator<unknown>
function* concatImpl(...iterators: Array<unknown>): Generator<unknown> {
  let i = 0;
  try {
    for (; i < iterators.length; ++i) {
      let iter = iterators[i];
      yield* liftIterator(getIteratorFlattenable(iter, 'iterate-strings'));
    }
  } finally {
    for (++i; i < iterators.length; ++i) {
      let iter = iterators[i];
      if (isCloseableIterator(iter)) {
        iter.return();
      }
    }
  }
}

// NOTE: this line makes concat non-constructible, and gives it the appropriate name and length
const concat = (...iterators: Array<IteratorOrIterable<unknown>>) => concatImpl(...iterators);
Object.defineProperty(Iterator, 'concat', {
  configurable: true,
  writable: true,
  enumerable: false,
  value: concat,
});
