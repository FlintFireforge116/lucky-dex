'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const destiny=require(path.join(A,'tcg-classic-neo-destiny.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const B=require(path.join(A,'tcg-classic-deck-builder.js'));
const D=require(path.join(A,'tcg-classic-decks.js'));
const O=require(path.join(A,'tcg-classic-opponents.js'));
const W=require(path.join(A,'tcg-classic-deck-workspace.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const fx=require(path.join(A,'tcgp-battle-effects.js'));
const ai=require(path.join(A,'tcgp-battle-ai.js'));
const pool=classic.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
const cards=Array(4).fill('neo4-73').concat(Array(4).fill('neo4-75'),Array(4).fill('neo4-68'),Array(4).fill('neo4-77'),Array(4).fill('neo4-63'),Array(4).fill('neo4-64'),Array(4).fill('neo4-65'),Array(2).fill('neo4-104'));
function battlefield(){const s=core.createBattle({format:'classic',playerDeck:cards,opponentDeck:cards,seed:21,firstSide:'player',playerEnergyTypes:['Fighting','Psychic','Fire'],opponentEnergyTypes:['Fighting','Psychic','Fire']});s.phase='battle';s.activeSide='player';s.turnNumber=1;for(const t of ['player','opponent']){s.sides[t].active=core.makePokemonSlot('neo4-73',1,t);s.sides[t].active.energy={Fighting:3,Psychic:3,Fire:3};s.sides[t].bench=[];}return s;}
function attack(s,id,idx){s.sides.player.active=core.makePokemonSlot(id,1,'attack');s.sides.player.active.energy={Fighting:4,Fire:4,Water:4,Grass:4,Psychic:4,Colorless:4};const ac=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===idx);assert.ok(ac,'Attack action missing '+id+' '+idx);return core.applyAction(s,'player',ac);}
test('113 Neo Destiny identities, correct secret rarities and artwork, with an explicit support gate',()=>{
 assert.equal(destiny.CARDS.length,113);assert.equal(new Set(destiny.CARDS.map(c=>c.id)).size,113);
 assert.equal(destiny.CARDS[0].name,'Dark Ampharos');assert.equal(destiny.CARDS[105].name,'Shining Celebi');assert.equal(destiny.CARDS[112].name,'Shining Tyranitar');
 assert.equal(destiny.CARDS.filter(c=>c.rarity==='Rare Shining').length,8);
 assert.equal(destiny.CARDS.find(c=>c.id==='neo4-16').kind,'energy');assert.equal(destiny.cardById('neo4-16').battleEnabled,false);
 assert.ok(destiny.coverage().battleEnabled>=30);
 for(const c of destiny.CARDS){assert.equal(classic.cardById(c.id),c);assert.match(c.image,/images\.pokemontcg\.io\/neo4\/\d+\.png/);if(c.battleEnabled){assert.equal(c.support.status,'FULL');for(const a of c.attacks||[]){assert.equal(a.unimplemented,false,c.id+' '+a.name);assert.ok(fx.supportsEffect(a.effect));}if(c.kind==='trainer')assert.ok(fx.supportsEffect(c.effect));}else assert.equal(c.support.status,'PARTIAL');}
 assert.equal(destiny.cardById('neo4-6').battleEnabled,false,'Dark Gengar Deep Sleep Power needs engine integration');
 assert.equal(destiny.cardById('neo4-107').battleEnabled,false,'Shining multi-type mechanic must not be silent no-op');
});
test('Neo Destiny appears in both manual/auto and CPU filters, and scripts load in safe order',()=>{
 assert.ok(B.SET_IDS.includes('neo4'));assert.ok(O.SETS.includes('neo4'));assert.equal(classic.SETS.find(s=>s.id==='neo4').cardCount,113);
 const page=fs.readFileSync(path.join(A,'index.html'),'utf8');assert.ok(page.indexOf('tcg-classic-neo-destiny.js')<page.indexOf('tcg-classic-battle-data.js'));
 for(const file of ['tcgp-battle-ui.js','tcg-classic-deck-editor.js'])assert.match(fs.readFileSync(path.join(A,file),'utf8'),/Neo Destiny/);
 const rows=W.catalogue([]);assert.equal(W.query(rows,{filters:{set:'neo4',enabled:false},pageSize:200}).total,113);
 assert.equal(W.query(rows,{filters:{set:'neo4',enabled:true},pageSize:200}).total,destiny.coverage().battleEnabled);
});
test('Neo Destiny physical collection variants map without changing other sources',()=>{
 const rows=classic.projectOwnedCards([{source:'tcg',setId:'n4',id:'library:n4:075',number:'75/105',count:2},{source:'tcg',setName:'Neo Destiny',number:75,count:1},{source:'tcg',setId:'neo4',number:'106/105',count:1},{source:'tcgp',setId:'neo4',number:75,count:2}]);
 assert.equal(rows.find(r=>r.gameplayId==='neo4-75')?.quantity,3);assert.equal(rows.find(r=>r.gameplayId==='neo4-106')?.quantity,1);assert.equal(rows.filter(r=>r.gameplayId==='neo4-75').length,1);
});
test('Shining rarity copy restrictions are enforced even if Shining attack is currently unavailable',()=>{
 const invalid=classic.validateDeck(['neo4-107','neo4-107']);assert.match(invalid.errors.join(' '),/Shining Charizard is limited to one/i);
 const prior=D.edit(['neo4-73'],'neo4-73',1,[{gameplayId:'neo4-73',quantity:4}]);assert.equal(prior.ok,true);
});
test('All 7 classic Neo Destiny-only CPU types generate legal decks and correctly inferred Energy',()=>{
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Colorless']){
  const r=O.generate({sets:['neo4'],type,seed:300+type.length});assert.ok(r.ok,type+': '+r.error);assert.equal(r.cards.length,30);
  assert.ok(classic.validateDeck(r.cards).ok);assert.ok(r.cards.every(id=>classic.cardById(id).setId==='neo4'));
  assert.equal(D.readiness({cards:r.cards,energyMode:'manual',energyTypes:r.energyTypes},pool).ok,true,type);
 }
});
test('Basic-only and themed choices keep Neo Destiny deck legal',()=>{
 for(const theme of ['any','sleep','poison']){
  const r=B.buildDeck(pool,{sets:['neo4'],style:'random',theme,basicOnly:true,randomSeed:46});assert.ok(r.ok,theme+': '+r.errors?.join(','));
  assert.equal(r.cards.length,30);assert.ok(r.cards.every(id=>classic.cardById(id).kind!=='pokemon'||classic.cardById(id).stage==='Basic'));
 }
});
test('Neo Destiny basic attack damage, coin effects, and conditions execute in live battle',()=>{
 for(const id of ['neo4-63','neo4-65','neo4-66','neo4-73','neo4-80','neo4-90']){
  const s=battlefield();const attackIndex=id==='neo4-80'?0:id==='neo4-90'?1:0;
  attack(s,id,attackIndex);assert.ok(s.log.some(l=>l.type==='attack'),id+' did not attack');
 }
});
test('Neo Destiny CPU battles finish without missing-card or effect-choice stalls',()=>{
 for(const type of ['Fire','Water','Psychic']){
  const r=O.generate({sets:['neo4'],type,seed:type.length*41});assert.ok(r.ok);
  const s=core.createBattle({format:'classic',playerDeck:r.cards,opponentDeck:r.cards,playerEnergyTypes:r.energyTypes,opponentEnergyTypes:r.energyTypes,firstSide:'player',seed:12});
  let count=0;while(s.phase!=='finished'&&count<1200){const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.phase==='setup'?s.setupSide:s.activeSide;const a=ai.chooseAction(s,side,'Intermediate',count);assert.ok(a,'no action '+type+' '+s.phase);core.applyAction(s,side,a);count++;}
  assert.equal(s.phase,'finished','Stalled '+type+' '+count+' actions');
 }
});
