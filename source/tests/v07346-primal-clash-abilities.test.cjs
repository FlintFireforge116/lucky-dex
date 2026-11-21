'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js')),
  effects=require(path.join(assets,'tcgp-battle-effects.js')),
  core=require(path.join(assets,'tcgp-battle-core.js'));
const ability=(name,oncePerTurn=true,type='activated')=>({name,type,printedPowerType:'ability',disabledByStatus:false,oncePerTurn,event:type==='triggered'?'evolved':undefined,fromHandOnly:type==='triggered',effect:{type:'neoRule',rule:'xy5:'+({
 'Nurture and Heal':'nurtureHeal','Captivating Rhythm':'captivatingRhythm','Diving Search':'divingSearch','Sparkling Ripples':'sparklingRipples',
 'Energy Connect':'energyConnect','Unruly Claw':'unrulyClaw','Sand Flap':'sandFlap'}[name])}});
const catalog={
 'test-normal':{id:'test-normal',name:'Normal',kind:'pokemon',stage:'Basic',hp:200,types:['Colorless'],battleEnabled:true,attacks:[{name:'Kick',cost:[],damage:10,effect:{type:'noop'}}]},
 'test-grass':{id:'test-grass',name:'Grass',kind:'pokemon',stage:'Basic',hp:200,types:['Grass'],battleEnabled:true,attacks:[]},
 'test-water':{id:'test-water',name:'Water',kind:'pokemon',stage:'Basic',hp:200,types:['Water'],battleEnabled:true,attacks:[]},
 'test-energ':{id:'test-energ',name:'Grass Energy',kind:'energy',basicEnergy:true,energyType:'Grass',subtype:'Grass',battleEnabled:true},
 'test-special':{id:'test-special',name:'Metal Energy',kind:'energy',specialEnergy:true,energyType:'Metal',subtype:'Metal',effect:{type:'specialEnergy',provides:{Metal:1}},battleEnabled:true},
 'test-item':{id:'test-item',name:'Rare Candy',kind:'trainer',trainerType:'Item',effect:{type:'noop'},battleEnabled:true},
};
for(const [no,name,types,stage,from] of [
 ['8','Nurture and Heal',['Grass'],'Stage 2','Grovyle'],['12','Captivating Rhythm',['Water'],'Stage 2','Lombre'],
 ['36','Diving Search',['Water'],'Stage 2','Marshtomp'],['44','Sparkling Ripples',['Water'],'Stage 1','Feebas'],
 ['65','Energy Connect',['Lightning'],'Stage 2','Eelektrik'],['92','Unruly Claw',['Darkness'],'Stage 1','Corphish'],
 ['110','Sand Flap',['Dragon'],'Stage 2','Vibrava']]){
 const abName=name,realName={'Nurture and Heal':'Sceptile','Captivating Rhythm':'Ludicolo','Diving Search':'Swampert','Sparkling Ripples':'Milotic','Energy Connect':'Eelektross','Unruly Claw':'Crawdaunt','Sand Flap':'Flygon'}[name];
 catalog['xy5-'+no]={id:'xy5-'+no,name:realName,kind:'pokemon',stage,hp:170,types,battleEnabled:true,evolvesFrom:from,
  attacks:[{name:'Kick',cost:[],damage:10,effect:{type:'noop'}}],abilities:[ability(abName,name!=='Energy Connect',['Sparkling Ripples','Unruly Claw'].includes(name)?'triggered':'activated')]};
 catalog['base-'+no]={id:'base-'+no,name:from,kind:'pokemon',stage:stage==='Stage 1'?'Basic':'Stage 1',hp:140,types,battleEnabled:true,attacks:[]};
}
const ref=(cardId,uid)=>({cardId,uid});
const mk=(cardId,uid,benchSlot=null)=>({cardId,uid,benchSlot,stack:[cardId],damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],conditions:{},temporaryTrainers:[],playedOnSideTurn:1});
const side=w=>({id:w,active:mk('test-normal',w+'a'),bench:[mk('test-water',w+'b',0)],hand:[],deck:[],discard:[],energyDiscard:{},handLimit:8,benchLimit:3,turnCount:5,energyTypes:['Colorless'],prizes:[ref('test-normal',w+'p1')],handEnergyUsed:false,energyUsed:false});
const scene=()=>({format:'classic',phase:'battle',activeSide:'player',turnNumber:7,rngState:2,log:[],sides:{player:side('player'),opponent:side('opponent')},modifiers:[]});
function withCards(fn){const orig=data.cardById;data.cardById=id=>catalog[id]||orig(id);try{return fn();}finally{data.cardById=orig;}}
function use(s,side,match){const acts=core.legalActions(s,side),a=acts.find(match);assert.ok(a,'No legal action: '+JSON.stringify(acts));core.applyAction(s,side,a);return a;}
function choose(s,i=0,side='player'){return use(s,side,a=>a.type==='effectChoice'&&a.choiceOption===i);}
function power(s,id){return use(s,'player',a=>a.type==='ability'&&a.abilityIndex===0&&((a.target==='active'&&s.sides.player.active.cardId===id)||(a.target==='bench'&&s.sides.player.bench.find(p=>p.benchSlot===a.benchIndex)?.cardId===id)));}

