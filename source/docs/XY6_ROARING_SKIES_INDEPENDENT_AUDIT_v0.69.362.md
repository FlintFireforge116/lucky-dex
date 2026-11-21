# LuckyDex v0.69.362 — Independent XY6 Roaring Skies audit

## Audit basis and build status

- Reviewed the latest source as of v0.69.361, and confirmed GitHub Actions run #650 **succeeded**. That build's `auditXY6CompletionForApk` gate checks that the generated `xy6` catalogue has **112/112 battle-ready, deck-eligible prints**.
- Official set: 110 numbered prints plus #77a and #92a, **147 attacks**, **15 Abilities**, **12 Ancient Traits**, pinned source blob `5eab0c0148a5cb52dd7005628aa61c793ec0d930`.
- The independent review examined the set's printed-effect descriptors, shared Tool-suppression paths, opposing-Bench damage and counter placement, evolving, Energy and Prize pathways, and deck-generation constraints. This is an additional cross-era audit, **not a claim that every game state has been exhaustively simulated**.

## Confirmed problems reproduced and fixed

1. **Shedinja #11 — Cursed Rain**: was using `damage` rather than `placeDamageCounters` for its one counter on every opposing Pokémon. With the attacker's Wide Lens, the opposing Bench incorrectly took 20 when weak to Shedinja instead of the printed one counter (10 HP). The attack now uses `placeDamageCounters` on `opponentAll`, and the validator accepts that legitimate spread-counter target. The printed switch follows the counter placement. Ordinary damage modifiers, including Weakness, Resistance and Wide Lens, do not change placed counters.
2. **Banette #31 vs Head Ringer (XY Phantom Forces #97)**: the attack-cost calculator read a physically attached Tool instead of its *active effect*. Tool Concealment now correctly removes Head Ringer's extra Colorless attack requirement without detaching the Tool.
3. **Banette #31 vs Rocky Helmet (BW Noble Victories #133 and alternate print)**: on-damage retaliation ignored global Tool suppression. It now checks the active Tool list, so Banette stops the reflected 20 damage while the Tool remains attached.
4. **Banette #31 vs Unown E EQUIP (DP Mysterious Treasures #65)**: EQUIP's +10 HP was still applied while Tool effects were suppressed. Maximum HP now uses the active Tool list.
5. **Banette #31 vs Plasma Badge (BW Plasma Freeze #104)**: five older Battle Effects paths used physical Tool attachment to grant Team Plasma status. They now check active Tool effects. The physical Badge remains attached but cannot grant its effect until suppression ends.

## Scope and compatibility

- The printed 112-print catalogue was already accepted by GitHub's official-generation gate in v0.69.361; this patch fixes **battle effect correctness**, not missing cards or art.
- Includes physical-vs-active Tool tests, Shedinja damage counter test with Wide Lens and a Grass-weak Benched Pokémon, source descriptor validation, and an extra generated-catalogue check after Gradle's pinned source generation.
- All earlier Roaring Skies stage tests remain in the build pipeline, including Sky Field's eight-slot Bench and leaving-play discard, Δ Evolution/Plus/Wild, Shaymin Set Up, Dragon Energy restrictions, Ability and Trainer choices, and autobuilder filtering.
- No changes to the 30-card deck size, user-saved deck choices, or separate Energy Zone. No new deck is started until this patch's GitHub build passes.

## Validation

- New **independent test suite**: `tests/v07362-roaring-skies-independent-audit.test.cjs`.
- All 23 selected Roaring Skies and older cross-era suites: **249 passed, 0 failed, 7 skipped**, plus source JavaScript syntax and Python compile checks. Skips require build-generated XY6/XY4 catalogue data not included in the user-uploaded source ZIP.
- CI task: `auditXY6IndependentForApk`, chained after `auditXY6CompletionForApk` and connected to `preBuild` / asset merging. GitHub regenerates the pinned source catalogue and checks all 112 enabled prints again.
- **v0.69.362 GitHub APK status:** not yet verified. Its local test results do not guarantee the Android APK build will succeed.

## Termux

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.362_ROARING_SKIES_INDEPENDENT_AUDIT.zip -d source
git add source
git commit -m "LuckyDex v0.69.362 Roaring Skies independent audit"
git push origin main
```
