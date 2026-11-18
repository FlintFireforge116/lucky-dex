# LuckyDex v0.69.270 — Rising Rivals independent checklist audit

**Scope:** Official Platinum—Rising Rivals (`pl2`) archival card data and the Classic battle engine, following the v0.69.269 completion and APK generator repair.

## Checklist results

- 120/120 collector prints are registered and battle/deck enabled (114 numbered prints, including the numbered extras, plus `RT1–RT6`). 104 Pokémon, 12 Trainers and 4 Special Energy.
- Full print fidelity: identity, rarity, HP, stage, evolvesFrom, types, retreat, Weakness, Resistance, 188 printed attack names/costs/descriptions, and 45 ability names/descriptions and printed Power-vs-Body classification.
- Generator and runtime effects validate without unsupported/no-op stand-ins for attacks with nonempty text.
- The independent Classic auditor reports **zero definite errors** and **zero warnings**. It attempts 398 synthetic battle actions (390 execute; 8 are skipped because that synthetic board had no legal action; 0 runtime exceptions or stuck choices).
- 104 focused Pokémon deck builds and 36 CPU builds (9 Energy choices × 4 seeds): 140/140 successful 30-card decks with no orphans, off-set entries or dead SP-specific support. The manual SP Radar preservation check also passes.
- Existing Rising Rivals regression tests, plus tests covering Shiftry's tails override and Mamoswine's Water exemption, pass.

## Corrections made

1. **Water Rescue — Floatzel GL LV.X (`pl2-104`)** is a *Poké-Body*, not a Poké-Power. The triggered ally-KO behaviour remains intact, but its metadata and suppression classification now match the print.
2. **SP deck builder:** SP Radar, Flint’s Willpower, Bertha’s Warmth and Technical Machine G no longer enter auto-decks without Pokémon SP. SP Radar and Technical Machine G have conservative automatic limits. Manually preserved copies are not silently removed.
3. **Flint’s Willpower:** A Basic Energy from a player’s hand is necessary. The separate Basic Energy Zone is not a hand card; the autobuilder now excludes Flint’s from zone-only builds. It remains legal for manual inclusion and mixed sets with physical Basic Energy.
4. **Generic set auditor:** A set can have a different numbered-card count and total registered collector prints. Both declared counts are considered, preventing false build failures without hiding real discrepancies. Technical Machine attacks are counted in the printed move inventory.
5. The independent audit and 140-build coherence stress test are included in the APK build gate.

## Remaining limitations / follow-up tests

This is an **independent integration audit**, not a claim that every effect has been verified across every possible board state. Synthetic tests exercise legality, representative attack resolution, menu completion and many concrete outcomes, but do not guarantee competitive AI quality, all rare coin sequences, every cross-era interaction or device UI accuracy.

The generic scanner reports six *heuristic review prompts* around reusable rule aliases (`pl1mirror`, Rotom Shift), rather than six known broken cards. All six have valid runtime mappings and the Rotom rule is reachable. More hand/device test cases are still valuable for Charon's Choice, Water Rescue with unusual attachments, Prize handling on simultaneous KO, and opponent-turn timing.

**How to reproduce:** from `~/lucky-dex/source` run:

```bash
python3 scripts/build-rising-rivals.py
node --test tests/v07267-rising-rivals-stage1.test.cjs tests/v07268-rising-rivals-continuation.test.cjs tests/v07269-rising-rivals-completion.test.cjs tests/v07270-rising-rivals-independent-audit.test.cjs
node scripts/audit-classic-set.cjs --set pl2 --smoke --no-write
```

The authoritative printed source is `data/classic/pl2-print-source.json`, checked by SHA-256 in the generator. Never substitute synthetic fixture data in release builds.
