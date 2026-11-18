# LuckyDex v0.69.269 — Rising Rivals completion pass

## Included
- Full offline official `pl2` archive preserved (120 prints: cards #1–114 and RT1–RT6; 188 attacks; 45 printed Powers/Bodies).
- 31 previously gated cards added to the playable catalogue and automatic deck/CPU selection, reaching 120/120 source-enabled cards.
- LV.X: Floatzel GL Water Rescue (choose recovered KO Water Pokémon and attachments; Prize still awarded); Flygon Wind Erosion; Gallade Blade Storm; Luxray Bright Look; Hippowdon Sand Reset and Double Shoot.
- Gym Leader SP and stage2 effects: Shiftry Unlucky Wind/Seal Off, Arcanine optional Burn Out and Flames of Rage, Gastrodon Calling Wave/Sticky Hold, Nidoqueen Maternal Comfort, Darkrai Eerie Aura, Mamoswine Icy Aura, Glaceon Frost Wind, Leafeon Energy Refresh, Sharpedo Energy Shark, Machamp GL Brush Off and Cross-Cut.
- Trainer, TM, and Stadium interactions: Lucian's Assignment; Pokémon Contest Hall; Sunyshore City Gym; Underground Expedition; Technical Machine G on Pokémon SP only; Charon's Choice selecting only Rotom transformations and returning to hand on owner's end turn.
- Choice repairs: Save Sand's no-recovery branch cannot read an invalid discard index; Charon and Calling Wave only offer eligible deck candidates; Water Rescue retains the knocked-out source UID across the player/CPU choice.
- Preserved previously implemented SP Energy and Upper Energy counting, and previous-set battle handlers.
- Gradle `auditRisingRivalsForApk` now runs Stage 1, Stage 2, and completion tests before packaging app assets. All file paths inside the patch are source-relative.

## Verification scope
- The 120 print identities, stats and attacks are read from the local verified original archived JSON, not generated placeholder source.
- The Stage 1 smoke traverses every enabled printed Pokémon attack for available button, resolution, and no stuck mandatory choice.
- The Stage 2 and completion tests cover targeted damage/energy, event triggers, triggered Powers, and CPU deck generation. Combined with older-set regression gates, the source runs locally; full in-game device-specific card outcomes still need player testing.
- Special focus for device testing: opponent's coin flips under Shiftry; interactions with other generations' switch effects and nonstandard Energy; unusual simultaneous KO and multi-prize sequences.
