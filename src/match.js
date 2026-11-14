// Anonymous pairing: shuffle everyone into one ring, each person gives to the next.
// No self-match, no A<->B swaps (for 3+ people), everyone gives once and receives once.

function randInt(n) {
  const limit = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % n;
}

export function shuffle(list, rand = randInt) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Follows the ring from `start` for `count` steps. `gives` maps giver -> receiver.
// Returns the first `count` [giver, receiver] pairs in reveal order.
export function walkRing(gives, start, count) {
  const out = [];
  let cur = start;
  for (let i = 0; i < count && gives.has(cur); i++) {
    const next = gives.get(cur);
    out.push([cur, next]);
    cur = next;
  }
  return out;
}

// Returns an array of [giver, receiver] pairs.
export function makeRing(codes, rand = randInt) {
  if (codes.length < 3) throw new Error("need at least 3 people");
  const ring = shuffle(codes, rand);
  return ring.map((giver, i) => [giver, ring[(i + 1) % ring.length]]);
}
