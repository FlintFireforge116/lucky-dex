# LuckyDex v0.23.1 — targeted Adventure/Arcade polish

This pass starts from the supplied v0.23.0 Adventure 2.0 source and deliberately avoids another subsystem rewrite.

## Changes

### Wild Roam hotspot placement
`AdventureModel.HOTSPOT_BLUEPRINTS` now defines five authored clue positions per biome. The controller uses those scene-specific coordinates/effect types for newly spawned hotspots while retaining compatibility with numeric hotspot clues already persisted in an active v0.23.0 roam.

- Viridian: tracks on path, tree movement on the isolated tree, leaf movement on woodland, grass rustles in the lower grass beds.
- Mt. Moon: loose stones/dust/glints/tracks/shadow map to rocky path and ledges.
- Lavender: graves, central glow/wisp, cold spot and shadows map to the tower scene.
- Seafoam: water/bubble/splash clues favour visible pools; cracked ice stays on ice.
- Cinnabar: heat/rock/ember/ash/track clues fit the Mt. Ember-derived crater scene.

### Curated encounter pools
Adventure 2.0 no longer selects from every species that happens to share one of a zone's broad type tags. `AdventureModel.ENCOUNTER_POOLS` is the authoritative encounter source for normal, rare and exceptional tiers.

Key rules:
- Viridian, Mt. Moon and Lavender have no random legendary tier.
- Ultra Beasts are excluded from every destination pool.
- Pheromosa (#795) cannot appear in Viridian Wilds.
- Seafoam's exceptional tier is Articuno (#144).
- Cinnabar's exceptional tier is Moltres (#146) or Heatran (#485).
- Explicit event/boss encounters continue to work through `enemyId` and are not constrained by roam pool tiering.

### Arcade locations navigation
The Arcade locations/world screen now keeps the app's global bottom navigation visible. Venue and active-minigame screens continue to hide it for full-screen play. The world shell reserves the bottom-nav height so location controls do not sit beneath it.

### Holo reveal alignment
The pack hit label is now an explicitly centered, compact badge beneath the card. This only fixes placement/visual anchoring; animated Holo/Reverse-Holo shimmer remains intentionally deferred to the later card-effects pass.

## Compatibility
- `applicationId`: `com.example.luckydex`
- `versionCode`: `231`
- `versionName`: `0.23.1`
- WebView origin unchanged: `file:///android_asset/index.html`
- save key unchanged: `luckyDexSave`
- Adventure v2 save remains additive; old numeric persisted hotspot clues are still readable.
