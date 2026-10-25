# LuckyDex v0.69.31 — TCG Pocket Battle Flow UX

This release builds on the v0.69.30 free-drag battlefield and makes battle flow readable and player-directed. Benched Pokémon now retain a stable physical Bench slot (1–3), so the player can place a Basic into any open Bench position instead of being forced into the next compact slot. After a Knock Out, the defending side must choose which Benched Pokémon becomes Active; the player gets explicit PROMOTE controls and the CPU chooses through its normal AI legality path.

Battle actions are now narrated visibly. CPU turns resolve one action at a time instead of completing the entire turn invisibly in one engine call, and the battlefield shows a readable action banner for placements, Trainer cards, Energy attachments, retreats, attacks and promotions. Player attack controls also show move name, Energy requirement and damage together.

The compact internal Bench array is preserved for compatibility; a `benchSlot` field provides stable physical board positions without introducing sparse-array assumptions into existing battle logic.

## Release

- versionName: `0.69.31`
- versionCode: `7012`
- canonical GitHub source remains `source/`
- delivery is a changed-files-only patch ZIP

## Verification

Focused TCG Battle core/UI/regression tests and JavaScript syntax checks are run before packaging. Browser-backed Playwright tests are not claimed in environments where Playwright is unavailable.
