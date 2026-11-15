# AGENTS.md

Anonymous Christmas gift exchange for a small friend group. Cloudflare Pages (`_worker.js`) + D1. Public repo, short-lived site.

## Privacy rules (most important)
This repo is **public**. Never commit or write into any file, test, fixture, comment, commit message or PR:
- real names, Instagram handles, emails, phone numbers, photos of participants
- the event address or date of a real event (use placeholders)
- the admin path, admin password, invite codes, any secret or token, `.dev.vars`
- the Cloudflare account id, or any real pairing (who gives to whom)

Secrets live only in Cloudflare (`wrangler pages secret put`). Use fake names (`Alice`, `p1`) in tests and demos.
Commit with a GitHub noreply email, not a personal one.

## Run
```bash
npm test          # pairing tests
npm run db:local  # local tables
npm run dev       # build + pages dev, reads .dev.vars (git-ignored)
npm run deploy -- --project-name <name> --branch main
```
`src/` is a plain Worker module; `npm run build` bundles it into `public/_worker.js` (git-ignored).

## Layout
- `src/index.js` router, admin API, reveal API
- `src/pages.js` pages and CSS, `src/reveal.js` TV reveal page
- `src/data.js` categories and limits, `src/match.js` pairing (single ring)
- `test/` pairing tests, `schema.sql` D1 tables

## Conventions
- UI is Traditional Chinese with small English underneath (`bi(zh, en)`). Keep copy short and simple.
- Escape all user text with `esc()` on the server; build client DOM with `textContent`.
- Nothing may reveal pairs early: no admin peek, the reveal page gives one pair per call and is date-locked.
- Households (`grp`, see `src/groups.js`): never match people in one household; invite pages show opaque ids, never other people's codes (a code is a personal link).
- After matching, wish lists lock and the event date can only move later.
