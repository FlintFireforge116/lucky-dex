# LuckyDex v0.47.3 Verification

## Roulette cleanup

- Normal settled/spinning balls use reflective metallic silver treatment.
- Golden Ball uses reflective metallic gold treatment.
- Removed the top roulette pointer.
- Added prominent in-wheel win / Golden Ball payout flash and winning-slot pulse.
- Exact-slot bets now highlight their live wheel slot as group bets already did.
- Mobile Roulette is locked to the dynamic viewport with compact short-screen scaling.
- Added carnival / vanity-bulb framing and richer wheel / board presentation.
- Live Pokémon and colour multipliers remain `12 / remaining empty matching slots`.
- Fixed Roulette career stat persistence (`bestPayout`, `biggestMultiplier`, wins, spins, totals, completed tables) by avoiding a second Arcade-state normalization that detached the record object during settlement.

## Verification

- `node --test` focused Roulette / Arcade / records / achievements / release suite: 38/38 passed.
- v0.47.3 Roulette cleanup regression: 6/6 passed.
- Release identity: 0.47.3 / versionCode 4703.
- JS syntax check passed for `arcade-roulette.js`.
- Arcade asset validation: 44 scenes/sheets/crops, 2,098 sprites, 2,078 actors passed.
- Venue validation: 8 assets passed.
- Adventure assets: 829 images / 1,025 species passed.
- Fossil Museum: 42 images passed.
- Sleeve audit: 202/202 passed.
- Headless Chromium visual capture was attempted but the container browser timed out on unavailable D-Bus services; no browser screenshot is claimed.

No Codex used.
