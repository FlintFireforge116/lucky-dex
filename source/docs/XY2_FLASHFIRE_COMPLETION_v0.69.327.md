# LuckyDex Flashfire v0.69.327 — 19-print completion

## Scope
Complete the 19 Flashfire cards gated by the v0.69.326 audit: `xy2-7, -9, -20, -21, -23, -27, -29, -34, -35, -38, -39, -40, -43, -49, -50, -74, -82, -85, -101`. The pinned official Flashfire source still determines final battle-enabled coverage; source-dependent assertions run in GitHub Actions. This patch does not include any synthetic catalogue or downloaded art.

## Gameplay effects now implemented
- Shiftry Leaf Draw: physical Grass hand discard and draw three.
- Roserade Whiplash: repeat coins and select each actual discarded opposing Energy.
- Pyroar Scorching Fang: optional Fire Energy discard and +30 pre-damage choice.
- Qwilfish Counterattack Quills: +20 reactive damage on opposing attack, even if Qwilfish is KO'd.
- Milotic Energy Grace: self-KO, one non-EX recipient, three exact discarded Basic Energy units, then Prize/promotion.
- Luvdisc Heart Wink: skip only opponent's next natural turn draw on heads.
- Floatzel Rescue: return chosen discarded Pokémon refs to deck.
- Luxray Fang Snipe: reveal opponent hand and choose physical Trainer discard.
- Magnezone-EX 35/101 Dual Bullet: native two-target damage choices.
- Duskull Revival: Basic Pokémon from opponent discard to opponent Bench.
- Dusclops Cursed Drop: four targeted damage counters.
- Dusknoir Shadow Void / Pain Pellets: repeatable allied counter movement and targeted opposing counters.
- Meowstic Ear Influence: reallocate existing opponent board counters.
- Barbaracle Rock Rush: selected physical Fighting hand discard scales attack damage.
- Sneasel Flash Claw: defending player chooses one card from their hand to discard.
- Goodra Gooey Regeneration: repeatably discard chosen attached Energy to heal.
- Furret Buried Treasure Hunt: choose 2 of the top 4 physical refs; discard other 2.
- Lopunny Big Jump: native full stack/attachment return with Basic Energy in hand.

## Verification
The local generated source was a deliberately fabricated *schema fixture* and was never authentic printed-source evidence. It is excluded from the shipped patch. GitHub's pinned official-source generator will validate 110 collector rows, 153 attacks, 13 abilities and battle-readiness. Existing `v07325`/`v07326` and new `v07327` integration tests run in the APK audit gate. Direct tests verify real card identities, exact effects, choices, Energy accounting and core battle transitions.

## Remaining risk
A local test fixture passing all 110 rows is **not proof** that the pinned official catalogue will have 110/110 battle-enabled, nor that Android compilation will pass. Monitor the new GitHub build for its actual coverage and test report. If newly uncovered gaps appear in the real printed source, fix the implementation instead of weakening the audit.
