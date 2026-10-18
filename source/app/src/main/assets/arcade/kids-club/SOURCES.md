# Kids Club asset provenance

- `emerald-gym-floor.png` — copied from LuckyDex `arcade/dash/gen3/gym-floor.png`, an existing locally bundled Gen III / Pokémon Emerald-style extracted tile used by the Dash renderer. Reused without redrawing.
- `kids-club-venue.webp` — copied from LuckyDex `arcade/authentic-v0200/venues/stadium-classroom.webp`, an existing authentic Pokémon Stadium Kids Club/classroom capture used only as the venue landmark. The playable Hoop Hurl arena itself is reinterpreted with the Gen III floor tile and Emerald-style UI.
- Pokémon art is not duplicated here. Ekans uses `arcade/sprites/actors/pokemon/23.png`; Diglett/Dugtrio use the existing local Gen III actor sprites `arcade/sprites/actors/pokemon/50.png` and `arcade/sprites/actors/pokemon/51.png`. Shiny targets use the matching authentic local variants at `arcade/sprites/actors/pokemon/shiny/50.png` and `arcade/sprites/actors/pokemon/shiny/51.png`.

No Kids Club asset requires a runtime network request.
- Dig! Dig! Dig! terrain reuses local Gen III assets: `arcade/dash/gen3/cave-floor.png`, `arcade/dash/gen3/cave-wall.png`, `arcade/dash/gen3/cave-floor-dark.png`, `arcade/dash/gen3/cave-rock.png`, and `arcade/dash/gen3/shallow-water.png` / `arcade/dash/gen3/shore-water.png`. Sandshrew uses `arcade/sprites/actors/pokemon/27.png` at its native 35×39 aspect ratio.

- `stadium2KidsClub` venue foreground — authentic Pokémon Stadium 2 **Clear Cut Challenge** gameplay capture from Vizzed (`NINTENDO64--Pokemon Stadium 2_Jul10 0_30_15.png`). The app requests that capture for the venue landmark when network access is available. `kids-club-2-venue.svg` remains bundled locally and is used automatically as the offline/error fallback, so Stadium 2 remains navigable with no runtime network.
