# v0.67.0 — Adventure world overhaul foundations

- Brought Johto and Hoenn Adventure presentation up to the Kanto model with named canonical location scene mappings and regional maps, while retaining local fallback art when canonical images cannot load.
- Added a reusable Adventure location-activity framework so routes and landmarks can host real interactions without replacing the existing journey, battle, checkpoint or reward systems.
- Added the first activity, **Fishing**: Old/Good/Super Rod progression, two-stage casting, bite reaction, hold/release tension control, deterministic species/level selection and ordinary regional battle/capture handoff. Fishing records persist additively with existing saves.
- Reworked Wild Hunt into **Catch Chain v2** around a chosen local species. Known local Pokémon can be tracked, catches advance the chain, KOs preserve it without falsely counting as catches, untouched non-target leave is safe, and failed committed target encounters reset the active chain while preserving best-chain history.
- Target chains now expose capped, visible encounter-weight, clue, rare/item and target shiny bonuses. The old habitat chain remains preserved as legacy Field Guide history rather than being silently rewritten.
- Cleaned historical/generated repository clutter and normalized package, runtime and Android release identity to `0.67.0` / `6700` while preserving `com.example.luckydex` and the bundled LuckyDex development signer.
- Added focused migration, Fishing, regional-visual and Catch Chain v2 regressions plus deterministic stress coverage. Playwright browser verification remains environment-dependent and is reported separately when unavailable.

# v0.53.0 — Pikachu’s Beach Classic + DX

- Replaced the v0.52 Classic approximation with a deterministic Pokémon Yellow-derived surfing core using the documented 6000 HP / 24-section state flow, source-faithful speed and landing penalties, and original Radness scoring.
- Added a separate Super Surfing Pikachu DX mode using recovered local assets/audio from the supplied GameMaker build, with movement, tricks, rings, combat, HP pickups, Seaking/Lapras/Natu allies and Articuno/Zapdos/Moltres/Lugia/Wailord boss progression.
- Added portrait multi-touch controls, keyboard controls, pause-on-hide lifecycle handling, separate Classic/DX records, DX achievements and lossless v0.52 Classic record migration.
- Lucky Wave is shared across both modes with Off / Vanilla 2% / Test 25% / Always 100% Settings control and reserved-safe coin / dust / voucher / card / booster rewards.
- Android metadata: versionCode 5300 / versionName 0.53.0. Stable applicationId and signer are preserved.

# v0.29.2 — God Pack production polish

- Disabled the temporary 100% God Pack validation override; live odds are now 1/1,000.
- Simplified the God Pack reveal to the single title `GOD PACK`.
- Rebalanced Lucky Pack odds to 1/500 so the weaker event is more common than God Pack.
- Android update identity remains `com.example.luckydex`; versionCode 293 / versionName 0.29.2.

# v0.29.1 — God Pack test build

- Added a true God Pack event at production odds of 1/1,000, separate from the existing Lucky Pack event.
- This specific validation build forces normal Pack Shop openings to God Pack at 100% so the full experience can be inspected once.
- God Packs use only the chosen set's real top rarity pool, support TCG/TCGP/offline cached packs, and never mutate stored/excavated boosters.
- Added full-screen GOD PACK fanfare, persistent charged reveal styling, strong haptics, special summary treatment and lifetime Profile statistics.
- Android update identity remains `com.example.luckydex`; versionCode 292 / versionName 0.29.1.

# v0.29.0 — Pokémon Dash

- Added a dedicated **Pokémon Dash Race Course** to the Arcade world.
- Choose from your real caught Pokémon; shiny state, level, local sprite and bundled base Speed are preserved.
- Six-racer scrolling races with three lanes, hold-to-sprint stamina, lane interpolation, rocks, mud, speed pads and stamina pickups.
- Real Speed matters through a compressed curve rather than making slow Pokémon unwinnable; level provides only a small capped bonus.
- Five AI racers use the same stamina/effect rules and make imperfect hazard/boost decisions.
- Deterministic course seeds, readable hazard spacing, later-race density ramp and exact-once finish/reward handling.
- Background/recent-app switching pauses simulation instead of consuming hidden race time.
- Persistent races/wins/podiums/best-time/last-racer stats; placement rewards are 120/80/55/35/25/20 Lucky Coins.
- Android update identity remains `com.example.luckydex`; versionCode 291 / versionName 0.29.0 and permanent signing configuration are preserved.

