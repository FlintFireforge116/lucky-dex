# LuckyDex v0.69.293 — HGSS: Triumphant independent audit

## Scope and baseline

Audited the uploaded complete source snapshot at v0.69.292. The last integrated TCG set is **HeartGold & SoulSilver: Triumphant**, ID `hgss4`, with 103/103 source-pinned printed cards enabled for Classic play and deck building. Both two-half LEGEND pairs retain their paired-hand / Bench behaviour. No printed set identities, card numbers, stage chains or energy costs were changed by this audit.

This independent pass compared printed card clauses against executable effects, including optional triggers, coin tails, target side, Weakness/Resistance, source-card movement, deck searches and selected-set CPU decks. The existing schema/smoke checks alone did not detect the errors below.

## Verified repairs

1. **Lunatone #25 — Selfdestruct:** deal the printed 60 self-damage in addition to the 10 to each Bench.
2. **Voltorb #83 — Magnetic Bomb:** tails inflicts 10 recoil; heads retains its attack bonus.
3. **Lickilicky #38 — Licking Shot:** count each attached physical Energy card, including Special Energy; choose an opposing Pokémon and apply Active-only Weakness/Resistance.
4. **Psyduck #74 — Tripping Headbutt:** tails chooses a target among your **own** Pokémon for 30 damage; heads chooses the opposing Pokémon, instead of silently ignoring the tails hit.
5. **Pidgey #71 — Messenger:** after searching, shuffle Pidgey, its Basic/Special Energy and attached cards back into the deck, removing it from play and prompting promotion if needed.
6. **Electivire #20 — Thunder Shot:** apply Weakness/Resistance when striking the Active target, never to a Bench target.
7. **Carnivine #16 — Saliva Lure / Bellsprout #57 — Inviting Scent:** the attacking player chooses the Pokémon pulled from the opponent’s Bench (Swablu’s Wing Flick remains opponent-chosen).
8. **Spiritomb #10 — Spooky Whirlpool:** optional hand-to-Bench trigger now offers a clear `Do not use` choice; declining preserves the opponent’s hand.
9. **Porygon2 #49 — Mapping:** optional evolution trigger, with a proper `Do not use` choice and filtered Stadium deck selection.

## Regression and verification

- New `tests/v07293-triumphant-independent-audit.test.cjs` adds 10 independent assertions groups (incl. both outcomes of important coin and choice interactions), while existing `v07291` and `v07292` tests remain intact.
- All **177 / 177** tests passed across HGSS1 (HeartGold & SoulSilver), HGSS2 (Unleashed), HGSS3 (Undaunted), and HGSS4 (Triumphant) suites, including the new tests.
- `node scripts/audit-classic-set.cjs --set hgss4 --smoke --no-write` reports **103/103 enabled**, **0 errors**, **0 warnings**, **0 review flags**, **CPU 16/16**, **332/338** smoke scenarios executed and passed; **6** skipped due to unmet prerequisites, not failed tests.
- CPU autobuilder additionally checked across 180 seeded type combinations: generated decks validate to 30 cards and do not orphan evolutions or LEGEND halves. The test allows the builder to reject an impossible type/seed; this is not evidence that all 180 yielded decks.
- APK build Gradle task `auditHGSS4ForApk` now runs the independent test file, in addition to previous Triumphant tests, before Android assets are merged.
- Generated `tcg-classic-triumphant.js` using `python3 scripts/build-hgss4.py` after modifying the locked metadata source.
- **Important limitation:** Node rules tests and smoke tests passed locally; no Android APK was compiled or installed on a phone in this audit. On-device choices, animations, and full-game UI flow still warrant user testing.

## Apply with Termux

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.293_HGSS4_TRIUMPHANT_AUDIT.zip -d source
git add source
git commit -m "LuckyDex v0.69.293 Triumphant independent audit"
git push origin main
```

The patch ZIP contains paths relative to `source/`, rather than a complete repository replacement.
