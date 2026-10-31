# LuckyDex v0.69.37 — implementation and QA report

## Source and release

Only the current `lucky-dex-main.zip` was used (SHA256 `40bbd6a980e3a8bd64cd4ce7af87abbfc9dcff8ec34635bc2a4a507ad7ef4e70`). The user explicitly confirmed v0.69.36 features despite its stale v0.69.35/7016 markers. The isolated baseline commit is `d1deb0b083bef83d9d736d37049c04b826da5e00`. No older implementation was restored. Release markers are **0.69.37 / Android7018**; application ID remains `com.example.luckydex` and the exact supplied permanent keystore is retained.

## Player-facing changes

- Unsaved deck edits, including cosmetic print changes, use Save/Discard/Cancel on editor back, hardware back and app navigation. Unchanged decks leave immediately. Save persists drafts; Cancel preserves current edits. Native page unload also warns about dirty state.
- Saved decks support create, rename, edit, duplicate, confirmed delete and active selection, with Pokémon/Energy/count/readiness previews. Duplication copies art preferences independently.
- The existing My Deck tray and collection scrolling remain. Filter summaries, clear controls retaining Owned, at most two selected types, combined search/sort/filter and scroll retention improve the existing workspace.
- Owned alternate artwork can be selected per canonical identity, persists with the deck, and appears in player hand, battlefield, drag ghost, discard and inspection. Ownership, copy limits and mechanics remain canonical; removed/unavailable preferred artwork falls back to another owned print.
- Sixteen coherent 20-card recipes cover mono-type, complete evolutions, poison/sleep, Energy acceleration, ex, multi-Energy Dragon and Dual Fusion Mega strategies. Incomplete recipes use the owned autobuilder and repair missing predecessor lines; they do not grant cards.
- Both deck backs and CPU hidden hand use the selected sleeve. Physical Bench slot inspection, both discard piles, attached Tools and Stadiums are inspectable. Tapping an unpaid attack explains the missing Energy. Existing drag/setup/promotion geometry and contextual actions remain.
- Battle home uses finished player-facing copy. Developer-only card inspection adds canonical/selected IDs, support status, parsed mechanics, blockers and provenance, plus temporary test-battle controls.

## Solo, records and economy

Sixteen fixed, coherent, validated Solo challenges span four real CPU levels. Beginner favors straightforward legal plays; Intermediate evaluates evolution, reserve setup, attachments and switching; Advanced weights points, survival, status and public board changes; Expert additionally scores bounded short action sequences and winning tactical KOs. All use the same legal action reducer. Evaluation masks hidden opponent hands and both decks and uses a separate deterministic RNG projection; it cannot consume the real RNG stream. Action bounds prevent loops.

Two different clears at the preceding tier unlock the next difficulty. Each challenge records clears, wins/losses/draws and best winning turn count. First clears award 100/50, 150/75, 200/100 or 250/125 coins/dust by tier; repeats award zero. The legacy Ivysaur challenge retains its original reward. A persistent bounded battle-ID ledger plus eviction watermark protects against replay. Developer/practice battles award neither rewards nor progression.

Records include matches, wins/losses/draws, clears, attacks, KOs, actual Energy recipients, Trainers, evolutions, applied enemy statuses, difficulty/archetype wins and most-used deck. Save normalization preserves these fields. Fifteen achievements use the normal LuckyDex provider, retaining existing achievement IDs; dual-type and archetype milestones use actual attacks, rather than unused deck configuration. First-clear rewards remain separate from the normal one-time achievement economy.

## Coverage and current releases

| Measure | Supplied baseline | v0.69.37 |
| --- | ---: | ---: |
| Reviewed released prints | 4,534 | 4,534 |
| Canonical identities | 2,450 | 2,450 |
| FULL / battle enabled | 1,707 | 1,833 |
| PARTIAL | 743 | 617 |
| UNSUPPORTED | 0 | 0 |
| Previously FULL regressions | — | 0 |

126 identities become FULL through reusable normalization/composition, including typed team healing/Energy, filtered switching/Bench damage, named/evolved Bench conditions, conditional damage, both-Active statuses/discard, Energy movement, typed protection, Bench-only auras and end-turn healing. Temporary grant conditions are distinct from live defender-type filters. No arbitrary card-specific handlers, guessed no-ops or disabled PARTIAL fixtures were added. Exact unresolved clauses remain in the generated JSON, with report-only mechanic-family groupings and per-set identity counts.

