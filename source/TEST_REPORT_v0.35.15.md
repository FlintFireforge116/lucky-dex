# LuckyDex v0.35.15 verification report

## Scope

v0.35.15 is a physical-pack integrity pass prompted by on-device findings in v0.35.14: non-booster Trainer Kits appearing in Pack Shop, Dragon Vault exposing redundant `No Rarity` text and obsolete wrapper art, and a Jungle opening containing multiple holo rares.

## Product routing

- Physical Pack Shop now admits only products that resolve to an audited `productKind: booster` profile, are explicitly purchasable, and have a bundled/authenticated booster-art route.
- The selector, direct purchase boundary, and buried/excavated booster rewards all fail closed (`=== true`) rather than treating a missing policy resolver as permission.
- Fixed Trainer Kits, theme/fixed decks, promo-only products, energy products, McDonald's products, My First Battle, TCG Classic, Pokémon Rumble, Southern Islands and known subset rows are excluded from the physical booster shop.
- HS Trainer Kit—Gyarados is awarded at 500 unique physical TCG cards; HS Trainer Kit—Raichu at 1,000. Claiming them grants the authentic fixed 30-card Half Deck directly to the collection and does not increment booster-opening statistics.

## Pack-collation audit

The policy now parses both ISO dates and the legacy catalogue format (for example `Jun 16, 1999`) with strict calendar validation. Known series metadata is a fallback; unknown undated or malformed products fail closed instead of becoming modern Scarlet & Violet packs.

Audited standard profiles:

- WotC era: 11-card LuckyDex set-pool profile with one dedicated rare-or-higher slot. LuckyDex does not model separate cross-set/basic-energy objects for vintage packs.
- e-Card / EX: 9 expansion-card slots including reverse and rare slots.
- Diamond & Pearl through XY: 10 expansion-card slots.
- Sun & Moon / Sword & Shield: 10 expansion-card slots; the separate Basic Energy/VSTAR object is intentionally outside LuckyDex set-card collection.
- Scarlet & Violet / Mega Evolution: 10 expansion-card slots: 4 common, 3 uncommon, 2 foil/replacement slots, 1 rare-or-higher holo slot.

Audited special profiles include Legendary Collection, Dragon Vault, Legendary Treasures + Radiant Collection, Double Crisis, Detective Pikachu, Generations + Radiant Collection, Celebrations + Classic Collection and LuckyDex 30th Celebration.

A post-build pack validator now checks the generated cards against every slot descriptor before the reveal screen. The exact Jungle failure shape from the device screenshot (a Rare Holo occupying an Uncommon slot) is a regression test and is rejected.

The physical 1-in-500 Lucky Pack path was also found to be capable of creating extra hit slots in otherwise historical packs. That was a second independent route to the multi-holo Jungle result. Lucky Packs now bias only slots that were already `rareOrHigher`; they never convert common, uncommon, reverse or other non-hit slots into extra rares/holos. The original slot count and profile remain invariant.

Known inline/external subsets (Trainer Gallery, Galarian Gallery, Shiny Vault, Radiant Collection and Celebrations Classic Collection) are restricted to their declared replacement slots and cannot leak into ordinary core slots or become standalone boosters.

## Dragon Vault

- Cards 1–20 are treated as Holofoil with no ordinary rarity symbol; the reveal shows `HOLOFOIL` and suppresses the redundant `No Rarity` secondary line.
- Kyurem 21/20 displays `SECRET RARE`.
- The artwork override is case-safe for `dv1`, `DV1`, `library:DV1` and name-only catalogue rows.
- Runtime fallback is disabled for Dragon Vault so the obsolete 109×199 wrapper can never reappear.
- APK preBuild materializes the audited `1niceroli/ptcg-assets` Rayquaza packshot (`ray.webp`) and verifies the exact 210,014-byte Git blob SHA-1 `b21c12cb6766ae7c6bf21a194851cad954aea1a3`. It retries three times and hard-fails the APK build if the exact asset cannot be obtained.

Note: this execution environment cannot download the binary directly into the source ZIP. Therefore the high-resolution Dragon Vault file is materialized by GitHub Actions at APK build time. Unlike v0.35.14, failure is no longer silent and cannot produce an APK containing the obsolete fallback as though the upgrade succeeded.

## Verification performed

- `node --check`: all modified runtime JavaScript passed syntax validation.
- v0.35.15 focused suite: 31 tests passed, 0 failed.
- Full non-browser sweep: 229 test programs / 311 checks passed, 0 failed.
- 21 Playwright/browser-dependent programs were excluded because Playwright is not installed in this execution environment.
- `npm test` confirms the first 18 Adventure battle tests pass, then stops at `adventure-core.test.cjs` because `playwright` is not installed. This is an environment limitation, not counted as a product pass.
- `scripts/build-booster-art-index.py`: passed; 144/156 catalogue rows have real bundled packshots and the remaining 12 are explicitly non-booster products. Manifest remained unchanged.
- Local Android/Gradle APK compilation was not performed because this environment has no Gradle installation/wrapper. GitHub Actions remains the APK-build verification, including the exact Dragon Vault art materialization check.
