'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const slot=(cardId,uid,energy={})=>({cardId,uid,stack:[cardId],damage:0,energy,specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const ref=(cardId,uid)=>({cardId,uid});
let baseBattle;
function setup(side='player',id='sm11-54'){
 const old=data.cardById,dummy={id:'sm6-dummy',name:'Test target',kind:'pokemon',stage:'Basic',hp:1000,types:['Colorless'],subtype:'Colorless',retreat:1,battleEnabled:true,deckEligible:true,attacks:[{name:'Tap',cost:[],damage:10,effect:{type:'noop'}}],abilities:[]};data.cardById=x=>x===dummy.id?dummy:old(x);
 const s=structuredClone(baseBattle||(baseBattle=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:32132,firstSide:'player',playerEnergyTypes:['Psychic','Fighting'],opponentEnergyTypes:['Psychic','Fighting']})));s.phase='battle';s.activeSide=side;s.turnNumber=7;
 const foe=side==='player'?'opponent':'player';
 for(const name of ['player','opponent']){let b=s.sides[name];b.turnCount=4;b.hand=[];b.deck=Array.from({length:15},(_,i)=>ref('sm6-1',name+'d'+i));b.prizes=Array.from({length:5},(_,i)=>ref('sm6-1',name+'p'+i));b.discard=[];b.energyDiscard={};b.energySupply=['Psychic','Fighting','Psychic'];b.active=slot(name===side?id:dummy.id,name+'a',{Grass:3,Psychic:3,Fighting:3,Metal:3,Colorless:3});b.bench=[slot(dummy.id,name+'b')];b.bench[0].benchSlot=0;}
 return {s,side,foe,us:s.sides[side],them:s.sides[foe],done:()=>data.cardById=old};
}
function use(h,type,find=()=>true){const a=core.legalActions(h.s,h.s.choiceSide||h.side).find(x=>x.type===type&&find(x));assert.ok(a,`${type}: ${JSON.stringify(core.legalActions(h.s,h.s.choiceSide||h.side))}`);core.applyAction(h.s,h.s.choiceSide||h.side,a);return a;}
function attack(h,name){const idx=data.cardById(h.us.active.cardId).attacks.findIndex(a=>a.name===name);return use(h,'attack',a=>a.attackIndex===idx);}
function choice(h,pred){return use(h,'effectChoice',pred);}
function trainer(h,id){h.us.hand.push(ref(id,'trainer'));return use(h,'trainer',a=>a.cardId===id);}
const set=require('../app/src/main/assets/tcg-classic-unified-minds.js');
const allEnergy=Object.fromEntries(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'].map(t=>[t,5]));
for(const side of ['player','opponent']){
 test(side+' every enabled attack executes and exits effect choice with real catalogue cards',()=>{
  let count=0;const failures=[];
  for(const c of set.CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled))for(const [idx,a] of c.attacks.entries()){
   const h=setup(side,c.id);try{
    h.us.active.energy={...allEnergy};h.us.prizes.length=h.them.prizes.length=3;
    h.us.bench=['sm6-1','sm6-21','sm6-36'].map((id,i)=>({...slot(id,side+'b'+i,{Water:1}),benchSlot:i}));
    h.us.hand=[ref('sm6-108','judge'),ref('neo1-111','water'),ref('sm6-1','grass')];
    h.us.discard=[ref('sm6-112','tool'),ref('neo1-111','discard-water'),ref('sm6-1','discard-mon')];
    h.us.energyDiscard={Grass:2,Psychic:2,Fighting:2};h.them.active.energy={Water:2};h.them.active.damage=40;h.them.bench[0].damage=10;
    h.them.hand=[ref('sm6-108','foe-judge'),ref('sm6-112','foe-tool')];
    h.them.bench[0].specialEnergy=[ref('sm6-118','foe-unit')];
    if(c.name==='Latios-GX'){h.us.benchLimit=5;h.us.bench.push({...slot('sm6-1',side+'b3'),benchSlot:3});h.s.stadium={cardId:'xy6-89',uid:'sky-field',owner:side};}
    if(a.name==='Black Lance')h.them.bench.push({...slot('sm10-20',h.foe+'gx'),benchSlot:1});
    const actions=core.legalActions(h.s,side).filter(x=>x.type==='attack'&&x.attackIndex===idx);
    assert.ok(actions.length,'no legal attack');core.applyAction(h.s,side,actions[0]);
    let steps=0;while(h.s.phase==='effectChoice'&&steps++<100){const who=h.s.choiceSide||side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length,'empty choice');core.applyAction(h.s,who,(steps>20?choices.find(x=>x.choiceSkip):null)||choices.find(x=>!x.choiceSkip)||choices[0]);}
    assert.notEqual(h.s.phase,'effectChoice','stuck effect choice');count++;
   }catch(e){failures.push(`${c.id} ${a.name}: ${e.message}`);}finally{h.done();}
  }
  assert.deepEqual(failures,[]);assert.equal(count,set.CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled).reduce((n,c)=>n+c.attacks.length,0));
 });

}
function resolve(h,selector=a=>!a.choiceSkip){let n=0;while(h.s.phase==='effectChoice'&&n++<40){const who=h.s.choiceSide||h.side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length);core.applyAction(h.s,who,choices.find(selector)||choices[0]);}assert.notEqual(h.s.phase,'effectChoice');}

