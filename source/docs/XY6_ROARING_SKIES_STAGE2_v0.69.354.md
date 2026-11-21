# XY Roaring Skies Stage 2 — v0.69.354

**Upstream baseline:** GitHub Actions #642 built v0.69.353 successfully. The official 112-print catalogue remains pinned to upstream Git blob `5eab0c0148a5cb52dd7005628aa61c793ec0d930`; generation still checks all 112 prints, 147 attacks, 15 Abilities and 12 Ancient Traits before APK packaging.

## Newly completed shared mechanics

- **Δ Evolution:** the printed evolution card can be evolved from hand during the first turn or the same turn its existing evolutionary parent was played. It still must match its real parent, respect global evolution locks, and obey any Mega turn-ending rule unless a matching Spirit Link applies. Valid for Banette #32, Togekiss #46, Altaria #74, M Rayquaza-EX #76/#105 and Unfezant #81. Cards with independently unfinished attacks/Abilities remain gated.
- **Δ Plus:** add exactly one Prize when the Ancient-Trait Pokémon knocks out an opposing Pokémon **by damage from its attack**. Can add to Pokémon-EX prizes, works with real selected Bench attack KOs and enters the existing face-down Prize choice queue. Does not award for poison, effect-only KOs, an earlier hit, or a different attacker. This is an Ancient Trait, not a suppressible Ability.
- **Δ Wild:** M Rayquaza-EX #61 takes 20 less damage **after Weakness/Resistance** from opponent's Grass, Fire, Water or Lightning Pokémon attacks. Not from other types, status or non-attack effects, and not blocked by Ability suppression.
- **Miraculous Scales** (Beautifly #5): prevents opponent Pokémon-EX attack *damage*, not attack effects. **Jewel Armor** (Carbink #47): while Benched, prevents damage from attacks by either player. **Clear Humming** (Altaria #74): friendly Colorless Pokémon lose their Weakness while the Ability is active. All three are suppressible Abilities.
- Complete **Curse Deeply** with exact 5 damage counters (not ordinary weakness-modified attack damage), **Evolution Jammer**, **Unwavering Blade** (only *already damaged* opponent Bench receives 30), **Emerald Break** (30 per own physical Benched Pokémon), **Feather Dance/Sky Attack**, **Spin Tackle**, **Bleh**, **Tail Whip**, **Dragon Strike**, **Tri Edge**, **Wind Shard** and **Psywave** using tested engine effects and physical board/Energy values. Alt-art #100/#105 inherit their original printed effects.

## Gating & remaining work

- All printed cards remain in collecting/inspection. A card is battle-enabled only if *every* attack, Ability, Ancient Trait, Trainer or Energy rule is fully supported. Stage 2 is **not** yet a 112/112 playable set.
- **Sky Field:** must expand BOTH players to eight visible/actionable Bench slots, and allow owner-selected discards down to five on leaving play. Current board UI supports fewer than eight; do not enable a fake five-slot version.
- **Double Dragon Energy:** must provide TWO units of every Energy type to a Dragon Pokémon and be discarded on an ineligible attachment; also test move/return/discard/cost selection. Do not replace with a single Colorless or generic Energy.
- **Shaymin-EX Set Up** and other unique attack/Ability triggers still need proper from-hand checks, visual choices and CPU awareness. Keep those prints gated, including #77/#77a/#106.
- Run a full card-by-card, CPU and deck-building audit after later stages. A separate Energy Zone does NOT turn Basic Energy into allowable 30-card deck cards.

## Regression gates

- `node --test tests/v07353-roaring-skies-stage1.test.cjs tests/v07354-roaring-skies-delta-traits.test.cjs`
- Existing XY5, Classic Trainer, Prize, evolution and energy tests must remain clean. `auditXY6Stage2ForApk` runs after official generation and before APK assets merge.
- Local tests cannot prove GitHub's APK succeeded. Verify v0.69.354 in Actions before declaring a completed build.

## Canonical Termux

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.354_ROARING_SKIES_STAGE2_DELTA.zip -d source
git add source
git commit -m "LuckyDex v0.69.354 Roaring Skies Delta mechanics"
git push origin main
```
