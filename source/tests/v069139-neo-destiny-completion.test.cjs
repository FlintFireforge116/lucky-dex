'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const D=require(path.join(A,'tcg-classic-neo-destiny.js'));
const data=require(path.join(A,'tcg-classic-battle-data.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const effects=require(path.join(A,'tcgp-battle-effects.js'));
const opponent=require(path.join(A,'tcg-classic-opponents.js'));
const ai=require(path.join(A,'tcgp-battle-ai.js'));
const base=Array(4).fill('neo4-73').concat(Array(4).fill('neo4-75'),Array(4).fill('neo4-68'),Array(4).fill('neo4-77'),Array(4).fill('neo4-63'),Array(4).fill('neo4-64'),Array(4).fill('neo4-65'),Array(2).fill('neo4-104'));
function battle(){const s=core.createBattle({format:'classic',playerDeck:base,opponentDeck:base,seed:25,firstSide:'player',playerEnergyTypes:['Psychic','Fire','Water','Lightning','Grass','Fighting','Darkness','Metal'],opponentEnergyTypes:['Psychic','Fire','Water','Lightning','Grass','Fighting','Darkness','Metal']});s.phase='battle';s.activeSide='player';s.turnNumber=3;for(const w of ['player','opponent']){const ss=s.sides[w];ss.active=core.makePokemonSlot('neo4-73',1,w+'active');ss.active.energy={Psychic:3,Fire:3,Water:3,Lightning:3,Grass:3,Fighting:3,Darkness:3,Metal:3};ss.active.playedOnSideTurn=1;ss.bench=[];ss.turnCount=2;ss.energyUsed=false;ss.energyAvailable=true;ss.hand=[];}return s;}
function attack(s,id,index=0){const p=s.sides.player;p.active=core.makePokemonSlot(id,1,id+'test');p.active.playedOnSideTurn=1;p.active.energy={Psychic:6,Fire:6,Water:6,Lightning:6,Grass:6,Fighting:6,Darkness:6,Metal:6};const action=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===index);assert.ok(action,id+' attack '+index+' not permitted');core.applyAction(s,'player',action);let guard=0;while(s.phase==='effectChoice'&&guard++<30){const choices=core.legalActions(s,s.choiceSide);assert.ok(choices.length>0,id+' requires choice');core.applyAction(s,s.choiceSide,choices.find(x=>!x.choiceSkip)||choices[0]);}assert.ok(guard<30,'effect choice stuck for '+id);return s;}

test('Neo Destiny print, Shining and Trainer completion gate is explicit',()=>{
 assert.equal(D.CARDS.length,113);assert.equal(D.coverage().battleEnabled,113);
 assert.deepEqual(D.CARDS.filter(c=>!c.battleEnabled).map(c=>c.id),[]);
 for(const n of [6,10,14,16,45,93,95,100,106,107,108,109,110,111,112,113])assert.equal(D.cardById('neo4-'+n).battleEnabled,true,'neo4-'+n);
 for(const c of D.CARDS.filter(c=>c.battleEnabled)){
   if(c.kind==='pokemon')for(const [i,a] of c.attacks.entries())assert.ok(effects.supportsEffect(a.effect),`${c.id} move #${i}`);
   if(c.kind==='trainer')assert.ok(effects.supportsEffect(c.effect),c.id);
 }
 assert.equal(data.validateDeck(['neo4-16','neo4-16']).ok,false,'Miracle Energy must be one copy per deck');
 for(const n of [106,107,108,109,110,111,112,113])assert.equal(data.validateDeck(['neo4-'+n,'neo4-'+n]).ok,false,'Shining must be one per deck');
});
test('Miracle Energy can only attach to Light or Shining and expires at end of its owner turn',()=>{
 const s=battle(),p=s.sides.player;
 p.hand=[{uid:'miracle-test',cardId:'neo4-16'}];
 const initial=core.legalActions(s,'player').filter(x=>x.type==='attachSpecial'&&x.cardId==='neo4-16');assert.equal(initial.length,0,'regular Basic not allowed');
 p.active=core.makePokemonSlot('neo4-106',1,'shining-test');p.active.playedOnSideTurn=1;
 const options=core.legalActions(s,'player').filter(x=>x.type==='attachSpecial'&&x.cardId==='neo4-16');assert.equal(options.length,1);
 core.applyAction(s,'player',options[0]);assert.equal(p.active.specialEnergy.length,1);
 assert.ok(effects.canPayCost(core.effectiveEnergy(s,'player',p.active),'GP'),'Miracle provides wildcard pair');
 const end=core.legalActions(s,'player').find(x=>x.type==='endTurn');assert.ok(end);core.applyAction(s,'player',end);
 assert.equal(p.active.specialEnergy.length,0,'Miracle is discarded at owner end turn');assert.ok(p.discard.some(x=>x.cardId==='neo4-16'));
});
test('Dark Ampharos Conductivity triggers when opponent attaches energy only',()=>{
 const s=battle(),p=s.sides.player,o=s.sides.opponent;
 p.active=core.makePokemonSlot('neo4-1',1,'amph');
 o.energyUsed=false;o.energyAvailable=true;s.activeSide='opponent';
 const action=core.legalActions(s,'opponent').find(x=>x.type==='attach'&&x.target==='active');assert.ok(action);
 core.applyAction(s,'opponent',action);
 assert.equal(o.active.damage,10,'Energy attach should inflict 10 damage');
});
test('All enabled Neo Destiny attacks survive the actual effect resolver and pending choices',()=>{
 let total=0;
 for(const c of D.CARDS.filter(x=>x.battleEnabled&&x.kind==='pokemon'))for(const [index,a] of c.attacks.entries()){
   const s=battle();
   try{attack(s,c.id,index);}catch(e){throw new Error(`${c.id} ${a.name}: ${e.stack||e}`);}
   total++;
 }
 assert.equal(total,149);
});
test('Neo Destiny decks still build legally across all seven types',()=>{
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Colorless']){
   const r=opponent.generate({sets:['neo4'],type,seed:391+type.length});assert.ok(r.ok,type+' '+r.error);assert.ok(data.validateDeck(r.cards).ok,type);
   assert.equal(r.cards.length,30);
 }
});
test('Neo Destiny-only CPU match can finish with unusual effects enabled',()=>{
 const p=opponent.generate({sets:['neo4'],type:'Psychic',seed:426}),o=opponent.generate({sets:['neo4'],type:'Water',seed:427});
 assert.ok(p.ok&&o.ok);
 const s=core.createBattle({format:'classic',playerDeck:p.cards,opponentDeck:o.cards,playerEnergyTypes:p.energyTypes,opponentEnergyTypes:o.energyTypes,seed:430,firstSide:'player'});
 for(let i=0;i<1400&&s.phase!=='finished';i++){
  const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.phase==='setup'?s.setupSide:s.activeSide;
  const action=ai.chooseAction(s,side,'Intermediate',i);assert.ok(action,`${s.phase} ${side} action ${i}`);core.applyAction(s,side,action);
 }
 assert.equal(s.phase,'finished');
});
test('Dark Gengar doubles Sleep recovery coin checks regardless of which side is asleep',()=>{
 const s=battle();s.sides.player.active=core.makePokemonSlot('neo4-6',1,'gengar');s.sides.opponent.active.conditions={sleep:true};
 const end=core.legalActions(s,'player').find(x=>x.type==='endTurn');core.applyAction(s,'player',end);
 const check=s.log.filter(x=>x.type==='sleepCheck'&&x.side==='opponent').at(-1);assert.ok(check);assert.equal(check.coins,2);
});
test('Dark Typhlosion Rushing Flames selects Energy across entire team and never auto-discards all',()=>{
 const s=battle(),p=s.sides.player;p.active=core.makePokemonSlot('neo4-10',1,'typh');p.active.energy={Fire:1};p.active.playedOnSideTurn=1;
 const buddy=core.makePokemonSlot('neo4-68',1,'buddy');buddy.energy={Fire:2};buddy.benchSlot=0;p.bench=[buddy];
 const choices=core.legalActions(s,'player').filter(x=>x.type==='attack'&&x.attackIndex===1);
 assert.equal(choices.length,4);
 const two=choices.find(x=>x.effectSelection==='2');assert.ok(two);
 const totalBefore=p.active.energy.Fire+buddy.energy.Fire;
 core.applyAction(s,'player',two);
 assert.equal(p.active.energy.Fire+buddy.energy.Fire,totalBefore-2);
 assert.ok(s.log.some(x=>x.type==='attack'&&x.attack==='Rushing Flames'));
});
test('Classic mixed Neo Destiny and Scarlet Violet opponents can finish a game',()=>{
 const p=opponent.generate({sets:['neo4'],type:'Fire',seed:735}),o=opponent.generate({sets:['sv1'],type:'Water',seed:736});assert.ok(p.ok&&o.ok);
 const s=core.createBattle({format:'classic',playerDeck:p.cards,opponentDeck:o.cards,playerEnergyTypes:p.energyTypes,opponentEnergyTypes:o.energyTypes,seed:740,firstSide:'player'});
 for(let i=0;i<1400&&s.phase!=='finished';i++){const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.phase==='setup'?s.setupSide:s.activeSide;const action=ai.chooseAction(s,side,'Intermediate',i);assert.ok(action,`${s.phase} ${side} ${i}`);core.applyAction(s,side,action);}
 assert.equal(s.phase,'finished');
});
