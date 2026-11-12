# LuckyDex v0.69.208 — Classic battle UI, Bench damage, and Energy dependencies

Built from the complete v0.69.207 source; apply only once over that version.

- Bench attack animations: custom neo/EX, Gym, Lental/Snap and direct generic damage handlers now report positive HP changes on Bench targets as benchDamage presentation events when they were not already logged. Each event identifies the actual target side and Bench slot; already-logged damage is subtracted to prevent duplicate effects. Tested with EX Holon Phantoms Camerupt Magnitude, Claydol Wide Laser, and a generic multi-target effect.
- Choice UI: Basic Energy options labelled "Recover Psychic Basic Energy" / "Find Metal Basic Energy" now show actual Energy card art. Generic actions such as "Recover 2 Basic Energy from discard" stay text-only. Text-only options are no longer formatted as clipped fake card-art tiles; labels and descriptions can wrap and the choice rail can scroll vertically.
- EX Holon Phantoms Crawdaunt ex: Splash Back's four-Bench printed requirement is adapted to LuckyDex's three-Bench format, with updated explanatory card text. The power is not offered while the opponent has fewer than three Bench Pokemon and correctly returns a chosen Bench Pokemon and attached cards to the owner's hand.
- Kingdra delta: explicit Fire + Metal attack Energy requirements and preferred Energy types in metadata. Fire/Metal Energy Zone output is checked in generated and saved decks; Metal-type cores additionally reserve one owned Special Metal Energy print for damage reduction and Metal supply when eligible.
- Card descriptions: straightforward damage attacks with no extra printed effect (e.g. Heat Blast) show a plain damage description instead of the generic "Resolve neo Rule effect" placeholder.

Testing: targeted v07208 tests for actual state changes, card display models, Crawdaunt and Kingdra. Existing Holon and Legend Maker regression suites pass. A wider historical Gym test run has three failures that were separately reproduced against the untouched v0.69.207 source, so they are not introduced here. Phone UI animation testing is still recommended.
