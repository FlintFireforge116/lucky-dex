# Ultra Prism Stage 5 (v0.69.409)

New Prism Star complete-print mechanics, cumulative with Stage 1–4 and SM4 independent audit fixes.

- Giratina ◇: Crisis Dive; optional Chaotic Star trigger (up to two physical Psychic Energy cards from hand when played onto Bench).
- Lunala ◇: Full Moon Star, distributing only genuine discarded Psychic Energy; Psystorm counts attached Energy cards across both sides.
- Darkrai ◇: Abyssal Sleep with two-heads recovery; optional Nightmare Star hand-only Darkness attachment.
- Solgaleo ◇: Radiant Star distributing only discarded Metal Energy; Corona Impact attack lock.
- Cyrus ◇: pre-play Water/Metal Active restriction and opponent chooses two Bench survivors; all other Benched Pokemon and attached cards physically shuffle into opponent deck.
- Shared one-per-name Prism Star deck rules and Lost Zone redirect are retained from Stage 4; Super Boost Energy ◇ remains playable.
- Exact official card text pinned by the immutable SHA check in the full SM5 release gate.
- New mandatory Stage 5 real-game outcome suite for both sides; prior sets unchanged.
- Offline working environment lacks the canonical SM5 compact source, so run `sh source/scripts/prepare-sm5.sh` (Internet required only on first prepare) before pushing. It must fully generate the catalogue and run the full preflight. GitHub APK build still needs observation after push.

## Stage 5 release-gate maintenance correction (same version)

Earlier Stage 1 tests `v07424-ultra-prism-integration.test.cjs` and `v07425-ultra-prism-reuse.test.cjs` were still asserting `battleEnabled === false` for Prism Star and Special Energy, causing 2 failures after Stages 4–5 correctly enabled those prints. The corrected tests assert full support, one-per-deck limits, and one-unit Special Energy descriptors. This is a **test-contract fix**: gameplay and printed source mappings remain unchanged. Run `sh source/scripts/prepare-sm5.sh` again to regenerate and check the canonical catalogue before pushing.
