# Scene presentation and navigation — v0.40.3

The existing location adapter remains authoritative for names, services and
progress. `describe(journey)` now also provides `objective` and `nextId`.
Objectives are concise world copy; the actual engine gating is unchanged.
Local transition actions carry `destinationId`. `travelFor(save, journey,
actions)` returns `{label,destinationId,enabled}` or null when a visible local
action already represents that destination. Normal route onward travel remains.
No string matching in the renderer determines which control is redundant.

An unchallenged Gym adds `leave-gym`. `perform` changes only presentation state
and the display location: the original node/depth, phase, current, party/HP/PP,
claims, badge checkpoint, stats, inventory and coins remain intact. The city can
provide the same supported optional services and re-enter its Gym. The small
serialized `locationFlow.gymCityReturn` flag records intentional city visits.
For non-Violet Gyms, v0.40.2's existing step0 meant the actual Gym; absence of
this new flag still means the Gym. Violet keeps its existing City→Gym waypoints.
Active battle and milestone-result phases never expose Leave Gym. A badge still
uses the original result and advance reducer, then displays Route32 with clean
feedback. No regional engine function or schema was changed.

`placeScene` reads native width/height and optional avatar metadata from the
existing catalog. One aspect-preserving stage scales the complete PNG and player
coordinates together. The bounded view uses the width aspect, viewport budget
and360px cap, and can shrink for short phone menus. No floor is repeated beyond
the PNG. Gym/League descriptors omit avatars; preparation, battle and milestone
views use their accepted renderers. Root location styling is scoped to journey
and section screens, leaving all accepted tools and battle layouts untouched.

Static player art uses the existing transparent Red trainer pose at32×32 native
scene size, not an unavailable overworld walk sheet. See the scene provenance
note. Art interpretation is deliberately limited to cached native map rectangles
and packaged sprites, with no network or new free-roam system.

The new flow regressions were observed RED for missing objectives/destination
identity, duplicate travel, no Gym exit and old-save semantics. They pass after
implementation, including actual no-mutation snapshots and JSON reload. The
independent review also probed24Gyms×fresh/legacy states and found no progression,
reward or recovery bypass. Browser acceptance separately plays real PP-bearing
battles through the first badge and Route32.

The objective also respects the presentation segment: Route30/31 say Follow the
path while the existing trainer remains at SproutTower. This copy-only regression
was observed RED then GREEN, without changing battle availability or travel.
