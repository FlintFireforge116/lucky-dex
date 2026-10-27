# Complete Pocket battle cards implementation plan

> **For agentic workers:** Use test-driven implementation. Independent source acquisition, effect-engine work and UI integration may run in parallel with exclusive file ownership; the release owner integrates and verifies the whole result.

**Goal:** Map every released Pocket print at the 27 October 2026 cutoff to its actual gameplay identity, implement reusable mechanics in the existing Battle Lab, and explicitly classify remaining exceptions.

**Architecture:** Preserve the current reducers, portrait battlefield and saved print ownership. A pinned, licence-reviewed import pipeline generates canonical gameplay definitions and print aliases. A central effect registry validates structured descriptors; support coverage is computed from actual implemented mechanics, never inferred from names alone. Unreviewed text remains explicitly unsupported rather than silently resolving as flat damage.

**Tech stack:** Existing offline UMD JavaScript, Node test runner/Playwright, Python acquisition and source-relative ZIP packaging.

**Spec:** User's complete Pocket implementation request, supplied with the new `lucky-dex.zip`; SHA256 `9662b9a9a71716395d1bedf1eba73a2095b864a8b70159784cb36e99aee9e041`.

## Global constraints

- Sole baseline is the supplied v0.69.32 / 7013 canonical `source/`. Do not read or reuse earlier LuckyDex releases.
- Preserve collection print IDs, saves, rewards, sleeves and recent setup/drag/Bench/promotion/narration UX.
- Target 0.69.33 / 7014; retain application ID and signer. Version changes occur after feature verification.
- New external structured data must have compatible redistribution terms; no unapproved AGPL v5 or other application code.
- Gameplay definitions are local; no added image download requirement.
- Delivery is changed/new files only, paths relative to `source/`, derived automatically from the actual baseline diff.
- The user explicitly requested an internal plan followed by implementation without approval pauses.

## Review focus

- Same-name Pokémon with different attacks must never collapse; alternate prints must not bypass two-copy name rules.
- Missing or unlicensed mechanics data must not be invented or labelled FULL.
- New effect targeting, KO and persistent effects must retain manual promotion and physical Bench positions.
- AI must use legal public-state actions, deterministic RNG and bounded action loops.
- Unknown/future sets and mechanics must fail validation or appear as explicit exceptions, never silently degrade.

## Tasks

1. **Baseline and data provenance:** verify archive and current version, isolate its unpacked `source/`, snapshot its file hashes/Git baseline; pin the released-set cutoff and compatible source licence/commit. Compare source inventories and flag future/unreleased promos. Do not change existing collection feeds.
2. **Canonical importer and validator:** add RED tests for precise print aliases, distinct same-name rules, complete mappings, valid schema, no remote runtime dependency and unknown-effect rejection. Generate local canonical cards/prints with stable legacy gameplay IDs; retain original ownership rows. Validate HP/stage/evolution/attacks/costs/types/subtypes/selectors and support statuses. Every card has exactly FULL/PARTIAL/UNSUPPORTED plus reasons.
3. **Reusable mechanics:** add failing family tests before effects/core edits. Extend the existing effect registry and reducer with legal targeting, deterministic coin flips, damage/heal/Energy/draw/search/switch/status/persistent/Trainer/ability families. Resolve unknown descriptors by errors, never ignored text. Enable a card only when all its required behavior is implemented. Retain old API and seeded loaner regressions.
4. **UI/deck/AI integration:** test alternate-art ownership/name limits and unsupported disclosure, inspection text/abilities/Trainer subtype, generic targeted actions, Supporter/Tool/Stadium legality and missing artwork. Preserve existing portrait CSS/drag behavior. AI chooses only legal actions and uses no hidden player data.
5. **Exhaustive verification:** schema/print/effect coverage, card execution fixtures, all current Battle Lab regressions/browser tests and at least 1,000 seeded battles; record crashes/stalls/max turns/failing seeds. Run the normal project suite, disclose inherited failures by name, and compare when needed. Review important findings before release.
6. **Patch and handoff:** update consistent version markers, generate exact Markdown/JSON coverage, source/licence/update documentation, preservation audit and test report. Build source-relative changed-only patch from Git baseline, independently compare its contents with original archive, reapply to a fresh baseline and revalidate. Supply exact Termux commands; no external push/publication.

## Decisions and execution ledger

- 27 October 2026: isolated snapshot retains `source/` directly under a local repository root. The source archive includes 1.6 GB of Git history, which is unnecessary for a working-tree patch; the archive's exact unpacked source is instead committed locally as an audited baseline. The user's external checkout is untouched.
- Licence gate: current PocketDecks v5 is AGPL; legacy v4 is explicitly MIT. The v4 print catalogue lacks attack/stage/ability details, so it cannot alone justify gameplay implementation. Mechanics acquisition remains an explicit audit requirement.
