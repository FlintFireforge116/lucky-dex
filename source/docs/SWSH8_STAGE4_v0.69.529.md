# Fusion Strike stage 4 — v0.69.529

## Source and scope

All 284 official prints are now imported: 391 printed attacks, 30 Abilities, 36 Trainer prints and 3 Energy prints. New exact 57-print packet `swsh8-stage4-pokemon.jsonl` matches pinned upstream Git blob `d88289e9b1469bc1c27cf268461f9efdec00134d` (transfer FNV-1a 1798254853). The combined compact SHA-256 is `88e97f1540d70316a3358edd10121c68fe8fe0b1794ae7dcb5f993cdbbaad4cc`. All 227 earlier source rows and 206 earlier enabled card descriptors compare equal. No missing IDs.

234 prints enabled (+28); 50 explicitly gated. This is catalogue completion, not mechanics completion. Existing hybrid basic-Energy search rules remain unchanged; no changes to the shared runtime in this stage. Effects are selected by full printed text and validated against existing shared primitives, rather than by attack name.

## Gameplay

- New evolution triggers: Tricolored Scales offers all three statuses or skip, Rowdy mills one deck by coin, Dig Up recovers up to two Tools. Guts uses the existing attack-only coin survival guard.
- New Energy movement/return effects include Bubble Launch, Power Cyclone, Energy Loop, Blizzard Loop, Splash Arch and Earthen Boom. Tool removal includes Surprise Short (all opposing Pokémon) and Joust (before damage). New discard-to-damage attacks preserve the Tool/basic Energy restrictions.
- Other attacks include conditional paralysis, self recoil, basic-only knockout, self-damage scaling, friendly Bench damage, named attack restriction, defensive modifiers and retaliation. Drag Off and Sleep Inducer require an opposing Bench before applying their follow-up effects.
- Focused suite: 57/57, including both-side execution of every enabled attack, 14 additional outcome checks and existing set-local deck legality tests. Existing engine limitations and cross-set interactions still warrant independent audit. Remaining complex mechanics (including paired Items, Fusion Strike Energy, special type/HP/ability auras, alternate attack costs) remain gated in the whole-set ledger. Huntail's proposed opponent-team modifier is rejected by the descriptor validator; do not bypass it without implementing and testing the scope.
- Android APK compilation and physical-device testing remain outstanding.

Final v0.69.529 validation: full offline preparation exited 0; 2030/2030 gameplay test invocations, including 57/57 Fusion Strike checks; zero failures, skips or cancellations.