## v0.27.4 — Persistent Ball Drop prizes + shared Arcade card reveals

- Poké Ball Drop is shortened to 11 peg rows on a 720×1004 internal canvas so the full reward row remains visible on portrait phones.
- Prize slots persist across balls; only a slot that is actually won rerolls. Untouched Card/Booster/coin/Mystery targets remain in place.
- Card prize slots preload and display the exact physical card artwork that will be granted.
- Ball Drop and Fossil Dig now feed committed card rewards into a shared end-of-run Arcade card-reveal stage with real artwork and multi-card navigation before the standard results summary.
- Existing Ball Drop reward odds, special pins, power-ups, main/rain ball sizes and full Poké Ball Rain reward eligibility are unchanged.
- Android metadata is `versionCode 274` / `versionName 0.27.4`; application ID, save identity and permanent signer are unchanged.

## v0.27.2 — Poké Ball Drop phone-control polish

- Main Ball Drop radius reduced to 26 while Rain balls remain 18.
- Direct tap/drag cabinet aiming replaces the small range slider.
- Power-ups persist for the full run, including collected state; only prize slots reroll per manual ball.
- Power-up placement uses randomized validated open pockets rather than a fixed centre fallback.
- Cabinet crop tightened to 720×1140 with full-ball clearance preserved above prize dividers.
- Event history moved above the board into a five-entry log; separate temporary top-right toasts also cap at five and expire.
- Neon cabinet/launch/pin/power-up/prize presentation is strengthened without changing v0.27.1 reward odds.
- Android metadata is `versionCode 272` / `versionName 0.27.2`; application ID, save identity and permanent signer are unchanged.

# LuckyDex

## v0.27.1 — Poké Ball Drop chaos-machine overhaul

- Poké Ball Drop now uses a tall 13-row phone-first board with a much longer fall path and compact controls.
- Each manual ball rerolls a seven-slot prize board with coins, Card, Booster and centre Mystery targets; Mystery can pay 100/250/500 coins, a random card, a random sealed booster or the 1000-coin jackpot.
- Runs now seed Pokémon-move special pins: Bounce, paired Warp, Sticky Web, Extreme Speed and Metronome.
- Mid-board pickups include +1 Ball, Poké Ball Rain, Lucky Egg ×2, Rare Candy slot upgrades and Master Boost reward upgrades. Poké Ball Rain releases five uncontrolled smaller balls and every rain ball can win the same full reward pool, including cards, boosters and Mystery.
- Ball Drop reuses the global physical-card and sealed-booster reward bridge, so card prizes enter the binder and booster prizes enter Sealed Packs.
- Android metadata is `versionCode 271` / `versionName 0.27.1`; application ID and permanent signer are unchanged.

## v0.27.0 — Trade artwork recovery consistency

- Link Trade thumbnails now escalate to the same shared exact-card artwork resolver used by the full-card modal after their ordinary image candidates fail.
- TCG Pocket trade cards retain exact source/set/collector-number/name identity during recovery; Shining Revelry Wugtrio ex #019 is the regression fixture.
- Successful recovery is cached into the live/persisted Trade market card so the placeholder does not return on rerender/restart.
- Android metadata is `versionCode 270` / `versionName 0.27.0`; package ID and permanent signer are unchanged.

## v0.24.8 — Promo economy + promo-list cleanup

