# Celebrations main-set completion — v0.69.522

All 25 main-set prints are enabled; the 25-card Classic Collection (cel25c) remains a separate integration. Four new attacks reuse the current engine's selection, counter, damage and Energy handlers:
- Aqua Storm counts physical Energy cards in the top five (or remaining deck if shorter), discards that exact window and damages two distinct opposing Bench slots, without damaging the Active. It uses the existing bench protection/damage pipeline.
- Breath of Life selects at most three different basic Energy types, with optional stop and repeated recipient allowed. Classic Zone searches retain their existing per-attempt coin gate and each selected type is attempted once; physical Basic Energy searches consume the physical ref. No Special Energy is eligible.
- Lunar Pain doubles each opposing Pokemon's existing counters, bypassing Weakness/Resistance and ordinary damage modifiers while observing counter/effect protections.
- Cry of Destruction lets the attacker select up to three physical opposing Special Energy cards, including multiple from one Pokemon, and stop early. It reuses the existing Energy discard protections and reactions. CPU chooses non-skip and prefers the opposing Active.

The offline release gate requires zero gated CEL25 prints. Canonical source unchanged. Classic Collection distinct IDs (four prints numbered 15), original weakness/resistance values, historical reprint semantics and independent main-set audit remain follow-up. Android compilation and physical device testing are separate checks.

## Classic Collection candidate inventory (not an implementation claim)

A read-only scan of the current playable catalogue found these historical candidates with matching names, HP and attack names. Exact effects, printed metadata, alias-dependent hooks and original mechanics still need verification before reprints become playable. Canonical Classic Collection blob: `3de4dd54bb073113773f4797d3bb13f23c311038` (pinned source commit as above).

| Classic Collection ID | Historical candidate / next action |
|---|---|
| cel25c-2_A | base1-2 |
| cel25c-4_A | base1-4 |
| cel25c-15_A1 | base1-15 |
| cel25c-15_A2 | base5-15 is gated; do not copy later Supporter reprints |
| cel25c-15_A3 | gym2-15 |
| cel25c-15_A4 | dp4-15 |
| cel25c-73_A | Imposter Professor Oak: no exact active catalogue match found |
| cel25c-8_A | base5-8 is gated |
| cel25c-24_A | Birthday Pikachu: no exact active catalogue match found |
| cel25c-20_A | neo1-20 (Baby rule; not later HGSS Basic) |
| cel25c-66_A | neo3-66 |
| cel25c-9_A | ex4-9 |
| cel25c-86_A | ex7-86 |
| cel25c-88_A | ex12-88 |
| cel25c-93_A | ex15-93 |
| cel25c-17_A | Umbreon Star: no exact active catalogue match found; ex11-17 is a different card |
| cel25c-109_A | pl2-109 |
| cel25c-145_A | pl3-145 |
| cel25c-107_A | hgss1-107 |
| cel25c-113_A | bw1-113 (or equivalent bw1-26; verify full text) |
| cel25c-114_A | bw1-114 (or equivalent bw1-47; verify full text) |
| cel25c-54_A | bw4-54 |
| cel25c-97_A | Xerneas-EX: no exact active catalogue match found |
| cel25c-76_A | M Rayquaza-EX: no exact active catalogue match found; preserve Delta Evolution |
| cel25c-60_A | sm2-60 |

The four number-15 image keys are `15_A`, `15_B`, `15_C`, `15_D`, respectively; upstream gameplay IDs use `15_A1` through `15_A4`. Keep distinct image keys, gameplay IDs and displayed collector numbers. Do not enable the reprints based solely on this inventory.
