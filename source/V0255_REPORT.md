# LuckyDex v0.25.5 implementation report

## Android lifecycle / Arcade

Root cause: Android `onPause()` calls `LuckyDexArcadeWorld.suspend()`, and the old `suspend()` invoked `backFromGame()`. Opening Recent Apps therefore performed a real game exit and ran each minigame's close/reset path.

Fix: `suspend()` now saves without changing Arcade navigation. Normal LuckyDex page/venue navigation still uses `leave()` / `cleanup()`, so intentional exits retain their existing behavior.

## Wild FIELD CHAIN

Root cause: the chain was stored only on `adventureV2.activeRoam`. Leaving Adventure or backing out discarded `activeRoam`. The terminal reward handler also treated both capture and KO (`victory`) as successful chain extensions.

Fix: every destination record now owns a durable `chain`. New roam sessions read it, battle terminal results update it, and old active-roam values migrate forward. Capture increments; victory/KO, flee and loss reset; UI/navigation does not reset it.

## Archaeology artwork

The v0.25.4 simplified sprites for Comet Shard and the Relic family were replaced with the corresponding packaged PokeAPI item sprites. Copper/Silver/Gold now provide the proper coin-like relic appearances; Vase, Band, Statue and Crown use their distinct canonical pixel art. Both excavation and museum rendering use the v0.25.5 namespace.
