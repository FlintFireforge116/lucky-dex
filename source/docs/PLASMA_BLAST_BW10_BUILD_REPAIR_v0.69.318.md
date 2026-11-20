# LuckyDex v0.69.318 — Plasma Blast GitHub APK build repair

## Verified causes (real GitHub Actions logs)

The v0.69.316 and v0.69.317 Actions runs failed before APK compilation at Gradle task `:app:auditBW10ForApk`:

1. `BW10 source registration, print conservation and explicit unsupported gates` failed: generated `coverage().plasmaBlast` exposed `total`, while the test required `printed === 105` (`undefined !== 105`). The BW10 builder now exposes both properties.
2. `BW10 legal CPU decks use 30 cards...` failed with `BW10 legal builds 0/108`. BW10-only requests can now use a carefully constrained emergency deck composition when ordinary construction fails. It uses only battle-enabled BW10 prints, complete evolution lines, payable attack costs and 30 physical cards, with four-copy legality, ownership and ACE SPEC checks. No general/other-era deck logic is changed. Types unavailable in the set remain unavailable, rather than silently substituting others.
3. The full-art Virizion-EX (BW10 #96) incorrectly lacked its printed Emerald Slash attack mapping, despite the regular BW10 #9 having the same attack. The printed attack now shares the correct mapping; this print no longer requires an unsupported gate.

## Tests and status

- Local BW10 test suite (v07316, v07317, v07318): 27 passed, 0 failed.
- Extended Plasma Storm/Freeze/Blast regression suite: 77 passed, 0 failed.
- Locally reconstructed BW10 105-print fixture generated 101/105 battle-ready; the remaining explicit gates are BW10 #33 (Eelektross), #41 (Sigilyph), #86 (Reversal Trigger), #95 (Scoop Up Cyclone).
- Tests and regeneration were exercised against a **locally reconstructed full-catalogue fixture**. The user's committed BW10 compact source is already in GitHub and will be used during real GitHub Actions generation. The reconstructed fixture is deliberately **not included** in this ZIP.
- **An actual Android APK build has not yet been confirmed.** GitHub's complete build will validate the real pinned source and Android compilation.

## Install

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.318_BW10_GITHUB_BUILD_FIX.zip -d source
git add source
git commit -m "LuckyDex v0.69.318 Plasma Blast GitHub build repair"
git push origin main
```

This patch preserves all v0.69.317 battle mechanics, changes only affected project files, and requires no local prepare script.
