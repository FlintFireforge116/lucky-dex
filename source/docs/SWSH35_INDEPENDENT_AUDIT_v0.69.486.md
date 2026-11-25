# Champion's Path independent outcome audit — 0.69.486

80/80 prints enabled, zero gates. No new card mappings or deck-builder changes.

## Findings and fix
- Legacy Lost Thunder Jungle Heal-GX set the healed-this-turn marker even when the eligible Pokémon was already undamaged. Only actual damage removal now marks healing, preventing incorrect Swelling Pulse damage bonuses.
- Verified Ninetales V Nine-Tailed Shapeshifter already uses the staged pre-damage payment handler via its existing sm12Copy flag. No copy-engine change required. Copies only the opposing Active's attacks; copied Whisk uses friendly attached Energy and counts cards. Failed confusion prevents payment and successful confusion checks only once.
- Verified Solid Shell after Weakness for all four Drednaw prints; Hazard Sensor on knockout; Wicked Ruler legality with four-card hands and Ability suppression. Both player and CPU-side outcomes tested.

## Validation
14 new bilateral audit tests; full SWSH35 preflight 58/58; focused SWSH1–3 and deck-performance regression 434/434; full SM1 release preflight 67/67. New audit is required by the SWSH35 preflight and Gradle source gate. Exhaustive historical regression and Android APK/device validation remain unverified. The broader legacy heal paths have not been exhaustively audited; this release addresses the concrete marker bug and the specified copied-attack interaction.
