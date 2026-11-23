# Global Basic Energy deck-search second audit — 23 November 2026

Base release: LuckyDex 0.69.401, source-relative combined overlay.

## Outcome

- Same frozen bundled catalogue: **89** identified printed Basic/typed Energy deck searches, **82** currently playable and **7 gated**. This regex-based inventory is not a complete oracle for regenerated future card sets.
- Generic Zone-only smoke: **78/82** handlers reach logged Hybrid Basic Energy deck-search coins, up from the first patch's 70/82. The four remaining generic smoke misses require actual prerequisites or specific physical-deck cards. Their tests with valid prerequisites pass; see the updated completeness report.
- Former 12 special-case effects: repaired/audited with **16 separate card-level and compatibility tests**, including the two mixed Conspirators, Igglybuff, Remoraid, Typhlosion ex, Holon Researcher, Infernape, Bronzong, Drifblim, Tangela, Arceus and Unown DARK. Additional tests cover real-card picker preservation.
- **No Energy created on tails**. Each requested new Basic Energy uses one hybrid coin. Printed gate coins still happen *as well*. A tails does not cancel later requested attempts; physical Energy deck cards remain physical and are never coin-gated by this hybrid adaptation.
- For Ripple Swell specifically, the printed six-Arceus requirement cannot be met on LuckyDex's default four-Pokémon board. Requires four different-type Arceus in those four slots and scales to four attempts. A six-slot test still requires six.
- Older XY7 Thunder Rod, Exavolt, Rip Claw and CPU Wild Edge regressions retained unchanged.

## Verification

- `node --test tests/v07406-basic-energy-search-special-cases.test.cjs` — **16/16**.
- XY11 `python scripts/preflight-xy11-release.py` — source-only preflight (includes tests v07402 through v07406). Run the full GitHub generation/build on the user's repository after extraction; no offline Android APK result is claimed.
- Previous special-case and historic compatibility suite — **117/117** (including all v07402–v07406 at the time of this run).
- Static Grade/Gradle guard checks the mandatory test list including v07406. Both XY7 and XY11 Gradle audit tasks include v07406.

## Limits

The seven currently battle-disabled search prints remain outside this playable-card audit. Some catalogue sets use pinned generation in CI, so the local source-only preflight is not equivalent to a complete regenerated APK build. Counts refer to the bundled catalogue in this ZIP, not to any future card imports. The 78 generic smoke successes are reachability checks, not exhaustive game-state proofs; the prerequisite-aware tests supplement rather than replace them.
