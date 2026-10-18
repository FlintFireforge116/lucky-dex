LuckyDex v0.23.0 — ADVENTURE 2.0

Start from the supplied LuckyDex v0.22.3 source.

This is a major creative overhaul of:

Wild Pokémon hunting
Adventure destinations
Expeditions
Encounter presentation
Expedition progression
Adventure battle presentation

You have substantial creative freedom.

The objective is not to preserve the current Wild/Expedition UI.

The objective is to turn Adventure into one of LuckyDex's headline features: immersive, animated, tactile, replayable and recognisably Pokémon.

Do not touch Arcade unless required for shared navigation/stability.

Do not break Cards, Collection, Trade, Packs or existing saves.

Target:

versionName 0.23.0
versionCode 230
1. CURRENT SYSTEM — UNDERSTAND BEFORE REPLACING

The current source has:

Wild zones
meadow
cave
haunted
coast
volcano

Currently presented as small zone buttons followed by a generic search card and SEARCH <ZONE> button.

Expeditions
Viridian Trail
Mt. Moon Caverns
Lavender Haunted House
Seafoam Shore
Cinnabar Crater

Current expeditions are fixed arrays such as:

['battle','cache','trainer','rare','rest','battle','boss']

Current non-battle rooms are mostly text messages.

This functionality and its rewards provide useful underlying logic, but the presentation and route structure should be replaced.

Preserve relevant economy/save data, not the old UI.

2. CORE VISION

Adventure should feel like entering a separate Pokémon game mode.

The hierarchy should become:

Adventure Map
→ Destination
→ choose ROAM or EXPEDITION

Do not make Wild and Expeditions two unrelated menu cards anymore.

Each destination is a real place that can be explored casually through ROAM or tackled as a longer Expedition.

Suggested destination mapping:

Existing zone	Adventure destination
meadow	Viridian Wilds / Viridian Trail
cave	Mt. Moon
haunted	Lavender / Haunted House
coast	Seafoam Islands
volcano	Cinnabar Crater

Retain existing rank unlocks unless balancing suggests a small adjustment.

3. ADVENTURE MAP

Replace the current "Where to?" Wild/Expedition cards with a full-screen Adventure Map.

It should feel like selecting destinations in an actual Pokémon game.

Presentation

Use a real Pokémon-style map/background constructed from locally packaged game assets.

Prefer a coherent visual generation/era rather than mixing random screenshots.

The map should have:

connected travel path
destination landmarks
animated selection marker
player's current destination
subtle environmental animation
rank-locked destinations visible in the distance
completion/mastery indicators
destination names
small party display

Possible layout:

Viridian → Mt. Moon → Lavender → Seafoam → Cinnabar

It does not need to geographically reproduce Kanto perfectly.

It needs to feel like a deliberate game world.

Interaction

Tap a destination.

Camera smoothly pans/zooms or transitions into its location screen.

Do NOT:

use giant generic HTML cards
use emoji as primary location art
use browser-style carousels
expose horizontal scrollbars
use random screenshots containing existing game HUD
4. DESTINATION SCREENS

Each destination should have a living scene, not a menu page.

Example:

Viridian
trees gently sway
grass moves occasionally
small Pokémon silhouettes/sprites may briefly appear
leaves drift
butterflies/particles
route sign/building/tree assets
Mt. Moon
cave layers
dust motes
occasional Zubat silhouette
crystals/mineral sparkle
subtle light movement
Lavender
fog
drifting wisps
windows/lamps flicker
occasional Gastly/ghost shadow
desaturated atmosphere
Seafoam
animated water
waves/spray
distant Pokémon shadow
drifting snow/ice particles where appropriate
Cinnabar
heat haze
embers
lava glow
smoke
volcanic rock layers

Use CSS/Canvas animation where appropriate, but the main artwork must come from actual packaged game assets rather than CSS-painted blobs.

At the bottom of each destination:

ROAM
EXPEDITION

Also show compact:

species discovered
species caught
rare encounters found
expedition clear status
party

The environment should occupy most of the screen.

5. WILD ROAM — REPLACE THE SEARCH BUTTON

The Wild experience should no longer primarily be:

press SEARCH
wait 750 ms
random Pokémon appears

Replace it with interactive habitat exploration.

No joystick is required.

Do not build a fake open world.

Instead make it an animated scene containing discoverable hotspots.

6. WILD HOTSPOTS

Each biome generates contextual hotspots.

Examples:

