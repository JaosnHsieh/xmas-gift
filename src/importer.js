// Bulk import for the admin page.
//   { "people": ["Amy", "Ben", ...], "households": [["Amy", "Ben"], ...] }
// People already in the list are kept (matched by name, ignoring case); only new names are added.
// A household is two or more names; everyone in it is never matched to the others.

const NAME_MAX = 40;
const PEOPLE_MAX = 100;
const key = (s) => s.trim().toLowerCase();

export class ImportError extends Error {}

// Returns { add: [names to create], households: [[name, ...], ...] } (names as written in `people`
// or as already stored). Throws ImportError with a bilingual message on bad input.
export function parseImport(data, existingNames = []) {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new ImportError("格式不對：要是 { people, households } Expected { people, households }");
  const rawPeople = data.people ?? [];
  const rawHouseholds = data.households ?? data.couples ?? [];
  if (!Array.isArray(rawPeople) || !Array.isArray(rawHouseholds)) throw new ImportError("people 和 households 都要是清單 Both must be lists");

  const known = new Map(existingNames.map((n) => [key(n), n]));
  const add = [];
  for (const item of rawPeople) {
    const name = String(typeof item === "string" ? item : item && item.name ? item.name : "").trim();
    if (!name) throw new ImportError("有一筆名字是空的 A name is empty");
    if (name.length > NAME_MAX) throw new ImportError(`名字太長（最多 ${NAME_MAX} 字）：${name.slice(0, 12)}… Name too long`);
    if (known.has(key(name))) continue;
    known.set(key(name), name);
    add.push(name);
  }
  if (known.size > PEOPLE_MAX) throw new ImportError(`人數太多（最多 ${PEOPLE_MAX}） Too many people`);

  const seen = new Set();
  const households = rawHouseholds.map((h) => {
    if (!Array.isArray(h) || h.length < 2) throw new ImportError("每一組同住至少要 2 個名字 Each household needs 2 or more names");
    return h.map((n) => {
      const name = known.get(key(String(n)));
      if (!name) throw new ImportError(`同住名單裡的名字不在 people 裡：${String(n)} Not in people`);
      if (seen.has(key(name))) throw new ImportError(`${name} 出現在不只一組同住 In more than one household`);
      seen.add(key(name));
      return name;
    });
  });
  return { add, households };
}