test('Primal Clash activated Abilities are validated for official generated cards',()=>{
 const script=String.raw`import sys,json,importlib.util
p=sys.argv[1];sys.path.insert(0,p)
s=importlib.util.spec_from_file_location('b',p+'/build-xy5.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
V=m.V
names=['Nurture and Heal','Captivating Rhythm','Diving Search','Sparkling Ripples','Energy Connect','Unruly Claw','Sand Flap']
print(json.dumps({'all':all(k in V.ABILITIES for k in names),'abilities':[V.ABILITIES[k] for k in names]}))`;
 const p=spawnSync('python3',['-c',script,path.join(root,'scripts')],{encoding:'utf8'});assert.equal(p.status,0,p.stderr);
 const out=JSON.parse(p.stdout);assert.ok(out.all);
 for(const a of out.abilities)assert.deepEqual(effects.validateEffect(a.effect),[]);
 assert.equal(out.abilities[4].oncePerTurn,false,'Energy Connect is repeatable');
 assert.equal(out.abilities[3].fromHandOnly,true,'Sparkling Ripples requires evolving from hand');
});

test('Diving Search selects any actual deck ref, shuffles the remainder, and tops chosen card',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active=mk('xy5-36','diver');p.deck=[ref('test-normal','d1'),ref('test-grass','d2'),ref('test-item','d3')];
 power(s,'xy5-36');assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.options.length,3);
 choose(s,2);assert.equal(s.phase,'battle');assert.equal(p.deck[0].uid,'d3');assert.equal(p.deck.length,3);
 assert.equal(p.discard.length,0);assert.equal(p.hand.length,0);
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='ability'),false,'once per turn');
}));

test('Energy Connect moves only Basic Energy from Bench to Active and stays repeatable',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active=mk('test-normal','act');p.bench=[mk('xy5-65','eel',0),mk('test-normal','donor',1)];
 p.bench[1].energy={Water:2};p.bench[0].specialEnergy=[ref('test-special','special')];
 power(s,'xy5-65');assert.equal(s.pendingChoice.options.length,1);choose(s);
 assert.equal(p.active.energy.Water,1);assert.equal(p.bench[1].energy.Water,1);assert.equal(p.bench[0].specialEnergy.length,1);
 power(s,'xy5-65');choose(s);assert.equal(p.active.energy.Water,2);assert.equal(p.bench[1].energy.Water,0);
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='ability'),false,'No infinite empty action after last Basic moved');
}));

test('Nurture and Heal uses a real Grass Energy from hand without consuming normal hand Energy attachment',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active=mk('xy5-8','sc');p.active.damage=70;p.hand=[ref('test-energ','grass1')];
 power(s,'xy5-8');assert.equal(s.pendingChoice.options.length,2,'choose owner active or bench');
 choose(s,0);assert.equal(s.pendingChoice.options.length,1,'choose actual physical Grass Energy');
 choose(s);assert.equal(s.phase,'battle');assert.equal(p.active.energy.Grass,1);
 assert.equal(p.active.damage,40);assert.equal(p.hand.length,0);assert.equal(p.handEnergyUsed,false);
 assert.ok(s.log.some(l=>l.type==='xy5NurtureHeal'&&l.energyUid==='grass1'));
}));

