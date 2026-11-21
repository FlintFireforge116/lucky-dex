# LuckyDex v0.69.336 — XY Furious Fists independent completion audit

## Build baseline and failure correction
- v0.69.335 GitHub workflow #624 failed in `auditSupremeVictorsForApk` because `appBuildVersion` still displayed v0.69.334 despite Android Gradle and boot JS both being v0.69.335. This is corrected by synchronising **both** visible HTML version markers, boot JS and Gradle to 0.69.336. The older cross-set version invariant remains enabled.
- v0.69.334 workflow #623 succeeded. The 0.69.336 APK has **not** been verified by GitHub or installed on a device at patch packaging.

## Complete official-set contract
- Official pinned `xy3` print source: Git blob `9996bfa724c3d7fc23c9fcc31341cd521311ecb1`, 114 print records, including alternative Mega Lucario #55a, containing 159 attacks and 14 printed Abilities.
- All 18 Trainer print rows map to supported effects; all 14 printed Ability occurrences map to registered ability handlers; the 159 attack texts are mapped by the explicit effect contract, the shared exact-text parser, or identical alternate-art print reuse.
- The independent set audit compares every generated Pokémon's printed name, HP, type, retreat, evolution parent, move order, printed Energy cost and printed effect text against the immutable print source, and checks all mapped effect descriptors via `effects.validateEffect`.
- Battle enablement must equal deck-builder eligibility. Any future effect not supported by its real engine handler must be gated with a named reason instead of a fake no-op.

## Audit discoveries and repairs
1. **Hypno #36 Hand Control**: The opposing hand is revealed; the attacker may select a real opponent-owned Supporter. The Supporter is physically discarded from its owner's hand and its effect runs from the opponent's deck, hand, discard, board and Energy Zone, while the attacking player controls every nested choice. The attacker's turn, not the opponent's, finishes after choice resolution. Verified from both player and CPU attacker perspectives, including a nested Korrina search.
2. **Accelgor #9 Raid**: Deals +40 damage only when Accelgor evolved from Shelmet that turn, using the live evolution-turn marker, not a blanket bonus.
3. **Watchog #85 Thorough Crunch**: Replaced invalid `coinDiscardEnergyDamage` descriptor with its working two-coin rule. Both flips are logged; each heads permits an actual attached Energy to be chosen and discarded, with discard ledgers updated.
4. **Version failure**: Fixed the forgotten in-app footer (`appBuildVersion`), not merely the title marker.
5. **Permanent audit**: Added `tests/v07336-furious-fists-independent-audit.test.cjs` to `auditXY3ForApk` after pinned source generation. Includes full printed-card and alternate-art parity checks, attacking-player-controlled opponent Supporter handling, effects, costs, and repeated 30-card single/mixed-era builds.

## Scope and limitations
- Local checks exercise the actual source rule maps, effect engine, stage-one and completion tests, explicit forced-Supporter side ownership, card-selection chains, attacks and previous cross-era deck-quality tests.
- The checked-in `tcg-classic-furious-fists.js` is an **empty build-time placeholder**. The full 114-card official-source validation and full-source 30-card deck samples are deliberately run in GitHub after `generateXY3ForApk`, not asserted as locally executed.
- Emulator/Android touch choice presentation, actual game performance and the full Android APK result still require testing after the next push.

## Termux
```sh
cd ~/lucky-dex

unzip -o /sdcard/Download/LuckyDex_patch_v0.69.336_FURIOUS_FISTS_FULL_AUDIT.zip -d source

git add source
git commit -m "LuckyDex v0.69.336 Furious Fists full card audit and Hand Control"
git push origin main
```
