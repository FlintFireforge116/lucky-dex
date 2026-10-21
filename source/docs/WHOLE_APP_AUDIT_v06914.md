# LuckyDex v0.69.14 Whole-App QA & Economy Audit

## Scope

This pass deliberately added no new minigame. It reviewed the current LuckyDex build as a player-facing product before further expansion: Adventure, Arcade, Game Corner, Fishing, Packs/Dust, Trade, Collection/Profile/Cosmetics/Achievements, saves/settings, mobile UI contracts, rewards/progression, records, rare-event controls, and static asset/link integrity.

The goal was to fix clear defects and economy outliers directly while preserving established mechanics and save compatibility.

## Changes made

### Arcade records and daily progression

- Added permanent Records adapters for **Streaming Stampede** and **Delibird Delivery**. Both games were already saving detailed statistics but were omitted from the Records screen.
- Corrected the pre-hydration Daily Board claim copy from **+250** to the actual **+300 Lucky Coins** reward.
- Shared Arcade help remains complete for every currently registered Arcade game, with first-open help state and reusable help lifecycle covered by regression tests.

### Stadium 2 reward consistency

Four ordinary Stadium 2 games had rewards far above comparable one-round Arcade games. Their payout curves were normalized while retaining placement, performance, and difficulty premiums:

- Gutsy Golbat
- Furret Frolic
- Topsy-Turvy
- Barrier Ball

These now sit in the normal roughly 100–300-coin high-performance band instead of being able to outpay substantially longer activities by several multiples. The latter two now calculate rewards in testable core helpers rather than UI-only inline logic.

### Mauville Game Corner economy

The largest economy problems found in this audit were in the wagered Game Corner games.

**Slot Machine** random-stop expected return was previously above 100% at every bet size (about 133%, 200%, and 222% for 1/2/3-coin bets), creating an unlimited Lucky Coin generator. Payouts were rebalanced so exhaustive 21×21×21 stop enumeration now gives:

- 1 coin: **56.10% RTP**
- 2 coins: **84.14% RTP**
- 3 coins: **93.49% RTP**

Max bet therefore remains the best long-run choice, player timing/Reel Time can still improve results, and the straight-7 jackpot remains meaningful. The actual maximum result is **3,125 coins**, and the UI/help copy now says 3,125 rather than the stale 7,500 figure.

**Roulette** previously kept multipliers based on the original 12 pockets while occupied pockets left play. That caused expected return to increase each round. Multipliers now use the live number of available and matching pockets, keeping base expected return at **100%** as the board fills. Exact-slot bets therefore move from ×12 to ×11, ×10, etc. as appropriate rather than becoming increasingly favourable to the player.

The Roulette Golden Ball vanilla rate was reduced from 2% to **0.4% (1/250)** so its 10×-stake bonus is a genuine rare jackpot rather than a constant economy subsidy. Developer forcing remains available (Off / test rate / Always), and saves containing the old vanilla 2% value migrate automatically while explicit testing overrides are preserved.

For both wagered Game Corner games, shared `arcadeCoins` lifetime/daily earnings now count **positive net profit only** (`payout - wager`), not returned stake. Wallet settlement itself is unchanged.

### Fishing

The v0.69.13 fishing economy rebalance was retained and cross-checked against the rest of the app. Treasure, rare catches, rarity scaling, ultra-rare junk, shared Arcade earnings, shop costs, and result detail now sit much more sensibly relative to general Arcade and pack prices.

A parallel-test flake in the treasure-art runtime regression was also fixed: the test now waits for the countdown state to finish instead of assuming a fixed 1.45-second wall-clock delay. Product behaviour was not changed for this test-only fix.

### Adventure

Adventure balance simulations, region data, capture/EXP caps, party size, journey migration/recovery, TMs, residual statuses, Wild Hunt state, and fishing handoff were reviewed through the current non-browser regression coverage.

