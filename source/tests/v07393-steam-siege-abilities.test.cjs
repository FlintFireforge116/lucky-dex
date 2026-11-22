'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');
const xy=require('../app/src/main/assets/tcg-classic-steam-siege.js');
const contract=require('../scripts/xy11_release_contract.json');
const source=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/classic/xy11-print-compact.json'),'utf8'));
const slot=(cardId,uid,benchSlot=0)=>({cardId,uid,benchSlot,stack:[cardId],energy:{},specialEnergy:[],conditions:{},locks:[],damage:0});
const side=active=>({active,bench:[],hand:[],deck:[],discard:[],energySupply:[],energyDiscard:{},prizes:[]});
const state=()=>({format:'classic',turnNumber:8,firstSide:'player',activeSide:'player',sides:{player:side(slot('xy11-26','a')),opponent:side(slot('xy11-1','d'))},modifiers:[],log:[]});
const cardById=id=>xy.cardById(id);
const ctx=(s,extra={})=>({state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById,isAttack:true,random:()=>0.2,...extra});
const a=(n,name)=>{const c=xy.cardById('xy11-'+n);assert.ok(c?.battleEnabled,`Card ${n} gated`);return c.attacks.find(a=>a.name===name);};
const ability=(n,name)=>{const c=xy.cardById('xy11-'+n);assert.ok(c?.battleEnabled,`Ability card ${n} gated`);return c.abilities.find(ab=>ab.name===name)?.effect;};

