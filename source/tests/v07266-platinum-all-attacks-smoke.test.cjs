'use strict';const test=require('node:test'),assert=require('node:assert/strict');const core=require('../app/src/main/assets/tcgp-battle-core.js'),db=require('../app/src/main/assets/tcg-classic-battle-data.js'),cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const loan=cpu.generate({sets:['dp5'],type:'Fire',seed:12});if(!loan.ok)throw Error('loan');
const attacks=db.CARDS.filter(c=>c.setId==='pl1'&&c.kind==='pokemon'&&c.battleEnabled).flatMap(c=>(c.attacks||[]).map((a,i)=>({c,a,i})));
function runSmoke(preferOptionalEffects){const failures=[],skipped=[],processed=[];let steps=0;
for(const {c,a,i} of attacks){try{
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed:116,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});s.phase='battle';s.turnNumber=10;s.activeSide='player';
 for(const side of ['player','opponent']){const ss=s.sides[side];ss.turnCount=7;ss.bench=[];ss.hand=[{uid:'h1',cardId:'pl1-70'},{uid:'h2',cardId:'pl1-110'},{uid:'h3',cardId:'pl1-121'},{uid:'h4',cardId:'pl1-3'}];ss.discard=[{uid:'d1',cardId:'pl1-70'},{uid:'d2',cardId:'pl1-110'},{uid:'d3',cardId:'pl1-121'}];ss.deck=[{uid:'dek1',cardId:'pl1-70'},{uid:'dek2',cardId:'pl1-121'},{uid:'dek3',cardId:'pl1-3'},{uid:'dek4',cardId:'pl1-110'}];ss.energyDiscard={Grass:2,Fire:2,Water:2,Lightning:2,Psychic:2,Fighting:2,Darkness:2,Metal:2};ss.bench=[core.makePokemonSlot('pl1-70',3,side+'bench1'),core.makePokemonSlot('pl1-3',3,side+'bench2'),core.makePokemonSlot('pl1-96',3,side+'bench3')];ss.bench.forEach((x,j)=>{x.benchSlot=j;x.energy={Fire:3,Grass:3,Water:3}});}
 s.sides.player.active=core.makePokemonSlot(c.id,2,'test');s.sides.player.active.energy={Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Fighting:5,Darkness:5,Metal:5,Colorless:5};
 s.sides.opponent.active=core.makePokemonSlot('pl1-3',2,'target');s.sides.opponent.active.energy={Grass:3,Fire:3,Water:3,Lightning:3};
 const actions=core.legalActions(s,'player');const act=actions.find(x=>x.type==='attack'&&x.attackIndex===i);if(!act){skipped.push(c.id+':'+a.name);continue;}
 core.applyAction(s,'player',act);let localSteps=0,sign='';while(s.phase==='effectChoice'&&localSteps++<28){const opts=core.legalActions(s,s.choiceSide);if(!opts.length){failures.push([c.id,a.name,'empty-choice',sign]);break;}
 const pick=(preferOptionalEffects?opts.find(x=>!x.choiceSkip):opts.find(x=>x.choiceSkip))||opts[0];const newSign=[s.choiceSide,s.choice?.kind,opts.length,pick.choiceSkip||0,s.choice?.effect?.stage].join(':');if(sign===newSign&&localSteps>20){failures.push([c.id,a.name,'stuck-choice',sign]);break;}sign=newSign;
 core.applyAction(s,s.choiceSide,pick);
 }
 if(s.phase==='effectChoice'){failures.push([c.id,a.name,'unresolved',localSteps]);}else processed.push(c.id+':'+a.name);steps+=localSteps;
}catch(e){failures.push([c.id,a.name,String(e.message||e).slice(0,210)])}}
assert.equal(attacks.length,221,'all 221 printed Platinum Pokémon attacks registered');
assert.deepEqual(skipped,[],'every attack should be legal in the fully energized test state');
assert.deepEqual(failures,[],'all attacks must resolve choices without throwing or hanging');
assert.equal(processed.length,221);return steps;}
test('all 221 Platinum attacks resolve without exceptions or stuck optional choices (decline)',()=>{runSmoke(false)});
test('all 221 Platinum attacks resolve without exceptions or stuck optional choices (accept)',()=>{runSmoke(true)});
