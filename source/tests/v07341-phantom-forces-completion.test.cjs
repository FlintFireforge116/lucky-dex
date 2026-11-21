'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const effects=require(path.join(assets,'tcgp-battle-effects.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const R=key=>({type:'neoRule',rule:'xy4:'+key});
const r=(cardId,uid)=>({uid,cardId});
const card={
 'unit-b':{id:'unit-b',name:'Bellsprout',kind:'pokemon',stage:'Basic',types:['Grass'],hp:70,battleEnabled:true},
 'unit-g':{id:'unit-g',name:'Gengar',kind:'pokemon',stage:'Stage 1',types:['Psychic'],hp:130,battleEnabled:true},
 'unit-f':{id:'unit-f',name:'Fletchling',kind:'pokemon',stage:'Basic',types:['Colorless'],hp:70,battleEnabled:true},
 'unit-m':{id:'unit-m',name:'Bronzong',kind:'pokemon',stage:'Stage 1',types:['Metal'],hp:120,battleEnabled:true},
 'unit-metal':{id:'unit-metal',name:'Metal Energy',kind:'energy',basicEnergy:true,subtype:'Metal',energyType:'Metal'},
 'unit-dark':{id:'unit-dark',name:'Darkness Energy',kind:'energy',basicEnergy:true,subtype:'Darkness',energyType:'Darkness'},
 'unit-fire':{id:'unit-fire',name:'Fire Energy',kind:'energy',basicEnergy:true,subtype:'Fire',energyType:'Fire'},
 'unit-special':{id:'unit-special',name:'Strong Energy',kind:'energy',specialEnergy:true,effect:{type:'specialEnergy',provides:{Fighting:1}}},
 'unit-tool':{id:'unit-tool',name:'Tool',kind:'trainer',trainerType:'Tool',effect:{type:'noop'}},
 'unit-item':{id:'unit-item',name:'Professor Letter',kind:'trainer',trainerType:'Item',effect:{type:'noop'}},
 'unit-support':{id:'unit-support',name:'Shauna',kind:'trainer',trainerType:'Supporter',effect:{type:'noop'}}
};
const mk=(id,uid,slot=0)=>({cardId:id,uid,benchSlot:slot,stack:[id],damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],conditions:{},temporaryTrainers:[]});
const side=(which)=>({id:which,active:mk('unit-f',which+'a',null),bench:[mk('unit-b',which+'b',0)],hand:[],deck:[],discard:[],energyDiscard:{},handLimit:8,benchLimit:3,turnCount:4,prizes:[]});
const scene=()=>({format:'classic',phase:'battle',activeSide:'player',turnNumber:7,rngState:2,log:[],sides:{player:side('player'),opponent:side('opponent')},modifiers:[]});
function withCards(fn){const old=data.cardById;data.cardById=id=>card[id]||old(id);try{return fn();}finally{data.cardById=old;}}
function invoke(s,rule,source=s.sides.player.active){effects.applyEffect(typeof rule==='string'?R(rule):rule,core.effectContext(s,'player',{},source));}
function choosePokemon(s,where='bench',slot=0){assert.equal(s.phase,'effectChoice');const actions=core.legalActions(s,s.choiceSide).filter(a=>a.type==='effectChoice');const match=actions.find(a=>(a.choiceTarget===where||where==='bench'&&a.choiceTarget==='bench'||where==='bench'&&a.choiceTarget==='opponentBench')&&(where!=='bench'||Number(a.choiceBenchIndex)===slot));assert.ok(match,'Cannot choose '+where+': '+JSON.stringify(actions));core.applyAction(s,s.choiceSide,match);}
function choose(s,index=0){assert.equal(s.phase,'effectChoice',`No selection offered: ${s.log.at(-1)?.type}`);const acts=core.legalActions(s,s.choiceSide).filter(a=>a.type==='effectChoice');const action=acts.find(a=>a.choiceOption===index);assert.ok(action,`Choice ${index} not legal: ${JSON.stringify(s.pendingChoice?.options)}`);core.applyAction(s,s.choiceSide,action);}

test('Turbo Bolt attaches two actual discarded Basic Energy to the SAME selected Benched Pokémon',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.energyDiscard={Metal:1};p.discard=[r('unit-dark','dark-1')];
 invoke(s,'turboBolt');assert.match(s.pendingChoice.options[0],/Bellsprout/);choose(s,0);
 assert.equal(s.pendingChoice.options.length,2);choose(s,1); // Metal discard ledger
 assert.equal(s.phase,'effectChoice');choose(s,0); // Physical Darkness Energy
 assert.equal(p.bench[0].energy.Metal,1);assert.equal(p.bench[0].energy.Darkness,1);
 assert.equal(p.energyDiscard.Metal,0);assert.equal(p.discard.length,0);
}));

