# XY6 Roaring Skies — Stage 7 / v0.69.359

## Build baseline and repair

GitHub Actions run #646 built v0.69.357 successfully. The subsequent run #647 for v0.69.358 **failed** at `auditXY6Stage6ForApk`, test 16, "Wally cannot evolve a Pokémon-EX". The test's lightweight Gallade-EX fixture omitted the structured `pokemonEX` flag. In addition to checking the official flag, `chooseEvolutionFromDeck` now checks the name suffix `-EX` and the `pokemon-ex` tag in both action generation and execution, so improperly flagged EX cards cannot slip through and the same CI regression passes. v0.69.359 includes that fix on top of Stage 6; the APK remains unverified until the user pushes it.

## Newly verified Roaring Skies prints

1. **Electrode #22 — Energy Bomb.** The player can decline or redistribute **all actual attached Energy** among individually chosen Benched Pokémon after dealing 70 damage. The choice flow handles ordinary Energy and attached physical Special Energy cards, preserving their IDs. Dragon-only Special Energy cannot be moved to non-Dragon recipients, and the UI never offers invalid recipient slots. It never fabricates Basic Energy from the Energy Zone.
2. **Absol #40 — Cursed Eyes.** Upon playing Absol from hand to Bench, optionally choose an opposing Pokémon with at least three existing damage counters, then choose a different opposing Pokémon, and transfer precisely three counters. No creation or deletion of counters, no arbitrary default target, and no optional prompt when targets are invalid. This does not trigger for deck/discard placement.
3. **Wide Lens #95.** As an attached Tool, modifies damage from its attacker's attacks to opposing Benched Pokémon by normal Weakness and Resistance. It does not affect damage counters, the player's own Bench or attacks without the Tool; Weakness Policy and relevant no-Weakness effects still apply. Direct/selected and spread Bench attack damage paths use the same rule. The automatic deck builder only suggests it for a completed deck with actual opposing-Bench attack damage; saved manual picks are retained.

Other incomplete card effects are **still gated**, particularly Banette's Tool Concealment and Togekiss's Serene Grace. Tool suppression affects historic Tool-dependent conditions and should not be enabled as a partial global switch; Serene Grace requires actual top-eight physical Basic Energy search and selected attachment compatible with the separate Classic Energy Zone.

## Checks

- Direct `tests/v07359-roaring-skies-stage7.test.cjs`: optional refusal, mixed Basic/Special redistribution, incompatible Dragon-only target exclusion, targeted counter movement, no targets, spread Weakness/Resistance, no-Wide-Lens control, selected-hit Weakness Policy.
- Stage 6 Wally test now passes in the same environment as Stage 7.
- Combined 9-file cross-era suite: 80 passed, 0 failed, 3 skipped. The skips depend on generated catalogue resources not present in the uploaded local source.
- `auditXY6Stage7ForApk` is chained after Stage 6 in Gradle preBuild so the verified catalogue runs in GitHub before APK build.

## Termux

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.359_ROARING_SKIES_STAGE7.zip -d source
git add source
git commit -m "LuckyDex v0.69.359 Roaring Skies Stage 7 and Wally CI fix"
git push origin main
```
