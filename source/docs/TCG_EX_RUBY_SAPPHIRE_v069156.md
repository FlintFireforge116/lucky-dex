# LuckyDex v0.69.156 — EX Ruby & Sapphire (2003)

## Source and scope

- Official expansion identifier: `ex1` (EX Ruby & Sapphire, English, 18 June 2003).
- Reference: `PokemonTCG/pokemon-tcg-data` `cards/en/ex1.json` (109 numbered prints).
- Fully registered catalogue: **109/109** official card identities, names, rarity,
  stage, typing, HP, evolution families, retreat, Weakness, Resistance, attack names,
  Energy costs, damage labels, Pokémon-ex status and artwork URLs.
- **57/109** battle-ready / eligible for manual and CPU deck construction.
- **52/109** identified but *not* battle-ready; the catalogue's `support.reasons`
  names the first missing rule(s) for each card. `battleEnabled` is not implied by
  inclusion in the catalogue or schema acceptance alone.
- **8 Pokémon-ex** (#96–103) are modelled as Basic Pokémon that award **two Prize
  cards on KO**. This is tested by knocking out Electabuzz ex in an actual Classic
  battle and asserting two cards enter the attacker's hand from their Prize zone.
- Basic Energy (#104–109) is catalogued but cannot be selected for the 30-card
  draw deck: LuckyDex keeps the previously agreed separate Basic Energy Zone.
  Special Energy #93–95 remains gated pending correct hand, attachment and damage
  semantics.
- Player hand, deck, Bench and CPU pool rules are otherwise unchanged. The printed
  original format's **two-Active / Double Battle** mechanics still require a
  deliberate adaptation; do not silently treat those instructions as ordinary
  single-Active rules.

## Integrated into

- Classic TCG catalogue lookup (`ex1-1` through `ex1-109`), collection projection,
  legal card/deck checks, ownership, and player Card Test Lab via the shared pool.
- Manual deck editor, expansion filter, auto-builder set picker and CPU opposing
  deck filters; EX now appears as a separate collapsible chronological era.
- EX Ruby & Sapphire-only CPU deck generation for Grass, Fire, Water, Lightning,
  Fighting, Psychic, Darkness and Metal: each validated at 30 cards and legal.
- Card artwork uses the existing official `ex1` card URL pattern from the source
  dataset. It has **not** been locally bundled or device-verified; do not describe
  EX Ruby & Sapphire's card scans as working offline in this version.

## Newly available effect groups

- Exact coin-head attack damage, multicoins, and until-tails attacks.
- Paralysis, Poison, Sleep, Confusion, Burn; selected two-outcome flips.
- Energy and damage-counter scaling (including Pokémon-ex Energy Ball).
- Typed Energy discard, recoil, and simple self-healing.
- Selected deck cards moved to hand (the existing in-centre chooser).
- Multiple-target Bench damage and opponent-forced switches.
- Potion, Switch, Poké Ball, Pokémon Reversal, and Professor Birch.

## Important gates

- Delcatty Energy Draw, Gardevoir Psy Shadow, Blaziken Firestarter, Sceptile
  Energy Trans, Rough Skin, Natural Cure and other triggered/continuous Powers.
- Special Darkness, Metal, and Rainbow Energy; their printed damage/attachment
  interactions need core semantics, not only `{type:'specialEnergy'}` labels.
- Scyther ex Agility must block **both damage and other effects**. Damage-only
  prevention has intentionally not been marked fully supported.
- Mewtwo ex Energy Absorption must attach selected discarded Energy **directly**
  to Mewtwo, including Special Energy cards where legal.
- Basic Energy searches from a draw deck are *not* faked: LuckyDex Basics live
  in the separate Energy supply. Energy Search and Lady Outing remain gated.
- Any card with mandatory Double Battle wording, multi-target selection or
  turn/timing hooks not faithfully implemented remains excluded from CPU decks.

## Automated verification

- All 109 IDs, 8 Pokémon-ex, 2-Prize actual knockout, full 30-card legality.
- Player & CPU allowed-set selection; ownership mapping; selected attack coin paths;
  explicit type discard; sleep, poison and Bench damage; Energy-sensitive damage;
  search/pick actions; CPU-versus-CPU turn simulation.
- Previous-set and Delta Reign regression tests passed (final numbers in ZIP handoff).
- No Android device / APK visual test performed here.

## Next pass

- Complete Poké-Powers and Poké-Bodies first, followed by Special Energy and
  Trainer timing. Expand each group with exercised CPU and player interaction tests.
- Then complete the gated 52 cards and run a move-by-move audit before proceeding
  to **EX Sandstorm**.
