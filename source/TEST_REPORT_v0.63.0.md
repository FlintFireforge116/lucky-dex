# LuckyDex v0.63.0 – Tumbling Togepi

## Included changes
- Added Pokémon Stadium 2 **Tumbling Togepi** as the next Kids Club minigame.
- Faithful core: Control Stick movement only, four parallel racers, flowers/boulders/logs/Diglett hazards, blue speed arrows, stronger consecutive-arrow boosts, and first-to-finish race rules.
- Togepi is always available; a caught Omanyte unlocks the faithful alternate racer.
- Added Easy / Normal / Hard CPU pacing and route accuracy.
- Added persistent records for times, wins, podiums, boost chains, arrows, hazard hits, flawless wins and Omanyte wins.
- Added achievements: Downhill Debut, Tumble Winner, Rolling Ace and Blue Streak.
- Registered the game with shared first-play / ⓘ instructions and Stadium 2 navigation.
- Added Streaming Stampede **−1 / B correction** input for accidental counts; correction is only available while count entry is active and cannot go below zero.

## Verification performed in the patch workspace
- Red/green TDD was used for both the Streaming Stampede correction and Tumbling Togepi core/integration behaviour.
- All 7 test programs present in this patch workspace pass (21 individual tests).
- Changed JavaScript files pass `node --check`.
- Stadium 2 tile-metadata regression passes with Tumbling Togepi registered.
- Deterministic race simulation: an arrow-chasing driver that still clips hazards won 31/100 Normal races and 0/100 Hard races; a clean route that deliberately avoids hazards won all Easy/Normal races and 49/100 Hard races. This keeps execution and course-reading meaningful, with Hard remaining demanding.
- No duplicate IDs were found in `index.html`; new CSS/script references occur once each.

## Full-suite limitation
`npm test` cannot run in this patch-only workspace because `source/scripts/run-tests.cjs` is not included in the supplied partial release patch. Run `npm test` after overlaying this patch onto the complete GitHub checkout.
