# LuckyDex 0.69.282 — HeartGold & SoulSilver Base (hgss1)

## Authoritative catalogue

- 124 **distinct authentic collector prints**, numbers 1–123 and secret collector number `ONE` (Alph Lithograph); source is an offline pinned compact transcription of Pokémon TCG Data's `cards/en/hgss1.json` at commit `5a491ddf52698a8244fc43d8373d16def16fe946`, original full JSON Git blob `feee0aa3b0844fcac36e2d227083e0a62312fe23`.
- Snapshot SHA-256 locked by `scripts/build-hgss1.py`; no network dependency at APK build time.
- Printed identity, supertype, rarities, HP, stages, weaknesses/resistances, retreat, costs, full attack texts, abilities, rules, and images preserved in the compiled source.
- 124 prints comprise 99 Pokémon, 15 Trainers and 10 Energy, of which eight are Basic Energy and two are Special Energy.

## Battle coverage: **not a full mechanics-completion claim**

- **87** deck-eligible fully mapped prints, including 2 special Energy.
- **8** basic Energy prints are recognised in the catalogue but supplied through the separate Energy zone, not deck slots.
- **29** additional collector prints with one or more unverified effects are visible but explicitly excluded from Classic battles and automatic decks. These include four dual-half LEGEND prints, some Prime powers, some Baby Pokémon interactions, targeting, reordering and retrieval effects. Details listed by the generator.
- **Ho-Oh LEGEND #111–112 and Lugia LEGEND #113–114** must be assembled from both physical card halves to form one in-play Pokémon; no half may be played as an ordinary Basic. A correct two-half place/bench/knockout engine remains future work. The gating prevents fake behaviour.
- Includes re-used coin/status effects, Bench damage, damage prevention, status healing, hand draws, choice-based searches, selected targeting, basic Energy handling, 2010 DCE and Rainbow Energy (including hand-attachment self-damage), and straightforward Prime Donphan Exoskeleton.
- HGSS1 is selectable independently in the player and opponent Classic30 set pickers, collections, set filters, manual builder and opponent CPU builder. Existing Kanto/EX/DP/Platinum sets remain included.

## Validation and known limitations

- `node --test tests/v07282-heartgold-soulsilver-stage1.test.cjs`: **8/8 pass**. Includes all 124 original print comparisons, full schema validation, basic/special energy, `ONE` ownership, LEGEND gating, CPU 21 builds, version agreement, Rainbow rule and deck builder integration.
- `node scripts/audit-classic-set.cjs --set hgss1 --smoke --no-write`: **0 errors**, 8 warnings (all from the unusual `LEGEND` Stage of the four intentionally gated halves), 4 review flags (Darkness and Metal strict single-set CPU builds have no valid in-set mono-type attackers), 282/284 two-sided attack/Trainer scenarios executed, 2 skipped (Blissey #36 Energy Link requires an actual discarded Energy). CPU 12/16 generated 30-card valid decks.
- Arceus continuation/build/audit tests: 18/18 pass; Supreme Victors stage-one test: 5/5 pass (including dynamic version), checked locally.
- The older **v07275** Arceus original source pin is *not present* in this local copy; retain the GitHub CI gate. Latest v0.69.280 GitHub build passed this test and v0.69.281 is committed, but **v0.69.282 APK build and handset gameplay have not yet been verified**.
- This deliberately conservative first pass is *not* all 124 prints battle-ready. Complete the 29 gated prints in subsequent passes by implementing real, observable player/CPU decisions and the LEGEND pair mechanics. Never blanket-enable effects or turn non-empty printed effects into no-ops.

## Termux release handoff

The ZIP contains entries **relative to `source/`**. Unzip with `-d source`, then add/commit/push the unpacked source. No CodeX, no separate generation step, no need to delete existing files. The official offline source is already included; GitHub Gradle preBuild runs the generator and all new mandatory HGSS checks.

```sh
cd ~/lucky-dex

unzip -o /sdcard/Download/LuckyDex_patch_v0.69.282_HGSS1_STAGE1.zip -d source

git add source
git commit -m "LuckyDex v0.69.282 HeartGold SoulSilver Stage 1"
git push origin main
```
