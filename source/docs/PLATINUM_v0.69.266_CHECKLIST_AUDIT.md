# LuckyDex Platinum (pl1) — checklist audit v0.69.266

## Scope / evidence

- **133 original collector-numbered prints:** #1–130 and SH4–SH6, from `data/classic/pl1-print-source.json`.
- **Authentic print data:** the live GitHub `main` archive and upstream PokémonTCG Platinum `pl1.json` have the same Git blob SHA: `594032984905672db5cc37fce0e9405bebb30f45`. This is now a *hard build gate*, not an optional warning. A synthetic fixture with 133 labels fails the build.
- **Printed-card static contract:** `scripts/audit-platinum-checklist.py` checks **each of the 133** against the *generated* executable catalogue: identity, HP, types, stage/evolution, retreat, Weakness/Resistance, all printed attack costs/damage/text, Power/Body text and type, Trainer rules, Fossil HP/Stone texts, Special Energy rules, and enabled/deck-eligible flags. The audit is a required Gradle APK preparation dependency. `scripts/prepare-platinum.sh` also exports `docs/PLATINUM_CARD_CHECKLIST.md` with a row per card.
- **Attack engine smoke:** two automated sweeps of **all 221 attacks** (declining and accepting optional prompts) completed without an exception, unavailable attack or stuck choice in the representative battle fixture. This is a smoke test, *not* a proof that every damage value and board interaction is correct.
- **Focused outcomes:** 46 targeted Platinum catalogue/outcome/regression tests and 2 separate full-set attack smoke tests passed locally. The existing 46 Stormfront tests and 273 preflight tests passed; the earlier .265 GitHub APK build succeeded. The **.266 GitHub APK build and device gameplay remain to be checked after pushing the patch**.

## Rules corrected in this audit

1. **Carnivine — Vine Extract (#43):** only Burns and Poisons when the defender already had damage *before* the attack; its own 30 damage is not a qualifying prior counter.
2. **Cyrus's Conspiracy (#105):** independently searches for a Supporter, Basic Energy, and eligible Galactic Invention; an absent or skipped category no longer silently cancels remaining categories.
3. **Cacturne — Poison Experiment (#42):** identifies the physical attached Grass/Darkness Energy. One-unit Rainbow Energy offers an explicit Grass (Poison) vs Darkness (Paralyze) choice and is discarded once, never doubled.
4. **Golduck — Water Slide (#29):** optional transfer moves *all* attached copies of Basic Energy and every physical Special Energy, not merely one Basic Energy per type. The 40+20 calculation is a single attack hit before Weakness/Resistance and defensive modifiers, rather than a second 20-damage hit.
5. **Platinum SP/LV.X deck support:** Energy Gain and Poké Turn require Pokémon SP, Power Spray needs at least three Pokémon SP to be useful, Level Max requires an LV.X target, and Memory Berry requires an evolution beneficiary. User-selected retained cards are not silently deleted.
6. **Release gate:** the official-source SHA and full 133-print metadata/effect mapping audit are now required for APK building, preventing a synthetic test fixture or an incompletely generated set from being shipped.

## Checklist status / limits

| Checklist | Result | What it establishes |
| --- | --- | --- |
| Collector prints present and unique | **133 registered** | No missing or duplicate identifiers |
| Authentic card archive | **Verified identical to upstream** | Official data rather than synthetic fixture |
| Printed metadata and executable mapping | **Automated gate added** | Each of the 133 will be checked during APK generation; failure stops the build |
| Attack executable smoke | **221/221, twice** | No exceptions/stuck choices in representative attack states |
| Specific effects and card choices | **Targeted regression tests pass** | Test cases for high-risk mechanics, not all board permutations |
| Deck builder and CPU | **Targeted synergy and preflight pass** | No verified promise of every one-off CPU strategic decision |
| Full installed Android APK | **Pending .266 GitHub run / phone test** | Must not be marked device-verified before that run |

**Interpretation:** All 133 cards now have a reproducible *static checklist*. All 221 moves pass a battle smoke, but **133/133 independently outcome-certified is not established**: complex status interactions, LV.X continuous effects, every alternate target/energy selection, and CPU strategy across adversarial board states still benefit from device testing and more focused tests. Do not conflate “registered”, “mapped”, “smoke passed”, and “outcome proven”.

### Reproduce

From the `source/` directory with the official print archive already committed:

```sh
python3 scripts/build-platinum.py
python3 scripts/audit-platinum-checklist.py --report docs/PLATINUM_CARD_CHECKLIST.md
node --test tests/v07263-platinum-catalog.test.cjs tests/v07264-platinum-stage2-effects.test.cjs tests/v07265-platinum-completion.test.cjs tests/v07266-platinum-checklist-regressions.test.cjs tests/v07266-platinum-all-attacks-smoke.test.cjs
sh scripts/prepare-stormfront.sh
```

The Gradle build will automatically run the Python generator and static audit without any extra Termux command.