for(const side of ['player','opponent']){
 test(side+' Tandem Shock requires actual bench-to-active movement this turn',()=>{for(const moved of [false,true]){const h=setup(side,'sm11-54');try{h.us.active.energy={Lightning:3};if(moved)h.us.active.movedToActiveTurn=h.s.turnNumber;attack(h,'Tandem Shock');resolve(h);assert.equal(h.them.active.damage,moved?160:80);assert.equal(!!h.them.active.conditions.paralysis,moved);}finally{h.done();}}});
 test(side+' Lightning Ride GX uses typed extra Energy and switches',()=>{for(const extra of [false,true]){const h=setup(side,'sm11-54');try{h.us.active.energy=extra?{Lightning:5}:{Lightning:2,Colorless:3};attack(h,'Lightning Ride-GX');resolve(h);assert.equal(h.them.active.damage,extra?250:150);assert.equal(h.us.active.uid,side+'b');}finally{h.done();}}});
 test(side+' Trap Bolt uses remaining HP',()=>{for(const low of [false,true]){const h=setup(side,'sm11-67');try{h.us.active.energy={Fighting:1};h.them.active.damage=low?950:0;attack(h,'Trap Bolt');resolve(h);if(!low)assert.equal(h.them.active.damage,60);else assert.equal(h.them.active.damage,980);}finally{h.done();}}});
 test(side+' Hapu keeps two selected top-six cards and discards the other four',()=>{const h=setup(side,'sm11-54');try{const top=h.us.deck.slice(0,6).map(x=>x.uid);trainer(h,'sm11-200');resolve(h);assert.equal(h.us.hand.length,2);assert.ok(h.us.hand.every(x=>top.includes(x.uid)));assert.equal(h.us.discard.filter(x=>top.includes(x.uid)).length,4);assert.equal(h.us.deck.length,9);}finally{h.done();}});
 test(side+' Coach Trainer gives four cards only with active TAG TEAM',()=>{for(const tag of [false,true]){const h=setup(side,tag?'sm11-54':'sm11-67');try{trainer(h,'sm11-192');resolve(h);assert.equal(h.us.hand.length,tag?4:2);}finally{h.done();}}});
 test(side+' Cherish Ball searches only GX Pokémon',()=>{const h=setup(side);try{h.us.deck=[ref('sm11-54','gx'),ref('sm11-67','normal'),ref('sm11-192','trainer2')];trainer(h,'sm11-191');resolve(h);assert.deepEqual(h.us.hand.map(x=>x.uid),['gx']);}finally{h.done();}});
}
for(const side of ['player','opponent']){
 test(side+' Perfection borrows only own benched or discarded EX/GX attacks at printed cost',()=>{const h=setup(side,'sm11-71');try{h.us.bench[0].cardId='sm11-54';h.us.discard=[ref('sm11-47','discard-gx'),ref('sm11-67','discard-basic')];h.us.hand=[ref('sm11-78','hand-gx')];h.them.discard=[ref('sm11-126','enemy-gx')];h.us.active.energy={Lightning:3};const choices=core.attackOptions(h.s,side);assert.ok(choices.some(x=>x.cardId==='sm11-54'&&x.attack.name==='Tandem Shock'));assert.ok(choices.some(x=>x.cardId==='sm11-47'));assert.ok(!choices.some(x=>['sm11-67','sm11-78','sm11-126'].includes(x.cardId)));const a=core.legalActions(h.s,side).find(x=>x.type==='attack'&&x.attackCardId==='sm11-54'&&x.attackIndex===0);assert.ok(a);core.applyAction(h.s,side,a);resolve(h);assert.equal(h.them.active.damage,80);}finally{h.done();}});
 test(side+' Latios Power Bind needs five Pokemon, Clear Vision permanently locks opponent GX',()=>{const h=setup(side,'sm11-78');try{assert.equal(core.legalActions(h.s,side).filter(x=>x.type==='attack').length,0);h.s.stadium={cardId:'xy6-89',uid:'sky',ownerSide:side};for(let i=1;i<4;i++)h.us.bench.push({...slot('sm6-1',side+'b'+i),benchSlot:i});h.them.active=slot('sm11-54',h.foe+'gx',{Lightning:5});attack(h,'Clear Vision-GX');resolve(h);assert.equal(h.them.sm11GxLocked,true);const actions=core.legalActions(h.s,h.foe);assert.ok(actions.some(a=>a.type==='attack'&&a.attackIndex===0));assert.ok(!actions.some(a=>a.type==='attack'&&a.attackIndex===1));}finally{h.done();}});
 test(side+' Spiteful Sigh places counters on self and deals twice their amount',()=>{const h=setup(side,'sm11-38');try{h.us.active.energy={Water:1};use(h,'attack',a=>a.attackIndex===0&&String(a.effectSelection)==='3');resolve(h);assert.equal(h.us.active.damage,30);assert.equal(h.them.active.damage,60);}finally{h.done();}});
 test(side+' Discerning Spear can attack an undamaged target but does no damage',()=>{const h=setup(side,'sm11-142');try{h.us.active.energy={Metal:1};attack(h,'Discerning Spear');resolve(h);assert.equal(h.them.active.damage,0);}finally{h.done();}});
 test(side+' Reset Stamp redraws according to remaining Prizes',()=>{const h=setup(side);try{h.them.prizes.length=2;h.them.hand=[ref('sm6-1','old1'),ref('sm6-1','old2'),ref('sm6-1','old3')];trainer(h,'sm11-206');resolve(h);assert.equal(h.them.hand.length,2);assert.equal(h.them.deck.length,16);}finally{h.done();}});
}

