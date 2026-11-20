'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),asset=path.join(root,'app/src/main/assets');
const fx=require(path.join(asset,'tcgp-battle-effects.js'));
const core=require(path.join(asset,'tcgp-battle-core.js'));
const data=require(path.join(asset,'tcg-classic-battle-data.js'));
const set=require(path.join(asset,'tcg-classic-flashfire.js'));
const hasSource=fs.existsSync(path.join(root,'data/classic/xy2-print-compact.json'));
const R=k=>({type:'neoRule',rule:'xy2:'+k});
const ref=(cardId,uid=cardId)=>({cardId,uid});
const mon=(cardId,uid=cardId)=>({uid,cardId,stack:[cardId],energy:{},specialEnergy:[],tool:null,extraTools:[],conditions:{},damage:0,locks:[],playedOnSideTurn:0});
const side=()=>({active:mon('base1-4'),bench:[],hand:[],deck:[],discard:[],energyDiscard:{},energyTypes:['Grass','Fire','Fairy'],handLimit:8,benchLimit:3,turnCount:3,prizes:[ref('base1-4')],prizesTaken:0});
const scene=()=>({format:'classic',phase:'battle',activeSide:'player',turnNumber:9,sides:{player:side(),opponent:side()},log:[],rngState:1});
function effect(s,rule,extra={}){const choices=[];const ctx={state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:id=>data.cardById(id),isAttack:true,action:{},random:()=>.2,requestChoice:q=>choices.push(q),...extra};fx.applyEffect(rule,ctx);return choices[0];}

// These are tested even when the official print source has not yet been
// generated.  GitHub's APK gate additionally exercises the real catalogue.
test('Flashfire audit: Harden blocks only <=60 attack damage through the next opposing turn',()=>{
 const s=scene(),a=s.sides.player.active,d=s.sides.opponent.active;
 a.cardId='xy2-2';d.cardId='xy2-2';
 effect(s,R('harden'));
 assert.equal(a.xy2HardenUntil,10);
 s.turnNumber=10;
 assert.equal(fx.attackDamageWithState(s,'opponent',d,'player',a,50,id=>data.cardById(id)),0);
 assert.equal(fx.attackDamageWithState(s,'opponent',d,'player',a,80,id=>data.cardById(id)),80);
 s.turnNumber=12;
 assert.equal(fx.attackDamageWithState(s,'opponent',d,'player',a,50,id=>data.cardById(id)),50);
});

test('Flashfire audit: Helioptile Destructive Beam removes a real opposing Energy unit',()=>{
 const s=scene(),d=s.sides.opponent.active;d.energy.Fire=1;
 effect(s,R('opponentDiscardEnergy'));
 assert.equal(d.energy.Fire,0);
 assert.equal(s.sides.opponent.energyDiscard.Fire,1);
});

test('Flashfire audit: Chip Off discards distinct random physical references down to four',()=>{
 const s=scene(),foe=s.sides.opponent;foe.hand=Array.from({length:7},(_,i)=>ref('base1-4','hand-'+i));
 effect(s,R('chipOff'));
 assert.equal(foe.hand.length,4);assert.equal(foe.discard.length,3);
 assert.equal(new Set([...foe.hand,...foe.discard].map(r=>r.uid)).size,7);
 assert.equal(foe.deck.length,0);
});

test('Flashfire audit: Protection Cube prevents own-attack recoil only, and keeps physical Tool',()=>{
 const s=scene(),p=s.sides.player.active;p.tool=ref('xy2-95','protection-cube-uid');
 effect(s,{type:'selfDamage',amount:50});assert.equal(p.damage,0);
 assert.equal(p.tool.uid,'protection-cube-uid');
 effect(s,{type:'selfDamage',amount:50},{isAttack:false});assert.equal(p.damage,50);
 p.tool=null;effect(s,{type:'selfDamage',amount:50});assert.equal(p.damage,100);
});

test('Flashfire audit: Thorn Tempest triggers only on actual hand evolution and affects all opposing slots',()=>{
 const s=scene(),foe=s.sides.opponent;foe.bench=[mon('base1-4','bench-b')];
 const absent=effect(s,R('thornTempest'),{isAttack:false,isAbility:true,eventData:{fromDeck:true}});
 assert.equal(absent,undefined);assert.equal(foe.active.damage,0);
 let q=effect(s,R('thornTempest'),{isAttack:false,isAbility:true,eventData:{fromHand:true}});
 assert.equal(q.kind,'option');assert.equal(q.options.length,2);
 effect(s,q.effect,{resolvingChoice:true,action:{choiceOption:0},isAttack:false});
 assert.equal(foe.active.damage,0);assert.equal(foe.bench[0].damage,0);
 q=effect(s,R('thornTempest'),{isAttack:false,isAbility:true,eventData:{fromHand:true}});
 effect(s,q.effect,{resolvingChoice:true,action:{choiceOption:1},isAttack:false});
 assert.equal(foe.active.damage,10);assert.equal(foe.bench[0].damage,10);
});

