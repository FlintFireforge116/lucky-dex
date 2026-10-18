# LuckyDex v0.34.3 Release Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the approved pack-policy/rarity, hourly-trade and Dash gameplay changes into one verified v0.34.3 source archive without regressing v0.34.2.

**Architecture:** Execute the three subsystem plans independently, then perform versioning, full regression/asset validation and exact-ZIP verification. Packaging must happen only after all subsystem tests are green or an explicit environment limitation is documented.

**Tech Stack:** Gradle Android wrapper/config, Node.js test runner, Python/zip tooling already in repo.

**Spec:** `docs/superpowers/specs/2026-10-10-luckydex-v0343-release-design.md`

## Global Constraints

- Version name: `0.34.3`.
- Version code: `343`.
- Deliverable: `LuckyDex_source_v0.34.3.zip`.
- Include `TEST_REPORT_v0.34.3.md` with exact commands/results and unavailable browser/Android checks.
- Preserve application ID `com.example.luckydex` and the user's versioned-ZIP workflow.

## Review Focus

- `index.html` script order must load pack policy before every consumer.
- Source ZIP must contain exactly the verified source tree, not a stale pre-test copy.
- Existing save schema/data must open without destructive migration.
- Android app ID/signing/update identity must remain unchanged.
- Browser/Android checks must be reported as unavailable if not runnable; never counted as passed.

---

### Task 1: Execute subsystem plans in dependency order

**Files:**
- Plan: `docs/superpowers/plans/2026-10-10-v0343-pack-policy-rarity-plan.md`
- Plan: `docs/superpowers/plans/2026-10-10-v0343-trade-hourly-plan.md`
- Plan: `docs/superpowers/plans/2026-10-10-v0343-dash-gameplay-plan.md`

**Interfaces:** Pack plan first because `index.html` and shared rarity consumers are most cross-cutting; Trade and Dash are independent afterward.

- [ ] **Step 1: Complete and verify the pack-policy/rarity plan**
- [ ] **Step 2: Complete and verify the hourly-trade plan**
- [ ] **Step 3: Complete and verify the Dash gameplay plan**

### Task 2: Version and add release contract

**Files:**
- Modify: `app/build.gradle:11-12`
- Modify: `package.json:3`
- Create: `tests/v0343-release.test.cjs`

**Interfaces:** None new.

- [ ] **Step 1: Write failing release test**

Assert `applicationId 'com.example.luckydex'`, `versionCode 343`, `versionName '0.34.3'`, package version `0.34.3`, `pack-policy-v0343.js` script presence/order, hourly trade constant, and God Pack denominator still 1000.

- [ ] **Step 2: Run and verify RED**

Run: `node tests/v0343-release.test.cjs`
Expected: FAIL on old version values.

- [ ] **Step 3: Update version metadata only**

Set Gradle/package values to 0.34.3/343; do not change application ID or keystore configuration.

- [ ] **Step 4: Run and verify GREEN**

Run: `node tests/v0343-release.test.cjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/build.gradle package.json tests/v0343-release.test.cjs
git commit -m "chore: version LuckyDex 0.34.3"
```

### Task 3: Run full regression and asset validation

**Files:**
- Create: `TEST_REPORT_v0.34.3.md`
- Output: `artifacts/v0343-test-results.json` if existing runner supports it.

**Interfaces:** None new.

- [ ] **Step 1: Run the standard Node test inventory**

Run: `npm test`
Expected: all runnable non-browser tests pass; browser-dependent failures are classified separately, not ignored.

- [ ] **Step 2: Run asset validators**

Run the existing Arcade, Adventure, venue and Fossil Museum validation commands used by the most recent release reports.
Expected: PASS.

- [ ] **Step 3: Run Android build if Gradle/SDK are available**

Run the documented build from `docs/ANDROID_BUILD.md`.
Expected: debug APK builds; if toolchain is unavailable, record that exact limitation.

- [ ] **Step 4: Write `TEST_REPORT_v0.34.3.md`**

Include exact test counts, failed/skipped/unavailable categories, asset validator results, Android build status, version/app ID verification and any known limitations.

- [ ] **Step 5: Commit the report**

```bash
git add TEST_REPORT_v0.34.3.md artifacts
git commit -m "test: verify LuckyDex 0.34.3"
```

### Task 4: Package and verify the exact source ZIP

**Files:**
- Create: `/mnt/data/LuckyDex_source_v0.34.3.zip`

**Interfaces:** None new.

- [ ] **Step 1: Package the verified source tree**

Use the repository's existing packaging pattern; exclude transient caches/build outputs that previous source releases exclude.

- [ ] **Step 2: Re-extract the exact ZIP to a fresh directory**

Do not trust the working tree alone.

- [ ] **Step 3: Re-run release contract and focused v0.34.3 tests against the extracted ZIP**

Run at minimum `tests/v0343-release.test.cjs`, all `tests/v0343-*.test.cjs`, God Pack test, and relevant asset validators from the extracted copy.
Expected: PASS.

- [ ] **Step 4: Compute SHA-256**

Run: `sha256sum /mnt/data/LuckyDex_source_v0.34.3.zip`
Expected: one stable checksum recorded in the final response/report.
