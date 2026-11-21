'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const core=require(path.join(assets,'tcgp-battle-core.js')),effects=require(path.join(assets,'tcgp-battle-effects.js'));
const ref=(cardId,uid)=>({cardId,uid});
const mk=(cardId,uid,benchSlot=null)=>({cardId,uid,benchSlot,stack:[cardId],damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],conditions:{},temporaryTrainers:[],playedOnSideTurn:1});
const side=w=>({id:w,active:mk('test-normal',w+'a'),bench:[mk('test-normal',w+'b',0)],hand:[],deck:[],discard:[],energyDiscard:{},energyTypes:['Water','Fire','Lightning'],energySupply:['Fire','Water','Lightning'],handLimit:8,benchLimit:3,turnCount:5,prizes:[ref('test-normal',w+'p1')],handEnergyUsed:false,energyUsed:false});
const scene=()=>({format:'classic',phase:'battle',activeSide:'player',turnNumber:7,rngState:2,log:[],sides:{player:side('player'),opponent:side('opponent')},modifiers:[]});
const catalog={
 'test-normal':{id:'test-normal',name:'Normal',kind:'pokemon',stage:'Basic',hp:300,types:['Colorless'],battleEnabled:true,attacks:[{name:'Kick',cost:[],damage:60,effect:{type:'noop'}}]},
 'test-weak':{id:'test-weak',name:'Fire-weak Pokémon',kind:'pokemon',stage:'Basic',hp:120,types:['Water'],weakness:'Fire',weaknessValue:'×2',battleEnabled:true,attacks:[{name:'Jab',cost:[],damage:30,effect:{type:'noop'}}]},
 'test-fire':{id:'test-fire',name:'Fire attacker',kind:'pokemon',stage:'Basic',hp:260,types:['Fire'],battleEnabled:true,attacks:[{name:'Jab',cost:[],damage:40,effect:{type:'noop'}}]},
 'test-special-fire':{id:'test-special-fire',name:'Fire Special',kind:'energy',specialEnergy:true,energyType:'Fire',effect:{type:'specialEnergy',provides:{Fire:1}},battleEnabled:true},
 'xy5-128':{id:'xy5-128',name:'Exp. Share',kind:'trainer',trainerType:'Tool',effect:{type:'noop'},battleEnabled:true},
};
for(const n of ['3','29','146','91','152']){
 const name=n==='3'?'Beedrill':n==='29'||n==='146'?'Camerupt-EX':'Sharpedo-EX',
       attackName=n==='3'?'Allergic Shock':n==='29'||n==='146'?'Explosive Jet':'Hunt',
       rule=n==='3'?'allergicShock':n==='29'||n==='146'?'explosiveJet':'hunt';
 catalog['xy5-'+n]={id:'xy5-'+n,name,kind:'pokemon',stage:'Basic',hp:260,types:[n==='29'||n==='146'?'Fire':n==='91'||n==='152'?'Darkness':'Grass'],battleEnabled:true,
   attacks:[{name:attackName,cost:[],damage:0,effect:{type:'neoRule',rule:'xy5:'+rule}}]};
}
const withCards=fn=>{const old=data.cardById;data.cardById=id=>catalog[id]||old(id);try{return fn();}finally{data.cardById=old;}};
function use(s,side,pred){const list=core.legalActions(s,side),act=list.find(pred);assert.ok(act,'Missing action: '+JSON.stringify(list));core.applyAction(s,side,act);return act;}
function choose(s,side,i){return use(s,side,a=>a.type==='effectChoice'&&a.choiceOption===i);}
function attack(s,n,selection){s.sides.player.active=mk('xy5-'+n,'attacker');return use(s,'player',a=>a.type==='attack'&&(selection==null||a.effectSelection===selection));}

