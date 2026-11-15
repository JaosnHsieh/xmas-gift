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

const sameGroup = (groups, a, b) => groups.has(a) && groups.get(a) === groups.get(b);
const ringOk = (ring, groups) => ring.every((c, i) => !sameGroup(groups, c, ring[(i + 1) % ring.length]));
const toPairs = (ring) => ring.map((giver, i) => [giver, ring[(i + 1) % ring.length]]);

// Fallback when random shuffles keep failing: biggest groups first, fill even seats then odd seats.
function spreadRing(codes, groups, rand) {
  const buckets = new Map();
  for (const c of shuffle(codes, rand)) {
    const key = groups.get(c) || "solo:" + c;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(c);
  }
  const ordered = shuffle([...buckets.values()], rand).sort((x, y) => y.length - x.length).flat();
  const seats = [];
  for (let i = 0; i < codes.length; i += 2) seats.push(i);
  for (let i = 1; i < codes.length; i += 2) seats.push(i);
  const ring = new Array(codes.length);
  ordered.forEach((c, i) => (ring[seats[i]] = c));
  return ring;
}

// Returns an array of [giver, receiver] pairs.
// `groups` (Map code -> group id) lists people who must not be matched to each other.
// Throws Error("households") when the groups make a single ring impossible.
export function makeRing(codes, groups = new Map(), rand = randInt) {
  if (codes.length < 3) throw new Error("need at least 3 people");
  const size = new Map();
  for (const c of codes) if (groups.has(c)) size.set(groups.get(c), (size.get(groups.get(c)) || 0) + 1);
  if (Math.max(0, ...size.values()) > Math.floor(codes.length / 2)) throw new Error("households");
  for (let t = 0; t < 2000; t++) {
    const ring = shuffle(codes, rand);
    if (ringOk(ring, groups)) return toPairs(ring);
  }
  const ring = spreadRing(codes, groups, rand);
  if (!ringOk(ring, groups)) throw new Error("households");
  return toPairs(ring);
}