for(const side of ['player','opponent']){
 test(side+' Z-Crystal grants matching printed GX attack, costs four Energy and obeys GX limit and Tool suppression',()=>{const h=setup(side,'sm11-2');try{h.us.active.cardId='sm11-3';h.us.active.stack=['sm11-2','sm11-3'];h.us.active.tool=ref('sm11-195','z');h.us.active.energy={Grass:4};assert.ok(core.attackOptions(h.s,side).some(a=>a.cardId==='sm11-195'));h.us.gxAttackUsed=true;assert.ok(!core.legalActions(h.s,side).some(a=>a.type==='attack'&&a.attackCardId==='sm11-195'));h.us.gxAttackUsed=false;h.s.stadium={cardId:'sm6-111',uid:'lab',ownerSide:side};assert.ok(!core.attackOptions(h.s,side).some(a=>a.cardId==='sm11-195'));h.s.stadium=null;h.us.active.energy={Grass:3};assert.ok(!core.legalActions(h.s,side).some(a=>a.type==='attack'&&a.attackCardId==='sm11-195'));h.us.active.energy={Grass:4};use(h,'attack',a=>a.attackCardId==='sm11-195');resolve(h);assert.equal(h.them.active.damage,180);assert.ok(h.us.gxAttackUsed);assert.ok(h.us.active.attackGuard?.preventEffects);}finally{h.done();}});
 test(side+' Injection adds a physical discard card to opponent Prizes and increases their victory threshold',()=>{const h=setup(side,'sm11-160');try{h.us.active.energy={Lightning:1};h.them.discard=[ref('sm11-2','injected')];const before=h.them.prizes.length;attack(h,'Injection-GX');resolve(h);assert.equal(h.them.prizes.length,before+1);assert.equal(h.them.prizes.at(-1).uid,'injected');assert.equal(h.them.sm11ExtraPrizes,1);assert.equal(h.them.discard.length,0);h.them.prizesTaken=h.s.rules.prizeCount;h.them.prizes=[ref('sm11-2','last')];h.them.active.energy={};h.s.activeSide=h.foe;core.endTurn(h.s);assert.notEqual(h.s.phase,'finished');h.s.activeSide=h.foe;h.s.phase='battle';h.us.active.damage=core.maxHp(h.s,side,h.us.active)-10;const a=core.legalActions(h.s,h.foe).find(a=>a.type==='attack');assert.ok(a);core.applyAction(h.s,h.foe,a);resolve(h);assert.equal(h.them.prizesTaken,h.s.rules.prizeCount+1);assert.equal(h.s.winner,h.foe);}finally{h.done();}});
 test(side+' Injection can select actual discarded Basic Energy ledger, never fresh supply',()=>{const h=setup(side,'sm11-160');try{h.us.active.energy={Lightning:1};h.them.energyDiscard={Water:1};const before=h.them.energySupply.slice();attack(h,'Injection-GX');resolve(h);assert.equal(h.them.energyDiscard.Water,0);assert.equal(h.them.sm11ExtraPrizes,1);assert.ok(data.cardById(h.them.prizes.at(-1).cardId).basicEnergy);assert.deepEqual(h.them.energySupply,before.slice(1));}finally{h.done();}});
 test(side+' Weakness Guard Energy cancels weakness only while attached',()=>{const h=setup(side,'sm11-2');try{h.them.active=slot('sm11-37',h.foe+'a');const weakness=data.cardById('sm11-37').weakness;const old=data.cardById;data.cardById=id=>id==='sm11-2'?{...old(id),types:[weakness],subtype:weakness}:old(id);const unguarded=fx.attackDamageWithState(h.s,side,h.us.active,h.foe,h.them.active,30,data.cardById);h.them.active.specialEnergy=[ref('sm11-213','guard')];assert.ok(unguarded>30);assert.equal(fx.attackDamageWithState(h.s,side,h.us.active,h.foe,h.them.active,30,data.cardById),30);}finally{h.done();}});
 test(side+' Blue Tactics draws only at turn end',()=>{const h=setup(side);try{trainer(h,'sm11-188');assert.equal(h.us.hand.length,0);core.endTurn(h.s);assert.equal(h.us.hand.length,8);assert.equal(h.us.sm11BlueTurn,undefined);}finally{h.done();}});
 test(side+' Super Growth evolves a Grass Basic twice from deck',()=>{const h=setup(side,'sm11-1');try{h.us.active.energy={};h.us.bench[0]= {...slot('sm11-7',side+'seed'),benchSlot:0};h.us.deck=[ref('sm11-8','stage1'),ref('sm11-9','stage2'),...h.us.deck];attack(h,'Super Growth');resolve(h);assert.equal(h.us.bench[0].cardId,'sm11-9');assert.deepEqual(h.us.bench[0].stack,['sm11-7','sm11-8','sm11-9']);}finally{h.done();}});
 test(side+' Tropical Hour shuffles all opposing attached Energy only with extra cost',()=>{for(const extra of [false,true]){const h=setup(side,'sm11-1');try{h.us.active.energy={Grass:extra?6:3};h.them.active.energy={Water:2};h.them.bench[0].energy={Fire:1};h.them.bench[0].specialEnergy=[ref('sm11-213','guard')];attack(h,'Tropical Hour-GX');resolve(h);assert.equal(h.them.active.energy.Water,extra?0:2);assert.equal(h.them.bench[0].energy.Fire,extra?0:1);assert.equal(h.them.bench[0].specialEnergy.length,extra?0:1);if(extra)assert.ok([...h.them.deck,...h.them.hand].some(x=>x.uid==='guard'));}finally{h.done();}}});
 test(side+' Victory Sign chooses distinct physical Energy types',()=>{const h=setup(side,'sm11-26');try{h.us.active.energy={Fire:1};h.us.energySupply=[];h.us.deck=[ref('neo1-111','water1'),ref('neo1-111','water2'),ref('neo1-107','fire'),...h.us.deck];attack(h,'Victory Sign');resolve(h);assert.equal(h.us.active.energy.Water,1);assert.equal(h.us.active.energy.Fire,2);assert.ok(h.us.deck.some(x=>x.uid==='water2'));}finally{h.done();}});
 test(side+' Tag Switch transfers exactly two actual attachments from a TAG TEAM',()=>{const h=setup(side,'sm11-54');try{h.us.active.energy={Lightning:2};trainer(h,'sm11-209');resolve(h);assert.equal(h.us.active.energy.Lightning,0);assert.equal(h.us.bench[0].energy.Lightning,2);}finally{h.done();}});
 test(side+' Grimsley moves at most 3 counters between the same opposing pair',()=>{const h=setup(side);try{h.them.active.damage=50;trainer(h,'sm11-199');resolve(h);assert.equal(h.them.active.damage,20);assert.equal(h.them.bench[0].damage,30);}finally{h.done();}});
 test(side+' Dimension Breach triggers only on actual bench play and discards a Special Energy',()=>{const h=setup(side);try{h.them.active.specialEnergy=[ref('sm11-213','guard')];h.us.hand=[ref('sm11-86','gir')];use(h,'bench',a=>a.cardId==='sm11-86'||a.handIndex===0);resolve(h);assert.equal(h.them.active.specialEnergy.length,0);assert.ok(h.them.discard.some(x=>x.uid==='guard'));}finally{h.done();}});
 test(side+' Durable Blade returns only Aegislash on attack KO',()=>{const h=setup(side,'sm11-54');try{h.us.active.energy={Lightning:3};h.them.active={...slot('sm11-95',h.foe+'a',{Metal:1}),stack:['sm11-92','sm11-94','sm11-95']};h.them.active.damage=100;attack(h,'Tandem Shock');resolve(h);assert.ok(h.them.hand.some(x=>x.cardId==='sm11-95'));assert.ok(h.them.discard.some(x=>x.cardId==='sm11-94'));assert.equal(h.them.energyDiscard.Metal,1);}finally{h.done();}});
 test(side+' Captivating Wink benches selected opponent Basics, not evolutions',()=>{const h=setup(side);try{h.us.hand=[ref('sm11-141','maw')];h.them.hand=[ref('sm11-2','yanma'),ref('sm11-3','yanmega')];use(h,'bench',a=>a.handIndex===0);resolve(h);assert.ok(h.them.bench.some(p=>p.uid==='yanma'));assert.ok(h.them.hand.some(p=>p.uid==='yanmega'));}finally{h.done();}});
 test(side+' Dynamic Swing optional boost and opposing attack vulnerability',()=>{for(const boost of [false,true]){const h=setup(side,'sm11-170');try{h.us.active.energy={Colorless:4};use(h,'attack',a=>a.attackIndex===0&&a.effectSelection===(boost?'boost':'normal'));resolve(h);assert.equal(h.them.active.damage,boost?200:100);assert.equal(fx.modifierAmount(h.s,side,h.us.active,'damageReduction',data.cardById),boost?-100:0);}finally{h.done();}}});
}
for(const side of ['player','opponent']){
 test(side+' Giant Bomb retaliates only at 180 attack damage and expires at the end of enemy turn',()=>{for(const boost of [false,true]){const h=setup(side,'sm11-54');try{h.us.active.energy={Lightning:boost?5:3};h.them.active.tool=ref('sm11-196','bomb');attack(h,boost?'Lightning Ride-GX':'Tandem Shock');resolve(h);const source=h.us.bench.find(p=>p.uid===side+'a')||h.us.active;assert.equal(source.damage,boost?100:0);assert.equal(h.them.active.tool,null);assert.ok(h.them.discard.some(x=>x.uid==='bomb'));}finally{h.done();}}});
 test(side+' Slaking Counterattack reacts to actual attack damage',()=>{const h=setup(side,'sm11-54');try{h.us.active.energy={Lightning:3};h.them.active=slot('sm11-170',h.foe+'slak');attack(h,'Tandem Shock');resolve(h);assert.equal(h.us.active.damage,40);}finally{h.done();}});
 test(side+' Bursting Spores only reacts to Spore played from hand',()=>{const h=setup(side);try{h.us.bench[0]={...slot('sm11-14',side+'amoonguss'),benchSlot:0};h.us.hand=[ref('sm11-13','foongus')];use(h,'bench',a=>a.handIndex===0);resolve(h);assert.ok(h.them.active.conditions.sleep);assert.ok(h.them.active.conditions.poison);}finally{h.done();}});
 test(side+' Ear-Ringing Bell confuses the attacker after real damage',()=>{const h=setup(side,'sm11-54');try{h.us.active.energy={Lightning:3};h.them.active.tool=ref('sm11-194','bell');attack(h,'Tandem Shock');resolve(h);assert.ok(h.us.active.conditions.confusion);}finally{h.done();}});
 test(side+' Jynx Ominous Posture moves exactly one own counter',()=>{const h=setup(side,'sm11-76');try{h.us.active.damage=30;use(h,'ability');resolve(h);assert.equal(h.us.active.damage,20);assert.equal(h.us.bench[0].damage,10);}finally{h.done();}});
 test(side+' Hurricane Charge attaches one of each Water and Lightning from hand',()=>{const h=setup(side,'sm11-151');try{h.us.active.energy={};h.us.hand=[ref('neo1-111','water1'),ref('neo1-111','water2'),ref('neo1-109','lightning')];use(h,'ability');resolve(h);assert.equal(h.us.active.energy.Water,1);assert.equal(h.us.active.energy.Lightning,1);assert.equal(h.us.hand.filter(r=>r.cardId==='neo1-111').length,1);}finally{h.done();}});
 test(side+' Tag Cheer attaches hand Energy only to friendly TAG TEAM',()=>{const h=setup(side,'sm11-123');try{h.us.active.energy={Colorless:1};h.us.bench[0]={...slot('sm11-54',side+'tag'),benchSlot:0};h.us.hand=[ref('neo1-109','lightning')];attack(h,'Tag Cheer');resolve(h);assert.equal(h.us.bench[0].energy.Lightning,1);assert.equal(h.us.hand.length,0);}finally{h.done();}});
}
for(const side of ['player','opponent']){
 test(side+' Drowsing places six counters only if Komala stays asleep after checkup',()=>{const seen=new Set();for(let seed=1;seed<=30&&seen.size<2;seed++){const h=setup(side,'sm11-185');try{h.s.rngState=seed*1000000;h.us.active.conditions.sleep=true;core.checkup(h.s);const asleep=!!h.us.active.conditions.sleep;seen.add(asleep);assert.equal(h.them.active.damage,asleep?60:0);}finally{h.done();}}assert.equal(seen.size,2);});
 test(side+' Turn the Tables requires a GX attack on the immediately preceding turn',()=>{for(const previous of [false,true]){const h=setup(side,'sm11-107');try{h.us.active.energy={Colorless:1};if(previous)h.them.sm11LastGxTurn=h.s.turnNumber-1;const old=h.them.active.uid;attack(h,'Turn the Tables');resolve(h);assert.equal(h.them.active?.uid===old,!previous);if(previous)assert.ok(h.them.deck.some(x=>x.uid.startsWith(old+'-shuffle')));}finally{h.done();}}});
}

