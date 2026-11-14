# xmas-gift

Anonymous Christmas gift exchange on a Cloudflare Worker + D1. Three pages: home `/`, personal invite `/<6 chars>`, host admin `/a/<ADMIN_PATH>`.

## Run locally
```bash
npm run test                 # pairing tests
npm run db:local             # create local tables
npx wrangler dev             # uses .dev.vars (ADMIN_PATH, ADMIN_PASSWORD)
```

## Deploy (once)
```bash
npx wrangler d1 create xmas-db            # copy the database_id into wrangler.toml
npx wrangler d1 execute xmas-db --remote --file=schema.sql
printf '%s' "<hidden-path>" | npx wrangler secret put ADMIN_PATH
printf '%s' "<password>"    | npx wrangler secret put ADMIN_PASSWORD
npx wrangler deploy
```

## Host flow
1. Open `/a/<ADMIN_PATH>`, sign in, set event title / time / place.
2. Paste names or Instagram handles (one per line) to create links; copy each link and DM it to that person.
3. When everyone has filled in a wish list, press the match button (status becomes "matched").
   Nobody sees the pairs: there is no peek button. Each person only sees the receiver's wish list.
4. Party day: open `/a/<ADMIN_PATH>/reveal` on the TV (sign in there). It unlocks from 1 hour before
   the event start (Eastern time). Type `REVEAL`, re-enter the password, tick the box. The server then hands
   out one pair per press (Space / Next), as a chain: each receiver becomes the next giver.
   Reload-safe; Replay uses the pairs already shown.
5. Rehearse first with `/a/<ADMIN_PATH>/reveal?demo=1` (fake names, no real data).
6. After matching the event date can only move later, so the date lock can't be bypassed from the admin page.
   (Whoever can run `wrangler` could still read the database. That is the only way to see pairs early.)

## After the event
```bash
npx wrangler delete xmas
npx wrangler d1 delete xmas-db
```