test('Flashfire audit: Exciting Shake applies six Prickly Needles coins next owner turn only',()=>{
 const s=scene(),a=s.sides.player.active;a.cardId='xy2-10';
 const context=()=>({state:s,side:'player',foeSide:'opponent',attacker:a,defender:s.sides.opponent.active,
   cardById:id=>data.cardById(id),isAttack:true,random:()=>.2,effectiveEnergy:()=>({}),action:{}});
 const attack={name:'Prickly Needles',damage:0,effect:R('pricklyNeedles')};
 assert.equal(fx.resolveAttack(attack,context()).damage,40);
 effect(s,R('excitingShake'));
 assert.equal(fx.resolveAttack(attack,context()).damage,40,'not six on current turn');
 s.turnNumber+=2;
 assert.equal(fx.resolveAttack(attack,context()).damage,120);
 s.turnNumber+=2;
 assert.equal(fx.resolveAttack(attack,context()).damage,40,'bonus expires afterward');
 const flips=s.log.filter(x=>x.reason==='Prickly Needles');
 assert.deepEqual(flips.map(x=>x.results.length),[2,2,6,2]);
});

test('Flashfire audit: original 110 prints survive with nine previously gated mechanics verified',{skip:!hasSource},()=>{
 const rows=JSON.parse(fs.readFileSync(path.join(root,'data/classic/xy2-print-compact.json'),'utf8'));
 assert.equal(rows.length,110);assert.equal(set.CARDS.length,110);
 assert.equal(rows.reduce((n,r)=>n+r[7].length,0),153);
 assert.equal(rows.reduce((n,r)=>n+r[8].length,0),13);
 for(const n of ['1','2','10','36','60','61','64','71','80','95']){
   const c=set.cardById('xy2-'+n);assert.ok(c,'missing '+n);
   assert.ok(c.battleEnabled,`card ${n} is not battle-ready: ${c.support?.reasons}`);
   assert.ok(c.deckEligible,'card '+n+' not deck eligible');
   for(const ab of c.abilities||[])assert.deepEqual(fx.validateEffect(ab.effect),[],c.id+':'+ab.name);
 }
});

test('Flashfire audit: Adaptive Evolution chains Caterpie to Metapod to Butterfree on first turn',{skip:!hasSource},()=>{
 const s=scene(),p=s.sides.player;p.turnCount=1;p.active=mon('xy2-1','caterpie');p.active.playedOnSideTurn=1;
 p.hand=[ref('xy2-2','metapod'),ref('xy2-3','butterfree')];
 const evolve1=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='xy2-2');
 assert.ok(evolve1,'Caterpie Adaptive Evolution does not allow first turn');
 core.applyAction(s,'player',evolve1);
 assert.equal(p.active.cardId,'xy2-2');
 const evolve2=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='xy2-3');
 assert.ok(evolve2,'Metapod Adaptive Evolution does not permit same-turn Stage 2');
 core.applyAction(s,'player',evolve2);
 assert.deepEqual(p.active.stack,['xy2-1','xy2-2','xy2-3']);
});

test('Flashfire audit: Flower Veil adds 20 maximum HP per allied Floette, not to the opponent',{skip:!hasSource},()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.active=mon('xy2-1','grass-ours');o.active=mon('xy2-1','grass-theirs');
 const before=core.maxHp(s,'player',p.active),other=core.maxHp(s,'opponent',o.active);
 p.bench=[mon('xy2-64','floette-a')];
 assert.equal(core.maxHp(s,'player',p.active),before+20);
 assert.equal(core.maxHp(s,'opponent',o.active),other);
 p.bench.push(mon('xy2-64','floette-b'));
 assert.equal(core.maxHp(s,'player',p.active),before+40);
 p.bench=[];assert.equal(core.maxHp(s,'player',p.active),before);
});

test('Flashfire audit: Poison Barrier blocks retreat only while opposing Dragalge is present',{skip:!hasSource},()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.active=mon('xy2-8','poisoned');p.active.energy.Grass=5;
 p.bench=[{...mon('xy2-4','escape'),benchSlot:0}];
 p.active.conditions.poison={amount:10};
 const before=core.legalActions(s,'player').filter(a=>a.type==='retreat');assert.ok(before.length);
 o.bench=[mon('xy2-71','dragalge')];
 assert.equal(core.legalActions(s,'player').filter(a=>a.type==='retreat').length,0);
 p.active.conditions={};
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='retreat'));
});

test('Flashfire audit: Stir and Snooze uses two coin flips to wake at checkup',{skip:!hasSource},()=>{
 const s=scene();s.sides.player.active=mon('xy2-80','sleepy-snorlax');s.sides.player.active.conditions.sleep={};
 core.checkup(s);
 assert.ok(s.log.some(x=>x.type==='sleepCheck'&&x.side==='player'&&x.coins===2));
 assert.equal(s.log.filter(x=>x.status==='sleep'&&x.side==='player'&&x.type==='coin').length,2);
});

test('Flashfire audit: Thorn Tempest triggers during real hand evolution, before knockout processing',{skip:!hasSource},()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.active=mon('xy2-4','pineco');p.active.playedOnSideTurn=1;p.turnCount=3;
 p.hand=[ref('xy2-60','forretress')];o.active.damage=0;
 const move=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='xy2-60');
 assert.ok(move,'Forretress evolution not offered');
 core.applyAction(s,'player',move);
 assert.equal(p.active.cardId,'xy2-60');
 assert.equal(s.phase,'effectChoice','Thorn Tempest must be optional');
 assert.equal(o.active.damage,0,'no damage before player opts in');
 const choice=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceOption===1);
 assert.ok(choice,'the player can use Thorn Tempest');
 core.applyAction(s,'player',choice);
 assert.equal(o.active.damage,10);
});
