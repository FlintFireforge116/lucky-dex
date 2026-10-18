# LuckyDex v0.26.0 — Sealed Booster Collection Design

## Goal

Turn booster packs won outside the Card Shop into persistent collectibles rather than auto-opening them immediately. Fossil Dig is the first reward source; later minigames must be able to award sealed boosters through the same API. Every genuine physical booster-eligible set must have an explicitly assigned local booster artwork asset so known sets never fall back to the generic pack shell.

## User-facing behaviour

### Fossil Dig

- The existing 4% buried-booster site chance remains unchanged.
- A buried booster still chooses from the full physical booster-eligible catalogue, independent of the player's owned cards, opened sets, or discovery state.
- Recovering a booster no longer grants its cards immediately.
- At the end of a successful/manual-safe dig, each kept booster reward is banked as a sealed pack.
- If a cave-in destroys that recovered reward, no sealed pack is granted.
- The result flow presents the actual set artwork and gives two actions:
  - **OPEN NOW** — consume that sealed pack and enter the existing pack-opening sequence without charging coins/tickets or using the daily entitlement.
  - **SAVE FOR LATER** — leave the pack in the sealed-pack collection.
- If several boosters are recovered in one dig, the result flow processes them one at a time so each can independently be opened or saved.

### Card Shop

- No **Buy & Save** action is added.
- Normal shop purchases retain the existing buy-then-open behaviour.
- Shop presentation may reuse the same local booster artwork manifest so known physical sets display the correct art, but shop purchases do not create sealed inventory records.

### Collection

Add a third segmented Collection mode:

- Pokédex
- Card Binder
- **Sealed Packs**

The Sealed Packs view shows one tile per owned pack variant/set with:

- real local booster artwork
- set name
- quantity owned
- `OPEN PACK` action

Opening from Collection consumes exactly one stored pack only once the opening flow is successfully initiated. The user returns to Sealed Packs after completing or exiting the opening sequence.

## Data model

Advance save data from version 6 to version 7.

Add a top-level sealed pack inventory:

```js
sealedPacks: {
  "base1": {
    setId: "base1",
    setName: "Base Set",
    source: "tcg",
    count: 2
  }
}
```

Only stable data is persisted. Pack contents are **not** generated or saved until the user opens the pack.

Migration requirements:

- existing saves receive `sealedPacks: {}` without changing any other progress
- import/export naturally includes `sealedPacks`
- reset clears sealed packs along with the rest of the collection
- malformed/negative counts are normalised to zero and omitted

## Shared sealed-pack reward API

Create one app-level reward API so Fossil Dig and later minigames do not duplicate pack logic:

```js
grantSealedPack(setMeta, amount = 1)
openOwnedSealedPack(setId)
getOwnedSealedPacks()
```

`grantSealedPack` increments persistent inventory and saves state.

`openOwnedSealedPack`:

1. validates an owned count exists
2. resolves the current full set data
3. generates the pack using the same physical pack-generation rules as the normal Card Shop
4. prepares the existing pack-opening scene in a reward mode with no entitlement charge
5. decrements the stored count only after preparation succeeds
6. restores the count if opening setup fails before the scene can start

This API is the extension point for future minigame booster rewards.

## Pack opening integration

Reuse the current `preparedPack` and pack-opening presentation rather than building a second opener.

Add an opening context such as:

```js
preparedPack.origin = "sealed-reward";
preparedPack.returnTarget = "collection-sealed";
```

Rules:

- sealed reward openings never call shop entitlement/payment logic
- cards are committed through the normal card collection path
- pack/card statistics update exactly once, at the same point as an ordinary opened pack
- exiting after the pack has been consumed must not duplicate or refund it
- a failure before opening starts must not consume the inventory item

## Local booster artwork

### Principle

Do not perform runtime network discovery or filename guessing for booster artwork.

Bundle one representative transparent/clean pack image for every **physical set that can genuinely be opened as a booster in LuckyDex**.

Suggested layout:

```text
app/src/main/assets/tcg-booster-art/
  base1.webp
  base2.webp
  base3.webp
  ...
  sv1.webp
  sv2.webp
  ...

app/src/main/assets/booster-art-manifest-v0260.json
```

