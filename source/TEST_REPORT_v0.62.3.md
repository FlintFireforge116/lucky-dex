# LuckyDex v0.62.3 – Streaming Stampede target-display hotfix

## Fix
The persistent banner in Streaming Stampede now shows the **Pokémon currently being counted**, not the lead Pokémon from the Adventure party.

- Questions 1–4: shows the target species sprite and name.
- Question 5: switches to a clear **ALL POKÉMON** indicator.
- Removed Adventure party/state lookup from Streaming Stampede target rendering.
- Updated help wording to explicitly describe the count target.
- Release metadata updated to v0.62.3.

## Verification
Focused patch verification only.

- v0620-release.test.cjs: pass
- v0620-streaming-stampede-core.test.cjs: 7 pass
- v0620-streaming-stampede-integration.test.cjs: 2 pass
- v0621-stadium2-entry-regression.test.cjs: 2 pass

Total: **12 / 12 focused tests passed**.

Changed JavaScript files were syntax-checked with Node.

This is not a claim that the entire repository suite passed.