test('Captivating Rhythm flip is logged and a heads result offers opponent Bench choice',()=>withCards(()=>{
 const s=scene(),p=s.sides.player,f=s.sides.opponent;p.active=mk('xy5-12','ludi');f.bench=[mk('test-grass','fb',0)];
 power(s,'xy5-12');assert.ok(s.log.some(l=>l.type==='coin'&&l.reason==='Captivating Rhythm'));
 if(s.phase==='effectChoice'){choose(s);assert.equal(f.active.uid,'fb');assert.equal(f.bench[0].uid,'opponenta');}
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='ability'),false,'once per turn');
}));

test('Sparkling Ripples only triggers on evolving from hand, returns chosen physical discard card',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active=mk('base-44','feebas');p.hand=[ref('xy5-44','evolve')];
 p.discard=[ref('test-item','item'),ref('test-grass','grass')];
 use(s,'player',a=>a.type==='evolve'&&a.cardId==='xy5-44'&&a.target==='active');
 assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.options.length,3);
 choose(s,1);assert.equal(p.active.cardId,'xy5-44');assert.ok(p.hand.some(r=>r.uid==='grass'));
 assert.ok(p.discard.some(r=>r.uid==='item'));assert.equal(p.discard.some(r=>r.uid==='grass'),false);
}));

test('Unruly Claw triggers from real hand evolution and discards the chosen opponent Energy',()=>withCards(()=>{
 const s=scene(),p=s.sides.player,f=s.sides.opponent;p.active=mk('base-92','corphish');p.hand=[ref('xy5-92','craw')];
 f.active.energy.Water=1;f.active.specialEnergy=[ref('test-special','sh')];
 use(s,'player',a=>a.type==='evolve'&&a.cardId==='xy5-92'&&a.target==='active');
 assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.options.length,3);
 choose(s,1);assert.equal(f.active.energy.Water,1);assert.equal(f.active.specialEnergy.length,0);
 assert.ok(f.discard.some(r=>r.uid==='sh'),'Special Energy kept in opponent physical discard');
}));

test('Sand Flap chooses side then shuffles whole hand and draws four for that player',()=>withCards(()=>{
 const s=scene(),p=s.sides.player,f=s.sides.opponent;p.active=mk('xy5-110','flygon');
 f.hand=[ref('test-grass','h1')];f.deck=[ref('test-normal','d1'),ref('test-item','d2'),ref('test-grass','d3'),ref('test-normal','d4')];
 power(s,'xy5-110');assert.equal(s.pendingChoice.options.length,2);choose(s,1);
 assert.equal(f.hand.length,4);assert.equal(f.deck.length,1);
 assert.equal(p.hand.length,0);assert.ok(s.log.some(l=>l.type==='xy5SandFlap'&&l.recipient==='opponent'));
}));

