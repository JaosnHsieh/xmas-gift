import { CATEGORIES, STATUSES, LIMITS, catLabel } from "./data.js";

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const jsonForScript = (o) => JSON.stringify(o).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");

// Chinese line with a small English line under it.
const bi = (zh, en) => `<span class="zh">${zh}</span><span class="en">${en}</span>`;

const CSS = `
:root{--green:#14452f;--green2:#0d3223;--cream:#fff8e7;--ink:#2b2118;--red:#c0392b;--red2:#a32f23;--gold:#e8b84a;--muted:#7a6a58}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--green);color:var(--ink);font:20px/1.55 -apple-system,BlinkMacSystemFont,"PingFang TC","Noto Sans TC","Microsoft JhengHei",system-ui,sans-serif;min-height:100vh;position:relative}
body::before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.5;
 background-image:radial-gradient(circle,#fff 1.5px,transparent 2px),radial-gradient(circle,#fff 1px,transparent 1.6px),radial-gradient(circle,#fff 2px,transparent 2.6px);
 background-size:170px 170px,110px 110px,260px 260px;background-position:0 0,40px 60px,90px 20px;animation:snow 22s linear infinite}
@keyframes snow{to{background-position:30px 170px,10px 170px,60px 260px}}
@media (prefers-reduced-motion:reduce){body::before{animation:none}}
main{position:relative;max-width:720px;margin:0 auto;padding:20px 16px 60px}
h1{color:var(--cream);font-size:2rem;line-height:1.25;margin:10px 0 4px;text-align:center}
h1 .en{color:#cfe3d6}
h2{font-size:1.4rem;margin:0 0 8px;color:var(--green)}
.zh{display:block}
.en{display:block;font-size:.72em;color:var(--muted);line-height:1.35}
.card{background:var(--cream);border-radius:18px;padding:18px 18px;margin:16px 0;box-shadow:0 4px 0 rgba(0,0,0,.18)}
.hello{color:var(--gold);text-align:center;font-size:1.3rem;margin:0 0 6px}
.hero{text-align:center;color:var(--cream);margin-bottom:8px}
.hero .tree{font-size:3rem;line-height:1}
.hero .en{color:#cfe3d6;text-align:center}
.steps{display:flex;gap:6px;flex-wrap:wrap;margin:0;padding:0;list-style:none}
.steps li{flex:1 1 130px;padding:8px 10px;border-radius:12px;background:#efe3c4;color:var(--muted);font-size:.9rem;line-height:1.3}
.steps li .en{font-size:.78em}
.steps li.on{background:var(--red);color:#fff}
.steps li.on .en{color:#ffe3df}
.steps li.past{background:#cfe3d6;color:var(--green)}
.steps li.past .en{color:#4f7b62}
.rule{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-top:1px dashed #d9c9a3}
.rule:first-of-type{border-top:0}
.badge{flex:none;padding:3px 12px;border-radius:999px;color:#fff;font-weight:700;font-size:.95rem}
.badge .en{color:rgba(255,255,255,.85)}
.badge{align-self:flex-start;text-align:center;line-height:1.3}
.badge.bad{background:#7a6a58}.badge.good{background:var(--red)}
ul.plain{margin:4px 0 0;padding-left:1.2em}
.sub{background:#fff1d0;border-left:5px solid var(--green);border-radius:10px;padding:8px 12px;margin-top:10px;font-size:.95rem}
ul.plain li{margin:2px 0}
.rule b .zh{font-size:1.05em}
.rule b .en{font-weight:600}
.rule .det{font-size:.9em}
.names{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 0;padding:0;list-style:none}
.names li{background:#fff;border:2px solid #e6d8b4;border-radius:999px;padding:4px 14px;font-size:.95rem}
.names li.ok{border-color:#3f8f63}
.btn{display:inline-block;border:0;border-radius:14px;background:var(--red);color:#fff;font:inherit;font-weight:700;padding:12px 22px;cursor:pointer;text-decoration:none;text-align:center}
.btn:hover{background:var(--red2)}
.btn.alt{background:var(--green);}
.btn.ghost{background:#efe3c4;color:var(--ink)}
.btn[disabled]{opacity:.45;cursor:not-allowed}
.btn .en{color:rgba(255,255,255,.85)}
.btn.ghost .en{color:var(--muted)}
.btn.block{display:block;width:100%}
.btn.small{padding:6px 12px;font-size:.85rem;border-radius:10px}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
input[type=text],input[type=password],input[type=datetime-local],textarea,select{width:100%;font:inherit;padding:11px 12px;border:2px solid #d9c9a3;border-radius:12px;background:#fff;color:var(--ink)}
input:focus,textarea:focus,select:focus{outline:3px solid var(--gold);border-color:var(--gold)}
label.lbl{display:block;font-weight:700;margin:14px 0 6px}
.choice{display:flex;gap:10px;align-items:flex-start;border:2px solid #d9c9a3;border-radius:14px;padding:12px 14px;margin:8px 0;background:#fff;cursor:pointer}
.choice input{flex:none;margin:.45em 4px 0 2px;transform:scale(1.3)}
.choice.sel{border-color:var(--red);background:#fff1ee}
.combo{position:relative}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px}
.chip{background:var(--green);color:#fff;border-radius:999px;padding:5px 8px 5px 14px;display:flex;gap:8px;align-items:center;font-size:.95rem}
.chip .en{color:#cfe3d6;display:inline;font-size:.8em;margin-left:4px}
.chip button{border:0;background:rgba(255,255,255,.25);color:#fff;border-radius:50%;width:26px;height:26px;font-size:1rem;cursor:pointer;line-height:1}
.list{position:absolute;z-index:5;left:0;right:0;top:100%;margin:4px 0 0;padding:4px;list-style:none;background:#fff;border:2px solid var(--gold);border-radius:12px;max-height:260px;overflow:auto;box-shadow:0 8px 20px rgba(0,0,0,.25)}
.list li{padding:9px 12px;border-radius:8px;cursor:pointer}
.list li.hl,.list li:hover{background:#fff1d0}
.list li .en{display:inline;margin-left:6px}
.hint{background:#fff1d0;border-radius:12px;padding:10px 12px;font-size:.95rem;margin:8px 0}
.hint .en{font-size:.85em}
.ok{color:#2f7a52;font-weight:700}
.err{color:var(--red);font-weight:700}
.gift{background:#fff;border:3px dashed var(--red);border-radius:16px;padding:14px 16px;margin:10px 0}
.tag{display:inline-block;background:var(--green);color:#fff;border-radius:999px;padding:2px 12px;margin:2px 4px 2px 0;font-size:.95rem}
.tag .en{display:inline;color:#cfe3d6;margin-left:4px}
.muted{color:var(--muted)}
table{width:100%;border-collapse:collapse;font-size:.9rem}
td,th{padding:7px 6px;border-bottom:1px solid #e6d8b4;text-align:left;vertical-align:middle}
code.link{font-size:.82rem;word-break:break-all}
details summary{cursor:pointer;font-weight:700}
footer{text-align:center;color:#9bb9a6;font-size:.8rem;margin-top:30px}
`;

