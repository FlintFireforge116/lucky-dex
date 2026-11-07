# LuckyDex v0.69.143 — Expedition Base Set: finish the eight partial cards

## Scope and source

This is an incremental follow-up to v0.69.142. No set re-import or migration: the printed 165-card Expedition catalogue, IDs and artwork remain unchanged. All **165/165** Expedition numbered prints now report `battleEnabled: true`, `deckEligible: true`, `support.status: FULL`, and are available to owned/restricted deck generation and CPU opponents.

## Newly implemented and game-engine integration

- **Alakazam #1/#33 — Psymimic**: Listed as a Poké-Power, but executes in place of Alakazam's regular attack. Offers eligible printed attacks from the opposing Active and Bench; checks their actual Energy costs and resolves damage/status as an attack by Alakazam. Unavailable under any Special Condition or ability suppression. The normal Syncroblast attack remains available. Copied source and move are labelled in the battle action UI.
- **Ampharos #2/#34 — Lightning Strike**: explicit choice between base 40 damage with Energy kept and 80 damage discarding all attached Lightning-providing Energy; discards basic Energy to the separate Energy discard and actual Special Energy cards to the card discard. Other attack modifiers still apply normally.
- **Venusaur #30/#68 — Harvest Bounty**: optional additional Active attachment triggered by a manual Energy attachment. Uses the very next entry in Classic's separate Energy Supply (the established one-per-turn custom Energy system), rather than rolling arbitrary Energy. Works from the Bench or Active, respects all Special Conditions, once per Venusaur per turn, and queues two Venusaur separately when both are eligible. Skipping does not consume the Power.
- **Multi Technical Machine 01 #144**: a regular attachable Tool which temporarily grants Paralyzing Gaze (one Colorless; Paralysis), usable through the normal attack UI/AI. It is discarded from its Pokémon at the end of its owner's turn, used or not.
- **Strength Charm #150**: regular Tool. Adds 10 attack damage after Weakness/Resistance when an attack does positive damage, including attack damage to the Bench. Marks the used Tool and discards it at the end of the same owner's turn. It stays attached if unused.
- Corrected the status blocker for Expedition Poké-Powers to include Poison/Burn, without changing other-era card rules.
- Shows clear `40 / 80` attack preview and keep/discard option names for Lightning Strike.

## Fidelity note

Expedition cards preserve their original printed text and attack costs. The existing LuckyDex Classic hybrid rules still use 30-card decks, five Prizes, 3 Bench spaces and a separate predictable basic Energy supply. Harvest Bounty adapts to that Energy Zone by taking the next card in order; it does not restore physical TCG's conventional basic Energy in the deck. No other card texts were deliberately rewritten.

## Versioning

Android `versionName '0.69.143'`, `versionCode 7123`; JS `window.__LUCKYDEX_BUILD='0.69.143'`; both visible `index.html` title and app version labels are `v0.69.143` (with their existing runtime JS synchronizer intact).

## Tests

- `node --test source/tests/v07141-legendary-collection.test.cjs source/tests/v07142-expedition.test.cjs source/tests/v07143-expedition-completion.test.cjs`.
- New direct mechanics coverage includes copying attacks, missing energy, all five status conditions, the optional Energy discard with special Energy, Harvest on Bench and with two Venusaur, skip/once-per-turn/zone ordering, Technical Machine attack and expiration, Strength Charm post-matchup damage and Bench targeting, plus a restricted Expedition opponent generation sample.
- Physical-device APK installation and manual UI testing are not performed by this patch.

## Install

From the repository root on Termux:

```sh
cd ~/lucky-dex
git pull --rebase origin main
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.143_Expedition_Completion.zip -d .
git add source
git commit -m "v0.69.143 Expedition mechanics complete and version sync"
git push origin main
```

This is **incremental to v0.69.142**; do not unzip into `source/` or it creates `source/source/`.
