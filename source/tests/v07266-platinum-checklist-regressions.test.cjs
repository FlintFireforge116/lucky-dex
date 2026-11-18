'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const path='../app/src/main/assets/';
const core=require(path+'tcgp-battle-core.js');
const cpu=require(path+'tcg-classic-opponents.js');
const builder=require(path+'tcg-classic-deck-builder.js');
const db=require(path+'tcg-classic-battle-data.js');
const loan=cpu.generate({sets:['dp5'],type:'Grass',seed:49});assert.equal(loan.ok,true);
function board(active='pl1-43'){
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed:84,firstSide:'player',playerEnergyTypes:['Grass','Darkness','Fire'],opponentEnergyTypes:['Grass','Darkness','Fire']});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';
 for(const side of ['player','opponent']){const x=s.sides[side];x.turnCount=5;x.bench=[];x.hand=[];x.discard=[];x.energyDiscard={};x.supporterUsed=false;}
 s.sides.player.active=core.makePokemonSlot(active,2,'main');s.sides.player.active.energy={Grass:6,Darkness:3,Colorless:2};
 s.sides.opponent.active=core.makePokemonSlot('pl1-70',2,'target');return s;
}
function attack(s,index){const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===index);assert.ok(a,'attack '+index+' not offered');core.applyAction(s,'player',a);}
function choose(s,check){assert.equal(s.phase,'effectChoice','expected effect choice');const actions=core.legalActions(s,s.choiceSide);const act=actions.find(check);assert.ok(act,'desired choice not present: '+JSON.stringify(actions));core.applyAction(s,s.choiceSide,act);}
test('Vine Extract requires damage BEFORE attack and must not use its own damage to trigger conditions',()=>{
 for(const before of [0,10]){const s=board('pl1-43');s.sides.opponent.active=core.makePokemonSlot('pl1-3',2,'healthy-target');s.sides.opponent.active.damage=before;attack(s,2);const target=s.sides.opponent.active;
  assert.ok(Number(target.damage)>=before+db.cardById('pl1-43').attacks[2].damage,'Vine Extract printed damage applied');
  assert.equal(!!target.conditions?.burn,before>0,'Burn only on pre-damaged defender');
  assert.equal(!!target.conditions?.poison,before>0,'Poison only on pre-damaged defender');
 }
});
test('Cyrus independently searches Energy and Galactic Invention even if no Supporter is in deck',()=>{
 const s=board('pl1-70');s.sides.player.hand=[{uid:'cyrus',cardId:'pl1-105'}];
 s.sides.player.deck=[{uid:'energy',cardId:'dp1-124'},{uid:'invention',cardId:'pl1-118'}];
 const trainer=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='pl1-105');assert.ok(trainer,'Cyrus Supporter unavailable');
 core.applyAction(s,'player',trainer);
 assert.equal(s.phase,'effectChoice','Cyrus should continue to the Energy search when Supporters are absent');
 choose(s,a=>a.choiceOption===0&&!a.choiceSkip);
 assert.ok(s.sides.player.hand.some(r=>r.uid==='energy'));
 if(s.phase==='effectChoice')choose(s,a=>a.choiceOption===0&&!a.choiceSkip);
 assert.ok(s.sides.player.hand.some(r=>r.uid==='invention'));
});
test('Poison Experiment offers explicit Grass/Darkness choices for Rainbow Energy',()=>{
 const s=board('pl1-42');s.sides.player.active.specialEnergy=[{uid:'rainbow',cardId:'pl1-121',provides:{Miracle:1}}];
 attack(s,1);
 choose(s,a=>a.choiceLabel==='Rainbow Energy');
 assert.equal(s.phase,'effectChoice','Rainbow must offer the effective Energy type');
 choose(s,a=>a.choiceOption===1);
 assert.equal(!!s.sides.opponent.active.conditions?.paralysis,true,'choosing Darkness must Paralyze');
 assert.equal(!!s.sides.opponent.active.conditions?.poison,false,'Darkness choice must not Poison');
 assert.equal(s.sides.player.active.specialEnergy.length,0,'physical Rainbow discarded');
});
test('Poison Experiment correctly interprets a Darkness-only physical Special Energy',()=>{
 const s=board('pl1-42');s.sides.player.active.specialEnergy=[{uid:'darkness',cardId:'pl1-121',provides:{Darkness:1}}];
 attack(s,1);choose(s,a=>a.choiceLabel==='Rainbow Energy');
 assert.equal(!!s.sides.opponent.active.conditions?.paralysis,true);
 assert.equal(!!s.sides.opponent.active.conditions?.poison,false);
});
test('Platinum support in automated decks has a real SP or LV.X beneficiary',()=>{
 const owned=db.CARDS.filter(x=>x.setId==='pl1'&&x.battleEnabled).map(x=>({gameplayId:x.id,quantity:4}));
 let built=0;
 for(const id of ['pl1-70','pl1-96','pl1-103','pl1-75','pl1-17','pl1-12']){
  const r=builder.buildDeck(owned,{sets:['pl1'],focusCardId:id,randomSeed:21});if(!r.ok)continue;built++;
  const cards=r.cards.map(db.cardById);const sp=cards.filter(c=>c?.kind==='pokemon'&&c.isPokemonSP).length;
  if(r.cards.includes('pl1-116')||r.cards.includes('pl1-118'))assert.ok(sp>0,id+': SP Tool without SP Pokémon');
  if(r.cards.includes('pl1-117'))assert.ok(sp>=3,id+': Power Spray with fewer than 3 SP');
  if(r.cards.includes('pl1-107'))assert.ok(cards.some(c=>c?.stage==='Level-Up'),id+': Level Max without LV.X');
 }
 assert.ok(built>=3,'expected at least three valid Platinum deck samples');
});
test('Water Slide applies its optional +20 before matchup as one damage hit',()=>{
 const set=()=>{const s=board('pl1-29');s.sides.player.active.energy={Water:3};s.sides.opponent.active=core.makePokemonSlot('pl1-3',2,'fire-defender');return s;};
 const baseline=set();attack(baseline,1);const unboosted=baseline.sides.opponent.active.damage;
 const declined=set();declined.sides.player.bench=[core.makePokemonSlot('pl1-96',2,'bench')];declined.sides.player.bench[0].benchSlot=0;attack(declined,1);
 assert.equal(declined.phase,'effectChoice','optional Energy transfer expected');
 const skips=core.legalActions(declined,declined.choiceSide);const skip=skips.find(x=>x.choiceSkip);assert.ok(skip,'no Keep Energy choice');core.applyAction(declined,declined.choiceSide,skip);
 assert.equal(declined.sides.opponent.active.damage,unboosted,'declining must match base 40-damage attack');
 const moved=set();const b=core.makePokemonSlot('pl1-96',2,'bench');b.benchSlot=0;moved.sides.player.bench=[b];attack(moved,1);
 choose(moved,x=>x.choiceTargetUid==='bench'||x.choicePokemonUid==='bench'||x.choiceBenchIndex===0);
 assert.equal(moved.sides.player.active.energy.Water,0,'all Water Energy moved');
 assert.equal(moved.sides.player.bench[0].energy.Water,3,'Bench received all three Energy');
 assert.equal(moved.sides.opponent.active.damage-unboosted,20,'40 + 20 is resolved as a single hit');
});
