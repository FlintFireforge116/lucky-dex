# LuckyDex v0.69.285 — HeartGold & SoulSilver: Unleashed (hgss2), first pass

## Source and scope

- Next chronological Classic TCG expansion after HGSS Base; **96 distinct authentic English print identities** numbered 1–95, plus the `TWO` Alph Lithograph print.
- Printed identity, text, attack costs and damage notation, type, HP, weakness, resistance, and rarity are preserved in a locked offline source file `data/classic/hgss2-print-compact.json`.
- The offline build generator refuses to run if its locked-source SHA256 or the 96 collector numbers change.
- **66 printed cards battle-enabled; 30 gated** for honest mechanical parity. All 96 are present in the collection, and gated cards are excluded from the manual and CPU battle deck pools.
- All nine typed HGSS2-only CPU archetypes can create legal 30-card decks in the tested seeds; actual gameplay still requires phone testing.

## Functional mechanics integrated

- Three new paired LEGEND Pokémon: Entei & Raikou (90/91), Raikou & Suicune (92/93), and Suicune & Entei (94/95). The existing Classic two-half mechanic requires two matching physical print halves simultaneously in hand and puts them into one Bench slot. Two prizes are awarded on a LEGEND knockout; both halves are discarded. **Only 92/93 is battle-enabled at this stage**; the other pairs await their complex printed attack implementation.
- Fully mapped straightforward damage, coin flips, Special Conditions, Energy-based damage, retreat locks, targeted bench attacks, drawing, hand shuffling, named partners, and ordinary attached Energy discards. Both names and abilities are preserved for blocked cards.
- The unusual secret `TWO` Alph Lithograph has its printed shuffle-deck effect; the set's PlusPower is an end-of-own-turn attached Trainer, **not a permanent Pokémon Tool**.
- Unleashed Rare Candy is temporarily gated: its printed effect allows **both Stage 1 and Stage 2** targets from a Basic Pokémon, while the pre-existing engine only implements Stage 2 through this Trainer. Never silently omit the Stage 1 path.
- Preserve variable attack arithmetic: 20× means no fixed base hit, but Pupitar's **Rage** retains a base 20 plus 10 per damage counter. Add partner metadata for Minun/Plusle.

## Follow-up for full completion

Implement and independently exercise 30 gated prints. The biggest remaining mechanics are Jirachi's multi-Pokémon devolution and entrance trigger, multiple move/attachment Prime powers, specific discard/choice Trainers, Crobat's severe Poison, and the other two pairs' simultaneous/targeted LEGEND attacks. Don't mark a card fully supported without testing both sides' live action choices.

## Quality gates

Run `python3 scripts/build-hgss2.py`, `node --test tests/v07285-unleashed-stage1.test.cjs` and `node scripts/audit-classic-set.cjs --set hgss2 --smoke --no-write`. All three are Gradle preBuild/mergeAssets dependencies. Preserve prior hgss1, pl4, pl3 test suites and never hardcode an older release version inside a permanent test. GitHub APK build and phone gameplay are **not** claimed verified before the user pushes v0.69.285.

## Termux

The ZIP is unpacked relative to `source/` with `unzip -o`, followed by the user's regular `git add`, `git commit`, `git push`. No additional download, source generator, or manual command is necessary.