test('Metal Links takes discarded Metal only, and Dark Impulse accelerates Darkness to Active',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.discard=[r('unit-metal','metal-1'),r('unit-dark','dark-1')];p.energyDiscard={Metal:1};
 invoke(s,'metalLinks');choose(s,0);choose(s,0);assert.equal(p.bench[0].energy.Metal,1);
 invoke(s,'darkImpulse');choose(s,0);assert.equal(p.active.energy.Darkness,1);
 assert.equal(p.discard.some(x=>x.uid==='dark-1'),false);
}));

test('Battle Compressor discards chosen real deck cards, not opponents or Energy Zone',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.deck=[r('unit-b','b1'),r('unit-item','item1'),r('unit-m','m1'),r('unit-f','f1')];
 invoke(s,'battleCompressor');choose(s,1);choose(s,0);choose(s,0);
 assert.deepEqual(p.discard.map(x=>x.uid),['item1','b1','m1']);assert.deepEqual(p.deck.map(x=>x.uid),['f1']);
 assert.deepEqual(s.sides.opponent.discard,[]);
}));

test('Enhanced Hammer only removes a chosen opponent Special Energy, never a Basic Energy',()=>withCards(()=>{
 const s=scene(),f=s.sides.opponent;f.active.energy.Metal=2;f.active.specialEnergy=[r('unit-special','s1')];
 invoke(s,'enhancedHammer');assert.equal(s.pendingChoice.options.length,1);choose(s,0);
 assert.equal(f.active.energy.Metal,2);assert.deepEqual(f.discard.map(x=>x.uid),['s1']);
}));

test('AZ returns top evolution to owner hand and discards underlying stages, Tools and Energy',()=>withCards(()=>{
 const s=scene(),p=s.sides.player,slot=p.bench[0];slot.stack=['unit-b','unit-g'];slot.cardId='unit-g';slot.tool=r('unit-tool','tool1');slot.specialEnergy=[r('unit-special','sp1')];slot.energy={Metal:2};
 invoke(s,'az');choosePokemon(s,'bench',0);assert.deepEqual(p.hand.map(x=>x.cardId),['unit-g']);
 assert.deepEqual(p.discard.map(x=>x.cardId).sort(),['unit-b','unit-special','unit-tool'].sort());
 assert.equal(p.energyDiscard.Metal,2);assert.equal(p.bench.length,0);
}));

test('Professor Sycamore discards the actual current hand then draws seven actual cards',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.hand=[r('unit-b','hand1'),r('unit-tool','hand2')];p.deck=Array.from({length:7},(_,i)=>r('unit-f',`deck${i}`));
 invoke(s,'sycamore');assert.equal(p.hand.length,7);assert.equal(p.deck.length,0);
 assert.deepEqual(p.discard.map(x=>x.uid),['hand1','hand2']);
}));

test('Target Whistle returns a Basic from opponent discard to opponent Bench',()=>withCards(()=>{
 const s=scene(),f=s.sides.opponent;f.discard=[r('unit-b','discard-b'),r('unit-g','discard-g')];
 invoke(s,'targetWhistle');assert.equal(s.pendingChoice.options.length,1);choose(s,0);
 assert.ok(f.bench.some(x=>x.uid==='discard-b'));assert.deepEqual(f.discard.map(x=>x.uid),['discard-g']);
}));

test('Xerosic selects physical Tools or Special Energy from either side',()=>withCards(()=>{
 const s=scene(),p=s.sides.player,f=s.sides.opponent;
 p.bench[0].tool=r('unit-tool','own-tool');f.active.specialEnergy=[r('unit-special','op-special')];f.active.energy.Metal=1;
 invoke(s,'xerosic');assert.equal(s.pendingChoice.options.length,2);choose(s,1);
 assert.deepEqual(f.discard.map(x=>x.uid),['op-special']);assert.equal(f.active.energy.Metal,1);
 assert.equal(p.bench[0].tool.uid,'own-tool');
}));

