# LuckyDex v0.69.150 — Skyridge completion

Base: v0.69.149 Skyridge mechanics. This is an **incremental source patch** to apply at repository root; paths begin `source/`.

## Integration and compatibility

- **182/182 registered Skyridge prints are battle-enabled and deck-eligible**: 150 numbered and 32 Holo cards.
- Retains each card's original printed metadata, attacks, Poké-Powers/Bodies, stage/evolution, Energy costs and collector number.
- Keeps existing shared 30-card classic rules, separately generated Energy Zone, physical Special Energy cards, prize cards and current CPU/auto-builder set selector.
- No Codex changes.

## Mechanics finished in this patch

- Missing attacks, Powers and Trainers (including searches, status effects, board-state damage, multi-coin outcomes, attached-Energy movements, discard recovery, evolution triggers and hand/deck disruption).
- `Bounce Energy` return-to-hand selection, `Cyclone Energy` defender-chosen switch and optional `Retro Energy` devolution/healing.
- `Star Piece` evolves damaged Benched Pokémon between turns, **with the owner's choice of matching Evolution** rather than silently selecting the first card. Multiple eligible Star Pieces are processed one at a time.
- `Energy Jump` moves physical Special Energy cards as well as Basic Energy; `Aqua Trick` can relocate Special Energy while `Magnetic Lines` remains Basic-only.
- `Mystery Plate γ` selects an opposing Active or Benched Evolution and places the removed Evolution at the **bottom** of the opponent's deck.
- `Mystery Plate β`, `Miracle Sphere β`, `Flame Vapor`, `Energy Recharge`, `Hyper Potion` and other choice-based effects select the precise Energy card or type, not just an arbitrary first one.
- End-turn Tool expiry, attachment restrictions, Crystal Type and temporary immunity rules integrated in shared battle-core mechanisms.

## Validation

Run:

```bash
node --test source/tests/v0714*.test.cjs source/tests/v07150-skyridge-completion.test.cjs
```

Result: **128 passing, 0 failing** on the combined historical test suite. The new completion test covers 262 Pokémon attack entries × 2 deterministic coin paths (524 attack-path checks), all 182 cards' eligibility/effect schema, selected original-card behaviour, hand-attached Special Energy, turn transitions and four CPU battle simulations.

The separate fast audit dispatched all 269 Pokémon and Technical Machine attack entries without unknown-effect errors. Automated coverage is not a formal proof that every possible game-state interaction is correct. Android APK/device testing was not performed.

## Version

- Android versionName `0.69.150`, versionCode `7130`
- JavaScript marker `0.69.150`
- Both visible start-screen version labels `v0.69.150`
