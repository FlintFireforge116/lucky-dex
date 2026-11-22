"use strict";
// v0.69.388: one-pass full Fates Collide set integration, with strict
// generation coverage; full independent behaviour audit follows release.
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..'),effects=require('../app/src/main/assets/tcgp-battle-effects.js');
const pyCode=String.raw`import sys,json;sys.path.insert(0,sys.argv[1]);import xy10_verified as v
print(json.dumps({'attacks':{n+':'+t:e for (n,t),e in v.ATK.items()},'abilities':v.ABILITIES,'trainers':{n:e for n,(_,e) in v.TRAINERS.items()}}))`;
const out=spawnSync('python3',['-c',pyCode,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(out.status,0,out.stderr);const map=JSON.parse(out.stdout);
const finalNumbers=['9','17','18','24','25','29','31','37','38','49','56','62','64','76','77','82','94','96','102','106','108','117','120','125'];
function scene(){
 const cards={
  active:{id:'active',name:'Active',kind:'pokemon',stage:'Basic',battleEnabled:true,types:['Fighting'],hp:170},
  foe:{id:'foe',name:'Foe',kind:'pokemon',stage:'Basic',battleEnabled:true,types:['Psychic'],hp:170},
  om:{id:'xy10-17',name:'Omanyte',kind:'pokemon',stage:'Restored',battleEnabled:true,types:['Water'],hp:70},
  ka:{id:'xy10-38',name:'Kabuto',kind:'pokemon',stage:'Restored',battleEnabled:true,types:['Fighting'],hp:80},
  ae:{id:'xy10-76',name:'Aerodactyl',kind:'pokemon',stage:'Restored',battleEnabled:true,types:['Fighting'],hp:120},
  me:{id:'metal',name:'Metal Energy',kind:'energy',basicEnergy:true,energyType:'Metal',subtype:'Metal'},
  wa:{id:'water',name:'Water Energy',kind:'energy',basicEnergy:true,energyType:'Water',subtype:'Water'},
 };
 const slot=(id,uid,benchSlot=null)=>({uid,cardId:id,benchSlot,stack:[id],energy:{},specialEnergy:[],damage:0,conditions:{},tool:null});
 const board=id=>({active:slot(id,id+'-a'),bench:[],deck:[],discard:[],hand:[],energyDiscard:{},energySupply:[],prizes:[],benchLimit:3,turnCount:4});
 const p=board('active'),o=board('foe'),state={format:'classic',turnNumber:7,phase:'battle',activeSide:'player',sides:{player:p,opponent:o},log:[]};
 const prompts=[];
 const ctx={state,side:'player',foeSide:'opponent',attacker:p.active,defender:o.active,cardById:id=>cards[id],requestChoice:q=>prompts.push(q),shuffle:()=>{},random:()=>.3,benchCard:(side,ref)=>{const index=side.bench.length;side.bench.push(slot(ref.cardId,ref.uid,index));return index;}};
 const play=(e,action)=>effects.applyEffect(e,{...ctx,resolvingChoice:true,action});
 return {cards,slot,p,o,state,prompts,ctx,play};
}
test('Whole-set contract requires exactly 129 official prints with no older exclusions',()=>{
 const c=require('../scripts/xy10_release_contract.json');
 assert.equal(c.stage,'complete');assert.equal(c.expectedPlayableMinimum,129);
 assert.equal(c.requiredEnabledNumbers.length,129);assert.equal(new Set(c.requiredEnabledNumbers).size,129);
 for(const n of finalNumbers)assert.ok(c.requiredEnabledNumbers.includes(n),`missing ${n}`);
 const src=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
 assert.ok(src.includes('tests/v07388-fates-collide-complete.test.cjs'));
});
test('All 24 completion effects have supported DSL descriptors (including alt-art reprints)',()=>{
 const check=e=>assert.deepEqual(effects.validateEffect(e),[],JSON.stringify(e));
 for(const [name,e] of Object.entries(map.attacks))check(e);
 for(const [name,a] of Object.entries(map.abilities))check(a.effect);
 for(const [id,e] of Object.entries(map.trainers))check(e);
 for(const n of ['25','117','125'])assert.ok(map.attacks[n+':Suppression']);
 for(const n of ['64','120'])assert.ok(map.attacks[n+':Rapid Blaster']);
});
test('Actual generator enables all 24 previously gated prints with correct restored and Tool treatment',()=>{
 const code=String.raw`import sys,json,importlib.util;sys.path.insert(0,sys.argv[1]);import xy10_verified as v
sp=importlib.util.spec_from_file_location('gen',sys.argv[2]);g=importlib.util.module_from_spec(sp);sp.loader.exec_module(g)
needed={'9':('Moltres','Basic',['Combustion','Flying Flare'],[]),'17':('Omanyte','Restored',['Water Gun'],[]),'18':('Omastar','Stage 1',['Spinning Attack'],['Restoring Beam']),'24':('Rotom','Basic',['Energy Extract','Plasmagic'],[]),'25':('Alakazam-EX','Basic',['Suppression'],['Kinesis']),'29':('Mew','Basic',['Encounter'],['Memories of Dawn']),'31':('Grumpig','Stage 1',['Head Walking','Knock Back'],[]),'37':('Marowak','Stage 1',['Bonemerang'],['Bodyguard']),'38':('Kabuto','Restored',['Mud Shot'],[]),'49':('Carbink','Basic',['Stone Edge'],['Energy Keeper']),'56':('Tyranitar','Stage 2',['Dark Mountain'],['Raging Roar']),'62':('Bronzong BREAK','BREAK',['Metal Rain'],[]),'64':('Genesect-EX','Basic',['Rapid Blaster'],['Drive Change']),'76':('Aerodactyl','Restored',['Bite','Jet Draft'],[]),'77':('Snorlax','Basic',['Toss and Turn','Swallow'],[]),'82':('Exploud','Stage 2',['Ambush','Cacophony'],[]),'117':('Alakazam-EX','Basic',['Suppression'],['Kinesis']),'120':('Genesect-EX','Basic',['Rapid Blaster'],['Drive Change']),'125':('Alakazam-EX','Basic',['Suppression'],['Kinesis'])}
trainers={'94':('Chaos Tower','Stadium'),'96':('Dome Fossil Kabuto','Item'),'102':('Helix Fossil Omanyte','Item'),'106':('Old Amber Aerodactyl','Item'),'108':('Power Memory','Pokémon Tool')}
rows=[]
for n,(name,stage,att,abl) in needed.items():
 atk=[[a,['C'],'10',''] for a in att]
 ability=[[a,'Ability',''] for a in abl]
 rows.append([n,name,'Pokémon',[stage],100,['Fighting'],None,atk,ability,None,None,1,'Rare',[],None,None])
for n,(name,kind) in trainers.items():
 atk=[['All Cells Burn',['F','F','C'],'200','Discard 3 Energy attached to this Pokémon.']] if n=='108' else []
 rows.append([n,name,'Trainer',[kind],None,[],None,atk,[],None,None,0,'Uncommon',[],None,None])
out=g.generate(rows)
print(json.dumps([{'id':c['id'],'enabled':c['battleEnabled'],'reasons':c['support']['reasons'],'stage':c.get('stage'),'toolAttacks':len(c.get('attacks',[]))} for c in out]))`;
 const res=spawnSync('python3',['-c',code,path.join(root,'scripts'),path.join(root,'scripts/build-xy10.py')],{encoding:'utf8'});
 assert.equal(res.status,0,res.stderr);const result=JSON.parse(res.stdout);
 assert.equal(result.length,24);assert.deepEqual(result.filter(x=>!x.enabled),[]);
 for(const n of ['17','38','76'])assert.equal(result.find(x=>x.id==='xy10-'+n).stage,'Restored');
 assert.equal(result.find(x=>x.id==='xy10-108').toolAttacks,1);
});
test('Dome Fossil selects only Kabuto within bottom seven and benches the physical card',()=>{
 const s=scene(),e=map.trainers['96'];
 s.p.deck=[{uid:'k-top',cardId:'ka'},...Array.from({length:7},(_,i)=>({uid:'dummy'+i,cardId:'foe'})),{uid:'k-bottom',cardId:'ka'}];
 effects.applyEffect(e,s.ctx);assert.equal(s.prompts.at(-1)?.kind,'deckCard');
 s.play(e,{choiceDeckIndex:0});assert.equal(s.p.bench.length,0);
 s.play(e,{choiceDeckIndex:8});assert.equal(s.p.bench.length,1);
 assert.equal(s.p.bench[0].cardId,'ka');assert.equal(s.p.bench[0].uid,'k-bottom');
 assert.equal(s.p.deck.length,8);
});
test('Rotom Plasmagic transfers actual damage counters from whole friendly board to opponent Active',()=>{
 const s=scene();s.p.active.damage=30;s.p.bench=[{...s.slot('active','b',0),damage:50}];
 effects.applyEffect(map.attacks['24:Plasmagic'],s.ctx);
 assert.equal(s.p.active.damage,10);assert.equal(s.p.bench[0].damage,30);assert.equal(s.o.active.damage,40);
});
test('Alakazam Suppression places three damage counters only on opposing Pokemon with attachments',()=>{
 const s=scene();s.o.active.energy={Psychic:2};s.o.bench=[s.slot('foe','o-b',0)];
 effects.applyEffect(map.attacks['25:Suppression'],s.ctx);
 assert.equal(s.o.active.damage,30);assert.equal(s.o.bench[0].damage,0);
});
test('Chaos Tower protects both sides with opposite poison/confusion and sleep/paralysis orientations',()=>{
 const s=scene();s.state.stadium={cardId:'xy10-94',xy10ChaosSide:'player',xy10ChaosMode:'cp'};
 s.p.active.conditions={poison:{},confusion:{},sleep:{}};
 s.o.active.conditions={sleep:{},paralysis:{},poison:{}};
 effects.applyContinuousRules(s.state,s.ctx.cardById);
 assert.equal(s.p.active.conditions.poison,undefined);assert.equal(s.p.active.conditions.confusion,undefined);assert.ok(s.p.active.conditions.sleep);
 assert.equal(s.o.active.conditions.sleep,undefined);assert.equal(s.o.active.conditions.paralysis,undefined);assert.ok(s.o.active.conditions.poison);
});
test('Power Memory is printed as an attached Tool-granted attack, not a standalone Pokemon attack',()=>{
 assert.deepEqual(map.trainers['108'],{type:'xy10Final',rule:'powerMemory'});
 const c=fs.readFileSync(path.join(root,'app/src/main/assets/tcgp-battle-core.js'),'utf8');
 assert.match(c,/xy10-108/);assert.match(c,/xy10-54/);assert.match(c,/xy10-54a/);
});