export function layout(title, body, script = "") {
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#14452f"><title>${esc(title)}</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎁</text></svg>">
<style>${CSS}</style></head><body><main>${body}</main>${script ? `<script>${script}</script>` : ""}</body></html>`;
}

function stepper(status) {
  const idx = Math.max(0, STATUSES.findIndex((s) => s.id === status));
  return `<ol class="steps">${STATUSES.map((s, i) => `<li class="${i === idx ? "on" : i < idx ? "past" : ""}">${i + 1}. ${bi(s.zh, s.en)}</li>`).join("")}</ol>`;
}

export function rulesCard() {
  return `<section class="card"><h2>${bi("🎁 每人準備 2 份禮物", "Bring two gifts each")}</h2>
<div class="rule"><span class="badge bad">${bi("壞禮物", "Bad gift")}</span><div>
<b>${bi("現場玩，不配對", "Played at the party. No matching")}</b>
<div class="det">${bi("CA$10 以下 ・ 不過期 ・ 全新未拆封", "Under CA$10 · no expiry · new and sealed")}</div></div></div>
<div class="rule"><span class="badge good">${bi("好禮物", "Good gift")}</span><div>
<b>${bi("買給配對到的人", "For the person you’re matched with")}</b>
<div class="det">${bi("CA$40 以上 ・ 買對方 Wish List 上的東西", "CA$40 or more · from their wish list")}</div>
<div class="sub"><b>${bi("📝 Wish List 怎麼填", "How to fill your wish list")}</b>
${bi("用專屬連結，選最多 3 種類別，或直接寫想要的東西。都可以就選「都可以」。", "Use your personal link. Pick up to 3 categories or type what you want. If anything is fine, choose “Anything’s fine”.")}</div></div></div>
<p class="muted" style="margin:10px 0 0">${bi("📺 活動當天，電視會揭曉誰送誰。", "On party day the TV reveals who gives to whom.")}</p></section>`;
}

function fmtDate(v) {
  if (!v) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(v);
  if (!m) return v;
  const wd = ["日", "一", "二", "三", "四", "五", "六"][new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).getUTCDay()];
  const en = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
  return { zh: `${m[1]}/${+m[2]}/${+m[3]}（${wd}）${m[4]}:${m[5]}`, en: `${en}, ${m[4]}:${m[5]}` };
}

export function icsStamp(v) {
  return (v.replace(/[-:]/g, "").slice(0, 13) + "00");
}

export function endStamp(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(v);
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4] + 3, +m[5]));
  return d.toISOString().replace(/[-:]/g, "").slice(0, 13) + "00";
}

export function eventCard(s) {
  const title = s.event_title || "聖誕交換禮物";
  const when = s.event_date ? fmtDate(s.event_date) : null;
  let cal = "";
  if (s.event_date && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s.event_date)) {
    const g = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${icsStamp(s.event_date)}/${endStamp(s.event_date)}&location=${encodeURIComponent(s.event_place || "")}`;
    cal = `<div class="row" style="margin-top:12px"><a class="btn alt small" href="/event.ics">${bi("📅 加入行事曆 (.ics)", "Add to calendar")}</a><a class="btn ghost small" href="${esc(g)}" target="_blank" rel="noopener">${bi("Google 行事曆", "Google Calendar")}</a></div>`;
  }
  const map = s.event_place
    ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.event_place)}" target="_blank" rel="noopener">${esc(s.event_place)} 🗺️</a>`
    : `<span class="muted">${bi("待公布", "To be announced")}</span>`;
  return `<section class="card"><h2>📍 ${esc(title)}</h2>
<p style="margin:4px 0"><b>${bi("時間", "When")}</b>${when ? `<span class="zh">${esc(when.zh)}</span><span class="en">${esc(when.en)}</span>` : `<span class="muted">${bi("待公布", "To be announced")}</span>`}</p>
<p style="margin:8px 0 0"><b>${bi("地點", "Where")}</b>${map}</p>${cal}</section>`;
}

