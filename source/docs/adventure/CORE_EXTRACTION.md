# Adventure core extraction

Adventure 2.0 has one owner: `adventure/adventure-controller.js`, mounted at `#adventureRoot`. `index.html` loads the pure model, offline species/assets and battle module before the controller and core. `adventure/adventure.css` and `adventure/adventure-battle.css` own the new scenes.

## Removed legacy ownership

Core no longer declares `EXPEDITIONS` or the lexical `currentZone`, `adventureMode`, `battle`, `actionLocked`, `expedition`, `continueHandler`. Removed controllers include the old zone/search renderer and selection, Search timer/spawn, battle render/team strip/switch/attack/supplies/Ball/capture/victory/continue/run flow, fixed expedition list/progress/room/rest/cache/event/clear/retreat/failure flow, later duplicate Adventure menu/zone/expedition declarations, `completeExpeditionV4` / `retreatExpeditionV4` / `failExpeditionV4` captured aliases, and `installScreenObserversV5` MutationObservers. Duplicate starter/global HUD declarations were consolidated to their shared title-aware versions.

The old Adventure hub/menu, hunt/search card and zone strip, fixed expedition list/map/overlay, battle arena/command controls and recent-catch strip DOM were removed. Their parse-time listeners and `wireV5` Adventure/back/hunt-shop bindings were removed with them. Starter/title, supplies dialog, normal app navigation and all unrelated DOM remain.

## Shared hooks retained

`window.LuckyDexAdventureBridge` exposes live `getState`, `save`, rank/shiny-odds helpers, Trainer/Pokémon XP, daily/milestone hooks, toast/vibration, `navigate`, generation and combat helpers, zone/encounter/classification metadata, shared renderers and `openSupplies`. Shared Pokémon build/combat/XP, offline starter grants, Arcade `helperAbility`, Collection/profile/shop, Cards/Packs/Trade and public `window.state` / `window.API` remain in core.

`navigate` calls Adventure `leave` when leaving its active page and `enter` when returning. Base `handleLuckyBack` preserves dialog, Pack, Arcade and starter handling, then calls Adventure `handleBack`; Arcade's outer wrapper remains intact. Tiny `showAdventureHub`, `renderAdventurePartyMini`, `renderZones` and `updateSearchCard` redirects connect existing shared starter/HUD/settings callers to the new owner. Core load/reset normalizes Adventure state additively, retaining `luckyDexSave`, saveVersion 6, collection keys, unknown fields and legacy `profile.firstClears` zone IDs.

## Removed stylesheet ownership

Cleanup in `styles-v013.css` deletes **194 obsolete style-rule blocks and six unused keyframe blocks** (200 blocks total), plus four dead selector branches from shared groups: **210 selector branches**, **20,623 bytes** removed. A balanced CSS scanner handled quoted strings/comments, nested braces, media containers and comma groups. It removed selected source spans without reformatting the stylesheet. All **331 untouched rule blocks remain byte-identical**; the declaration bodies of **four mixed groups remain byte-identical**, preserving `.panel`, `.panel::before` and `.collection-progress` while dropping only `.hero-card` / `.hero-card::before`.

All variants and descendants of these obsolete selector families were removed:

- Hunt/search: `.adventure-tabs`, `.zone-strip`, `.zone-card`, `.zone-lock`, `.supply-bar`, `.search-card`, `.hero-meta`, `.odds-label`, `.search-visual`, `.landscape-mark`, `.search-rustle`, `.recent-strip`, `.recent-card`, plus the dead `.hero-card` branches above.
- Fixed expeditions: `.expedition-intro`, `.expedition-list`, `.expedition-card`, `.expedition-progress`, `.route-pips`, `.expedition-map`, `.route-node`, `.expedition-controls`, `.expedition-party`, `.expedition-scroll`, `.expedition-overlay`.
- Old battles: `.battle-arena`, `.battle-context`, `.battlefield`, `.battle-mon`, `.battle-status`, `.hp-track`, `.battle-sprite-stage`, `.player-stage`, `.wild-stage`, `.battle-message`, `.battle-actions`, `.battle-btn`, `.ball-action`, `.battle-secondary-actions`, `.battle-ball-anim`, `.sparkles`, `.battle-team-strip`, `.battle-switch`, `.battle-overlay`.
- Old hub/subscreens: `.adventure-hub`, `.party-mini`, `.adventure-menu`, `.adventure-menu-card`, `.menu-art`, `.hub-footer-row`, `.hub-small-btn`, `.adventure-subscreen`, `.hunt-supplies`, `.subscreen-head`, `.back-chip`, `.bag-chip`.
- Obsolete fullscreen owner: `body.expedition-active` and `body.battle-open` rules targeting app chrome, main height and the old overlays. Ordinary app chrome styles remain intact.
- Unused keyframes: `rustle`, `hop`, `ballThrow`, `ballShake`, `ballCatch`, `spark`. All other keyframes, including title/starter/Pack/Arcade effects, remain byte-identical.

All packaged JS, HTML and CSS were searched for remaining consumers before deletion. `.shiny-glow` remains shared by Collection; `.screen-view` and `.screen-title` remain shared by Packs/Trade. The old `.hp-track` class has no consumer: the new battle uses its own `.adv-battle-hp` and `[data-hp-track]`. `battle-switch` remains a **data-command value** in new code, with no `.battle-switch` class consumer. No new controller, index, Arcade, title/starter, Card/Pack CSS or other production files were edited during stylesheet cleanup.

## Verification

`tests/adventure-core.test.cjs` checks bridge/shared navigation, supply dialog/Back and additive save preservation. `tests/adventure-persistence.test.cjs` checks real event, camp, cache/perk, battle, clear and retreat reload transactions. `tests/recovery-navigation.cjs` and `tests/recovery-runtime.cjs` cover shared navigation, three phone viewports, ten Arcade games/eight venues, route cycles and resource cleanup. The CSS cleanup additionally reparsed the resulting stylesheet and verified retained source blocks/declaration bodies against its pre-edit bytes.

Fresh post-cleanup runs passed `adventure-core.test.cjs`, `recovery-navigation.cjs` and `recovery-runtime.cjs`; the source comparison confirmed the stylesheet differs only by the audited deletions and four shared-selector splits.
