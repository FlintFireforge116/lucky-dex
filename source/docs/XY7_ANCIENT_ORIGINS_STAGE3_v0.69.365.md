# LuckyDex v0.69.365 — Ancient Origins Stage 3 (Ability integration)

Previous verified baseline: v0.69.364, GitHub Actions #653 (successful).

## Newly battle-ready Ancient Origins prints

- **Vileplume #3 / Irritating Pollen:** blocks both players' hand-played Item cards, **including Pokémon Tools** under the XY-era Item classification. Supporters and Stadiums are unaffected. Suppressing Vileplume's Ability removes the restriction.
- **Ariados #6 / Poisonous Nest:** optional once-per-turn action Poisoning both non-Grass Active Pokémon (including its own side); θ Stop and status protection block opposing Ability effects. Re-poisoning does not overwrite existing stronger Poison. The action is not offered when no Active can be affected.
- **Flareon #13, Vaporeon #22, Jolteon #26:** grant additional Fire, Water, Lightning typing respectively to each friendly Stage 1 Pokémon, not to Basics/Stage 2, other side, or a source whose Ability is suppressed. Multiple unsuppressed Eeveelutions stack.
- **Unown #30 / Farewell Letter:** Bench-only activated Ability discards the real Unown and its attachments, then draws one physical card. No Prize is awarded. A genuine discarded Basic Energy enters the discarded Energy Zone.
- **Golurk #35 / Double Type:** Psychic and Fighting typing while its Ability is active, with ordinary Ability-suppression rules.

The set's exact printed data is still generated from a pinned, hash-verified XY7 source during the GitHub build. Any cards whose other effects remain incomplete stay out of gameplay; registering an Ability does not bypass attack validation.

## CPU / autobuilder

- Poisonous Nest does not offer an inert action when neither Active could be Poisoned.
- Automatically building around Vileplume keeps at most two non-Rare-Candy Items as setup support; manually selected cards remain untouched. Useful Supporters remain available, and Rare Candy remains eligible for Stage 2 evolution.
- The Eeveelution auras use **effective in-play Pokémon types**, not fabricated Energy cards; typed attack costs remain printed and unchanged.

## Test coverage

- `node --test tests/v07363-ancient-origins-stage1.test.cjs tests/v07364-ancient-origins-theta.test.cjs tests/v07365-ancient-origins-abilities.test.cjs tests/v07362-roaring-skies-independent-audit.test.cjs tests/v07361-roaring-skies-completion.test.cjs tests/v07359-roaring-skies-stage7.test.cjs` — 41 passed, 0 failed, 4 generated-catalogue skips.
- `tests/v07333-classic-deck-quality.test.cjs`, `tests/v07332-xy-energy-zone-contract.test.cjs`, `tests/v07250-classic-fossil-deck-dependencies.test.cjs` — 21 passed, 0 failed. The older full-pool deck-builder stress test exceeded the local runner timeout and is **not** counted as passing.
- Stage 3 tests are a dependency of `auditXY7ForApk` in GitHub Gradle and will also run after the official catalogue has been generated.

## Termux installation

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.365_ANCIENT_ORIGINS_STAGE3_ABILITIES.zip -d source
git add source
git commit -m "LuckyDex v0.69.365 Ancient Origins Stage 3 abilities"
git push origin main
```

**Pending:** GitHub APK build for v0.69.365 and the remaining Ancient Origins printed mechanics (including Hex Maniac, Faded Town, Forest of Giant Plants, Dangerous/Flash Energy and other unique cards).
