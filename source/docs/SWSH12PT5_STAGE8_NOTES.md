# Crown Zenith stage 8 — v0.69.601
Main-set integration complete: 160/160 playable, 0 gated, 0 not imported (Galarian Gallery is separate).
- Explosiveness: Luxray is legal only as setup Active without evolution; it does not become a Basic or gain setup Bench placement.
- Sudden Transformation: Ditto uses payable attacks of actual enabled non-Rule-Box Basic Pokémon in its own discard, deduplicates prints/attacks, and respects Ability suppression.
- Primate Acting: copies the chosen enabled Supporter from the opponent's discard as an attack; preserves the physical card and does not play a Supporter. Supports nested target choices.
- Star Order: attached Tool grants a shared once-per-game VSTAR action to Pokémon V. Same-turn Basic V attack damage KO of opposing Active VSTAR or VMAX earns one extra Prize; not an evolved attacker or ordinary V victim.
Validation: 148/148 Crown Zenith targeted tests, 446/446 strict smoke (0 skipped), CPU 16/16; 275/275 Silver Tempest, 628/628 strict smoke (0 skipped), CPU 16/16. All 156 formerly playable generated card records unchanged. Permanent require-complete preflight. Full historical preparation and Android/device verification not run; GitHub checks unchanged. Complex cross-era copied Supporter combinations remain a follow-up audit area.
