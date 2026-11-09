# LuckyDex Classic TCG — v0.69.175: EX FireRed & LeafGreen

Patch base: v0.69.174. Extract ZIP **inside source/**, preserving the unpacked source tree.

Cards: all 116 original ex6 cards, including 12 Pokémon-ex, 171 printed attacks, 33 Poké-Powers/Poké-Bodies, 16 Trainers, and Multi Energy. Original wording and card numbers retained.

Integration: player-facing Classic set filter, auto-builder's set registry and synergy metadata, CPU opponent generation/set restriction, owned-card mapping, and Test Lab access.

Highlights: Clefable ex Metronome attack copying; Mr. Mime ex damage-parity shields; Snorlax Toss and Turn while Asleep; Nidoking Power Gene; Butterfree Sooth Dust; Pidgeot Quick Search; Blastoise ex Energy Rain; Venusaur ex Energy Trans; Charizard ex Energy Flame; optional Legendary Ascent choice with Basic Energy movement; EXP.ALL knockout Energy recovery; original Pokémon-ex two-Prize KO rules.

Targeted numerical outcome testing includes Energy conversion and discard, Bench/Active attack damage, card discard for powered attacks, Safeguard, damage counters, attack duplication, knockout Energy transfer and effect-choice settlement.

Verified locally: 198/198 prior EX set + Test Lab + Classic deck-builder + new ex6 regression tests (2026-11-09); JavaScript syntax checks. No Android touchscreen testing. Single-Active adaptations remain for 2-on-2 original card wording. Some rare multi-target/choice interactions and unusual cross-set combinations may still need playtesting; do not equate an execution sweep with perfect mechanical fidelity.
