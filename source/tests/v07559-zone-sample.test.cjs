'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js'),core=require('../app/src/main/assets/tcgp-battle-core.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js'),ai=require('../app/src/main/assets/tcgp-battle-ai.js');
const cases=[['gym1-37',1,5,['Fire'],0,20],['neo4-39',1,5,['Fire'],0,20],['bw8-23',1,4,['Fire'],0,50],['swsh5-82',0,6,['Fighting'],0,60],['pl4-3',1,3,['Fire','Metal'],60,20],['swsh1-24',0,1,['Fire'],90,90],['swsh1-188',0,1,['Fire'],90,90]];
let baseBattle;
function setup(side,id,types=['Fire']){
 const s=structuredClone(baseBattle||(baseBattle=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:41,firstSide:'player',playerEnergyTypes:['Fire'],opponentEnergyTypes:['Fire']})));
 s.phase='battle';s.activeSide=side;s.turnNumber=9;s.rngState=1;const foeSide=side==='player'?'opponent':'player',us=s.sides[side],foe=s.sides[foeSide];
 us.active=core.makePokemonSlot(id,2,'attacker');us.active.energy={Fire:5,Fighting:5,Water:5,Lightning:5,Metal:5,Colorless:5};foe.active=core.makePokemonSlot('ex4-95',2,'target');us.bench=[];foe.bench=[];us.energyTypes=types;us.energySupply=[];us.nextEnergyType=null;us.energyDiscard={};us.energyAvailable=true;us.energyUsed=false;us.energyType='Fire';us.turnCount=5;foe.turnCount=4;
 return {s,us,foe,foeSide};
}
function run(h,side,attack,flips){let i=0;const result=fx.resolveAttack(attack,{state:h.s,side,foeSide:h.foeSide,attacker:h.us.active,defender:h.foe.active,cardById:data.cardById,isAttack:true,random:()=>flips[i++]?0.1:0.9,shuffle:(_s,list)=>list.reverse(),action:{}});assert.equal(i,flips.length);return result;}
for(const side of ['player','opponent'])for(const [id,idx,n,types,base,amount] of cases){
 const attack=data.cardById(id).attacks[idx];
 for(const scenario of ['all heads','all tails','mixed','empty','short'])test(`${side} ${id} ${attack.name} ${scenario}`,()=>{
  const h=setup(side,id,types),{s,us,foe}=h;const supply=scenario==='empty'?[]:scenario==='short'?[types[0]]:Array.from({length:n+1},(_,i)=>scenario==='mixed'&&i%2===1?'Psychic':types[i%types.length]);
  const flips=Array.from({length:n},(_,i)=>scenario==='all tails'?false:scenario==='mixed'?i%3!==1:true);us.energySupply=[...supply];us.nextEnergyType=supply[0]||null;
  const deck=structuredClone(us.deck),discard=structuredClone(us.discard),foeSupply=structuredClone(foe.energySupply),energy=structuredClone(us.active.energy),spent=supply.slice(0,flips.filter(Boolean).length),expected=base+amount*spent.filter(t=>types.includes(t)).length;
  const r=run(h,side,attack,flips);assert.equal(r.damage,expected);assert.deepEqual(r.pendingEffects,[]);assert.deepEqual(us.energySupply,supply.slice(spent.length));assert.equal(us.nextEnergyType,us.energySupply[0]||null);assert.deepEqual(us.deck,deck);assert.deepEqual(us.discard,discard);assert.deepEqual(foe.energySupply,foeSupply);assert.deepEqual(us.active.energy,energy);assert.equal(us.energyAvailable,true);assert.equal(us.energyUsed,false);
  const ledger={};for(const t of spent)ledger[t]=(ledger[t]||0)+1;assert.deepEqual(us.energyDiscard,ledger);assert.deepEqual(s.log.find(x=>x.type==='coin'&&x.reason===attack.name).results,flips);
 });
 test(`${side} ${id} preview and AI are read-only`,()=>{
  const {s,us}=setup(side,id,types);us.energySupply=Array(n).fill(types[0]);const before=structuredClone(s);const preview=core.attackDamagePreview(s,side,idx);assert.equal(preview.text,`${base}–${base+n*amount}`);assert.equal(ai._test.matchupDamage(s,side,us.active,attack,idx,id),fx.attackDamageWithState(s,side,us.active,side==='player'?'opponent':'player',s.sides[side==='player'?'opponent':'player'].active,base+n*amount/2,data.cardById));assert.deepEqual(s,before);
 });
}
for(const side of ['player','opponent']){
 for(const id of ['ecard3-17','ecard3-H16'])test(`${side} ${id} Eruption samples each side independently`,()=>{
  const h=setup(side,id),{us,foe}=h;us.energySupply=['Fire','Water'];foe.energySupply=['Fire','Metal'];const decks=[structuredClone(us.deck),structuredClone(foe.deck)];const r=run(h,side,data.cardById(id).attacks[0],[true,false]);assert.equal(r.damage,40);assert.deepEqual(us.energySupply,['Water']);assert.deepEqual(foe.energySupply,['Fire','Metal']);assert.deepEqual(us.energyDiscard,{Fire:1});assert.deepEqual([us.deck,foe.deck],decks);
 });
 test(`${side} Gyarados returns Water and discards nonmatching Energy, without consuming physical cards`,()=>{
  const h=setup(side,'sm9-30',['Water','Fire']),{us}=h;us.energySupply=['Water','Fire','Water','Water','Metal','Water','Fire','Lightning'];const deck=structuredClone(us.deck),r=run(h,side,data.cardById('sm9-30').attacks[0],Array(7).fill(true));assert.equal(r.damage,150);assert.deepEqual(us.energySupply.sort(),['Lightning','Water','Water','Water','Water']);assert.deepEqual(us.energyDiscard,{Fire:2,Metal:1});assert.deepEqual(us.deck,deck);
 });
 test(`${side} Raikou captures Lightning, attaches to chosen Bench once`,()=>{
  const h=setup(side,'dp3-16',['Lightning','Fire']),{s,us}=h;us.energySupply=['Lightning','Lightning','Fire','Water'];us.nextEnergyType='Lightning';const bench=core.makePokemonSlot('dp3-82',2,'bench');bench.benchSlot=0;us.bench=[bench];const deck=structuredClone(us.deck);
  const action=core.legalActions(s,side).find(x=>x.type==='attack'&&x.attackIndex===0);assert.ok(action);core.applyAction(s,side,action);assert.equal(s.phase,'effectChoice');const ev=s.log.find(x=>x.type==='zoneSample'&&x.attack==='Thunder Climb');assert.equal(ev.captured.length,2);const pick=core.legalActions(s,side).find(x=>x.type==='effectChoice'&&x.choiceTarget==='bench');assert.ok(pick);core.applyAction(s,side,pick);assert.equal(us.bench[0].energy.Lightning,2);assert.equal(us.energyDiscard.Lightning||0,0);assert.deepEqual(us.deck,deck);assert.equal(s.log.filter(x=>x.type==='zoneSample').length,1);
 });
}
test('physical Special Energy and unrelated top-deck attacks are not converted',()=>{for(const id of ['swsh7-18','cel25-3','xy11-91','swsh4-99','swsh9-26'])for(const a of data.cardById(id).attacks)assert.equal(fx.zoneSampleSpec(a),null);});
for(const side of ['player','opponent']){
 for(const [id,idx,n,types] of cases)test(`${side} ${id} legal full attack samples exactly once`,()=>{
  const old=data.cardById;data.cardById=x=>x==='zone-dummy'?{id:x,name:'Neutral Target',kind:'pokemon',stage:'Basic',hp:1000,types:['Colorless'],subtype:'Colorless',retreat:1,attacks:[{name:'Tap',cost:[],damage:10,effect:{type:'noop'}}],abilities:[],battleEnabled:true}:old(x);
  try{const h=setup(side,id,types),{s,us,foe}=h;foe.active=core.makePokemonSlot('zone-dummy',2,'target');us.energySupply=Array(n+2).fill(types[0]);us.nextEnergyType=types[0];const deck=structuredClone(us.deck),discard=structuredClone(us.discard);
   const action=core.legalActions(s,side).find(x=>x.type==='attack'&&x.attackIndex===idx);assert.ok(action);core.applyAction(s,side,action);const ev=s.log.find(x=>x.type==='zoneSample');assert.ok(ev);assert.equal(s.log.filter(x=>x.type==='zoneSample').length,1);assert.equal(foe.active.damage,ev.damage);assert.deepEqual(us.deck,deck);assert.deepEqual(us.discard,discard);assert.equal(us.energySupply.length,n+2-ev.samples.length);
  }finally{data.cardById=old;}
 });
 test(`${side} Magcargo credits opposing discarded Energy to opposing ledger`,()=>{
  const h=setup(side,'ecard3-17'),{us,foe}=h;us.energySupply=['Fire'];foe.energySupply=['Fire','Water'];foe.energyDiscard={};const result=run(h,side,data.cardById('ecard3-17').attacks[0],[true,true]);assert.equal(result.damage,60);assert.deepEqual(us.energyDiscard,{Fire:1});assert.deepEqual(foe.energyDiscard,{Fire:1});assert.equal(foe.nextEnergyType,'Water');
 });
 test(`${side} Gyarados all tails does not shuffle or discard`,()=>{
  const h=setup(side,'sm9-30'),{us}=h;us.energySupply=['Water','Fire'];us.nextEnergyType='Water';const result=run(h,side,data.cardById('sm9-30').attacks[0],Array(7).fill(false));assert.equal(result.damage,30);assert.deepEqual(us.energySupply,['Water','Fire']);assert.deepEqual(us.energyDiscard,{});
 });
 test(`${side} Raikou with no Lightning does not request an attachment`,()=>{
  const h=setup(side,'dp3-16'),{us}=h;us.energySupply=['Fire','Metal'];const result=run(h,side,data.cardById('dp3-16').attacks[0],[true,true,true]);assert.equal(result.damage,50);assert.deepEqual(result.pendingEffects,[]);assert.deepEqual(us.energyDiscard,{Fire:1,Metal:1});
 });
}