- Promo Vault purchase prices and Dust Exchange salvage values now use one shared promo-quality classifier.
- Standard promos are 350/100 Dust (buy/salvage), EX/GX/V/BREAK/Lv.X 600/175, VMAX/VSTAR/V-UNION/TAG TEAM/Radiant/Shining 900/275, and premium Gold/Hyper/Rainbow/Special Illustration/Secret/Crown promos 1300/450.
- Achievement Reward cards remain non-convertible.
- `Miscellaneous` is hidden from Promo Vault and Trade because its Ancient Mew content is achievement-only. Other promo sets remain visible when they contain usable cards, and future empty promo buckets self-remove after loading.
- Trade market state is versioned again so stale listings from now-hidden buckets regenerate.
- Android metadata is `versionCode 248` / `versionName 0.24.8`; application ID and permanent signer are unchanged.


## v0.20.0 — Authentic Arcade rebuild

This release replaces the v0.19 generated Arcade presentation with source-game imagery/assets and fixes the portrait-phone geometry issues reported after v0.19.1. The world navigator is transform-driven (`overflow: hidden`) so no native horizontal scrollbar overlays venue art. Retail-derived games use fixed source aspect-ratio frames and their initial Start/New Game control is kept inside the frame.

Authentic Arcade art is fetched and validated by `scripts/fetch_arcade_v0200_assets.py` during GitHub Actions **before** Gradle, then packaged into the APK for offline runtime use. The build fails if a required image cannot be fetched; it does not fall back to the generated v0.19 venue art. Exact sources are documented in `app/src/main/assets/arcade/authentic-v0200/ASSET_SOURCES.md`.

# Lucky Dex v0.19.1 — Arcade Fidelity Startup Hotfix

v0.19.1 retains the v0.19.0 Arcade fidelity rebuild and fixes a startup regression that could leave PRESS TO START inert.

The underlying fidelity pass rebuilds the Arcade around the visual composition and play rhythm of the Pokémon minigames that inspired it, while preserving LuckyDex save/reward ownership underneath.

- The Arcade world is now a viewport-scale illustrated route rather than narrow zone strips. Stops use purpose-built local pixel-art scenes and retain World → Venue → Game navigation with the same selected-location back behavior.
- Berry Picker now follows the Pokémon-Amie composition: one large berry tree above the requesting Pokémon, 60-second Easy/Normal/Hard modes, and an Unlimited three-miss mode.
- Head It is time-driven with 1/2/3 active Pokémon by difficulty, slow/fast yarn variants, combo Fever and the large final bonus yarn. Unlimited ends at three misses.
- Tile Puzzle is no longer a sliding-empty-space puzzle. It is a moving-picture swap puzzle using every tile: 4×5 / 5×6 / 6×8.
- Voltorb Flip now has a proper memo layer for Voltorb / 1 / 2 / 3 marks and a tighter HGSS-style board/clue layout.
- Berry Blender keeps the existing continuous Hoenn-derived timing/RPM engine and is presented as a four-station blender rather than a generic timing panel.
- Clefairy is rebuilt as a Stadium-style classroom memory game with teacher sequence, four pupils, five-hit limit and hammer feedback.
- Fossil Excavation is rebuilt as a layered Underground mining wall with pickaxe/hammer footprints, buried finds, metal obstructions and wall stability.
- Poké Ball Drop, Unown Decoder and Who's That Pokémon? keep their established mechanics but now receive stronger cabinet/chamber/interstitial presentation.
- v0.18 shared exact-reward/session handling remains the single reward path; no Arcade entry fee, energy, ads or real-money gate is added.
- Android identity/signing is unchanged. v0.19.1 is `versionCode 201`; GitHub Actions remains the authoritative APK compile/device-build check.

## v0.18.0 — Arcade World Rework

v0.18.0 replaces the prototype-style Arcade zone list with a continuous horizontally navigable world of eight illustrated venues. Every game now opens through World → Venue → Game and finishes with a compact shared session/result flow that shows the actual awarded reward.

