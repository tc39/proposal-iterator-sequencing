declare var Iterator: {};

if (typeof Iterator === 'undefined' || Iterator == null) {
  globalThis.Iterator = function() {};
}

function concatImpl<A>(...iterables: Array<Iterable<A>>): Generator<A>
function concatImpl(): Generator<never>
function concatImpl<A>(iterableA: Iterable<A>): Generator<A>
function concatImpl<A, B>(iterableA: Iterable<A>, iterableB: Iterable<B>): Generator<A | B>
function concatImpl<A, B, C>(iterableA: Iterable<A>, iterableB: Iterable<B>, iterableC: Iterable<C>): Generator<A | B | C>
function concatImpl<A, B, C, D>(iterableA: Iterable<A>, iterableB: Iterable<B>, iterableC: Iterable<C>, iterableD: Iterable<D>): Generator<A | B | C | D>
function concatImpl<A, B, C, D, E>(iterableA: Iterable<A>, iterableB: Iterable<B>, iterableC: Iterable<C>, iterableD: Iterable<D>, iterableE: Iterable<E>): Generator<A | B | C | D | E>
function concatImpl(...iterables: Array<Iterable<unknown>>): Generator<unknown>
function concatImpl(...iterables: Array<unknown>): Generator<unknown> {
  const openMethods = [];
  for (let iterable of iterables) {
    if (iterable == null || Object(iterable) !== iterable) throw new TypeError;
    let openMethod = (iterable as any)[Symbol.iterator];
    if (typeof openMethod !== 'function') throw new TypeError;
    openMethods.push({openMethod, iterable});
  }
  return function*() {
    for (let { openMethod, iterable } of openMethods) {
      yield* { [Symbol.iterator]() { return openMethod.call(iterable); } }
    }
  }();
}

// NOTE: this line makes concat non-constructible, and gives it the appropriate name and length
const concat = (...iterators: Array<Iterable<unknown>>) => concatImpl(...iterators);
Object.defineProperty(Iterator, 'concat', {
  configurable: true,
  writable: true,
  enumerable: false,
  value: concat,
});
