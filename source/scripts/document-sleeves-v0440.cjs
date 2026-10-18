'use strict';
// Rebuild the human-readable source manifest from the one runtime registry.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const {CATALOGUE,SOURCE_COVERAGE}=require('../app/src/main/assets/cosmetics-catalog-v0413.js');
const escape=s=>String(s??'').replace(/\|/g,'\\|').replace(/\r?\n/g,' ');
const lines=[
'# Sleeve source manifest — v0.44.0',
'',
'Snapshot date: 16 October 2026. The supplied v0.43.1 ZIP is the sole application baseline. This document is development provenance; undiscovered names and requirements stay masked in the app.',
'',
`The catalogue contains **${SOURCE_COVERAGE.total} distinct designs**: **${SOURCE_COVERAGE.physicalDesigns} Physical TCG**, **${SOURCE_COVERAGE.pocketDesigns} TCG Pocket**, and **${SOURCE_COVERAGE.luckydexOriginals} LuckyDex originals**. All artwork is packaged locally; reference URLs are never needed to render a sleeve.`,
'',
'The Pokémon Center UK category enumerated 130 products: three playmats were excluded, 14 repeated designs consolidated, and the two-design Celestial pack split into two. That accounts for all 130 products and yields 114 distinct sleeve designs. All 78 entries on the Serebii Pocket sleeve reference are represented. These are complete snapshots of those references, rather than every sleeve ever issued worldwide.',
'',
'Detailed acquisition, alternate SKUs, crops, availability and original-art prompts: [Physical TCG](PHYSICAL_SLEEVES_v0440.md), [TCG Pocket](POCKET_SLEEVES_v0440.md), [LuckyDex originals](LUCKYDEX_ORIGINALS_v0440.md). Machine-readable hashes, dimensions, bytes and stable source IDs are in `app/src/main/assets/cosmetics/sleeves/manifest-v0440.json`; acquisition metadata and prompts are in `scripts/data/sleeves-*-v0440.json`.',
'',
'## Save compatibility and progression',
'',
'All 30 old IDs remain valid. Eight original IDs keep their identity with new illustrated art; 22 keep their old saved/reward IDs while representing real official designs. The source ID column below records that mapping. The other 172 designs use new stable IDs. Only the existing four basic LuckyDex sleeves are immediately available. Existing ownership, equipment, claimed tokens, discoveries and achievement bindings are retained.',
'',
'New content uses 82 thematic reward groups, with at most five new designs per group, plus the new Adventure Passport bound to the existing Kanto clear evidence. The 26 original reward bindings remain. The exact saved-state contract is in [COSMETICS_PROGRESSION_v0440.md](COSMETICS_PROGRESSION_v0440.md). Six undiscovered legacy secrets retain `???` presentation and no disclosed requirement.',
'',
'## Complete catalogue',
'',
'Packaged paths are relative to `app/src/main/assets/`. Secret rows show their app label and the post-discovery name for provenance.',
'',
'| Stable sleeve ID | Displayed name | Source family | Source design ID | Reference | Packaged asset |',
'| --- | --- | --- | --- | --- | --- |'
];
for(const r of CATALOGUE){const name=r.hidden?'??? → '+r.realName:r.name;const url=r.referenceUrl||'LUCKYDEX_ORIGINALS_v0440.md';lines.push(`| \`${escape(r.id)}\` | ${escape(name)} | ${escape(r.sourceFamily)} | \`${escape(r.sourceId)}\` | [source](${url}) | \`${escape(r.artPath)}\` |`);}
fs.writeFileSync(path.join(root,'docs/COSMETICS_SOURCES_v0440.md'),lines.join('\n')+'\n');
console.log('Wrote complete source manifest for '+CATALOGUE.length+' sleeves');