export function homePage({ settings, people }) {
  const status = settings.status || "collecting";
  const filled = people.filter((p) => p.wish_json).length;
  const bought = people.filter((p) => p.bought).length;
  const matched = status !== "collecting";
  const note = matched
    ? `<div class="hint">${bi("配對完成！請用你專屬的連結查看要買給誰（匿名）。", "Matching is done! Open your personal link to see who you’re buying for (anonymous).")}</div>`
    : `<div class="hint">${bi("請用私訊給你的專屬連結填 Wish List。", "Use the personal link sent to you to fill your wish list.")}</div>`;
  const progress = matched
    ? `<p class="muted">${bi(`已買好 ${bought} / ${people.length}`, `Gifts bought: ${bought} of ${people.length}`)}</p>`
    : `<p class="muted">${bi(`已填 Wish List ${filled} / ${people.length}`, `Wish lists done: ${filled} of ${people.length}`)}</p>`;
  const body = `<div class="hero"><div class="tree">🎄</div><h1>${bi("聖誕交換禮物", "Christmas Gift Exchange")}</h1></div>
<section class="card"><h2>${bi("目前進度", "Where we are")}</h2>${stepper(status)}${note}</section>
${rulesCard()}${eventCard(settings)}
<section class="card"><h2>${bi("👥 參加的人", "Who’s in")}</h2>${progress}
${people.length ? `<ul class="names">${people.map((p) => `<li class="${(matched ? p.bought : p.wish_json) ? "ok" : ""}">${esc(p.name)}${(matched ? p.bought : p.wish_json) ? " ✓" : ""}</li>`).join("")}</ul>` : `<p class="muted">${bi("還沒有人", "Nobody yet")}</p>`}
<p class="en" style="margin-top:12px">${"Pairings are secret. Nobody but the system knows who buys for whom."}</p></section>
<footer>${bi("連結搞丟了？請再跟發給你的人要一次。", "Lost your link? Ask whoever sent it to you.")}</footer>`;
  return layout("聖誕交換禮物 Gift Exchange", body);
}

