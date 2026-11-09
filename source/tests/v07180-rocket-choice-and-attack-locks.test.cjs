'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(assets,'tcgp-battle-core.js'));
const set=require(path.join(assets,'tcg-classic-team-rocket-returns.js'));
const opponent=require(path.join(assets,'tcg-classic-opponents.js'));
const energyTypes=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
let cachedDeck;
const slot=(n,uid)=>{const x=core.makePokemonSlot('ex7-'+n,2,uid);x.energy={Colorless:4};return x;};
function setup(){
 cachedDeck??=opponent.generate({sets:['ex7'],seed:31}).cards;
 const s=core.createBattle({format:'classic',playerDeck:cachedDeck,opponentDeck:cachedDeck,seed:31,firstSide:'player',playerEnergyTypes:energyTypes,opponentEnergyTypes:energyTypes});
 s.phase='battle';s.activeSide='player';s.turnNumber=9;s.sides.player.turnCount=5;s.sides.opponent.turnCount=4;
 s.sides.player.active=slot(57,'attacker');s.sides.player.bench=[slot(52,'mine')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.active=slot(51,'defender');s.sides.opponent.bench=[slot(52,'enemy-a'),slot(53,'enemy-b')];s.sides.opponent.bench[0].benchSlot=0;s.sides.opponent.bench[1].benchSlot=1;
 s.sides.player.energyDiscard=Object.fromEntries(energyTypes.map(type=>[type,0]));return s;
}
const picks=s=>core.legalActions(s,s.choiceSide);
function choose(s,fn){assert.equal(s.phase,'effectChoice',JSON.stringify(s.pendingChoice));const a=picks(s).find(fn);assert.ok(a,JSON.stringify(picks(s)));core.applyAction(s,s.choiceSide,a);return a;}
function attack(s,n,index=0){s.sides.player.active=slot(n,'attacker');s.sides.player.active.energy={Colorless:4,Fire:3,Water:3,Lightning:3};const a=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===index);assert.ok(a,n+':'+index+' attack unavailable');core.applyAction(s,'player',a);}
function settle(s){let n=0;while(s.phase==='effectChoice'&&n++<12){const a=picks(s).find(x=>!x.choiceSkip)||picks(s)[0];assert.ok(a);core.applyAction(s,s.choiceSide,a);}assert.notEqual(s.phase,'effectChoice');}
for(const n of [49,57])test('Miracle Powder '+set.cardById('ex7-'+n).name+' asks for the chosen condition ONLY on heads',()=>{
 let heads=0,tails=0;
 for(const seed of [1,2,3,4,5,6,7,17,31,127,255,1024,0x7fffffff]){
  const s=setup();s.rngState=seed;attack(s,n);
  const success=s.phase==='effectChoice';
  if(success){heads++;assert.ok(!s.sides.opponent.active.conditions?.poison,'no status before choice');
    assert.equal(s.pendingChoice.kind,'option');assert.equal(picks(s).length,5);
    choose(s,x=>x.choiceOption===2);assert.equal(!!s.sides.opponent.active.conditions?.poison,true);
  }else{tails++;assert.ok(!s.sides.opponent.active.conditions?.poison);}
 }
 assert.ok(heads>0&&tails>0,'both coin outcomes must occur');
});
test('Rocket Moltres Fire Dance selects Fire from discard and the recipient, not the first Bench',()=>{
 const s=setup();s.sides.player.discard=[{uid:'fire-card',cardId:'neo1-107'},{uid:'water-card',cardId:'neo1-111'}];
 attack(s,100);
 assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.kind,'option');
 choose(s,x=>x.choiceOption===0);assert.equal(s.pendingChoice.kind,'pokemon');
 assert.equal(s.sides.player.active.energy.Fire||0,3);
 choose(s,x=>x.choiceTarget==='bench'&&x.choiceBenchIndex===0);
 assert.equal(s.sides.player.bench[0].energy.Fire,1);assert.equal(s.sides.player.active.energy.Fire||0,3);
 assert.equal(s.sides.player.discard.length,1);assert.equal(s.sides.player.discard[0].uid,'water-card');
});
test('Rocket Moltres also retrieves Energy from the separate KO Energy-discard ledger',()=>{
 const s=setup();s.sides.player.energyDiscard.Fire=2;attack(s,100);
 assert.equal(s.pendingChoice.kind,'option');choose(s,x=>x.choiceOption===0);
 choose(s,x=>x.choiceTarget==='active');
 assert.equal(s.sides.player.active.energy.Fire,4);assert.equal(s.sides.player.energyDiscard.Fire,1);
});
test('Rocket Entei may choose the Energy type from the discard ledger, not always first',()=>{
 const s=setup();s.sides.player.energyDiscard.Water=1;s.sides.player.energyDiscard.Fire=1;attack(s,97);
 assert.equal(s.pendingChoice.kind,'option');const list=picks(s);const water=list.find(x=>/Water/.test(x.choiceLabel));assert.ok(water);
 core.applyAction(s,s.choiceSide,water);assert.equal(s.sides.player.active.energy.Water,4);assert.equal(s.sides.player.energyDiscard.Water,0);assert.equal(s.sides.player.energyDiscard.Fire,1);
});
test('Pow! Hand Extension chooses an attached Energy and a particular opposing Bench Pokemon',()=>{
 const s=setup(),p=s.sides.player,f=s.sides.opponent;
 p.prizes=[{uid:'pr1'},{uid:'pr2'},{uid:'pr3'},{uid:'pr4'},{uid:'pr5'}];f.prizes=[{uid:'pr1'},{uid:'pr2'},{uid:'pr3'},{uid:'pr4'}];
 f.active.energy={Water:2,Fighting:1};f.bench[0].energy={};f.bench[1].energy={};
 p.hand.unshift({uid:'pow',cardId:'ex7-85'});const a=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='ex7-85');assert.ok(a);
 core.applyAction(s,'player',a);assert.equal(s.pendingChoice.kind,'option');
 choose(s,x=>/Move a chosen/.test(x.choiceLabel));assert.equal(s.pendingChoice.kind,'option');
 choose(s,x=>/Water Energy/.test(x.choiceLabel));assert.equal(s.pendingChoice.kind,'pokemon');
 choose(s,x=>x.choiceTarget==='bench'&&x.choiceBenchIndex===1);
 assert.equal(f.active.energy.Water,1);assert.equal(f.bench[1].energy.Water,1);assert.equal(f.bench[0].energy.Water||0,0);
});
test('Pow! Hand Extension switch choice is made by defending side, not attacker',()=>{
 const s=setup(),p=s.sides.player,f=s.sides.opponent;
 p.prizes=new Array(5).fill({uid:'p'});f.prizes=new Array(4).fill({uid:'p'});
 p.hand.unshift({uid:'pow2',cardId:'ex7-85'});const a=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='ex7-85');assert.ok(a);
 core.applyAction(s,'player',a);choose(s,x=>/Switch/.test(x.choiceLabel));
 assert.equal(s.choiceSide,'opponent');
 choose(s,x=>x.choiceBenchIndex===1);assert.equal(f.active.uid,'enemy-b');
});
test('Slashing Strike locks only itself: Scyther ex can Bounce next turn',()=>{
 const s=setup();s.sides.player.active=slot(102,'scyther');s.sides.player.active.energy={Colorless:4};
 const slash=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===1);assert.ok(slash);
 core.applyAction(s,'player',slash);settle(s);
 const locks=s.sides.player.active.locks||[];assert.ok(locks.some(x=>x.attackName==='Slashing Strike'),JSON.stringify(locks));
 s.turnNumber=locks.find(x=>x.attackName==='Slashing Strike').expiresTurn;s.sides.player.turnCount+=1;s.activeSide='player';s.phase='battle';s.sides.player.attacked=false;s.sides.player.attackUsed=false;
 const actions=core.legalActions(s,'player').filter(x=>x.type==='attack');
 assert.ok(actions.some(x=>x.attackIndex===0),'Bounce should be allowed');
 assert.ok(!actions.some(x=>x.attackIndex===1),'Slashing Strike should be locked');
});

test('Pow! Hand Extension cannot be wasted when not behind on Prize cards',()=>{
 const s=setup();s.sides.player.hand.unshift({uid:'pow',cardId:'ex7-85'});
 s.sides.player.prizes=[{uid:'p1'},{uid:'p2'}];s.sides.opponent.prizes=[{uid:'f1'},{uid:'f2'}];
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='ex7-85'));
 s.sides.player.prizes.push({uid:'p3'});assert.ok(core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='ex7-85'));
 s.sides.opponent.bench=[];assert.ok(!core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='ex7-85'));
});