for(const side of ['player','opponent']){
 test(side+' Grind Up discards Stadium and attaches up to three real hand Fire/Metal Energy only to Haxorus',()=>{const h=setup(side,'sm11-156');try{h.s.stadium={cardId:'sm11-197',uid:'hearth',ownerSide:h.foe};h.us.active.energy={};h.us.hand=[ref('neo1-107','fire1'),ref('neo1-107','fire2'),ref('sm11-2','mon'),ref('neo1-107','fire3'),ref('neo1-107','fire4')];use(h,'ability');resolve(h);assert.equal(h.s.stadium,null);assert.ok(h.them.discard.some(x=>x.uid==='hearth'));assert.equal(h.us.active.energy.Fire,3);assert.equal(h.us.hand.length,2);assert.ok(h.us.hand.some(x=>x.uid==='mon'));}finally{h.done();}});
 test(side+' Snack Search recovers a real discard card to top on heads and ends turn on both outcomes',()=>{for(const heads of [true,false]){const h=setup(side,'sm11-173');try{h.us.discard=[ref('sm11-2','snack')];const original=core.random;let seed=1;for(;seed<100000;seed++){h.s.rngState=seed;const probe=structuredClone(h.s);if((original(probe)<.5)===heads)break;}use(h,'ability');resolve(h);assert.equal(h.s.activeSide,h.foe);assert.equal(h.us.deck[0].uid==='snack',heads);assert.equal(h.us.discard.some(x=>x.uid==='snack'),!heads);}finally{h.done();}}});
 test(side+' Research Lab benches only Fossil evolutions then ends turn',()=>{const h=setup(side);try{h.s.stadium={cardId:'sm11-205',uid:'lab',ownerSide:side};h.us.deck=[ref('sm11-44','fossil1'),ref('sm11-120','fossil2'),ref('sm11-2','normal'),...h.us.deck];const valid=h.us.deck.filter(x=>data.cardById(x.cardId)?.evolvesFrom==='Unidentified Fossil'&&data.cardById(x.cardId)?.battleEnabled).map(x=>x.uid);assert.ok(valid.length>=1);use(h,'stadiumAction');resolve(h);assert.equal(h.s.activeSide,h.foe);assert.deepEqual(h.us.bench.slice(1).map(x=>x.uid),valid.slice(0,2));assert.ok(h.us.deck.some(x=>x.uid==='normal'));}finally{h.done();}});
 test(side+' Downburst optional return affects attachments on both active Pokemon but not bench or evolution stack',()=>{for(const useEffect of [true,false]){const h=setup(side,'sm11-176');try{h.us.active.energy={Colorless:3};h.us.active.stack=['sm11-174','sm11-175','sm11-176'];h.us.active.tool=ref('sm11-201','belt');h.them.active.specialEnergy=[ref('sm11-213','guard')];h.them.bench[0].energy={Water:1};attack(h,'Downburst');resolve(h,a=>a.choiceOption===(useEffect?0:1));assert.equal(h.them.active.damage,90);assert.equal(h.us.active.stack.length,3);assert.equal(h.them.bench[0].energy.Water,1);assert.equal(h.us.active.energy.Colorless,useEffect?0:3);assert.equal(h.us.active.tool===null,useEffect);assert.equal(h.them.active.specialEnergy.length,useEffect?0:1);if(useEffect){assert.ok(h.us.deck.some(x=>x.uid==='belt'));assert.ok([...h.them.deck,...h.them.hand].some(x=>x.uid==='guard'));}}finally{h.done();}}});
}
for(const side of ['player','opponent']){
 test(side+' Burning Road transfers Fire to Heatran only after moving from bench during own turn',()=>{const h=setup(side);try{h.us.bench[0]= {...slot('sm11-25',side+'heatran'),benchSlot:0};h.us.active.energy={Fire:2,Water:1};h.us.active.specialEnergy=[ref('sm11-213','weakguard')];h.us.hand=[ref('base1-95','switch')];const a=core.legalActions(h.s,side).find(x=>x.type==='trainer'&&x.cardId==='base1-95');assert.ok(a);core.applyAction(h.s,side,a);resolve(h);assert.equal(h.us.active.cardId,'sm11-25');assert.equal(h.us.active.energy.Fire,2);assert.equal(h.us.bench[0].energy.Water,1);assert.equal(h.us.bench[0].energy.Fire,0);assert.equal(h.us.bench[0].specialEnergy.length,1);}finally{h.done();}});
 test(side+' Spirit Burner counts Pokemon among top five, benches only newly discarded Fire Pokemon',()=>{const h=setup(side,'sm11-30');try{h.us.active.energy={Fire:1};h.us.deck=[ref('sm11-27','litwick'),ref('sm11-29','lampent'),ref('sm11-2','yanma'),ref('sm11-192','trainer'),ref('neo1-107','energy'),...h.us.deck];h.us.discard=[ref('sm11-21','older')];attack(h,'Spirit Burner');resolve(h);assert.equal(h.them.active.damage,190);assert.deepEqual(h.us.bench.slice(1).map(x=>x.uid),['litwick','lampent']);assert.ok(h.us.discard.some(x=>x.uid==='older'));assert.ok(h.us.discard.some(x=>x.uid==='yanma'));assert.equal(h.us.deck.length,15);}finally{h.done();}});
 test(side+' Ancient Custom blanks opposing Tools only, and Ability suppression restores them',()=>{const h=setup(side,'sm11-45');try{h.us.active.tool=ref('sm11-201','ownbelt');h.them.active=slot('sm11-3',h.foe+'a',{Grass:4});h.them.active.tool=ref('sm11-195','z');assert.equal(fx.toolEffectsSuppressed(h.s,data.cardById,h.us.active),false);assert.equal(fx.toolEffectsSuppressed(h.s,data.cardById,h.them.active),true);assert.ok(!core.attackOptions(h.s,h.foe).some(x=>x.cardId==='sm11-195'));h.us.active.abilitySuppressed={duration:'whileInPlay'};assert.ok(core.attackOptions(h.s,h.foe).some(x=>x.cardId==='sm11-195'));}finally{h.done();}});
}

