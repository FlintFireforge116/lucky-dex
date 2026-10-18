# LuckyDex v0.40.1 — Adventure Gen III UX

Date: 2026-10-12. Authoritative input: supplied `LuckyDex_source (1).zip`,
v0.40.0. No earlier project checkout was merged. Release identity is
**0.40.1 / versionCode 4001 / com.example.luckydex**.

## Baseline findings

All 5,985 app files matched the incoming ZIP. Its 36 focused Adventure programs
passed, and the existing harness produced 64 passing outer-viewport captures.
Manual inspection nevertheless reproduced the reported UX problems: FIGHT
covered actors with expanded move cards; Party/TM contents scrolled inside tall
paper panes; the learner used a native select; routine results forced an
interstitial; generated detour titles appeared as places. The new checks measure
primary pane/control fit as well as outer document bounds.

The untouched full baseline passed 311/327 historical programs with 16 failures
listed below. An additional older Fossil fixture was timing-sensitive: it failed
in an intermediate current inventory, subsequently passed on current source,
and the same failure was reproduced on untouched v0.40.0.

## Changed Adventure files

Under `app/src/main/assets/adventure/`:

- `adventure-regional-ui.js`, `adventure-controller.js`, `adventure-hub.css`
- `adventure-battle.js`, `adventure-battle.css`
- `adventure-move-view.js`
- `adventure-tools.js`, `adventure-tools.css`

The existing renderers/styles were replaced/refactored, not layered with another
override renderer. Battle reducer, Party mutations, prices/quotes, learning and
purchase transactions, canonical move descriptions, engine/geography, IDs,
claims, schemas, migration and local artwork remain intact.

The main runtime/HTML/package/Gradle markers were updated consistently. Gradle
also accepts `LUCKYDEX_PYTHON` on Windows and retains original catalog bytes when
regeneration is semantically identical. This fixed a reproduced Windows Store
`python3` failure and a build-time newline-only preservation failure; catalog
data was not changed. The asset-builder User-Agent was corrected to 0.40.1 after
seven unchanged historical metadata regressions caught a stale 0.40.0 marker.

## Focused and regression verification

Final focused inventory: **41/41 programs pass**. New failing-first coverage
includes compact move/detail rendering, all primary tool layouts, paged pickers,
Back context, pending/TM comparison, rapid taps, exact debit/consume boundaries,
contextual location labels, ordinary result/reload settlement, milestone results,
Center/Gym gating and coherent release identity. Existing Adventure battle,
priority/Speed/RNG, PP/status, save/migration, reward safety, party syncing,
Wild Hunt math, economy and lifecycle programs stay green.

Actual battle tests cover 50 menu states at five viewports, including command,
FIGHT, Bag, switch, optional info, long move names, trainer restrictions and
Struggle. Optional previews leave serialized battle state unchanged; a move tap
still executes once. At 360×640 the scene stays 272–273px normally and at least
212px with Struggle; at 320×568 it stays at least 182px.

Actual Tools tests cover four main viewports, six-entry in-game pickers,
selection/search/paging, one selected-member pane, four known moves, replacement
comparison, cancellation, rapid confirm taps, Mart and Bag fit. An additional
regression rejects excessive unused paper space. Old UI fixtures were adapted
only where the approved design changed selectors/flow or selected-item detail;
their transaction/revalidation/reload assertions remain.

**419 JavaScript sources parse.** The current preservation checker verifies
5,974 app files byte-for-byte plus three narrowly normalized release/build files,
eight approved UI edits, the unchanged battle reducer/transaction prefixes and
canonical formatter. The historical checks also retain 5,966 protected supplied
files and 211 shared application function declarations.

## Visual QA

**135 fresh captures** cover 360×640, 360×780, 412×915, 768×1024 and 320×568.
Document and horizontal overflow are zero. Main phone panes have no required
scrolling; the smallest layout may use a bounded tool pane. Capture checks also
verify visible controls, local images, footer bounds and player-facing copy.
Transient real toasts are allowed to finish before stable screenshot capture.