Object.assign(catalog,{
 'xy5-24':{id:'xy5-24',name:'Magcargo',kind:'pokemon',stage:'Stage 1',hp:200,types:['Fire'],battleEnabled:true,attacks:[{name:'Indomitable Blaze',cost:[],damage:80,effect:{type:'bonusDamage',amount:60,condition:{type:'opponentEx'}}}]},
 'xy5-43':{id:'xy5-43',name:'Feebas',kind:'pokemon',stage:'Basic',hp:200,types:['Water'],battleEnabled:true,attacks:[{name:'Float On',cost:[],damage:10,effect:{type:'coinFlip',tails:{type:'selfDamage',amount:10}}}]},
 'xy5-50':{id:'xy5-50',name:'Huntail',kind:'pokemon',stage:'Stage 1',hp:210,types:['Water'],battleEnabled:true,attacks:[{name:'Powerful Storm',cost:[],damage:0,effect:{type:'energyDamage',source:'self',all:true,amount:20,mode:'replace'}}]},
 'xy5-104':{id:'xy5-104',name:'Azumarill',kind:'pokemon',stage:'Stage 1',hp:210,types:['Fairy'],battleEnabled:true,attacks:[{name:'Dwindling Wave',cost:[],damage:100,effect:{type:'selfDamagePenalty',amount:1}}]},
 'xy5-117':{id:'xy5-117',name:'Bidoof',kind:'pokemon',stage:'Basic',hp:210,types:['Colorless'],battleEnabled:true,attacks:[{name:'Drench',cost:[],damage:20,effect:{type:'bonusDamage',amount:20,condition:{type:'selfHasEnergyType',energyType:'Water'}}}]},
 'xy5-119':{id:'xy5-119',name:'Bouffalant',kind:'pokemon',stage:'Basic',hp:210,types:['Colorless'],battleEnabled:true,attacks:[{name:'Derail',cost:[],damage:80,effect:{type:'neoRule',rule:'xy5:derail'}}]},
 'xy5-121':{id:'xy5-121',name:'Bunnelby',kind:'pokemon',stage:'Basic',hp:210,types:['Colorless'],battleEnabled:true,attacks:[{name:'Rototiller',cost:[],damage:0,effect:{type:'neoRule',rule:'xy5:rototiller'}}]},
 'test-ex':{id:'test-ex',name:'Blaziken-EX',kind:'pokemon',stage:'Basic',hp:240,types:['Fire'],pokemonEX:true,battleEnabled:true,attacks:[]},
 'test-double':{id:'test-double',name:'Double Colorless Energy',kind:'energy',specialEnergy:true,subtype:'Colorless',energyType:'Colorless',effect:{type:'specialEnergy',provides:{Colorless:2}},battleEnabled:true},
 'test-wonder':{id:'test-wonder',name:'Wonder Energy',kind:'energy',specialEnergy:true,subtype:'Fairy',energyType:'Fairy',effect:{type:'specialEnergy',provides:{Fairy:1}},battleEnabled:true},
});

test('Magcargo and Bidoof conditional attack damage uses actual EX/type predicates',()=>withCards(()=>{
 const s=scene();s.sides.player.active=mk('xy5-24','m');s.sides.opponent.active=mk('test-ex','ex');
 use(s,'player',a=>a.type==='attack');assert.equal(s.sides.opponent.active.damage,140);
 const t=scene();t.sides.player.active=mk('xy5-117','b');t.sides.opponent.active=mk('test-ex','ex2');
 t.sides.player.active.energy.Water=1;use(t,'player',a=>a.type==='attack');assert.equal(t.sides.opponent.active.damage,40);
}));

test('Dwindling Wave subtracts 10 for each actual damage counter on attacker',()=>withCards(()=>{
 const s=scene();s.sides.player.active=mk('xy5-104','az');s.sides.player.active.damage=30;
 use(s,'player',a=>a.type==='attack');assert.equal(s.sides.opponent.active.damage,70);
}));

test('Powerful Storm counts Energy units including Double Colorless, on all own Pokémon',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active=mk('xy5-50','h');p.bench=[mk('test-normal','b1',0)];
 p.active.energy.Water=1;p.bench[0].specialEnergy=[ref('test-double','dce')];
 use(s,'player',a=>a.type==='attack');assert.equal(s.sides.opponent.active.damage,60);
}));

test('Derail chooses and discards one real opponent Special Energy but preserves Basic',()=>withCards(()=>{
 const s=scene(),f=s.sides.opponent;s.sides.player.active=mk('xy5-119','b');
 f.active.energy.Water=1;f.active.specialEnergy=[ref('test-special','special1'),ref('test-double','special2')];
 use(s,'player',a=>a.type==='attack');assert.equal(f.active.damage,80);
 assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.options.length,2);
 choose(s,1);assert.equal(f.active.energy.Water,1);
 assert.equal(f.active.specialEnergy.length,1);assert.equal(f.active.specialEnergy[0].uid,'special1');
 assert.ok(f.discard.some(r=>r.uid==='special2'));assert.equal(s.phase,'battle');
}));

test('Rototiller shuffles selected physical discard ref into deck and never generates duplicates',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active=mk('xy5-121','b');p.discard=[ref('test-item','discard-item'),ref('test-water','discard-water')];
 p.deck=[ref('test-normal','deckcard')];
 use(s,'player',a=>a.type==='attack');assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.options.length,2);
 choose(s,0);assert.equal(s.phase,'battle');assert.equal(p.discard.length,1);
 assert.ok(p.deck.some(r=>r.uid==='discard-item'));
 assert.equal([...p.discard,...p.deck].filter(r=>r.uid==='discard-item').length,1);
}));

