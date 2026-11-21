# XY Ancient Origins Stage 4 — LuckyDex v0.69.366

## Scope

Finish the five new engine mechanics, covering six physical prints:

- Faded Town #73: between-turn checkup places 2 damage counters on each Mega Evolution Pokémon on both sides (including Bench). Its effect stops when the Stadium is replaced. The resulting damage counter placement is not an attack.
- Forest of Giant Plants #74: while Stadium is in play, Grass Pokémon can evolve on their first turn or the turn they enter play. Other Pokémon and non-evolution restrictions remain unchanged.
- Hex Maniac #75 and #75a: play a Supporter to disable all Pokémon Abilities on both sides through the end of the next opponent's turn. This includes newly played Pokémon and cards in discard where relevant. Does not suppress Ancient Traits (including θ Double). Both prints use the same game effect but retain their separate collectible identities.
- Dangerous Energy #82: real physical Special Energy; may attach only to a Darkness Pokémon, provides one Darkness unit, and places 2 counters on an attacking opposing Pokémon-EX when it damages its holder while that Pokémon is Active. Properly triggers even when the holder is Knocked Out; multiple copies stack.
- Flash Energy #83: real physical Special Energy; may attach only to a Lightning Pokémon, provides one Lightning unit, and removes the holder's Weakness while attached. Works for standard and eligible Bench damage calculations.

Restricted physical Special Energy moved to a host of the wrong type is discarded to the owner's physical discard. Deck builder only selects these two Special Energy cards in compatible decks and avoids Faded Town with its own Mega Evolution plan. All six prints are now battle-enabled by the verified XY7 generator.

## Testing

The eight Stage 4 direct tests cover first-turn/evolution exceptions, Stadium replacement, multi-target between-turn damage, Hex suppression on the board and in discard, attachment legality, weakness, retaliation and post-movement cleanup. The focus regression set additionally includes the previous Ancient Origins and Roaring Skies suites. The separate classic builder/energy regression selection has passed. Generated catalogue tests remain pending GitHub APK generation and this release is not a claim of device validation.

## Outstanding scope

Ancient Origins is **not finished** after Stage 4. Hoopa-EX, Faded Town unrelated interactions, and other unique attacks/Abilities or items remain to be evaluated before declaring 101/101 card completion. No unsupported print was made battle-ready by a placeholder.

## Termux handoff

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.366_ANCIENT_ORIGINS_STAGE4.zip -d source
git add source
git commit -m "LuckyDex v0.69.366 Ancient Origins Stage 4 rules"
git push origin main
```