export function renderWish(w) {
  if (!w) return `<p class="muted">${bi("還沒填", "Not filled in yet")}</p>`;
  if (w.mode === "any") return `<p><b>${bi("都可以！由你決定。", "Anything’s fine. Your call!")}</b></p>`;
  const cats = (w.cats || []).map((c) => {
    const l = catLabel(c);
    return `<span class="tag">${esc(l.zh)}${l.en ? `<span class="en">${esc(l.en)}</span>` : ""}</span>`;
  }).join("");
  const items = (w.items || []).map((i) => `<li>${esc(i)}</li>`).join("");
  return `${cats ? `<p style="margin:6px 0"><b>${bi("類別", "Categories")}</b>${cats}</p>` : ""}
${items ? `<p style="margin:6px 0"><b>${bi("想要的項目", "Specific items")}</b></p><ul class="plain">${items}</ul>` : ""}
${w.note ? `<p style="margin:6px 0"><b>${bi("備註", "Note")}</b><span class="zh">${esc(w.note)}</span></p>` : ""}`;
}

const INVITE_JS = `
const INIT = JSON.parse(document.getElementById('init').textContent);
const CATS = INIT.cats, MAX = INIT.max;
const $ = (id) => document.getElementById(id);
let chosen = (INIT.wish && INIT.wish.cats) ? [...INIT.wish.cats] : [];
let mode = INIT.wish ? INIT.wish.mode : null;
const label = (c) => {
  if (c.startsWith('p:')) { const k = CATS.find(x => x.id === c.slice(2)); return k ? {zh:k.zh,en:k.en} : {zh:c.slice(2),en:''}; }
  return {zh:c.slice(2),en:''};
};
const mk = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
function setMode(m) {
  mode = m;
  $('listbox').hidden = m !== 'list';
  document.querySelectorAll('.choice').forEach(c => c.classList.toggle('sel', c.dataset.mode === m));
  document.querySelectorAll('input[name=mode]').forEach(r => r.checked = r.value === m);
}
function drawChips() {
  const box = $('chips'); box.replaceChildren();
  chosen.forEach((c, i) => {
    const l = label(c); const chip = mk('span', 'chip'); chip.append(mk('span', '', l.zh));
    if (l.en) chip.lastChild.append(mk('span', 'en', l.en));
    const b = mk('button', '', '×'); b.type = 'button'; b.setAttribute('aria-label', 'remove');
    b.onclick = () => { chosen.splice(i, 1); drawChips(); drawList(); };
    chip.append(b); box.append(chip);
  });
  const full = chosen.length >= MAX;
  $('catq').disabled = full;
  $('catq').placeholder = full ? '已選滿 3 個 Max 3 reached' : '搜尋或輸入類別 Search or type a category';
  $('catcount').textContent = chosen.length + ' / ' + MAX;
}
let hl = 0, opts = [];
function drawList() {
  const q = $('catq').value.trim().toLowerCase();
  opts = CATS.filter(k => !chosen.includes('p:' + k.id) && (!q || k.zh.toLowerCase().includes(q) || k.en.toLowerCase().includes(q) || k.id.includes(q)))
    .map(k => ({v: 'p:' + k.id, zh: k.zh, en: k.en}));
  const exact = CATS.some(k => k.zh.toLowerCase() === q || k.en.toLowerCase() === q);
  if (q && !exact && !chosen.includes('c:' + $('catq').value.trim())) opts.push({v: 'c:' + $('catq').value.trim().slice(0, 30), zh: '＋ 自訂：' + $('catq').value.trim().slice(0, 30), en: 'Add your own'});
  const ul = $('catlist'); ul.replaceChildren();
  if (document.activeElement !== $('catq') || chosen.length >= MAX || !opts.length) { ul.hidden = true; return; }
  hl = Math.min(hl, opts.length - 1);
  opts.forEach((o, i) => {
    const li = mk('li', i === hl ? 'hl' : '', o.zh); if (o.en) li.append(mk('span', 'en', o.en));
    li.onpointerdown = (e) => { e.preventDefault(); pick(o); };
    ul.append(li);
  });
  ul.hidden = false;
}
function pick(o) { if (chosen.length < MAX && !chosen.includes(o.v)) chosen.push(o.v); $('catq').value = ''; hl = 0; drawChips(); drawList(); }
$('catq').addEventListener('input', () => { hl = 0; drawList(); });
$('catq').addEventListener('focus', drawList);
$('catq').addEventListener('blur', () => setTimeout(drawList, 0));
$('catq').addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') { hl = Math.min(hl + 1, opts.length - 1); drawList(); e.preventDefault(); }
  else if (e.key === 'ArrowUp') { hl = Math.max(hl - 1, 0); drawList(); e.preventDefault(); }
  else if (e.key === 'Enter') { e.preventDefault(); if (opts[hl]) pick(opts[hl]); }
  else if (e.key === 'Backspace' && !$('catq').value && chosen.length) { chosen.pop(); drawChips(); drawList(); }
});
document.querySelectorAll('input[name=mode]').forEach(r => r.addEventListener('change', () => setMode(r.value)));
if (INIT.wish && INIT.wish.mode === 'list') {
  (INIT.wish.items || []).forEach((v, i) => { const el = $('item' + i); if (el) el.value = v; });
  $('note').value = INIT.wish.note || '';
}
setMode(mode); drawChips();
$('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = $('msg'); msg.className = ''; msg.textContent = '';
  if (!mode) { msg.className = 'err'; msg.textContent = '請先選一個 Please choose one above'; return; }
  const body = mode === 'any' ? {mode} : {mode, cats: chosen, items: [0,1,2].map(i => $('item' + i).value), note: $('note').value};
  $('save').disabled = true;
  try {
    const r = await fetch(location.pathname + '/wish', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(body)});
    const j = await r.json();
    if (j.ok) { msg.className = 'ok'; msg.textContent = '已儲存 ✓ Saved. 配對前還可以修改 You can edit until matching.'; }
    else { msg.className = 'err'; msg.textContent = j.error || 'Error'; }
  } catch { msg.className = 'err'; msg.textContent = '連線失敗，再試一次 Network error, try again'; }
  $('save').disabled = false;
});
const partner = $('partner');
if (partner) partner.addEventListener('change', async () => {
  const msg = $('pmsg');
  msg.textContent = '…';
  try {
    const r = await fetch(location.pathname + '/partner', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({other: partner.value})});
    const j = await r.json();
    msg.textContent = j.ok ? '✓ 已儲存 Saved' : (j.error || 'error');
  } catch { msg.textContent = 'error'; }
});
const bought = $('bought');
if (bought) bought.addEventListener('change', async () => {
  await fetch(location.pathname + '/bought', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({bought: bought.checked})});
});
`;