test('Sparkling Ripples and Unruly Claw optional choices permit decline without moving cards',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active=mk('base-44','milbase');p.hand=[ref('xy5-44','mil')];p.discard=[ref('test-item','discard')];
 use(s,'player',a=>a.type==='evolve'&&a.cardId==='xy5-44'&&a.target==='active');
 assert.equal(s.pendingChoice.options.at(-1),'Do not return a card');choose(s,s.pendingChoice.options.length-1);
 assert.ok(p.discard.some(r=>r.uid==='discard'));assert.ok(!p.hand.some(r=>r.uid==='discard'));
 const t=scene(),q=t.sides.player,f=t.sides.opponent;q.active=mk('base-92','cr');q.hand=[ref('xy5-92','cw')];f.active.energy.Water=1;
 use(t,'player',a=>a.type==='evolve'&&a.cardId==='xy5-92'&&a.target==='active');
 assert.equal(t.phase,'effectChoice');choose(t,t.pendingChoice.options.length-1);assert.equal(f.active.energy.Water,1);
}));

test('Official 164-print CI catalogue preserves all 13 mapped printed Abilities and never silently enables an unsupported printed attack',{skip:!fs.existsSync(path.join(root,'data/classic/xy5-print-compact.json'))},()=>{
 const primal=require(path.join(assets,'tcg-classic-primal-clash.js'));
 const rows=JSON.parse(fs.readFileSync(path.join(root,'data/classic/xy5-print-compact.json'),'utf8'));
 assert.equal(rows.length,164);assert.equal(primal.CARDS.length,164);
 const by=Object.fromEntries(primal.CARDS.map(c=>[c.number,c]));
 const printed=rows.reduce((n,row)=>n+row[8].length,0);
 assert.equal(printed,13);
 for(const row of rows){const c=by[String(row[0])];assert.ok(c,`print ${row[0]}`);
  if(row[8].length){assert.equal(c.abilities?.length,row[8].length,`Ability mapping ${c.id} ${c.name}: ${JSON.stringify(c.support.reasons)}`);
   for(const a of c.abilities)assert.deepEqual(effects.validateEffect(a.effect),[],`${c.id} ${a.name}`);}
  if(c.battleEnabled){for(const a of c.attacks||[])assert.notEqual(a.effect?.type,'unsupported',`${c.id} ${a.name}`);}
 }
 // The Omega Barrier blanket protection has NOT been proven on every
 // earlier bespoke Trainer handler. Leave its prints unavailable.
 for(const c of primal.CARDS.filter(c=>c.ancientTrait?.name==='Ω Barrier')){
  assert.equal(c.battleEnabled,false,`Unverified Ω Barrier: ${c.id}`);
  assert.equal(c.deckEligible,false,`Unsafe CPU inclusion: ${c.id}`);
 }
 for(const n of ['24','43','50','104','117','119','121']){
  const c=by[n];assert.ok(c);for(const a of c.attacks)assert.notEqual(a.effect?.type,'unsupported',`${n} ${a.name}`);
 }
});

test('Derail cannot discard Fairy Wonder Energy because it prevents opposing attack effects',()=>withCards(()=>{
 catalog['xy5-144']={id:'xy5-144',name:'Wonder Energy',kind:'energy',specialEnergy:true,energyType:'Fairy',subtype:'Fairy',battleEnabled:true,effect:{type:'specialEnergy',provides:{Fairy:1}}};
 catalog['test-fairy']={id:'test-fairy',name:'Clefairy',kind:'pokemon',stage:'Basic',hp:210,types:['Fairy'],battleEnabled:true,attacks:[]};
 const s=scene(),f=s.sides.opponent;s.sides.player.active=mk('xy5-119','b');
 f.active=mk('test-fairy','f');f.active.specialEnergy=[ref('xy5-144','protect')];
 use(s,'player',a=>a.type==='attack');assert.equal(f.active.damage,80);
 assert.equal(s.phase,'battle','prevented discard must not ask for an illegal effect choice');
 assert.equal(f.active.specialEnergy.length,1);assert.equal(f.active.specialEnergy[0].uid,'protect');
}));
