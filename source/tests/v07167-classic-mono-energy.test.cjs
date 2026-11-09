'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const cards=require(path.join(A,'tcg-classic-battle-data.js'));
const builder=require(path.join(A,'tcg-classic-deck-builder.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const decks=require(path.join(A,'tcg-classic-decks.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const rows=cards.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
const exRows=rows.filter(r=>['ex2','ex3'].includes(cards.cardById(r.gameplayId)?.setId));
const typesOf=result=>[...new Set(result.cards.map(cards.cardById).filter(Boolean).flatMap(builder.attackTypes))];
function legal(r){assert.equal(r.ok,true,r.errors?.join('; '));assert.equal(r.cards.length,30);assert.equal(cards.validateDeck(r.cards).ok,true);assert.deepEqual(decks.analyzeDeck(r.cards,r.energyTypes).missingEnergyTypes,[]);}

test('Regression: a Water Vaporeon/Wailord EX deck does not splash Grass Illumise and dilute the Energy Zone',()=>{
 const r=builder.buildDeck(exRows,{sets:['ex2','ex3'],style:'competitive',randomSeed:456});
 legal(r);
 assert.deepEqual(r.energyTypes,['Water']);
 assert.ok(r.cards.some(id=>cards.cardById(id)?.name==='Vaporeon'));
 assert.ok(r.cards.some(id=>cards.cardById(id)?.name==='Wailord ex'));
 assert.ok(!r.cards.some(id=>cards.cardById(id)?.name==='Illumise'));
 const s=core.createBattle({format:'classic',playerDeck:r.cards,opponentDeck:r.cards,playerEnergyTypes:r.energyTypes,opponentEnergyTypes:r.energyTypes,seed:135});
 assert.deepEqual(new Set(s.sides.player.energySupply),new Set(['Water']));
 assert.equal(s.sides.player.energyType,'Water');
 assert.equal(s.sides.player.nextEnergyType,'Water');
});

test('Random and competitive builds prefer one Basic Energy type when the featured line can function on one',()=>{
 for(const sets of [['ex2'],['ex3'],['ex2','ex3']])for(const style of ['competitive','random'])for(let seed=1;seed<=32;seed++){
  const r=builder.buildDeck(exRows,{sets,style,randomSeed:seed*37});legal(r);
  const used=typesOf(r);
  if(used.length<=1){assert.ok(r.energyTypes.length===1,`${sets}, ${style}, ${seed}: ${r.energyTypes}`);if(used.length)assert.deepEqual(r.energyTypes,used);}
  else assert.deepEqual(new Set(r.energyTypes),new Set(used));
 }
});

test('An explicitly selected single type cannot get an off-type attack cost via support cards',()=>{
 for(const type of ['Water','Grass','Fire','Fighting'])for(const style of ['random','competitive'])for(const seed of [12,37,73,101]){
  const r=builder.buildDeck(rows,{sets:['ex2','ex3'],style,types:[type],randomSeed:seed});legal(r);
  assert.deepEqual(r.energyTypes,[type]);
  assert.ok(typesOf(r).every(t=>t===type),`${style} ${type} ${seed}`);
 }
});

test('Explicit dual-type preferences and a featured Pokemon requiring two types remain legal',()=>{
 const chosen=builder.buildDeck(exRows,{sets:['ex2','ex3'],types:['Water','Grass'],style:'competitive',randomSeed:456});legal(chosen);
 assert.ok(chosen.energyTypes.every(t=>['Water','Grass'].includes(t)));
 const dragon=builder.buildDeck(exRows,{sets:['ex3'],focusCardId:'ex3-4',style:'competitive',randomSeed:37});legal(dragon);
 assert.deepEqual(new Set(dragon.energyTypes),new Set(['Grass','Lightning']));
 assert.ok(dragon.cards.includes('ex3-4'));
});

test('Opponent builder uses the same compatible Energy plan and fully legal deck',()=>{
 for(const type of ['Water','Grass','Fire','Lightning'])for(const seed of [5,22,53]){
  const result=opponents.generate({sets:['ex2','ex3'],type,seed});legal(result);
  assert.deepEqual(result.energyTypes,[type]);
  assert.ok(typesOf(result).every(t=>t===type));
 }
});

test('Release version labels are consistent',()=>{
 const gradle=fs.readFileSync(path.resolve(__dirname,'../app/build.gradle'),'utf8');
 const index=fs.readFileSync(path.join(A,'index.html'),'utf8');
 const app=fs.readFileSync(path.join(A,'app-v0167.js'),'utf8');
 assert.match(gradle,/versionCode 7148/);assert.match(gradle,/versionName '0\.69\.168'/);
 assert.match(app,/__LUCKYDEX_BUILD='0\.69\.168'/);
 assert.match(index,/id="titleBuildVersion">v0\.69\.168/);
 assert.match(index,/id="appBuildVersion">LUCKY DEX · v0\.69\.168/);
});