function wishForm(wish) {
  const hasList = wish && wish.mode === "list";
  return `<form id="form" autocomplete="off">
<label class="choice" data-mode="any"><input type="radio" name="mode" value="any"><span>${bi("都可以，讓送禮的人決定", "Anything’s fine. Let my gifter decide")}</span></label>
<label class="choice" data-mode="list"><input type="radio" name="mode" value="list"><span>${bi("我想選種類或寫想要的東西", "I’ll pick categories or name what I want")}</span></label>
<div id="listbox" hidden>
<div class="hint">${bi("想要鐵鏟？直接在下方「想要的項目」輸入「鐵鏟」就好。", "Want a shovel? Just type “shovel” under Specific items.")}</div>
<label class="lbl">${bi("類別（1 到 3 個）", "Categories (1 to 3)")} <span class="muted" id="catcount">0 / 3</span></label>
<div class="combo"><div class="chips" id="chips"></div>
<input type="text" id="catq" autocomplete="off" enterkeyhint="done" placeholder="搜尋或輸入類別 Search or type a category"><ul class="list" id="catlist" hidden></ul></div>
<label class="lbl">${bi("想要的項目（選填，最多 3 個）", "Specific items (optional, up to 3)")}</label>
${[0, 1, 2].map((i) => `<input type="text" id="item${i}" maxlength="${LIMITS.itemLen}" placeholder="${["例：鐵鏟 e.g. a shovel", "例：某個牌子的襪子 e.g. wool socks", ""][i]}" style="margin-bottom:8px">`).join("")}
<label class="lbl">${bi("備註（選填）", "Note (optional)")}</label>
<textarea id="note" rows="2" maxlength="${LIMITS.noteLen}" placeholder="尺寸、顏色、過敏… Size, colour, allergies…"></textarea>
</div>
<div style="margin-top:16px"><button class="btn block" id="save" type="submit">${bi("💾 儲存 Wish List", "Save wish list")}</button></div>
<p id="msg" role="status"></p></form>`;
}

