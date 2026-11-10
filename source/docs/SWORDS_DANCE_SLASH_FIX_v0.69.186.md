# LuckyDex v0.69.186 — Swords Dance / next-turn Slash boost

**Reported:** EX Deoxys Ninjask's Swords Dance did not increase Slash damage in battle or in preview. Similar older-card previews were misleading.

**Root cause:** `tcg-classic-deoxys.js` constructed `noop` for every attack with empty printed effect text, including ex8-13 Slash. The shared EX Deoxys resolver already had the 80-base-damage check but was never called. Separately, `attackDamagePreview` did not include `nextAttackBonuses`, although actual Classic damage calculation did.

**Changes:**
- ex8-13 Slash routes through its existing EX Deoxys damage resolver so an active Swords Dance yields 80 base damage next turn, before Weakness/Resistance.
- Shared action damage preview includes next-turn named-attack bonuses, as well as pre-existing common damage modifiers and stacked bonuses, without changing the card's printed text.
- No change to Energy, Prize, attachment or deckbuilding mechanics.
- Source version updated from v0.69.185 to v0.69.186, with `docs/LUCKYDEX_MASTER_RULES.txt` revision 1.1 (C-ATTACK-001).

**Tests:** `node --test tests/v07186-swords-dance-damage-preview.test.cjs`
- EX Deoxys Ninjask: 30 -> 80 (preview and damage)
- Jungle Scyther holo and non-holo: 30 -> 60 (preview and damage)
- EX Sandstorm Vigoroth Focus Energy: 40 -> 90 (preview and damage)
- Buff applied to base before Weakness (80 -> 160 versus a Grass-weak Pokémon)
- Buff expires if Slash is not used on the following turn
- CPU side uses the same semantics

**Manual QA recommended:** Use Swords Dance, end the CPU turn, open Ninjask's attack actions and verify `Slash 80 DMG` before attacking; confirm 80 actual neutral damage. Repeat with Jungle Scyther.