test('Python descriptors for the six remaining non-Ω prints all validate',()=>{
 const py=String.raw`import sys,json;sys.path.insert(0,sys.argv[1]);import xy5_verified as v
print(json.dumps({'attacks':[v.ATTACKS.get((n,k)) for n,k in [('3','Allergic Shock'),('29','Explosive Jet'),('146','Explosive Jet'),('91','Hunt'),('152','Hunt')]],'trainer':v.TRAINERS.get('128'), 'omega':list(v.TRAITS_IMPLEMENTED)}))`;
 const p=spawnSync('python3',['-c',py,path.join(root,'scripts')],{encoding:'utf8'});assert.equal(p.status,0,p.stderr);const found=JSON.parse(p.stdout);
 for(const a of found.attacks){assert.ok(a);assert.deepEqual(effects.validateEffect(a),[]);}
 assert.equal(found.trainer[0],'Tool');assert.deepEqual(effects.validateEffect(found.trainer[1]),[]);
 assert.ok(!found.omega.includes('Ω Barrier'));
});

test('Allergic Shock marks just the Defending Pokémon, and a subsequent own-turn damaging attack knocks it out',()=>withCards(()=>{
 const s=scene(),p=s.sides.player,f=s.sides.opponent;
 attack(s,'3');assert.equal(f.active.xy5AllergicShock?.side,'player');
 assert.equal(f.active.xy5AllergicShock?.triggerTurn,9);
 assert.equal(f.active.damage,0);
 s.turnNumber=9;s.activeSide='player';p.active=mk('test-fire','finisher');
 use(s,'player',a=>a.type==='attack');
 assert.ok(s.log.some(l=>l.type==='xy5AllergicShockKO'));
 assert.ok(s.log.some(l=>l.type==='ko'&&l.side==='opponent'));
}));

test('Allergic Shock does not trigger on the original turn, after switching, or when an attack deals zero',()=>withCards(()=>{
 const s=scene(),foe=s.sides.opponent;
 attack(s,'3');assert.ok(foe.active.xy5AllergicShock);
 const originally=foe.active;
 effects.clearTemporaryEffects(s,originally);assert.equal(originally.xy5AllergicShock,undefined);
 const a=scene();a.sides.opponent.active.xy5AllergicShock={side:'player',triggerTurn:7};
 a.sides.player.active=mk('xy5-3','a'); // Allergic Shock has zero damage
 use(a,'player',x=>x.type==='attack');assert.ok(!a.log.some(l=>l.type==='xy5AllergicShockKO'));
}));

test('Explosive Jet picks the count before damage then spends selected actual board Energy cards',()=>withCards(()=>{
 for(const n of ['29','146']){
  const s=scene(),p=s.sides.player,f=s.sides.opponent;p.active=mk('xy5-'+n,'attacker');
  p.active.energy.Fire=1;p.bench[0].energy.Fire=1;
  p.bench[0].specialEnergy=[ref('test-special-fire','special1')];
  const attacks=core.legalActions(s,'player').filter(x=>x.type==='attack');
  assert.deepEqual(attacks.map(x=>x.effectSelection),['count:0','count:1','count:2','count:3']);
  use(s,'player',a=>a.type==='attack'&&a.effectSelection==='count:2');
  assert.equal(f.active.damage,100);assert.equal(s.phase,'effectChoice');
  choose(s,'player',2); // Special Energy on Bench
  choose(s,'player',1); // Basic Fire on Bench
  assert.equal(p.active.energy.Fire,1);assert.equal(p.bench[0].energy.Fire,0);
  assert.equal(p.bench[0].specialEnergy.length,0);
  assert.equal(p.energyDiscard.Fire,1);assert.ok(p.discard.some(x=>x.uid==='special1'));
  assert.equal(s.phase,'battle');
 }
}));

test('Explosive Jet can select no Energy for zero attack damage and no forced discard',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active=mk('xy5-29','cam');p.active.energy.Fire=1;
 use(s,'player',a=>a.type==='attack'&&a.effectSelection==='count:0');
 assert.equal(s.sides.opponent.active.damage,0);assert.equal(p.active.energy.Fire,1);
 assert.equal(s.phase,'battle');
}));

