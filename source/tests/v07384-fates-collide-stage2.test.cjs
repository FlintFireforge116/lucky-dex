'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const py=String.raw`import sys,json;sys.path.insert(0,sys.argv[1]);import xy10_verified as m
print(json.dumps({'attacks':{n+':'+t:e for (n,t),e in m.ATK.items()},'trainers':{n:v[1] for n,v in m.TRAINERS.items()},'energies':m.ENERGIES}))`;
const result=spawnSync('python3',['-c',py,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(result.status,0,result.stderr);const m=JSON.parse(result.stdout);
function scene(){
 const cards={self:{id:'self',kind:'pokemon',name:'Self',stage:'Basic',hp:130,types:['Grass'],attacks:[]},foe:{id:'foe',kind:'pokemon',name:'Opponent',stage:'Basic',hp:150,types:['Darkness'],attacks:[]},basic:{id:'basic',kind:'pokemon',name:'Basic',stage:'Basic',types:['Water']},evo:{id:'evo',kind:'pokemon',name:'Evolved',stage:'Stage 1',types:['Water']},fighting:{id:'fighting',kind:'pokemon',stage:'Basic',types:['Fighting']},tool:{id:'tool',kind:'trainer',trainerType:'Tool',name:'Tool'},supporter:{id:'supporter',kind:'trainer',trainerType:'Supporter',name:'Supporter'},item:{id:'item',kind:'trainer',trainerType:'Item',name:'Item'},other:{id:'other',kind:'pokemon',stage:'Basic',types:['Grass']}};
 const slot=(id,uid,add={})=>({uid,cardId:id,stack:[id],benchSlot:0,energy:{},specialEnergy:[],conditions:{},damage:0,tool:null,...add});
 const p={active:slot('self','pa'),bench:[],deck:[],discard:[],hand:[],prizes:[],energySupply:[],turnCount:2},o={active:slot('foe','oa'),bench:[],deck:[],discard:[],hand:[],prizes:[],energySupply:[],turnCount:2};
 const state={format:'classic',turnNumber:5,activeSide:'player',phase:'battle',sides:{player:p,opponent:o},log:[]};
 const choices=[],ctx={state,side:'player',foeSide:'opponent',attacker:p.active,defender:o.active,cardById:id=>cards[id]||null,drawCard:ss=>{const r=ss.deck.shift();if(r)ss.hand.push(r);},shuffle:()=>{},random:()=>.1,requestChoice:spec=>choices.push(spec),isAttack:true};
 return {cards,slot,p,o,state,ctx,choices};
}
test('Every stage-two attack, Trainer and Special Energy descriptor validates',()=>{
 for(const [n,e] of Object.entries(m.attacks))assert.deepEqual(fx.validateEffect(e),[],n);
 for(const [n,e] of Object.entries(m.trainers))assert.deepEqual(fx.validateEffect(e),[],n);
 for(const [n,e] of Object.entries(m.energies))assert.deepEqual(fx.validateEffect(e),[],n);
});
test('Serperior Coil boosts both next-turn attacks; Slashing Strike locks only itself',()=>{
 const s=scene();fx.applyEffect(m.attacks['7:Coil'],s.ctx);
 assert.deepEqual(s.p.active.nextAttackBonuses.map(x=>[x.attackName,x.amount,x.turn]),[['Coil',60,7],['Slashing Strike',60,7]]);
 fx.applyEffect(m.attacks['7:Slashing Strike'],s.ctx);
 assert.equal(fx.isLocked(s.state,s.p.active,'attack','Slashing Strike'),true);
 assert.equal(fx.isLocked(s.state,s.p.active,'attack','Coil'),false);
});
test('Zygarde Aura Break only prevents the targeted Darkness/Fairy defender attacking next turn',()=>{
 const s=scene();fx.applyEffect(m.attacks['52:Aura Break'],s.ctx);
 assert.equal(s.o.active.locks.length,1);assert.equal(s.o.active.locks[0].expiresTurn,6);
 const s2=scene();s2.cards.foe.types=['Water'];fx.applyEffect(m.attacks['52:Aura Break'],s2.ctx);
 assert.equal(s2.o.active.locks,undefined);
});
test('Lucario Fight Alone adds 60 for every opposing Pokémon in excess of ours',()=>{
 const s=scene();const attack={name:'Fight Alone',damage:30,effect:m.attacks['63:Fight Alone']};
 assert.equal(fx.resolveAttack(attack,s.ctx).damage,30);
 s.o.bench.push(s.slot('basic','ob1',{benchSlot:0}),s.slot('evo','ob2',{benchSlot:1}));
 assert.equal(fx.resolveAttack(attack,s.ctx).damage,150);
 s.p.bench.push(s.slot('basic','pb',{benchSlot:0}));
 assert.equal(fx.resolveAttack(attack,s.ctx).damage,90);
});
test('Shuckle draws two, then chosen physical hand card goes to bottom of deck',()=>{
 const s=scene();const h={uid:'original',cardId:'other'},a={uid:'d1',cardId:'item'},b={uid:'d2',cardId:'supporter'},remaining={uid:'d3',cardId:'other'};
 s.p.hand=[h];s.p.deck=[a,b,remaining];fx.applyEffect(m.attacks['1:Hide a Berry'],s.ctx);
 assert.deepEqual(s.p.hand.map(x=>x.uid),['original','d1','d2']);assert.equal(s.choices.at(-1).kind,'handCard');
 fx.applyEffect({type:'xy10HandToDeckBottom',side:'self'},{...s.ctx,resolvingChoice:true,action:{choiceHandIndex:1}});
 assert.deepEqual(s.p.hand.map(x=>x.uid),['original','d2']);assert.deepEqual(s.p.deck.map(x=>x.uid),['d3','d1']);
});
test('Cinccino Covet returns a chosen opponent hand card, not a random/discarded card',()=>{
 const s=scene();s.o.hand=[{uid:'foe1',cardId:'item'},{uid:'foe2',cardId:'supporter'}];s.o.deck=[{uid:'top',cardId:'basic'}];
 fx.applyEffect(m.attacks['88:Covet'],s.ctx);
 assert.equal(s.choices.at(-1).selectionSide,'opponent');
 fx.applyEffect({type:'xy10HandToDeckBottom',side:'opponent'},{...s.ctx,resolvingChoice:true,action:{choiceHandIndex:1}});
 assert.deepEqual(s.o.hand.map(x=>x.uid),['foe1']);assert.deepEqual(s.o.deck.map(x=>x.uid),['top','foe2']);assert.equal(s.o.discard.length,0);
});
test("Lass's Special draws for opponent Bench Basics only, not their Active or Stage 1",()=>{
 const s=scene();s.o.bench=[s.slot('basic','b1',{benchSlot:0}),s.slot('evo','b2',{benchSlot:1}),s.slot('basic','b3',{benchSlot:2})];
 s.p.deck=Array.from({length:5},(_,i)=>({uid:'draw'+i,cardId:'item'}));fx.applyEffect(m.trainers['103'],s.ctx);
 assert.equal(s.p.hand.length,2);assert.equal(s.p.deck.length,3);
});
test('Random Receiver reveals until the first Supporter, shuffling nonmatches back',()=>{
 const s=scene();s.p.deck=[{uid:'i1',cardId:'item'},{uid:'x1',cardId:'other'},{uid:'su',cardId:'supporter'},{uid:'last',cardId:'item'}];
 fx.applyEffect(m.trainers['109'],s.ctx);
 assert.deepEqual(s.p.hand.map(x=>x.uid),['su']);assert.deepEqual(s.p.deck.map(x=>x.uid),['last','i1','x1']);
});
test('Minccino Cleaning Up selects opposing Tool-bearing Pokémon and discards its physical Tool',()=>{
 const s=scene();s.o.active.tool={uid:'t1',cardId:'tool'};
 fx.applyEffect(m.attacks['86:Cleaning Up'],s.ctx);
 assert.equal(s.choices.at(-1).selectionSide,'opponent');
 fx.applyEffect(m.attacks['86:Cleaning Up'],{...s.ctx,resolvingChoice:true,action:{choiceTarget:'active'}});
 assert.equal(s.o.active.tool,null);assert.deepEqual(s.o.discard.map(x=>x.uid),['t1']);
});
test('Strong Energy reuses XY3 printed Fighting-only attachment restriction and damage bonus',()=>{
 assert.deepEqual(m.energies['115'].provides,{Fighting:1});
 const core=fs.readFileSync(path.join(root,'app/src/main/assets/tcgp-battle-core.js'),'utf8');
 const eff=fs.readFileSync(path.join(root,'app/src/main/assets/tcgp-battle-effects.js'),'utf8');
 assert.match(core,/\['xy3-104','xy10-115'\]/);assert.match(eff,/r\.cardId==='xy3-104'\|\|r\.cardId==='xy10-115'/);
});
test('Regi Power stacks on other Fighting Pokémon only and is disabled by suppression',()=>{
 const s=scene();s.cards.self.types=['Fighting'];
 s.cards.regi={id:'regi',name:'Regirock-EX',stage:'Basic',types:['Fighting'],kind:'pokemon',abilities:[{name:'Regi Power',type:'passive',effect:{type:'xy10RegiPower'}}]};
 s.p.bench=[s.slot('regi','regi1',{benchSlot:0}),s.slot('regi','regi2',{benchSlot:1})];
 assert.equal(fx.attackDamageWithState(s.state,'player',s.p.active,'opponent',s.o.active,100,s.ctx.cardById),120);
 assert.equal(fx.attackDamageWithState(s.state,'player',s.p.bench[0],'opponent',s.o.active,100,s.ctx.cardById),100);
 s.p.bench[1].abilitySuppressed=true;
 assert.equal(fx.attackDamageWithState(s.state,'player',s.p.active,'opponent',s.o.active,100,s.ctx.cardById),110);
});
test('Lugia Pressure applies to Active attacks before Weakness and Resistance, not when suppressed',()=>{
 const s=scene();s.cards.foe={...s.cards.foe,name:'Lugia',types:['Colorless'],abilities:[{name:'Pressure',type:'passive',effect:{type:'xy10LugiaPressure'}}]};
 assert.equal(fx.attackDamageWithState(s.state,'player',s.p.active,'opponent',s.o.active,100,s.ctx.cardById),80);
 const bench=s.slot('basic','ben',{benchSlot:0});s.o.bench=[bench];
 assert.equal(fx.wideLensBenchMatchup(s.state,'player',s.p.active,'opponent',bench,50,s.ctx.cardById),30);
 s.o.active.abilitySuppressed=true;
 assert.equal(fx.wideLensBenchMatchup(s.state,'player',s.p.active,'opponent',bench,50,s.ctx.cardById),50);
 assert.equal(fx.attackDamageWithState(s.state,'player',s.p.active,'opponent',s.o.active,100,s.ctx.cardById),100);
});
test('White Kyurem Burning Icicles only hits up to two Benched Pokémon with Fire Energy attached',()=>{
 const s=scene();s.o.bench=[s.slot('basic','b1',{benchSlot:0}),s.slot('evo','b2',{benchSlot:1})];
 const e=m.attacks['21:Burning Icicles'];fx.applyEffect(e,s.ctx);
 assert.equal(s.choices.length,0,'No Fire Energy means no Bench attack effect');
 s.p.active.energy.Fire=1;fx.applyEffect(e,s.ctx);
 assert.equal(s.choices.at(-1).kind,'pokemon');
 fx.applyEffect(e,{...s.ctx,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});
 assert.equal(s.o.bench[0].damage,20);assert.equal(s.o.bench[1].damage,0);
});
test('Physical Strong Energy stacks only on Fighting attackers and only against Active',()=>{
 const s=scene();s.cards.self.types=['Fighting'];
 const base=fx.attackDamageWithState(s.state,'player',s.p.active,'opponent',s.o.active,80,s.ctx.cardById);
 s.p.active.specialEnergy=[{uid:'a',cardId:'xy10-115'},{uid:'b',cardId:'xy10-115'}];
 assert.equal(fx.attackDamageWithState(s.state,'player',s.p.active,'opponent',s.o.active,80,s.ctx.cardById),base+40);
 s.cards.self.types=['Psychic'];
 assert.equal(fx.attackDamageWithState(s.state,'player',s.p.active,'opponent',s.o.active,80,s.ctx.cardById),base);
});
test('Flying Flare now supports the optional 40-damage boost and recoil',()=>{
 assert.deepEqual(fx.validateEffect(m.attacks['9:Flying Flare']),[]);
 assert.equal(m.attacks['9:Flying Flare'].rule,'flyingFlare');
});
test('GitHub source-only preflight never requires the not-yet-generated official catalogue',()=>{
 const script=fs.readFileSync(path.join(root,'scripts/preflight-xy10-release.py'),'utf8');
 assert.match(script,/source_only_env\.pop\('GITHUB_ACTIONS',None\)/);
 assert.match(script,/subprocess\.run\(\['node','--test'.*env=source_only_env/);
 const contract=require('../scripts/xy10_release_contract.json');
 const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
 assert.equal(contract.release,gradle.match(/versionName ['"]([^'"]+)['"]/)[1]);assert.ok(contract.expectedPlayableMinimum>=73);
 for(const n of ['1','7','21','43','43a','52','63','78','86','88','103','109','115'])assert.ok(contract.requiredEnabledNumbers.includes(n),n);
});
