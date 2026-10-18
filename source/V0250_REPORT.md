# LuckyDex v0.25.0 — Fossil Dig + Oreburgh Mining Museum

v0.25.0 replaces the old one-tap Fossil Dig with a layered excavation game and adds a persistent Oreburgh Mining Museum collection room.

## Fossil Dig gameplay
- Board is 12 columns × 9 rows (108 rock cells).
- Normal walls contain 3–6 non-overlapping multi-tile buried finds.
- Rock starts at 2–4 depth layers and reveals the coherent object sprite underneath as it is chipped away.
- Pickaxe removes 3 depth from one cell and costs 3 wall stability.
- Hammer affects a 3×3 area, removing 2 at the centre and 1 around it, and costs 8 stability.
- Stability starts at 100%; reaching 0 collapses the wall immediately.
- Only fully uncovered objects are recovered; partial fossils/cards are lost on collapse.
- Recovery is idempotent: repeated taps or end-state input cannot award an item twice.

## Buried catalogue and routing
Museum-capable discoveries include all major fossil items through Galar, Odd Keystone, seven Relic items, Hard Stone, Everstone and the Fire/Water/Thunder/Leaf/Moon Stones.

Other finds include Poké/Great/Ultra Balls, Nuggets/Pearls/Stardust/Star Pieces/Rare Bones/Comet Shards, Lucky Coin caches and rare buried TCG cards.

- First museum copy: automatically donated.
- Later museum copies: `foundCount` increases and the duplicate is sold for its configured Lucky Coin value.
- Treasure / coin caches: sold/granted as Lucky Coins.
- Balls: routed to the existing Adventure inventory.
- Buried TCG cards: routed to the normal Card Collection; pack count is not incremented.
- If the card catalogue cannot provide a buried card, the slot quietly becomes ordinary treasure before play begins.

## Museum collection room
- Oreburgh Mining Museum now exposes two activities: `Fossil Dig` and `Museum Collection`.
- The museum is a single responsive top-down room with no controllable player/avatar or movement UI.
- Display cases are visually empty on a new save; there are no silhouettes, question marks or locked labels.
- Discovered artifacts appear only inside real cases/pedestals.
- The supplied DPPt Oreburgh room is used as the base. Central player/guide sprites were removed, counter staff remain as part of the authentic room, and authentic glass-case artwork from the same room was duplicated into unused floor space to support the full collection.
- Odd Keystone occupies the central signature pedestal.
- Tapping a discovered artifact opens a plaque with name, original LuckyDex flavour text and total excavated count.

## Save compatibility
Old saves are migrated by adding only:

`arcade.museum.exhibits = {}`

Unrelated Arcade state, profile, inventory, Pokémon and card data are preserved.

## Release identity
- `applicationId`: `com.example.luckydex`
- `versionCode`: `250`
- `versionName`: `0.25.0`
- Permanent signer unchanged.
- Keystore SHA-256: `90de91cea469f0eec5fbd69389cf03adc94ced396fa2ec85e2a51d2365a4f6d3`
- Certificate SHA-256: `06:9B:44:0B:7D:31:5E:FB:A1:F1:54:73:10:9A:E3:D9:45:AD:1F:A8:05:9E:6A:A2:62:72:6C:98:6D:39:8A:6A`

## Review note
The final implementation review caught and fixed three visual issues before packaging: crude sprite-removal mask blocks in the museum room, exhibit coordinates floating on the floor rather than inside displays, and Lucky Coin caches using a Nugget sprite. `tests/v0250-final-review.test.cjs` now guards those decisions.
