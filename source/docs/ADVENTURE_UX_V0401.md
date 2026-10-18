# Adventure UX v0.40.1 handover

The supplied v0.40.0 ZIP is the sole baseline. No earlier LuckyDex checkout was
merged into this project. Engine, authored geography, node IDs, claim ledger,
save schema/migration, Wild Hunt bonuses, level syncing and economy are unchanged.

## UI ownership

- `adventure-regional-ui.js` owns real-location presentation, contextual action
  menus and brief routine feedback. `LuckyDexJourneyUI.place(journey)` derives
  the authored parent place for optional discoveries and saved detour results.
- `adventure-controller.js` uses the same place helper on Adventure home.
- `adventure-hub.css` owns the compact location/home/window layout.
- `adventure-battle.js` retains its reducer and exposes the same public API.
  Only rendering/update/menu preview changed; existing battle command and action
  data attributes remain. Info/focus/pointer previews do not spend PP or RNG.
- `adventure-battle.css` owns the inline lower command/menu console, visible
  battlefield/HUDs, four compact moves, one detail strip and Bag/switch layouts.
  Struggle remains a compact additional action under the original rules.
- `adventure-move-view.js` retains `describe`/`markup`; new `compact`, `details`
  and `statusName` variants provide shared readable presentation.
- `adventure-tools.js` retains its Party mutation, quote, learning and purchase
  transaction functions. Its former scrolling renderer was replaced by a fixed
  tool shell, custom six-entry picker pages, selected-member pane, compact moves
  and four-slot replacement comparison. Search/paging is UI state only.
- `adventure-tools.css` replaces the old tall-card rules. Content-sized paper
  windows expose the scene behind unused space; long datasets page rather than
  scrolling the whole screen. Short 320×568 layouts may scroll a bounded pane.

## Place and progression rules

An optional supply cache, rare sighting or Wild Hunt is an action at its authored
parent location, not a new physical place. Routine result state is advanced once
through the existing engine API and saved; a reload of a routine result follows
the same path without repeating rewards. Badges, Elite Four, Champion and region
completion retain dedicated milestone views.

Town/city actions reflect the existing authored step. A partial guide rest is
never advertised as full Center recovery. Only camp nodes enable Pokémon Center
healing. A matching city's Gym is visible but locked until its required Center
step clears. Gym/League node type takes precedence over town-name suffixes, so
Pewter City's authored Gym is not misclassified. Caves/towers use Search Pokémon
or Explore rather than Search grass. FISH is omitted because the supplied nodes
do not provide explicit, validated water encounter pools; no rod system or fake
encounters were introduced.

## Back and transaction rules

Picker Back restores its tool/tab/selected-Pokémon context. Confirmation Back
cancels the existing transaction token before returning. Four-slot selection
does not consume a TM. Confirm still revalidates the target, moves, inventory,
save identity and battle lock; failed persistence still rolls back. Rapid taps
and stale DOM elements cannot duplicate transactions. Party replacement remains
inside Adventure and uses the existing injury/PP/status-preserving sync.

## Build and verification

Android identity remains `com.example.luckydex` with the supplied development
keystore. Only release metadata and two build portability/preservation helpers
changed outside Adventure UI: `LUCKYDEX_PYTHON` selects Python on Windows, and
semantically identical catalog regeneration retains the supplied byte encoding.

```sh
npm install
node scripts/adventure3-test-inventory.cjs
node scripts/adventure3-visual-qa.cjs
node scripts/verify-adventure3-source.cjs
node scripts/verify-adventure-ux.cjs <untouched-v0.40.0-extraction>
gradle --no-daemon :app:assembleDebug
```

Browser tests use the installed Chrome on Windows or `LUCKYDEX_BROWSER`; elsewhere
install Playwright Chromium. The full historical inventory and inherited failures
are recorded in the release test report. Physical Android execution was not performed:
native keyboard behavior, device rendering/FPS and accessibility text scaling
remain unverified. No push or merge was performed.
