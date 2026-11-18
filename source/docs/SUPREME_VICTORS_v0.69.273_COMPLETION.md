# LuckyDex v0.69.273 — Supreme Victors completion

This patch follows v0.69.272 and completes the source implementations for the remaining 37 prints in Platinum—Supreme Victors (`pl3`).

## Print and build integrity

- 153 / 153 official collector prints present and battle/deck enabled, including SH7–SH9.
- 254 printed attacks and 34 Poké-Powers/Bodies retained.
- `scripts/pl3_verified.py` maps the final attack, Trainer and Power outcomes, including explicit choices.
- `scripts/build-supreme-victors.py` and the **matching generated** `app/src/main/assets/tcg-classic-supreme-victors.js` are both included to prevent a GitHub regeneration mismatch.
- `app/build.gradle` runs the three Supreme Victors test files **after regeneration**, followed by the independent smoke auditor, before merging APK assets.

## Major mechanics completed

- Absol G: Doom News Energy return and delayed knockout at the end of the target's next turn; Absol G LV.X: Darkness Send to the Lost Zone.
- Garchomp C LV.X: Dragon Rush selection, two actual Energy discards and next-turn restriction; Healing Breath on level-up.
- Rayquaza C LV.X: Final Blowup hand-dependent discard; Dragon Spirit with physical discarded Energy selection following a survived attack.
- Staraptor FB LV.X: Fast Call searches Supporters; Defog stadium discard happens before damage.
- Electivire FB LV.X: Energy Recycle offers Energy and receiving Pokémon choices, then ends the turn.
- Metagross Gravitation, Venusaur Green Aroma, Lunatone Marvel Eyes, Mr. Mime Focus Wall, Blaziken FB LV.X Burning Spirit, Exploud Erasing Sound and Skarmory FB Silver Feather: continuous or reactive damage/status hooks.
- Parasect Nutritional Support, Chatot G deck-order choices, Night Teleporter, Cyrus's Initiative, Murkrow's Switcheroo and Yanma's Baton Pass: real card and target selection.
- Other remaining attacks and Powers, including Gravity Wave, Metal Max, Synchro Attack, Circling Dive and Sunshine Fate.

## Checks run locally

- Supreme Victors Stage 1/2/3: **40 passed**.
- Existing Classic CI preflight: **273 passed**.
- Stormfront, Platinum, Rising Rivals: **164 passed**.
- Independent Supreme Victors audit: **153/153 enabled; 0 definite errors; 0 warnings; 16/16 CPU builds; 520/522 synthetic actions executed (2 legal-action skips)**.

The APK itself must still be built by GitHub Actions and tested on device. Automated tests do not guarantee every possible board state or CPU decision.