All217 C1 Dual Fusion prints remain mapped. Genuine type arrays drive filtering, typed effects, Weakness, display and evaluation; attack costs determine Energy. Thirteen individually future-dated Promo-C prints remain excluded. The reviewed catalogue cutoff stays **October30, 2026**.

The October31 release audit found **First Partners** officially launched beyond this inventory. No reviewed card-by-card capture/exact joins are available in the supplied source, so this is explicitly a **known released inventory gap**, not an unreleased exclusion or complete-current-pool claim. Its official release source is retained in `data/tcgp/import/release-audit-v06937.json`. Future work must establish exact records and provenance before importing it.

## Verification evidence

Run `node scripts/verify-pass-v06937.cjs --tag=verified --jobs=2` for all58 relevant Pocket regression programs. The runner records every program's stdout/status and continues through failures. Tests include browser navigation/save/reload, dirty-state paths, art ownership, saved management, recipes, mobile geometry/drag/inspection, auto/manual Energy, developer builds, Dual Fusion, four-tier legal matches and existing core mechanics. The final evidence archive contains `final.json` and build/signature logs. The whole historical LuckyDex suite is not claimed green by this focused pass.

The whole FULL catalogue executes **1,810 attacks,48 Trainers,38 activated,32 passive and11 triggered definitions**, deterministically repeated, with **1,000 seeded battle stress runs**. The126 newly supported identities also have focused real-engine execution and composition tests. Full-match tests exercise Beginner/Expert, all16 Solo decks, evolution, status, dual-Energy/dual-type, Trainer-heavy and seeded catalogue decks. These checks validate execution and asserted invariants; they are not a claim to exhaustive proof of every possible board interaction.

Two positive fixtures cannot be built legally while their required counterpart cards remain PARTIAL: Latias requires Latios, and Cynthia requires Garchomp or Togekiss. Their legal negative/no-recipient branches execute. `catalogue-execution.json` reports these unavailable positive preconditions explicitly.

Early final regression failures exposed a search-cache collision for rows without `card.id` and the changed CPU action bound; these were fixed. Historical assertions were updated for newly supported Lilligant, multiline Developer blocker text, behavior-based achievement progress and explicit temporary CPU Energy validation. Test-mode CPU overrides remain validated; normal challenges retain their fixed configuration. Independent review also caught most-used-deck object rendering and missing preferred art in hand/discard/drag; both have regressions.

`node scripts/verify-tcgp-catalogue.cjs` reports zero mapping, schema, effect-reference and input-integrity errors. Android offline Gradle assembly succeeds; the final APK has a valid v2 signature with certificate SHA256 `069b440b7d315efba1f15473109ae3d945ad1fa8059e6aa262726c986d398a6a`. The delivery packager checks every bundled source asset against the finished APK and confirms the signer keystore, core and unrelated runtime assets are unchanged. The standard booster-art integrity task passed in the first build; the final build excludes that task after restoring its two unrelated index rewrites to exact baseline bytes.

No Android device was available. Installation, upgrade/save persistence on a real device and Android-specific performance remain unverified; the APK is a testing/recovery candidate.

## Performance and visual checks

Desktop headless Chrome, all released prints owned: median combined-filter1.1ms, cached search4.0ms, recipe-list evaluation9.7ms; p95s2.2/6.5/10.6ms. Solo engine startup p950.2ms; opening the populated editor102.9ms. These host measurements are not Android guarantees. Derived search metadata is cached; selected-art ownership rows are cached per battle. Browser screenshot/layout checks cover portrait393×873 and narrow320×700. Artwork loading/fallback remains functional; no remote art binaries were added or remote loading-speed promise made.

## Delivery and remaining work

Apply `LuckyDex_patch_v0.69.37.zip` inside canonical `source/`, retaining existing assets and keystore. It contains only changed/new source, tests, scripts, data and docs. The accompanying audit verifies baseline archive SHA256, every patch entry, source reconstruction, unchanged protected files and APK asset equality. No full repository, old archive, build cache, credentials or image bundle is included in the patch.

Remaining617 PARTIAL identities stay disabled. Additional primitives/choice flows, exact interaction verification and the released First Partners inventory remain future work. No100%-mechanics or complete-latest-inventory claim is made.
