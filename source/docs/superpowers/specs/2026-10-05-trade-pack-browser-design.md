# LuckyDex Trade Market + Pack Browser Design

Date: 2026-10-05
Target: v0.24.0 (versionCode > 232)
Baseline: v0.23.2

## Intent

Make Trade behave like one persistent simulated market whose listings exist independently of UI filters, and make the Packs page fast to browse with search, sort, and reversible sort direction. Preserve all existing card collection/save data and the Android update identity.

## Non-negotiable compatibility

- Keep `applicationId` exactly `com.example.luckydex`.
- Keep `localStorage` save key exactly `luckyDexSave`.
- Keep the existing GitHub signing path/keystore contract unchanged.
- Increment `versionCode` above 232.
- Preserve unknown save fields and all current collection/trade totals.
- Do not require uninstall/reinstall.

# 1. Trade: one market, filters only

## Current problem

`trade-v0163.js` currently builds and caches boards by:

`slot + same/across mode + all/tcg/tcgp source`

That makes the UI controls data generators rather than filters. A transient catalogue failure can therefore produce an empty cached board for one button combination while another combination has valid listings.

## New source of truth

Replace per-view boards with one persisted market snapshot:

```js
state.trade.market = {
  version,
  slot,
  generatedAt,
  expiresAt,
  openedSetFingerprint,
  listings: []
}
```

The market is the only source of live listings.

Each listing stores enough metadata to filter synchronously without rebuilding:

```js
{
  id,
  trainer,
  avatar,
  offer,
  request,
  offerTier,
  reqTier,
  source,      // `tcg` or `tcgp`; both sides use the same source
  sameSet,     // boolean
  featured,    // boolean or stable rank
  accepted
}
```

No Trade button may call catalogue generation directly.

## Market generation

- Generate a healthy mixed pool for the current four-hour slot from all discovered/opened sets.
- Generate both same-set and across-set listings in the same snapshot.
- Generate both Physical and Pocket listings when those discovered sets exist.
- Do not create Physical ↔ Pocket mixed-source trades; this keeps the source filters unambiguous.
- Use deterministic slot seeding so reopening the app in the same slot preserves the same market.
- A transient catalogue failure must never replace a previously valid non-empty market with an empty market.
- If generation cannot complete, keep the last valid snapshot visible and retry in the background.
- A genuinely empty market is valid only when there are no discovered sets capable of producing listings.

## New-set behaviour

When the player opens a booster from a previously undiscovered set during the current slot:

- update `state.trade.openedSets` immediately;
- do not discard the existing market;
- deterministically append a small number of new listings involving the newly discovered set;
- update `openedSetFingerprint`;
- persist the augmented market.

This makes the market feel as if new traders/listings have become available because the player expanded their discovered card pool.

## Timer behaviour

The four-hour timer refreshes the market snapshot, not individual views.

At slot rollover:

1. attempt to build the new snapshot in the background;
2. keep the previous valid snapshot visible while loading;
3. atomically replace it only after a valid new snapshot is ready;
4. update the countdown.

No filter change resets or extends the timer.

## Filters

All controls become synchronous filters over `state.trade.market.listings`:

- Same Set → `sameSet === true`
- Across Sets → `sameSet === false`
- All source → all listings
- Physical → `source === 'tcg'`
- Pocket → `source === 'tcgp'`
- Featured → featured subset
- All → all matching listings
- Can Trade → player owns at least one requested card
- Spares → player owns at least two requested cards
- Search → trainer/card/set/rarity text match

Counts shown on buttons must be derived from the same underlying market after the relevant higher-level filters are applied; they must not represent hidden alternative caches.

## Accepted trades

Accepted listings remain accepted in the current market snapshot. Completing a trade must:

- mutate collection exactly once;
- increment trade totals exactly once;
- mark listing accepted;
- persist immediately;
- not rebuild the market.

## Trade UI cleanup

Remove the large explanatory `Global market...` panel from the main page.

Keep the hierarchy compact:

1. title + refresh timer;
2. Same Set / Across Sets;
3. Featured / All / Can Trade / Spares;
4. All / Physical / Pocket;
5. search field;
6. one compact status line such as `24 live · 5 featured · 9 ready`;
7. trade cards.

The trade cards themselves should begin substantially higher on the phone screen than in v0.23.2.

Do not redesign the card-to-card trade animation in this pass.

# 2. Packs: searchable/sortable set browser

## Current problem

