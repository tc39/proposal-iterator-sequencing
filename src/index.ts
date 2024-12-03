function concatImpl(): Iterator<never>
function concatImpl<A>(...iterables: Array<Iterable<A>>): Iterator<A>
function concatImpl<A>(iterableA: Iterable<A>): Iterator<A>
function concatImpl<A, B>(iterableA: Iterable<A>, iterableB: Iterable<B>): Iterator<A | B>
function concatImpl<A, B, C>(iterableA: Iterable<A>, iterableB: Iterable<B>, iterableC: Iterable<C>): Iterator<A | B | C>
function concatImpl<A, B, C, D>(iterableA: Iterable<A>, iterableB: Iterable<B>, iterableC: Iterable<C>, iterableD: Iterable<D>): Iterator<A | B | C | D>
function concatImpl<A, B, C, D, E>(iterableA: Iterable<A>, iterableB: Iterable<B>, iterableC: Iterable<C>, iterableD: Iterable<D>, iterableE: Iterable<E>): Iterator<A | B | C | D | E>
function concatImpl(...iterables: Array<Iterable<unknown>>): Iterator<unknown>
function concatImpl(...iterables: Array<unknown>): Iterator<unknown> {
  const openMethods: Array<{ openMethod: () => Iterator<unknown>, iterable: Iterable<unknown>}> = [];
  for (let val of iterables) {
    if (val == null || Object(val) !== val) throw new TypeError;
    let iterable: Iterable<unknown> = val as Iterable<unknown>;
    let openMethod = iterable[Symbol.iterator];
    if (typeof openMethod !== 'function') throw new TypeError;
    openMethods.push({openMethod, iterable});
  }
  let done = false;
  let iterator: Iterator<unknown> | null = null;
  let nextMethod: Iterator<unknown>["next"] | null = null;
  return Iterator.from({
    next() {
      while (!done) {
        if (iterator != null && nextMethod != null) {
          let iterResult = nextMethod.call(iterator);
          if (!iterResult.done) {
            return iterResult;
          }
          iterator = null;
          nextMethod = null;
        }
        if (openMethods.length > 0) {
          let { openMethod, iterable } = openMethods.shift()!;
          let val = openMethod.call(iterable);
          if (val == null || Object(val) !== val) throw new TypeError;
          iterator = val as Iterator<unknown>;
          nextMethod = iterator.next;
          continue;
        }
        done = true;
      }
      return { done: true, value: void 0 };
    },
    return() {
      if (!done) {
        if (iterator != null) {
          iterator.return?.().value;
        }
        done = true;
      }
      return { done: true, value: void 0, };
    },
  });
}

// NOTE: this line makes concat non-constructible, and gives it the appropriate name and length
const concat = (...iterators: Array<Iterable<unknown>>) => concatImpl(...iterators);
Object.defineProperty(Iterator, 'concat', {
  configurable: true,
  writable: true,
  enumerable: false,
  value: concat,
});
