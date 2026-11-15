# xmas-gift

Anonymous Christmas gift exchange on Cloudflare Pages (advanced mode `_worker.js`) + D1. Source is a plain Worker module in `src/`; `npm run build` bundles it into `public/_worker.js`. Three pages: home `/`, personal invite `/<6 chars>`, host admin `/a/<ADMIN_PATH>`.

## Run locally
```bash
npm run test                 # pairing tests
npm run db:local             # create local tables
npm run dev                  # builds, then pages dev; uses .dev.vars (ADMIN_PATH, ADMIN_PASSWORD)
```

## Deploy
```bash
npx wrangler d1 create xmas-db            # once; copy database_id into wrangler.toml
npx wrangler d1 execute xmas-db --remote --file=schema.sql
npx wrangler pages project create <name> --production-branch main --force   # --force: wrangler 4 otherwise delegates to Workers
printf '%s' "<hidden-path>" | npx wrangler pages secret put ADMIN_PATH --project-name <name>
printf '%s' "<password>"    | npx wrangler pages secret put ADMIN_PASSWORD --project-name <name>
npm run deploy -- --project-name <name> --branch main
```
Live: https://xmas-wy380k.pages.dev

## Host flow
1. Open `/a/<ADMIN_PATH>`, sign in, set event title / time / place.
2. Paste names or Instagram handles (one per line) to create links; copy each link and DM it to that person.
3. Optional: set who lives together in the "Lives with" column (couples, housemates). People in the same household are never matched to each other.
4. When everyone has filled in a wish list, press the match button (status becomes "matched").
   Nobody sees the pairs: there is no peek button. Each person only sees the receiver's wish list.
5. Party day: open `/a/<ADMIN_PATH>/reveal` on the TV (sign in there). It unlocks from 1 hour before
   the event start (Eastern time). Type `REVEAL`, re-enter the password, tick the box. The server then hands
   out one pair per press (Space / Next), as a chain: each receiver becomes the next giver.
   Reload-safe; Replay uses the pairs already shown.
6. Rehearse first with `/a/<ADMIN_PATH>/reveal?demo=1` (fake names, no real data).
7. After matching the event date can only move later, so the date lock can't be bypassed from the admin page.
   (Whoever can run `wrangler` could still read the database. That is the only way to see pairs early.)

## Upgrading an existing database
Older databases need the household column once: `npx wrangler d1 execute xmas-db --remote --command "ALTER TABLE participants ADD COLUMN grp TEXT"`.

## After the event
```bash
npx wrangler pages project delete xmas-wy380k
npx wrangler d1 delete xmas-db
```
