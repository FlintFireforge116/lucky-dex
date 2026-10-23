# LuckyDex TCG Pocket Battle — Vertical Slice Design

## Intent
Turn LuckyDex's TCG Pocket collection into a playable main-game system. The first release proves one complete Solo Battle loop without importing the entire card catalogue at once.

## Goals
- Build a deterministic Pocket-faithful rules engine in isolated modules.
- Let the player build a legal 20-card deck from battle-enabled Pocket cards they own.
- Recognise alternate artwork of the same gameplay card as the same deck-building card.
- Provide a playable Genetic Apex Beginner Solo battle against the canonical Ivysaur deck.
- Add a Beginner AI that makes legal, understandable decisions without cheating RNG.
- Record wins/losses and first-clear progression in the existing LuckyDex save.
- Ship first-open instructions and reusable help from the start.

## Non-goals for this slice
- Full Pocket card coverage.
- Intermediate/Advanced/Expert AI.
- Online multiplayer.
- Every Trainer, Ability, Special Condition or unusual card effect.
- Exact recreation of DeNA's proprietary AI implementation.

## Rules scope
The engine models: 20-card decks, max two copies by gameplay name, five-card opening hand with a guaranteed Basic, Active plus three Bench slots, Energy Zone, one Energy attachment per turn, evolution timing, retreat once per turn, attacks, +20 Weakness, one/two-point KO scoring, three points to win, and the 50-turn Solo limit. Running out of deck does not itself lose the game in Pocket.

The first supported effect primitives are direct damage, self-heal, draw/search-basic, evolution, retreat cost payment, and simple one-shot Trainer use. Unsupported cards are collection-valid but battle-disabled rather than approximated incorrectly.

## Data approach
LuckyDex keeps its existing collection records untouched. A separate local gameplay catalogue maps supported gameplay identities to HP, stage, type, Weakness, retreat cost, attacks and executable effect primitives. Gameplay identity uses canonical set/base card when known and falls back to set+normalised name so alternate art prints resolve to one playable card.

The first catalogue covers the Genetic Apex Beginner Ivysaur opponent deck and a wider small set of simple Genetic Apex cards suitable for player decks. Standard Battle Basics such as Poké Ball may be available as non-collection loaner support cards in the prototype so a player is not blocked by LuckyDex's current lack of Pocket shop/promotional acquisition.

## UI
Add a TCG Battle entry to the Card Shop page rather than creating another bottom navigation tab. It opens a full-screen subview with:
1. Solo Battle home / difficulty ladder (only Beginner unlocked in this slice).
2. Deck Builder showing owned battle-enabled cards and copy limits.
3. Battle board with opponent area, player Active/Bench, hand, Energy Zone, points, turn log and context actions.
4. Result screen with replay/back and first-clear reward.

Mobile is the primary layout. Critical actions remain fixed/visible and touch-friendly.

## AI
Beginner AI prioritises legal play over optimisation: bench Basics, evolve legal Pokémon, attach Energy toward the Active attack, use Poké Ball when useful, attack when possible, and promote a replacement after KO. It never sees hidden player cards or manipulates draws/coins.

## Save compatibility
Add `tcgpBattle` with safe defaults under the existing save. Existing cards and progression are untouched. New fields include saved decks, selected deck, battle stats, first-clears and help-seen state.

## Verification
Headless tests prove rules, deck legality, identity mapping, deterministic battle flow, KO/point victory, AI legality and save migration. UI tests verify entry/help/deck/battle/result wiring. Existing pack, binder and release tests remain green.