- Kalos Amie Garden now contains the rebuilt Berry Picker, Head It and Tile Puzzle experiences. Berry Picker is scene-first with trees, thought bubbles and local reactions; Head It uses continuous RAF-driven yarn motion and finite ball sets; Tile Puzzle uses one coherent square image with adjacent tap/swipe movement and a completed-image reveal.
- Poké Ball Drop is exactly three balls per run. Balls 1–2 auto-ready, ball 3 ends in an explicit results sheet, and landing feedback shows the actual incremental coin delta. The ordinary 6% / 90-coin cap and separate 1000-coin jackpot remain unchanged.
- Voltorb Flip, Berry Blender, Clefairy Match, Fossil Excavation, Unown Decoder and Who's That Pokémon? retain their established mechanics but now use the shared run/reward/result/navigation contract.
- Ditto Transform is retired from visible Arcade navigation in v0.18.0. Existing Ditto save fields are preserved for upgrade compatibility.
- Arcade remains unlimited-play: no entry fee, energy, ticket timer, ads or real-money gate.
- Android package/signing identity is unchanged; v0.18.0 is `versionCode 190`. GitHub Actions remains the authoritative Android compile check.

# Lucky Dex v0.16.8 — Marketplace & Arcade refinement

v0.16.8 refines the v0.16.7 content pass from real play feedback.

- Link Trade now builds a 15-listing random marketplace from discovered sets. The normal board shows five featured trades; ownership filters/search reveal matching listings from the wider market rather than filtering only those five. Offers and requests do not need to be cards already owned.
- Trade state is versioned so stale v0.16.7 ownership-biased boards are regenerated automatically.
- Trade confirmation is now a LuckyDex Global Link Trade sheet showing both cards, owned quantities and a dedicated last-copy warning; the browser/WebView confirm popup is no longer used for trades.
- Pokéball Drop uses a circular rigid-body style simulation with pin collision response, tangential friction/spin, visible rotation, slot walls and a resting landing state. Slots now have explicit point values plus a pin-hit bonus and on-screen score breakdown.
- Unown Decoder has Easy (hints, 14 s, four choices) and Hard (no hints, 8 s, six choices). Each word is rendered as its own non-wrapping glyph row, so DRAGONITE stays on one line while true multi-word answers such as MASTER BALL can use separate lines.
- Safari Zone is removed from the Arcade picker and reserved for the future roguelite/catching mode.

# Lucky Dex v0.16.7 — Arcade, Binder & Trade polish

v0.16.7 builds on the validated v0.16.6 deterministic-card-art release. It adds Super Hard + Endless Who's That Pokémon?, Poké Ball Drop, Unown Decoder and Safari Zone; fixes Voltorb Flip's stretched hidden-tile icon; and improves Card Binder / Link Trade presentation and duplicate handling.

Key UI changes:
- Physical card artwork is fitted with `object-fit: contain` at the real 245:342 card ratio instead of being cropped.
- Card Binder has visible All / Spare Copies / Rare Hits shortcuts while retaining the existing filter + per-set selector.
- Technical-looking file/path/provider strings are sanitized out of human-facing card labels.
- Link Trade shows `OWNED ×N` on both offered and requested cards, and can filter to trades you can make or trades using spare copies only.
- Trade cards use the real portrait aspect ratio rather than fixed-height image boxes.

Arcade additions:
- Who's That Pokémon? Super Hard: six choices, no hints, cropped/rotated silhouette, 4.2-second timer.
- Who's That Pokémon? Endless: one miss ends the run; timer shrinks by 0.22s after each correct answer to a 2.5s floor.
- Poké Ball Drop: three-ball Celadon prize-machine physics round.
- Unown Decoder: five timed Ruins of Alph messages.
- Safari Zone: six encounters using Ball / Bait / Rock / Wait choices.

# Lucky Dex v0.16.6 — Deterministic Card Art Library

v0.16.6 replaces physical-TCG runtime artwork guessing with a validated LuckyDex artwork index built from the same metadata snapshot that produced the 21,337-card / 199-set library build.

