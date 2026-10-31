# TCG Pocket execution and coherent decks implementation plan

> Execute inline using superpowers:executing-plans; independent read-only coverage recon and one final review. User explicitly requests direct implementation rather than further planning approval.

**Goal:** Increase genuine executable card coverage and make owned/test decks, Energy, attacks and battle messages useful end to end.

**Architecture:** Keep the existing deterministic engine and offline catalogue compiler. Add reusable deck analysis/build scoring in the existing decks module. Compile additional fully understood text into existing effect primitives first; add small generic primitives only with behavior tests. UI consumes deck diagnostics and real engine attack availability, not duplicate legality.

**Tech stack:** Existing vanilla JS/CSS, Node tests, Playwright/Chrome, offline Gradle Android build.

**Spec:** C:/Users/sjwal/.codex/attachments/866d2e92-bcdc-43f4-abe5-6a420baa7f19/Pasted text.txt. Direct latest user instruction: supplied ZIP overrides older baselines.

## Global constraints

- Sole baseline EGG_EMERGENCY_0654_NOTES.zip. Actual source is v0.69.33/7014, not prompt's v0.69.34. No historical product input or restoration.
- Preserve ownership, exact print identity, saves, rewards and unrelated minigames.
- Do not weaken FULL validation or invent unavailable card text. Report every initial non-FULL identity and its final resolution honestly.
- Manual experimental decks remain legal with strategic warnings. Generated/CPU decks must be powerable and coherent.
- New deck Energy derives from costs, not a Grass default. Explicit user Energy survives edits with visible incompatibility warnings.
- Retain manual setup/Bench/promotion, turn/status/evolution/retreat/KO rules. No broad AI roadmap.
- Release v0.69.35/7016 follows requested next pass after v0.69.34; actual baseline discrepancy stays documented.

## Review focus

- Mixed owned pools, insufficient compatible cards and same-name alternate attacks must never manufacture ownership or silently return an incoherent deck.
- Colourless-only/free attacks, mixed Energy and self-generators must not be treated as all requiring the Pokémon's printed type.
- Explicit saved Energy must not silently change on edit, but automatic recommendations update after card changes.
- Coin branches, multi-sentence text and selected targets must not lose clauses to boost coverage.
- Replaced/closed battle messages must cancel timers and never clear a newer message or intercept gestures.

## Tasks

1. [x] Counts verified1145/543/631; provenance mismatch captured; real Articuno/deck/UI failures reproduced first. Standard full-run baseline stops on Adventure Map-tool cases.
2. [ ] Deck engine and card/type/set/mechanic FULL-focused builds implemented and verified. PARTIAL-focused playable test decks remain unfinished; currently explicit blockers only. Manual/automatic saved Energy and CPU validation pass.
3. [x] Source gap recovered by exact pinned MIT print/design joins. Existing effects, compositions and generic zone primitives produce1605/714/0. Machine audit accounts for all1174initialnon-FULL identities,460resolved,714stillflagged; previousFULLcardsnotregressed.
4. [x] Engine attack availability, disabled-visible attacks, required/attached explanation, typed Energy/current/queued next, automatic/manual UI and1600ms narration verified.
5. [x] Final37focused programs pass; per-card1599attacks/26Trainers and ability definitions execute;1000variedseededgames+500existingstress. Fifteen real-art screenshots/allfiveviewports inspected. Final APK build/signature verified. Broader full-suite failures retained/reported, not claimed green; no physical device.
6. [x] One independent review; all three Important findings reproduced and fixed RED/GREEN,68immediatefix-tests and37focused programs pass. Consistent metadata/docs; changed-only reconstruction/signing/workflow audit accompanies patch. Prebuild's unrelated booster JSON restored.

## Ledger

Isolation: fresh validated extraction in Cards/LuckyDex-v06935/source. No archive AGENTS.md. Parent Git master is an unrelated older tree; no worktree/commit/history used as product input. Existing toolchain dependencies may be reused, not old app code.

Ruling: ZIP beats prose version claim — direct latest user instruction makes it authoritative; baseline1145FULL543PARTIAL631UNSUPPORTED, so no claim that v34's unavailable1801FULL work is present. Costs extra implementation scope, not a restore.

Ruling: persist plan/ledger directly in supplied source docs rather than Git-based SDD scratch/commit commands — archive is not a Git checkout and parent is unrelated; patch audit is the change boundary. No remote Git mutations authorized.

Pre-flight: deck analyzer -> UI/Quick Build/CPU share one diagnostic contract; engine attack availability -> UI must return exact modified cost/legal action choices. Coverage compiler -> runtime catalogue must regenerate provenance after effect/compiler edits.

Evidence correction: the first31-program TCG probe overlapped the first deck API edit; its strict old return-shape failure was caused by this pass, not an inherited baseline defect. Legacy return shape restored; all31suppliedTCGprograms are green in the fresh37-program final run. Only independently reproduced pre-edit Adventure Map-tool failures are called baseline failures.

Final review: Mismagius optional movement cannot block60base damage with no Bench; Trainer focus searches owned Energy profiles; ambiguous recognized trailing coin sentences fail closed. Each verified RED/GREEN. Final source provenance, schema and coverage checks pass; no card-specific handler.

Final: Ruling: PARTIAL-focused playable decks remain unfinished — do not enable incomplete rules or claim a legal test deck; disclose review-only blockers — cost: developers still need manual fixtures for these714remaining cards.

Final: Ruling: preserve supplied2026-10-27 catalogue cutoff — user defined the2319-identity target and requested no unrelated expansion; do not silently include later releases — cost: later globally available cards remain out of this release's scope.

Final: Ruling: reviewer did not certify every imported text, device behavior, full suite or package — exact pinned source joins/schema/per-card execution, mobile browser QA and native/signature/patch audits are the evidence available; retain failure/physical-device caveats — cost: source transcription errors or device-only issues can still require later fixes.

No deferred cosmetic minors were identified. No second review loop. This plan intentionally leaves Task2's PARTIAL fixture feature unchecked rather than calling the whole request complete.
