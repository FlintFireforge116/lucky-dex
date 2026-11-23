# Thunder Rod — LuckyDex hybrid balance override (23 November 2026)

## Why this is different from the TCG

The printed XY7 Ancient Origins Ampharos-EX #27/#87 Thunder Rod does **not** flip coins; it searches the top four physical deck cards. LuckyDex deliberately places Basic Energy in a separate Energy Zone. The first hybrid adaptation made Thunder Rod effectively an automatic four-Lightning attachment in monotype decks, which the player reported as too strong. The **user requested** a coin-flip cap.

## New, intentionally modified hybrid rules

1. When the attack resolves, reveal up to four *actual* ordered Basic Energy units from the active player's finite Energy Zone. Do not touch physical draw-deck cards.
2. Roll **four independent coins exactly once**; record all four outcomes for the existing UI coin presentation.
3. For each heads, the player may attach up to one **revealed Lightning** unit to the attacking Ampharos-EX. Total attached is at most `min(heads, revealed Lightning count)`; no synthetic energy is created. A mixed-type zone can therefore yield fewer attachments than heads.
4. Any unchosen Energy is returned to the Zone and the Zone is shuffled. The player may choose to stop attaching before the allowance is exhausted. The CPU should claim eligible attachments rather than dismiss them.
5. Attack remains legal when there are no Lightning units or zero heads. The choice flow must never repeat the coin tosses, stall or trigger a second attack. Both regular and alternate-art Ampharos-EX use the same effect descriptor.

This rule applies to LuckyDex only. The official printed TCG rule remains unchanged in the card source. In-battle rules text explicitly identifies this as the *LuckyDex hybrid rule* instead of misleadingly promising four unconditional attachments.

## Regression checks

- `tests/v07372-ancient-origins-stage9.test.cjs` is part of mandatory Gradle `auditXY7ForApk`; has deterministic four-tails, one-head, four-head / four-energy, supply cap and CPU completion tests.
- `tests/v07402-field-reported-attack-fixes.test.cjs` verifies the established XY7 effect mapping as well as Rip Claw and Exavolt.
- `tests/v07403-wild-edge-cpu-turn.test.cjs` continues to protect Steelix-EX and Braviary Wild Edge.
- Gradle source guards and Steam Siege `--full` preflight passed locally. GitHub Actions APK build must still be verified by the user after pushing.

## Install

Combined source-relative overlay includes the earlier Rip Claw/Exavolt/Wild Edge changes to avoid patch-order dependency. Extract into `source/` using `unzip -o PATCH.zip -d source`, then commit and push `source`. No prepare script necessary. Keep APK version code/name at 7401/0.69.401 until the next coordinated set release.
