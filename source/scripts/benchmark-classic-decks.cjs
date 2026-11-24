'use strict';
// Optional local benchmark. Run with the same generated assets and machine
// before/after an optimisation; do not use timings as hard CI assertions.
const {performance}=require('node:perf_hooks');
const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const decks=require('../app/src/main/assets/tcg-classic-decks.js');
const rows=classic.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
const cases=[['player random',()=>builder.buildDeck(rows,{style:'random',randomSeed:13,types:['Water']})],['player competitive',()=>builder.buildDeck(rows,{style:'competitive',randomSeed:33})],['CPU',()=>cpu.generate({seed:1234,type:'Lightning'})],['owned subset',()=>builder.buildDeck(rows.filter(r=>/^(sm10|sm11)-/.test(r.gameplayId)),{sets:['sm10','sm11'],style:'random',randomSeed:52})],['player repeat',()=>builder.buildDeck(rows,{style:'random',randomSeed:84,types:['Fire']})]];
console.log(`Catalogue: ${classic.CARDS.length} prints, ${rows.length} battle/deck-eligible, ${builder.SET_IDS.length} builder set IDs`);
let failed=false;
for(const [name,build] of cases){if(process.argv[2]&&name!==process.argv[2])continue;const started=performance.now(),result=build(),ms=performance.now()-started;const legal=result.ok&&decks.validateDraft(result.cards,rows,{requireFull:true}).ok;console.log(JSON.stringify({name,ms:Math.round(ms),ok:!!legal,focus:result.focusCardId||result.archetypeKey,energyTypes:result.energyTypes,cards:result.cards,errors:result.errors||result.error}));if(!legal)failed=true;}
if(failed)process.exitCode=1;
