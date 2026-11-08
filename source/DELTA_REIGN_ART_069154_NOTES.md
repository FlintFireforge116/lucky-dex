# Delta Reign card-art restoration — v0.69.154

- 141 English numbered card scans, main set 001–103 and secret rares 104–141.
- Source: https://billsarchive.com/delta-reign.html ; image paths recorded in `source/scripts/delta-reign-card-art-manifest.json`.
- Source game artwork, trademarks, and card art are copyrighted by their respective rights holders. Check redistribution rights before publishing this repository or APK.
- Run `bash source/scripts/download-delta-reign-art.sh` on a network-connected machine before committing; the script verifies all 141 files and refuses partial downloads.
- Bundled files are `source/app/src/main/assets/delta-reign-cards/me06-*.webp`. Remote card-art-index.json has matching GitHub raw paths; the Android app uses bundled relative asset paths for offline rendering.
- A supplemental embedded `me6` identity index makes Delta Reign show up even if the 199-set remote catalogue was cached before the set released, or if the user is offline.
- Pre-existing owned Delta Reign card URLs are repaired only when set identity and printed card number/name match. No data is discarded, and pack-odds or battle rules are unchanged.
- Old `me06` and `DLR` aliases are accepted for the supplement, but the canonical card-art set key remains `me6`.
