# Steam Siege (XY11) independent stage audit — v0.69.391

This is an **incomplete expansion**, not a full-set gameplay audit sign-off.

## Independent source audit

- Official pinned set: 116 print numbers 1–116, 161 printed attacks, 18 printed Abilities, seven BREAK Pokémon and 12 dual-type printed variants.
- Stage 1 print rules compared against the pinned GitHub card list: **51/116 mapped battle-ready**, **65/116 gated**. This is a mapping comparison; the official generated-catalogue and Android APK have not been executed offline.
- Important unavailable cards: Volcanion-EX (Steam Up), Yanmega (Sonic Vision), Talonflame (Gale Wings), Magearna-EX (Mystic Heart), M Gardevoir-EX (Despair Ray), Klefki (Wonder Lock), Mega Boost Clawitzer and Ninja Boy.
- `xy11_verified` contains four *invalid descriptor prototypes* but all four are gated (Dwindling Wave, Giga Claw, Poison Enzyme, and original Proud Fang); those must never be ungated without fixing and testing their underlying interactions. Proud Fang's condition was normalized but its associated Giga Claw remains gated.
- Stage 1 source-only suite: five passes, two generated-catalogue tests correctly skipped. Prior-set XY10 preflight: 75/75 tests pass. No APK outcome confirmed.

## Newly verified reuses

- Ponyta Returning Flames: selectable two Basic Fire Energy from the **actual discard** (including the classic discard ledger), never the fresh Energy Zone.
- Amoonguss Strange Reaction: Paralysis only while the opponent's Active Pokémon is Confused.
- Mankey Focus Energy: next-own-turn +40 to *Flop* only, preserving its printed 50 base damage.
- Primeape Spirited Throw: +60 only if opponent's **remaining** HP exceeds Primeape's remaining HP.
- Aipom Fiddle Around: selectable reordering of physical top three cards of the opposing deck.

These lift the source-mapped playable count from **51/116 to 56/116**; **60 prints remain gated**, pending full generation and verification. The release contract now rejects playable coverage below 56 and specifically requires the newly verified card numbers. The updated source-only suite passes 12 checks and skips three tests that need generated official prints; the previous XY10 suite passes 75/75.

## Release tests and constraints

`python3 scripts/preflight-xy11-release.py --full` must generate the official pinned catalogue and execute both Steam Siege suites. **Do not push on source-only tests alone.** The GitHub Android build has not been confirmed.

## Next integration priorities

Steam Up; Mega Boost; Wonder Lock; Gale Wings; Chandelure Sinister Selection; two-gender Nidoking support; remaining Trainer mechanics (Ninja Boy, Ranger, Special Charge, Greedy Dice) and the remaining gated BREAK lines and their prerequisites. Continue reusing existing systems where the exact printed semantics match. Do not activate a partial Ability or approximate discard/retreat selection.
