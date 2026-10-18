# Independent Adventure location review — v0.40.2

Reviewed 2026-10-13 against the supplied v0.40.1 source ZIP, SHA-256
`a36535f9c9cc59540ffe5d089da553c231cb4117d0ac41243dbb34aef77fecd6`,
the v0.40.2 Adventure location brief, and `ADVENTURE_LOCATION_PLAN_V0402.md`.

**Verdict: ready from independent code review. No unresolved Critical or
Important findings.** Release acceptance remains subject to the coordinator's
full test inventory, visual inspection, first-Gym viewport matrix and final
package/build verification; this review does not substitute for those checks.

## Findings and verified corrections

1. **Important — routine feedback regenerated after dismissal.** Required
   ordinary results intentionally remain in `phase: 'result'` until travel.
   Previously every UI render called `settleRoutine` and recreated dismissed
   feedback. Reproduced after Route 29 victory and starting-home recovery.
   The persistent, traversal-scoped `routineSettledId` now makes settlement
   idempotent. The regression verifies dismissal, replacement, rerender and
   JSON reload. An independent browser check also confirmed home feedback stays
   absent after dismissal and another render.

2. **Important — existing optional merchant saves could not leave the dialog.**
   A v0.40.1 save with `current: 'johto-c1-merchant'` and `phase: 'node'`
   rendered Browse/Party/Bag/Map but omitted the baseline's resolving footer.
   Browsing and returning left the journey trapped in the same node. The
   restored `RETURN TO <place>` action resolves the optional shop and settles
   at the same main location. The browser regression reloads the save, browses,
   returns from Tools and resolves the dialog, proving unchanged depth, coins
   and identity. Its feedback reads `Purchases saved`, without claiming healing.

3. **Minor — legacy home-camp and event copy.** Saved Pallet home-camp dialogs
   previously displayed Pokémon Center. They now use `Rest at home` and
   `REST AT HOME`. Event dialogs now take concise `exploreText` from the place
   profile rather than exposing baseline guide-rest prose. Independent browser
   checks confirmed both the saved Pallet label and Slowpoke Well event copy.
   Preparation and battle headers also consume the authoritative place name.

## Review coverage and evidence

- Inspected the new flow adapter, its UI/home integration, feedback lifetime,
  waypoint persistence and existing-save behavior, optional services, battle
  gates, reward ownership and scene hierarchy.
- Compared the engine against the original ZIP: existing reducer, migration,
  battle, reward, recovery and traversal functions remain unchanged. The
  production extension consists of the two standalone `skipTravel` and
  `restoreAtCenter` methods and their exports. Accepted Battle/Party/TM/Tools
  implementation files remain unchanged in the baseline comparison.
- `skipTravel` validates main event/camp nodes and grants no healing, claim,
  inventory or coins. Required encounters remain blocked. Center recovery is
  validated against current place services, and routes/starting towns cannot
  use it. No new arbitrary pre-Gym healing gate was found.
- Existing node IDs, reward seeds and schema 2 persist through the Johto
  presentation waypoints. Active Tower/Gym battles and results use their actual
  final place. Feedback is scoped by place, node and traversal.
- Scene checks verify all ten categories across three regions, named Johto
  overrides, 384×160 dimensions, distinct image hashes, intact pinned source
  assets, and complete components within scene bounds.
- Ran 24 tests together across `adventure-location-flow-v0402.test.cjs`,
  `adventure-location-travel-v0402.test.cjs`,
  `adventure-location-scenes.test.cjs` and
  `adventure-location-legacy-sections-v0402.test.cjs`: **24 passed, 0 failed**.
- Independent three-region adapter traversal smoke simulations reached
  completion with eight badges and the final reward. These simulations used
  injected terminal battle victories to isolate flow; actual battle and
  ordinary-user playthrough verification belongs to the release QA matrix.

No additional combat/reward bypass, waypoint migration, unsupported fishing or
service, scene-precedence, or native-asset provenance defect was found.
