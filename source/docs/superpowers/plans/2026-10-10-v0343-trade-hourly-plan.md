# LuckyDex v0.34.3 Hourly Trade Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change Global Link Trade from deterministic four-hour windows to deterministic one-hour windows without breaking save compatibility or retry throttling.

**Architecture:** Keep the existing single persisted market snapshot and deterministic slot/fingerprint model. Only the slot cadence/version and migration behavior change; accepted flags, opened-set discovery, artwork recovery and 15-second failure retry remain untouched.

**Tech Stack:** Vanilla JavaScript, Android WebView, Node.js CJS tests.

**Spec:** `docs/superpowers/specs/2026-10-10-luckydex-v0343-release-design.md`

## Global Constraints

- `REFRESH_HOURS = 1`.
- Countdown targets the next local clock-hour boundary.
- Deterministic market slot changes once per hour.
- Failed refresh retry throttling remains 15 seconds.
- Existing four-hour market snapshots are invalidated/migrated without deleting ownership, trade history, accepted history or opened-set discovery.

## Review Focus

- Crossing midnight must generate the next local-hour slot correctly.
- A stale four-hour market must refresh once, not loop every second.
- Failed hourly refresh keeps the last valid market visible.
- Retry throttle stays 15 seconds after a failed refresh.
- Same hour + same opened-set fingerprint remains deterministic across reloads.

---

### Task 1: Pin one-hour slot behavior and migration

**Files:**
- Modify: `app/src/main/assets/trade-v0163.js:1-140`
- Test: `tests/v0343-trade-hourly.test.cjs`
- Test: `tests/v024-trade-market.test.cjs`

**Interfaces:**
- Produces: existing `LuckyDexTrade.clock(date?) -> {slot,next}` with one-hour semantics.
- Preserves: `_test.marketRefreshDue`, `_test.markMarketAttempt`, `_test.ensureMarket`.

- [ ] **Step 1: Write failing hourly clock tests**

Assert `10:15 -> next 11:00`, `23:59 -> next 00:00 next day`, and two dates in the same local hour share one slot while adjacent hours do not.

- [ ] **Step 2: Write failing migration test**

Seed `state.trade.marketVersion`/snapshot from the old cadence and assert first entry invalidates the stale slot for rebuilding while preserving `openedSets`, `boards`, `totalTrades` and accepted history stored in legacy data.

- [ ] **Step 3: Run and verify RED**

Run: `node tests/v0343-trade-hourly.test.cjs`
Expected: FAIL because `REFRESH_HOURS` is still 4.

- [ ] **Step 4: Implement hourly cadence and bump market version**

Set `REFRESH_HOURS=1`, update the top-level comment, and bump `MARKET_VERSION` so an old four-hour snapshot cannot be mistaken for a current hourly snapshot. Do not reset unrelated `state.trade` keys.

- [ ] **Step 5: Preserve retry throttling and last-good market behavior**

Keep `MARKET_RETRY_MS=15000`, `marketRefreshDue()` and `ensureMarket()` failure semantics unchanged except for the new slot identity.

- [ ] **Step 6: Run hourly and legacy trade regressions**

Run: `node tests/v0343-trade-hourly.test.cjs && node tests/v024-trade-market.test.cjs`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/src/main/assets/trade-v0163.js tests/v0343-trade-hourly.test.cjs tests/v024-trade-market.test.cjs
git commit -m "feat: refresh trades hourly"
```