The Pack page relies on a native `<select id="setSelect">` populated by `pack-flow-v0165.js`. This makes a large catalogue cumbersome to browse and provides no useful sorting/search controls.

## Browser model

Keep `setSelect` as the compatibility/control value used by existing pack-opening logic, but make it an implementation detail.

Add a visible Pack Set Browser that renders the current source catalogue (`tcg` or `tcgp`) and synchronizes the chosen row back to `setSelect`.

This avoids rewriting the established pack-opening pipeline.

## Search

Add a search button/field to the Packs page.

Search is case-insensitive and filters the currently selected card source by:

- set name;
- set code / set id where available.

Search must compose with sorting rather than reset it.

## Sort key

Add a Sort control with these options where data is available:

- Release Date
- Name
- Set Size
- Completion %
- Packs Opened
- Recently Opened

If a metric is unavailable for a set, use a deterministic zero/unknown fallback rather than dropping the set.

## Direction toggle

Add a separate arrow button adjacent to Sort.

It toggles ascending/descending for the active sort key:

- Name ↑ = A → Z
- Name ↓ = Z → A
- Release Date ↑ = oldest → newest
- Release Date ↓ = newest → oldest
- numeric metrics ↑ = low → high
- numeric metrics ↓ = high → low

Default:

- Release Date, descending (newest first), matching current behaviour.

## Pack browser rows

Each visible set row should be compact and tappable, showing only useful information such as:

- set name;
- release year/date;
- card count;
- owned/total or completion when cheaply available;
- selected state.

Do not turn the page into giant cards or a long explanatory dashboard.

Selecting a set:

- updates hidden/native `setSelect`;
- updates the existing pack format/price/open button through existing hooks;
- does not open a new page.

## Persist UI preference

Persist pack browser preferences additively, e.g.:

```js
state.ui.packBrowser = {
  sortKey: 'releaseDate',
  sortDir: 'desc'
}
```

Search text does not need to persist across app restarts.

# 3. Files / ownership

Expected primary edits:

- `app/src/main/assets/trade-v0163.js`
- `app/src/main/assets/trade-v0163.css`
- `app/src/main/assets/trade-browser-v0169.css`
- `app/src/main/assets/index.html`
- `app/src/main/assets/pack-flow-v0165.js`
- relevant Pack CSS file(s)
- tests

Do not add a second Trade runtime owner or a second Pack-opening engine.

# 4. Migration

On first v0.24 launch:

- retain `state.trade.openedSets`, `totalTrades`, collection and statistics;
- stop reading `state.trade.boards` as live data;
- preserve the old `boards` field if present rather than destructively deleting unknown save data;
- initialise the new `state.trade.market` lazily;
- migrate UI defaults without changing card ownership.

# 5. Tests

## Trade market

Add regressions proving:

1. one market snapshot supplies Same/Across/All/Physical/Pocket views;
2. switching filters never invokes a market rebuild;
3. a failed catalogue build cannot overwrite a valid market with `[]`;
4. an initial transient failure retries and later succeeds within the same timer slot;
5. two or more discovered physical sets yield Across Sets listings;
6. newly opened set augments the current market without replacing existing listings;
7. slot rollover replaces the market atomically only after successful generation;
8. accepted trade mutates collection once and remains accepted when filters change;
9. search/filter counts are internally consistent.

## Pack browser

Add regressions proving:

1. search filters by name and set id/code;
2. Release Date ↑/↓ reverses correctly;
3. Name ↑/↓ gives A→Z / Z→A;
4. Set Size numeric sort works;
5. Completion/Packs Opened/Recently Opened use stable fallbacks where missing;
6. search + sort compose;
7. selecting a visible row synchronizes `setSelect` and existing pack HUD/open flow;
8. changing Physical/Pocket source refreshes the browser without stale rows;
9. sort preference survives save/load.

## Compatibility

Assert:

- `applicationId == com.example.luckydex`;
- versionCode > 232;
- `luckyDexSave` unchanged;
- existing signing workflow identifiers unchanged.

# 6. QA / definition of done

At 360×800, 393×873 and 412×915:

- Trade cards appear substantially higher than v0.23.2;
- no redundant explanatory panel dominates the page;
- filter counts are non-contradictory;
- Same/Across and source filters switch instantly without loading spinners;
- the timer does not change when filters change;
- Packs exposes search, sort selector and direction toggle without clipping;
- a large physical set catalogue remains usable without scrolling a native select blindly;
- no regression to pack opening, card artwork, trade animation, save loading or bottom navigation.

