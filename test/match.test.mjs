import assert from "node:assert/strict";
import { makeRing, walkRing } from "../src/match.js";

assert.throws(() => makeRing(["a", "b"]));

for (let n = 3; n <= 50; n++) {
  const codes = Array.from({ length: n }, (_, i) => "p" + i);
  for (let run = 0; run < 1000; run++) {
    const pairs = makeRing(codes);
    assert.equal(pairs.length, n);
    const gives = new Map(pairs);
    assert.equal(gives.size, n, "every giver once");
    assert.equal(new Set(gives.values()).size, n, "every receiver once");
    for (const [g, r] of pairs) {
      assert.notEqual(g, r, "no self match");
      assert.notEqual(gives.get(r), g, "no mutual swap");
    }
    // single ring
    let cur = codes[0];
    let steps = 0;
    do {
      cur = gives.get(cur);
      steps++;
    } while (cur !== codes[0]);
    assert.equal(steps, n, "single ring");
  }
}

// walkRing visits everyone exactly once, each receiver becomes the next giver
{
  const codes = ["a", "b", "c", "d", "e"];
  const gives = new Map(makeRing(codes));
  const walk = walkRing(gives, "c", 5);
  assert.equal(walk.length, 5);
  assert.equal(new Set(walk.map((p) => p[0])).size, 5);
  for (let i = 1; i < 5; i++) assert.equal(walk[i][0], walk[i - 1][1]);
  assert.equal(walk[4][1], "c", "ring closes at the start");
  assert.equal(walkRing(gives, "c", 2).length, 2);
}

// rough fairness: with 4 people, person 0 should receive from each other roughly evenly
const counts = { p1: 0, p2: 0, p3: 0 };
for (let i = 0; i < 6000; i++) {
  const m = new Map(makeRing(["p0", "p1", "p2", "p3"]));
  for (const k of ["p1", "p2", "p3"]) if (m.get(k) === "p0") counts[k]++;
}
for (const c of Object.values(counts)) assert.ok(c > 1700 && c < 2300, JSON.stringify(counts));

console.log("match tests ok");