Viridian
rustling grass
shaking bush
falling leaves
tree shadow
footprints
Mt. Moon
cave shadow
moving rocks
dust cloud
crystal sparkle
ceiling movement
Lavender
ghost wisp
moving curtain
shaking furniture
purple glow
mysterious footprint
Seafoam
water ripple
bubbles
moving shadow
ice crack
splash
Cinnabar
ember trail
rock movement
smoke puff
lava disturbance
heat shimmer

The player taps a hotspot.

Camera/environment responds.

Then the encounter is revealed.

7. HOTSPOT INFORMATION / RARITY CLUES

Hotspots should provide imperfect clues.

Examples:

ordinary rustling → common encounter
unusually violent movement → stronger Pokémon
glitter/sparkle → possible rare
unusual environmental cue → rare species
unmistakable golden/sparkling cue only AFTER triggering if shiny

Do not simply write:

RARE POKÉMON HERE

Let presentation create anticipation.

Rare encounters should feel exciting.

Shinies should have a dramatic reveal.

8. ROAM LOOP

Suggested loop:

enter destination
3–5 hotspots appear over time
choose one
reveal Pokémon
choose:
ENGAGE
LEAVE IT
battle/capture
return seamlessly to location
another hotspot emerges

Do not bounce back through multiple menu pages after every encounter.

The environment should remain the player's "home screen" while roaming.

9. FIELD CHAIN

Add a lightweight session mechanic.

While roaming a destination, successful encounters build:

FIELD CHAIN

Example:

Chain ×1 → ×2 → ×3 ...

Higher chain can provide SMALL bonuses to:

rare encounter chance
stronger level chance
item discovery chance

Do not make shiny odds absurd.

Leaving the destination can end the chain.

This gives the player a reason to stay and hunt without creating another permanent currency.

10. FIELD DISCOVERIES

Occasionally a hotspot should reveal something other than a Pokémon.

Examples:

Berry
Poké Ball
potion
coins
hidden cache
environmental interaction
short event

These should be quick.

Example:

Something glints beneath the leaves.

Tap.

Small item reveal animation.

Then return immediately to roaming.

11. AREA FIELD GUIDE / MASTERY

Each destination should show meaningful exploration progress.

Do NOT require a completely new economy.

Track simple statistics:

encounters
unique species seen
unique species caught
rare species found
shiny encounters
expedition clears
boss defeated

Use these to display Area Mastery.

Example:

VIRIDIAN WILDS
★★★★☆
23 species discovered
18 caught
2 rare discoveries
Expedition cleared

Mastery can unlock cosmetic/status markers and possibly modest encounter improvements.

Do not gate core gameplay behind tedious mastery grinding.

12. EXPEDITIONS — MAJOR REBUILD

Expeditions should become a small Pokémon roguelite run.

The existing fixed:

battle → cache → trainer → rare → rest → battle → boss

sequence should be replaced with a branching generated route.

13. BRANCHING EXPEDITION MAP

Generate a route when the Expedition begins.

Think Slay the Spire-style connectivity but presented as a Pokémon trail/map.

Example:

        Wild
       /    \
START — Cache — Trainer
       \    /
       Event
         |
       Camp
      /    \
   Rare   Elite
      \    /
       Boss

Not necessarily this exact shape.

Requirements:

visually connected path
2–3 route choices at meaningful points
player can see immediate choices
distant nodes can be partly obscured
boss clearly visible at destination
route is deterministic from a stored seed
active route survives app restart
14. EXPEDITION NODE TYPES

Include enough variety that runs do not feel identical.

Recommended:

Wild Encounter

Standard wild battle.

Rare Den

Higher rare-species chance.

Trainer

Stronger battle, good coin/XP reward.

Elite Trainer

Harder optional battle, premium reward.

Cache

Supplies / coins / temporary expedition perk.

Mystery

Unknown until entered.

Event

Interactive choice.

Camp

Heal/change party lead/manage run.

Hazard

Risk/reward environmental room.

Discovery

Rare item/lore/location moment.

Boss

Final encounter.

Do not force every run to contain every node.

Guarantee enough healing/support that reasonable runs are not unwinnable.

15. EVENTS MUST BECOME ACTUAL CHOICES

Current events are random text like:

You found coins.

Replace them with choices.

Example Viridian event:

A fallen tree blocks the safer trail.

Choices:

CLIMB OVER

chance of small damage
may find item

TAKE THE LONG WAY

safe
next encounter slightly stronger

SEND A FLYING POKÉMON

if party contains one
bypass + potential bonus

