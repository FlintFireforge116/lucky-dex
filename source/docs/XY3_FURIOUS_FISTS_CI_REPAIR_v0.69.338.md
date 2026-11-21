# LuckyDex v0.69.338: Furious Fists official-print import repair

GitHub Actions run #626 (2026-11-21) failed during :app:auditXY3ForApk: 30/31
checks passed. The remaining test compared Heracross-EX #4 against full-art
#105 and found the general Pokémon-EX Prize rule misplaced in Giga Power
#4's ATTACK text, while #105 left the rule at Pokémon level.

The upstream pinned catalogue contains the duplicate text. scripts/build-xy3.py
strips only the exact duplicated generic Prize suffix when that Pokémon
already contains the identical Pokémon-EX rule in card.rules. Both the
persisted compact catalogue and generated battle cards use the same canonical
attack text. The pinned source hash remains verified, and the EX two-Prize
behaviour and Giga Power's proper gameplay effect are preserved.

The new synthetic print-pair regression runs without downloading official
cards; the full 114-print independent audit remains mandatory on GitHub.
All local game mechanics, energy and deck-quality checks must pass before push.

Termux (patch extracts into source):
    cd ~/lucky-dex
    unzip -o /sdcard/Download/LuckyDex_patch_v0.69.338_FURIOUS_FISTS_PRINT_PARITY_FIX.zip -d source
    git add source
    git commit -m "LuckyDex v0.69.338 Furious Fists print parity fix"
    git push origin main
