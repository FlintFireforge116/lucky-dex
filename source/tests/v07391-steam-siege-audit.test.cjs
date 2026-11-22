'use strict';
// Steam Siege v0.69.391 independent audit: exact reuse and anti-placeholder regression.
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');
const xy=require('../app/src/main/assets/tcg-classic-steam-siege.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const contract=require('../scripts/xy11_release_contract.json');
const at=(id='test-actor',uid='A')=>({cardId:id,uid,energy:{},conditions:{},damage:0,locks:[],specialEnergy:[],stack:[]});
const side=(active)=>({active,bench:[],hand:[],deck:[],discard:[],prizes:[],energySupply:[],energyDiscard:{}});
const scene=()=>({format:'classic',sides:{player:side(at('test-actor')),opponent:side(at('test-foe','B'))},turnNumber:8,log:[],modifiers:[]});
function sourceMappings(){
 const py=String.raw`import json,sys;sys.path.insert(0,sys.argv[1]);import xy11_verified as v
pairs=[('13','Strange Reaction'),('16','Returning Flames'),('52','Focus Energy'),('53','Spirited Throw'),('90','Fiddle Around')]
assert all(p not in v.STRICT for p in pairs)
assert ('20','Flare Up') not in v.STRICT and v.ATK[('20','Flare Up')]['rule']=='flareUp' and ('79','Despair Ray') not in v.STRICT
print(json.dumps({n+'|'+name:v.ATK[n,name] for n,name in pairs}))`;
 const r=spawnSync('python3',['-c',py,path.join(root,'scripts')],{encoding:'utf8'});
 assert.equal(r.status,0,r.stderr);
 return JSON.parse(r.stdout);
}
const mapped=sourceMappings();
const compactEnergyCost=cost=>Array.isArray(cost)?cost.join(''):String(cost??'');
test('Classic registry normalises attack Energy cost arrays to exact compact strings',()=>{
 const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
 const card=classic.cardById('xy10-1');
 assert.ok(card?.attacks?.length,'Known prior set attack is available');
 assert.equal(typeof card.attacks[0].cost,'string','Classic registry should normalise source arrays');
 assert.deepEqual([['C'],['G','C'],['F','F','C']].map(compactEnergyCost),['C','GC','FFC']);
 assert.deepEqual(['C','GC','FFC'].map(compactEnergyCost),['C','GC','FFC']);
});
test('Steam Siege audit mapping is exact, validated, and five print-specific gates are cleared',()=>{
 assert.deepEqual(Object.keys(mapped).sort(),['13|Strange Reaction','16|Returning Flames','52|Focus Energy','53|Spirited Throw','90|Fiddle Around'].sort());
 for(const [name,e] of Object.entries(mapped))assert.deepEqual(effects.validateEffect(e),[],name);
 assert.equal(mapped['16|Returning Flames'].type,'searchChosen');
 assert.equal(mapped['16|Returning Flames'].source,'discard');
 assert.deepEqual(mapped['16|Returning Flames'].filter,{kind:'energy',basicEnergy:true,subtype:'Fire'});
 assert.equal(mapped['52|Focus Energy'].attackName,'Flop');
 assert.equal(mapped['52|Focus Energy'].amount,40);
 assert.deepEqual(mapped['53|Spirited Throw'].condition,{type:'opponentHpGreater'});
 assert.equal(mapped['90|Fiddle Around'].deckSide,'opponent');
 assert.equal(mapped['90|Fiddle Around'].count,3);
 assert.deepEqual(mapped['13|Strange Reaction'].condition,{type:'opponentStatus',status:'confusion'});
 assert.ok(contract.expectedPlayableMinimum>=76);
 for(const id of ['13','16','52','53','90'])assert.ok(contract.requiredEnabledNumbers.includes(id));
});
test('Ponyta Returning Flames selects a real discard Fire Energy, not unused Energy Zone supply',()=>{
 const s=scene(),me=s.sides.player,fire={id:'test-fire',kind:'energy',basicEnergy:true,subtype:'Fire',types:['Fire']};
 const source={cardId:'test-fire',uid:'discard-fire'};
 me.discard=[source];me.energySupply=['Fire','Fire'];
 const choices=[],lookup=id=>id==='test-fire'?fire:undefined;
 const ctx={state:s,side:'player',foeSide:'opponent',attacker:me.active,defender:s.sides.opponent.active,cardById:lookup,requestChoice:c=>choices.push(c)};
 effects.applyEffect(mapped['16|Returning Flames'],ctx);
 assert.equal(choices.at(-1)?.kind,'discardCard');
 assert.equal(me.hand.length,0);
 effects.applyEffect(choices.at(-1).effect,{...ctx,resolvingChoice:true,action:{choiceDiscardIndex:0}});
 assert.deepEqual(me.hand.map(x=>x.uid),['discard-fire']);
 assert.deepEqual(me.energySupply,['Fire','Fire'],'fresh zone not consumed or converted');
 assert.equal(me.discard.length,0);
});
test('Mankey Focus Energy boosts only next-own-turn Flop by 40, never this turn',()=>{
 const s=scene(),p=s.sides.player.active;
 const ctx={state:s,side:'player',foeSide:'opponent',attacker:p,defender:s.sides.opponent.active,cardById:()=>({})};
 effects.applyEffect(mapped['52|Focus Energy'],ctx);
 assert.deepEqual(p.nextAttackBonuses.map(x=>[x.turn,x.attackName,x.amount]),[[10,'Flop',40]]);
});
test('Primeape Spirited Throw checks remaining, not printed maximum, HP before the hit',()=>{
 const s=scene(),p=s.sides.player.active,d=s.sides.opponent.active;
 const cards={'test-actor':{id:'test-actor',hp:70},'test-foe':{id:'test-foe',hp:100}};
 const ctx={state:s,side:'player',foeSide:'opponent',attacker:p,defender:d,cardById:id=>cards[id],random:()=>0.4};
 const attack={name:'Spirited Throw',damage:30,cost:['F','F'],effect:mapped['53|Spirited Throw']};
 assert.equal(effects.resolveAttack(attack,ctx).damage,90);
 d.damage=45;assert.equal(effects.resolveAttack(attack,ctx).damage,30,'opponent remaining HP 55 is lower than Primeape 70');
 p.damage=40;assert.equal(effects.resolveAttack(attack,ctx).damage,90,'Primeape remaining HP 30 is now smaller');
});
test('Amoonguss Strange Reaction cannot paralyze without Confusion first',()=>{
 const s=scene(),d=s.sides.opponent.active;
 const ctx={state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:d,cardById:()=>({}),isAttack:true};
 effects.applyEffect(mapped['13|Strange Reaction'],ctx);
 assert.equal(d.conditions.paralysis,undefined);
 d.conditions.confusion=true;effects.applyEffect(mapped['13|Strange Reaction'],ctx);
 assert.ok(d.conditions.paralysis,'Confused defender should now become Paralyzed');
});
test('Aipom Fiddle Around offers actual choice of opponent top-three order',()=>{
 const s=scene(),deck=s.sides.opponent.deck;
 deck.push({uid:'A',cardId:'a'},{uid:'B',cardId:'b'},{uid:'C',cardId:'c'},{uid:'D',cardId:'d'});
 let choice=null,ctx={state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:()=>({}),requestChoice:c=>{choice=c}};
 effects.applyEffect(mapped['90|Fiddle Around'],ctx);
 assert.equal(choice?.kind,'topDeckCard');
 for(const index of [2,0,1]){
  const current=choice;choice=null;
  effects.applyEffect(current.effect,{...ctx,resolvingChoice:true,action:{choiceDeckIndex:index}});
 }
 assert.deepEqual(deck.map(r=>r.uid),['C','A','B','D']);
});
test('Stage 1 incomplete mechanics remain explicitly gated; all previously ready descriptors validate',()=>{
 const p=String.raw`import sys,json;sys.path.insert(0,sys.argv[1]);import xy11_verified as v
print(json.dumps({'attacks':{n+'|'+a:e for (n,a),e in v.ATK.items() if (n,a) not in v.STRICT},'trainers':{n:e for n,(_,e) in v.TRAINERS.items()},'abilities':{a:impl for a,impl in v.ABILITIES.items() if a not in v.UNVERIFIED_ABILITIES},'gates':sorted(v.STRICT),'unsupported':sorted(v.UNVERIFIED_ABILITIES)}))`;
 const r=spawnSync('python3',['-c',p,path.join(root,'scripts')],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);
 const out=JSON.parse(r.stdout);
 for(const [label,group] of Object.entries({attacks:out.attacks,trainers:out.trainers,abilities:out.abilities}))for(const [name,e] of Object.entries(group)){
  assert.deepEqual(effects.validateEffect(label==='abilities'?e.effect:e),[],label+':'+name);
 }
 for(const card of ['Gale Wings','Mystic Heart','Wonder Lock'])assert.ok(!out.unsupported.includes(card),card+' completed');
 assert.deepEqual(out.unsupported,[],'No Steam Siege Abilities should remain gated');
 assert.deepEqual(out.gates,[],'No Steam Siege attacks should remain gated');
 for(const card of ['Steam Up','Mega Boost','Sonic Vision'])assert.ok(!out.unsupported.includes(card),card+' must now be implemented');
 assert.ok(!out.gates.some(pair=>pair[0]==='79'&&pair[1]==='Despair Ray'));
 const g=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
 assert.match(g,/tests\/v07391-steam-siege-audit\.test\.cjs/);
 assert.match(g,/dependsOn tasks\.named\('auditXY11ForApk'\)/);
});
const generated=fs.existsSync(path.join(root,'data/classic/xy11-print-compact.json'));
test('Generated full official catalogue includes every newly enabled card with verified printed costs',{skip:!(generated||process.env.GITHUB_ACTIONS==='true')},()=>{
 const rows=JSON.parse(fs.readFileSync(path.join(root,'data/classic/xy11-print-compact.json'),'utf8'));
 assert.equal(rows.length,116);assert.equal(xy.CARDS.length,116);
 for(const n of ['13','16','52','53','90']){
  const c=xy.cardById('xy11-'+n),source=rows.find(row=>row[0]===n);
  assert.ok(c?.battleEnabled,'New print gated: '+n);assert.ok(source,'Missing source print '+n);
  // Classic battle-data normalizes printed arrays like ['G','C'] to compact
  // 'GC' for the battle engine. Compare the same printed symbols in either
  // representation; never confuse a legitimate normalization with a bad cost.
  assert.deepEqual(c.attacks.map(a=>compactEnergyCost(a.cost)),source[7].map(a=>a[1].join('')),'Printed attack Energy costs: '+c.id);
  assert.deepEqual(c.attacks.map(a=>a.name),source[7].map(a=>a[0]));
 }
 assert.equal(xy.CARDS.filter(c=>c.battleEnabled).length>=contract.expectedPlayableMinimum,true);
});
