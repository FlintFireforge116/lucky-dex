Start from the current v0.22.2 source.
This is a targeted fix pass only.
Do not redesign the app.
 Do not rewrite Arcade architecture.
 Do not touch unrelated systems.
The user has now provided real phone screenshots showing the remaining issues. Treat those screenshots as the source of truth.
Current issue:
-  venue/world images are too large 
-  they are using random gameplay screenshots 
-  they do not feel like proper location/zone presentation 
For Arcade world/venue screens, use location/title/building-style art, not random full gameplay screenshots.
The image should feel like:
-  a location card / title scene / venue header 
-  not “a screenshot of the minigame source material” 
- Kalos Amie Garden: use a proper Pokémon-Amie location/menu/building/title style asset, not a giant gameplay screenshot 
- Ruins of Alph: use the actual in-game title/location image if available 
-  Apply the same principle to all venues where possible: 
  -  Game Corner 
  -  Mining Museum 
  -  Contest Hall 
  -  Indigo Plateau 
  -  etc. 
-  Venue image should no longer dominate the whole screen height 
-  It should be visually prominent, but contained 
-  Target: 
  -  image area around 35–45% of viewport height 
  -  below it: clear game cards/buttons 
-  Avoid huge cropped artwork that pushes the venue buttons too far down 
Use cover / good cropping, but with a reasonable max-height
 Do not use blurred filler bars above/below
 Do not use giant screenshots as the venue hero if a proper location/title/building asset exists
Current issue:
-  berries are too small 
-  berries are too high up 
-  touch interaction is awkward 
-  scene composition is not good for mobile play 
Recompose the Berry Picker screen for touch play.
-  The tree should still be large and central 
-  The Pokémon should remain lower on the screen 
-  But the berries must be: 
  - larger 
  - lower 
  - more reachable 
  -  clearly tappable/draggable 
-  Increase visible berry size substantially 
-  Increase berry hitbox even beyond visible size 
-  Bring berry spawn/request positions downward into a reachable canopy band 
-  Keep enough spacing between berries so they are easy to select 
-  Pokémon can remain smaller/lower than before, but do not let the requested berry bubble and tree trunk fight for the same central space 
Support both:
1. drag berry to Pokémon 
2. tap berry, then tap Pokémon 
If drag ever fails, tap-select + tap-target must still work reliably.
Use actual touch-safe logic in WebView:
-  drag should continue reliably 
-  release over Pokémon should register 
-  selection state should be visually obvious if using tap-first flow 
This should feel like a real mobile minigame, not like tiny icons attached to a static background.
Current issue:
 The dig board is still rendering broken horizontal strips/background bands.
 This means the board is still not implemented as clean independent cells.
Rebuild Fossil Dig display so the board is a true independent cell grid, with no row-strip rendering.
-  Every cell is a standalone board cell 
-  No row-wide background slices 
-  No giant horizontal wood/metal bands inside the playable area 
-  No “random strip” rendering 
Use a simple, clean grid:
-  e.g. 6 columns × 7 rows 
-  square or nearly square cells 
-  responsive sizing based on available width 
Each cell starts as:
-  covered rock 
On tap, reveal exactly one final state:
-  empty soil 
-  solid metal 
-  complete fossil 
A revealed cell never changes again.
The board should be rendered from cell data only.
 No decorative multi-cell strip overlays inside the grid.
Every tap costs one dig.
 Finding any fossil cell uncovers the fossil immediately if that’s the chosen rule, but the board must stay visually coherent.
Current issue:
 The ball can still get stuck mid-board.
Prevent ball deadlocks.
-  inspect peg/ball/wall geometry for trap states 
-  reduce or eliminate positions where the ball can wedge 
-  add a stuck-ball watchdog: 
  -  if ball speed stays below a small threshold for a short period while not in a scoring slot 
  -  treat it as stuck 
  -  gently resolve it downward or nudge it to a valid continuation 
-  ensure the ball always eventually reaches a slot 
-  same overall board style 
-  same aim control 
-  same three-ball structure 
-  same scoring logic 
A “stuck ball” should never force the user to quit or softlock the run.
Use the user screenshots as truth.
-  Arcade world screen 
-  Kalos venue screen 
-  Berry Picker 
-  Fossil Dig 
-  Ball Drop 
-  no important control hidden under Android nav bar 
-  no buttons clipped by phone UI 
-  no huge image taking over too much vertical space 
-  all game action remains comfortably visible on a Samsung phone screenshot like the provided ones 
Add or update tests for:
-  Berry Picker berry drag and berry tap-then-Pokémon flow 
-  Fossil board renders as a full rectangular cell grid with no row-strip artifacts 
-  Ball Drop never stalls permanently 
-  venue hero image height stays within an upper bound 
-  world/venue screens still show action buttons inside viewport 
Provide screenshot QA for:
-  Arcade world 
-  Kalos venue 
-  Berry Picker 
-  Fossil Dig 
-  Ball Drop 
-  Ruins of Alph venue 
Release as:
- v0.22.3 
-  versionCode > 222 
Preserve:
-  package id 
-  signing identity 
-  save compatibility 
-  existing restored Clefairy / Blender / Tile Puzzle functionality 
At completion report:
1.  which venue assets were replaced 
2.  what was used for Kalos Amie Garden 
3.  what was used for Ruins of Alph 
4.  Berry size/hitbox/position changes 
5.  exact Fossil board structure 
6.  exact Ball Drop anti-stall fix 
7.  screenshot QA results 
8.  remaining known issues