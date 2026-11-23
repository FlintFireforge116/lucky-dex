# Burning Shadows (SM3) · LuckyDex v0.69.403 · Stage 1

- Immutable upstream print source: `PokemonTCG/pokemon-tcg-data`, Git blob `3476b25cb32b6e748c7fdd9405e6a5329a665d3d`.
- Offline bundled compact source: `data/classic/sm3-print-compact.json` (SHA-256 `99f8b1255e7801818b6d1be3d00858193787bbcc439869fc2470e9855463c2b6`); **never require network access for an APK build**.
- Catalogue: **177 prints**, including eight letter-suffixed variants, **274 attacks**, **27 Abilities**, **40 GX prints**, and **3 Basic Energy prints**.
- Stage 1: **72 playable collector prints**, **105 explicitly gated** with individual blockers in `docs/SM3_BUILD_COVERAGE.json`. No gated cards can enter player or CPU decks. This is not a completed-card audit.
- New supported effects: example GX deck discard, Bench spread, targeting and coin-flip damage, with player/CPU attack smoke and outcome regression tests. All unsupported Abilities, attackers, Trainer rules and special Energy interactions remain safely gated for continuation work.
- Custom hybrid Basic Energy-search coin flips remain active; basic Energy zone search is NOT the same as physical discard recovery. Preserve printed attack costs, alternate print IDs and GX per-game limitations.
- Deck quality: SM3 initially caused **three unrelated four-copy Trainers** (Rescue Stretcher, Multi Switch, Choice Band). The shared builder now prioritises up to 22 cohesive Pokémon before exhausting four-of Trainers **only in a sparse single-set verified pool**; manually selected copies and other eras remain unchanged. The mandatory shared cross-era deck-quality test passes, and `v07413` asserts player/CPU SM3 deck quality.
- Critical cross-set regression: Fates Collide `v07385` Prize formula now tests the actual terms, without assuming `xy10Endgame` and `bw9LifeDew` are adjacent. Verify `python3 scripts/preflight-xy10-release.py --full` when adding Prize interactions.

## Local verification

`python3 scripts/preflight-sm3-release.py --full` runs offline card generation, metadata/effect checks, player+CPU attack tests, GX outcomes, Basic Energy coin-flip regressions, XY10 Prize, and cross-era deck quality.

Other completed preflights: `preflight-sm1-release.py --full`, `preflight-sm2-release.py --full`, `preflight-xy10-release.py --full`, `preflight-xy11-release.py --full`, `preflight-xy12-release.py --full`. The GitHub APK must still be built after installation; these checks do **not** imply a successful cloud APK.

## Next pass

Implement all 105 gated prints with exact-title+printed-text matching, reusable shared mechanics and outcome tests; audit player/CPU deck synergy, GX/Ability/Trainer effects and interactions with prior sets. Do not enable unsupported effects with no-op placeholders.
