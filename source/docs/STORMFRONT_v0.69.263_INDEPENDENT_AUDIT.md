# LuckyDex v0.69.263 — Stormfront (DP7) independent card and deck-building audit

**Baseline:** v0.69.262, all 106 printed cards already registered and battle-enabled. Sources: exact bundled `data/classic/dp7-print-source.json`, source master rules, battle engine, CPU opponent generator, player auto-deck builder and prior Stormfront tests. This is an independent source-level pass; it does not certify every possible live game or mobile UI state.

## Confirmed and fixed

1. **Electrode #36 — Low Current.** The printed condition was present, but its outcome was a `noop`, so its conditional Paralysis never occurred. Reuse the existing `damagedByAttackLastOpponentTurn` engine condition and apply Paralysis after actual damage from the previous opposing turn. Verified for no prior attack, an old attack, and the immediately preceding opposing attack.
2. **Premier Ball #91.** Autodeck was inserting four copies even when *no Pokémon LV.X was in that actual deck*, rendering every copy dead. Require a selected LV.X in the built deck and cap ordinary automatic inclusion at two.
3. **Luxury Ball #86.** Auto-build routinely inserted four copies even though its printed restriction prevents subsequent Luxury Ball plays while one is in the discard. Limit ordinary automatic inclusion to one. Preserve additional explicitly provided cards when filling a manual saved deck.
4. **Energy Link #83.** Auto-build was inserting exactly one Tool in many decks, but Energy Link can move Energy only between **two Pokémon both equipped with Energy Link**. Add the pair atomically where two Pokémon and two slots are available, otherwise do not auto-select it; cap to two in a normal auto-build.
5. **Other support saturation.** In automatically generated 30-card decks, Great Ball is capped at three, common healing/retreat tools and other eligible Stormfront support at reasonable quantities, while Poké Drawer + can still form two functional pairs. The normal player-provided draft preservation path remains available.

## Expected builder restrictions, not defects

- Stormfront itself prints Empoleon, Infernape and Torterra but **not their required pre-evolutions**. A focused Stormfront-only deck correctly refuses an orphan Stage 2. Allowing DP1 as well produces complete, legal lines.
- Stormfront Heatran LV.X needs a Heatran Basic from an earlier expansion. A Stormfront-only LV.X focus must not fabricate that prerequisite.
- Regigigas's printed advanced attacks can require Water + Fighting + Metal, exceeding this game's at-most-two Basic Energy Zone types. Refusing those unavailable multi-type focused builds is safer than presenting an attack that cannot be paid. Ordinary available Colorless attacks remain in the catalogue.
- Fossils, Baby Evolution partners, Basic-only restrictions, printed damage/attack costs and set-only filters are not relaxed.

## Verification

- **106/106** original printed identities and move/ability descriptions matched archived print source, including all three secrets and SH1–SH3. No printed-effectful attack is now tagged `noop`.
- **53/53** Stormfront source/integration/independent-audit tests pass using `sh scripts/prepare-stormfront.sh`. This script regenerates the runtime catalogue and reruns the audited tests for the GitHub build.
- **114/114** selected previous-set regression tests pass, covering DP6 LV.X, Baby/Fossil constraints, deck builder, status effects and hand-size mechanics.
- Standalone sample generated **143 legal 30-card decks** (86 successful distinct Pokémon focus builds + 45 CPU builds + 12 random builds). Six additional focused set-only builds explicitly failed for unavailable prereqs or incompatible three-type costs; this is not silently corrected by importing other sets.
- One sampled AI-vs-AI Stormfront battle reached a normal finish. A much larger AI stress run exceeded the execution limit and is **not** claimed as passed. Detailed AI action quality and Android UI still require manual gameplay testing.
- The v0.69.262 APK build passed GitHub Actions #551. v0.69.263 requires a new GitHub APK build and phone testing.

## Handoff

Use the source-relative ZIP only:

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.263_STORMFRONT_INDEPENDENT_AUDIT.zip -d source
git add source
git commit -m "LuckyDex v0.69.263 Stormfront independent audit and deck synergy fixes"
git push origin main
```
