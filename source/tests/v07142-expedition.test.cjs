 'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const expedition=require(path.join(A,'tcg-classic-expedition.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const builder=require(path.join(A,'tcg-classic-deck-builder.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const fx=require(path.join(A,'tcgp-battle-effects.js'));
const ai=require(path.join(A,'tcgp-battle-ai.js'));
function battle(seed=33){const d=opponents.generate({sets:['ecard1'],seed});assert.ok(d.ok,d.error);
 const state=core.createBattle({format:'classic',playerDeck:d.cards,opponentDeck:d.cards,playerEnergyTypes:['Psychic','Lightning','Water','Fire','Grass','Darkness','Metal'],opponentEnergyTypes:['Psychic','Lightning','Water','Fire','Grass','Darkness','Metal'],seed,firstSide:'player'});
 state.phase='battle';state.activeSide='player';state.turnNumber=5;state.sides.player.turnCount=3;state.sides.opponent.turnCount=2;return state;}
function slot(id,uid){return core.makePokemonSlot(id,1,uid||'slot-'+id);}
function ctx(state,who='player',rng){const me=state.sides[who];return {...core.effectContext(state,who,{},me.active),random:rng||(()=>0.1)};}
function by(n){return classic.cardById('ecard1-'+n);}

test('165 authentic Expedition prints are registered with exact numbered identities, variants and source-backed art',()=>{
 assert.equal(expedition.CARDS.length,165);assert.equal(new Set(expedition.CARDS.map(c=>c.id)).size,165);
 assert.equal(expedition.coverage().total,165);
 for(let i=1;i<=165;i++){const c=by(i);assert.ok(c,'missing '+i);assert.equal(c.setId,'ecard1');assert.equal(+c.number,i);assert.match(c.image,new RegExp('/ecard1/'+i+'\\.png$'));}
 assert.equal(by(1).rarity,'Rare Holo');assert.equal(by(33).rarity,'Rare');
 assert.equal(by(4).attacks[0].name,'Energy Cannon');assert.equal(by(36).attacks[0].name,'Bubble');
 assert.equal(by(39).hp,100);assert.equal(by(40).hp,120);
 assert.equal(by(46).attacks[0].name,'Slash');assert.equal(by(47).attacks[0].name,'Rending Jaws');
 assert.equal(by(29).attacks[0].cost,'DDDD');
 assert.equal(by(80).attacks[1].name,'Dream Eater');
 assert.equal(by(109).attacks[0].name,'Bad Dream');
});
test('unsupported Poké-Powers / Tools stay out of playable decks, never silently noop',()=>{
 const partial=expedition.coverage().partial;assert.equal(expedition.coverage().battleEnabled,157);assert.equal(partial.length,8);
 for(const n of [1,2,30,33,34,68,144,150]){assert.equal(by(n).battleEnabled,false);assert.equal(by(n).deckEligible,false);assert.equal(by(n).support.status,'PARTIAL');}
 for(const n of [4,5,6,7,13,23,29,80,109,138,139,145,151,158,159])assert.equal(by(n).battleEnabled,true,by(n).name);
});
test('build and in-app display versions agree at 0.69.142 (including both start-screen labels)',()=>{
 const gradle=fs.readFileSync(path.resolve(__dirname,'../app/build.gradle'),'utf8');
 const js=fs.readFileSync(path.join(A,'app-v0167.js'),'utf8');
 const html=fs.readFileSync(path.join(A,'index.html'),'utf8');
 const version=gradle.match(/versionName '([^']+)'/)?.[1];
 assert.equal(version,'0.69.142');assert.match(gradle,/versionCode 7122/);
 assert.ok(js.includes(`window.__LUCKYDEX_BUILD='${version}'`));
 assert.equal(html.split('v'+version).length-1,2,'both start-screen labels must be updated');
 assert.ok(html.indexOf('tcg-classic-expedition.js')>html.indexOf('tcg-classic-legendary-collection.js'));
 assert.ok(html.indexOf('tcg-classic-expedition.js')<html.indexOf('tcg-classic-battle-data.js'));
});
test('Expedition ownership projection and set-selector registration',()=>{
 assert.ok(classic.SETS.some(s=>s.id==='ecard1'&&s.cardCount===165));
 assert.deepEqual(builder.SET_IDS,opponents.SETS);
 for(const file of ['tcg-classic-deck-editor.js','tcgp-battle-ui.js'])assert.ok(fs.readFileSync(path.join(A,file),'utf8').includes('Expedition Base Set'));
 const rows=classic.projectOwnedCards([{source:'tcg',setId:'ecard1',number:109,count:2},{source:'tcg',setId:'ex',number:80,count:3},{source:'tcg',setName:'Expedition Base Set',number:29,count:1},{source:'tcgp',setId:'ecard1',number:45,count:999}]);
 assert.equal(rows.find(r=>r.gameplayId==='ecard1-109')?.quantity,2);
 assert.equal(rows.find(r=>r.gameplayId==='ecard1-80')?.quantity,3);
 assert.equal(rows.find(r=>r.gameplayId==='ecard1-29')?.quantity,1);
 assert.ok(!rows.find(r=>r.gameplayId==='ecard1-45'));
});
test('Expedition Dream Eater requires a sleeping opponent',()=>{
 const s=battle();const p=s.sides.player,o=s.sides.opponent;p.active=slot('ecard1-80');o.active=slot('ecard1-93');
 p.active.energy={Psychic:2};
 let r=fx.resolveAttack(by(80).attacks[1],ctx(s));assert.equal(r.damage,0);
 o.active.conditions.sleep=true;r=fx.resolveAttack(by(80).attacks[1],ctx(s));assert.equal(r.damage,50);
});
test('Expedition Gastly Bad Dream correctly branches between Sleep and Confusion',()=>{
 const s=battle();s.sides.player.active=slot('ecard1-109');s.sides.opponent.active=slot('ecard1-93');
 const effect=by(109).attacks[0].effect;
 fx.applyEffect(effect,ctx(s,'player',()=>0.1));assert.equal(s.sides.opponent.active.conditions.sleep,true);
 s.sides.opponent.active.conditions={};
 fx.applyEffect(effect,ctx(s,'player',()=>0.9));assert.equal(s.sides.opponent.active.conditions.confusion,true);
});
test('Syncroblast, Rending Jaws, Iron Fist and Dogpile use live field state',()=>{
 const s=battle();const p=s.sides.player,o=s.sides.opponent;p.active=slot('ecard1-1');o.active=slot('ecard1-93');
 p.active.energy={Psychic:3};o.active.energy={Psychic:3};
 assert.equal(fx.resolveAttack(by(1).attacks[0],ctx(s)).damage,80);
 o.active.energy.Psychic=2;assert.equal(fx.resolveAttack(by(1).attacks[0],ctx(s)).damage,20);
 p.active=slot('ecard1-12');o.active.damage=0;
 assert.equal(fx.resolveAttack(by(12).attacks[0],ctx(s)).damage,40);
 o.active.damage=10;assert.equal(fx.resolveAttack(by(12).attacks[0],ctx(s)).damage,70);
 p.active=slot('ecard1-72');p.bench=[slot('ecard1-93','b1'),slot('ecard1-94','b2')];
 const dog=fx.resolveAttack(by(72).attacks[1],ctx(s));assert.equal(dog.damage,20);
 assert.ok(dog.pendingEffects.some(e=>e.type==='selfDamage'&&e.amount===20));
});
test('Magikarp Flail and Cloyster Auto Fire calculate rather than printing placeholder values',()=>{
 const s=battle();s.sides.player.active=slot('ecard1-118');s.sides.player.active.damage=20;
 assert.equal(fx.resolveAttack(by(118).attacks[0],ctx(s)).damage,20);
 s.sides.player.active=slot('ecard1-8');
 assert.equal(fx.resolveAttack(by(8).attacks[1],ctx(s,'player',()=>0.1)).damage,80);
 assert.equal(fx.resolveAttack(by(8).attacks[1],ctx(s,'player',()=>0.9)).damage,0);
});
test('Expedition Darkness and Metal special Energy register as distinct printable cards',()=>{
 assert.equal(by(158).specialEnergy,true);assert.equal(by(159).specialEnergy,true);
 assert.equal(by(158).effect.provides.Darkness,1);assert.equal(by(159).effect.provides.Metal,1);
 const s=battle();s.sides.player.active=slot('ecard1-109');
 s.sides.player.active.specialEnergy=[{uid:'metal',cardId:'ecard1-159'}];
 const actions=core.legalActions(s,'player');assert.ok(Array.isArray(actions));
});

test('Expedition Master Ball reveals top seven and takes exactly ONE selected Pokémon',()=>{
 const s=battle();const ss=s.sides.player;
 ss.deck=[{uid:'a',cardId:'ecard1-93'},{uid:'b',cardId:'ecard1-137'},
  {uid:'c',cardId:'ecard1-94'},{uid:'d',cardId:'ecard1-95'}];ss.hand=[];
 fx.applyEffect(by(143).effect,ctx(s));
 assert.equal(s.pendingChoice?.kind,'topDeckCard');
 const actions=core.legalActions(s,'player').filter(a=>a.type==='effectChoice'&&!a.choiceSkip);
 assert.deepEqual(actions.map(a=>a.choiceDeckIndex),[0,2,3]);
 core.applyAction(s,'player',actions.find(a=>a.choiceDeckIndex===2));
 assert.deepEqual(ss.hand.map(r=>r.cardId),['ecard1-94']);
 assert.equal(ss.deck.length,3);
 assert.ok(!ss.deck.some(r=>r.cardId==='ecard1-94'));
});
test('Expedition Pokémon Reversal lets user target opposing bench before heads flip',()=>{
 const s=battle();const foe=s.sides.opponent;
 foe.active=slot('ecard1-93','active');foe.active.benchSlot=null;
 foe.bench=[slot('ecard1-94','bench0'),slot('ecard1-95','bench1')];
 foe.bench[0].benchSlot=0;foe.bench[1].benchSlot=1;
 fx.applyEffect(by(146).effect,ctx(s));
 assert.equal(s.pendingChoice?.kind,'pokemon');
 assert.equal(s.pendingChoice?.selectionSide,'opponent');
 const actions=core.legalActions(s,'player').filter(a=>a.type==='effectChoice');
 assert.equal(actions.length,2);
 assert.ok(actions.every(a=>a.choiceTarget==='bench'));
 core.applyAction(s,'player',actions.find(a=>a.choiceBenchIndex===1));
 const result=s.log.findLast(e=>e.type==='coin'&&e.reason==='Expedition pokemonReversalPick');
 assert.ok(result);
 assert.equal(foe.active.cardId,result.heads?'ecard1-95':'ecard1-93');
});

test('restricted Expedition deck builder and CPU opponent generation keep 30-card legality',()=>{
 const seeds=[3,14,57,102];
 for(const seed of seeds){const d=opponents.generate({sets:['ecard1'],seed});assert.ok(d.ok,d.error);assert.equal(d.cards.length,30);
 const ok=classic.validateDeck(d.cards);assert.ok(ok.ok,JSON.stringify(ok.errors));
 assert.ok(d.cards.every(id=>{const c=classic.cardById(id);return c&&c.deckEligible!==false&&c.battleEnabled&&c.setId==='ecard1';}));
 }
});
test('Expedition CPU battles can progress without unsupported effect actions',()=>{
 for(const seed of [7,48]){
  const state=battle(seed);let steps=0;
  for(;steps<180&&!state.winner;steps++){
   const side=state.phase==='effectChoice'?state.choiceSide:state.phase==='promote'?state.promotionSide:state.activeSide;
   const actions=core.legalActions(state,side);if(!actions.length)break;
   const response=ai.chooseAction(state,side,'Advanced',steps);
   const action=response?.action||response||actions[0];
   if(!action?.type)break;
   core.applyAction(state,side,action);
  }
  assert.ok(steps>8,'CPU did not make progress');
  assert.ok(!state.log.some(r=>r.type==='battleError'),'Unexpected CPU battle exception');
 }
});
