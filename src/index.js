import { parseWish } from "./data.js";
import { makeRing, walkRing } from "./match.js";
import { homePage, invitePage, loginPage, adminPage, layout, esc, endStamp, icsStamp } from "./pages.js";
import { revealPage } from "./reveal.js";

const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
const CODE_RE = /^[2-9a-hj-km-np-z]{6}$/;
const MAX_BODY = 8192;
const COOKIE = "xa";
const SESSION_SECONDS = 12 * 3600;

const enc = new TextEncoder();
const html = (s, status = 200) =>
  new Response(s, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });
const json = (o, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const notFound = () =>
  html(layout("404", `<div class="hero"><div class="tree">❄️</div><h1>找不到這個連結<span class="en">Link not found</span></h1></div><section class="card"><p>請向主辦人確認你的專屬連結。<span class="en">Please check your personal link with the host.</span></p><p><a href="/">← 回首頁 Home</a></p></section>`), 404);

function newCode() {
  const b = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(b, (x) => ALPHABET[x % ALPHABET.length]).join("");
}

async function readJson(request) {
  const len = Number(request.headers.get("content-length") || 0);
  if (len > MAX_BODY) return null;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function getSettings(db) {
  const { results } = await db.prepare("SELECT key, value FROM settings").all();
  return Object.fromEntries(results.map((r) => [r.key, r.value]));
}
const setSetting = (db, k, v) =>
  db.prepare("INSERT INTO settings (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = ?2").bind(k, v);
const getPeople = async (db) =>
  (await db.prepare("SELECT code, name, wish_json, gives_to, bought FROM participants ORDER BY created_at, name").all()).results;

// ---------- admin auth ----------
async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(msg)));
}
const hex = (u8) => Array.from(u8, (b) => b.toString(16).padStart(2, "0")).join("");
async function safeEqual(a, b) {
  const [ha, hb] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
  return crypto.subtle.timingSafeEqual(ha, hb);
}
async function makeSession(env) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  return `${exp}.${hex(await hmac(env.ADMIN_PASSWORD, `${env.ADMIN_PATH}:${exp}`))}`;
}
async function hasSession(request, env) {
  const m = (request.headers.get("cookie") || "").match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`));
  if (!m) return false;
  const [exp, sig] = m[1].split(".");
  if (!sig || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, hex(await hmac(env.ADMIN_PASSWORD, `${env.ADMIN_PATH}:${exp}`)));
}

async function adminRoute(request, env, url, sub) {
  const base = `/a/${env.ADMIN_PATH}`;
  const secure = url.protocol === "https:" ? "; Secure" : "";
  if (sub === "/login" && request.method === "POST") {
    const form = await request.formData().catch(() => null);
    const pw = String((form && form.get("password")) || "");
    if (env.ADMIN_PASSWORD && (await safeEqual(pw, env.ADMIN_PASSWORD))) {
      return new Response(null, {
        status: 303,
        headers: { location: base, "set-cookie": `${COOKIE}=${await makeSession(env)}; Path=${base}; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure}` },
      });
    }
    await new Promise((r) => setTimeout(r, 600));
    return html(loginPage(base, true), 401);
  }
  const authed = await hasSession(request, env);
  if (sub === "" || sub === "/") {
    if (!authed) return html(loginPage(base, false));
    const [settings, people] = await Promise.all([getSettings(env.DB), getPeople(env.DB)]);
    return html(adminPage({ base, origin: url.origin, settings, people }));
  }
  if (sub === "/api" && request.method === "POST") {
    if (!authed) return json({ ok: false, error: "請重新登入 Please sign in again" }, 401);
    if ((request.headers.get("origin") || url.origin) !== url.origin) return json({ ok: false, error: "bad origin" }, 403);
    const body = await readJson(request);
    if (!body) return json({ ok: false, error: "bad request" }, 400);
    return adminApi(env.DB, body);
  }
  if (sub === "/reveal" && request.method === "GET") {
    if (!authed) return html(loginPage(base, false));
    return html(revealPage({ base, demo: url.searchParams.get("demo") === "1" }));
  }
  if (sub.startsWith("/reveal/") && request.method === "POST") {
    if (!authed) return json({ ok: false, error: "請重新登入 Please sign in again" }, 401);
    if ((request.headers.get("origin") || url.origin) !== url.origin) return json({ ok: false, error: "bad origin" }, 403);
    const body = await readJson(request);
    if (!body) return json({ ok: false, error: "bad request" }, 400);
    return revealApi(env, sub.slice("/reveal/".length), body);
  }
  return notFound();
}

// Reveal opens one hour before the event start, in Eastern time (event_date is a floating local time).
const REVEAL_TZ = "America/Toronto";
const asUtc = (local) => Date.parse(local.slice(0, 16) + ":00Z");
function easternNow() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: REVEAL_TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      .formatToParts(new Date()).map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
function revealGate(settings) {
  const d = settings.event_date;
  if (!d || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(d)) return { open: false, why: "no_date" };
  const opensAt = asUtc(d) - 3600 * 1000;
  return { open: asUtc(easternNow()) >= opensAt, why: "too_early", opens_at: new Date(opensAt).toISOString().slice(0, 16) };
}

async function revealApi(env, action, body) {
  const db = env.DB;
  const settings = await getSettings(db);
  const people = await getPeople(db);
  const paired = people.filter((p) => p.gives_to);
  const total = paired.length;
  const unlocked = settings.reveal_unlocked === "1" && settings.reveal_start;
  const step = Number(settings.reveal_step || 0);
  const gives = new Map(paired.map((p) => [p.code, p.gives_to]));
  const name = new Map(people.map((p) => [p.code, p.name]));
  const named = (pairs) => pairs.map(([g, r]) => [name.get(g), name.get(r)]);

  if (action === "state") {
    if (!total) return json({ ok: true, state: "not_matched" });
    if (!unlocked) {
      const gate = revealGate(settings);
      return json({ ok: true, state: "locked", open: gate.open, why: gate.open ? null : gate.why, opens_at: gate.opens_at || null, total });
    }
    return json({ ok: true, state: "open", step, total, names: people.map((p) => p.name), revealed: named(walkRing(gives, settings.reveal_start, step)) });
  }
  if (action === "unlock") {
    if (!total) return json({ ok: false, error: "還沒配對 Not matched yet" }, 400);
    if (unlocked) return json({ ok: true });
    if (String(body.phrase || "").trim().toUpperCase() !== "REVEAL") return json({ ok: false, error: "請輸入 REVEAL Type REVEAL" }, 400);
    if (body.sure !== true) return json({ ok: false, error: "請勾選確認 Please tick the box" }, 400);
    if (!(await safeEqual(String(body.password || ""), env.ADMIN_PASSWORD))) {
      await new Promise((r) => setTimeout(r, 800));
      return json({ ok: false, error: "密碼不對 Wrong password" }, 403);
    }
    if (!revealGate(settings).open) return json({ ok: false, error: "還沒到揭曉時間 Not time yet" }, 403);
    const start = paired[crypto.getRandomValues(new Uint32Array(1))[0] % total].code;
    await db.batch([setSetting(db, "reveal_unlocked", "1"), setSetting(db, "reveal_start", start), setSetting(db, "reveal_step", "0"), setSetting(db, "status", "party")]);
    return json({ ok: true });
  }
  if (action === "next") {
    if (!unlocked) return json({ ok: false, error: "locked" }, 403);
    if (Number(body.step) !== step) return json({ ok: false, error: "out of sync", step }, 409);
    if (step >= total) return json({ ok: false, error: "done" }, 409);
    const pair = walkRing(gives, settings.reveal_start, step + 1).at(-1);
    await setSetting(db, "reveal_step", String(step + 1)).run();
    const [g, r] = named([pair])[0];
    return json({ ok: true, giver: g, receiver: r, step: step + 1, total });
  }
  return json({ ok: false, error: "unknown action" }, 400);
}

async function adminApi(db, body) {
  switch (body.action) {
    case "settings": {
      const status = ["collecting", "matched", "party", "ended"].includes(body.status) ? body.status : null;
      const people = await getPeople(db);
      const anyPairs = people.some((p) => p.gives_to);
      if (!status) return json({ ok: false, error: "bad status" }, 400);
      if (status === "collecting" && anyPairs) return json({ ok: false, error: "已配對，請用「取消配對並重新開放」 Use “Cancel and reopen”" }, 400);
      if (status !== "collecting" && !anyPairs) return json({ ok: false, error: "還沒配對，請按「開始隨機配對」 Run the match first" }, 400);
      const date = String(body.event_date || "");
      if (date && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(date)) return json({ ok: false, error: "bad date" }, 400);
      if (anyPairs) {
        const old = (await getSettings(db)).event_date;
        if (old && date < old) return json({ ok: false, error: "配對後只能延後日期，不能提前 After matching the date can only move later" }, 400);
      }
      await db.batch([
        setSetting(db, "status", status),
        setSetting(db, "event_title", String(body.event_title || "").slice(0, 60)),
        setSetting(db, "event_date", date),
        setSetting(db, "event_place", String(body.event_place || "").slice(0, 120)),
      ]);
      return json({ ok: true });
    }
    case "add": {
      const settings = await getSettings(db);
      if ((settings.status || "collecting") !== "collecting") return json({ ok: false, error: "已配對，先取消配對才能新增 Reopen before adding people" }, 400);
      const names = (Array.isArray(body.names) ? body.names : []).map((n) => String(n).trim().slice(0, 40)).filter(Boolean).slice(0, 100);
      const stmts = names.map((n) => db.prepare("INSERT INTO participants (code, name) VALUES (?1, ?2)").bind(newCode(), n));
      if (stmts.length) await db.batch(stmts);
      return json({ ok: true });
    }
    case "remove": {
      const settings = await getSettings(db);
      if ((settings.status || "collecting") !== "collecting") return json({ ok: false, error: "已配對 Already matched" }, 400);
      await db.prepare("DELETE FROM participants WHERE code = ?1").bind(String(body.code)).run();
      return json({ ok: true });
    }
    case "match": {
      const settings = await getSettings(db);
      if ((settings.status || "collecting") !== "collecting") return json({ ok: false, error: "已配對 Already matched" }, 400);
      const people = await getPeople(db);
      if (people.length < 3) return json({ ok: false, error: "至少 3 人 Need at least 3 people" }, 400);
      const missing = people.filter((p) => !p.wish_json);
      if (missing.length && !body.fill_missing) return json({ ok: false, error: `還有 ${missing.length} 人沒填 ${missing.length} not filled in` }, 400);
      const pairs = makeRing(people.map((p) => p.code));
      const stmts = [
        ...missing.map((p) => db.prepare("UPDATE participants SET wish_json = ?2, wish_at = datetime('now') WHERE code = ?1").bind(p.code, JSON.stringify({ mode: "any" }))),
        ...pairs.map(([g, r]) => db.prepare("UPDATE participants SET gives_to = ?2, bought = 0 WHERE code = ?1").bind(g, r)),
        setSetting(db, "status", "matched"),
      ];
      await db.batch(stmts);
      return json({ ok: true });
    }
    case "reset": {
      await db.batch([
        db.prepare("UPDATE participants SET gives_to = NULL, bought = 0"),
        db.prepare("DELETE FROM settings WHERE key LIKE 'reveal_%'"),
        setSetting(db, "status", "collecting"),
      ]);
      return json({ ok: true });
    }
  }
  return json({ ok: false, error: "unknown action" }, 400);
}

// ---------- public ----------
function icsEscape(s) {
  return String(s).replace(/[\\;,]/g, (c) => "\\" + c).replace(/\n/g, "\\n");
}
function eventIcs(s, host) {
  const d = s.event_date;
  if (!d || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(d)) return null;
  const stamp = icsStamp;
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//xmas-gift//EN", "BEGIN:VEVENT",
    `UID:xmas-${stamp(d)}@${host}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART:${stamp(d)}`, `DTEND:${endStamp(d)}`,
    `SUMMARY:${icsEscape(s.event_title || "聖誕交換禮物")}`,
    `LOCATION:${icsEscape(s.event_place || "")}`,
    "END:VEVENT", "END:VCALENDAR", "",
  ].join("\r\n");
}

async function inviteRoute(request, env, url, code, sub) {
  const me = await env.DB.prepare("SELECT * FROM participants WHERE code = ?1").bind(code).first();
  if (!me) return notFound();
  const settings = await getSettings(env.DB);
  const status = settings.status || "collecting";
  if (sub === "" && request.method === "GET") {
    const recipient = status !== "collecting" && me.gives_to
      ? await env.DB.prepare("SELECT wish_json FROM participants WHERE code = ?1").bind(me.gives_to).first()
      : null;
    return html(invitePage({ me, status, recipient, settings }));
  }
  if (request.method !== "POST" || (request.headers.get("origin") || url.origin) !== url.origin) return notFound();
  const body = await readJson(request);
  if (!body) return json({ ok: false, error: "格式錯誤 Bad request" }, 400);
  if (sub === "/wish") {
    if (status !== "collecting") return json({ ok: false, error: "已配對，不能再改 Matching is done, wish list is locked" }, 409);
    const r = parseWish(body);
    if (r.error) return json({ ok: false, error: r.error }, 400);
    await env.DB.prepare("UPDATE participants SET wish_json = ?2, wish_at = datetime('now') WHERE code = ?1").bind(code, JSON.stringify(r.wish)).run();
    return json({ ok: true });
  }
  if (sub === "/bought") {
    if (status === "collecting") return json({ ok: false, error: "還沒配對 Not matched yet" }, 409);
    await env.DB.prepare("UPDATE participants SET bought = ?2 WHERE code = ?1").bind(code, body.bought ? 1 : 0).run();
    return json({ ok: true });
  }
  return notFound();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    try {
      if (path === "/robots.txt") return new Response("User-agent: *\nDisallow: /\n", { headers: { "content-type": "text/plain" } });
      if (path === "/" && request.method === "GET") {
        const [settings, people] = await Promise.all([getSettings(env.DB), getPeople(env.DB)]);
        return html(homePage({ settings, people }));
      }
      if (path === "/event.ics" && request.method === "GET") {
        const ics = eventIcs(await getSettings(env.DB), url.host);
        if (!ics) return notFound();
        return new Response(ics, { headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": 'attachment; filename="xmas.ics"' } });
      }
      if (env.ADMIN_PATH && env.ADMIN_PASSWORD) {
        const base = `/a/${env.ADMIN_PATH}`;
        if (path === base || path.startsWith(base + "/")) return adminRoute(request, env, url, path.slice(base.length));
      }
      const m = /^\/([^/]+)(\/wish|\/bought)?$/.exec(path);
      if (m && CODE_RE.test(m[1])) return inviteRoute(request, env, url, m[1], m[2] || "");
      return notFound();
    } catch (e) {
      console.error(e);
      return html(layout("Error", `<section class="card"><h2>出錯了 Something went wrong</h2><p>${esc("請稍後再試 Please try again.")}</p></section>`), 500);
    }
  },
};
