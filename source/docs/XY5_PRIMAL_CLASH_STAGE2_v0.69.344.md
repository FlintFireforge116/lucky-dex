# LuckyDex v0.69.344 — XY Primal Clash stage 2

Source: v0.69.343, user-confirmed Android GitHub build success. The immutable 164-print XY5 source SHA and all 217 original attacks, 13 abilities and 22 traits remain unchanged; Stage 2 enables ONLY printed cards whose mandatory mechanics are implemented.

## Implemented shared rules
- **Ω Barrage**: After an attack, retain a second attack for the same Active Pokemon, including after the opponent promotes after a knockout. Allow the second attack or skip it, but no other main-turn actions between the attacks. Never make an extra turn or trigger between-turn effects between the two attacks. Nidoqueen/Medicham become eligible only when their full printed attack effects are implemented.
- **α Growth**: A second physical hand Energy card may attach to the SAME Pokemon during the same turn. This uses the existing Classic separate hand-Energy limit and does not count Energy Zone attachments or effects.
- **α Recovery**: Double effective healing on the same physical Pokemon slot from actions, including effects resolved by choices; preserve no-healing restrictions. Does not double damage, only actual net healing.
- **Ω Barrier**: Still gated. The general Trainer target-prevention rule must be audited across all Trainer-targeting paths before enabling these prints.
- **Spirit Links**: Aggron, Gardevoir, Groudon and Kyogre. Attach as real Pokemon Tools; matching Primal/Mega evolution skips its printed normal end-turn rule. Wrong Tool does not help; deck builder does not auto-include a Spirit Link without the matching Mega/Primal Pokemon.
- **Shield Energy**: Attaches to Metal Pokemon only; provides one Metal, reduces attack damage received by 10 per attached copy after weakness and resistance. Off-type evolution discards the real Special Energy.
- **Wonder Energy**: Attaches to Fairy Pokemon only; provides one Fairy, blocks opponent attack effects (not damage); off-type evolution discards it.
- **Energy Retrieval #126**: Choose actual physical Basic Energy from discard OR the separately tracked Basic Energy Zone discard; never fabricate a copy without debiting its source. Maximum two; selection is visible.
- **Ninetales Barrier Shrine**: Prevent Stadium plays from either hand while an unsuppressed Ninetales #21 is in play.
- **Wailord-EX Water Veil**: A physical hand Energy attachment removes its own Special Conditions, never a passive Energy Zone attachment; applies to regular/alternate prints.
- **Medicham Yoga Kick**: Ignore both Weakness and Resistance explicitly.

## Deliberate remaining gates
Printed XY5 Abilities other than Water Veil and Barrier Shrine, all Ω Barrier cards, unimplemented Primal signature attacks (including Tidal Storm and Gaia Volcano), and other printed effects unsupported by the generator remain collectible but excluded from battle and auto-deck pools. Do not claim full 164-card completion.

## Verification
Node tests cover real legal actions, alpha Growth attachment count/target, alpha Recovery healing, Omega Barrage two attack turns, KO/promotion sequencing, matching Spirit Link, Shield/Wonder type limits and attack damage/effects, hand-energy trigger, Ninetales Stadium lock, physical and zone discard Energy Retrieval. Official 164-print and 30-card deck tests run in GitHub after the immutable catalogue generator. The GitHub APK for v0.69.344 is not yet confirmed.

## Termux
cd ~/lucky-dex
unzip -o /sdcard/Download/LuckyDex_patch_v0.69.344_PRIMAL_CLASH_STAGE2.zip -d source
git add source
git commit -m "LuckyDex v0.69.344 Primal Clash gameplay stage 2"
git push origin main
