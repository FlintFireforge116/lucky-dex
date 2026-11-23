# LuckyDex v0.69.402 — Sun & Moon: Guardians Rising (SM2) stage 1

## What is included

- A registered Sun & Moon SM2 expansion in the Classic catalogue, battle card index, player set selector, builder and CPU opponent set selector.
- An immutable, SHA-verified official-source generator; exact 180 distinct collector entries (numbered 1–169 plus eleven suffix-a variants), 287 attacks, 30 Abilities, 42 Pokémon-GX/42 GX attack prints, 28 Trainers and 4 Energy prints.
- The generator converts printed costs, HP, evolution and metadata directly; known attack and Ability mechanics reuse the existing battle engine, including old Sun & Moon rules and hybrid Energy retrieval.
- Gameplay-unsupported prints remain **visible but safely battle-disabled**, rather than masquerading as working cards with no-op attacks, Tools, Stadiums or Abilities. Coverage report is generated at `docs/SM2_BUILD_COVERAGE.json` during the APK build.
- Exact alternate-art print records stay separate and have matching move/cost semantics. The shared engine gains `selfBenchDamaged` to handle Drampa-GX's Berserk.
- All previous v0.69.401 fixes (Groudon-EX Rip Claw, Exavolt, Steelix/Braviary Wild Edge, Thunder Rod four heads, globally coin-gated Basic Energy searches and both audit passes) are retained by the **combined patch**.

## Tests / build status

`python3 scripts/preflight-sm2-release.py` is network-free and verifies source, release contract, Gradle task chain, selector/registry wiring and mandatory tests. `python3 scripts/preflight-sm2-release.py --full` generates the canonical catalogue and executes generated-card and Energy-search/deck-building tests.

Full APK builds run `auditSM1ForApk -> preflightSM2ContractForApk -> generateSM2ForApk -> auditSM2ForApk` before merging assets; the generator **needs internet access the first time**, unless the previously verified `data/classic/sm2-print-compact.json` exists. Do not ship the checked-in empty JS bootstrap stub as the actual released catalogue. A network-free local preflight is **not** proof of a successful GitHub build.

## Known incomplete work for independent audit

This is a stage-1 **set integration**, not a declaration that all 180 print effects are playable. Unimplemented Trainer, Stadium, Tool, Ability and novel GX effects are marked `PARTIAL` and `battleEnabled: false`; run a later full per-print audit and implement those effects after initial APK compiles. Existing source-specific effects are never assumed correct solely on the basis of a shared attack name.

## Build fix after stage-1 GitHub failure

- Stage-1 shipped an empty SM2 JS bootstrap and omitted the canonical 180-print compact source. The source-only preflight did not exercise `generateSM2ForApk`, so an offline build could fail trying to reach GitHub.
- Bundled the verified, original pinned compact source and SHA-256 gated it.
- Fixed the generated-card integration assertion: the Classic battle registry deliberately normalises attack `cost` from an array into the engine string representation. The test now accepts both equivalent internal forms, while still checking every printed Energy cost.
- Run `python3 scripts/preflight-sm2-release.py --full` before shipping; this invokes the real generator and all mandatory SM2 tests, not just the static structure checker.