Screens include home/regions, New Bark Town, Route 29, a city with Center/Mart/
locked-Gym choices, grass and special-area actions, Party, replacement picker,
Moves, pending replacement, TM Case/teaching, command/FIGHT/Bag/switch, Wild Hunt,
Mart/purchase, Gym preparation/battle, badge result and checkpoint recovery.
Contact sheets and key full-size screens were manually inspected. Milestone
screens use scoped setup fixtures; they do not substitute for battle tests.

FISH is omitted because the supplied authored nodes lack explicit validated
water encounter pools. No rod system, invented pool, new reward loop or free
Center healing was introduced. Only authored camp restores full HP/PP/status.

## Independent review

Two introduced contextual issues were reproduced and fixed test-first: Pewter
City's Gym had been classified as a town, and cave wild encounters said Search
grass. An inherited raw-status display was also replaced with readable labels.
The review found no new transaction/persistence defect in its inspected scope.

## Full continuing inventory and inherited failures

The normal repository runner was executed and stops at inherited
`amie-recovery.test.cjs`; no entirely green historical-suite claim is made.
The final continuing inventory passes **316/332 programs**, with exactly the
same 16 failure names as the untouched baseline and **no new failures**.
The final continuing inventory and baseline comparison are retained under
`artifacts/v0401/`. The initial post-bump raw inventory (309/332, including the
seven metadata regressions subsequently fixed) is retained separately.

The 16 baseline failures are:

- `amie-recovery.test.cjs`
- `recovery-lifecycle.cjs`, `recovery-runtime.cjs`
- `recovery-trade-refresh.cjs`, `recovery-transactions.cjs`
- `v0223-berry-touch.test.cjs`
- `v0250-fossil-browser.test.cjs`, `v0250-fossil-routing-browser.test.cjs`
- `v0264-booster-art-audit-and-slim-pack.test.cjs`
- `v0267-physical-card-art-recovery.test.cjs`
- `v0283-unown-browser.test.cjs`
- `v0340-dash-previews.test.cjs`, `v0340-dash-viewport.test.cjs`
- `v0360-dig-browser.test.cjs`, `v0370-magikarp-browser.test.cjs`
- `v0380-rock-harden-browser.test.cjs`

They concern inherited fixture/lifecycle/layout expectations and unavailable
`python3` subprocesses. Timing-sensitive `v0223-fossil.test.cjs` is documented
separately rather than hidden as a new Adventure defect. Unrelated game code
was not changed to silence these old fixtures.

## Offline assets, Android and packaging

Offline audits pass: 44 scenes/sheets/crops; 2,098 sprites; 2,078 actors;
eight venues; Adventure's 829 images, 1,025 species, 386 backs and 37 objects;
42 Fossil Museum images. The exact 210,014-byte Dragon Vault image validates,
and the booster audit verifies 144 bundled-art rows with 12 non-booster products.

Gradle debug build succeeds. APK metadata confirms 0.40.1/4001 and the original
application ID. Original signer SHA-256 remains
`069b440b7d315efba1f15473109ae3d945ad1fa8059e6aa262726c986d398a6a`.
The versioned APK is debug-signed with the supplied development identity.

Packaging uses a fresh extraction, ZIP CRC/source-byte checks, comparison of
every extracted runtime asset with APK bytes, and reruns of focused/source
verification. The fresh extracted tree passes **41/41 focused programs**, all
419 syntax checks, release identity and protected-source checks. All **5,979
runtime assets** match the APK byte-for-byte. The final repack only adds completed
verification evidence and handover wording; its runtime bytes remain identical.
Adjacent package-verification JSON records paths, counts and
checksums. The clean ZIP excludes Git/dependencies/build/SDK caches, local SDK
properties, source-baseline copies, old/scratch QA and APK binaries.

## Limitations

Physical Android/WebView execution, native keyboard behavior, device FPS and
accessibility text scaling were not verified. Browser evidence uses real Chrome
with the full local/offline app. The inherited failures above remain outside
this focused UX pass. No push or merge was performed.

Handover: `docs/ADVENTURE_UX_V0401.md`; retained approved brief:
`docs/ADVENTURE_GEN3_UX_BRIEF_V0401.md`.
