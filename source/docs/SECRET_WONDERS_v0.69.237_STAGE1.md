# LuckyDex v0.69.237 — Diamond & Pearl: Secret Wonders / dp3, Stage 1

## Release status

- **132/132 collector-number identities registered** (120 Pokémon, 10 Trainers, 2 Special Energy).
- **46/132 battle enabled and deck eligible.** **86/132 deliberately gated** with `PARTIAL` support markers until the card effects and prerequisites can be implemented and tested. No blanket `FULL` flags.
- 194 printed attack names/costs and 45 named Poké-Powers/Bodies recorded. These **are not** 194 completed attacks or 45 implemented powers; gated cards currently retain explanatory placeholders for unimplemented text/effects.
- Live Classic selector, owned collection mapping, player/CPU builder pool, and JavaScript loading include `dp3`.
- Metal/Darkness Special Energy reprints (`dp3-130` / `dp3-129`) are recognized by the established cross-era bonus/reduction code.
- The app version is `0.69.237` (`versionCode` 7226).

## Selected implemented behaviour

- **Farfetch'd**: Swords Dance boosts the next Leek Slap, while Leek Slap's own once-next-turn restriction is attack-specific.
- **Shelgon**: Focus Energy boosts Protect Charge; Protect Charge reduces following incoming damage.
- **Bagon**: Rage scales with existing damage counters.
- **Lotad**: Water Sport compares actual attached Energy counts before damage.
- **Diglett**: Down Draw takes the **bottom** physical card rather than the top one, preserving deck order.
- **Psyduck**: Migraine's heads/tails confusion goes to the correct Pokémon; Delusion is conditional on being Confused.
- **Squirtle**: Aqua Tail rolls one coin per attached Water Energy; its Bubble can Paralyze.
- **Stantler**: Lead presents a genuine Supporter card selection from the deck.
- **Shuppet**: Gossip selects an opponent Pokémon and places counters rather than treating it as Weakness-boosted attack damage.
- Additional simple attacks, status conditions and direct Trainer reprints are enabled. The Trainer effects reuse existing `dp1`/`dp2` handlers where the printed rules match.

## Auditor result and QA evidence

Command: `node scripts/audit-classic-set.cjs --set dp3 --no-cpu --smoke`

- Catalog/effect/schema errors: **0**.
- Structural warnings: **1** — `dp3-33` Mothim's authentic evolution parent is generic “Burmy” while previous stages are named by cloak form; Mothim is **not enabled** and needs cross-cloak evolution logic.
- Synthetic attack/Trainer action paths: **158/158** complete across player and opponent, **0 skipped**. Does not prove printed correctness or device UI.
- Stage-specific tests: **13/13 passed**; selected older-set and auditor regression suites: **112/112 passed** as run for this patch before final documentation edits.
- The staged Secret Wonders catalog cannot yet build reliable set-only 30-card CPU decks across all eight Energy types, so **CPU set-only certification is deferred**. This is not being counted as a pass; mixed-set CPU choices remain supported where legal.
- An Android APK has **not** been built or exercised on a phone in this run.

## Next implementation pass

1. Add the remaining Trainer choices: Oak's Visit, Roseanne's Research and Team Galactic's Mars; confirm card identity, hand/deck placement and opponent-hidden-hand privacy.
2. Complete Powers and Bodies, including Prize/Knock Out interactions, conditional damage, triggered interruptions and Unown word combinations. Keep unimplemented cards gated until their actions and timings are correct.
3. Resolve the Burmy-cloak → Mothim naming/evolution rule and evolutionary deck builder synergies.
4. Complete the full 132-card implementation, test legal **Secret Wonders-only** CPU decks for each Energy type, and run independent printed text/effect and Android UI audits. Continue expanding the numbered audit ledger and master TXT.

**Important:** Stage 1 is a playable subset and infrastructure integration, not a complete Secret Wonders set. Do not use the 132/132 registration count as a battle-completion figure.