function coupleCard(couple) {
  if (!couple) return "";
  const opts = couple.others.map((o) => `<option value="${esc(o.id)}" ${o.id === couple.current ? "selected" : ""}>${esc(o.name)}</option>`).join("");
  return `<section class="card"><h2>${bi("💑 和誰住一起？（選填）", "Who do you live with? (optional)")}</h2>
<p class="muted" style="margin:0 0 8px">${bi("同住的人不會互相配對，才有驚喜。", "Housemates and partners won’t be matched, so it stays a surprise.")}</p>
<select id="partner"><option value="">${esc("— 沒有 None")}</option>${opts}</select>
<p id="pmsg" role="status" class="muted" style="margin:6px 0 0"></p></section>`;
}

export function invitePage({ me, status, recipient, settings, couple }) {
  const wish = me.wish_json ? JSON.parse(me.wish_json) : null;
  const matched = status !== "collecting" && me.gives_to;
  const head = `<div class="hero"><div class="tree">🎅</div><p class="hello">${bi(`嗨，${esc(me.name)}！`, `Hi ${esc(me.name)}!`)}</p><h1>${bi("你的聖誕禮物頁", "Your gift page")}</h1></div>`;
  let main;
  if (matched) {
    const rw = recipient && recipient.wish_json ? JSON.parse(recipient.wish_json) : { mode: "any" };
    main = `<section class="card"><h2>${bi("🎁 你要買好禮物給：", "Your good gift goes to:")}</h2>
<div class="gift"><p style="margin:0 0 6px"><b>${bi("一位神秘朋友", "A mystery friend")}</b></p>
<p class="muted" style="margin:0 0 8px">${bi("下面是對方的 Wish List。請買這裡面的東西（CA$40 以上）。", "Here is their wish list. Buy something from it (CA$40 or more).")}</p>${renderWish(rw)}</div>
<label class="choice" style="margin-top:14px"><input type="checkbox" id="bought" ${me.bought ? "checked" : ""}><span>${bi("我買好了", "I’ve bought it")}</span></label>
<p class="muted">${bi("請保密，活動當天再揭曉！別忘了另外準備壞禮物（CA$10 以下、不過期、全新未拆封）。", "Keep it secret until the party! Also bring a bad gift (under CA$10, no expiry, new and sealed).")}</p></section>
<details class="card"><summary>${bi("我自己的 Wish List", "My own wish list")}</summary>${renderWish(wish)}</details>`;
  } else {
    main = `<section class="card"><h2>${bi("📝 我的 Wish List", "My wish list")}</h2>
${wish ? `<p class="ok">${bi("已填好，配對前可以修改。", "Done. You can still edit until matching.")}</p>` : `<p class="muted">${bi("請先填好 Wish List，才能開始配對。", "Please fill this in so matching can start.")}</p>`}
${wishForm(wish)}</section>${coupleCard(couple)}`;
  }
  const data = { cats: CATEGORIES, max: LIMITS.maxCats, wish };
  const body = `${head}<section class="card"><h2>${bi("目前進度", "Where we are")}</h2>${stepper(status)}</section>${main}${rulesCard()}${eventCard(settings)}
<footer><a href="/" style="color:#cfe3d6">${bi("看大家的進度", "See everyone’s progress")}</a></footer>
<script type="application/json" id="init">${jsonForScript(data)}</script>`;
  return layout("你的聖誕禮物頁 Your gift page", body, INVITE_JS);
}

