# LuckyDex v0.40.30 Test Report

## Scope

### Pokémon Stadium 2 Kids Club venue
- Stadium 2 now uses an authentic Pokémon Stadium 2 **Clear Cut Challenge** gameplay capture as its foreground venue landmark.
- The capture is requested from the documented Vizzed source when network access is available.
- The existing bundled `arcade/kids-club/kids-club-2-venue.svg` remains the automatic image-error/offline fallback, so the venue remains usable without network access.

### TCG Pocket Rare Pack
- Rare Pack odds remain **1 / 500** and are still suppressed when a God Pack triggers.
- Rare Packs no longer flatten every slot into the same chase-card pool.
- The normal Pocket pack slot structure is preserved first, then each ordinary slot's rolled rarity is elevated by one rarity class where possible:
  - Common → Uncommon
  - Uncommon → Rare
  - Rare → Double Rare
  - Double Rare / 4-Diamond → Ultra
  - Ultra → Illustration
  - Illustration → Special Illustration
  - Special Illustration → Secret
- Exactly one standard pack slot is upgraded to a guaranteed **great hit** drawn from Ultra / Illustration / Special Illustration / Secret classes. Ordinary 4-Diamond ex cards do not satisfy this guaranteed hit.
- Rare Packs now have their own sealed-pack styling, `LUCKY UPLIFT` intro, running badge and summary treatment rather than borrowing the God Pack presentation.

### God Pack
- Production odds remain **1 / 1000**.
- Existing God Pack high-pool generation and spectacle are preserved, keeping it clearly above a Rare Pack rather than making the two events mechanically equivalent.

### Pokémon GO hidden Ditto
- Hidden Ditto is now a separate **1 / 40 Pokémon GO physical-pack event**.
- Event misses leave the normal reverse slot completely untouched, so reverse-holo Spinarak 006/078, Numel 013/078 and Bidoof 059/078 can all be collected normally.
- On an event hit, the reverse slot becomes Ditto 053/078 hidden behind one randomly selected authentic disguise: Spinarak 006/078, Numel 013/078 or Bidoof 059/078.
- At most one hidden Ditto is planned per pack.
- The v0.40.29 peel gesture and subtle lifted-corner presentation are retained.

## Verification

### Focused regression suite
The final focused suite covered the new v0.40.30 contracts plus the existing God Pack, Rare Pack, pack-builder, v0.40.29 preservation and Stadium 2 / Clear Cut regressions.

Result: **25 passed, 0 failed**.

### JavaScript syntax
`node --check` passed for all five modified/new runtime JavaScript files:
- `pack-policy-v0343.js`
- `pack-flow-v0165.js`
- `app-v0167.js`
- `pokemon-go-ditto-v04030.js`
- `arcade-world.js`

### Offline asset integrity
- 44 authentic Arcade scenes/sheets/crops verified.
- 2,098 offline Arcade sprites verified.
- 2,078 unretouched Arcade actors verified.
- 8 existing local venue assets verified.
- 829 Adventure images / 1,025 species registry entries verified.
- 42 Fossil Museum images verified.

### Full project runner
`npm test` was invoked. It completed the preceding test program cleanly, then stopped at `adventure-core.test.cjs` because the supplied source has no installed `playwright` module in this sandbox (`MODULE_NOT_FOUND`). The npm registry is unavailable from this environment, so that browser dependency cannot be installed here. No browser-suite pass is claimed.

Two aggregate attempts to execute all 406 test programs independently also exceeded the sandbox execution window, so completion claims are based on the targeted regression suite, syntax checks, asset-integrity scripts, and the explicit project-runner limitation above.

### Legacy Rare Pack guard
- Updated the older v0.34.3 collation assertion so it now guards the v0.40.30 uplift contract instead of the superseded all-hit Rare Pack behaviour.

## Release identity
- Package/version: `0.40.30`
- Android `versionCode`: `4030`
- Android `versionName`: `0.40.30`