- physical set browsing now prefers `card-art-index.json`, generated by `.github/workflows/build-card-art-index.yml` from pinned metadata commit `18e0de2feb7a35ebe4296ede0ba6cc768961489b`
- every indexed card carries an exact set key, collector number, normalized name and validated source image URL; ambiguous matches return missing instead of substituting another print
- existing binder cards can be repaired through an exact set-name + number + name match, so the deterministic resolver applies across the collection as well as new packs
- new physical packs are built from the exact index catalogue rather than TCGdex detail lookups; Pokémon TCG Pocket remains on its dedicated Pocket data path
- the validated special handling is preserved for all 48 My First Battle print identities and all 12 French McDonald's Collection 2013 cards
- a native Android set-pack installer/cache is included for future fully-offline artwork packs, with checksum validation, ZIP-slip protection and exact manifest lookup
- legacy TCGdex / PokémonTCG / Scrydex resolution remains only as a guarded transition fallback when the LuckyDex index is unavailable
- save compatibility is preserved: a new exact-library pull can merge with a unique legacy owned card identity rather than creating a duplicate simply because the catalogue ID changed

## Previous release notes

## v0.16.4 — Card Identity & Berry Target Fix

This hotfix replaces v0.16.3's unsafe collector-number artwork guessing with identity-verified card art resolution.

