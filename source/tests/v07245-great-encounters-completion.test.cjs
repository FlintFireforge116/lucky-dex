'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const set=require('../app/src/main/assets/tcg-classic-great-encounters');
const data=require('../app/src/main/assets/tcg-classic-battle-data');
const core=require('../app/src/main/assets/tcgp-battle-core');
const fx=require('../app/src/main/assets/tcgp-battle-effects');
const opponent=require('../app/src/main/assets/tcg-classic-opponents');
const ai=require('../app/src/main/assets/tcgp-battle-ai');
const loan=opponent.generate({sets:['dp2'],type:'Grass',seed:19});assert(loan.ok);
const ref=(id,uid)=>({cardId:id,uid:uid||id+'-ref'});
function slot(id,uid,energy={}){const s=core.makePokemonSlot(id,2,uid||id+'-slot');s.energy=energy;return s;}
function board(id='dp4-24',enemy='dp4-61',seed=23){const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});s.phase='battle';s.activeSide='player';s.turnNumber=10;for(const who of ['player','opponent']){s.sides[who].turnCount=7;s.sides[who].hand=[];s.sides[who].bench=[];s.sides[who].deck=[];}s.sides.player.active=slot(id,'our',{Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Darkness:4,Metal:4});s.sides.opponent.active=slot(enemy,'enemy');return s;}
function bench(s,who,id,uid='b',energy={}){const p=slot(id,uid,energy);p.benchSlot=s.sides[who].bench.length;s.sides[who].bench.push(p);return p;}
function n(s){return s.sides.player;}function f(s){return s.sides.opponent;}
function act(s,type,pred){const a=core.legalActions(s,s.activeSide).find(x=>x.type===type&&(!pred||pred(x)));assert.ok(a,`Missing ${type}: ${JSON.stringify(core.legalActions(s,s.activeSide))}`);core.applyAction(s,s.activeSide,a);return a;}
function choice(s,pred){assert.equal(s.phase,'effectChoice','Expected a choice');const all=core.legalActions(s,s.choiceSide);const a=pred?all.find(pred):all.find(x=>!x.choiceSkip)||all[0];assert.ok(a,`Missing choice: ${JSON.stringify(all)}`);core.applyAction(s,s.choiceSide,a);return a;}
function attack(s,index=0,cardId){return act(s,'attack',a=>a.attackIndex===index&&(!cardId||a.attackCardId===cardId));}
function power(s,cardId){return act(s,'ability',a=>!cardId||a.cardId===cardId);}
function drain(s){for(let i=0;i<25&&s.phase==='effectChoice';i++)choice(s);assert.notEqual(s.phase,'effectChoice','Unresolved choice chain');}
test('Great Encounters 106/106 enabled and effect schema is valid',()=>{assert.equal(set.coverage().battleEnabled,106);assert.equal(set.coverage().gated.length,0);for(const c of set.CARDS){assert.equal(c.support.status,'FULL');for(const a of c.attacks||[])assert.equal(fx.validateEffect(a.effect).length,0,c.id+': '+a.name);for(const a of c.abilities||[])assert.equal(fx.validateEffect(a.effect).length,0,c.id+': '+a.name);}for(const id of ['dp4-24','dp4-57','dp4-91','dp4-104','dp4-105','dp4-106']){const c=data.cardById(id);for(const a of [...(c.attacks||[]),...(c.abilities||[])])assert.ok(!/under implementation review|awaiting battle timing/.test(a.text),id);}});
test('Mawile Pick Out reveals selected Prize (not other Prizes), runs a Supporter but keeps it in place',()=>{const s=board();n(s).prizes=[ref('dp4-93','own0'),ref('dp4-98','own1')];f(s).prizes=[ref('dp4-97','enemy0'),ref('dp3-122','enemy1')];n(s).deck=[ref('dp4-88','draw1'),ref('dp4-93','draw2'),ref('dp4-89','draw3')];attack(s);choice(s,a=>a.choiceOption===1);let options=core.legalActions(s,s.choiceSide);assert.ok(options.every(a=>!a.choiceCardId),'Face-down cards must not be revealed in options');choice(s,a=>a.choicePrizeIndex===1);drain(s);assert.equal(f(s).prizes[1].faceUp,true);assert.equal(f(s).prizes[1].cardId,'dp3-122');assert.equal(f(s).prizes.length,2);assert.equal(f(s).prizes[0].faceUp,undefined);assert.ok(s.log.some(x=>x.type==='copiedSupporter'&&x.cardId==='dp3-122'));});
test('Mawile can also reveal own Prize; a non-Supporter does not trigger copy effect',()=>{const s=board();n(s).prizes=[ref('dp4-93','one')];f(s).prizes=[];attack(s);choice(s,a=>a.choicePrizeIndex===0);drain(s);assert.ok(n(s).prizes[0].faceUp);assert.equal(s.log.some(x=>x.type==='copiedSupporter'),false);});
test('Unown G GUARD discards actual attachments and becomes a Tool on chosen allied Pokemon',()=>{const s=board('dp4-61');const g=bench(s,'player','dp4-57','g',{Psychic:2});g.specialEnergy=[ref('dp3-130','metal')];g.tool=ref('dp4-99','leftovers');const dest=bench(s,'player','dp4-93','dest');power(s,'dp4-57');choice(s,a=>a.choiceCardId===dest.cardId);drain(s);assert.equal(n(s).bench.some(p=>p.uid==='g'),false);assert.equal(dest.tool?.cardId,'dp4-57');assert.equal(n(s).energyDiscard.Psychic,2);assert.ok(n(s).discard.some(x=>x.uid==='metal'));assert.ok(n(s).discard.some(x=>x.uid==='leftovers'));assert.ok(fx.attackEffectsPrevented(s,'player',dest,f(s).active,data.cardById));});
test('Unown L LINK borrows any Unown attack, but requires the copied printed Energy cost',()=>{const s=board('dp4-91');bench(s,'opponent','dp4-56','f');n(s).active.energy={Psychic:1};const available=core.legalActions(s,'player');assert.ok(available.some(x=>x.type==='attack'&&x.attackCardId==='dp4-56'&&x.attackIndex===0));const x=board('dp4-91');bench(x,'opponent','dp4-56','f');n(x).active.energy={};assert.ok(!core.legalActions(x,'player').some(a=>a.type==='attack'&&a.attackCardId==='dp4-56'));});
test('Unown L Hidden Power chooses real cards from either discard and reorders top',()=>{const s=board('dp4-91');n(s).discard.push(ref('dp4-93','first'),ref('dp4-88','second'));attack(s);choice(s,a=>a.choiceCardId==='dp4-88');choice(s,a=>a.choiceCardId==='dp4-93');drain(s);assert.equal(n(s).deck[0]?.uid,'first');assert.equal(n(s).deck[1]?.uid,'second');});
test('Darkrai LV.X Endless Darkness applies special Sleep check with two-coin knockout',()=>{const s=board('dp4-104','dp4-30');attack(s);assert.ok(f(s).active.conditions.sleep);assert.equal(f(s).active.conditions.sleep.recoveryCoins,2);assert.equal(f(s).active.conditions.sleep.knockoutOnDoubleTails,true);});
test('Darkrai LV.X Dark Shadow gives Darkness-type attacks +10 per Basic Darkness Energy without stacking',()=>{const base=board('dp4-3','dp4-61');n(base).active.energy={Darkness:2};const a=fx.attackDamageWithState(base,'player',n(base).active,'opponent',f(base).active,50,data.cardById);bench(base,'player','dp4-104','lvx1');bench(base,'player','dp4-104','lvx2');const b=fx.attackDamageWithState(base,'player',n(base).active,'opponent',f(base).active,50,data.cardById);assert.equal(b-a,20);});
test('Dialga LV.X Time Skip uses exactly two opponent coin flips and records outcome',()=>{const s=board('dp4-105');power(s);const flip=s.log.find(x=>x.reason==='Dialga Time Skip');assert.ok(flip);assert.equal(flip.side,'opponent');assert.equal(flip.results.length,2);if(flip.results.every(Boolean))assert.notEqual(s.activeSide,'player');if(flip.results.every(x=>!x))assert.equal(f(s).dp4SkipAfterDraw,true);});
test('Dialga LV.X double-tails Time Skip ends opponent turn AFTER their draw',()=>{let hit=false;for(let seed=1;seed<250&&!hit;seed++){const s=board('dp4-105','dp4-61',seed);f(s).deck=[ref('dp4-93','afterDraw')];power(s);const flip=s.log.find(x=>x.reason==='Dialga Time Skip');if(!flip.results.every(x=>!x))continue;hit=true;act(s,'endTurn');assert.ok(f(s).hand.some(x=>x.uid==='afterDraw'),'opponent must draw');assert.equal(s.activeSide,'player','opponent should be skipped');assert.ok(s.log.some(x=>x.type==='turnSkipped'&&x.side==='opponent'));}assert.ok(hit,'never found double tails');});
test('Palkia LV.X Restructure gives opponent the FIRST choice and attacker the second',()=>{const s=board('dp4-106','dp4-61');const ours=bench(s,'player','dp4-93','ourBench');const theirs=bench(s,'opponent','dp4-93','theirBench');power(s);assert.equal(s.choiceSide,'opponent');choice(s,a=>a.choiceCardId==='dp4-93');assert.equal(n(s).active.uid,'ourBench');assert.equal(s.choiceSide,'player');choice(s,a=>a.choiceCardId==='dp4-93');drain(s);assert.equal(f(s).active.uid,'theirBench');});
test('Palkia LV.X Hydro Reflect redistributes all Basic and Special Energy, with no copies',()=>{const s=board('dp4-106','dp4-61');const p=n(s).active;p.energy={Water:3};p.specialEnergy=[ref('dp3-130','metal')];const b=bench(s,'player','dp4-93','bench');attack(s);choice(s,a=>a.choiceOption===1);choice(s,a=>a.effectSpecialEnergyUid==='metal');choice(s,a=>a.choiceTarget==='bench');choice(s,a=>a.effectEnergyType==='Water');choice(s,a=>a.choiceTarget==='bench');choice(s,a=>a.effectEnergyType==='Water');choice(s,a=>a.choiceTarget==='bench');choice(s,a=>a.effectEnergyType==='Water');choice(s,a=>a.choiceTarget==='bench');drain(s);assert.equal(p.energy.Water,0);assert.equal(p.specialEnergy.length,0);assert.equal(b.energy.Water,3);assert.equal(b.specialEnergy[0].uid,'metal');});
test('Unown G Hidden Power deals 10 if damaged, otherwise 50',()=>{const a=board('dp4-57','dp4-61');attack(a);assert.equal(f(a).active.damage,50);const b=board('dp4-57','dp4-61');n(b).active.damage=10;attack(b);assert.equal(f(b).active.damage,10);});
test('Darkrai LV.X double tails genuinely Knocks Out the sleeping opposing Active',()=>{let found=false;for(let seed=1;seed<300&&!found;seed++){const s=board('dp4-104','dp4-30',seed);f(s).prizes=[ref('dp4-93','p1'),ref('dp4-93','p2')];const b=bench(s,'opponent','dp4-93','reserve');attack(s);if(s.log.some(x=>x.type==='darkraiSleepKO')){found=true;assert.ok(f(s).discard.some(x=>x.cardId==='dp4-30'));assert.ok(s.log.some(x=>x.type==='ko'&&x.cardId==='dp4-30'));}}assert.ok(found,'no double-tails condition found');});
test('Mawile Jaw Bite grants next-own-turn +20 post-Weakness and Resistance modifier',()=>{const s=board('dp4-24','dp4-61');attack(s,1);assert.equal(fx.modifierAmount(s,'player',n(s).active,'postWeaknessAttackDamage',data.cardById),0);s.turnNumber+=1;assert.equal(fx.modifierAmount(s,'player',n(s).active,'postWeaknessAttackDamage',data.cardById),20);});

