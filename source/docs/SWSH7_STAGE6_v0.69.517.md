# LuckyDex v0.69.517 — Evolving Skies stage 6

- 237 canonical prints, 232 enabled (+5), 5 gated. Garbodor VMAX (both prints), Dream Ball, Moon & Sun Badge and Treasure Energy are newly enabled.
- Rubbish Collecting uses the shared passive Tool-capacity descriptor. When suppression or loss of the ability creates excess Tools, its owner chooses a physical Tool to discard, preserving the other Tool and resuming pending KO/turn processing. CPU prefers removing an irrelevant Tool.
- Dream Ball and Treasure Energy intercept a face-down Prize claim before hand insertion. Optional choice; declining puts the same physical ref into hand. Dream Ball searches for a Pokémon (including evolved Pokémon), needs a free Bench space and an eligible search target, observes Item/Trainer locks and is not normally playable from hand. Treasure Energy is usable during the claiming owner's turn, attaches directly (not from hand or Energy Zone) and does not consume the regular hand attachment. CPU takes a useful attachment. Face-up Prizes do not trigger.
- Moon & Sun Badge uses the existing opposing Trainer effect guard, limited to Supporters, matching Pokémon V names and active Tool text. CPU avoids irrelevant recipients.
- Ordinary KO Prize claims are covered; direct historical Prize-moving effects and nuanced cross-era Trainer/Tool interactions remain independent-audit targets. Remaining gated prints: Milotic (Dew Guard) and Dracozolt V/VMAX (both prints each). Primeval Beak must prevent all physical hand acceleration, including bespoke historical handlers, without blocking Zone/discard attachments. Dew Guard needs player/hand-level Supporter protection, not a blanket negation of the opposing player's own benefit.
- APK compilation and physical-device checks remain separate.

- Full offline preparation exited 0: 1821/1821 test invocations, 142/142 Evolving Skies; 29 source gates; zero failures, skips or cancellations. Manifest unit tests 12/12.
