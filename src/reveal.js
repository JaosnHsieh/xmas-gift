import { esc } from "./pages.js";

// Written with String.raw: keep backticks and dollar-brace out of the browser code below.
const CSS = String.raw`
*{box-sizing:border-box}
html,body{height:100%;margin:0}
body{background:radial-gradient(ellipse at 50% 0%,#1d6b47 0%,#14452f 55%,#0b2a1c 100%);color:#fff8e7;overflow:hidden;
 font:20px/1.4 -apple-system,BlinkMacSystemFont,"PingFang TC","Noto Sans TC","Microsoft JhengHei",system-ui,sans-serif}
body::before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.55;
 background-image:radial-gradient(circle,#fff 2px,transparent 2.6px),radial-gradient(circle,#fff 1.2px,transparent 1.8px),radial-gradient(circle,#fff 3px,transparent 3.6px);
 background-size:230px 230px,140px 140px,340px 340px;background-position:0 0,50px 70px,110px 30px;animation:snow 26s linear infinite}
@keyframes snow{to{background-position:40px 230px,15px 210px,80px 340px}}
@media (prefers-reduced-motion:reduce){body::before{animation:none}}
#root{position:relative;height:100%;display:flex;flex-direction:column;padding:2.2vmin 3vmin;gap:2vmin}
#fx{position:fixed;inset:0;pointer-events:none;z-index:20}
.zh{display:block}.en{display:block;font-size:.6em;color:#cfe3d6;line-height:1.25}
.top{display:flex;justify-content:space-between;align-items:center;gap:2vmin}
.title{font-size:clamp(1.6rem,5.2vmin,3.4rem);font-weight:800}
.prog{font-size:clamp(1.4rem,4.4vmin,3rem);font-weight:800;color:#e8b84a;white-space:nowrap}
.banner{background:#e8b84a;color:#3a2a00;text-align:center;border-radius:1.5vmin;padding:.6vmin 2vmin;font-weight:700;font-size:clamp(1rem,2.6vmin,1.6rem)}
.banner .en{color:#5a4410}
.stage{flex:1;display:flex;align-items:center;justify-content:center;gap:3vmin;min-height:0}
.card{flex:1;max-width:44vw;min-height:34vmin;background:#fff8e7;color:#2b2118;border-radius:3vmin;padding:2.4vmin 2vmin;text-align:center;
 display:flex;flex-direction:column;justify-content:center;align-items:center;gap:1.6vmin;box-shadow:0 1.2vmin 0 rgba(0,0,0,.28);transition:transform .25s}
.card.recv{border:.8vmin solid #c0392b}
.card .lbl .en{color:#7a6a58}.card .lbl{font-size:clamp(1.1rem,3vmin,2rem);font-weight:700;color:#14452f}
.nm{font-size:clamp(2.2rem,10vmin,8rem);font-weight:900;line-height:1.1;word-break:break-word;min-height:1.2em}
.nm.spin{color:#9a8a76}
.card.pop{animation:pop .55s}
.card.land{animation:land .9s}
@keyframes pop{0%{transform:scale(.8)}60%{transform:scale(1.07)}100%{transform:scale(1)}}
@keyframes land{0%{transform:scale(1)}25%{transform:scale(1.14) rotate(-1.5deg)}55%{transform:scale(.97) rotate(1deg)}100%{transform:scale(1)}}
.arrow{font-size:clamp(2.4rem,9vmin,6rem);flex:none}
.hint{text-align:center;font-size:clamp(1.1rem,3vmin,2rem);color:#cfe3d6}
.ctrl{display:flex;justify-content:center;gap:2vmin;flex-wrap:wrap;align-items:center}
.btn{border:0;border-radius:2vmin;background:#c0392b;color:#fff;font:inherit;font-weight:800;padding:1.6vmin 3.4vmin;cursor:pointer;font-size:clamp(1.1rem,3vmin,2rem);text-decoration:none;text-align:center}
.btn .en{color:rgba(255,255,255,.85)}
.btn.alt{background:#2f7a52}.btn.ghost{background:rgba(255,255,255,.16)}
.btn[disabled]{opacity:.4;cursor:not-allowed}
.chain{display:flex;gap:1vmin;flex-wrap:wrap;justify-content:center;max-height:18vh;overflow:auto}
.chip{background:rgba(255,255,255,.14);border-radius:999px;padding:.4vmin 1.8vmin;font-size:clamp(.9rem,2.2vmin,1.5rem);white-space:nowrap}
.panel{margin:auto;background:#fff8e7;color:#2b2118;border-radius:3vmin;padding:4vmin;max-width:min(92vw,760px);text-align:center}
.panel h1{margin:0 0 1vmin;color:#14452f;font-size:clamp(1.6rem,5vmin,3rem)}
.panel .en{color:#7a6a58}
.panel .btn .en{color:rgba(255,255,255,.85)}
.panel .btn.ghost .en{color:#7a6a58}
.panel input[type=text],.panel input[type=password]{width:100%;font:inherit;font-size:1.2em;padding:1.4vmin;border:3px solid #d9c9a3;border-radius:1.4vmin;margin:.8vmin 0 1.8vmin;text-align:center}
.panel label.chk{display:flex;gap:1vmin;text-align:left;align-items:flex-start;margin:1vmin 0 2vmin;cursor:pointer}
.panel label.chk input{transform:scale(1.5);margin:.6em .6em 0 .3em}
.err{color:#c0392b;font-weight:700;min-height:1.4em}
.overlay{position:fixed;inset:0;z-index:10;background:rgba(7,28,18,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3vmin;padding:4vmin;text-align:center}
.ring{max-width:90vw;font-size:clamp(1.2rem,3.4vmin,2.2rem);line-height:1.7}
.ring b{color:#e8b84a}
.big{font-size:clamp(2.4rem,8vmin,5.5rem);font-weight:900}
`;

