# LuckyDex v0.69.278 — Arceus source-authenticity repair

The v0.69.277 Termux preflight passed 17 of 18 tests. The remaining test correctly detected that Sceptile pl4-30 **Green Breath** was serialized as a `power`, although the pinned physical print calls it a **Poké-Body**.

## Correction
- Keep the `energyAttached` trigger and its original `fromHandOnly=True`, `energyType='Grass'` and healing amount 20.
- Set `body=True` when building the trigger in `scripts/pl4_completion.py`, preserving printed `printedPowerType='body'` and `disabledByStatus=False`.
- Keep the immutable upstream archive check and all tests; no test expectations are weakened.
- Increment Android and UI version to v0.69.278 (versionCode 7264).

## Verification
- Direct Python regression assertions on the mapped printed Body and trigger: passed.
- Local v07276/v07277 Node tests: 14/14 passed.
- v07275 authenticated 111-print test requires the pinned 111-card archive; this offline development host cannot fetch it, so Termux/GitHub is the authoritative next check.
- GitHub APK and Android device behaviour are not yet verified.

## Install over v0.69.277

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.278_ARCEUS_GREEN_BREATH_FIX.zip -d source && \
sh source/scripts/prepare-arceus.sh && \
git add source && \
git commit -m "LuckyDex v0.69.278 fix Arceus Green Breath" && \
git push origin main
```