test('Steam Siege Stage 3: 116 verified playable prints, all 116 prints and exact printed costs',()=>{
 assert.equal(contract.release,'0.69.395');assert.equal(contract.stage,'independent-audit');
 assert.equal(source.length,116);assert.equal(xy.CARDS.length,116);
 assert.equal(xy.CARDS.filter(x=>x.battleEnabled).length,116);
 for(const row of source){const c=xy.cardById('xy11-'+row[0]);assert.equal(c.name,row[1]);
  assert.deepEqual((c.attacks||[]).map(x=>Array.isArray(x.cost)?x.cost.join(''):String(x.cost||'')),row[7].map(a=>a[1].join('')));
  if(c.battleEnabled){for(const atk of c.attacks||[])assert.deepEqual(effects.validateEffect(atk.effect),[],c.id+'/'+atk.name);
   for(const power of c.abilities||[])assert.deepEqual(effects.validateEffect(power.effect),[],c.id+'/'+power.name);}}
 for(const n of contract.requiredEnabledNumbers)assert.ok(xy.cardById('xy11-'+n)?.battleEnabled,n);
 for(let n=1;n<=116;n++)assert.equal(xy.cardById('xy11-'+n)?.battleEnabled,true,'completed card '+n);
});
test('Yanmega Sonic Vision requires exactly four hand cards and unsuppressed Ability',()=>{
 const s=state(),p=s.sides.player;p.active=slot('xy11-7','yan');const attack=a('7','Assault Boom');
 p.hand=[1,2,3,4].map(i=>({uid:String(i),cardId:'xy11-1'}));assert.equal(effects.attackCostOverride(s,'player',p.active,attack,cardById),'');
 p.hand.pop();assert.notEqual(effects.attackCostOverride(s,'player',p.active,attack,cardById),'');
 p.hand.push({uid:'4',cardId:'xy11-1'});s.xy7HexManiacUntil=8;assert.notEqual(effects.attackCostOverride(s,'player',p.active,attack,cardById),'');
});
test('Steam Up discards Fire from hand, stacks +30 for Basic Fire this turn only, not from Energy Zone',()=>{
 const s=state(),me=s.sides.player,active=me.active;
 me.hand=[{uid:'fire1',cardId:'basic-fire'},{uid:'fire2',cardId:'basic-fire'}];me.energySupply=['Fire'];
 const lookup=id=>id==='basic-fire'?{id,kind:'energy',basicEnergy:true,subtype:'Fire'}:xy.cardById(id);
 const e=ability('26','Steam Up');const q=ctx(s,{cardById:lookup,isAttack:false});
 effects.applyEffect(e,q);assert.equal(me.hand.length,1);assert.equal(me.discard.length,1);
 assert.equal(me.energySupply.length,1);assert.equal(effects.modifierAmount(s,'player',active,'attackDamage',lookup),30);
 effects.applyEffect(e,q);assert.equal(effects.modifierAmount(s,'player',active,'attackDamage',lookup),60);
 me.active=slot('xy11-17','rapid');assert.equal(effects.modifierAmount(s,'player',me.active,'attackDamage',lookup),0,'Stage 1 Fire does not benefit');
 me.active=active;s.turnNumber++;assert.equal(effects.modifierAmount(s,'player',active,'attackDamage',lookup),0);
 effects.applyEffect(e,ctx(s,{cardById:lookup,isAttack:false}));assert.equal(me.energySupply.length,1);assert.equal(me.discard.length,2,'two hand cards used, never virtual supply');
});
test('Foongus Play Ball only triggers from hand and selects physical discarded Poké Balls',()=>{
 const s=state(),me=s.sides.player,dis={id:'test-pokeball',name:'Poké Ball',kind:'trainer'};
 me.active=slot('xy11-12','foongus');me.discard=[{uid:'p1',cardId:'pb'},{uid:'p2',cardId:'pb'}];
 let choice;const q=ctx(s,{isAttack:false,cardById:id=>id==='pb'?dis:xy.cardById(id),requestChoice:x=>choice=x,eventData:{fromHand:true}});
 effects.applyEffect(ability('12','Play Ball'),q);assert.equal(choice?.kind,'discardCard');
 effects.applyEffect(choice.effect,{...q,eventData:{},resolvingChoice:true,action:{choiceDiscardIndex:0}});
 assert.deepEqual(me.hand.map(x=>x.uid),['p1']);assert.equal(choice.picked,undefined);
 effects.applyEffect(choice.effect,{...q,eventData:{},resolvingChoice:true,action:{choiceDiscardIndex:0}});
 assert.equal(me.hand.length,2);assert.equal(me.discard.length,0);
});
test('Pyroar Flame Charge pulls Fire from available deck Energy source; Incinerate removes all defender Tools BEFORE damage',()=>{
 const s=state(),p=s.sides.player;p.active=slot('xy11-23','pyro');p.energySupply=['Fire'];
 effects.applyEffect(a('23','Flame Charge').effect,ctx(s));assert.equal(p.active.energy.Fire,1);assert.equal(p.energySupply.length,0);
 const foe=s.sides.opponent,def=foe.active;def.tool={uid:'t1',cardId:'xy11-101'};def.extraTools=[{uid:'t2',cardId:'xy11-106'}];
 assert.equal(effects.resolveAttack(a('23','Incinerate'),ctx(s)).damage,90);
 assert.equal(def.tool,null);assert.equal(def.extraTools.length,0);assert.deepEqual(foe.discard.map(x=>x.uid),['t1','t2']);
});
test('Gastrodon Sticky Shot increases both opponent attack and retreat costs for the affected turn',()=>{
 const s=state(),target=s.sides.opponent.active;
 effects.applyEffect(a('29','Sticky Shot').effect,ctx(s));
 assert.equal(effects.modifierAmount(s,'opponent',target,'attackCost',cardById),1);
 assert.equal(effects.modifierAmount(s,'opponent',target,'retreatCost',cardById),1);
 s.turnNumber+=2;assert.equal(effects.modifierAmount(s,'opponent',target,'attackCost',cardById),0);
});
test('Mega Boost attaches a selected physical Special Energy to chosen Mega Evolution',()=>{
 const s=state(),ss=s.sides.player;ss.active=slot('xy11-34','claw');ss.bench=[slot('xy11-68','mega',0)];
 ss.hand=[{uid:'special',cardId:'special'},{uid:'basic',cardId:'basic'}];
 const lookup=id=>id==='special'?{id,specialEnergy:true,kind:'energy',effect:{type:'specialEnergy',provides:{Metal:1}}}:xy.cardById(id);
 let choice;const q=ctx(s,{isAttack:false,cardById:lookup,requestChoice:ch=>choice=ch});
 effects.applyEffect(ability('34','Mega Boost'),q);assert.equal(choice.kind,'handCard');
 effects.applyEffect(choice.effect,{...q,resolvingChoice:true,action:{choiceHandIndex:0}});assert.equal(choice.kind,'pokemon');
 effects.applyEffect(choice.effect,{...q,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});
 assert.deepEqual(ss.bench[0].specialEnergy.map(x=>x.uid),['special']);assert.deepEqual(ss.hand.map(x=>x.uid),['basic']);
});
test('Avalugg Melting Floe mills opponent three per discarded physical Water Energy, not the Energy Zone',()=>{
 const s=state(),p=s.sides.player,foe=s.sides.opponent;
 p.deck=[{uid:'w1',cardId:'water'},{uid:'x',cardId:'xy11-1'},{uid:'w2',cardId:'water'},{uid:'remain',cardId:'xy11-3'}];
 p.energySupply=['Water','Water'];foe.deck=Array.from({length:8},(_,i)=>({uid:'z'+i,cardId:'xy11-3'}));
 const lookup=id=>id==='water'?{id,kind:'energy',basicEnergy:true,subtype:'Water'}:xy.cardById(id);
 effects.applyEffect(a('37','Melting Floe').effect,ctx(s,{cardById:lookup}));
 assert.deepEqual(p.discard.map(x=>x.uid),['w1','x','w2']);assert.equal(foe.discard.length,6);
 assert.equal(foe.deck.length,2);assert.equal(p.energySupply.length,2);
});
test('Ampharos Shocking Light targets an opponent EX and places counters without attacking',()=>{
 const s=state(),foe=s.sides.opponent;foe.bench=[slot('xy11-26','ex',0)];
 let choice;const q=ctx(s,{isAttack:false,requestChoice:ch=>choice=ch});
 effects.applyEffect(ability('40','Shocking Light'),q);assert.equal(choice.kind,'pokemon');
 effects.applyEffect(choice.effect,{...q,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});
 assert.equal(foe.bench[0].damage,30);assert.equal(foe.active.damage,0);
});
test('Chandelure Sinister Selection uses exactly top two physical cards, chosen to hand, other to discard',()=>{
 const s=state(),me=s.sides.player;me.deck=[{uid:'a',cardId:'xy11-1'},{uid:'b',cardId:'xy11-2'},{uid:'c',cardId:'xy11-3'}];
 let choice;const q=ctx(s,{isAttack:false,requestChoice:ch=>choice=ch});effects.applyEffect(ability('50','Sinister Selection'),q);
 assert.equal(choice.kind,'deckCard');effects.applyEffect(choice.effect,{...q,resolvingChoice:true,action:{choiceDeckIndex:1}});
 assert.deepEqual(me.hand.map(x=>x.uid),['b']);assert.deepEqual(me.discard.map(x=>x.uid),['a']);assert.deepEqual(me.deck.map(x=>x.uid),['c']);
});
test('Croagunk Poison Up stacks 30 additional Poison damage only on a Poisoned defender',()=>{
 const s=state(),def=s.sides.opponent.active;
 effects.applyEffect(a('58','Poison Up').effect,ctx(s));assert.equal(def.conditions.poison,undefined);
 def.conditions.poison={amount:10};effects.applyEffect(a('58','Poison Up').effect,ctx(s));assert.equal(def.conditions.poison.amount,40);
 effects.applyEffect(a('58','Poison Up').effect,ctx(s));assert.equal(def.conditions.poison.amount,70);
});
test('Toxicroak Poison Enzyme blocks damage only while opponent attacker is Poisoned and Ability unsuppressed',()=>{
 const s=state(),me=s.sides.player,foe=s.sides.opponent;me.active=slot('xy11-59','toxi');foe.active.conditions.poison={amount:10};
 assert.equal(effects.attackIsPrevented(s,'player',me.active,foe.active,cardById).reason,'Poison Enzyme');
 s.xy7HexManiacUntil=8;assert.equal(!!effects.attackIsPrevented(s,'player',me.active,foe.active,cardById),false);
});
test('Weavile Tear Away returns the selected attached Tool card to hand, repeatably',()=>{
 const s=state(),me=s.sides.player;me.active=slot('xy11-61','weav');me.active.tool={uid:'tool',cardId:'xy11-101'};
 let choice;const q=ctx(s,{isAttack:false,requestChoice:ch=>choice=ch});effects.applyEffect(ability('61','Tear Away'),q);
 assert.equal(choice.kind,'pokemon');effects.applyEffect(choice.effect,{...q,resolvingChoice:true,action:{choiceTarget:'active'}});
 assert.equal(me.active.tool,null);assert.deepEqual(me.hand.map(x=>x.uid),['tool']);
});
test('M Gardevoir-EX Despair Ray is optional and discards full physical Bench attachments for +10 each',()=>{
 const s=state(),me=s.sides.player;me.active=slot('xy11-79','megag');
 const p=slot('xy11-18','baby',0);p.energy={Fire:2};p.specialEnergy=[{uid:'special',cardId:'xy1-140'}];p.tool={uid:'tool',cardId:'xy11-101'};
 me.bench=[p,slot('xy11-1','other',1)];
 const base=effects.resolveAttack(a('79','Despair Ray'),ctx(s));assert.equal(base.damage,110);assert.equal(me.bench.length,2);
 const action={effectSelection:'baby,other'};
 const result=effects.resolveAttack(a('79','Despair Ray'),ctx(s,{action}));assert.equal(result.damage,130);
 assert.equal(me.bench.length,0);assert.equal(me.energyDiscard.Fire,2);
 assert.ok(me.discard.some(r=>r.uid==='special'));assert.ok(me.discard.some(r=>r.uid==='tool'));
 assert.equal(effects.resolveAttack(a('112','Despair Ray'),ctx(s)).damage,110,'identical alternate art rules');
});
test('Hawlucha Sudden Cyclone is optional and only triggers on hand-to-Bench play',()=>{
 const s=state(),foe=s.sides.opponent;foe.bench=[slot('xy11-3','other',0)];let choice;
 const q=ctx(s,{isAttack:false,eventData:{fromHand:true},requestChoice:c=>choice=c});
 effects.applyEffect(ability('97','Sudden Cyclone'),q);assert.equal(choice.kind,'option');
 effects.applyEffect(choice.effect,{...q,resolvingChoice:true,action:{choiceOption:1}});assert.equal(foe.active.uid,'d');
 choice=null;effects.applyEffect(ability('97','Sudden Cyclone'),{...q,eventData:{fromDeck:true}});assert.equal(choice,null);
});