The regional-cap regression had become brittle because it asserted an old exact encounter species ID. It now seeds whichever authored encounter is actually generated and verifies the intended invariant: duplicate captures, collection count/level, journey level cap, party limit, and capped EXP behaviour. This prevents legitimate encounter-table edits from producing false failures.

No current Adventure reward loop stood out as an economy exploit. Early battle rewards remain modest relative to consumable costs; larger trainer/boss rewards are progression-gated/one-time.

### Packs, Dust, Trade, Collection, Profile, Cosmetics, Achievements

The current economy relationships were reviewed rather than globally retuned without evidence:

- Most paid packs remain around **450–650 Lucky Coins**, with format-specific exceptions.
- Daily completion remains **1 Pack Ticket + 300 Lucky Coins + 125 XP**.
- First daily pack remains free; subsequent access uses ticket/coins as designed.
- Card Dust conversion remains **100 Dust = 1 Pack Ticket**, with rarity-scaled dust values and protected-copy/bulk-dust safeguards.
- Trade persistence/market semantics, promo filtering, pack collation/entitlements, sealed pack collection, cosmetics progression, achievement rewards, and save reconciliation all passed the focused current acceptance coverage.
- Achievement sleeve reward references and rare-event reward plumbing remain valid in their focused checks.

No further global currency increase/decrease was applied here: after correcting Fishing, the Stadium outliers, and the Game Corner exploits, the surrounding economy is coherent enough that blanket changes would risk destabilising progression rather than improving it.

## Static/mobile/integrity checks

Fresh static scan of `index.html` and local assets:

- **357** local `src`/`href` references checked; **0 missing**
- **1,092** DOM IDs; **0 duplicates**
- **154** `<img>` tags; **0 missing `alt` attributes**
- **0 unfinished-code markers** in shipped source text

Arcade asset verification also passed:

- **44** authentic scenes/sheets/crops
- **2,098** offline Arcade sprites
- **2,078** unretouched Arcade actors
- Adventure asset verifier: **829 images**, **1,025 species**, **386 back sprites**, **0 errors**
- Fossil Museum verifier: **42 images** passed
- Venue verifier: **8 local venue assets** passed

Mobile-focused current tests include Barrier Ball start/control handling, Rampage Rollout layout, Fishing mobile polish, Picross touch/magnify behaviour, and the shared help/pause contracts.

## Verification

A fresh current acceptance run covered **152 test files / 524 subtests** across Adventure, Arcade, recent minigames, Game Corner, Fishing, Packs/Dust, Trade, save recovery, Collection/Cosmetics, Picross, mobile regressions, and the v0.69.14 audit/release checks:

- **524 passed**
- **0 failed**

A separate Records/help/rare-event suite ran **34/34 passed**.

Current release identity test: **passed** for v0.69.14.

### Known verification limitations

- Browser-driven Playwright tests cannot be run in this environment because the supplied/incomplete local Playwright installation cannot be required. Those tests were not counted as passing.
- The historical sleeve provenance verifier expects old QA capture/provenance files that are not present in this source delivery. The runtime sleeve catalogue itself reports 202 decoded images; this limitation is about reproducing that historical audit, not evidence of broken in-app sleeves.
- One repository-hygiene test expects `card-art-index.json` in the *parent canonical repository root*, outside this source ZIP, so it is not a valid standalone source-archive acceptance test. Generated test artifacts are excluded from the release ZIP.
- This source archive contains no Gradle wrapper and the audit environment has no system Gradle installation, so an Android APK build could not be executed here. GitHub Actions remains the build path from canonical `source/`.
- Historical version-identity/preservation tests intentionally frozen to old releases are not treated as current v0.69.14 acceptance criteria.

## Release identity

- Version: **0.69.14**
- Android `versionCode`: **6995**
- Browser build marker: **0.69.14**

This release is a QA/economy pass only. No next backlog minigame has been started.
