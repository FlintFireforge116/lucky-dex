'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const A=path.resolve(__dirname,'../app/src/main/assets');
const D=require(path.join(A,'tcg-classic-battle-data.js'));
const builder=require(path.join(A,'tcg-classic-deck-builder.js'));
const decks=require(path.join(A,'tcg-classic-decks.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const optimiser=require(path.join(A,'tcg-deck-optimizer.js'));
const allRows=D.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
const exRows=allRows.filter(r=>['ex2','ex3'].includes(D.cardById(r.gameplayId)?.setId));
const names=r=>[...new Set(r.cards.map(D.cardById).filter(c=>c?.kind==='pokemon').map(c=>c.name))];
function legal(r){assert.equal(r.ok,true,(r.errors||[]).join('; '));assert.equal(r.cards.length,30);assert.ok(D.validateDeck(r.cards).ok);assert.deepEqual(decks.analyzeDeck(r.cards,r.energyTypes).missingEnergyTypes,[]);}

test('Regression: Grass/Fighting permitted types do not splash Volbeat into a Golem ex Fighting deck',()=>{
 const r=builder.buildDeck(exRows,{sets:['ex2','ex3'],style:'random',types:['Grass','Fighting'],focusCardId:'ex3-91',randomSeed:321});
 legal(r);assert.deepEqual(r.energyTypes,['Fighting']);
 assert.ok(r.cards.includes('ex3-91'));assert.ok(!names(r).includes('Volbeat'));
 const b=core.createBattle({format:'classic',playerDeck:r.cards,opponentDeck:r.cards,playerEnergyTypes:r.energyTypes,opponentEnergyTypes:r.energyTypes,seed:41});
 assert.deepEqual([...new Set(b.sides.player.energySupply)],['Fighting']);
 assert.equal(b.sides.player.nextEnergyType,'Fighting');
});

test('Deliberate opt-in still allows a two-type Grass/Fighting Golem ex / Volbeat combination',()=>{
 const r=builder.buildDeck(exRows,{sets:['ex2','ex3'],style:'random',types:['Grass','Fighting'],allowMixedEnergy:true,focusCardId:'ex3-91',randomSeed:321});
 legal(r);assert.deepEqual(r.energyTypes,['Grass','Fighting']);assert.ok(names(r).includes('Volbeat'));
});

test('Mandatory two-type attack costs are preserved even with mixed support turned off',()=>{
 const r=builder.buildDeck(exRows,{sets:['ex3'],style:'competitive',types:['Grass','Lightning'],focusCardId:'ex3-4',randomSeed:22});
 legal(r);assert.deepEqual(new Set(r.energyTypes),new Set(['Grass','Lightning']));assert.ok(r.cards.includes('ex3-4'));
});

test('Random mono-type builds and CPU-type restrictions retain legal Energy supplies',()=>{
 const opp=require(path.join(A,'tcg-classic-opponents.js'));
 for(const style of ['competitive','random'])for(const seed of [3,29,43,91]){
   const r=builder.buildDeck(exRows,{sets:['ex2','ex3'],types:['Water','Fighting'],style,randomSeed:seed*313});legal(r);
   assert.ok(r.energyTypes.every(t=>['Water','Fighting'].includes(t)));
 }
 for(const type of ['Fighting','Water']){const r=opp.generate({sets:['ex2','ex3'],type,seed:31});legal(r);assert.deepEqual(r.energyTypes,[type]);}
});

test('Classic optimiser evaluates Classic cards, prefers mono Energy and Pocket evaluation remains usable',()=>{
 const mono=builder.buildDeck(exRows,{sets:['ex2','ex3'],style:'random',types:['Grass','Fighting'],focusCardId:'ex3-91',randomSeed:321});
 const mixed=builder.buildDeck(exRows,{sets:['ex2','ex3'],style:'random',types:['Grass','Fighting'],allowMixedEnergy:true,focusCardId:'ex3-91',randomSeed:321});
 const m=optimiser.evaluate(mono,'any','classic'),d=optimiser.evaluate(mixed,'any','classic');
 assert.ok(m.score>d.score,`${m.score} vs ${d.score}`);
 assert.ok(m.tempo>0,'Actual Classic Pokémon attacks must count towards Classic scoring');
 assert.ok(Number.isFinite(optimiser.evaluate({cards:[],energyTypes:['Lightning']},'any','pocket').score));
});

test('The user-facing builder exposes an opt-in mixed Energy toggle; all version labels agree',()=>{
 const ui=fs.readFileSync(path.join(A,'tcg-classic-deck-editor.js'),'utf8');
 assert.match(ui,/auto-mixed-energy/);assert.match(ui,/allowMixedEnergy:false/);assert.match(ui,/allowMixedEnergy:!!autoOptions\.allowMixedEnergy/);
 const gradle=fs.readFileSync(path.resolve(__dirname,'../app/build.gradle'),'utf8');
 const version=gradle.match(/versionName '([^']+)'/)?.[1];assert.equal(version,'0.69.168');assert.match(gradle,/versionCode 7148/);
 const app=fs.readFileSync(path.join(A,'app-v0167.js'),'utf8'),html=fs.readFileSync(path.join(A,'index.html'),'utf8');
 assert.ok(app.includes(`__LUCKYDEX_BUILD='${version}'`));assert.ok(html.includes(`id="titleBuildVersion">v${version}`));assert.ok(html.includes(`id="appBuildVersion">LUCKY DEX · v${version}`));
});