const ADMIN_JS = `
const $ = (id) => document.getElementById(id);
const base = location.pathname;
async function call(action, data) {
  const r = await fetch(base + '/api', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({action, ...data})});
  const j = await r.json().catch(() => ({ok: false, error: 'bad response'}));
  if (!j.ok) { alert(j.error || 'error'); return null; }
  return j;
}
$('saveSettings').onclick = async () => {
  if (await call('settings', {status: $('status').value, event_title: $('etitle').value, event_date: $('edate').value, event_place: $('eplace').value})) location.reload();
};
$('addBtn') && ($('addBtn').onclick = async () => {
  const names = $('names').value.split('\\n').map(s => s.trim()).filter(Boolean);
  if (!names.length) return;
  if (await call('add', {names})) location.reload();
});
document.querySelectorAll('[data-link]').forEach(s => s.onchange = async () => {
  await call('link', {code: s.dataset.link, other: s.value});
  location.reload();
});
document.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
  if (confirm('刪除 ' + b.dataset.name + '？連結會失效。 Delete? Their link stops working.') && await call('remove', {code: b.dataset.del})) location.reload();
});
document.querySelectorAll('[data-copy]').forEach(b => b.onclick = async () => {
  try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = '✓'; } catch { prompt('Copy:', b.dataset.copy); }
});
$('copyAll') && ($('copyAll').onclick = async () => {
  const t = [...document.querySelectorAll('[data-copy]')].map(b => b.dataset.name + ': ' + b.dataset.copy).join('\\n');
  try { await navigator.clipboard.writeText(t); $('copyAll').textContent = '✓'; } catch { prompt('Copy:', t); }
});
$('matchBtn') && ($('matchBtn').onclick = async () => {
  if (!confirm('確定配對？配對後 Wish List 會鎖定。 Match now? Wish lists will lock.')) return;
  if (await call('match', {fill_missing: $('fill') ? $('fill').checked : false})) location.reload();
});
$('resetBtn') && ($('resetBtn').onclick = async () => {
  if (confirm('取消配對並重新開放？所有「已買好」會清除。 Cancel matching and reopen? All “bought” ticks are cleared.') && await call('reset', {})) location.reload();
});
`;

export function loginPage(base, error) {
  return layout("Admin", `<div class="hero"><div class="tree">🔒</div><h1>${bi("後台", "Admin")}</h1></div>
<section class="card"><form method="post" action="${esc(base)}/login"><label class="lbl">${bi("密碼", "Password")}</label>
<input type="password" name="password" autofocus required autocomplete="current-password">
${error ? `<p class="err">${bi("密碼不對", "Wrong password")}</p>` : ""}
<div style="margin-top:14px"><button class="btn" type="submit">${bi("進入", "Enter")}</button></div></form></section>`);
}

