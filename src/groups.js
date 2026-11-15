// Households ("couples", roommates): people who share a group id are never matched to each other.
// `groups` is a Map of code -> group id; people without a group are simply absent.

export function pruneGroups(groups) {
  const size = new Map();
  for (const id of groups.values()) size.set(id, (size.get(id) || 0) + 1);
  for (const [code, id] of groups) if (size.get(id) < 2) groups.delete(code);
  return groups;
}

// Put `code` in the same household as `other` (or take it out of any household when `other` is empty).
export function linkPartner(groups, code, other, newId) {
  const g = new Map(groups);
  g.delete(code);
  pruneGroups(g);
  if (other && other !== code) {
    let id = g.get(other);
    if (!id) {
      id = newId();
      g.set(other, id);
    }
    g.set(code, id);
  }
  return g;
}

// [code, newGroupOrNull] for everyone whose group changed.
export function groupChanges(before, after, codes) {
  return codes.filter((c) => (before.get(c) || null) !== (after.get(c) || null)).map((c) => [c, after.get(c) || null]);
}