Examples should use:

Pokémon types
party composition
items
current HP
location context

This makes the Pokémon you've collected matter outside battle.

16. LOCATION-SPECIFIC EVENTS

Each Expedition should have bespoke events.

At least 5–8 possible events per location.

Examples:

Viridian
blocked path
lost Bug Catcher
hidden Berry grove
Beedrill nest
strange tracks
old Poké Ball cache
Mt. Moon
fossil wall
collapsing passage
Clefairy gathering
underground spring
trainer camp
strange mineral deposit
Lavender
flickering corridor
possessed object
lost spirit
sealed room
strange mirror
old medicine cabinet
Seafoam
strong current
cracked ice
frozen supply cache
submerged passage
resting Lapras
collapsing ice bridge
Cinnabar
lava vent
unstable rock
abandoned research equipment
heat exhaustion
Fire-type nest
volcanic cache

Do not make every event a wall of text.

Use artwork, sprites, effects and concise choices.

17. EXPEDITION PERKS

Add a SMALL roguelite perk system.

These are run-only.

Do not create another permanent currency.

Examples:

Explorer's Compass
Reveal one extra future node.

Potion Belt
Potions heal +15%.

Lucky Charm
Slight rare encounter increase.

Berry Satchel
Berries gain stronger catch boost.

Quick Claw
First attack of each battle deals bonus damage.

Field Medic
Camp healing improved.

Collector's Eye
Caches contain additional supplies.

The player can carry perhaps 3.

When offered another, choose which to keep.

Use proper item/icon artwork where available.

Keep effects easy to understand.

18. CAMP SCREEN

Camp should be an actual scene.

Not:

Team healed 50%.

Show the three Pokémon around a camp/fire/rest area.

Allow:

review HP
choose lead
use supplies
optionally heal
inspect expedition perks
view route ahead
continue

Camp should create a satisfying pause in the run.

19. PARTY MATTERS

Current persistent Expedition HP is good.

Keep that.

Improve party usefulness.

Outside battles, event options may depend on:

Pokémon type
speed
size/stat approximation where useful
Flying
Water
Fire
Psychic/Ghost
Rock/Ground
Grass

Do not require enormous bespoke ability tables.

A clean type-based capability system is enough.

Example:

Water Pokémon can cross current safely.

Rock Pokémon can stabilise the tunnel.

This makes collecting and building a team more meaningful.

20. EXPEDITION BOSS PRESENTATION

Boss rooms need a major presentation boost.

Current bosses:

Pinsir
Aerodactyl
Gengar
Lapras
Charizard

These are good enough to preserve initially.

Boss scene should have:

dedicated environment
boss entrance animation
larger sprite
camera shake where suitable
boss name banner
unique music hook only if suitable local audio is available
higher HP / battle modifier
special visual effect
dramatic reward screen

Do not just spawn a level +6 Pokémon using the ordinary encounter presentation.

21. BOSS MODIFIERS

Give each boss ONE simple special mechanic.

Examples:

Pinsir

Enrages below 40% HP → attack increase.

Aerodactyl

Very fast → first action advantage.

Gengar

Ghostly veil → first attack deals reduced damage.

Lapras

Restorative tide → one small heal during battle.

Charizard

Blazing field → Fire attacks strengthened.

Keep these readable.

No need to recreate competitive Pokémon combat.

22. BATTLE PRESENTATION OVERHAUL

The existing battle engine can remain recognisable underneath.

Do not expand this into a full Pokémon battle simulator.

But visually it should feel dramatically better.

Each location needs a dedicated battle backdrop.

Use locally packaged actual Pokémon-game-style/environment assets.

Add:

opponent entrance
player Pokémon entrance
subtle idle motion
attack lunge
hit recoil
screen shake
attack particles
HP bar tween
super-effective flash
faint animation
Poké Ball throw arc
ball shake sequence
capture burst
shiny entrance sparkle
trainer/boss banner

No long delays.

Animation should make battles feel responsive, not slow them down.

23. BATTLE COMMAND UI

Make it feel like a Pokémon command panel, not generic HTML buttons.

Current mechanics include:

Quick Hit
type attack
Berry
Potion
Ball
Run / Retreat
party switch

Keep those mechanics unless there is a strong reason to refine them.

Recompose the controls visually.

For example:

┌──────────────────────────┐
│ What will PIKACHU do?    │
│                          │
│ QUICK HIT   ⚡ SPARK     │
│ BAG         SWITCH       │
└──────────────────────────┘

