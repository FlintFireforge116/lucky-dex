# LuckyDex v0.69.308 — Black & White Dragons Exalted

## Full catalog

128/128 authentic printed card IDs, 200 attacks and 20 Abilities. 122 Pokémon, 4 Trainers, 2 Special Energy; full-art and secret rare identities preserved. Pinned print-compact source and deterministic build generator supplied.

## Battle and Classic format rules

- Dragon Pokémon are a distinct type, but use **printed non-Dragon multitype Energy costs**. No fictional Dragon Energy is created.
- Blend Energy GFPD and WLFM are physical Special Energy cards. They count as **one unit** providing one allowed listed type at a time; not four units.
- Pokémon-EX knockout grants two selectable Prizes; Shedinja Empty Shell awards none. Garbotoxin disables Abilities while its Tool is attached; Mew-EX borrows attacks from Pokémon in play.
- Rayquaza-EX Dragon Burst selects the discarded Energy type and damages according to actual discarded units. Ho-Oh-EX Rebirth operates from discard and uses three **distinct discarded** Basic Energy types, never free Energy Zone tokens.
- Rescue Scarf restores only the knocked-out Pokémon card to hand while attachments go to proper discards. Giant Cape increases HP by 20. Tool Scrapper chooses actual Tools.
- Leaf Tornado moves a real Grass-providing Blend Energy, and its choice order remains compatible with Black & White Base. Ampharos Electromagnetic Wall reacts to opposing hand attachments but not a generated Energy Zone attachment.
- Dragon CPU archetype chooses Dragon Pokémon and uses multitype Basic Energy required by printed costs.

## Tests and limits

- 29/29 dedicated gameplay tests.
- 281/281 pooled Triumphant through Dragons Exalted regression tests.
- 128/128 card catalog enabled; audit reports zero definite schema errors, zero warnings; 16/16 sampled CPU decks and 90 additional CPU legality combinations.
- 402/408 synthetic smoke scenarios executed; six skipped because their synthetic scenes lacked a legal action target (Manectric Energy Assist, Devolution Spray, Tool Scrapper across two sides).
- 57 static review flags; these flag complex mechanics for later independent review and do not prove card-by-card outcome correctness.
- Android/Gradle APK build and on-device play not tested in this environment. GitHub Actions build must be verified after Termux push.

## Install

Patch archive entries are relative to the Termux source directory (`unzip -d source`). Apply **over v0.69.307**:

```bash
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.308_BW6_DRAGONS_EXALTED.zip -d source
git add source
git commit -m "LuckyDex v0.69.308 Dragons Exalted complete set"
git push origin main
```
