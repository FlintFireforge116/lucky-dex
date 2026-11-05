'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(A,'tcgp-battle-core.js'));
const ai=require(path.join(A,'tcgp-battle-ai.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const revelation=require(path.join(A,'tcg-classic-neo-revelation.js'));
const data=require(path.join(A,'tcg-classic-battle-data.js'));
function battle(seed=43){
 const o=opponents.generate({sets:['neo3'],type:'Water',seed});assert.ok(o.ok,o.error);
 const s=core.createBattle({format:'classic',playerDeck:o.cards,opponentDeck:o.cards,playerEnergyTypes:['Water'],opponentEnergyTypes:['Water'],seed,firstSide:'opponent'});
 s.phase='battle';s.activeSide='opponent';
 const cpu=s.sides.opponent;cpu.active=core.makePokemonSlot('neo3-7',1,'active-cpu');
 cpu.energyAvailable=false;cpu.energyUsed=true;cpu.hand=[];cpu.bench=[];
 return s;
}
function hand(s,...ids){s.sides.opponent.hand=ids.map((cardId,i)=>({uid:'hand'+i,cardId}));}
test('all 66 Neo Revelation prints carry a readable explanation for every move and Power',()=>{
 let attacks=0,powers=0;
 for(const c of revelation.CARDS){
  for(const a of c.attacks||[]){attacks++;assert.ok(a.text?.length>=10,c.id+' '+a.name+' has no explanation');assert.doesNotMatch(a.text,/Special effect|implementation pending/i);}
  for(const a of c.abilities||[]){powers++;assert.ok(a.text?.length>=30,c.id+' '+a.name+' has no explanation');assert.doesNotMatch(a.text,/implementation pending|Special effect/i);}
 }
 assert.ok(attacks>=80);assert.ok(powers>=15);
 assert.equal(revelation.CARDS.filter(c=>c.battleEnabled).length,33,'descriptions must not wrongly mark incomplete cards battle ready');
});
test('Advanced preserves an existing useful Stadium instead of burning another one',()=>{
 const s=battle();hand(s,'neo3-63');s.stadium={uid:'existing',cardId:'neo3-61',ownerSide:'opponent'};
 assert.equal(ai.chooseAction(s,'opponent','Advanced',0).type,'endTurn');
 assert.equal(ai.chooseAction(s,'opponent','Expert',0).type,'endTurn');
});
test('Advanced does not play Healing Field to benefit an undamaged board',()=>{
 const s=battle();hand(s,'neo3-61','neo3-63');
 assert.equal(ai.chooseAction(s,'opponent','Advanced',0).type,'endTurn');
});
test('Advanced plays Healing Field when damaged, then uses its once-per-turn heal',()=>{
 const s=battle();s.sides.opponent.active.damage=40;hand(s,'neo3-61','neo3-63');
 let a=ai.chooseAction(s,'opponent','Advanced',0);
 assert.equal(a.cardId,'neo3-61');core.applyAction(s,'opponent',a);
 a=ai.chooseAction(s,'opponent','Advanced',1);
 assert.equal(a.type,'stadiumAction');core.applyAction(s,'opponent',a);
 assert.equal(s.sides.opponent.stadiumActionUsedTurn,s.turnNumber);
 assert.equal(s.stadium.cardId,'neo3-61');
 assert.notEqual(ai.chooseAction(s,'opponent','Advanced',2).type,'stadiumAction');
});
test('Healing Field ability is used rather than replaced when the active is damaged',()=>{
 const s=battle();s.sides.opponent.active.damage=30;
 s.stadium={uid:'healing',cardId:'neo3-61',ownerSide:'opponent'};hand(s,'neo3-63');
 assert.equal(ai.chooseAction(s,'opponent','Advanced',0).type,'stadiumAction');
 assert.equal(ai.chooseAction(s,'opponent','Expert',0).type,'stadiumAction');
});
test('Rocket Hideout is only played when its Dark-name HP bonus helps',()=>{
 const s=battle();hand(s,'neo3-63');
 assert.equal(ai.chooseAction(s,'opponent','Advanced',0).type,'endTurn');
 s.sides.opponent.active=core.makePokemonSlot('base5-4',1,'dark');
 assert.match(data.cardById(s.sides.opponent.active.cardId).name,/Dark/);
 assert.equal(ai.chooseAction(s,'opponent','Advanced',0).cardId,'neo3-63');
});
test('Advanced uses available once-per-turn Basic Energy before attacking or passing',()=>{
 const s=battle();s.sides.opponent.active=core.makePokemonSlot('neo3-47',1,'paras');
 s.sides.opponent.active.energy={Grass:1};s.sides.opponent.energyType='Grass';
 s.sides.opponent.energyAvailable=true;s.sides.opponent.energyUsed=false;
 let a=ai.chooseAction(s,'opponent','Advanced',0);
 assert.equal(a.type,'attach');
 core.applyAction(s,'opponent',a);
 assert.equal(s.sides.opponent.energyUsed,true);
 assert.notEqual(ai.chooseAction(s,'opponent','Advanced',1).type,'attach');
});
test('Advanced Neo Revelation-only matches resolve without Stadium loops',()=>{
 for(const level of ['Advanced'])for(let seed=1;seed<=12;seed++){
  const type=['Grass','Water','Fighting','Fire','Colorless','Metal'][seed%6];
  const o=opponents.generate({sets:['neo3'],type,seed:seed*15});assert.ok(o.ok,o.error);
  const s=core.createBattle({format:'classic',playerDeck:o.cards,opponentDeck:o.cards,playerEnergyTypes:o.energyTypes,opponentEnergyTypes:o.energyTypes,seed:seed*91,firstSide:'player'});
  let n=0,turn=-1,count=0,ownChanges=0,previous=null;
  while(s.phase!=='finished'&&n<1800){
   if(s.turnNumber!==turn){turn=s.turnNumber;count=0;}
   const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.phase==='setup'?s.setupSide:s.activeSide;
   const a=ai.chooseAction(s,side,level,count++);assert.ok(a,level+' seed '+seed+' returned no action');
   if(a.type==='trainer'&&['neo3-61','neo3-63'].includes(a.cardId)&&s.stadium?.ownerSide===side)ownChanges++;
   core.applyAction(s,side,a);n++;
  }
  assert.equal(s.phase,'finished',level+' seed '+seed+' exceeded action cap');
  assert.ok(ownChanges<=4,level+' seed '+seed+' played too many replacements: '+ownChanges);
 }
});
test('Expert Neo Revelation opening remains legal with the new Stadium judgement',()=>{
 const s=battle(219);s.sides.opponent.hand=[{uid:'heal',cardId:'neo3-61'},{uid:'hideout',cardId:'neo3-63'}];s.sides.opponent.active.damage=30;
 for(let n=0;n<15&&s.activeSide==='opponent'&&s.phase==='battle';n++){
  const a=ai.chooseAction(s,'opponent','Expert',n);assert.ok(a);assert.ok(core.legalActions(s,'opponent').some(x=>ai.sameAction(x,a)));core.applyAction(s,'opponent',a);
 }
});
