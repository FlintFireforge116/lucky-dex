# Darkness Ablaze continuation — v0.69.477

Base: v0.69.476. The canonical compact source remains unchanged and SHA-pinned. 178/201 prints are enabled (+40), 23 remain gated. See SWSH3_CURRENT_GAP_LEDGER.md for the exact outstanding prints.

## Runtime changes
- Dark Asset uses a hand-only bench trigger and a shared turn marker across both Crobat V arts. Bird Keeper switches before drawing; Sky Circus reads the actual Supporter turn marker. Familiar Bell searches by matching a discarded Pokémon's name; Kabu varies draw count by bench presence.
- Rare Fossil uses the existing physical Trainer placement path, 70 HP, no retreat and status immunity. Fossil Search uses chosen deck references. The unlocked Fossil family still requires the normal evolution timing and the corresponding parent.
- Heat Fire Energy, Hiding Darkness Energy and Powerful Colorless Energy use typed physical attachments with holder-type bonuses. Deep Forest Camo prevents damage, not attack effects; Big Parasol prevents effects, not damage. Heal Jamming applies to opposing Bench only.
- Reused Energy return, discard recovery, repeatable hand attachment, evolution, movement, damage scaling, and attack-damage reaction descriptors. Turbo Patch limits recipients to Basic non-GX; Sturdy uses full-HP opposing attack KO protection. CPU accepts Dark Asset and Familiar Bell; Hurricane Blender moves toward its Active and stops even past the turn action threshold.

## Verification and limits
- 59/59 current set tests passed, including new bilateral outcomes and CPU convergence; 287/287 recent Sword & Shield/Rebel Clash/deck performance regression tests passed. Gradle source guard, release version and static current-set parity passed. Historical sweep stopped after DET1 without a reported failure; full historical sweep, nested preparation, Android compilation, on-device verification and independent whole-set semantic audit remain outstanding.
- Existing hybrid hand size, bench limits, Energy ledger and historical interactions remain in force. Coverage is descriptor and targeted-test evidence, not exhaustive cross-era outcome proof. In the final audit, review active-only attack modifiers on selected-target attacks, physical Energy and attachment interactions, reactive Ability timing, and cross-era evolution/attack-effect protections.
