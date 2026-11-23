# LuckyDex Classic: Global Basic Energy Deck-Search Coin Rule

**Date:** 23 November 2026  
**Base app version:** `0.69.401` / versionCode `7401` (no bump)  
**Patch type:** Source-relative combined overlay, retaining all prior attack hotfixes.

## Why

Classic LuckyDex uses a finite ordered Energy Zone in place of the ordinary TCG Basic Energy cards in the draw deck. Many older effects that print “Search your deck for a basic Energy card” previously translated into a guaranteed Zone take. On Energy-dense hybrid decks this became far stronger than intended.

## New game rule

For **each** Basic Energy that an effect would obtain from the **Energy Zone** as the replacement for a **printed deck search**, roll one fair coin:

- **Heads:** Take and use one eligible actual Basic Energy unit from the Zone.
- **Tails:** Nothing is obtained on that attempt; leave the unit in place.
- Multi-Energy searches get independent attempts, including after tails; never fabricate Energy.
- If no eligible Energy is present in the Zone, the effect cannot obtain one.

The normal TCG card wording can stay as printed. This is an intentional **LuckyDex-specific hybrid balance change**.

## Strict exclusions

No additional coin gate applies to truly physical Basic Energy in a deck, Energy retrieval **from discard**, attaching Energy from hand, normal turn attachments, Energy moves, or “look at the top N cards” effects (Max Elixir, Electric Generator, Serene Grace, etc.). Ampharos-EX **Thunder Rod** is an independent special case, still four coins for the top four eligible units, not eight flips.

## Implementation

`app/src/main/assets/tcgp-battle-effects.js` detects printed Basic/typed Energy deck searches using the originating card's printed text and matched effect rule. `neoSupplyTake` and the index-preserving `neoSupplyTakeAt` are the shared Zone consumption gate; print-specific effects must also call one of those helpers. Choice continuations preserve the original printed card/effect identity. Direct Zone mutations that bypass the helper were routed through it in affected older sets, including BW Energy Search, Victini-EX Turbo Energize and XY10 Rotom Energy Extract.

## Checks

`tests/v07404-basic-energy-search-coins.test.cjs` covers independent heads/tails, unchanged ordinary attachments and discard recovery, a four-request sequence, Diamond & Pearl Synthesis, EX Ruby Skitty, BW Energy Search (two eras), Victini-EX Turbo Energize continuing after tails, Rotom Energy Extract, and a real battle legal-actions/effectChoice trainer test. This test is included in Gradle XY7/XY11 audits and XY11 source/full preflights. Source-only XY11 preflight passed **98/98 tests**. The wider historic suite and GitHub APK build are not certified by that run; validate the complete APK workflow after pushing.

## Installing

Extract the supplied combined ZIP at the root of the Termux repository with `-d source` then commit and push. The archive is designed to supersede the earlier v0.69.401 combined patch; do not install multiple variants in the wrong order.
