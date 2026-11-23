# LuckyDex v0.69.411 — Ultra Prism Stage 7 integration and audit

Cumulative patch over the **working Stage 6 0.69.410 patch**. Preserves the pinned official Ultra Prism catalogue and all preceding integration fixes.

## What is new

**13 exact-print-locked attacks:** Quick Dive, Psywave, Rumbling Wires, Dragon Pulse, Rocket Fall, Evil Admonition, Spinning Fan, Toss Aside, Swagger, Lunar Payback, Rip and Run, Wind Wheel and Damage Transport.

**1 Ability:** Gible's Rock Hiding; removes only its own Retreat Cost when Fighting Energy is attached.

**1 Item:** Peeking Red Card; reveals the opposing hand and offers the optional same-count physical deck redraw. The original card identities are maintained if the choice is declined.

Shared-gameplay fixes and safeguards:
- Quick Dive applies normal Active Weakness/Resistance; Benched Pokémon are unaffected by Bench Weakness/Resistance.
- Spinning Fan applies ordinary attack damage to Active, then 20 to each opposing Benched Pokémon.
- Lunar Payback chooses and discards exactly one attached Energy before swapping actual damage counters; it works on both player and CPU.
- Damage Transport moves at most four counters from **each** own Pokémon to the opposing Active, never creating extra counters.
- Opposing discard attacks and random hand discard preserve physical card IDs; no new virtual Basic Energy comes from the fresh Zone.
- The Gradle source guard, all older release contracts, both versioned XY/SM integration tests, and the SM5 print-text audit are updated together to prevent stale build checks.

The immutable Pokémon TCG source Git blob for SM5 remains `66cbd13b706b789de3b8cce2f5c9fc95135a33b0`.

## Local tests and confidence

| Check | Result |
|---|---:|
| SM5 Stage 7 in-battle outcomes | 19/19 passed |
| SM5 Stage 2–7 combined outcomes | **113/113 passed** |
| Crimson Invasion full gate | **124/124 passed** |
| Burning Shadows full gate | **146/146 passed** |
| Guardians Rising outcomes (bounded concurrency) | **114/114 passed** |
| Sun & Moon full gate | **64/64 passed** |
| XY12 Evolutions full release gate | Passed |
| JS / Python syntax and Gradle source checker | Passed |
| Exact text of the 15 new mappings against pinned upstream sm5.json | Matched |
| Source-only ZIP integrity and exact source byte matching | Passed |
| Complete 178-print SM5 generator/preflight | **Run with `prepare-sm5.sh` in Termux; canonical compact source not available locally** |
| GitHub Actions APK | **Not run or confirmed** |

The first unconstrained SM2 regression runner stalled on this worker; a separate `node --test --test-concurrency=2` rerun passed all 114 tests. The full SM5 catalogue check cannot be accurately claimed as passed without the pinned compact file produced by the preparation step.

No claim that all 178 Ultra Prism prints are complete: unsupported printed mechanics remain explicitly gated. Both official alternate-art and standard prints reuse their text-locked effects.

## Termux installation

```sh
cd ~/lucky-dex && \
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.411_SM5_ULTRA_PRISM_STAGE7.zip -d source && \
sh source/scripts/prepare-sm5.sh && \
git add source && \
git commit -m "LuckyDex v0.69.411 Ultra Prism stage 7" && \
git push origin main
```

This ZIP is cumulative and includes Stages 1–6 including the Stage 5 release gate fix. GitHub APK build confirmation remains necessary.