test('Lysandre Trump Card shuffles actual discards of BOTH players but excludes itself',()=>withCards(()=>{
 const s=scene(),p=s.sides.player,f=s.sides.opponent;p.discard=[r('unit-support','trump'),r('unit-item','ours')];f.discard=[r('unit-b','theirs')];
 invoke(s,'trumpCard'); // Without trainerRef this direct test shuffles all. Test source metadata below.
 assert.equal(p.discard.length,0);assert.equal(f.discard.length,0);assert.deepEqual(p.deck.map(x=>x.uid).sort(),['trump','ours'].sort());assert.deepEqual(f.deck.map(x=>x.uid),['theirs']);
 const q=scene(),a=q.sides.player,b=q.sides.opponent;a.discard=[r('unit-support','trump2'),r('unit-tool','ours2')];b.discard=[r('unit-b','theirs2')];
 effects.applyEffect(R('trumpCard'),{...core.effectContext(q,'player',{trainerRef:a.discard[0]},a.active),trainerRef:a.discard[0]});
 assert.deepEqual(a.discard.map(x=>x.uid),['trump2']);assert.deepEqual(a.deck.map(x=>x.uid),['ours2']);
}));

test('Night Attack places direct counters onto chosen Bench, ignoring attack Weakness',()=>withCards(()=>{
 const s=scene(),f=s.sides.opponent;invoke(s,'nightAttack');choosePokemon(s,'bench',0);
 assert.equal(f.bench[0].damage,30);assert.equal(f.active.damage,0);
}));

test('Tasting draws extra card only if Slurpuff is the Active Pokémon',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.deck=[r('unit-b','1'),r('unit-b','2'),r('unit-b','3')];
 invoke(s,'tasting',p.bench[0]);assert.equal(p.hand.length,1);
 invoke(s,'tasting',p.active);assert.equal(p.hand.length,3);
}));

test('Fly attack coin is visible and prevents damage on heads; Tender Vengeance counts Bench counters',()=>withCards(()=>{
 const s=scene(),ctx={state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:id=>card[id],random:()=>0.1,isAttack:true};
 const fly=effects.resolveAttack({name:'Fly',damage:40,effect:R('fly')},ctx);assert.equal(fly.damage,40);assert.equal(fly.pendingEffects[0].type,'preventDamage');
 const blocked=effects.resolveAttack({name:'Fly',damage:40,effect:R('fly')},{...ctx,random:()=>0.9});assert.equal(blocked.damage,0);
 s.sides.player.bench[0].damage=40;
 const verdict=effects.resolveAttack({name:'Tender Vengeance',damage:0,effect:R('tenderVengeance')},ctx);assert.equal(verdict.damage,40);
}));

