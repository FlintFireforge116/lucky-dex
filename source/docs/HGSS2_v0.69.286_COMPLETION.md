# LuckyDex v0.69.286 — HeartGold & SoulSilver: Unleashed completion

## Official collector record
The exact immutable Unleashed catalogue remains 96 distinct English printed cards (numbers 1–95 and secret Alph Lithograph TWO), from the source-locked compact data file `data/classic/hgss2-print-compact.json`. Original stats, HP, evolution stages, weaknesses/resistances, attacks, Poké-Power/Body classification, Energy costs, and rarities are retained. `scripts/build-hgss2.py` verifies the compact source hash and regenerates the bundled playable script. All 96 prints have executable mappings; no print is gated.

## Newly completed mechanics
- Jirachi Stardust Song is optional, flips three actual coins, and attaches selected Psychic Energy from the discard zone; Time Hollow chooses up to the number of attached Energy opposing evolved Pokémon and returns each highest evolution card to its owner's hand.
- Metagross Psychic Float grants free retreat on Psychic-attached Active Pokémon; Double Leg Hammer selects two distinct opposing Benched Pokémon.
- Mismagius Magical Trans, Politoed Leap Frog, Shaymin Celebration Wind, Blastoise Wash Out and Hydro Launcher, Floatzel Water Acceleration, Kingdra Stream Pump, Ninetales Heat Acceleration and Metang Energy Crane have explicit Energy/target choices. Transferred Energy does not become a fresh hand attachment; actual hand-attachment triggers retain their origin.
- Roserade Energy Signal triggers only on a matching Grass/Psychic attachment from hand. Onix Energy Healer responds to a hand attachment. Kingdra Prime Spray Splash puts a chosen counter on one opponent Pokémon; its Dragon Steam substitutes 20 base when the opponent controls a Fire Pokémon. Lanturn Prime Powerful Spark counts attached Energy **cards** and Underwater Dive changes Lanturn's type for the turn. Steelix Prime Perfect Metal blocks conditions only while its Body is effective, and Gaia Crush optionally discards Stadium. Crobat Prime Severe Poison places 4 Poison counters between turns; Tyranitar Darkness Howl spreads to non-Darkness targets.
- Entei & Raikou, Raikou & Suicune, and Suicune & Entei LEGEND pairs all enter from two physical halves, occupy one slot, and award two Prizes. Thunder Fall targets Pokémon with printed Poké-Powers on either board and discards its Energy. Torrent Blade returns two Water Energy cards and targets an opponent Bench Pokémon for 100. Both partner halves are kept matched by the CPU and manual deck validator.
- Cheerleader's Cheer lets the **opponent** choose the extra draw; Energy Returner, Engineer's Adjustments, Good Rod, Interviewer's Questions, Life Herb and Super Scoop Up use physical selections. Unleashed Rare Candy evolves a Basic directly to a printed Stage 1 **or** Stage 2, without changing legacy Stage 2-only rare Candy prints.

## Audit discipline
All 96 prints are battle-enabled. The new `v07286` completion suite is mandatory in GitHub's Gradle preBuild, together with the original `v07285` integrity/CPU suite and independent hgss2 smoke audit. Existing HGSS1, Arceus, Platinum and other Classic checks remain enabled. Dynamic APK version agreement is tested, never pinned to an older version. This is a local/source-level completion, not a claim that this release's APK build or mobile gameplay has succeeded before GitHub runs.

## Termux
User's preferred handoff is `cd ~/lucky-dex`, `unzip -o /sdcard/Download/LuckyDex_patch_v0.69.286_HGSS2_UNLEASHED_COMPLETION.zip -d source`, `git add source`, `git commit -m "LuckyDex v0.69.286 Unleashed completion"`, `git push origin main`.
