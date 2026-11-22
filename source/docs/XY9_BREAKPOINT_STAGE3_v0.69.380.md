# BREAKpoint v0.69.380 — Stage 3 mechanism audit

Baseline: v0.69.379 Stage 2 CI-contract fix (built successfully).

## Coverage
- 126 distinct pinned official prints; 159 attacks, 14 Abilities, 5 BREAK cards.
- 122 projected playable; 4 gated: #67, #102, #109 and #113.
- 12 added this pass: #6, #20, #21, #30, #35, #49, #59, #73, #96, #97, #108, #110.
- No substitutions for unsupported effects; cards missing full printed effects remain gated.

## Shared mechanics and corrections
- Opposing Energy option + Bench transfer, physical discard-energy choice, conditional victory,
  continuous attack-effect protection, type/resistance bonuses, two-step hand attach.
- Bursting Balloon retaliation before KO and exact Tool removal at end of opponent turn.
- All-Night Party action gated by Sleep; Reverse Valley owner chooses orientation.
- Fixed old Stage 1 audit that expected newly enabled Stadium to be gated.

## Release checks
- `python3 scripts/preflight-xy9-release.py` source contract, release/version cross-check.
- `node --test tests/v07380-breakpoint-stage3.test.cjs` battle-state regression.
- Complete suite including prior XY8/XY9, XY5, XY6/XY7 and deck quality.
- `python3 scripts/preflight-xy9-release.py --full` after obtaining pinned official source;
  GitHub mandatory generator/audit. Local source-only skips are **not** full verification.

## Remaining four mechanics
- #67 Sudowoodo: copy last opposing attack, including selected targets.
- #102 Max Elixir: top-six Basic Energy search and Classic Energy Zone semantics.
- #109 Puzzle of Time: simultaneous play of two copies, top-three reorder / double discard recovery.
- #113 Splash Energy: exact KO-origin conditions and stack return to hand, attached cards discarded.
