# LuckyDex v0.69.357 — Roaring Skies Stage 5, remaining card interactions

## Baseline

Stage 4 (Sky Field) is the patch baseline and successfully built in GitHub Actions run #645. The new Stage 5 patch itself is not APK-verified until pushed and built. The 112 official prints remain pinned to original Git blob `5eab0c0148a5cb52dd7005628aa61c793ec0d930` and are generated during the APK build, not fabricated in the ZIP.

## Newly supported 17 prints

- Ninjask #10: Afterimage Assault searches up to two physical Ninjask from the draw deck and Benches them using player-selected slots, respecting available Bench space.
- Shedinja #11: Cursed Rain places a damage counter on every opposing Pokémon, then switches with a friendly Benched Pokémon; Hopeless Scream was already supported.
- Deoxys #33: Close Encounter draws two; Overdrive Smash gives only its next use +60 on the next own turn, not the current attack.
- Gallade-EX #34/#99: Piercing Prizes deals 50 plus 20 for each of the attacker's *remaining* Prize cards (five-card Classic variant), not opponent prizes.
- Jirachi #42: Diminutive Desire selects one from the top seven physical deck cards and shuffles the rest; Doom Desire discards all actual attached Energy and schedules a knockout of the defending Pokémon at the *end of the opponent's next turn*, following that Pokémon by UID if it moves.
- Dragonite #51: Max Wind on evolving from hand offers optional healing of one chosen friendly Pokémon; it does not fire on evolution from deck, and standard Ability suppression applies.
- Shelgon #56: Exoskeleton continuously reduces attacking damage to Shelgon by ten after matchup, respecting suppression.
- Latios-EX #58/#101: Fast Raid uses the existing permitted first-turn attack path; Light Pulse protects against opposing *attack effects only*, never damage. A cross-era engine fix distinguishes this from all-damage attack guards.
- M Latios-EX #59/#102: Sonic Ace discards two attached Energy and deals 120 damage to a selected opposing Pokémon, with correct bench targeting.
- Hydreigon-EX #62/#103: Dragon Road continuously reduces allied Dragon retreat costs by two only while a Stadium is in play; no reduction for non-Dragon or when suppressed.
- Zekrom #64: Energy Stream attaches one genuinely discarded Basic Energy, never pulling from the fresh Energy Zone.
- Swablu #73: Bind Wound heals a chosen friendly Pokémon by twenty; it is not hardwired to the attacker.
- Pidove #78: Homing Pidove inspects the actual top physical card and offers a genuine optional shuffle.

## Coverage and safeguards

This is a Stage 5 implementation, not a claim that all Roaring Skies cards are battle ready. Gated cards with unimplemented mechanisms remain excluded from CPU decks and autobuilds. Alternate prints are preserved as unique collection IDs and receive exactly the same printed attack logic.

`tests/v07357-roaring-skies-stage5.test.cjs` uses injected print-faithful fixtures, checks all 17 enabled prints, their effect validation and attack/Ability outcomes, and runs under the `auditXY6Stage5ForApk` Gradle preflight after the Stage 4 audit and official catalogue generator. Targeted XY6+XY5+deck-quality suites have been run locally. The new test includes effect-only protection vs attack damage, Dragon Road team scope, and independent Bench, discard and Energy ledgers. The full APK build must still be verified on GitHub.

## Termux

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.357_ROARING_SKIES_STAGE5.zip -d source
git add source
git commit -m "LuckyDex v0.69.357 Roaring Skies Stage 5 effects"
git push origin main
```
