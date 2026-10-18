# Location fixture adaptations for v0.40.2

Three supplied location programs asserted the presentation deliberately changed
by this pass. Their obsolete action selectors and travel assumptions are updated;
accepted battle, Party, Move/TM and Mart programs are untouched.

| Program | Changed presentation expectation | Retained verification |
| --- | --- | --- |
| `adventure-regional-browser.test.cjs` | Authored home recovery returns to its place; explicit named travel opens Route 1; the local battle action opens FIGHT. | Exact serialized journey ID, party HP/PP, battle/RNG and depth survive reload. TM preview spends nothing, confirmed replacement consumes one TM and changes the owned move. Runtime error assertions remain. |
| `adventure-regional-ui.test.cjs` | Destination text comes from `continueLabel` rather than the generic `CONTINUE JOURNEY` string. The two new presentation modules load before the regional renderer. | Single Adventure owner, absence of retired/native team architecture, and every original module ordering assertion remain. Dependency checks additionally require each source to exist. |
| `adventure3-ux-v0401-journey.test.cjs` | Unavailable New Bark Center/Mart controls are absent. Explore settles the optional cache locally. Talk, encounters and Centers wait for explicit travel. Party condition is read in the existing Party tool. Cities offer their named Gym without a forced Center visit. | All five viewport bounds/pane-fit checks, parent place identity, contextual route/cave/tower actions, no unsupported fishing, optional-depth preservation, one-time cache/reload rewards, human status names, full Center HP/PP/status recovery, double-tap travel safety, Gym preparation, dedicated badge milestones and runtime error checks remain. |

The historical journey program retains its scoped battle-result fixtures solely
to exercise settlement and milestone rendering. Primary acceptance uses
`adventure-location-acceptance-v0402.cjs`: ordinary UI actions and actual shared
battle turns through New Bark, Route 29, Cherrygrove, Routes 30/31, Sprout Tower,
Violet City and Violet Gym. It never injects victories, grants or recovery.

Observed verification after adaptation: the first two programs pass; the journey
program passes at 360×640, 360×780, 412×915, 768×1024 and 320×568. The new browser
regressions additionally cover scoped/dismissed feedback, real first-Gym combat,
functional exploration exits and unavailable home-recovery actions.

The sole archive preservation checker permits these three test paths explicitly
and continues to hash accepted battle/tools/move/model/progression files exactly.