const JS = String.raw`
const root = document.getElementById('root');
const base = document.body.dataset.base;
const DEMO = document.body.dataset.demo === '1';
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const bi = (zh, en, cls) => { const w = el('div', cls || ''); w.append(el('span', 'zh', zh), el('span', 'en', en)); return w; };
const btn = (zh, en, cls, fn) => { const b = el('button', 'btn ' + (cls || '')); b.type = 'button'; b.append(el('span', 'zh', zh), el('span', 'en', en)); if (fn) b.onclick = fn; return b; };
const post = async (a, b) => {
  try {
    const r = await fetch(base + '/reveal/' + a, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b || {}) });
    return await r.json();
  } catch (e) { return { ok: false, error: 'network' }; }
};
const S = { names: [], total: 0, step: 0, all: [], queue: null, busy: false, auto: false, done: false };

// ---- confetti ----
const fx = document.getElementById('fx'); const ctx = fx.getContext('2d'); let parts = []; let raf = 0;
const fit = () => { fx.width = innerWidth; fx.height = innerHeight; }; fit(); addEventListener('resize', fit);
function burst(n, y) {
  if (REDUCED) return;
  const colors = ['#c0392b', '#e8b84a', '#fff8e7', '#2f9e66', '#ff7b6b'];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = 6 + Math.random() * 14;
    parts.push({ x: innerWidth / 2, y: innerHeight * (y || 0.45), vx: Math.cos(a) * s, vy: Math.sin(a) * s - 6, r: 4 + Math.random() * 7, c: colors[i % 5], life: 90 + Math.random() * 50 });
  }
  if (!raf) raf = requestAnimationFrame(loop);
}
function loop() {
  ctx.clearRect(0, 0, fx.width, fx.height);
  parts = parts.filter((p) => p.life > 0);
  for (const p of parts) { p.x += p.vx; p.y += p.vy; p.vy += 0.35; p.vx *= 0.99; p.life--; ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.r, p.r * 0.6); }
  raf = parts.length ? requestAnimationFrame(loop) : 0;
  if (!raf) ctx.clearRect(0, 0, fx.width, fx.height);
}

// ---- screens ----
function panel(icon, zh, en, extra) {
  root.replaceChildren();
  const p = el('div', 'panel'); p.append(el('div', 'big', icon), bi(zh, en, 'h')); p.firstChild.nextSibling.firstChild.style.fontSize = '1.6em';
  if (extra) p.append(...extra);
  root.append(p); return p;
}
const back = () => { const a = el('a', 'btn ghost'); a.href = base; a.style.color = '#2b2118'; a.append(el('span', 'zh', '回後台'), el('span', 'en', 'Back to admin')); return a; };
const rehearse = () => { const a = el('a', 'btn alt'); a.href = base + '/reveal?demo=1'; a.append(el('span', 'zh', '🧪 用假名字彩排'), el('span', 'en', 'Rehearse with fake names')); return a; };
const row = (...kids) => { const r = el('div', 'ctrl'); r.append(...kids); return r; };

function showLock(j) {
  if (!j.open) {
    const t = j.why === 'no_date' ? ['請先在後台設定活動時間', 'Set the event time in admin first'] : ['還沒到揭曉時間', 'Reveal is not open yet'];
    const extra = [];
    if (j.opens_at) extra.push(bi('開放時間（東部時間）：' + j.opens_at.replace('T', ' '), 'Opens (Eastern time): ' + j.opens_at.replace('T', ' '), 'sub'));
    extra.push(row(rehearse(), back()));
    return panel('🔒', t[0], t[1], extra);
  }
  const phrase = el('input'); phrase.type = 'text'; phrase.placeholder = 'REVEAL'; phrase.autocomplete = 'off';
  const pw = el('input'); pw.type = 'password'; pw.placeholder = '密碼 Password'; pw.autocomplete = 'current-password';
  const chk = el('input'); chk.type = 'checkbox';
  const lab = el('label', 'chk'); lab.append(chk, bi('我知道解鎖後會一組一組公開配對，而且無法收回。', 'I understand pairings will be shown one by one and this cannot be undone.'));
  const err = el('div', 'err');
  const go = btn('解鎖並開始', 'Unlock and start', '', async () => {
    err.textContent = ''; go.disabled = true;
    const r = await post('unlock', { phrase: phrase.value, password: pw.value, sure: chk.checked });
    if (r.ok) return boot();
    err.textContent = r.error || 'error'; go.disabled = false;
  });
  panel('🎬', '揭曉日解鎖', 'Unlock the reveal', [
    bi('請輸入 REVEAL，再輸入一次後台密碼，並勾選確認。', 'Type REVEAL, enter the admin password again and tick the box.', 'sub'),
    phrase, pw, lab, err, row(go, rehearse(), back()),
  ]);
}

function card(zh, en, cls) { const c = el('div', 'card ' + (cls || '')); c.append(bi(zh, en, 'lbl')); c.nm = el('div', 'nm', '?'); c.append(c.nm); return c; }
function setProg() { S.prog.textContent = S.step + ' / ' + S.total; }
function addChip(g, r) { S.chain.append(el('span', 'chip', g + ' → ' + r)); S.chain.scrollTop = 1e6; }
function setCtrl() {
  S.next.disabled = S.busy || S.done;
  S.autoBtn.disabled = S.done;
  S.replay.style.display = S.done ? '' : 'none';
}

function showStage() {
  root.replaceChildren();
  const top = el('div', 'top'); top.append(bi('🎄 配對揭曉', 'Gift Reveal', 'title')); S.prog = el('div', 'prog'); top.append(S.prog);
  root.append(top);
  if (DEMO) root.append(bi('🧪 彩排模式：這些是假名字，不是真的配對', 'Rehearsal: fake names, not the real pairings', 'banner'));
  S.gc = card('送禮的人', 'Santa'); S.rc = card('收禮的人', 'Receiver', 'recv');
  const stage = el('div', 'stage'); stage.append(S.gc, el('div', 'arrow', '🎁 →'), S.rc); root.append(stage);
  S.hint = bi('按空白鍵或點「下一組」揭曉', 'Press Space or tap Next to reveal', 'hint'); root.append(S.hint);
  S.next = btn('下一組 ▶', 'Next', '', () => next());
  S.autoBtn = btn('自動播放：關', 'Auto: off', 'alt', () => {
    S.auto = !S.auto; S.autoBtn.firstChild.textContent = S.auto ? '自動播放：開' : '自動播放：關'; S.autoBtn.lastChild.textContent = S.auto ? 'Auto: on' : 'Auto: off';
    if (S.auto && !S.busy && !S.done) next();
  });
  S.replay = btn('🔁 重播', 'Replay', 'ghost', () => replay()); S.replay.style.display = 'none';
  const fs = btn('全螢幕', 'Fullscreen', 'ghost', () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); });
  root.append(row(S.next, S.autoBtn, S.replay, fs));
  S.chain = el('div', 'chain'); root.append(S.chain);
  for (const p of S.all.slice(0, S.step)) addChip(p[0], p[1]);
  if (S.step > 0) { const last = S.all[S.step - 1]; S.gc.nm.textContent = last[1]; }
  S.done = S.step >= S.total && S.total > 0;
  setProg(); setCtrl();
  if (S.done) finale(false);
}

function spin(node, final) {
  return new Promise((res) => {
    if (REDUCED || S.names.length < 2) { node.textContent = final; return res(); }
    let d = 55, n = 0, last = '';
    node.classList.add('spin');
    (function tick() {
      n++;
      if (n >= 18) { node.classList.remove('spin'); node.textContent = final; return res(); }
      let pick; do { pick = S.names[Math.floor(Math.random() * S.names.length)]; } while (pick === last);
      last = pick; node.textContent = pick; d *= 1.12; setTimeout(tick, d);
    })();
  });
}
const retrigger = (c, cls) => { c.classList.remove('pop', 'land'); void c.offsetWidth; c.classList.add(cls); };

async function next() {
  if (S.busy || S.done) return;
  S.busy = true; setCtrl();
  let pair;
  if (S.queue) pair = S.queue[S.step];
  else {
    const j = await post('next', { step: S.step });
    if (!j.ok) { if (j.step !== undefined) return location.reload(); S.busy = false; setCtrl(); S.hint.firstChild.textContent = '出錯了：' + j.error; return; }
    pair = [j.giver, j.receiver]; S.all.push(pair);
  }
  S.hint.style.visibility = 'hidden';
  S.gc.nm.textContent = pair[0]; retrigger(S.gc, 'pop');
  S.rc.nm.textContent = '?';
  await sleep(REDUCED ? 0 : 900);
  await spin(S.rc.nm, pair[1]);
  retrigger(S.rc, 'land'); burst(70);
  addChip(pair[0], pair[1]); S.step++; setProg();
  S.busy = false;
  if (S.step >= S.total) { S.done = true; setCtrl(); await sleep(REDUCED ? 0 : 2200); return finale(true); }
  setCtrl();
  if (S.auto) { await sleep(3200); if (S.auto && !S.busy && !S.done) next(); }
}

function finale(celebrate) {
  const ring = S.all.map((p) => p[0]); ring.push(S.all[0][0]);
  const o = el('div', 'overlay');
  const names = el('div', 'ring');
  ring.forEach((n, i) => { if (i) names.append(' → '); names.append(el('b', '', n)); });
  const close = btn('關閉', 'Close', 'ghost', () => o.remove());
  const rp = btn('🔁 重播', 'Replay', '', () => { o.remove(); replay(); });
  o.append(bi('🎉 全部揭曉！', 'Everyone is matched!', 'big'), names, row(rp, close));
  document.body.append(o);
  if (celebrate) { burst(160, 0.4); setTimeout(() => burst(120, 0.5), 700); }
}

function replay() {
  S.queue = S.all.slice(); S.step = 0; S.done = false; S.auto = false;
  S.chain.replaceChildren(); S.gc.nm.textContent = '?'; S.rc.nm.textContent = '?';
  S.hint.style.visibility = ''; S.autoBtn.firstChild.textContent = '自動播放：關'; S.autoBtn.lastChild.textContent = 'Auto: off';
  setProg(); setCtrl();
}

addEventListener('keydown', (e) => {
  if (!S.next || /INPUT|TEXTAREA/.test((e.target || {}).tagName || '')) return;
  if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); next(); }
});

function startDemo() {
  const names = ['聖誕老人', '麋鹿', '雪人', '小精靈', '薑餅人', '聖誕樹'];
  const ring = names.slice().sort(() => Math.random() - 0.5);
  S.names = names; S.total = ring.length; S.step = 0; S.all = ring.map((g, i) => [g, ring[(i + 1) % ring.length]]); S.queue = S.all.slice();
  showStage();
}

async function boot() {
  if (DEMO) return startDemo();
  const j = await post('state');
  if (!j.ok) return panel('⚠️', '出錯了', j.error || 'error', [row(back())]);
  if (j.state === 'not_matched') return panel('🎁', '還沒配對', 'Not matched yet', [row(back())]);
  if (j.state === 'locked') return showLock(j);
  S.names = j.names; S.total = j.total; S.step = j.step; S.all = j.revealed.slice(); S.queue = null;
  showStage();
}
boot();
`;

export function revealPage({ base, demo }) {
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>配對揭曉 Gift Reveal</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎁</text></svg>">
<style>${CSS}</style></head>
<body data-base="${esc(base)}" data-demo="${demo ? "1" : "0"}"><div id="root"></div><canvas id="fx"></canvas><script>${JS}</script></body></html>`;
}
