# Target Range v0.42.3 — bounded implementation note

Authoritative baseline: supplied LuckyDex_source_v0.42.2.zip only. Older
workspaces are not input. User explicitly requested inspection, a short note,
then implementation without a long planning round.

Replace the existing banner composition in place with a portrait, height-filling
downrange scene: quiet horizon, narrowing ground lane, receding markers, restrained
type palettes and a low foreground Pokémon. No Dash background. One geometry maps
distance to target position/size, launch origin and scored/visual impact. Use a
slower smooth arc and shrink the projectile into depth; retain all 18 silhouettes.

Focus rises and falls continuously while held. Profile-specific rise time and a
visible forgiving ideal band determine release quality. Retain score rings,
Sp. Atk assist and reward semantics. Keep motion gentle, targets available until
shot, and use a deliberate impact/recovery pause. Cancel in-flight work on
close/restart so stale callbacks cannot mutate a later round.

TDD covers oscillation/release quality, near/far geometry/flight, golden bullseye,
pixel-correct impact, mobile fit, offline artwork, and repeated/cancelled input.
Run existing Target Range/Goldenrod plus Power/Impact/Dash/record/reward/achievement
regressions, preserve baseline failures explicitly, inspect live screenshots, then
release coherent 0.42.3/4203 source with SHA-256 and an exact test report.

No framework, progression, record schema, migration, other minigame, reward
settlement or eligibility redesign. Package identity and supplied signer stay.

Review fix: gallery-height aiming exposed insufficient downward thumb travel
from the bottom pad. A failing real-pointer test reproduced it. Every target now
resets to a fixed low neutral aim (.5, .70), never to a target/stat/wind-derived
coordinate, and gallery/control holds share one captured input path. Six real
near/far pointer bullseyes across three phone sizes verify practical reachability.
Gallery cancellation and stale-flight cancellation both discard the shot safely.
