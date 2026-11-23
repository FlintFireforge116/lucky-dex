# LuckyDex v0.69.412 — Ultra Prism Stage 8 integration and audit

Cumulative source patch over the **working Stage 7 0.69.411 ZIP**, preserving the earlier Stage 5 release-gate fix, all Prism Star, Unit Energy and previous Ultra Prism effects.

## New printed-text-locked effects

**9 attack effects**: Empoleon's Total Command and Whirlpool, Alolan Dugtrio's Gold Rush, Garchomp's Royal Blades, Drampa's Outrage, Hippopotas's Eleventh Hour Tackle, Xurkitree-GX's Lighting-GX (official printed spelling), Celesteela-GX's Blaster-GX, Leafeon-GX's Grand Bloom-GX.

**4 Abilities**: Cherrim's Weather Guard, Magmortar's Incandescent Body, Shinx's Evolutionary Advantage, and Magearna's Change Clothes.

**3 Tools**: Escape Board, Electric Memory, Fire Memory. Alternate-art copies inherit identical effects from matching official text, including Escape Board 122a and 167 and Full Art Secret Rare prints.

### Specific gameplay safeguards

- **Grand Bloom-GX:** Evolves each eligible Benched Basic using actual deck cards; preserves UIDs, Energy and existing attached cards; choice is available when multiple evolutions qualify.
- **Lighting-GX:** Player chooses a real opposing hand card, which moves to that opponent's face-down Prize cards. Following-turn hand draws do not change or duplicate that original card reference.
- **Royal Blades:** +100 only after Cynthia has genuinely been played from hand in the current turn; the bonus does not persist into later turns.
- **Gold Rush:** Chosen physical Metal Energy cards come from hand; no Energy is fabricated from the Energy Zone.
- **Eleventh Hour Tackle:** +130 with three or fewer cards physically left in the player's deck, not the discard or Energy Zone.
- **Weather Guard:** Grass Pokémon on that side have no Weakness while Cherrim's Ability remains active, and suppression restores their normal Weakness.
- **Incandescent Body:** Burns the attacker even when Magmortar is knocked out by the attacking Pokémon's damage.
- **Evolutionary Advantage:** First-turn evolution exception only if that player went second, never if they went first.
- **Change Clothes:** Return exactly one original Tool card with no duplication, including a choice between two attached Tools on the same Pokémon.
- **Escape Board:** Decreases Retreat Cost by one and permits retreat even when Asleep or Paralyzed. Memories change the type of only the eligible Silvally-GX carrying the Tool.

## Release verification

| Check | Result |
|---|---:|
| Stage 8 actual gameplay outcomes | **19/19 passed** |
| SM5 Stage 2–8 combined gameplay | **132/132 passed** |
| SM4 Crimson Invasion full gate | **124/124 passed**, 126/126 printed and enabled |
| SM3 Burning Shadows battle regressions (bounded concurrency) | **146/146 passed** |
| SM2 Guardians Rising battle regressions (bounded concurrency) | **114/114 passed** |
| SM1 Sun & Moon full gate | **64/64 passed** |
| XY12 Evolutions full gate | **38/38 + 9/9 passed** |
| Build source guard / Python and JS syntax | **Passed** |
| ZIP content integrity and file-to-source byte matches | **Passed** |
| Complete SHA-pinned SM5 178-print generation and audit | **Not runnable locally**: canonical compact needs `prepare-sm5.sh` in Termux |
| GitHub Actions Android APK build | **Not confirmed** |

The immutable canonical SM5 Git blob remains `66cbd13b706b789de3b8cce2f5c9fc95135a33b0`. All 178 prints remain present in the generator with unsupported effects explicitly gated; **this is not yet a 178/178 playable release**.

The printed-text audit for the 16 new mappings is wired into the SHA-pinned full SM5 gate. The full 178-print audit must be completed in Termux before pushing, because the compact source cannot be downloaded into the local working container. SM3 and SM2 default-concurrency suites stalled in the current environment, then passed all 146 and 114 cases with `node --test --test-concurrency=2`; no test or release gate was removed.

## Termux installation

```sh
cd ~/lucky-dex && \
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.412_SM5_ULTRA_PRISM_STAGE8.zip -d source && \
sh source/scripts/prepare-sm5.sh && \
git add source && \
git commit -m "LuckyDex v0.69.412 Ultra Prism stage 8" && \
git push origin main
```

The ZIP includes cumulative Stages 1–7 as well as the new Stage 8 files.