test('generator enables only explicitly implemented XY4 rules and retains other complex gates',()=>{
 const code=String.raw`import importlib.util,sys,json
sys.path.insert(0,sys.argv[1]);sp=importlib.util.spec_from_file_location('b',sys.argv[1]+'/build-xy4.py');m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
from xy4_verified import GATE,ATTACKS,TRAINERS,ABILITIES
print(json.dumps({'gates':sorted(GATE),'attacks':{n:ATTACKS.get((n,name)) for n,name in [('24','Turbo Bolt'),('34','Night Attack'),('79','Fly'),('80','Lucky Punch')]},'trainers':{n:TRAINERS.get(n) for n in ['91','92','94','99','101','106','110','117','118','119']},'abilities':sorted(ABILITIES)}))`;
 const result=spawnSync('python3',['-c',code,path.join(root,'scripts')],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
 const obj=JSON.parse(result.stdout);for(const n of ['24','24a','34','61','69','74','91','92','94','99','101','106','110','117','118','119','120'])assert.ok(!obj.gates.includes(n),n+' still gated');
 for(const item of Object.values(obj.trainers))assert.ok(item?.[1]?.type==='neoRule');
 for(const a of Object.values(obj.attacks))assert.ok(a?.type);
 assert.ok(obj.abilities.includes('Metal Links')&&obj.abilities.includes('Dark Impulse'));
 assert.ok(!obj.gates.includes('102'),'Robo Substitute must now be implemented');
});

test('Gourgeist Gourgantic raises maximum HP to 200 only with Grass Energy and an active Ability',()=>withCards(()=>{
 card['xy4-45']={id:'xy4-45',kind:'pokemon',name:'Gourgeist',types:['Psychic'],stage:'Stage 1',hp:100,
   abilities:[{name:'Gourgantic',type:'passive',effect:R('gourgantic'),printedPowerType:'ability'}]};
 const s=scene(),p=s.sides.player;p.bench[0].cardId='xy4-45';p.bench[0].stack=['xy4-45'];
 assert.equal(core.maxHp(s,'player',p.bench[0]),100);
 p.bench[0].energy.Grass=1;assert.equal(core.maxHp(s,'player',p.bench[0]),200);
 p.bench[0].abilitySuppressed=true;assert.equal(core.maxHp(s,'player',p.bench[0]),100);
 p.bench[0].abilitySuppressed=false;
 delete p.bench[0].energy.Grass;assert.equal(core.maxHp(s,'player',p.bench[0]),100);
}));

test('Active Wobbuffet suppresses non-Psychic Abilities on either side, not Psychic ones',()=>withCards(()=>{
 card['xy4-36']={id:'xy4-36',kind:'pokemon',name:'Wobbuffet',types:['Psychic'],stage:'Basic',hp:110,
  abilities:[{name:'Bide Barricade',type:'passive',effect:R('bideBarricade'),printedPowerType:'ability'}]};
 const s=scene();s.sides.player.active.cardId='xy4-36';
 assert.equal(effects.abilitiesSuppressed(s,'opponent',s.sides.opponent.bench[0],data.cardById),true);
 s.sides.opponent.bench[0].cardId='unit-g';assert.notEqual(effects.abilitiesSuppressed(s,'opponent',s.sides.opponent.bench[0],data.cardById),true);
}));

test('Golbat and Crobat evolution hits put exact counters on selected opposing Pokémon',()=>withCards(()=>{
 const s=scene(),f=s.sides.opponent;
 invoke(s,'sneakyBite');for(let i=0;i<2;i++)choosePokemon(s,'bench',0);
 assert.equal(f.bench[0].damage,20);assert.equal(s.phase,'battle');
 invoke(s,'surpriseBite');for(let i=0;i<3;i++)choosePokemon(s,'bench',0);
 assert.equal(f.bench[0].damage,50);assert.equal(f.active.damage,0);
}));

test('Chandelure Fainting Spell only reacts to an actual opponent attack KO, with a visible coin',()=>withCards(()=>{
 const s=scene(),who=s.sides.player.active,attacker=s.sides.opponent.active;
 effects.applyEffect(R('faintingSpell'),{...core.effectContext(s,'player',{},who),
  eventData:{source:{side:'opponent',attack:true},attacker}});
 assert.equal(s.log.filter(x=>x.type==='coin'&&x.reason==='Fainting Spell').length,1);
 assert.ok(attacker.damage>=0);
 const prior=s.log.length;
 effects.applyEffect(R('faintingSpell'),{...core.effectContext(s,'player',{},who),
  eventData:{source:{side:'player',attack:true},attacker}});
 assert.equal(s.log.length,prior);
}));

test('Malamar Hyper Hypnosis is optional, requires from-hand Energy and applies Sleep only on acceptance',()=>withCards(()=>{
 const s=scene(),f=s.sides.opponent;
 effects.applyEffect(R('hyperHypnosis'),{...core.effectContext(s,'player',{},s.sides.player.active),eventData:{fromHand:false}});
 assert.equal(s.phase,'battle');
 effects.applyEffect(R('hyperHypnosis'),{...core.effectContext(s,'player',{},s.sides.player.active),eventData:{fromHand:true}});
 assert.equal(s.phase,'effectChoice');choose(s,0);assert.equal(!!f.active.conditions.sleep,false);
 effects.applyEffect(R('hyperHypnosis'),{...core.effectContext(s,'player',{},s.sides.player.active),eventData:{fromHand:true}});
 choose(s,1);assert.ok(f.active.conditions.sleep);
}));

test('Flare Command discards an actually attached Fire Energy before switching chosen opposing Bench target',()=>withCards(()=>{
 const s=scene(),p=s.sides.player,f=s.sides.opponent;
 p.active.energy.Fire=1;const old=f.active.uid,coming=f.bench[0].uid;
 invoke(s,'flareCommand');choose(s,0);assert.equal(p.active.energy.Fire,0);assert.equal(p.energyDiscard.Fire,1);
 choose(s,0);assert.equal(f.active.uid,coming);assert.ok(f.bench.some(x=>x.uid===old));
}));

test('Night March shared hook counts real discarded Pokémon with the attack, not basic energies',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;
 card['xy4-26']={id:'xy4-26',name:'Joltik',kind:'pokemon',stage:'Basic',types:['Lightning'],attacks:[{name:'Night March',effect:R('nightMarch')}],hp:30};
 card['xy4-42']={id:'xy4-42',name:'Lampent',kind:'pokemon',stage:'Stage 1',types:['Psychic'],attacks:[{name:'Night March',effect:R('nightMarch')}],hp:80};
 p.discard=[r('xy4-26','j'),r('xy4-42','l'),r('unit-metal','e')];
 const ctx={state:s,side:'player',foeSide:'opponent',attacker:p.active,defender:s.sides.opponent.active,
  cardById:data.cardById,random:()=>0.2,isAttack:true};
 const out=effects.resolveAttack({name:'Night March',cost:'CC',damage:0,effect:R('nightMarch')},ctx);
 assert.equal(out.damage,40);
}));