Capture controls can open a compact Bag tray.

The battle scene should remain visible behind/above commands.

24. TRAINER BATTLES

Trainer rooms should feel different from wild encounters.

Add:

trainer sprite
trainer introduction
trainer class/name
Pokémon reveal
victory reward

A simple generated naming system is fine:

Bug Catcher Eli
Hiker Marc
Channeler Aya
Swimmer Kai
Scientist Mina

Use appropriate trainer sprites/assets where locally available.

Do not need full multi-Pokémon trainer teams unless it is easy and stable.

One stronger opponent is acceptable for v0.23.

25. EXPEDITION LOOT / RUN HUD

During an expedition, show a compact persistent HUD:

route progress
current loot
party condition
active perks
current destination
retreat

Do not cover the environment with giant cards.

Keep it game-like.

26. RETREAT

Retreat remains important.

Preserve the existing rule:

retain already caught Pokémon
retain already found items/coins
lose final expedition clear reward

But make retreat presentation nicer.

Prompt:

Leave Mt. Moon now?

Show:

current loot
catches
rooms cleared
what final reward will be forfeited
27. EXPEDITION COMPLETION

Create a proper completion screen.

Show:

destination
party
rooms cleared
battles won
Pokémon caught
rare encounters
items found
coins
Trainer XP
first-clear ticket
boss defeated
optional performance grade

Example:

MT. MOON CLEARED

A · Explorer Rank

Do not introduce a grade-dependent economy unless useful.

Grade can simply provide bragging/progression presentation.

28. FIRST-CLEAR / EXISTING REWARDS

Preserve existing meaningful rewards:

Lucky Coins
Trainer XP
Pack Ticket on first clear
Poké Balls
Berries
Potions

Do not unexpectedly inflate the economy.

Balance the new route rewards around current totals.

Runs can feel more rewarding without quadrupling coin income.

29. REAL LOCATION ART — IMPORTANT

Do not repeat the Arcade asset problems.

Essential Adventure art must be LOCAL inside the APK.

No runtime image URLs.

No Wiki hotlinks.

No missing art when offline.

Create:

docs/ADVENTURE_ASSET_SOURCES.md

For every externally sourced asset record:

destination
file
source repository/page
original game
adaptation/crop notes

Prefer authentic game assets from accessible decomp/resource projects where practical.

Potential sources include relevant pret projects.

Use:

route/building tiles
cave tiles
location backgrounds
trainer sprites
object sprites
environmental effects

Do not make the main environments from crude CSS rectangles.

30. COHERENT ART DIRECTION

Choose a coherent Pokémon visual era for the Adventure subsystem.

Prefer approximately:

Gen III / Gen IV pixel-art presentation

because it works naturally with the locally packaged Pokémon sprites.

Do not randomly mix:

GBA maps
Switch screenshots
anime art
modern vector UI
giant emoji

unless there is a deliberate transition.

It needs to look like one game.

31. ENVIRONMENTAL MOTION

This pass should feel alive.

Use inexpensive layered motion:

parallax
drifting particles
moving fog
grass sway
water animation
clouds
falling leaves
embers
floating cave dust
ghost wisps
occasional Pokémon background sprite

Respect reduced-motion setting if available.

Target smooth WebView performance.

Avoid dozens of unbounded RAF loops.

One animation owner per active scene.

Cancel everything on navigation.

32. TRANSITIONS

Use polished transitions between:

Map → Destination
Destination → Hotspot
Hotspot → Encounter
Encounter → Battle
Battle → Destination
Destination → Expedition
Node → Node
Boss → Results

Think:

short camera pan
iris/fade
Pokémon-style screen wipe
encounter flash

Approximately 150–450 ms for most transitions.

No PowerPoint-style two-second animations.

33. HAPTICS

Use existing vibration support deliberately.

Examples:

hotspot discovered
rare reveal
battle hit
capture shake
successful capture
boss entrance
route node selection

Keep subtle.

Respect user's vibration setting.

34. SOUND

Only add sound if suitable local game-like effects can be legally/practically packaged within the project's existing personal-use approach.

Do not make sound a dependency.

The mode must feel complete muted.

If implemented:

short UI clicks
rustle
encounter sting
hit sound
capture shake
success cue

Provide global mute compatibility.

35. SAVE MIGRATION

This is critical.

Preserve:

existing Pokémon
team
levels/XP
inventory
rank
coins
zonesExplored
visitedLocations
firstClears
adventureClears
expedition retreat stats
achievements
dailies
recent catches

