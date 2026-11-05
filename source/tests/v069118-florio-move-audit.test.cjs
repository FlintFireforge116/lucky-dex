'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),path=require('path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(assets,'tcgp-battle-core.js'));
const classic=require(path.join(assets,'tcg-classic-battle-data.js'));
const decks=require(path.join(assets,'tcg-classic-decks.js'));
const ui=require(path.join(assets,'tcgp-battle-ui.js'));
const ALL_TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless'];
const active=(id,uid)=>core.makePokemonSlot(id,0,uid);
function newBattle(){
 const ids=decks.LOANER_DECK.slice();
 const st=core.createBattle({format:'classic',playerDeck:ids,opponentDeck:ids,
   playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],
   opponentEnergyTypes:['Water','Darkness'],seed:7878,firstSide:'player'});
 st.activeSide='player';st.phase='battle';
 for(const side of ['player','opponent']){st.sides[side].turnCount=3;st.sides[side].energyUsed=false;}
 return st;
}
function configureActive(st,cardId,defId='SNAPFLORIO-041'){
 const s=st.sides.player,o=st.sides.opponent;
 s.active=active(cardId,'p-active');o.active=active(defId,'o-active');
 s.active.energy={Grass:12,Fire:12,Water:12,Lightning:12,Psychic:12,Fighting:12,Darkness:12,Metal:12,Colorless:12};
 o.active.energy={Water:2};
 s.bench=['SNAPFLORIO-089','SNAPFLORIO-041','SNAPFLORIO-047'].map((id,i)=>({...active(id,'p-'+i),benchSlot:i,damage:10,energy:{Water:2,Grass:2}}));
 o.bench=['SNAPFLORIO-041','SNAPFLORIO-047'].map((id,i)=>({...active(id,'o-'+i),benchSlot:i,damage:10,energy:{Water:2}}));
 s.energySupply=['Grass','Water','Darkness',...s.energySupply];o.energySupply=['Water','Darkness','Grass',...o.energySupply];
 s.energyDiscard={Water:3,Fire:3,Grass:3,Lightning:3};o.energyDiscard={Water:3};
 s.hand=[{uid:'p-energy',cardId:'neo1-108',zoneGenerated:true},{uid:'surprise',cardId:'SNAPFLORIO-119'}];
 o.hand=[{uid:'o-energy',cardId:'neo1-111',zoneGenerated:true}];
 s.discard=[{uid:'discard-item',cardId:'base1-71'}];
 return st;
}
function firstAttack(st,index){return core.legalActions(st,'player').find(a=>a.type==='attack'&&a.attackIndex===index);}
function resolveChoices(st){let count=0;while(st.phase==='effectChoice'){
 if(++count>40)throw Error('Effect choice did not terminate in 40 steps: '+JSON.stringify(st.pendingChoice));
 const side=st.choiceSide,actions=core.legalActions(st,side);
 const done=actions.find(a=>a.choiceLabel==='Done');
 const pick=done||actions.find(a=>a.choiceSkip)||actions[0];
 if(!pick)throw Error('No legal choice for '+JSON.stringify(st.pendingChoice));
 core.applyAction(st,side,pick);
 }return count;
}
test('Predator Plunge GX: Water does not satisfy currently coded Darkness condition; Darkness Basic and Special work',()=>{
 for(const config of ['water','darkness','special']){
  const st=configureActive(newBattle(),'SNAPFLORIO-072','SNAPFLORIO-041'),op=st.sides.opponent.active;
  st.sides.player.active.energy={Colorless:3};
  if(config==='darkness')op.energy.Darkness=1;
  if(config==='special')op.specialEnergy=[{uid:'dark-special',cardId:'neo1-104'}];
  const action=firstAttack(st,1);assert.ok(action,'GX attack available for '+config);
  core.applyAction(st,'player',action);resolveChoices(st);
  const log=st.log.filter(e=>e.rule==='predatorPlunge114');
  if(config==='water'){
   assert.ok(log.some(x=>x.conditionFailed), 'Water-only Active reports failed requirement');
   assert.equal(st.sides.opponent.prizesTaken,0);assert.equal(op.damage,0);
  }else{
   assert.ok(log.some(x=>x.knockedOut==='SNAPFLORIO-041'),'Darkness triggers knockout');
   assert.ok(st.log.some(x=>x.type==='ko'&&x.side==='opponent'),'KO fully resolved');
  }
 }
});
test('Pichu & Scorbunny Surprise draws the top Basic Energy for both Active Pokémon from the ordered Zone',()=>{
 const st=configureActive(newBattle(),'SNAPFLORIO-047'),s=st.sides.player,o=st.sides.opponent;
 s.energySupply=['Metal','Grass','Water'];o.energySupply=['Lightning','Darkness'];
 s.hand=[{uid:'surprise',cardId:'SNAPFLORIO-119'}];o.hand=[];
 const action=core.legalActions(st,'player').find(a=>a.type==='trainer'&&a.cardId==='SNAPFLORIO-119');
 assert.ok(action,'Supporter playable without Basic Energy in hand');
 core.applyAction(st,'player',action);resolveChoices(st);
 assert.equal(s.active.energy.Metal,13);assert.equal(o.active.energy.Lightning,1);
 assert.deepEqual(s.energySupply,['Grass','Water']);assert.deepEqual(o.energySupply,['Darkness']);
 assert.equal(s.energyUsed,false,'effect is not the normal once-per-turn attachment');
 assert.equal(o.energyUsed,false);
 assert.equal(st.log.filter(x=>x.type==='energyFromSupply'&&x.reason==='Florio Energy Zone attachment').length,2);
});
test('Pichu Surprise does not fabricate Energy when a zone is empty',()=>{
 const st=configureActive(newBattle(),'SNAPFLORIO-047'),s=st.sides.player,o=st.sides.opponent;
 s.energySupply=[];o.energySupply=[];s.hand=[{uid:'surprise',cardId:'SNAPFLORIO-119'}];o.hand=[];
 const action=core.legalActions(st,'player').find(a=>a.type==='trainer'&&a.cardId==='SNAPFLORIO-119');
 core.applyAction(st,'player',action);resolveChoices(st);
 assert.equal(s.active.energy.Grass||0,12);assert.equal(o.active.energy.Water,2);
 assert.deepEqual(s.energySupply,[]);assert.deepEqual(o.energySupply,[]);
});
test('Garden Flourish accepts Energy Zone Grass when Stadium is in play without scanning past the top',()=>{
 const st=configureActive(newBattle(),'SNAPFLORIO-055','SNAPFLORIO-078'),s=st.sides.player;
 s.active.energy={Psychic:1,Colorless:1};s.hand=[];
 st.stadium={uid:'field-stadium',cardId:'SNAPFLORIO-104',side:'player'};
 s.energySupply=['Grass','Water'];
 const action=firstAttack(st,0);assert.ok(action);
 core.applyAction(st,'player',action);assert.equal(st.phase,'effectChoice');
 let choices=core.legalActions(st,st.choiceSide);assert.ok(choices.some(a=>a.choiceTarget==='bench'));
 const chosen=choices.find(a=>a.choiceTarget==='bench'&&a.choiceBenchIndex===0);
 core.applyAction(st,st.choiceSide,chosen);resolveChoices(st);
 assert.equal(s.bench[0].energy.Grass,3);assert.deepEqual(s.energySupply,['Water']);
 const st2=configureActive(newBattle(),'SNAPFLORIO-055','SNAPFLORIO-078');const s2=st2.sides.player;
 st2.stadium={uid:'field-stadium',cardId:'SNAPFLORIO-104',side:'player'};
 s2.active.energy={Psychic:1,Colorless:1};s2.hand=[];s2.energySupply=['Water','Grass'];
 core.applyAction(st2,'player',firstAttack(st2,0));
 assert.deepEqual(s2.energySupply,['Water','Grass'],'cannot skip Water to find Grass');
 assert.equal(st2.phase,'battle','no zone Grass at top: attack should resolve directly');
});
test('all 159 Florio attacks execute in populated and sparse Classic battle states with valid requirements',()=>{
 const attacks=classic.CARDS.filter(c=>c.setId==='SNAPFLORIO'&&c.battleEnabled&&c.kind==='pokemon').flatMap(c=>(c.attacks||[]).map((attack,i)=>({c,i,attack})));
 assert.equal(attacks.length,159);
 let executed=0,choices=0;
 for(const {c,i,attack} of attacks)for(const sparse of [false,true]){
  const st=configureActive(newBattle(),c.id);
  if(sparse){st.sides.player.bench=[];st.sides.opponent.bench=[];st.sides.player.hand=[];st.sides.opponent.hand=[];st.sides.player.discard=[];st.sides.player.energyDiscard={};st.sides.opponent.active.energy={Water:2};}
  if(attack.requiresAsleep)st.sides.player.active.conditions.sleep=true;
  const action=firstAttack(st,i);
  assert.ok(action,`${c.id} ${attack.name} (${sparse?'sparse':'populated'}) legal when costs met`);
  assert.doesNotThrow(()=>{core.applyAction(st,'player',action);choices+=resolveChoices(st);},`${c.id} ${attack.name} (${sparse?'sparse':'populated'}) must resolve`);
  assert.ok(st.log.some(entry=>entry.type==='attack'&&entry.attack===attack.name),`${c.id} ${attack.name} logged`);
  executed++;
 }
 assert.equal(executed,318);assert.ok(choices>=30);
});
test('card descriptions distinguish the Predator condition and explain the hybrid Surprise adaptation',()=>{
 const predator=ui.cardRulesHtml(classic.cardById('SNAPFLORIO-072'));
 assert.match(predator,/Darkness Energy/i);
 const surprise=ui.cardRulesHtml(classic.cardById('SNAPFLORIO-119'));
 assert.match(surprise,/Energy Zone adaptation/i);assert.match(surprise,/next Basic Energy/i);
 const garden=ui.cardRulesHtml(classic.cardById('SNAPFLORIO-055'));
 assert.match(garden,/next Grass Energy from your Energy Zone/i);
});
test('Florio activated Pokémon Powers and playable Trainer effects resolve without crashing',()=>{
 const cards=classic.CARDS.filter(c=>c.setId==='SNAPFLORIO'&&c.battleEnabled);
 let activated=0,trainers=0;
 for(const c of cards){
  for(const [i,ability] of (c.abilities||[]).entries()){
   if(ability.type!=='activated')continue;
   const st=configureActive(newBattle(),c.id);
   st.sides.player.active.damage=20;
   const action=core.legalActions(st,'player').find(a=>a.type==='ability'&&a.abilityIndex===i&&a.target==='active');
   if(!action)continue;activated++;
   assert.doesNotThrow(()=>{core.applyAction(st,'player',action);resolveChoices(st);},c.id+' '+ability.name);
  }
  if(c.kind!=='trainer')continue;
  const st=configureActive(newBattle(),'SNAPFLORIO-089');
  st.sides.player.hand=[{uid:'test-trainer',cardId:c.id}];
  st.sides.player.active.damage=20;
  const action=core.legalActions(st,'player').find(a=>a.type==='trainer'&&a.cardId===c.id);
  if(!action)continue;trainers++;
  assert.doesNotThrow(()=>{core.applyAction(st,'player',action);resolveChoices(st);},c.id+' '+c.name);
 }
 assert.ok(activated>=12,'at least twelve playable activated Powers sampled');
 assert.ok(trainers>=15,'at least fifteen Florio Trainers sampled');
});
