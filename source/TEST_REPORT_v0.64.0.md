# LuckyDex v0.64.0 – Delibird's Delivery

## Scope
- Removed Tumbling Togepi from active LuckyDex source, Stadium 2 registration, UI, help, session rules, records, achievements, tests and release reports.
- Added a save migration that drops the retired game record while preserving unrelated Arcade state.
- Added Pokémon Stadium 2 **Delibird's Delivery**.

## Delibird's Delivery
- 60-second four-player factory shift with a 3 → 2 → 1 → GO start.
- Control Stick movement only; pickup and conveyor banking are automatic.
- Up to five carried presents.
- Shared gift pool and shared moving Swinub hazards for player and CPUs.
- Swinub collisions remove all unbanked presents while delivered score remains safe.
- Loaded sacks slow Delibird; bulky gifts add more burden.
- Consecutive matching gifts score increasing 1× / 2× / 3× value within a delivery.
- Original gift table used in this build: Candy 20, Stocking 50, Game Boy 100, Nintendo 64 250, Snorlax Doll 350, Piano 600, Ring 1000.
- Easy / Normal / Hard CPU decision profiles; CPUs collect, bank and collide in the same arena rather than using fake score timers.
- Shared first-play instructions / ⓘ pause flow.
- Records: games, wins, podiums, per-difficulty best score/wins, delivered gifts, banked points, Swinub hits, best matching chain and full-bag deliveries.
- Achievements: First Shift, Special Delivery, Express Courier, Full Sack.
- No invented rare event or Developer toggle.

## Verification
Fresh focused verification on the cumulative patch source:
- 25 / 25 included subtests passed across 8 test programs.
- Changed JavaScript files passed `node --check`.
- Delibird core load check: 4 players, 14 gifts and 3 Swinub created.
- `index.html` contains no duplicate IDs.
- No active Tumbling Togepi references or gameplay files remain.
- 100-run CPU simulation showed difficulty progression in average CPU scoring.
- A simple route/bank simulation remained competitive against all three CPU levels, confirming the game is not CPU-pre-decided.

## Full-suite limitation
`npm test` cannot run in this patch workspace because `source/scripts/run-tests.cjs` is not present in the supplied partial source. This report therefore does **not** claim that the complete repository suite passed. Run `npm test` from the complete GitHub checkout after applying the patch.
