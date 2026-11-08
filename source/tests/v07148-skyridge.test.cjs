'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const sky=require(path.join(A,'tcg-classic-skyridge.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const builder=require(path.join(A,'tcg-classic-deck-builder.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const picker=require(path.join(A,'tcg-classic-set-picker.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const fx=require(path.join(A,'tcgp-battle-effects.js'));
const ai=require(path.join(A,'tcgp-battle-ai.js'));
const C=id=>classic.cardById('ecard3-'+id);
function field(seed=13){const deck=opponents.generate({sets:['ecard3'],seed});assert.ok(deck.ok,deck.error);const s=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,playerEnergyTypes:['Fire','Water','Fighting','Psychic','Lightning','Grass','Metal','Darkness'],opponentEnergyTypes:['Fire','Water','Fighting','Psychic','Lightning','Grass','Metal','Darkness'],seed,firstSide:'player'});s.phase='battle';s.activeSide='player';s.turnNumber=7;s.sides.player.turnCount=4;return s;}
function slot(id,uid){return core.makePokemonSlot('ecard3-'+id,4,uid||'sk'+id);}
function ctx(s,heads){return {...core.effectContext(s,'player',{},s.sides.player.active),random:()=>heads?0.1:0.9,isAttack:true};}
test('Skyridge 150 numbered + 32 distinct Holo prints are registered with correct IDs and art',()=>{
 assert.equal(sky.CARDS.length,182);assert.equal(sky.coverage().total,182);
 assert.equal(new Set(sky.CARDS.map(c=>c.id)).size,182);
 assert.ok(sky.coverage().battleEnabled>=45);
 for(let n=1;n<=150;n++){const card=C(n);assert.ok(card,`#${n}`);assert.equal(card.number,String(n));assert.equal(card.setId,'ecard3');assert.match(card.image,new RegExp('ecard3/'+n+'\\.png'));}
 for(let n=1;n<=32;n++){const c=C('H'+n);assert.ok(c,'H'+n);assert.equal(c.number,'H'+n);assert.equal(c.rarity,'Rare Holo');assert.match(c.image,new RegExp('ecard3/H'+n+'\\.png'));}
 assert.equal(C('H1').name,'Alakazam');assert.equal(C('H32').name,'Xatu');assert.equal(C('H17').name,'Magcargo');
 assert.equal(C(145).name,'Celebi');assert.equal(C(150).name,'Kabutops');
 assert.notDeepEqual(C(17).attacks,C(18).attacks,'two Magcargo variants are not merged');
});
test('Skyridge enters collections, auto builder, CPU pool, filter picker and ownership projection',()=>{
 assert.ok(classic.SETS.some(s=>s.id==='ecard3'&&s.cardCount===182));
 assert.ok(builder.SET_IDS.includes('ecard3'));assert.ok(opponents.SETS.includes('ecard3'));
 assert.ok(picker.rows.some(row=>row[0]==='ecard3'&&row[2]==='e-Card'));
 assert.ok(picker.html({ids:builder.SET_IDS,selected:['ecard3']}).includes('data-set-choice="ecard3"'));
 const result=classic.projectOwnedCards([{source:'tcg',setId:'ecard3',number:'H27',count:2},{source:'tcg',setName:'Skyridge',number:'062/150',count:3},{source:'tcgp',setId:'ecard3',number:'62',count:8}]);
 assert.equal(result.find(x=>x.gameplayId==='ecard3-H27')?.quantity,2);
 assert.equal(result.find(x=>x.gameplayId==='ecard3-62')?.quantity,3);
 assert.ok(!result.some(x=>x.gameplayId==='ecard3-62'&&x.quantity===11));
});
test('newly completed Skyridge cards are all legal and implemented by the effect dispatcher',()=>{
 for(const c of sky.CARDS){if(!c.battleEnabled){assert.equal(c.deckEligible,false,c.id);assert.equal(c.support.status,'PARTIAL',c.id);assert.ok(c.support.reasons.length,c.id);}
 else {assert.equal(c.support.status,'FULL',c.id);for(const a of [...(c.attacks||[]),...(c.abilities||[])])assert.ok(fx.supportsEffect(a.effect),`${c.id}: ${a.name}`);}}
 for(const id of [2,3,4,5,9,11,78,97,129,133,142,143,144])assert.equal(C(id).battleEnabled,true,`Skyridge ${id} must be enabled`);
 for(const id of [29,36,51,54,69,82,100,146,147,148,149,150,'H27'])assert.equal(C(id).battleEnabled,true,`battle-ready ${id}`);
 assert.equal(sky.coverage().battleEnabled,182,'all 182 Skyridge prints are marked available');
});
test('Skyridge-only opponents build legal 30-card decks for multiple energy types',()=>{
 for(const type of ['Grass','Water','Fire','Lightning','Fighting','Psychic']){
  const deck=opponents.generate({sets:['ecard3'],type,seed:23});assert.ok(deck.ok,`${type}: ${deck.error}`);
  assert.equal(deck.cards.length,30);assert.equal(classic.validateDeck(deck.cards).ok,true);
  assert.ok(deck.cards.every(id=>id.startsWith('ecard3-')&&classic.cardById(id).battleEnabled),type);
 }
});
test('printed coin outcomes, recoil, Sleep and protective attacks resolve',()=>{
 for(const id of [65,87]){const s=field();s.sides.player.active=slot(id);s.sides.opponent.active=slot(82);const attack=C(id).attacks[0];const result=fx.resolveAttack(attack,ctx(s,true));for(const effect of result.pendingEffects)fx.applyEffect(effect,ctx(s,true));assert.ok(s.sides.opponent.active.conditions.sleep,`Sleep ${id}`);}
 for(const heads of [true,false]){const s=field();s.sides.player.active=slot(29);s.sides.opponent.active=slot(82);const out=fx.resolveAttack(C(29).attacks[1],ctx(s,heads));assert.equal(out.damage,heads?100:0);}
 const s=field();s.sides.player.active=slot(54);s.sides.opponent.active=slot(82);const a=fx.resolveAttack(C(54).attacks[1],ctx(s,true));for(const effect of a.pendingEffects)fx.applyEffect(effect,ctx(s,true));assert.equal(s.sides.player.active.damage,10);
});
test('Magnetic Pull offers the attacking player an opposing Bench choice and honours it',()=>{
 const s=field();s.sides.player.active=slot(113);s.sides.opponent.active=slot(62);s.sides.opponent.bench=[slot(65,'hoot-1'),slot(66,'hound-2')];
 s.sides.opponent.bench[0].benchSlot=0;s.sides.opponent.bench[1].benchSlot=1;
 fx.applyEffect(C(113).attacks[0].effect,{...core.effectContext(s,'player',{},s.sides.player.active),isAttack:true});
 assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'player');
 const picks=core.legalActions(s,'player');assert.equal(picks.length,2);
 const pick=picks.find(x=>x.choiceBenchIndex===1);assert.ok(pick);core.applyAction(s,'player',pick);
 assert.equal(s.sides.opponent.active.cardId,'ecard3-66');
 assert.equal(s.log.at(-1).chosenBy,'player');
});
test('Crystal Type now responds to appropriate hand-attached basic Energy on Skyridge prints',()=>{
 const s=field(),p=s.sides.player;p.active=slot(146,'charizard');p.hand=[{uid:'lightning',cardId:'ecard1-163'}];
 const action=core.legalActions(s,'player').find(a=>a.type==='attachSpecial'&&a.cardId==='ecard1-163'&&a.target==='active');assert.ok(action);
 core.applyAction(s,'player',action);assert.deepEqual(fx.effectiveTypes(s,'player',p.active,classic.cardById),['Lightning']);
 assert.equal(p.active.typeOverride.expiresTurn,s.turnNumber);
});
test('Abra Psychoflow permits free retreat with Psychic Energy and falls back without it',()=>{
 const s=field();s.sides.player.active=slot(46);s.sides.player.active.energy={Psychic:1};s.sides.player.bench=[slot(62)];
 assert.equal(core.effectContext(s,'player',{},s.sides.player.active).retreatCost('player'),0);
 s.sides.player.active.energy={};assert.equal(core.effectContext(s,'player',{},s.sides.player.active).retreatCost('player'),1);
});
test('Skyridge CPU-vs-CPU matches advance without invalid or unknown actions',()=>{
 for(const seed of [15,57]){
  const deck=opponents.generate({sets:['ecard3'],seed});assert.ok(deck.ok,deck.error);
  const s=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,playerEnergyTypes:['Water','Grass','Fire','Lightning','Fighting','Psychic','Darkness','Metal'],opponentEnergyTypes:['Water','Grass','Fire','Lightning','Fighting','Psychic','Darkness','Metal'],seed,firstSide:'player'});
  let steps=0;for(;steps<120&&!s.winner;steps++){
   const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.phase==='setup'?s.setupSide:s.activeSide;
   const allowed=core.legalActions(s,side);if(!allowed.length)break;
   const picked=ai.chooseAction(s,side,'Advanced',steps),action=picked?.action||picked||allowed[0];
   if(!action?.type)break;core.applyAction(s,side,action);
  }
  assert.ok(steps>12,`seed ${seed}: ${steps}`);assert.ok(!s.log.some(e=>e.type==='battleError'),'battle logged errors');
 }
});
test('Android build version, JS marker and both splash labels always match',()=>{
 const gradle=fs.readFileSync(path.resolve(A,'../../../build.gradle'),'utf8'),html=fs.readFileSync(path.join(A,'index.html'),'utf8'),app=fs.readFileSync(path.join(A,'app-v0167.js'),'utf8');
 const version=gradle.match(/versionName '(\d+\.\d+\.\d+)'/)?.[1];
 assert.ok(version,'Android versionName');assert.match(gradle,/versionCode 7\d{3}/);
 assert.ok(app.includes("window.__LUCKYDEX_BUILD='"+version+"'"));
 assert.equal(html.split('v'+version).length-1,2,'both visible labels must match Android/JS');
 assert.ok(html.indexOf('tcg-classic-skyridge.js')<html.indexOf('tcg-classic-battle-data.js'));
});
