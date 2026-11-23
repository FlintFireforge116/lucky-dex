# Burning Shadows (SM3) — stage 2 continuation

- Version: `0.69.403` (Android `7403`), unchanged from Stage 1.
- Pinned offline source: 177 collector prints, 274 printed attacks, 27 Abilities, 40 GX prints, 3 Basic Energy prints.
- Stage 1: 72 battle-enabled prints. This pass: **114 battle-enabled**, 63 remaining explicitly gated.
- 42 more prints unlocked from exact printed-text guarded attack mappings, triggered and activated Abilities and print-specific Trainer effects. All playable attacking cards are exercised from both player and CPU turns by `v07414`.
- Addition groups: Salazzle-GX Diabolical Claws / Queen's Haze-GX; Gyarados Venting Anger; Tangrowth Giga Drain; Raichu Evoshock; Rhyperior Toppling Wind; Ribombee Honey Gather; Alolan Muk-GX Tri Hazard-GX; Malamar Energy Slosh; plus Lana, Olivia, Wicke, Escape Rope, Super Scoop Up, Bodybuilding Dumbbells, Weakness Policy, Mount Lanakila, Po Town and Rotom Dex.
- **Energy Slosh fixed:** moves both Basic and Special Energy to the same selected Bench Pokémon and conserves attached energy units.
- The mandatory `v07415` test suite verifies exact damage, statuses, knockouts, coin searches, Energy movement, printed Trigger conditions, Trainer and Stadium outcomes, and selection behavior.
- These are **partial playable releases**. The 63 gated cards include novel GX and Ability mechanics and remain out of player and opponent battle decks until tested.
- Regressions: `scripts/preflight-sm3-release.py --full` and older XY10/XY11/XY12 preflights. Full GitHub APK build must be confirmed by user after upload.
