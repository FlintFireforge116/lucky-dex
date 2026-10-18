# LuckyDex v0.47.4 Verification

## Roulette final cleanup

- Empty roulette pockets now render as dark recessed sockets; silver/gold ball markers only appear after a slot is actually occupied.
- The centre hub now shows a prominent `BALLS LEFT` count, calculated as `6 - occupied slots`.
- The old bottom `BALLS x / 6` label was removed so it cannot be lost against the vanity-bulb frame.
- Vanity bulbs are offset from each edge so horizontal and vertical bulb runs no longer share the four corner origins.
- Roulette mechanics, live multiplier rule, payouts, Golden Ball, Service Day, rescue events, records, achievements and win feedback are unchanged.

## Verification

- Focused Roulette / Arcade / records / achievements / release suite: 41/41 passed.
- v0.47.4 cleanup regression: 3/3 passed.
- Release identity: 0.47.4 / versionCode 4704.
- `arcade-roulette.js` syntax check passed.
- Arcade asset audit: 44 scenes/sheets/crops, 2,098 sprites and 2,078 actors passed.
- Venue audit: 8 assets passed.
- Adventure audit: 829 images / 1,025 species passed.
- Fossil Museum audit: 42 images passed.
- Sleeve audit: 202/202 passed.

No Codex used.