Add new state additively, e.g.:

state.adventureV2 = {
  destinations: {},
  activeRoam: null,
  activeExpedition: null
}

Do not delete unknown save fields.

Existing users must update in place.

36. ACTIVE EXPEDITION PERSISTENCE

Unlike the old in-memory-only style, an active run should survive:

app backgrounding
app process death
WebView reload
reopening LuckyDex

Persist:

route seed
generated nodes
current node
HP by party member
selected lead
run loot
run perks
completed nodes
discovered future nodes
boss state if applicable

Save after every meaningful action.

On relaunch offer:

RESUME EXPEDITION

Do not silently discard the run.

37. EXPEDITION ROUTE GENERATION

Use deterministic seeded generation.

Tests should be able to supply a seed and reproduce a route exactly.

Rules:

boss always reachable
no disconnected nodes
at least one healing opportunity
at least one meaningful route decision
avoid impossible chains of elite encounters
rare nodes not guaranteed every run
events vary
same seed gives same structure
38. OFFLINE-FIRST

Adventure must work fully offline using packaged data/assets.

Current local zone encounter fallbacks are useful.

Preserve/improve them.

PokeAPI may enrich metadata when available, but basic Adventure must never hang because an API is slow or offline.

No Loading... dead ends.

39. PHONE-FIRST LAYOUT

Use the lessons from the Arcade work.

Test the actual usable Android viewport, not desktop assumptions.

Minimum screenshots/runtime checks:

360×800
393×873
412×915

Also use the project's Android emulator/device QA where possible.

Check:

status bar
bottom navigation/gesture bar
cutout
fixed overlays
battle command panel
event choices
expedition map
destination screen

No essential control beneath Android chrome.

No accidental page scrolling during active gameplay.

40. ADVENTURE SHOULD HIDE NORMAL APP CHROME WHILE PLAYING

When actively:

roaming
battling
running expedition

Adventure can use its own full-screen game UI.

Normal LuckyDex app navigation should not compete visually.

But exiting back to the Adventure hub must restore normal app chrome correctly.

Do not use Android immersive mode that draws controls underneath system bars.

Fill the usable app viewport.

41. NO WEB-APP LOOK

Explicitly avoid:

huge rounded Bootstrap cards
generic bordered <div> stacks
excessive explanatory paragraphs
endless vertical scrolling
generic form controls
emoji standing in for artwork
tiny game area surrounded by UI
debug labels
random gradients pretending to be locations

The dominant visual should always be:

the Pokémon world / current scene

UI should sit over or around the scene.

42. ADVENTURE HOME

The existing Adventure home can also be upgraded.

Instead of three giant cards:

Hunt Pokémon
Explore routes
Manage team

Make the full-screen Adventure Map the primary experience.

Team/Bag/Challenges can become small game-like buttons or drawers.

The user should enter Adventure and immediately feel like they have entered another mode of the game.

43. PARTY MANAGEMENT

Do not rebuild the whole Collection UI.

But inside Adventure provide a compact party drawer.

Show:

three party Pokémon
levels
types
current HP during expeditions
relevant field capability icons

Allow changing the normal team when not inside an active Expedition.

During Expedition, only switching the active lead is allowed unless existing rules allow more.

44. BALANCE

Do not make Wild or Expedition brutally difficult.

The user should be able to enjoy the visual/adventure loop without theorycrafting.

Goals:

ordinary Wild = casual
Expedition = meaningful attrition
Elite nodes = optional risk
Boss = noticeable challenge
party composition gives advantage rather than being mandatory
45. PERFORMANCE

This remains an Android WebView app.

Be ambitious visually without being careless.

Requirements:

lazy-create heavy effects
dispose inactive scenes
cancel RAF/timers/listeners
reuse DOM/canvas where practical
avoid enormous decoded images
optimise PNG/WebP
no hidden scene continuing animation after navigation

Test repeated:

Adventure → Map → Destination → Roam → Battle → Map → Expedition → Battle → Retreat → Home

No memory/leak-induced degradation.

46. ARCHITECTURE

The Adventure code is currently concentrated heavily inside app-v0167.js.

For this overhaul, it is acceptable — and encouraged — to extract the subsystem cleanly.

Suggested:

adventure/
  adventure-data.js
  adventure-map.js
  adventure-roam.js
  adventure-expedition.js
  adventure-battle.js
  adventure-events.js
  adventure-save.js
  adventure.css

Or an equivalent clean structure.

However:

