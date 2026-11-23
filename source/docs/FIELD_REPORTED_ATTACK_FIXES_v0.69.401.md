# Field-reported battle attack fixes — overlay on LuckyDex 0.69.401

Reported 23 November 2026; fix is deliberately restricted to attack correctness, with no additional set or version-contract bump. Existing APK version labels remain at 0.69.401 until the next coordinated release, so GitHub Actions' new build and installed app should be verified separately.

## Groudon-EX (Primal Clash XY5 #85 and alternate #150) — Rip Claw

Official printed effect: 30 base damage; flip a coin; on heads, discard one Energy attached to the defending Active Pokémon. The base attack is ALWAYS legal against an opposing Active Pokémon even if that defender has no Energy. Root cause: the generic `coinFlip` action enumerator intersected attack choices with `discardEnergyCard` choices. When there was no Energy to discard the returned list was empty, so `attackAvailability` incorrectly displayed "No legal attack target". The engine now falls back to an untargeted attack action on an empty heads-only branch. Heads with an available Energy still discards the selected Energy card/unit, and tails has no discard.

## Ampharos-EX (Ancient Origins XY7 #27/#87) — Thunder Rod

The official attack does NOT flip any coins. It looks at the top four cards of the deck, attaches any Lightning Energy found to Ampharos-EX and shuffles the other cards back. LuckyDex has a distinct virtual Energy Zone, so the existing XY7 `xy7ThunderRod` implementation draws four ordered Zone units instead of fabricated Energy cards from the physical deck. Existing regression tests verify the four-unit limit, optional attachment, reshuffling, and CPU use. Do not replace this with arbitrary coin flips or a guaranteed Energy attach.

## M Ampharos-EX (Ancient Origins XY7 #28/#88) — Exavolt

Official printed effect: 120 base damage, optionally +50 damage, Paralyse defender and take 30 self-damage. Root cause: `chooseOption` happened in post-damage effect resolution and called `bonusDamage` through `applyEffect`, which raises `bonusDamage must resolve as part of an attack`. The generated attack descriptor is now `xy7Exavolt`: both options are available to the player BEFORE the attack resolves; `resolveAttack` applies +50 BEFORE matchup/KO calculations, then applies Paralysis and recoil as ordinary post-damage effects. The no-boost branch remains at 120 and has no recoil or Paralysis. UI labels the attack's alternatives as "CHOOSE EFFECT", not "CHOOSE TARGET".

## Validation and packaging

- Added `tests/v07402-field-reported-attack-fixes.test.cjs`: 11 dedicated assertions across both Rip Claw printings and both Exavolt printings, verifying zero-Energy defender, forced heads, forced tails, plus damage/status/recoil for both Exavolt outcomes, and validating official mappings.
- Added these tests to Gradle's `auditXY7ForApk` required task so the new tests run after pinned XY7 generation as part of APK build. Existing Ancient Origins and Primal Clash tests continue to run.
- Install source-relative ZIP overlay by `unzip -o /sdcard/Download/LuckyDex_patch_v0.69.401_ATTACK_FIXES.zip -d source`; no `sh prepare-...` step is necessary. Commit and push `source` as usual.
- This report describes local tests only; a GitHub Actions APK success must be verified after upload/push, not assumed.

## Follow-up CPU turn report — Wild Edge (Steam Siege XY11 and Plasma Storm BW8)

Steam Siege Steelix-EX XY11 #67 originally encoded Wild Edge with a post-hit `chooseOption` containing `bonusDamage(50)` and `selfDamage(20)`. This is the SAME timing bug as Exavolt: attack hits for 80 first, CPU enters effectChoice, then selecting boost throws `bonusDamage must resolve as part of an attack`. Confirmed by reproducing the exception with the original generated card. It could leave the CPU stalled and, in recovery, appear to attack twice. Changed the official mapped descriptor to `xy11Rule:wildEdge` with two preattack options (80, or 130 +20 recoil), and regenerated the XY11 official pinned output. No post-hit optional choice remains. CPU action recovery also now excludes a failed optional action and favours a legal skip/decline instead of retrying the same broken choice. Braviary BW8 #116 also has a separate Wild Edge with 60/80+20; do not mix up base and boosted values across printings.

New `tests/v07403-wild-edge-cpu-turn.test.cjs` covers all four outcomes, real CPU AI actions, no dangling effect choice, correct one-attack turn handoff for BOTH cards. It is mandatory in Steam Siege Gradle and full preflight. Existing v07402 covers the other three reported attacks. The combined overlay remains on base release 0.69.401.
