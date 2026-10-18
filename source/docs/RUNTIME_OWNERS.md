# Active runtime ownership

The index loads one shared Arcade platform, result session and router. No older Arcade generation is loaded. `window.state` is a getter over the main app's current save object, including after replacement/reset.

| Responsibility | Authoritative source | Cleanup |
|---|---|---|
| App sections | `app-v0167.js:navigate` | Calls Arcade/Trade leave before switching |
| World → venue → game and Back | `arcade-world.js` | One `cleanup`; hides results/games, restores chrome, invokes owner |
| Berry Picker, Tile Puzzle | `arcade-amie.js` | Disposes run timers, RAF, reactions, drag listeners/ghosts |
| Voltorb Flip, Fossil Excavation | `arcade-classics.js` | Invalidates game state and one-tap excavation run state |
| Clefairy Match (Moon/Pond memory) | `clefairy-memory.js` + `clefairy-scene.js` | Cancels memory timers/scene animation and invalidates the run |
| Berry Blender | `berry-blender.js` | Invalidates awaited countdown; cancels RAF/timers/particles |
| Poké Ball Drop | `arcade-ball-drop.js` | Cancels RAF/landing timer and token |
| Unown Decoder | `arcade-unown.js` | Clears round timer/transitions and active flag |
| Who's That Pokémon? | `arcade-quiz.js` | Clears round timer/transitions and active flag |
| Trade | `trade-v0163.js` | Cancels confirmation/animation waits and clock |
| Results/replay | `arcade-session.js` | Hides sheet and releases callbacks |
| Binder shortcuts/retained save defaults | `binder-controls.js` | No game/navigation ownership |

Native pause calls the router's suspend path. Document visibility/pagehide use the same path. The router wraps the core Back handler once, respecting dialog/Trade overlays before Arcade routes. One delegated click listener handles current and rebuilt game/venue exit controls.

Removed: v0.17/v0.18/v0.19 Amie owners, v0.18/v0.19/v0.20 world owners, zone/expansion/quality override loaders, inactive Ditto/Safari shells, Head It active runtime/DOM, observer-only polish and DOM-reparenting fidelity layers, obsolete generated venue graphics. The preferred Moon-stage Clefairy scene was intentionally restored into one current owner in v0.22. The retained engine/model files were renamed without version suffixes. Old save fields and achievements remain readable; inactive games have no runtime owner.

Arcade styling has two scoped owners: `arcade.css` and `arcade-amie.css`. 146 old Arcade selectors were removed from main app CSS. Normal app/pack rules remain; Trade/binder styles from retired mixed-content overlays were consolidated into the existing Trade stylesheet. No v0.21 `!important` override sheet was introduced.
