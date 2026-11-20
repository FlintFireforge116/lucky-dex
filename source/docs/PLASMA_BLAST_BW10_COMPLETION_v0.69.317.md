# LuckyDex v0.69.317 · Plasma Blast (BW10) completion pass

## Scope
Continues v0.69.316, using the user's pinned 105-print Plasma Blast catalogue and existing BW10 generator. The previous integration registered 105 collector prints, 139 attacks and 21 abilities, but the user's preparation output showed **76 battle-enabled** and **29 gated**. This patch removes **25 explicit gating reasons** after implementing or reusing corresponding rules. Four explicit high-risk gates remain; final battle-enabled count requires regeneration from the pinned 105-print source on GitHub.

## Newly implemented / corrected rules
- Tool Reversal: choose a physical Tool attached to one of your Pokémon and return that exact UID to hand.
- Lifesplosion: choose up to one Stage 2 from deck per attached Energy card, respecting Bench capacity, allow Done.
- Retribution: only triggers if an Escavalier was Knocked Out by damage from an opponent attack on their previous turn; moves all defending Energy to opponent hand, preserving Special UIDs.
- Psypower: choose how to distribute three damage counters among opposing Pokémon.
- Psyjamming: player selects physical Special Energy attached to opponent Pokémon and chooses a *different opposing Pokémon* for each transfer, with Done and no repeated transfer of the same UID.
- Plasma Transfer: Porygon-Z repeatedly moves a chosen physical Plasma Energy card to a different friendly Pokémon.
- Sinister Hand: Dusknoir repeatedly selects the opposing source and destination, moving exactly one damage counter each use.
- Prehistoric Call: discard-zone action for Lileep, Tirtouga, Archen places exact Restored ref on bottom of its owner's deck, once per turn per print. Visible action in player's discard overlay.
- Propagation: Exeggcute in discard returns itself to owner's hand, respecting eight-card hand cap. Visible action in discard overlay.
- Red Signal: optional targeted switch only after from-hand physical Plasma Energy attached to Genesect-EX.
- Stellar Guidance: searches for Supporter only if Jirachi-EX put onto Bench from hand.
- Breakwing: triggers on Salamence evolution from hand; removes all opponent's Tools.
- Cursed Glare: blocks from-hand Special Energy if Froslass is Active; Mental Shroud/Badge of Discipline and Drifting Balloon hook into battle calculations.
- Verdant Wind: immediate clear and protection from Special Conditions for teammates with attached Grass-providing Basic or Special Energy, while Virizion-EX's Ability is unsuppressed.
- Strike of the Champion: instant-KO effect respects opponent's prevent-effects protection, including Silver Mirror.
- CPU deck-building: Restored Lileep, Tirtouga, Archen require Root Fossil Lileep, Cover Fossil, Plume Fossil respectively. Fossil Items excluded as unrelated filler. Repeatable abilities don't present inert actions.

## Intentionally gated prints (not playable)
- **bw10-33 Eelektross — Crush and Burn:** exact multi-Pokémon Energy discard selection still pending.
- **bw10-41 Sigilyph — Toolbox:** four-Tool attachment and choice on Ability-loss pruning still pending.
- **bw10-86 Reversal Trigger:** exact knockout-triggered deck choice before prize resolution still pending.
- **bw10-95 Scoop Up Cyclone:** whole Pokémon stack plus all physical/counter Energy and attachments returned precisely still pending.

## Testing and distribution
- `tests/v07317-plasma-blast-completion.test.cjs` exercises physical source choices, discard Ability actions, triggered Abilities, status immunity and protection.
- `tests/v07316-plasma-blast.test.cjs` maintains all original BW10 checks and after generation validates the 105-print catalogue and explicit gate status.
- Gradle's `auditBW10ForApk` now runs both tests after `generateBW10ForApk`. No manual preparation is required before `git add` and `git push`.
- Some print-dependent tests are skipped locally because the pinned 105-print cache was generated on the user's Termux device, not in this working copy. The generated catalogue, actual CPU match decks, APK and Android UI remain subject to GitHub/device validation. Do not claim these as tested here.

## Installation
```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.317_BW10_COMPLETION.zip -d source
git add source
git commit -m "LuckyDex v0.69.317 Plasma Blast completion"
git push origin main
```
