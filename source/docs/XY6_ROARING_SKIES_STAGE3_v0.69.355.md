# LuckyDex v0.69.355 — Roaring Skies Stage 3

## Build baseline

GitHub Actions run #643 built v0.69.354 successfully. Stage 3 retains the fixed official XY6 112-print / 147-attack / 15-Ability / 12-Ancient-Trait catalogue and the immutable upstream Git blob. The newly generated catalogue still remains a build-time artifact; local Node tests are not proof of an APK build.

## Newly battle-ready prints & mechanics

- Shaymin-EX #77, #77a and #106: Set Up is an optional triggered Ability only for a Shaymin placed from the hand onto your Bench. Show a draw-to-six or decline choice. Draw only from the physical deck, obey the Classic eight-card hand ceiling and deck exhaustion. Do not trigger for deck-to-Bench effects or when the hand already has six or more. Ability suppression still applies. Sky Return already used a verified return-to-hand implementation.
- Double Dragon Energy #97: One physical Special Energy card may be attached to **Dragon-type Pokémon only**. While valid, it provides two independent flexible Energy units (Miracle:2), not all individual types simultaneously, not two physical cards and never generated Basic Energy. Both must be spendable on different typed attack requirements; other Special-Energy interactions see one physical card. On becoming non-Dragon, discard the actual attached ref. Crystal Beach and Miracle Wind interactions remain in the shared Energy logic.
- Healing Scarf #84: Heal the attached Pokémon by up to 20 **only when an Energy card enters that Pokémon from its owner's hand**, including a hand attachment through a card effect. Energy Zone, discard or deck attachments do not count. Respect any existing no-healing effects.
- Mega Turbo #86: Select a real Mega Evolution Pokémon and one eligible discarded Basic Energy, including the hybrid Basic Energy discard pool. Attach the energy; it is not an attachment from hand. If no Mega or available Basic Energy exists, do not offer a playable Trainer action.
- Trainers' Mail #92 and #92a: Inspect only the top four physical deck cards and optionally select one Trainer other than Trainers' Mail. Selecting it removes that actual card, and declining or finding no eligible card shuffles normally. The other cards return to deck; the alternate print is independently preserved.

## Deck-building / CPU rules

The existing CPU takes only legal attack and attachment actions, so Double Dragon can only be attached to Dragon Pokémon. Auto-builder reserves at most two owned/eligible Double Dragon Special Energy in decks with actual Dragon lines and excludes it from generic filler. It must not automatically add Mega Turbo without a Mega Evolution in the constructed deck. Healing Scarf needs a way to attach physical Energy from hand (for a generic deck this means Special Energy). Existing Spirit Link rules still pair their exact Mega/Primal forms.

## Not yet completed

Sky Field #89 requires a genuine **eight-slot Bench on each side** with visible/actionable slots 0–7 and a choice to discard Benched Pokémon down to five, with attached cards handled correctly, when Sky Field leaves play. The current battle UI is limited to five slots, and the LuckyDex Classic30 default normally uses three; do not enable a fake three/five-slot substitute. Other unique attacks and Abilities remain gated until each is tested.

## Regression gates

`node --test tests/v07355-roaring-skies-stage3.test.cjs` is included in `auditXY6Stage3ForApk`, downstream of both Stage 1 and Stage 2 suites and the official catalogue generator. Existing XY5, Energy, trainer and deck-quality suites were also run locally. No build success is claimed for this patch before CI verification.

## Termux

```sh
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.355_ROARING_SKIES_STAGE3.zip -d source
git add source
git commit -m "LuckyDex v0.69.355 Roaring Skies Stage 3"
git push origin main
```
