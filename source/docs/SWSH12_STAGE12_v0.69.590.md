# Silver Tempest stage 12 — v0.69.590

209/215 playable; 6 explicitly gated; all 215 pinned source records imported.

- Unown VSTAR (66/199): Tri Power uses three attack coins; Star Cipher consumes the shared VSTAR Power and stores a gained-Ability flag on its in-play source. The active and Wide Lens matchup paths compute the opposing Weakness dynamically, preserving its amount and the absence of printed Weakness. Switching does not remove the gained Ability; leaving play or suppression disables the aura.
- Ho-Oh V (140/187): Reviving Flame is a discard-only, source-UID-specific Ability. Bench placement and suppression are checked before action; choose zero to four Basic Energy from actual discarded cards and the hybrid Basic Energy discard ledger; Special Energy is excluded. Always end the turn, including when no Energy is recovered. Rainbow Burn counts distinct Basic types rather than units or Special Energy. Discard UI and CPU handle the new action.
- Leafy Camo Poncho (160/214): shared opposing-Supporter protection at the target and legacy resolution boundaries, restricted to current VSTAR/VMAX holders and active Tool effects. CPU avoids unrelated recipients.

All previous 203 playable definitions are preserved. Regidrago VSTAR remains gated pending discard-attack copying (including borrowed staged payments and once-per-game Powers); Amoonguss, Dragapult and the two Seal Stones remain gated. Android APK and device validation are separate.