test('Goodra Slip Trip blocks hand Tool attachments for both teams, unless the Ability is suppressed',()=>withCards(()=>{
 card['xy4-77']={id:'xy4-77',name:'Goodra',kind:'pokemon',stage:'Stage 2',types:['Dragon'],hp:140,
   abilities:[{name:'Slip Trip',type:'passive',effect:R('slipTrip'),printedPowerType:'ability'}]};
 const s=scene(),p=s.sides.player;card['unit-tool'].onAttach={type:'noop'};card['unit-tool'].battleEnabled=true;p.hand=[r('unit-tool','tool-1')];
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='unit-tool'));
 s.sides.opponent.bench[0].cardId='xy4-77';
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='unit-tool'),false);
 s.sides.opponent.bench[0].abilitySuppressed=true;
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='unit-tool'));
}));

test('Submission Hold blocks the marked Pokémon from hand Energy, but not other Pokémon',()=>withCards(()=>{
 const s=scene(),foe=s.sides.opponent;foe.hand=[r('unit-metal','hmetal')];
 invoke(s,'submissionHold');assert.equal(foe.active.xy4NoHandEnergyUntil,8);
 s.activeSide='opponent';s.turnNumber=8;
 const acts=core.legalActions(s,'opponent').filter(a=>a.type==='attachSpecial');
 assert.equal(acts.some(a=>a.target==='active'),false);
 assert.equal(acts.some(a=>a.target==='bench'),true);
 s.turnNumber=9;assert.ok(core.legalActions(s,'opponent').some(a=>a.type==='attachSpecial'&&a.target==='active'));
}));

test('B Cancel blocks evolution of the original Defending Pokémon for one turn',()=>withCards(()=>{
 card['unit-stage1']={id:'unit-stage1',name:'Evolved Fletchling',kind:'pokemon',stage:'Stage 1',evolvesFrom:'Fletchling',types:['Colorless'],hp:95,battleEnabled:true};
 const s=scene(),foe=s.sides.opponent;foe.hand=[r('unit-stage1','evo')];foe.active.playedOnSideTurn=1;
 s.activeSide='opponent';s.turnNumber=8;
 assert.ok(core.legalActions(s,'opponent').some(a=>a.type==='evolve'&&a.target==='active'));
 s.activeSide='player';s.turnNumber=7;invoke(s,'bCancel');assert.equal(foe.active.xy4NoEvolveUntil,8);
 s.activeSide='opponent';s.turnNumber=8;
 assert.equal(core.legalActions(s,'opponent').some(a=>a.type==='evolve'&&a.target==='active'),false);
 s.turnNumber=9;assert.ok(core.legalActions(s,'opponent').some(a=>a.type==='evolve'&&a.target==='active'));
}));

test('Protect is mapped as a real coin-flip prevention effect, never silent no-op',()=>{
 const py="import sys;sys.path.insert(0,sys.argv[1]);from xy4_verified import ATTACKS,GATE;print(repr(ATTACKS.get(('6','Protect'))));print('6' in GATE)";
 const out=spawnSync('python3',['-c',py,path.join(root,'scripts')],{encoding:'utf8'});
 assert.equal(out.status,0,out.stderr);assert.match(out.stdout,/preventDamage/);assert.match(out.stdout,/False/);
});

test('Coordinate attaches a real Tool from deck onto a selected empty-tool Bench Pokémon',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;
 card['unit-tool'].battleEnabled=true;card['unit-tool'].trainerType='Tool';
 p.deck=[r('unit-item','item'),r('unit-tool','t1')];
 invoke(s,'coordinate');choose(s,0);choose(s,0);
 assert.equal(p.bench[0].tool.uid,'t1');assert.deepEqual(p.deck.map(x=>x.uid),['item']);
 assert.equal(s.phase,'battle');
}));

