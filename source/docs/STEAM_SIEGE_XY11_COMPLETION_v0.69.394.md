# Steam Siege (XY11) — complete gameplay mapping v0.69.394

**Source:** official pinned English `xy11` catalogue, immutable SHA `22ea97ca00b595fe6b121494fd45dd65692deee6` (116 printed cards; 161 attacks, 18 Abilities, 7 BREAK prints, 12 dual-type prints). This overlay follows successful v0.69.392b GitHub CI and v0.69.393 Stage 3.

## Completion

- 116/116 print entries are now `battleEnabled`, including the 22 previously gated prints and identical alternate-art effects.
- No card-specific `STRICT` or `UNVERIFIED_ABILITIES` gates remain in `scripts/xy11_verified.py`.
- Added the completed effects for Shiftry / Wicked Wind, Infernape / Flare Up, Samurott / Ultimate Blade, Clawitzer BREAK / Lock-On, Nidoking / King's Palace and Power Lariat, Drifloon / Transfer Pain, Drifblim / Burst Curse, Lampent / Mirror Mirror, Armaldo / Rushing Water, Spiritomb / Damage Play, Bastiodon / Counter Head, Klinklang / Heavy Bumper and Gear Spinner, Magearna-EX / Mystic Heart and Soul Blaster, Klefki / Wonder Lock, Hydreigon / Dark Burn, Meowth / Stall, Talonflame / Gale Wings and Aero Blitz, Greedy Dice, Ninja Boy, and Pokémon Ranger.
- Preserved printed attack costs, physical Energy attachments versus Energy Zone, both alternate-art pairs, standard BREAK inheritance, and all previous XY10 + XY11 gameplay mappings.
- Added the actual second player's first-turn-only action gate for Meowth's Stall, the opening setup legal action for Gale Wings, face-down Prize handling for Greedy Dice, post-damage Counter Head and Lock-On resolution, and end-of-opponent-turn Wonder Lock removal.
- The single-set 30-card automatic builder now avoids Greedy Dice as generic hand-playable Item filler and limits automatic Ninja Boy / Ranger to tactical packages. Explicitly retained user-selected copies remain legal.

## Verified checks

Run the complete local preflight before pushing:

```sh
python3 source/scripts/check-gradle-source.py --self-test
(cd source && python3 scripts/preflight-xy11-release.py --full && python3 scripts/preflight-xy10-release.py --full)
```

This regenerates the pinned catalogue, requires exactly 116 enabled prints, checks all attack and Ability descriptors and energy costs, exercises the new runtime interactions, and executes the **full `v07333-classic-deck-quality.test.cjs` gate** that blocked previous GitHub APK builds. The Gradle `auditXY11ForApk` task includes the new `tests/v07394-steam-siege-completion.test.cjs`.

**Not claimed:** No Android APK build or live GitHub Actions success was observed for this new version at packaging time. Follow up with the actual GitHub workflow. An independent card-by-card adversarial gameplay audit remains valuable after installation.

## Known modelling boundaries to revisit during independent audit

- Choice UI for Dark Burn offers ordered Energy discard-count selections. It records the corresponding physical Basic/Special Energy, but arbitrary combinations of many Special Energy attachments deserve a user-interface audit.
- Pokémon Ranger clears modelled ongoing attack conditions and tags attack-created modifiers; interactions with earlier expansion-specific state flags warrant dedicated cross-era adversarial testing.
- Wicked Wind suppresses Tool/Stadium effects without removing physical cards; combinations with obscure earlier Stadium effects deserve full cross-era review.

**Build discipline:** If any preflight fails, fix the source, never disable the gate or weaken assertions to obtain a green build.
