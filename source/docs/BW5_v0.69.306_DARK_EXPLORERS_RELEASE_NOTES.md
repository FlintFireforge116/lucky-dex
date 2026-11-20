# LuckyDex v0.69.306 — Dark Explorers

Incremental update **over v0.69.305**. Paths in ZIP are relative to `source`.

**111/111 cards**, pinned printed roster with 166 attacks, 11 named Abilities, 13 Trainer prints; six EX full-art variants and two-Prize rules. Collection, ownership, set picker, deck builder and CPU set selection integrated.

Dedicated implementations and engine reuse cover Dark Patch, Grand Flame, Charge Beam (real discard ledger), Dark Cloak, Ancient Scream, Dark Claw, Solar Revelation, Scorching Scales, Airhead, Old Amber Aerodactyl, Twist Mountain, Random Receiver, Ultra Ball, Hooligans, Junk Hunt and attack/coin choices. Old Amber is a true deck-family partner for Restored Aerodactyl. Damage bonuses are calculated before Weakness and Resistance, not appended afterwards.

## Verification

- 18/18 new Dark Explorers execution / builder tests passed.
- 202/202 cross-era regression tests passed.
- Set smoke: 111 enabled; 0 errors/warnings; 16/16 sampled CPU decks; 354/358 executed with 4 scenarios skipped where synthetic setup lacked a legal target (Dark Patch or Rare Candy), 0 execution failures.
- 68 static review flags remain: targeted independent audit is still worthwhile.
- On-device gameplay and the GitHub Android APK build have **not** been verified. Build-time test gate added to Gradle.
