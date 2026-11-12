'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const A='../app/src/main/assets/';
const core=require(A+'tcgp-battle-core'),fx=require(A+'tcgp-battle-effects'),data=require(A+'tcg-classic-battle-data'),pk=require(A+'tcg-classic-power-keepers'),ai=require(A+'tcgp-battle-ai'),opponents=require(A+'tcg-classic-opponents');
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const seedDeck=opponents.generate({sets:['ex16'],seed:197,type:'Lightning'});assert.ok(seedDeck.ok);
function setup(att='ex16-7',def='ex16-95'){
 const s=core.createBattle({format:'classic',playerDeck:seedDeck.cards,opponentDeck:seedDeck.cards,seed:197,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';s.sides.player.turnCount=7;s.sides.opponent.turnCount=7;
 s.sides.player.active=core.makePokemonSlot(att,4,'att');s.sides.opponent.active=core.makePokemonSlot(def,4,'def');
 s.sides.player.active.energy={Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Darkness:4,Metal:4,Colorless:4};s.sides.opponent.active.energy={Metal:4};
 s.sides.player.bench=[core.makePokemonSlot('ex16-59',3,'ownbench')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.bench=[core.makePokemonSlot('ex16-57',3,'foebench')];s.sides.opponent.bench[0].benchSlot=0;
 return s;
}
function legal(s,side='player'){return core.legalActions(s,side)}
function attack(s,index=0){const a=legal(s).find(x=>x.type==='attack'&&x.attackIndex===index);assert.ok(a,'attack legal');core.applyAction(s,'player',a);return a;}
function choice(s,predicate){assert.equal(s.phase,'effectChoice','pending choice');const side=s.choiceSide,options=legal(s,side).filter(x=>x.type==='effectChoice'),chosen=options.find(predicate);assert.ok(chosen,JSON.stringify(options).slice(0,700));core.applyAction(s,side,chosen);return chosen;}
function bench(s,id){const ref={uid:'bench-'+id,cardId:id};s.sides.player.hand.push(ref);const a=legal(s).find(x=>x.type==='bench'&&x.cardId===id);assert.ok(a,'bench legal '+id);core.applyAction(s,'player',a);}
function evolve(s,id,baseId){const slot=core.makePokemonSlot(baseId,2,'from-'+id);slot.benchSlot=1;s.sides.player.bench.push(slot);s.sides.player.hand.push({uid:'ev-'+id,cardId:id});const a=legal(s).find(x=>x.type==='evolve'&&x.cardId===id);assert.ok(a,'evolve legal '+id);core.applyAction(s,'player',a);}

test('Poison Ring allows opponent to ATTACK next turn, but never RETREAT',()=>{
 const s=setup();attack(s,0);assert.ok(s.sides.opponent.active.conditions.poison);
 s.turnNumber=11;s.activeSide='opponent';s.sides.opponent.active.energy={Metal:6};
 assert.equal(legal(s,'opponent').some(x=>x.type==='retreat'),false);
 assert.equal(legal(s,'opponent').some(x=>x.type==='attack'),true);
});
test('Rock Blast chosen damage respects opposing protected Bench and consumes Energy',()=>{
 const s=setup('ex16-3');s.sides.player.active.energy={Fighting:3};s.sides.opponent.bench[0]=core.makePokemonSlot('ex14-57',3,'guard');s.sides.opponent.bench[0].benchSlot=0;
 attack(s,0);choice(s,x=>x.choiceOption===0);choice(s,x=>x.choiceTarget==='bench');
 assert.equal(s.sides.opponent.bench[0].damage,0,'Submerge must protect from a selected spread hit');
 assert.equal(s.sides.player.active.energy.Fighting,2);
 if(s.phase==='effectChoice')choice(s,x=>x.choiceSkip);
});
test('Rock Blast selected Active uses Stadium reduction but not W/R',()=>{
 const s=setup('ex16-3','ex16-43');s.sides.player.active.energy={Fighting:4};s.stadium={uid:'drake',cardId:'ex16-72',ownerSide:'player'};
 attack(s,0);choice(s,x=>x.choiceOption===0);choice(s,x=>x.choiceTarget==='active');
 assert.equal(s.sides.opponent.active.damage,10,'Drake Stadium reduces 20 to 10 on Colorless Active');
 if(s.phase==='effectChoice')choice(s,x=>x.choiceSkip);
});
test('Altaria Surprise offers ONLY facedown positions; chosen specific position returned',()=>{
 const s=setup('ex16-2');s.sides.opponent.hand=[{uid:'hidden0',cardId:'ex16-57'},{uid:'hidden1',cardId:'ex16-59'}];s.sides.opponent.deck=[];
 attack(s,0);assert.equal(s.pendingChoice.kind,'option');
 const actions=legal(s,s.choiceSide).filter(x=>x.type==='effectChoice');
 assert.equal(actions.length,2);assert.ok(actions.every(x=>!x.choiceCardId&&/Face-down card/.test(x.choiceLabel)));
 choice(s,x=>x.choiceOption===1);
 assert.ok(s.log.some(x=>x.type==='ex16Surprise'&&x.revealedCardId==='ex16-59'),'selected hidden position #2 must be shuffled into deck before turn advance');
});
test('Opt-out of Cursed Eyes, Chilling Breath and Star Powers has NO board effect',()=>{
 for(const id of ['ex16-92','ex16-100','ex16-101','ex16-102']){
  const s=setup();s.sides.opponent.active.damage=40;s.sides.player.active.damage=40;
  bench(s,id);assert.equal(s.phase,'effectChoice',id);
  choice(s,x=>x.choiceOption===1);
  assert.equal(s.sides.opponent.active.damage,40,id);assert.equal(s.sides.player.active.damage,40,id);
  assert.ok(!s.sides.player.active.conditions?.burn,id);
 }
 const w=setup();evolve(w,'ex16-99','ex16-37');choice(w,x=>x.choiceOption===1);
 assert.equal(w.sides.opponent.ex16ChillingBreathUntil,undefined);
});
test('CPU declines a damaging Jolteon Star power if both Actives benefit equally',()=>{
 const s=setup();s.sides.opponent.active.damage=0;bench(s,'ex16-101');
 const act=ai.chooseAction(s,'player','Expert',1);assert.equal(act.choiceOption,1);
});
test('CPU uses Vaporeon Star power when own Active needs significantly more healing',()=>{
 const s=setup();s.sides.player.active.damage=50;bench(s,'ex16-102');
 const act=ai.chooseAction(s,'player','Expert',1);assert.equal(act.choiceOption,0);
});
test('Sableye Down Draw respects 8-card hand maximum',()=>{
 const s=setup('ex16-22');s.sides.player.hand=Array.from({length:7},(_,i)=>({uid:'h'+i,cardId:'ex16-57'}));
 s.sides.player.deck=[{uid:'bottom',cardId:'ex16-59'},{uid:'top',cardId:'ex16-57'}];attack(s,0);
 assert.equal(s.sides.player.hand.length,8);assert.equal(s.sides.player.deck.length,1);
});
test('Shiftry Skill Hack copies Volcanic Flame and pays its non-Energy top-five discard cost',()=>{
 const s=setup('ex16-97','ex16-96');s.sides.player.active.energy={Darkness:1};
 s.sides.opponent.hand=[{uid:'copied',cardId:'ex16-96'}];
 s.sides.player.deck=Array.from({length:7},(_,i)=>({uid:'src'+i,cardId:'ex16-57'}));
 const before=s.sides.player.deck.length,discard=s.sides.player.discard.length;
 attack(s,0);choice(s,x=>x.choiceCardId==='ex16-96');choice(s,x=>/Volcanic Flame/.test(x.choiceLabel));
 assert.equal(s.sides.player.deck.length,before-5,'copied attack still discards five real top-deck cards');
 assert.equal(s.sides.player.discard.length,discard+5);
});
test('Power Keepers metadata distinguishes Power-triggered Poison from Sleep payoff',()=>{
 const status=pk.cardById('ex16-27').deckMeta,synergy=pk.cardById('ex16-31').deckMeta;
 assert.ok(status.inflicts.includes('poison'));assert.ok(synergy.payoffs.includes('sleep'));
});
