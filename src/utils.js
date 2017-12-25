import Immutable from 'immutable';

export function fromJSOrdered(js) {
  if (typeof js !== 'object' || js === null) { return js; }
  return Array.isArray(js) ?
         Immutable.Seq(js).map(fromJSOrdered).toList() :
         Immutable.Seq(js).map(fromJSOrdered).toOrderedMap();
}

export const times = n => Array.from(Array(n)).map((_, i) => i + 1);
