# LuckyDex Black & White: Next Destinies — v0.69.304

Source: pinned `data/classic/bw4-print-compact.json` (103/103 prints).

- Pokémon-EX are **Basic** Pokémon with **two Prize cards** awarded when knocked out. They are **not** the same identity as earlier lower-case `Pokémon-ex`; preserve older ex-specific effects.
- The 30-card Classic format keeps its existing five-Prize setup and eight-card hand cap. KO awards are in the shared prize chooser; double Prize awards grant two sequential choices.
- Double Colorless Energy supplies two Colorless; Prism Energy supplies every type, one at a time, only to a Basic Pokémon; on evolutions Prism provides one Colorless.
- Gardevoir Psychic Mirage doubles only **Basic Psychic Energy attached to Psychic Pokémon** on its side. It does not replicate physical cards or multiply Special Energy.
- Energy discarded from attachments is recorded in the Basic Energy discard ledger. Special Energy travels as physical card references. Exp. Share moves exactly one **Basic Energy** from the knocked-out Active to the Pokémon holding the Tool **before** the remaining attachments are discarded. The Tool remains attached. Unlike recovering spent Energy, this move must not take a new unit from the ordered Energy Zone.
- Search Items Heavy Ball and Level Ball select eligible **physical deck cards**. Cilan's Basic Energy search honors the agreed ordered Energy Zone substitute. Player selections, CPU choices and the hand cap must all be respected.
- Pokémon Center is an optional once-per-turn Stadium heal for one of your Benched Pokémon, prevented by Heal Block. Skyarrow Bridge discounts Basic Pokémon Retreat Costs by one Colorless.
- Status, self-damage, copied attacks, conditional damage bonuses, opponent hand reveals, attack damage prevention and reallocation of attached Energy must complete before Prize selection.
- Set is exposed to player deck building, opponent set selection and collection management. The build gate regenerates offline from the pinned source and runs Next Destinies regressions.
- Integration smoke tests are **not** the same as an independent card-by-card printed-effects audit. Maintain review flags for specialised mechanics and verify on Android.