test('Hunt switches chosen foe first and applies 30 attack damage to the new Active, not the old one',()=>withCards(()=>{
 for(const n of ['91','152']){
  const s=scene(),f=s.sides.opponent;
  f.bench.push(mk('test-weak','weak',1));
  const previous=f.active;
  s.sides.player.active=mk('xy5-'+n,'attacker');
  const actions=core.legalActions(s,'player').filter(a=>a.type==='attack');
  assert.equal(actions.length,2);
  use(s,'player',a=>a.type==='attack'&&a.benchIndex===1);
  assert.equal(f.active.uid,'weak');assert.equal(f.active.damage,30);
  assert.equal(previous.damage,0);assert.ok(f.bench.some(p=>p.uid===previous.uid));
  assert.ok(s.log.some(l=>l.type==='xy5Hunt'&&l.newActiveUid==='weak'));
 }
}));

test('XY5 Exp. Share offers own chosen basic-energy transfer on an attack KO and retains its Tool',()=>withCards(()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 s.activeSide='opponent';p.active=mk('test-normal','victim');p.active.damage=260;p.active.energy.Fire=1;
 p.bench[0].tool=ref('xy5-128','exp-real');o.active=mk('test-normal','attacker');
 use(s,'opponent',a=>a.type==='attack');
 assert.equal(s.phase,'effectChoice');assert.ok(s.pendingChoice.options.some(x=>String(x).includes('Fire')));
 choose(s,'player',0);
 assert.equal(p.bench[0].energy.Fire,1);assert.equal(p.energyDiscard.Fire||0,0);
 assert.equal(p.bench[0].tool.uid,'exp-real');
}));

test('Generated Primal Clash only keeps the six Ω Barrier prints gated',{skip:!fs.existsSync(path.join(root,'data/classic/xy5-print-compact.json'))},()=>{
 const set=require(path.join(assets,'tcg-classic-primal-clash.js'));
 assert.equal(set.CARDS.length,164);assert.equal(set.coverage().battleEnabled,158);
 assert.deepEqual(set.coverage().gated.sort(),['xy5-9','xy5-24','xy5-60','xy5-77','xy5-86','xy5-151'].sort());
 for(const n of ['3','29','91','128','146','152'])assert.equal(set.cardById('xy5-'+n)?.battleEnabled,true);
});

test('CPU action matching preserves different Explosive Jet discard counts and Hunt targets',()=>{
 const ai=require(path.join(assets,'tcgp-battle-ai.js'));
 assert.equal(ai.sameAction({type:'attack',attackIndex:0,effectSelection:'count:0'},
   {type:'attack',attackIndex:0,effectSelection:'count:2'}),false);
 assert.equal(ai.sameAction({type:'attack',attackIndex:0,effectSelection:'count:2'},
   {type:'attack',attackIndex:0,effectSelection:'count:2'}),true);
 assert.equal(ai.sameAction({type:'attack',attackIndex:0,benchIndex:0},
   {type:'attack',attackIndex:0,benchIndex:1}),false);
});

test('CPU selects a damaging Explosive Jet instead of a free zero-energy attack',()=>withCards(()=>{
 const ai=require(path.join(assets,'tcgp-battle-ai.js'));
 const s=scene();s.activeSide='opponent';
 const own=s.sides.opponent;own.active=mk('xy5-29','cpu-cam');own.active.energy.Fire=2;
 own.energySupply=[];own.energyTypes=[];own.hand=[];
 const options=core.legalActions(s,'opponent').filter(a=>a.type==='attack');assert.equal(options.length,3);
 for(const level of ['Beginner','Intermediate','Advanced','Expert']){
  const act=ai.chooseAction(s,'opponent',level,0);
  assert.equal(act.type,'attack',level+': '+JSON.stringify(act));
  assert.ok(Number(act.effectSelection.replace('count:',''))>0,level+': '+JSON.stringify(act));
 }
}));
