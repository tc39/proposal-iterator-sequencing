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
interface Iterable<T> {
    [Symbol.iterator](): Iterator<T, unknown, unknown>;
}

function liftIterator<A>(iter: Iterator<A>): Iterable<A> {
  return { [Symbol.iterator]() { return iter; } };
}

function concatImpl<A>(iterators: IteratorOrIterable<IteratorOrIterable<A>>): Generator<A>
function concatImpl(iterators: IteratorOrIterable<IteratorOrIterable<unknown>>): Generator<unknown>
function* concatImpl(iterators: unknown): Generator<unknown> {
  for (const iter of liftIterator(getIteratorFlattenable(iterators, 'reject-strings'))) {
    yield* liftIterator(getIteratorFlattenable(iter, 'reject-strings'));
  }
}

function fromImpl<A>(...iterators: Array<IteratorOrIterable<A>>): Generator<A>
function fromImpl(): Generator<never>
function fromImpl<A>(iteratorA: IteratorOrIterable<A>): Generator<A>
function fromImpl<A, B>(iteratorA: IteratorOrIterable<A>, iteratorB: IteratorOrIterable<B>): Generator<A | B>
function fromImpl<A, B, C>(iteratorA: IteratorOrIterable<A>, iteratorB: IteratorOrIterable<B>, iteratorC: IteratorOrIterable<C>): Generator<A | B | C>
function fromImpl<A, B, C, D>(iteratorA: IteratorOrIterable<A>, iteratorB: IteratorOrIterable<B>, iteratorC: IteratorOrIterable<C>, iteratorD: IteratorOrIterable<D>): Generator<A | B | C | D>
function fromImpl<A, B, C, D, E>(iteratorA: IteratorOrIterable<A>, iteratorB: IteratorOrIterable<B>, iteratorC: IteratorOrIterable<C>, iteratorD: IteratorOrIterable<D>, iteratorE: IteratorOrIterable<E>): Generator<A | B | C | D | E>
function fromImpl(...iterators: Array<IteratorOrIterable<unknown>>): Generator<unknown>
function* fromImpl(...iterators: Array<unknown>): Generator<unknown> {
  for (const iter of iterators) {
    yield* liftIterator(getIteratorFlattenable(iter, 'iterate-strings'));
  }
}

function flatImpl<A>(this: Iterator<A>): Generator<A>
function* flatImpl(this: unknown): Generator<unknown> {
  for (const iter of liftIterator(this as Iterator<unknown>)) {
    yield* liftIterator(getIteratorFlattenable(iter, 'reject-strings'));
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

// NOTE: this line makes from non-constructible, and gives it the appropriate name and length
const from = (...iterators: Array<IteratorOrIterable<unknown>>) => fromImpl(...iterators);
Object.defineProperty(Iterator, 'from', {
  configurable: true,
  writable: true,
  enumerable: false,
  value: from,
});

Object.defineProperty(IteratorPrototype, 'flat', {
  configurable: true,
  writable: true,
  enumerable: false,
  value: flatImpl,
});