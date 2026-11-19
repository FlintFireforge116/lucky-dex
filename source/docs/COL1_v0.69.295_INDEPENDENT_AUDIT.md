# LuckyDex v0.69.295 — Call of Legends independent audit

**Baseline:** v0.69.294 source patch applied over audited Triumphant v0.69.293. Card source remains immutable: 95 numbered plus 11 SL secret cards. The audit compared the source-pinned 106 printed rows to generated metadata, followed named effects through the actual shared resolver and inspected deck generation and CPU selection. The previous 16-card dedicated suite passed before these corrections; that green result alone did not verify all side effects.

## Corrected behaviours

1. **Tangela #72 Nutritional Support**: approved LuckyDex Basic Energy Zone exception is retained. Instead of creating a Grass Energy counter for free, a search now consumes the **first actual matching Grass entry** from the ordered Energy supply and updates the preview. If physical Basic Grass Energy has been shuffled into the draw deck too, the player chooses which source. A physical card stays in its deck until a valid target is chosen. No eligible Energy means no attachment; a printed attack may have zero effect.
2. **Lost Remover #80**: target picker now filters opposing Pokémon to those with attached physical Special Energy. A target with no such card can no longer be offered as a silently invalid choice.
3. **Pachirisu #18 Self-Generation**: the hand chooser filters to eligible Lightning-providing Energy rather than presenting all Energy cards and silently ignoring an off-type selection. Up-to-two and skip remain intact.
4. **Lost Zone card identity**: when attached Basic Energy is removed to Lost Zone, new canonical Call of Legends Basic Energy IDs (#88–#95) are used rather than unrelated expansion IDs, preserving the correct card type/visual identity.
5. **Deck-builder synergy**: generated decks with matching Darkness or Metal Pokémon reserve up to two physically owned special COL1 Darkness (#86) or Metal (#87) Energy prints before generic Trainers. This makes Steel Coat, special Metal damage reduction and special Darkness extra attack damage practical without altering the agreed Basic Energy Zone or 30-card deck size.

## Tests and constraints

- 106/106 printed cards enabled, 138 attacks mapped, 14 abilities named, 0 detected unsupported effect placeholders or invented noops on printed nontrivial attacks.
- Original 16 COL1 tests plus **9 added independent assertions** pass (25/25).
- Pooled HGSS and Call of Legends tests: **202/202 pass**, covering earlier sets' regressions as well.
- Independent Classic set auditor: **106/106 cards; 0 definite errors; 0 warnings; 0 review flags; 16/16 sampled CPU decks; 296/296 synthetic action smokes** with 0 skipped. Risk tags are not proof of all cross-set interactions; the audit report enumerates them.
- Additional CPU test: 108 generated type/seed decks with full evolution chains and legal 30-card construction, and correct Special Darkness/Metal payoff whenever the printed Pokémon types warrant it.

**Honoured game rules:** LuckyDex uses 30-card Classic decks plus an ordered Basic Energy Zone. Basic Energy cards are normally not in the starting 30. A type-specific Basic Energy *search* may use that ordered supply, but the queue entry must be consumed. Attacks/Powers that explicitly look at physical top-deck cards or require actual Energy *from hand* cannot substitute the Zone. In a COL1-only deck, Magmortar's Hard Crush may not reveal any physical Energy, and Pachirisu Self-Generation / Ninetales Roast Reveal may not have matching physical hand Energy; this is not silently bypassed.

**Verification boundary:** No Android APK was built or physically tested in this environment. GitHub Actions and phone gameplay remain to be checked. This patch must layer over v0.69.294.
