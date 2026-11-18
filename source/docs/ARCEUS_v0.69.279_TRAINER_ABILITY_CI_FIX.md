# LuckyDex v0.69.279 — Arceus Fossil Poké-Body exporter repair

**Issue:** After v0.69.278, the local authenticated 111-card test stopped at Old Amber #89. Printed Hard Amber was absent from generated `abilities` because the Trainer export emitted only `printedAbilities`.

**Fix:** In `scripts/build-arceus.py`, retain the mapped `abilities` on the Trainer row as well as its printed text; `Hard Amber`, `Rock Reaction`, and `Aqua Reaction` now serialize as executable effects. In `scripts/pl4_completion.py`, `Rock Reaction` and `Aqua Reaction` are both explicitly printed Poké-Bodies (`body=True`), not Poké-Powers. Green Breath remains a Body. The original source SHA check is unchanged.

**Tests:** A separate synthetic, offline generator regression now checks all 30 printed ability classifications across 111 fixture records and verifies the three Fossils remain playable. The existing full authentic print comparison, set/deck/CPU tests, and interaction tests still run on the prepared real archive. No audit assertions were relaxed.

**Validation limits:** Offline serializer fixture and previous Node interaction tests pass. Real pinned 111-print comparison, GitHub APK, and phone behavior still require a fresh Termux preparation and GitHub run.

## Install over v0.69.278

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.279_ARCEUS_FOSSIL_BODY_FIX.zip -d source && \
sh source/scripts/prepare-arceus.sh && \
git add source && \
git commit -m "LuckyDex v0.69.279 Arceus Fossil Body fix" && \
git push origin main
```