preserve existing public hooks required elsewhere
do not create multiple runtime owners
do not stack another override layer at the bottom of app-v0167.js
migrate deliberately

There should be ONE owner of Adventure after this pass.

47. TESTING

Add serious runtime tests.

Adventure Map
all unlocked destinations reachable
rank locks correct
destination transition works
back navigation restores state
Roam
hotspots spawn
tapping hotspot resolves once
encounter reveal works
leave works
engage works
item discovery works
chain updates
no duplicate encounters
Expedition generation

For many seeds:

route connected
boss reachable
mandatory support constraints satisfied
deterministic
no duplicate IDs
valid node contents
Persistence
start expedition
complete several nodes
serialise
reload
resume exact run
Events
choice only resolves once
party/type gated choices work
rewards/damage applied exactly once
Battle
wild
trainer
expedition
boss
capture
switch
potion
berry
faint
retreat
exit/re-enter
Lifecycle

Repeatedly:

enter/leave Wild
enter/leave Expedition
enter battle
background/reload
return home
open Trade/Collection afterwards

No uncaught errors.

48. VISUAL QA IS REQUIRED

Do not declare completion from tests alone.

Create screenshots of:

Map
Adventure Map
Destinations
Viridian
Mt. Moon
Lavender
Seafoam
Cinnabar
Roam
idle environment
hotspot
rare encounter reveal
item discovery
Expedition
branching route
event choice
camp
cache/perk
boss approach
boss battle
completion screen
Battle
normal wild
trainer
capture sequence

At:

360×800
393×873
412×915

Produce contact sheets.

Actually inspect them.

If it still looks like web cards with Pokémon sprites pasted on top, continue iterating.

49. CREATIVE AUTHORITY

This is intentionally a major Codex pass.

Do not stop because the current code doesn't already contain a component needed for the design.

You may:

create new assets
source appropriate existing game assets
restructure Adventure modules
create Canvas layers
add animations
replace the Adventure HTML hierarchy
redesign the Expedition map
add run-state persistence
create bespoke destination events
improve the battle presentation

provided:

the rest of LuckyDex remains stable
saves migrate safely
no runtime remote art dependency is introduced
phone performance remains reasonable
50. IMPORTANT — DO NOT TAKE SHORTCUTS

Do not satisfy this brief by:

changing colours
adding another background image behind the existing cards
turning the old seven-room list sideways
adding a few CSS animations
replacing emoji with PNG icons
making the existing SEARCH button bigger

Those are not the requested overhaul.

The Adventure system itself should be transformed.

51. SUGGESTED IMPLEMENTATION PHASES

Work in deliberate stages.

Phase 1

Audit current Adventure mechanics/save/economy.

Phase 2

Create clean Adventure 2.0 state/data architecture.

Phase 3

Full-screen Adventure Map + destination scenes.

Phase 4

Interactive Roam/hotspot system.

Phase 5

Battle visual/presentation upgrade.

Phase 6

Seeded branching Expedition generator.

Phase 7

Events / camp / perks / party field abilities.

Phase 8

Bosses / results / persistence.

Phase 9

Visual asset and animation polish.

Phase 10

Full regression + Android QA.

Commit logical checkpoints.

Do not leave the app half-migrated between old and new owners at the final checkpoint.

52. DEFINITION OF DONE

v0.23.0 is not complete until:

Adventure opens into an immersive map rather than menu cards
destinations are visually distinct and animated
Wild hunting no longer revolves around a generic SEARCH card
hotspots are interactive
encounters return naturally to the destination
Expeditions are branching rather than fixed room arrays
route choices matter
events contain real choices
party composition affects at least some exploration events
camps are interactive
run-only perks work
active Expeditions resume after reload
bosses have distinct presentation/mechanics
battle presentation is substantially improved
essential assets are local/offline
existing save data migrates
existing rewards/economy remain sensible
Trade/Collection/Packs/Arcade still work afterwards
Android build succeeds
runtime tests pass
screenshots have been manually inspected
no known navigation crash remains
53. HANDOFF

At the end provide:

Adventure 2.0 architecture summary
old Adventure code removed/replaced
save migration details
destination list and assets used
Wild Roam mechanics
hotspot types by destination
Expedition route-generation algorithm
full node list
bespoke events added
run perks
boss mechanics
battle presentation changes
economy/balance changes
offline asset audit
performance/lifecycle checks
Android test results
screenshot QA contact sheets
known issues
source ZIP
APK/build artifact
SHA-256 hashes

Do not describe unfinished items as complete.