export function adminPage({ base, origin, settings, people }) {
  const status = settings.status || "collecting";
  const matched = status !== "collecting";
  const filled = people.filter((p) => p.wish_json).length;
  const missing = people.length - filled;
  const canMatch = !matched && people.length >= 3;
  const rows = people.map((p) => {
    const link = `${origin}/${p.code}`;
    const mates = p.grp ? people.filter((q) => q.grp === p.grp && q.code !== p.code) : [];
    const home = matched
      ? esc(mates.map((q) => q.name).join("、"))
      : `<select data-link="${esc(p.code)}"><option value="">—</option>${people.filter((q) => q.code !== p.code).map((q) => `<option value="${esc(q.code)}" ${mates.length && mates[0].code === q.code ? "selected" : ""}>${esc(q.name)}</option>`).join("")}</select>${mates.length > 1 ? `<div class="muted">+ ${esc(mates.slice(1).map((q) => q.name).join("、"))}</div>` : ""}`;
    return `<tr><td>${esc(p.name)}</td><td>${p.wish_json ? "✓" : "—"}</td><td>${home}</td><td>${p.bought ? "🎁" : ""}</td>
<td><code class="link">${esc(link)}</code></td>
<td style="white-space:nowrap"><button class="btn small ghost" data-copy="${esc(link)}" data-name="${esc(p.name)}">copy</button>
${matched ? "" : `<button class="btn small ghost" data-del="${esc(p.code)}" data-name="${esc(p.name)}">✕</button>`}</td></tr>`;
  }).join("");
  const body = `<div class="hero"><div class="tree">🛠️</div><h1>${bi("後台", "Admin")}</h1></div>
<section class="card"><h2>${bi("活動設定", "Event settings")}</h2>
<label class="lbl">${bi("目前狀態", "Status")}</label><select id="status">${STATUSES.map((s) => `<option value="${s.id}" ${s.id === status ? "selected" : ""}>${esc(s.zh)} ${esc(s.en)}</option>`).join("")}</select>
<label class="lbl">${bi("活動名稱", "Title")}</label><input type="text" id="etitle" maxlength="60" value="${esc(settings.event_title || "聖誕交換禮物")}">
<label class="lbl">${bi("日期時間（東部時間）", "Date and time (Eastern)")}</label><input type="datetime-local" id="edate" value="${esc(settings.event_date || "")}">
<label class="lbl">${bi("地點", "Place")}</label><input type="text" id="eplace" maxlength="120" value="${esc(settings.event_place || "")}">
<div style="margin-top:14px"><button class="btn block" id="saveSettings">${bi("儲存", "Save")}</button></div></section>
<section class="card"><h2>${bi(`👥 參加者（${people.length}）`, `People (${people.length})`)}</h2>
${matched ? "" : `<label class="lbl">${bi("每行一個名字或 Instagram 帳號", "One name or Instagram handle per line")}</label><textarea id="names" rows="4" placeholder="@amy&#10;小明"></textarea><div style="margin:10px 0"><button class="btn alt block" id="addBtn">${bi("新增並產生連結", "Add and create links")}</button></div>`}
${people.length ? `<div style="overflow-x:auto"><table><tr><th>${bi("名字", "Name")}</th><th>WL</th><th>${bi("同住", "Lives with")}</th><th></th><th>${bi("連結", "Link")}</th><th></th></tr>${rows}</table></div><p class="muted">${bi("同住欄選的人不會被配對到彼此（情侶、室友都可以；參加者也能在自己的頁面設定）。", "People linked in “Lives with” are never matched to each other (couples, housemates; they can also set it on their own page).")}</p><p><button class="btn small ghost" id="copyAll">${bi("複製全部連結", "Copy all links")}</button></p>` : ""}</section>
<section class="card"><h2>${bi("🎲 配對", "Matching")}</h2>
<p>${bi(`已填 ${filled} / ${people.length}`, `Wish lists done: ${filled} of ${people.length}`)}</p>
${matched
    ? `<p class="ok">${bi("已配對完成。配對只有系統知道，連後台都看不到。", "Matched. Only the system knows the pairs. Even this page can’t show them.")}</p>
<div class="hint">${bi("活動當天（開始前 1 小時起）用電視打開揭曉頁，輸入 REVEAL 和密碼解鎖，系統會一組一組公布配對。", "On party day (from 1 hour before the start), open the reveal page on the TV, type REVEAL and your password. Pairs are shown one by one.")}</div>
<div class="row"><a class="btn block" href="${esc(base)}/reveal">${bi("🎬 揭曉頁（活動當天）", "Reveal page (party day)")}</a>
<a class="btn alt block" href="${esc(base)}/reveal?demo=1">${bi("🧪 彩排（假名字）", "Rehearse with fake names")}</a></div>
<p style="margin-top:16px"><button class="btn small ghost" id="resetBtn">${bi("取消配對並重新開放", "Cancel and reopen")}</button></p>`
    : `${people.length < 3 ? `<p class="err">${bi("至少需要 3 人", "Need at least 3 people")}</p>` : ""}
${missing && people.length >= 3 ? `<label class="choice"><input type="checkbox" id="fill"><span>${bi(`還有 ${missing} 人沒填，視為「都可以」`, `${missing} not filled yet. Treat them as “Anything’s fine”`)}</span></label>` : ""}
<button class="btn block" id="matchBtn" ${canMatch ? "" : "disabled"}>${bi("🎲 開始隨機配對", "Match everyone randomly")}</button>`}
</section>`;
  return layout("Admin", body, ADMIN_JS);
}
