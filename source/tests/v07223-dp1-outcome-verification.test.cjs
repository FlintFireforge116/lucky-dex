'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const P='../app/src/main/assets/';const core=require(P+'tcgp-battle-core'),dp=require(P+'tcg-classic-diamond-pearl'),opponents=require(P+'tcg-classic-opponents');
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const base=opponents.generate({sets:['dp1'],type:'Grass',seed:17});
function setup(att,def){const s=core.createBattle({format:'classic',playerDeck:base.cards,opponentDeck:base.cards,seed:37,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});s.phase='battle';s.turnNumber=10;s.activeSide='player';for(const who of ['player','opponent'])s.sides[who].turnCount=8;s.sides.player.active=core.makePokemonSlot(att,4,'a');s.sides.opponent.active=core.makePokemonSlot(def,4,'b');s.sides.player.active.energy=Object.fromEntries(types.map(t=>[t,5]));s.sides.opponent.active.energy=Object.fromEntries(types.map(t=>[t,5]));s.sides.player.bench=[core.makePokemonSlot('dp1-85',4,'pb')];s.sides.opponent.bench=[core.makePokemonSlot('dp1-85',4,'ob')];s.sides.player.bench[0].benchSlot=0;s.sides.opponent.bench[0].benchSlot=0;return s;}
function move(s,who,index=0){s.activeSide=who;const a=core.legalActions(s,who).find(x=>x.type==='attack'&&x.attackIndex===index);assert.ok(a,`${who} can attack ${index}`);core.applyAction(s,who,a);for(let i=0;i<10&&s.phase==='effectChoice';i++){const choice=core.legalActions(s,s.choiceSide).find(x=>x.type==='effectChoice'&&!x.choiceSkip);assert.ok(choice);core.applyAction(s,s.choiceSide,choice);}assert.notEqual(s.phase,'effectChoice');}
test('Harden blocks exactly the attack-damage range specified (<=30 after Weakness) and not greater',()=>{
 for(const cardId of ['dp1-44','dp1-63']){
  let s=setup(cardId,'dp1-94');move(s,'player',0);move(s,'opponent',0);assert.equal(s.sides.player.active.damage,0,cardId+' prevent weak Tackle');
  s=setup(cardId,'dp1-94');move(s,'player',0);move(s,'opponent',1);assert.equal(s.sides.player.active.damage,50,cardId+' does not prevent 50 total');
 }
});
test('Glameow Charm reduces printed attack damage (not outgoing damage or the wrong side)',()=>{
 let s=setup('dp1-83','dp1-94');move(s,'player',0);move(s,'opponent',1);assert.equal(s.sides.player.active.damage,10,'Flame Tail 30 reduced by 20');
 s=setup('dp1-83','dp1-94');move(s,'player',0);move(s,'opponent',0);assert.equal(s.sides.player.active.damage,0,'Tackle 10 reduced to 0');
});
test('Dustox Toxic Dust applies 20 damage between turns and does not poison itself',()=>{
 const s=setup('dp1-25','dp1-17');move(s,'player',1);assert.equal(s.sides.opponent.active.damage,70);assert.ok(s.sides.opponent.active.conditions.poison);assert.equal(s.sides.player.active.damage,0);
});
test('Beautifly Giga Drain restores damage equal to damage actually dealt to active',()=>{
 const s=setup('dp1-19','dp1-17');s.sides.player.active.damage=60;move(s,'player',1);assert.equal(s.sides.opponent.active.damage,50);assert.equal(s.sides.player.active.damage,10);
});
test('Seedot Bide successful guard avoids KO and leaves exactly 10 HP',()=>{
 let successful=0;for(let seed=1;seed<80;seed++){
  const s=setup('dp1-97','dp1-94');s.rngSeed=seed;move(s,'player',0);if(s.sides.player.active.koGuard){successful++;move(s,'opponent',1);assert.ok(s.sides.player.active,'survived');assert.equal(s.sides.player.active.damage,40,'50HP-10HP');break;}
 }
 assert.ok(successful,'must obtain heads in seed sweep');
});
