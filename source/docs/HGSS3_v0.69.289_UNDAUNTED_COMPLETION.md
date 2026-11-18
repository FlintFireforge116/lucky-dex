# LuckyDex v0.69.289 — HGSS Undaunted completion

**Set:** hgss3 Undaunted, 91 authenticated English collector prints (1–90 + THREE). **Coverage:** 91/91 battle-enabled; 0 gated. No card identity, print stats, rarity or printed text is replaced with synthetic art or names.

## Rules integrated

- LEGEND 87+88 Kyogre & Groudon and 89+90 Rayquaza & Deoxys are two actual physical-card pairs occupying one Bench space with two-Prize knockout rule. Mega Tidal Wave, Massive Eruption, Ozone Buster and Space Virus use printed discard and award timing.
- Prime Espeon, Houndoom, Raichu, Scizor, Slowking and Umbreon execute their printed Powers/Bodies, targets and suppressibility rules. Stadium actions, typed Special Energy, damage guards and target choices use battle-state data.
- Other new effects include Rotom prize swap, Sableye Pull Out, Smeargle Portrait, Vileplume Trainer lock, LEGEND Box, Flower Shop Lady, Burned Tower, Ruins of Alph, Defender, Energy Exchanger, Sage’s Training and secret Alph Lithograph THREE.
- Togetic Fly and Doduo Double Headstrike coin gates resolve before damage; Gyro Ball switches your Pokémon first and then requests the defender's choice for their new Active.

## Verification

- Dedicated Stage1 + completion test suites included in mandatory APK Gradle gate.
- Independent audit command: `node scripts/audit-classic-set.cjs --set hgss3 --smoke --no-write`.
- Local synthetic validations do not constitute a successful v289 GitHub APK build or phone gameplay QA.

## Installation

Apply only the changed source-relative files to your existing v0.69.288 working tree, then stage/commit/push. The APK CI should regenerate the catalogue and rerun the pinned metadata and battle checks.
