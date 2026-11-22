# LuckyDex v0.69.400 — Sun & Moon SM1 completion

All **173 official print records** are fully catalogued and effect-enabled, including **Eevee #101a**, 238 attacks, 26 printed Ability instances, 27 Pokemon-GX and their GX attacks, 13 physical Energy prints and alternate arts.

Reused prior mechanics where exact; added SM1 effects for Pokemon-GX abilities, targeted/conditional GX attacks, conditional damage, hand/deck/discard choices, GX turn flags, tool triggers and physical special Energy. Reused a single `sm1Rule` dispatcher for print-specific mechanics.

The `scripts/sm1_release_contract.json` now requires 173 playable prints and **zero gated**. All official metadata is generated from the pinned source commit and kept unchanged.

Mandatory CI: `python3 scripts/preflight-sm1-release.py --full` and Gradle `auditSM1ForApk` must run the original integration suite, v07400 completion suite, and global 30-card deck-quality suite.

Follow-up independent audit: Verify GX attack turn timing and Prize settlement, hand and discard zones, all Ability suppression, rare cross-era Energy interactions, CPU selection/synergies and live choice flows.
