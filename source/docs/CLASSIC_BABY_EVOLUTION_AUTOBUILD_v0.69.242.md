# LuckyDex v0.69.242 — Baby Evolution deck coherency

## Reproduction
Test Lab → Classic Auto build → Psychic / Secret Wonders: Smoochum can be featured with 4 copies while its Basic evolution target Jynx is absent.

## Root cause
Standard evolution checking follows `evolvesFrom`, but Baby Evolution is a printed Power to put a **Basic** from the hand onto another **Basic**. This makes normal Stage 1/Stage 2 completeness checks miss the dependency.

## Fix
- An explicit, shared Baby Evolution family map for older and DP/DP2/DP3 prints, applied only to cards that actually have the Baby Evolution Power.
- Feature/roster eligibility requires an owned, playable matching target in the selected set/Energy constraints.
- A featured Baby reserves its target before filler; a four-copy Smoochum core adds two Jynx when available.
- Generic filler cannot insert an orphan Baby. Saved-deck Fill/repair pairs a Baby if able or leaves it out if the target is unowned.
- Both Test Lab and CPU opponent auto-builds use this same Classic builder.
- Explicit Baby evolution requirements do not change manual deck legality.

## Automated checks
`node --test source/tests/v07242-classic-baby-evolution-deck-coherence.test.cjs`
Tests single-set Psychic Smoochum/Jynx, 110 rotating builds, missing ownership, saved deck repair and older baby lines. Device QA has not been performed.