test('Distinct face-down Prize, Tool and Special Energy actions remain unique for CPU/UI',()=>{
 const base={type:'effectChoice'};
 assert.equal(ai.sameAction({...base,choicePrizeIndex:0},{...base,choicePrizeIndex:1}),false);
 assert.equal(ai.sameAction({...base,choiceToolIndex:0},{...base,choiceToolIndex:1}),false);
 assert.equal(ai.sameAction({...base,effectSpecialEnergyUid:'one'},{...base,effectSpecialEnergyUid:'two'}),false);
});
test('CPU resolves Mawile hidden Prize and Palkia two-sided switch choices without stalling',()=>{
 const mawile=board('dp4-24','dp4-61');
 n(mawile).prizes=[ref('dp4-93','pr1')];f(mawile).prizes=[ref('dp4-89','pr2')];
 const palkia=board('dp4-106','dp4-61');
 bench(palkia,'player','dp4-93','ourBench');bench(palkia,'opponent','dp4-93','theirBench');
 attack(mawile);power(palkia);
 for(const state of [mawile,palkia]){
  let steps=0;
  while(state.phase==='effectChoice'&&steps++<15){
   const side=state.choiceSide;
   const a=ai.chooseAction(state,side,'Advanced',steps);
   assert.ok(a,'AI must select an action for '+side);
   assert.ok(core.legalActions(state,side).some(b=>ai.sameAction(a,b)),'AI selected an unrecognised choice');
   core.applyAction(state,side,a);
  }
  assert.notEqual(state.phase,'effectChoice','AI left unresolved selection');
 }
});
