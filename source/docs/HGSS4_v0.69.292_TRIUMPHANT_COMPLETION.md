# LuckyDex v0.69.292 — HGSS: Triumphant completion

**English printed set:** 103/103 authenticated collector IDs (1–102, secret FOUR), source-pinned to `data/classic/hgss4-print-compact.json`, with generator hash validation unchanged. All 103 are battle-enabled and deck-eligible, zero gated.

## Implemented gameplay

- Exact two-half LEGEND pair mechanics: 99/100 Darkrai & Cresselia; 101/102 Palkia & Dialga. One Bench position per pair, two opponent Prize cards on KO.
- Darkrai & Cresselia: Lost Crisis, actual Energy to Lost Zone and defender KO movement; Moon's Invite sequential selected damage-counter transfers.
- Palkia & Dialga: Time Control discards all Metal Energy and adds two physical opponent deck cards to opponent Prizes; Sudden Delete returns chosen opposing Benched Pokemon and attachments.
- Mew Prime Lost Link uses attacks belonging to Pokemon cards actually in either Lost Zone, paying their printed costs; Gengar Prime Hurl Into Darkness and Catastrophe; Magnezone Lost Burn, Yanmega Insight, Electrode Energymite, Machamp, Celebi and others.
- Rescue Energy's attack-KO card return; Black Belt/Twins when behind in Prize count; Junk Arm actual discard and Item selection; Alph Lithograph FOUR private own-Prize inspection.
- Validated passive effects include Solrock Heal Block, Cubone Lonely Bone, Nidoking Pheromone Stamina, Indigo Plateau and Yanmega Insight.

## Validation / limitations

- `node --test tests/v07291-triumphant-stage1.test.cjs tests/v07292-triumphant-completion.test.cjs` (31/31), including 180 seeded CPU deck builds, action legality, target selection, printed Prize count and real attack KO with Rescue Energy.
- Independent `node scripts/audit-classic-set.cjs --set hgss4 --smoke --no-write`: 103/103, no errors/warnings/review flags, 332/338 smoke scenarios (six prerequisites skipped); CPU 16/16.
- Existing earlier HGSS/Unleashed/Undaunted regression suite must pass; v0.69.292 GitHub Actions APK and on-device gameplay are not yet verified.
- Do not call synthetic smoke checks proof of every device-visible timing, status or GUI interaction; this patch is a completion candidate pending independent audit and phone play.

## Apply via Termux

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.292_HGSS4_TRIUMPHANT_COMPLETION.zip -d source
git add source
git commit -m "LuckyDex v0.69.292 Triumphant completion"
git push origin main
```