for(const side of ['player','opponent']){
 test(side+' Electro Rain discards selected Lightning cards and permits repeated target damage',()=>{const h=setup(side,'sm11-57');try{h.us.active.energy={Lightning:2,Water:1};h.us.active.specialEnergy=[ref('sm5-138','unit')];attack(h,'Electro Rain');choice(h,a=>a.choiceOption===0);choice(h,a=>a.choiceOption===0);choice(h,a=>a.choiceSkip);resolve(h,a=>a.choiceTarget==='active');assert.equal(h.us.active.energy.Lightning,0);assert.equal(h.us.active.energy.Water,1);assert.equal(h.us.energyDiscard.Lightning,2);assert.equal(h.us.active.specialEnergy.length,1);assert.equal(h.them.active.damage,60);}finally{h.done();}});
 test(side+' Electric Swamp hand Ability requires four attached Lightning cards and a free Bench',()=>{const h=setup(side,'sm11-2');try{h.us.hand=[ref('sm11-66','eel')];h.us.active.energy={Lightning:3};assert.ok(!core.legalActions(h.s,side).some(a=>a.type==='sm11ElectricSwamp'));h.us.bench[0].energy={Lightning:1};use(h,'sm11ElectricSwamp');resolve(h);const eel=h.us.bench.find(p=>p.uid==='eel');assert.ok(eel);assert.equal(eel.energy.Lightning,4);assert.equal(h.us.active.energy.Lightning,0);assert.equal(h.us.bench[0].energy.Lightning,0);assert.equal(h.us.hand.length,0);}finally{h.done();}});
 test(side+' Lazy Howl ends only the affected next turn on physical hand attachment',()=>{for(const physical of [true,false]){const h=setup(side,'sm11-167');try{attack(h,'Lazy Howl');resolve(h);assert.equal(h.s.activeSide,h.foe);h.them.hand=[ref('neo1-109','hand-energy')];const a=core.legalActions(h.s,h.foe).find(a=>a.type===(physical?'attachSpecial':'attach')&&a.target==='active');assert.ok(a);core.applyAction(h.s,h.foe,a);resolve(h);assert.equal(h.s.activeSide,physical?side:h.foe);}finally{h.done();}}});
 test(side+' Sage Riddle correct and incorrect type guesses draw for the right side and preserve the card',()=>{for(const correct of [true,false]){const h=setup(side,'sm11-182');try{h.us.hand=[ref('sm11-2','secret')];attack(h,"Sage's Riddle");choice(h,a=>a.choiceHandIndex===0);assert.equal(h.s.choiceSide,h.foe);const guess=h.s.pendingChoice.options.indexOf(correct?'Grass':'Fire');choice(h,a=>a.choiceOption===guess);resolve(h);assert.equal(h.us.hand.filter(r=>r.uid==='secret').length,1);assert.equal(h.us.hand.length,correct?1:5);assert.equal(h.them.hand.length,correct?5:1);}finally{h.done();}}});
 test(side+' Blaine Quiz selects a printed attack and opponent guesses name without seeing the card',()=>{for(const correct of [true,false]){const h=setup(side);try{h.us.hand=[ref('sm11-2','secret')];trainer(h,'sm11-186');choice(h,a=>a.choiceHandIndex===0);choice(h,a=>a.choiceOption===1);assert.equal(h.s.choiceSide,h.foe);assert.match(h.s.pendingChoice.prompt,/Cutting Wind/);const options=h.s.pendingChoice.options;assert.equal(new Set(options).size,options.length);assert.ok(options.includes('Yanma'));choice(h,a=>options[a.choiceOption]==='Yanma'===correct);resolve(h);assert.equal(h.us.hand.length,correct?1:5);assert.equal(h.them.hand.length,correct?4:0);assert.equal(h.us.hand[0].uid,'secret');}finally{h.done();}}});
 test(side+' Recycle Energy returns from retreat but not a discard from hand',()=>{const h=setup(side,'sm11-2');try{h.us.active.energy={};h.us.active.specialEnergy=[ref('sm11-212','recycle')];use(h,'retreat');resolve(h);assert.ok(h.us.hand.some(r=>r.uid==='recycle'));assert.ok(!h.us.discard.some(r=>r.uid==='recycle'));const previous=h.us.hand.length;h.us.discard.push(h.us.hand.splice(h.us.hand.findIndex(r=>r.uid==='recycle'),1)[0]);fx.applyEffect({type:'draw',amount:1},core.effectContext(h.s,side,{},h.us.active));assert.equal(h.us.hand.length,previous);assert.ok(h.us.discard.some(r=>r.uid==='recycle'));}finally{h.done();}});
 test(side+' U-Turn Board reduces retreat and returns only on discard from play with Tool active',()=>{for(const suppressed of [true,false]){const h=setup(side,'sm11-2');try{const old=core.retreatCost(h.s,side);h.us.active.tool=ref('sm11-211','board');if(suppressed)h.s.stadium={cardId:'sm6-111',uid:'lab',ownerSide:side};assert.equal(core.retreatCost(h.s,side),suppressed?old:Math.max(0,old-1));fx.applyEffect({type:'discardTool',target:'self'},core.effectContext(h.s,side,{},h.us.active));assert.equal(h.us.active.tool,null);assert.equal(h.us.hand.some(r=>r.uid==='board'),!suppressed);assert.equal(h.us.discard.some(r=>r.uid==='board'),suppressed);}finally{h.done();}}});
}
for(const side of ['player','opponent']){
 test(side+' Channeler clears own attack effects including Clear Vision without touching other side or GX usage',()=>{const h=setup(side);try{h.us.sm11GxLocked=true;h.us.gxAttackUsed=true;h.them.sm11GxLocked=true;h.us.sm10MetalWall=true;h.them.sm10MetalWall=true;h.us.active.conditions={poison:true};h.us.active.damage=30;h.us.active.sm11StickyUntil=h.s.turnNumber;h.them.active.sm11StickyUntil=h.s.turnNumber;h.us.active.locks=[{action:'retreat',fromAttack:true},{action:'attack',fromAttack:false}];h.us.active.attackGuard={fromAttack:false};h.us.active.retreatRetaliation={amount:20};h.us.active.sm11AttackEffectKeys=['retreatRetaliation'];h.us.actionLocks=[{cardType:'Item',fromAttack:true},{cardType:'Tool',fromAttack:false}];h.s.modifiers=[{fromAttack:true,scope:'self',targetUid:h.us.active.uid,ownerSide:side},{fromAttack:true,scope:'self',targetUid:h.them.active.uid,ownerSide:h.foe},{fromAttack:false,scope:'self',targetUid:h.us.active.uid,ownerSide:side}];trainer(h,'sm11-190');resolve(h);assert.equal(h.us.sm11GxLocked,undefined);assert.equal(h.us.gxAttackUsed,true);assert.equal(h.them.sm11GxLocked,true);assert.equal(h.us.sm10MetalWall,undefined);assert.equal(h.them.sm10MetalWall,true);assert.equal(h.us.active.sm11StickyUntil,undefined);assert.equal(h.them.active.sm11StickyUntil,h.s.turnNumber);assert.equal(h.us.active.damage,30);assert.equal(h.us.active.conditions.poison,true);assert.equal(h.us.active.locks.length,1);assert.equal(h.us.active.attackGuard.fromAttack,false);assert.equal(h.us.active.retreatRetaliation,undefined);assert.equal(h.us.actionLocks.length,1);assert.equal(h.s.modifiers.length,2);}finally{h.done();}});
 test(side+' Channeler releases real Cryogonal Frozen Lock, retains an unrelated ability lock',()=>{const h=setup(side,'sm11-46');try{h.us.active.energy={Water:1};attack(h,'Frozen Lock');resolve(h);assert.equal(h.s.activeSide,h.foe);assert.ok(h.them.actionLocks.some(l=>l.cardType==='Item'&&l.fromAttack));const a={...h,side:h.foe,foe:side,us:h.them,them:h.us};trainer(a,'sm11-190');resolve(a);assert.ok(!h.them.actionLocks.some(l=>l.cardType==='Item'));}finally{h.done();}});
}
for(const side of ['player','opponent']){
 test(side+' Recycle Energy and U-Turn Board return their original refs on opponent attack KO',()=>{const h=setup(side,'sm11-54');try{h.us.active.energy={Lightning:3};h.them.active={...slot('sm11-2',h.foe+'a'),specialEnergy:[ref('sm11-257','recycle-ko')],tool:ref('sm11-255','board-ko')};attack(h,'Tandem Shock');resolve(h);assert.ok(h.them.hand.some(r=>r.uid==='recycle-ko'));assert.ok(h.them.hand.some(r=>r.uid==='board-ko'));assert.ok(!h.them.discard.some(r=>['recycle-ko','board-ko'].includes(r.uid)));}finally{h.done();}});
 test(side+' Electric Swamp is blocked by Bell of Silence and Heavy Rock',()=>{const h=setup(side);try{h.us.hand=[ref('sm11-66','eel')];h.us.active.energy={Lightning:4};assert.ok(core.legalActions(h.s,side).some(a=>a.type==='sm11ElectricSwamp'));h.us.sm4AbilityPokemonLockUntil=h.s.turnNumber;assert.ok(!core.legalActions(h.s,side).some(a=>a.type==='sm11ElectricSwamp'));delete h.us.sm4AbilityPokemonLockUntil;h.us.sm4HandLockUntil=h.s.turnNumber;assert.ok(!core.legalActions(h.s,side).some(a=>a.type==='sm11ElectricSwamp'));}finally{h.done();}});
}