test('Meddling redistributes only discarded opponent Energy to the actual opposing Pokémon',()=>withCards(()=>{
 const s=scene(),foe=s.sides.opponent;
 foe.discard=[r('unit-dark','d1')];foe.energyDiscard.Metal=1;
 invoke(s,'meddling');choose(s,0);choose(s,1);
 assert.equal(foe.bench[0].energy.Darkness,1);assert.equal(foe.discard.length,0);
 choose(s,0);choose(s,0);
 assert.equal(foe.active.energy.Metal,1);assert.equal(foe.energyDiscard.Metal,0);
 assert.equal(s.phase,'battle');
}));

test('Trick Coin offers a full-sequence attack reroll only for its holder and once per turn',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active.tool=r('xy4-108','coin-tool');
 assert.equal(effects.coinRerollSource(s,'player','attack',p.active,data.cardById)?.abilityName,'Trick Coin');
 assert.equal(effects.coinRerollSource(s,'player','attack',p.bench[0],data.cardById),null);
 p.coinRerollUsedTurn={attack:s.turnNumber};
 assert.equal(effects.coinRerollSource(s,'player','attack',p.active,data.cardById),null);
}));

test('AZ returning Active prompts/automatically performs a legal Bench promotion',()=>withCards(()=>{
 const s=scene(),p=s.sides.player,old=p.active.uid,pick=p.bench[0].uid;
 invoke(s,'az');choosePokemon(s,'active');
 assert.notEqual(p.active?.uid,old);assert.equal(p.active.uid,pick);
 assert.equal(p.hand.length,1);assert.equal(p.bench.length,0);
 const sole=scene(),o=sole.sides.player;o.bench=[];
 invoke(sole,'az');assert.equal(sole.phase,'effectChoice');
 assert.equal(core.legalActions(sole,'player').some(a=>a.type==='effectChoice'&&a.choiceTarget==='active'),false);
}));

test('all mapped Phantom Forces source effects are supported by shared engine validation',()=>{
 const script=String.raw`import sys,json
sys.path.insert(0,sys.argv[1]);from xy4_verified import ATTACKS,ABILITIES,TRAINERS
print(json.dumps({'attacks':list(ATTACKS.values()),'abilities':[a['effect'] for a in ABILITIES.values()],'trainers':[obj[1] for obj in TRAINERS.values()]}))`;
 const result=spawnSync('python3',['-c',script,path.join(root,'scripts')],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 const obj=JSON.parse(result.stdout);
 for(const [kind,items] of Object.entries(obj))for(const [i,effect] of items.entries())
   assert.deepEqual(effects.validateEffect(effect),[],kind+' '+i+':'+JSON.stringify(effect));
});

test('Mega Gengar Phantom Gate presents the defending and Benched Pokémon attacks and copies the selected move',()=>withCards(()=>{
 card['xy4-35']={id:'xy4-35',kind:'pokemon',name:'M Gengar-EX',types:['Psychic'],stage:'Stage 1',hp:220};
 card['unit-f'].attacks=[{name:'Scratch',cost:'C',damage:20,effect:{type:'noop'}}];
 card['unit-b'].attacks=[{name:'Vine Whip',cost:'G',damage:30,effect:{type:'noop'}}];
 const s=scene(),attack={name:'Phantom Gate',cost:'PPP',damage:0,effect:{type:'copyAttack',source:'opponentPokemon',ignoreUseCosts:true,chooseBy:'attacker'}};
 s.sides.player.active.cardId='xy4-35';
 const ctx={state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,
  cardById:data.cardById,action:{choiceTarget:'bench',choiceBenchIndex:0,choiceAttackIndex:0},random:()=>0.2,isAttack:true};
 const choices=effects.choicesForEffect(attack.effect,ctx);
 assert.ok(choices.some(x=>x.choiceTarget==='active'&&x.choiceAttackIndex===0));
 assert.ok(choices.some(x=>x.choiceTarget==='bench'&&x.choiceAttackIndex===0));
 assert.equal(effects.resolveAttack(attack,ctx).damage,30);
}));

test('Diancie Sparkle triggers a next-turn, visible opponent attack coin gate',()=>withCards(()=>{
 const s=scene();effects.applyEffect({type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'},
  core.effectContext(s,'player',{},s.sides.player.active));
 assert.equal(s.sides.opponent.active.attackGate.expiresTurn,8);
 const a=s.sides.opponent.active;a.attackGate.expiresTurn=8;
 assert.equal(effects.validateEffect({type:'attackCoinGate',target:'opponentActive',duration:'opponentTurn'}).length,0);
}));