Manifest example:

```json
{
  "base1": "tcg-booster-art/base1.webp",
  "base2": "tcg-booster-art/base2.webp",
  "sv1": "tcg-booster-art/sv1.webp"
}
```

The manifest is explicit: one set ID maps to one local image. No fallback URL is required for known booster sets.

### Coverage rules

A build/test audit must enumerate the same physical booster-eligible set catalogue used by the pack shop and assert:

- every eligible set ID has a manifest entry
- every manifest path exists in the APK assets
- no manifest entry points to a zero-byte/obviously invalid image
- representative legacy and modern sets (at minimum `base1`, an EX-era set, a BW-era set, an XY-era set, an SM-era set, an SWSH-era set, and an SV-era set) resolve locally

Promo-only series, Trainer Galleries, subset galleries, energy-only sets, and other non-booster products are excluded from the required booster-art list.

If an eligible set lacks art, the test must fail before release rather than silently shipping the generic shell.

## Fossil Dig changes

Replace the current booster banking branch that calls `grantBooster` and auto-opens cards.

New flow:

1. dig generation resolves a random full-catalogue booster set as it does now
2. excavation uses that set's local booster artwork
3. banking a kept booster calls `grantSealedPack`
4. the haul records `"<Set> Booster · Sealed pack recovered"`
5. after ordinary dig rewards are banked, the result UI exposes Open Now / Save for Later for recovered boosters

Loose excavated cards remain unchanged: 15% site chance and full physical-card catalogue, independent of ownership/discovery.

## Collection UI details

When `collectionMode === "sealed"`:

- hide Pokémon team controls
- hide Card Binder duplicate/rarity quick filters
- replace irrelevant card-generation filters with a simple set/search view
- collection progress shows total sealed packs and number of unique sealed sets
- grid tiles use the local booster artwork asset and an owned-count badge
- opening a tile/`OPEN PACK` does not route through the shop page first

No selling, dust conversion, trading, or shop valuation is added in v0.26.0.

## Failure and offline behaviour

Because booster artwork is local, artwork works fully offline.

Opening a saved pack follows the same card-data availability rules as the existing Card Shop. If required set/card data cannot be resolved, the unopened pack remains owned and an error is shown; it must not be consumed.

Unknown legacy/corrupt `setId` entries remain visible using a safe text placeholder and cannot be opened until resolvable. They must never crash Collection rendering.

## Android/update compatibility

Preserve:

- `applicationId "com.example.luckydex"`
- the existing permanent LuckyDex signing keystore and certificate

Advance only:

- `versionCode` 259 → 260
- `versionName` `0.25.9` → `0.26.0`

The resulting APK must install as an in-place update over the current signed LuckyDex build and retain the user's save.

## Testing

Implementation is test-driven. Required new/updated regression coverage:

1. save migration creates an empty sealed inventory without losing existing cards/Pokémon
2. `grantSealedPack` increments correctly and survives save/load
3. opening one stored pack decrements exactly one and does not charge coins/tickets
4. pack-generation failure leaves the stored count intact
5. Fossil Dig banks recovered boosters as sealed inventory instead of auto-granting cards
6. cave-in-lost boosters are not granted
7. Open Now and Save for Later route correctly
8. Collection Sealed Packs mode renders quantity and local artwork
9. complete booster-art manifest coverage against all booster-eligible physical sets
10. `base1` specifically resolves to a packaged image, preventing recurrence of the screenshot failure
11. shop purchases continue to open directly and do not add to sealed inventory
12. Android package ID and signer remain unchanged; version code advances to 260
13. existing fossil recovery-mask, card-rate, full-catalogue excavation, pack-opening, card collection, and save/import regressions remain green

## Non-goals for v0.26.0

- Buy & Save in the Card Shop
- sealed-pack trading
- selling sealed packs
- pack grading/value simulation
- multiple wrapper variants per set
- TCG Pocket sealed-pack inventory
- adding additional minigame reward sources in this release

The architecture deliberately leaves future minigames able to call `grantSealedPack` without changing the collection or opening systems.
