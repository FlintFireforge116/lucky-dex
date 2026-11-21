# XY Primal Clash — independent audit (LuckyDex v0.69.352)

**Starting point:** v0.69.351, GitHub Actions build #640 succeeded. Official upstream XY5 remains fixed at 164 collector prints, 217 attack occurrences, 13 Ability occurrences, and 22 Ancient Trait occurrences. The generator rejects unsupported entries and verifies official source integrity.

## Coverage and outcomes

- The whole official set's attacks, Trainer rules, special Energy, and Ancient Traits were compared with the existing XY5 effect mapping and the staged tests. All 164 collector prints remain enabled; no fabricated source prints and no intentionally gated cards.
- **Fixed: Ω Barrier and Escape Rope.** When an opposing Item/Supporter tries to switch an Ω Barrier **Active** Pokémon, that Pokémon cannot be switched; Escape Rope still allows the player's own switch. When the opposing **Active is unprotected**, its controller can promote an Ω Barrier **Benched** Pokémon as the replacement. An opposing Trainer that directly chooses an Ω Barrier Bench target may not do so. The previous generic snapshot filtered protected incoming Bench slots too broadly and undid legitimate replacement switches.
- **Fixed: Excadrill #96 Straight Claw.** The UI's optional-discard choice said "20 damage" although the printed base attack is **60**. The corrected selection is 60 base, with +30 when an attached Energy is actually discarded.
- **Improved: autobuilder Spirit Link dependencies.** Reserve up to two owned, available copies of Aggron, Gardevoir, Groudon, or Kyogre Spirit Link before generic Trainer fillers when the corresponding Mega or Primal Evolution appears in the generated deck. Respect 30-card cap, user ownership, and set filtering; warn if matching Tools are unavailable. This is not a guarantee of 100% consistent draws.
- **Improved: Sceptile #8 Nurture and Heal and Torchic #26 Flare Bonus.** These effects need a **real Basic Energy card in hand**, not ordinary Energy Zone turn attachment. In LuckyDex Classic30, Basic Energy cards are forbidden from occupying deck slots. Where eligible/owned, reserve legal Energy Search/Cilan/other working Energy-to-hand Trainers, not Basic Energy deck entries; otherwise surface a clear warning about the limitation. Respect the live 8-card hand cap and Energy Zone's actual supply.
- Existing effects and rules reconfirmed with regression tests include Beedrill delayed KO, Camerupt-EX variable Fire Energy discard, Sharpedo-EX Hunt, Exp. Share transfer before KO, XY5 card choices, CPU attack option identity, attack timing, Trainer protection and exempt Stadium/Tool/attacks, old-set 30-card deck constraints.

## Test coverage

- New `tests/v07352-primal-clash-independent-audit.test.cjs`: Escape Rope with protected Active and protected Bench, opponent-controlled/defender-controlled Bench switch, Straight Claw label, Spirit Link and legal Energy-to-hand autobuilder integration checks.
- Full local Primal Clash set of 10 staged test files: **104 passed, 0 failed, 7 skipped** (skips require generated official catalogue, built at GitHub).
- Independent cross-era regression subset (global Energy audits, Energy Zone contract, general deck quality, Furious Fists, Phantom Forces): **37 passed, 0 failed, 4 skipped**.
- **Local Node tests are not equivalent to a GitHub APK build.** This patch requires the next Actions APK run, particularly its generated-catalogue tests. Do not claim APK success until run is green.

## Next steps

- Install with standard Termux ZIP-over-source flow; do not delete GitHub workflow runs.
- Validate resulting APK in Test Lab with two Escape Rope setups: Ω Barrier Active, and Ω Barrier Benched with unprotected Active. Then inspect fresh deck builds containing Mega/Primal Evolutions and check their Spirit Links.
- Broader long-term full-collection CPU/build sampling and every legacy Trainer's Ω Barrier interaction remain ongoing audit responsibilities; this report does not claim exhaustive execution of every historical card pair.
