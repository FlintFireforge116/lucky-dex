# LuckyDex v0.69.299 — Emerging Powers independent card audit

**Base:** v0.69.298 Emerging Powers, applied on v0.69.297 Black & White independent audit.
**Set:** Emerging Powers (`bw2`) — 98 distinct prints, 91 Pokémon, seven Trainers, 164 printed attacks and two Abilities.
**Scope:** printed-source metadata, executable effect definitions, choice resolution, deck-building dependencies and CPU deck legality. No Android installation or APK compilation was performed.

## Corrections

1. **Simipour #23 — Rushing Water:** The original generic `moveEnergy` handler had no target prompt for a destination on the **opposing** Bench. With an opposing Active Pokémon holding Energy and a valid Bench target, this attack did nothing. It now opens an Energy choice, then an opponent-Bench choice. Both Basic and Special Energy transfer without copying or discarding. No dead prompt appears with an empty opposing Bench or no attached Energy.
2. **Simisage #2 / Simisear #19 / Simipour #23 — deck-building metadata:** Their Fire's Power, Water's Power and Grass' Power bonuses require off-type attached Energy despite cheaper attacks of another type. The source generator now marks `conditionalAttackEnergyTypes` (`Fire`, `Water`, `Grass`, respectively) and preserves these types in preferred Energy metadata. In focused deck building, generated 30-card decks now allocate Grass/Fire, Fire/Water and Water/Grass respectively when type restrictions allow.
3. **Thundurus #97 and Tornadus #98 — artwork/card identity:** Both full-art prints carried empty `tags` because the generator incorrectly checked obsolete card numbers 113/114. Generated prints now carry `full-art`, retain their unique IDs and existing attack texts.

## Audit and execution results

| Check | Result |
| --- | --- |
| Registered, enabled prints | 98/98 |
| Catalogue schema errors / warnings | 0 / 0 |
| Emerging Powers synthetic battle smoke | 342/342; 0 skipped |
| Sampled CPU deck audits | 16/16 legal |
| Additional seeded CPU builds | 108/108 legal 30-card decks |
| Original dedicated Emerging Powers regression tests | 26/26 passed |
| New independent Emerging Powers scenario tests | 14/14 passed |
| Wider HeartGold & SoulSilver through Emerging Powers regression set | **221/221 passed** |
| Automatic source-review flags | 37 (non-failing; includes newly introduced custom Rushing Water dispatch) |

The new tests cover: printed roster/registrations; two-stage Rushing Water prompts with Basic and physical Special Energy; unavailable-target fallback; three conditional Energy deck synergies; full-art IDs; Simipour healing when Grass is present/absent; doubled Scolipede poison; Watchog opponent top-five ordering; Great Ball decline; 108 seeded CPU decks; Gothorita Deleting Glare selection; Crushing Hammer head/tails and target selection; and elemental-monkey Burn/Sleep checks.

## Scope limits

- Static flags are prompts to recheck custom battle-engine dispatch; they are **not** cleared merely because a synthetic smoke scenario ran.
- These tests do not prove exhaustive individual card performance, enemy strategic play quality, UI touch behaviour or Android performance.
- APK compilation and GitHub Actions build status were **not** verified in this workspace. A successful `git push` and your next installed APK remain necessary checks.

## Installation over v0.69.298

```bash
cd ~/lucky-dex

unzip -o /sdcard/Download/LuckyDex_patch_v0.69.299_BW2_INDEPENDENT_AUDIT.zip -d source

git add source
git commit -m "LuckyDex v0.69.299 Emerging Powers independent audit"
git push origin main
```

The patch includes updated generator source and pre-generated JS, version markers, master rules and mandatory regression tests for APK builds. It is deliberately source-relative for `unzip -d source`.
