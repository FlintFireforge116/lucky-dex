# LuckyDex 0.69.343 — Primal Clash Stage 1 (XY5)

## Complete printed-catalogue registration
- PokémonTCG/pokemon-tcg-data official English `cards/en/xy5.json` Git blob
  `38a427242a56d0e9bcd4450718d1f5ae28377f82` is pinned/verified by SHA1.
- 164 consecutive collector prints #1–#164, including 160 listed regular prints
  and 4 supplemental prints as represented by the official set metadata.
- Preserve 217 printed attacks, 13 printed Ability instances and 22 Ancient
  Traits. Copy attack names/text/costs verbatim; no fabricated cards or costs.
- Generated data is rebuilt on GitHub BEFORE asset merge, and independent audit
  runs after generation. The locally checked-in JS is a safe, empty placeholder
  and must never be packaged into an APK in place of the actual generated cards.
- Registered in shared cards, collection projection, deck builder, CPU,
  set picker, HTML script order and card inspector lookup. Selected single-
  set/CPU decks can only use battleEnabled=true and deckEligible=true cards.

## Battle-readiness policy
- Reuse directly implemented attack rules: damage, coin flips, conditions,
  healing, switches, selected Benched hits, self damage, discard, typed-Energy
  modifiers and other already verified generic effects.
- Existing reliable Trainers enabled: Dive Ball, Escape Rope, Fresh Water Set,
  Professor Birch's Observations, Rare Candy, Enhanced Hammer and Switch,
  including official alternate prints that share the same actual rule.
- Unimplemented printed rules are *explicitly gated* from battle and automated
  deck generation. Do not mark an effect FULL just because it validates.
- All 22 Ancient Trait cards remain gated until Ω Barrage, Ω Barrier, α Growth
  and α Recovery are integrated into the shared action/resolution timing.
- Printed Ability cards remain gated until abilities are implemented with real
  player/CPU action timing, and Shield/Wonder Special Energy cannot enter a
  deck before type limits and passive effects are correctly applied.
- Primal/Mega evolutions and Spirit Links need an explicit mechanics pass before
  opening for play, including end-turn evolution and the required base species.
- A follow-up pass must handle all remaining attacks, Abilities, Ancient
  Traits, Trainers, Energy, Primal mechanics, AI and final card-to-card audit.

## Build and audit
- `scripts/build-xy5.py`: source verification, print canonicalization, effect
  gating and coverage; `scripts/xy5_verified.py`: battle-effect mappings.
- `tests/v07343-primal-clash-stage1.test.cjs` checks registration, versions,
  generator descriptors, Ancient Traits, precise costs, all official prints,
  collection projection and 30-card autobuilding (the official-catalogue
  checks execute during GitHub's generated-data APK build).
- Preserve and run older deck-quality, global Energy, Phantom Forces and
  Furious Fists tests. No changes to Classic30 or Energy Zone fundamentals.
- Build number: Android versionCode 7343, versionName 0.69.343, and both
  in-app build markers must match.

## Termux update (standard, no extra script)
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.343_PRIMAL_CLASH_STAGE1.zip -d source
git add source
git commit -m "LuckyDex v0.69.343 Primal Clash stage 1"
git push origin main