// v457 independent audit: real historical attacks, source-aware cleanup,
// opponent-side isolation, and older EX attack borrowing.
for(const side of ['player','opponent']){
 test(side+' audit: Channeler removes actual Porygon Conversion 3 weakness and expiry',()=>{
  const h=setup(side,'xy12-71');try{
   h.us.active.energy={Colorless:1};attack(h,'Conversion 3');resolve(h);
   assert.equal(h.s.activeSide,h.foe);assert.equal(h.them.active.weaknessOverride,'Grass');assert.ok(h.them.active.weaknessOverrideExpiresTurn);assert.ok(h.them.active.sm11AttackEffectKeys.includes('weaknessOverride'));
   const receiver={...h,side:h.foe,foe:side,us:h.them,them:h.us};
   h.them.bench[0].weaknessOverride='Water'; // unrelated non-attack effect
   trainer(receiver,'sm11-190');resolve(receiver);
   assert.equal(h.them.active.weaknessOverride,undefined);assert.equal(h.them.active.weaknessOverrideExpiresTurn,undefined);assert.equal(h.them.bench[0].weaknessOverride,'Water');
  }finally{h.done();}
 });
 test(side+' audit: Channeler removes attack-origin Neo Deflector, not unrelated defensive state',()=>{
  const h=setup(side,'neo1-53');try{
   h.us.active.energy={Grass:1};attack(h,'Deflector');resolve(h);assert.ok(h.us.active.neoDeflector);assert.ok(h.us.active.sm11AttackEffectKeys.includes('neoDeflector'));
   // Isolate the effect cleanup while the defensive effect is still present;
   // direct effect resolution avoids advancing past its normal expiry.
   const enemyEffect={expiresTurn:h.s.turnNumber};h.them.active.neoDeflector=enemyEffect;h.us.bench[0].neoDeflector={expiresTurn:h.s.turnNumber};
   fx.applyEffect({type:'sm7Rule',rule:'sm11Channeler'},{state:h.s,side,foeSide:h.foe,attacker:h.us.active,defender:h.them.active,cardById:data.cardById,trainerRef:ref('sm11-190','channeler')});
   assert.equal(h.us.active.neoDeflector,undefined);assert.ok(h.us.bench[0].neoDeflector);assert.equal(h.them.active.neoDeflector,enemyEffect);
  }finally{h.done();}
 });
 test(side+' audit: Channeler clears older Shadow Stitching only on affected side',()=>{
  const h=setup(side);try{
   h.us.xy9ShadowStitchUntil=h.s.turnNumber;h.them.xy9ShadowStitchUntil=h.s.turnNumber;h.s.xy7HexManiacUntil=h.s.turnNumber;
   trainer(h,'sm11-190');resolve(h);assert.equal(h.us.xy9ShadowStitchUntil,undefined);assert.equal(h.them.xy9ShadowStitchUntil,h.s.turnNumber);assert.equal(h.s.xy7HexManiacUntil,h.s.turnNumber);
  }finally{h.done();}
 });
 test(side+' audit: Perfection copies actual historical EX attacks, not opposing or Tool attacks',()=>{
  const h=setup(side,'sm11-71');try{
   h.us.active.energy={Psychic:5,Colorless:3};h.us.bench[0].cardId='bw4-54';h.us.bench[0].tool=ref('sm11-203','z');h.us.discard=[ref('sm11-195','discard-z'),ref('sm11-47','gx')];h.them.discard=[ref('bw4-5','enemy-ex')];
   const options=core.attackOptions(h.s,side);assert.ok(options.some(a=>a.cardId==='bw4-54'&&a.attack.name==='X Ball'));assert.ok(!options.some(a=>['sm11-195','sm11-203','bw4-5'].includes(a.cardId)));
   h.s.stadium={cardId:'sm10-183',uid:'power-plant',ownerSide:side};assert.ok(!core.attackOptions(h.s,side).some(a=>a.cardId==='bw4-54'));
  }finally{h.done();}
 });
}
for(const side of ['player','opponent']){
 test(side+' audit: Enhanced Hammer returns opponent Recycle Energy exactly once',()=>{
  const h=setup(side);try{
   h.them.active.specialEnergy=[ref('sm11-257','energy-hammer')];const basic=structuredClone(h.them.active.energy);h.us.hand=[ref('sm2-124','hammer')];const options=core.legalActions(h.s,side).filter(a=>a.type==='trainer'&&a.cardId==='sm2-124');assert.ok(options.length);assert.ok(options.every(a=>!a.effectEnergyType&&a.effectSpecialEnergyUid==='energy-hammer'));use(h,'trainer',a=>a.cardId==='sm2-124');resolve(h);assert.deepEqual(h.them.active.energy,basic);
   assert.equal(h.them.active.specialEnergy.length,0);assert.equal(h.them.hand.filter(r=>r.uid==='energy-hammer').length,1);assert.ok(!h.them.discard.some(r=>r.uid==='energy-hammer'));assert.ok(!h.us.hand.some(r=>r.uid==='energy-hammer'));
  }finally{h.done();}
 });
 test(side+' audit: Field Blower respects U-Turn Board suppression at the discard choice',()=>{
  for(const stadiumFirst of [false,true]){const h=setup(side);try{
   h.them.active.tool=ref('sm11-255','board-blower');h.s.stadium={cardId:'sm6-111',uid:'lab',ownerSide:side};trainer(h,'sm2-125');
   choice(h,a=>a.choiceOption===(stadiumFirst?0:1));resolve(h,a=>a.choiceOption===0);
   assert.equal(h.them.active.tool,null);assert.equal(h.s.stadium,null);assert.equal(h.them.hand.filter(r=>r.uid==='board-blower').length,stadiumFirst?1:0);assert.equal(h.them.discard.filter(r=>r.uid==='board-blower').length,stadiumFirst?0:1);
  }finally{h.done();}}
 });
 test(side+' audit: Faba sends Recycle Energy and U-Turn Board to Lost Zone without returning',()=>{
  for(const isEnergy of [false,true]){const h=setup(side);try{
   if(isEnergy)h.them.active.specialEnergy=[ref('sm11-212','lost-attachment')];else h.them.active.tool=ref('sm11-211','lost-attachment');
   trainer(h,'sm8-173');resolve(h);assert.equal(h.them.lostZone.filter(r=>r.uid==='lost-attachment').length,1);assert.ok(!h.them.hand.some(r=>r.uid==='lost-attachment'));assert.ok(!h.them.discard.some(r=>r.uid==='lost-attachment'));
  }finally{h.done();}}
 });
}
for(const side of ['player','opponent']){
 test(side+' audit: Enhanced Hammer is unavailable against Basic Energy only and cannot discard it',()=>{
  const h=setup(side);try{
   h.us.hand=[ref('sm2-124','hammer')];assert.ok(!core.legalActions(h.s,side).some(a=>a.type==='trainer'&&a.cardId==='sm2-124'));
   const before=structuredClone(h.them.active.energy);fx.applyEffect({type:'discardEnergyCard',target:'opponentActive',amount:1,specialOnly:true},{...core.effectContext(h.s,side,{effectEnergyType:'Grass'},h.us.active),trainerRef:ref('sm2-124','hammer')});assert.deepEqual(h.them.active.energy,before);
  }finally{h.done();}
 });
}
for(const side of ['player','opponent']){
 test(side+' audit: historical Mach Cut still attacks when no Special Energy is attached',()=>{
  const h=setup(side,'bw6-90');try{
   h.us.active.energy={Fighting:2,Water:2,Colorless:2};const basic=structuredClone(h.them.active.energy);attack(h,'Mach Cut');resolve(h);
   assert.ok(h.them.active.damage>0);assert.deepEqual(h.them.active.energy,basic);
  }finally{h.done();}
 });
}
