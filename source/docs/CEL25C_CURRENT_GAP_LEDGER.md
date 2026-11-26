# CEL25C — whole-set gap ledger

Canonical prints: **25** | Playable: **21** | Gated: **4**
Printed attacks: **31** (30 distinct full signatures) | Abilities: **13** (13 distinct signatures)
Trainer rule signatures: **3** | Special Energy rule signatures: **0**
Canonical Git blob: `3de4dd54bb073113773f4797d3bb13f23c311038`

The distinct-signature count is an implementation inventory, **not** a count of supported mechanics.
Gated is determined by the validated generator output; do not infer it from test counts.

## Blocker groups (implement shared handlers first)
- **1 prints** — Birthday Surprise requires an explicit in-game birthday policy. — cel25c-24_A
- **1 prints** — Dark Ray optional hidden hand discard and Star rules need dedicated outcome tests. — cel25c-17_A
- **1 prints** — Final Beam needs knockout reaction, coin, status gate and weakness/resistance. — cel25c-8_A
- **1 prints** — Original Item requires persistent face-up Prize display and selection (not the later Supporter). — cel25c-15_A2

## Every remaining gated print

| Print | Card | Blocking reason(s) |
|---|---|---|
| `cel25c-15_A2` | Here Comes Team Rocket! | Original Item requires persistent face-up Prize display and selection (not the later Supporter). |
| `cel25c-8_A` | Dark Gyarados | Final Beam needs knockout reaction, coin, status gate and weakness/resistance. |
| `cel25c-24_A` | _____'s Pikachu | Birthday Surprise requires an explicit in-game birthday policy. |
| `cel25c-17_A` | Umbreon ★ | Dark Ray optional hidden hand discard and Star rules need dedicated outcome tests. |

## Release definition

Playability is only complete at zero gated prints, with all official IDs, attacks, Abilities, Trainer/Tool/Stadium and Energy effects covered by gameplay outcome tests. CI APK and physical-device checks are separate evidence.
