# XY10 Fates Collide — Stage 5 (v0.69.387)

This is an additive update over successful GitHub build v0.69.386 (run #45049337007), with six newly supported prints: Delphox BREAK #14 (Flare Witch), Carbink BREAK #51 (Diamond Gift), Devolution Spray #95, Energy Pouch #97, Energy Reset #98 and Scorched Earth #110.

## Implementation guarantees

- Fire Energy Zone searches and physical Fire cards are kept separate. The chosen attachment target is explicit.
- Diamond Gift selects the same Fighting recipient for up to two Energy cards, including physical Special Energy UID continuity.
- Devolution Spray returns the highest Evolution to hand and enforces the cannot-evolve-this-turn restriction.
- Energy Reset gives a per-attached-Energy choice and permits stopping early.
- Energy Pouch has a real opponent-attack knockout test; Basic Energy goes to hand, other attachments discard, and Prize award remains.
- Scorched Earth reuses the already-audited XY5 Stadium action. Deck builder checks for physical discard fodder.

## Release checks

Run `python3 scripts/check-gradle-source.py --self-test` followed by `python3 scripts/preflight-xy10-release.py --full` before committing. The latter regenerates the official 129-print catalogue and invokes ALL Fates Collide test files, including Stage 5. The generated catalogue remains mandatory on GitHub. No guarantee of zero runtime bugs is implied.

Other cards (notably Fossils, special KO and global abilities) remain strictly gated.
