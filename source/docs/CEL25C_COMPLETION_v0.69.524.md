# Celebrations Classic Collection completion — v0.69.524

All 25 canonical prints are enabled; the 25-card Celebrations main set remains complete.

- Here Comes Team Rocket! (original Item) reveals both Prize areas for the remainder of the battle. Existing face-up Prize UI and selection are reused; replacement/additional Prizes remain visible. Face-down-only Prize triggers must not fire for revealed cards. The later Supporter reprint is not changed.
- Dark Gyarados: Final Beam is a single triggered Power on an opposing attack KO, disabled by Sleep, Confusion or Paralysis (not Poison or Burn). Heads deals 20 per attached Water Energy, applying the attacker's weakness/resistance. No attack bonus is applied to this Power. The historical original is not promoted by this release.
- Umbreon ★: optional Dark Ray chooses an opposing hidden hand position without exposing identities; CPU accepts. Feint Attack targets any opposing Pokémon for 30 ignoring Weakness, Resistance and defensive effects. The existing deck-wide Star restriction applies.
- Birthday Pikachu: the Classic home screen has an optional, match-only birthday declaration for either trainer (CPU is virtual). Default off; no birth date collected, saved or inferred; the declaration is consumed at match start. Birthday Surprise deals 30 normally, 80 only on a birthday with heads, 30 on tails. Both controllers use the same condition.

Testing: canonical identities and descriptors, 19 new focused cases (both controllers, repeat reveal, targeted attack, optional hidden discard, KO coin/status/weakness, birthday outcomes, CPU choice and Star cap). Independent cross-era audit and actual Android/WebView interaction testing remain separate. Pay special attention to Final Beam interactions with dynamic weakness/resistance modifiers in the audit: this implementation applies printed values, type overrides and the shared weakness guard, not every historical attack-only modifier.

Full offline preparation: 1960/1960 passed; Classic Collection 48/48; manifest tests 12/12.
