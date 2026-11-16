import assert from "node:assert/strict";
import { makeRing, walkRing } from "../src/match.js";
import { linkPartner, pruneGroups, groupChanges } from "../src/groups.js";

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

// households: nobody is matched to a housemate, in either direction
for (let n = 4; n <= 30; n++) {
  const codes = Array.from({ length: n }, (_, i) => "p" + i);
  const groups = new Map();
  for (let i = 0; i + 1 < n && i < 10; i += 2) {
    groups.set(codes[i], "g" + i);
    groups.set(codes[i + 1], "g" + i);
  }
  for (let run = 0; run < 500; run++) {
    const pairs = makeRing(codes, groups);
    const gives = new Map(pairs);
    assert.equal(gives.size, n);
    assert.equal(new Set(gives.values()).size, n);
    for (const [g, r] of pairs) {
      assert.notEqual(g, r);
      assert.ok(!(groups.has(g) && groups.get(g) === groups.get(r)), "housemates must not be matched");
    }
    let cur = codes[0], steps = 0;
    do { cur = gives.get(cur); steps++; } while (cur !== codes[0]);
    assert.equal(steps, n, "single ring");
  }
}
// a trio of housemates among 6 people still works; too big a household throws
{
  const codes = ["a", "b", "c", "d", "e", "f"];
  const trio = new Map([["a", "x"], ["b", "x"], ["c", "x"]]);
  for (let i = 0; i < 300; i++) for (const [g, r] of makeRing(codes, trio)) assert.ok(!(trio.has(g) && trio.has(r)));
  assert.throws(() => makeRing(["a", "b", "c"], new Map([["a", "x"], ["b", "x"]])), /households/);
  assert.throws(() => makeRing(["a", "b", "c", "d", "e"], new Map([["a", "x"], ["b", "x"], ["c", "x"]])), /households/);
  // exactly half the group: a circle must alternate, still possible
  const half = new Map([["a", "x"], ["b", "x"], ["c", "x"]]);
  for (let i = 0; i < 200; i++) for (const [g, r] of makeRing(codes, half)) assert.ok(!(half.has(g) && half.has(r)));
}
// fallback path: tight household still found when random shuffles rarely succeed
{
  const codes = Array.from({ length: 20 }, (_, i) => "p" + i);
  const big = new Map(codes.slice(0, 10).map((c) => [c, "x"]));
  const pairs = makeRing(codes, big);
  for (const [g, r] of pairs) assert.ok(!(big.has(g) && big.has(r)));
}

// linkPartner / pruneGroups / groupChanges
{
  let n = 0;
  const id = () => "g" + ++n;
  let g = linkPartner(new Map(), "a", "b", id);
  assert.equal(g.get("a"), g.get("b"));
  g = linkPartner(g, "c", "b", id);
  assert.equal(new Set([g.get("a"), g.get("b"), g.get("c")]).size, 1, "trio");
  g = linkPartner(g, "a", "", id);
  assert.ok(!g.has("a") && g.get("b") === g.get("c"), "a left, b and c stay");
  g = linkPartner(g, "c", "", id);
  assert.equal(g.size, 0, "last one left clears the group");
  g = linkPartner(new Map(), "a", "b", id);
  g = linkPartner(g, "a", "c", id);
  assert.ok(!g.has("b") && g.get("a") === g.get("c"), "moving a to c frees b");
  assert.equal(linkPartner(new Map(), "a", "a", id).size, 0, "cannot link to self");
  assert.equal(pruneGroups(new Map([["a", "x"], ["b", "y"], ["c", "y"]])).has("a"), false);
  assert.deepEqual(groupChanges(new Map([["a", "x"]]), new Map(), ["a", "b"]), [["a", null]]);
}

{
  const { parseImport, ImportError } = await import("../src/importer.js");
  const r = parseImport({ people: ["Amy", { name: "Ben" }, "amy", "小明"], households: [["Amy", "ben"]] }, ["Cat"]);
  assert.deepEqual(r.add, ["Amy", "Ben", "小明"], "dedupes by name, ignoring case");
  assert.deepEqual(r.households, [["Amy", "Ben"]]);
  const again = parseImport({ people: ["Cat", "Dan"], households: [["cat", "Dan"]] }, ["Cat"]);
  assert.deepEqual(again.add, ["Dan"], "existing people are not added twice");
  assert.deepEqual(again.households, [["Cat", "Dan"]], "households can include people already stored");
  for (const bad of [
    null, [], { people: "x" }, { people: [""] }, { people: ["a".repeat(41)] },
    { people: ["A", "B"], households: [["A"]] },
    { people: ["A", "B"], households: [["A", "Z"]] },
    { people: ["A", "B", "C"], households: [["A", "B"], ["B", "C"]] },
  ]) assert.throws(() => parseImport(bad), ImportError, JSON.stringify(bad));
  assert.throws(() => parseImport({ people: Array.from({ length: 101 }, (_, i) => `p${i}`) }), ImportError, "over 100 people");
}

{
  const { parseWish } = await import("../src/data.js");
  const ok = (r) => assert.ok(r.wish, JSON.stringify(r));
  ok(parseWish({ mode: "list", cats: ["p:snacks", "p:coffee"], items: ["鐵鏟"], note: "x" }));
  ok(parseWish({ mode: "list", cats: [], items: ["a", "b", "c"] }));
  assert.ok(parseWish({ mode: "list", cats: ["p:snacks", "p:coffee"], items: ["a", "b"] }).error, "4 picks in total is refused");
  assert.ok(parseWish({ mode: "list", cats: [], items: [] }).error, "needs at least one pick");
  ok(parseWish({ mode: "list", cats: ["c:襪子"], items: ["鐵鏟"] })); // saved by the old form
}

console.log("match tests ok");
