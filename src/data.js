export const CATEGORIES = [
  { id: "snacks", e: "🍪", zh: "零食甜點", en: "Snacks & sweets" },
  { id: "coffee", e: "☕", zh: "咖啡茶飲", en: "Coffee & tea" },
  { id: "beauty", e: "💄", zh: "美妝保養", en: "Beauty & skincare" },
  { id: "candle", e: "🕯️", zh: "香氛蠟燭", en: "Candles & fragrance" },
  { id: "home", e: "🏠", zh: "居家小物", en: "Home decor" },
  { id: "kitchen", e: "🍳", zh: "廚房用具", en: "Kitchenware" },
  { id: "stationery", e: "✏️", zh: "文具", en: "Stationery" },
  { id: "books", e: "📚", zh: "書籍", en: "Books" },
  { id: "games", e: "🎲", zh: "桌遊玩具", en: "Games & toys" },
  { id: "tech", e: "🔌", zh: "3C 配件", en: "Tech accessories" },
  { id: "fashion", e: "🧣", zh: "服飾配件", en: "Clothing & accessories" },
  { id: "cozy", e: "🧦", zh: "保暖用品", en: "Cozy & warm" },
  { id: "sports", e: "⚽", zh: "運動戶外", en: "Sports & outdoors" },
  { id: "tools", e: "🔧", zh: "工具 DIY", en: "Tools & DIY" },
  { id: "pets", e: "🐶", zh: "寵物用品", en: "Pet supplies" },
  { id: "plants", e: "🌱", zh: "植物園藝", en: "Plants & gardening" },
  { id: "travel", e: "🧳", zh: "旅行用品", en: "Travel gear" },
  { id: "giftcard", e: "🎟️", zh: "禮券", en: "Gift cards" },
];

export const STATUSES = [
  { id: "collecting", zh: "收集 Wish List", en: "Collecting wish lists" },
  { id: "matched", zh: "已配對，去買禮物", en: "Matched, go shopping" },
  { id: "party", zh: "活動日", en: "Party day" },
  { id: "ended", zh: "已結束", en: "All done" },
];

export const LIMITS = { maxCats: 3, maxItems: 3, catLen: 30, itemLen: 60, noteLen: 200 };

const catById = new Map(CATEGORIES.map((c) => [c.id, c]));

// Cleans and validates a wish list sent by the browser. Returns { wish } or { error }.
export function parseWish(raw) {
  if (!raw || typeof raw !== "object") return { error: "格式錯誤 Bad request" };
  if (raw.mode === "any") return { wish: { mode: "any" } };
  if (raw.mode !== "list") return { error: "格式錯誤 Bad request" };
  const cats = [];
  for (const c of Array.isArray(raw.cats) ? raw.cats : []) {
    if (typeof c !== "string") continue;
    if (c.startsWith("p:")) {
      if (catById.has(c.slice(2)) && !cats.includes(c)) cats.push(c);
    } else if (c.startsWith("c:")) {
      const t = c.slice(2).trim().slice(0, LIMITS.catLen);
      if (t && !cats.includes("c:" + t)) cats.push("c:" + t);
    }
  }
  if (cats.length > LIMITS.maxCats) return { error: "類別最多 3 個 Up to 3 categories" };
  const items = (Array.isArray(raw.items) ? raw.items : [])
    .filter((s) => typeof s === "string")
    .map((s) => s.trim().slice(0, LIMITS.itemLen))
    .filter(Boolean);
  if (items.length > LIMITS.maxItems) return { error: "具體項目最多 3 個 Up to 3 items" };
  const note = typeof raw.note === "string" ? raw.note.trim().slice(0, LIMITS.noteLen) : "";
  if (!cats.length && !items.length) {
    return { error: "請選至少一個類別或輸入項目，或選「都可以」 Pick a category, type an item, or choose “Anything’s fine”" };
  }
  return { wish: { mode: "list", cats, items, note } };
}

export function catLabel(c) {
  if (c.startsWith("p:")) {
    const k = catById.get(c.slice(2));
    return k ? { zh: k.zh, en: k.en } : { zh: c.slice(2), en: "" };
  }
  return { zh: c.slice(2), en: "" };
}
