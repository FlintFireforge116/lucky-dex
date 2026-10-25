# LuckyDex v0.69.29 — TCG Pocket Battlefield Refactor

The supplied v0.69.28 source is the authoritative baseline. Battle Lab now has one fixed, responsive battlefield grid: opponent hand/piles, three Bench anchors, centred Active, compact score/turn lane, player Active, three Bench anchors, and a bottom hand between dedicated piles and Energy. Only hand cards intentionally overlap.

A pure count-aware hand model provides generous small-hand spacing, progressively compressed fans and a horizontal span for large hands. Touch swipe scrolls a long hand; a vertical gesture drags a playable card. Card-native attacks/retreat and existing legal-action dispatch remain. Setup still requires a manually placed Active and leaves the Bench optional. Empty discard piles are outlines; the player deck uses the equipped sleeve. Temporary details/target/discard sheets scroll internally, not the live battlefield.

Superseded battlefield CSS and unused renderers are removed rather than overridden. Core, AI, data, deck legality, effects, Solo rules, progression, rewards, achievements and saves are unchanged.

## Canonical source and delivery

The repository tracks real unpacked files under `source/`. Build from that directory; GitHub Actions continues using it directly. This release is distributed as `LuckyDex_patch_v0.69.29.zip`, containing changed/new source-relative files only. Apply it over `~/lucky-dex/source/`; do not replace the source tree or commit a full source archive. No source file is deleted, so no deletion list is needed.

Android identity/signing stay unchanged: `com.example.luckydex`, versionName `0.69.29`, versionCode `7010`.

## Verification

`node scripts/tcgp-test-inventory.cjs final` runs the existing TCG core/data/deck/Solo/progression/UI programs plus the new geometry, gesture, interaction, release and 500-match deterministic stress tests. Browser tests require Playwright and a local browser; set `LUCKYDEX_BROWSER` if needed. `node scripts/tcgp-visual-qa.cjs` captures all requested portrait sizes; `LUCKYDEX_TCGP_QA_ART` may point to a temporary cache of the existing public card-art URLs for offline screenshots. QA images/cache are not release assets.

The full project runner remains `npm test`. Exact results, unchanged-baseline audit, screenshots inspected, build verification and known limitations are in `docs/TCGP_BATTLEFIELD_v0.69.29.md`. Do not interpret focused TCG success as a claim that all historical project tests pass.