- pack reveals no longer infer a physical card image from a set code plus the local card number; this was the cause of names such as **Erika's Jigglypuff** being paired with unrelated **Fuecoco ex** artwork
- cross-catalogue set matching now requires an exact set ID, exact code, or exact normalized set name before card artwork is accepted
- 30th Classic Collection uses its explicit 30-card identity bridge (for example Erika's Jigglypuff -> `me55c-69`)
- McDonald's Collection 2023 has a verified 15-card number/name bridge (for example Sandaconda #10 -> `mcd23-10`) so those cards no longer fall back to LOCAL CARD PREVIEW
- other missing physical art can fall back to an exact-set, exact-name Scrydex lookup; failed identity matching leaves a placeholder rather than showing the wrong card
- the one-time v0.16.4 migration invalidates cross-catalogue artwork saved by v0.16.3 and starts a fresh offline-art database, preventing previously cached mismatches from surviving the update
- Berry Blender's GOOD/BEST arcs still come from the scoring constants, but the floating TAP ZONE pill has been replaced by a small fixed notch at the exact midpoint of the real scoring window



This build moves Pokémon TCG Pocket pack data away from the lagging TCGdex Pocket feed and onto a dedicated, current Pocket catalogue.

- all current Pocket expansions are available through B4b Deluxe Pack: Mega
- Paldean Wonders and other Pocket cards use deterministic real artwork URLs instead of LOCAL CARD PREVIEW
- Pocket card IDs stay compatible with the existing TCGdex-style `SET-###` IDs to avoid duplicate collection entries
- Pocket rarity codes are translated to Lucky Dex rarity labels for pack balance and reveal effects
- Deluxe Pack: ex and Deluxe Pack: Mega use their 4-card format with a Four Diamond+ guaranteed hit
- card artwork has multiple fallbacks and remains eligible for the existing offline image cache
- physical Pokémon TCG data and all v0.15.4 reveal fixes are preserved

## v0.16.3

- Physical TCG artwork now has a deterministic current-set fallback using the printed set code and collector number, so newly released sets/promos no longer depend on every upstream catalogue updating at the same time. The fix is shared by pack reveals, binder/modal rendering and Trade.
- Pokémon TCG alternate-set matching now prefers exact set IDs/codes before fuzzy name matching, reducing wrong/missing artwork on similarly named sets.
- Berry Blender's highlighted GOOD/BEST arcs are generated from the same timing constants as scoring; the TAP ZONE label is centred on the actual window, and the blender itself can be tapped as the A input.
- Trade now uses the app's internal scroll layout (so accept controls cannot disappear behind the bottom navigation), has a tighter mobile layout, and attempts to fill all five trainer slots when the discovered card pool permits.
- Trade collection changes are committed before the exchange animation, accept buttons lock during processing, and the animation is presentation-only, preventing interrupted animations from losing a completed trade.

## v0.16.0

- Rebuilt Berry Blender around the actual Generation III Emerald mechanics: 7.03 RPM minimum speed, retail Best/Good/Miss timing windows, 4-player speed divisors, high-speed behavior, passive slowdown, progress growth, NPC timing profiles, and retail-style spin-down.
- New Lilycove Contest Hall presentation with four stations (YOU / MISTER / LADDIE / LASSIE), GBA-style progress bar, live RPM display, ◎ / ○ / × feedback, high-RPM shake, hit particles, and 3-2-1-START countdown.
- Player can press repeatedly just like the original; mistimed presses now genuinely slow the machine rather than being ignored.
- Results now show placement, Best/Good/Miss counts, maximum RPM and blend time while retaining Lucky Dex Arcade rewards.

## v0.15.9
Fixed a startup-order TDZ crash that was aborting initialization and making Starter, Wild Search, Expeditions and pack-set loading appear frozen. Android version metadata is now 0.15.8 / code 158.


## v0.16.2

- Trade cards now include a prominent full-width ACCEPT TRADE action.
- Simulated trainers can request any card from a set the player has opened, not only cards already owned; unavailable requests are visible but cannot be accepted until owned.
- Completing a trade now plays a short exchange animation: the two cards cross with light streaks and sparkles, then the received card spins/flips into view.
- v0.16.1 Berry Blender target clarity and all existing systems are preserved.

## v0.16.1

- Berry Blender player target is now highlighted directly on the wheel: the full GOOD arc is gold, the central BEST slice is brighter, the marker pulses as the pointer enters the timing window, and the YOU station is visually distinct.
- Added a new Trade tab with a simulated Link Trade board.
- Five fake trainers refresh every four real-world hours (00:00 / 04:00 / 08:00 / 12:00 / 16:00 / 20:00 local time).
- Trade generation is discovery-safe: unopened sets never appear. Existing saves infer discovered sets from the binder, and discovered-set history persists after trades.
- Same Set and Across Sets modes are available, plus Physical / Pocket filtering and board search.
- Trainers normally request an equivalent rarity; occasional one-tier up/down bargains create good and bad deals.
- Requested cards always come from cards the player currently owns, with duplicates preferred when available. Trading the final copy requires confirmation.
- Accepted trades remove one requested copy and add the offered card to the binder; completed offers stay completed until the next clock refresh.


v0.16.6 adds Fossil Excavation, Ditto Shuffle, Who's That Pokémon?, and a Goldenrod-themed Voltorb Flip visual pass.


## v0.16.9 — Global Link Trade browser

- Rebuilt Trade filters as native LuckyDex controls: Featured, All, Can Trade, Spares; plus All/Physical/Pocket source chips and a single search field.
- The normal board shows 5 featured listings from a 24-listing four-hour marketplace. Search and filters browse the wider market.
- Physical TCG trade generation now uses the validated 21,337-card LuckyDex exact catalogue for opened sets. The old fallback that treated the player's binder as the whole set was removed.
- Offered and requested cards are independent of ownership. Ownership only affects READY/acceptance state.
- Marketplace state is versioned so old ownership-biased v0.16.8 boards regenerate automatically.


## v0.16.10 — trade empty-state + stable test signing
- Trade featured/live counts now reflect the actual current board. With no opened sets the UI shows 0 LIVE / 0 FEATURED rather than implying five offers exist.
- Intro copy now says up to five featured and explicitly notes that listings begin after a set is discovered.
- Android debug builds are signed with the bundled LuckyDex development keystore so future GitHub APKs share one certificate and can update in-place.
- The first v0.16.10 install still requires one final uninstall because earlier GitHub builds were signed with ephemeral runner debug certificates.

## v0.16.11 — trade reveal + async market race fix

- Keeps the permanent LuckyDex development signing key introduced in v0.16.10.
- Trade reveal no longer settles on a 540° 3D transform. Android WebView could render that reverse/mirrored; the card now flips edge-on, swaps to the front face, and settles upright.
- Slower Link Trade animation with a longer completed-card hold.
- All Trade views now await one shared async market build promise. Featured / All / Can Trade / Spares can no longer paint an empty board while the exact catalogue is still loading.
- The exact 21k-card catalogue is warmed in the background. If Trade is already open when it becomes ready, the same pending build completes automatically.
- Empty-state copy distinguishes no discovered sets from a discovered-set market that failed to load.


## v0.16.12 — strict trade modes + logical Link Trade reveal
- Same Set and Across Sets now mean exactly what their labels say; Across Sets never falls back to same-set listings.
- Across Sets requires at least two discovered sets and explains this when unavailable.
- Link Trade animation now visibly turns both cards to LuckyDex backs before the exchange, then reveals the received card from back to front after arrival.
- Removed ambiguous/mirrored resting rotations from the trade reveal and slowed the sequence for readability.
- Visible UI version label corrected to match Android metadata.
- Stable development signing from v0.16.10+ retained.

## v0.16.13 — arcade proportions + silent Link Trade animation

- Poké Ball Drop canvas now preserves its native 720×760 aspect ratio instead of stretching to fill spare vertical space.
- Prize-machine cabinet no longer flex-grows vertically; physics coordinates and scoring logic are unchanged.
- Link Trade animation no longer narrates intermediate actions such as turning, linking, or receiving.
- Trade result copy remains hidden during the exchange and appears only after the received card is revealed, with the final `Trade complete!` result.
- Stable LuckyDex development signing introduced in v0.16.10 is preserved for update installs.


## v0.17.0 — Arcade zones + Kalos Amie Garden

- Replaced the flat Arcade picker with four themed locations: **Kalos Amie Garden**, **Game Corner**, **Discovery District**, and **Performance Stage**. Games return to their owning zone, and zones return to the Arcade map.
- Added **Berry Picker** with Easy/Normal/Hard modes, caught-Pokémon customers, drag delivery, tap-select fallback, patience timers, combo scoring, and modest coin caps.
- Added **Head It** with Easy/Normal/Hard/Unlimited modes, caught-Pokémon lanes, Perfect/Good timing windows, escalating yarn speed, bonus yarn, combo scoring, and three-miss Unlimited runs.
- Added **Tile Puzzle** with 3×3/4×4/5×5 sliding-image modes. Puzzles are generated by legal moves from a solved board so every generated puzzle is solvable.
- Arcade play remains **free with no entry fee or energy gate**. Repeated play gives reduced Lucky Coin rewards rather than being blocked.
- Strong qualifying runs can claim one item bonus per game per local day. Berry Picker gives Berries, Head It gives Potions with limited Great Ball upgrades, and Tile Puzzle gives Poké Balls / a Great Ball on Hard. A second run the same day can still earn coins but not another item.
- Poké Ball Drop keeps the visible 150/250/400/1000/400/250/150 slot scores, but ordinary score now converts to coins at **6%**, with ordinary winnings capped at **90 Lucky Coins**. A true centre-slot jackpot separately adds exactly **1000 Lucky Coins**.
- **Ditto Shuffle is now Ditto Transform**: Ditto visibly transforms into collection Pokémon, transformed copies retain a Ditto-style dot face, candidates reposition, and later rounds hide two Ditto at once under a shrinking scan timer. Existing `bestDitto` progress and cash-out risk are preserved.
- Android metadata is `versionCode 180` / `versionName 0.17.0`; the stable LuckyDex development signing certificate from v0.16.10+ is unchanged.

## v0.25.3 — authoritative rarity + fullscreen museum + curated Tile Puzzle
- Added one normalized card rarity/finish model shared by pack reveals, collection labels, Dust, Rare Hits and trade matching.
- Printed rarity and foil finish are separate: e.g. Common Reverse Holo remains Common with a reverse-holo finish.
- Secret Rare is now a maximum-impact chase class with explicit Secret Rare presentation; Gold/Hyper/Crown Secret variants retain both classifications.
- Rebuilt Museum Collection as a true fullscreen landscape Oreburgh scene with overlay plaque controls and only the nine genuine display surfaces.
- Replaced active painterly mining stand-ins with coherent offline pixel-art item/fossil assets and nearest-neighbour rendering.
- Replaced Tile Puzzle's synthetic Pokémon/berry composites with a curated offline scene library while preserving the existing puzzle mechanics and rewards.
- Android metadata: versionCode 253 / versionName 0.25.3. Stable applicationId and permanent LuckyDex signer preserved.
