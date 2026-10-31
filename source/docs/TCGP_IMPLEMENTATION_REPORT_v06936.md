# LuckyDex v0.69.36 implementation report

## Product scope

The actual current v0.69.35 tree is the baseline. The patch changes only Pocket deck construction, catalogue compilation, effect type handling, related tests/docs and release markers. It does not restore older code or redesign Adventure, pack opening, Clefairy, progression, rewards or cosmetics. Application ID, permanent signer and GitHub workflow remain unchanged. Android versionCode7017 / versionName0.69.36.

## Deck workspace

- Persistent illustrated **MY DECK · X /20**, quantity-aware canonical grouping, Pokémon/Trainer composition, explicit automatic/manual Energy, tappable inspection and direct removal. Both collection scroll and horizontal deck-tray position survive edits.
- Artwork collection grid with owned/in-deck quantities, ownership/copy/name/20-card bounds and meaningful empty/disabled states. Proper page navigation exposes all results, not an invisible100-result limit.
- Combined filter sheet: categories and Trainer subtypes/Fossils, all ten types with genuine dual-type combinations, stages, every released set, ex/Mega, owned/minimum quantity, in/not-in deck, attack Energy, retreat, Ability and battle readiness. Implementation status and blockers are Developer-only.
- Search includes card/attack/Ability/rules/Trainer text, mechanics and all linked-print set names. Sorts cover set/number, name, type, HP, real numeric firstPulled acquisition time, owned quantity and stage.
- Multiple persistent named decks and incomplete drafts: new/edit/active/copy/confirmed-delete, visual previews and immediate battle entry. Old records remain available. Invalid Energy configurations are saved as clearly blocked drafts rather than crashing battle entry. A manual but valid experimental Energy choice remains allowed with warnings.
- Local recipes report actual owned completion and missing cards. Loading a recipe adds only owned legal copies; it never invents ownership. The pure recipe/query/edit APIs provide a future deck-list import boundary without social/network functionality.

## Autobuild and Developer testing

The authoritative builder evaluates bounded, distinct Energy/evolution archetypes and multiple Pokémon budgets, rather than alphabetic or isolated-stat selection. Family cores prefer duplicate access to preceding stages; Trainer utility depends on evolution consistency, costs, acceleration, healing, retreat, disruption, typed/name filters and persistent support. Internal dimensions include legality, Energy, evolution, setup, attacker availability, contextual support, synergy and dead-card risk; no arbitrary public rating is shown.

Recommended, focus-card, focus-type and preserve/fill/repair modes use actual owned FULL copies and printed-name limits. Conditional focuses include owned Burn/Confusion/poison sources and Tool/Stadium/Supporter enablers where applicable. If a conditional support source is unavailable, the normal suggestion warns; the Developer mechanic setup reports a blocker instead of claiming readiness.

One generator implements both synchronous tests and asynchronous production construction. Production yields between candidates, and session/draft tokens prevent pending work overwriting new drafts or a closed editor.

Developer setups select actually owned compatible evolution versions, show prerequisites, retain exact PARTIAL text/blockers and distinguish legal-deck readiness from mechanic readiness. Supported opposing ex/status dependencies can generate a CPU loaner pair. Test-pair launch and rematch preserve that opponent and Energy, run as practice, and do not award first-clear rewards. A real shuffled Stage2 test fixture evolves on separate legal turns and powers the focus attack without inventing cards. This is a practical prerequisite tool, not a claim of exhaustive automated per-card board-state certification; the player still follows the printed sequence and may need to reapply a condition after recovery/switching.

## Current pool and mechanics

Cutoff2026-10-30: **4534 obtainable prints,2450 gameplay identities**. All217 C1 prints are mapped, including dual-type Mega Greninja ex and Mega Mewtwo X ex. P-B-103 is now obtainable. Thirteen known future Promo-C prints and October31 First Partners remain unavailable. Exact sources, release gates, licensing scope, image correction and the v034/v035 baseline mismatch are in `TCGP_CURRENT_POOL_v06936.md`.

Types remain arrays, with a legacy primary subtype retained for compatibility. Weakness checks once against either actual type; typed targets/searches/Bench counting, deck filters, search and display use both. Energy derives from attack requirements, not an arbitrary Pokémon type; CPU attack resolution uses the same effect machinery.

Coverage: **1707 FULL /743 PARTIAL /0 UNSUPPORTED**. All1605 previously FULL identities stay FULL; ten existing PARTIAL cards are resolved with reusable Stadium conditions, exact coin-lock composition and random self-Energy discard. Of131 new identities,92 are FULL and39 remain PARTIAL. The old714 PARTIAL population drops to704, not to zero. Standard ex/Mega point boxes are explicitly reviewed, not generally ignored; unrecognized rules still disable the whole card. All743 remaining PARTIAL identities retain actual rules, exact blockers and compiled primitive inventory in `generated/tcgp-partial-review-v06936.json`. That is a complete machine-assisted audit, not a fabricated human/image certification of every card.

## Review, verification and limitations

A fresh read-only whole-change review found six important issues: Energy readiness, pending-work lifetime, owned pre-evolution selection, unreachable conditional setups, test rematch preservation and deck-tray horizontal resets. All received failing regression reproductions before fixes. Acquisition-time sorting, linked-set search and normal-mode diagnostic leakage were treated as required feature corrections, not deferred polish. The final visual inspection also caught and tested attack-name/damage spacing.

Use `TCGP_TEST_RESULTS_v06936.md` for exact fresh program counts and every unresolved historical failure. The full project is not green, and no such claim is made. Physical-device QA is not represented as completed. APK, source reconstruction, version, protected-file and signature checks accompany delivery.

## Rulings made

1. Execute the supplied detailed implementation request without another approval round; retain the existing vanilla JS/Android architecture. Cost if wrong: the user may prefer a different interaction detail, but no unrelated platform migration was introduced.
2. Use an isolated directory copy of actual v035, because the parent Git repository is an unborn collection of exports. No commits, push or older baseline restoration. Cost if wrong: integration remains a changed-only patch applied inside canonical source/ rather than a managed branch.
3. Preserve future-print release gates and all unresolved PARTIAL blockers. Cost if wrong: a conservative card may remain unavailable until authoritative evidence or its missing handler exists; no guessed mechanics enter normal battles.
4. Review set-asides: repeat external research centrally rather than claiming the reviewer re-certified it; leave existing shop/pack acquisition unchanged; complete historical-suite/APK/package checks centrally. Cost if wrong: the battle catalogue does not make an unreleased remote pack/shop source available, and physical-device or every-transcription certification remains unclaimed.

No minor review finding was silently deferred: the three functional findings were promoted into the fix pass because they directly affected requested sort/search/Developer behavior.

## Applying delivery

Unzip `LuckyDex_patch_v0.69.36.zip` **inside the existing canonical source/** directory. Entries are source-relative (`app/`, `scripts/`, `tests/`, `data/`, `docs/`), with no extra source/ prefix. Do not replace the whole repository or remove the permanent keystore. The existing root GitHub workflow still builds source/. The debug APK uses the existing application ID/signer so it can update the same installation; retain a save backup before installing as usual. Detached verification logs are not part of the source patch.
