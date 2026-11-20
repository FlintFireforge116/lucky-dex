# LuckyDex v0.69.315 — Plasma Freeze (BW9) independent master checklist audit

**Scope:** Audited the actual v0.69.314 integration ZIP/source, the pinned 122-print BW9 reference catalogue, the shared Classic effects engine and the `LUCKYDEX_MASTER_RULES.txt` handoff contract. All changed files in v0.69.315 are source-relative patches.

## Result and evidence

| Check | Result |
|---|---|
| Authentic numbered card prints | **122/122 registered** |
| Printed attacks / named abilities | **175 attacks / 17 abilities conserved** |
| Battle eligible | **119/122**, unchanged; three intentionally gated |
| Schema audit after corrections | **0 errors; 0 warnings** |
| Independent BW9 source / behaviour tests | **12/12 passed** |
| Local BW9 prepare/build gate | **24/24 passed** (12 original + 12 audit regressions) |
| Selected cross-set regressions, BW6–BW9 | **120/120 passed** |
| New 30-card BW9 CPU stress builds | **315/315 legal** across nine types and 35 seeds |
| Plasma-dependent CPU decks in the 315 stress runs | **199**, all contain physical Plasma Energy |
| Generic BW9 synthetic smoke | **128/370 executed**, **242 skipped**, no executed-action exceptions |
| Other static manual-review flags | **88** (not automatically bugs) |
| Android APK / real device | **Not verified here** |

### Confirmed defects corrected

1. **Ultra Ball #122:** its staged discard-cost handler assumed hand references had an `.r.uid` property. Two-card costs could throw a runtime TypeError. Both separate UIDs are now paid correctly; chosen physical deck Pokémon moves to hand.
2. **Superior Energy Retrieval #103:** the same bad reference access crashed payment; the retrieval also ignored Basic Energy in Classic's discard ledger. Now excludes the two freshly discarded cost UIDs and allows physical-discard or ledger sources, up to four cards within the approved hand cap.
3. **Thundurus-EX #38/#110 — Raiden Knuckle:** correctly retrieves physical discarded Energy but previously ignored the separate discarded-Basic-Energy ledger. Player chooses source then eligible Team Plasma Benched target; Special Energy stays physical.
4. **Kingdra #84 — Dragon Vortex:** existing code counted only some physical discard Energy because older prints expose `subtype` rather than `energyType`; it erased Basic Energy discard-ledger counts without returning those Energy cards to the actual deck. Both causes corrected.
5. **Chandelure #16 — Flare Navigate:** older-set Basic Fire Energy in the draw deck failed the lookup because it was identified by `subtype`. Corrected lookup; maintains exact deck-to-target attachment and 10 damage counter.
6. **Muk #46 — Sludge Crash:** the automatic discard selected the first attached Energy for every heads, violating the printed player-choice requirement. Now shows each legal Basic or physical Special Energy and repeats once per successful coin flip.
7. **Cryogonal #30 — Call Sign:** invalid engine search-filter `energyType` instead of `subtype` incorrectly described a search for Water Pokémon. Generator fixed and search behaviour tested.
8. **Pachirisu #37 — Minor Errand-Running:** invalid `basic` search-filter key; corrected to `basicEnergy`, verified against the Classic Energy Zone and physical Basic Energy.

**Verified rather than changed:** Miltank #93 Max Milk already healed the selected Pokémon and discarded Energy from Miltank (the attacker), as printed. Kingdra Tri Bullet's three different target choices work in a focused regression. The full-art duplicates of Heatran-EX, Thundurus-EX, Deoxys-EX, Latias-EX, Latios-EX, Tornadus-EX and Ghetsis preserve the normal print effects.

## Intentionally incomplete print mechanics

- **bw9-4 Exeggcute:** Propagation Ability activation from discard requires zone actions and Ability-suppression checks. This also means BW9-only Exeggutor cannot complete its evolution chain from an eligible BW9 Exeggcute; mixed-era decks may use other eligible Exeggcute prints.
- **bw9-56 Cofagrigus:** Six Feet Under requires precise self-KO, three distributed counters, KO ordering and prize handling.
- **bw9-94 Kecleon:** Imittack needs a printed attacking-Pokémon selector, copied attack name/effect and actual Energy payment.

These cards remain registered, but `battleEnabled=false` and `deckEligible=false`. Other historical rules and their scope are preserved.

## Limits and follow-up

The general static checklist still has **88 review flags**. It is conservative, and many flags reflect interactions already implemented globally; they are not certified issues without deterministic reproduction. The synthetic smoke runner executed **128 of 370 potential actions** and skipped **242** because its generated states couldn't make those actions legal. It found no exceptions among the executed actions, but this does not prove the 242 skipped actions correct. Manually review long CPU matches, card choice UX and attack/KO/prize animation sequencing on Android after building.

## Reproduction and installation

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.315_BW9_MASTER_CHECKLIST_AUDIT.zip -d source
git add source
git commit -m "LuckyDex v0.69.315 Plasma Freeze master checklist audit"
git push origin main
```

Local check: `cd ~/lucky-dex/source && sh scripts/prepare-bw9.sh`; this now runs both BW9 suites. The GitHub build also regenerates the BW9 catalogue and executes both suites before the Android asset merge.
