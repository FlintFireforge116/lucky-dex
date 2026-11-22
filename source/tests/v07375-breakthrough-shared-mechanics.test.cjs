'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),path=require('node:path');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const data=require('../app/src/main/assets/tcgp-battle-data.js');
const py=(code)=>{const r=spawnSync('python3',['-c',code,path.resolve(__dirname,'../scripts')],{encoding:'utf8',maxBuffer:1024*1024});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout)};
const mapping=py(`import sys,json;sys.path.insert(0,sys.argv[1]);import xy8_verified as x
print(json.dumps({'attacks':{'%s:%s'%k:v for k,v in x.ATTACKS.items()},'abilities':x.ABILITIES,'trainers':x.TRAINERS}))`);
const effect=(n,name)=>mapping.attacks[`${n}:${name}`];
const cards={
 'p':{id:'p',name:'Pikachu',kind:'pokemon',stage:'Basic',hp:180,retreat:1,types:['Lightning']},
 's':{id:'s',name:'Swinub',kind:'pokemon',stage:'Basic',hp:60,retreat:1,types:['Water']},
 'pi':{id:'pi',name:'Piloswine',kind:'pokemon',stage:'Stage 1',hp:110,retreat:3,types:['Fighting']},
 'm':{id:'m',name:'Mamoswine',kind:'pokemon',stage:'Stage 2',hp:160,retreat:4,types:['Fighting']},
 'f':{id:'f',name:'Flabébé',kind:'pokemon',stage:'Basic',hp:80,retreat:1,types:['Fairy']},
 'w':{id:'w',name:'Wobbuffet',kind:'pokemon',stage:'Basic',hp:180,retreat:2,types:['Psychic']},
 'xy8-94':{id:'xy8-94',name:'Yveltal',kind:'pokemon',stage:'Basic',hp:130,retreat:2,types:['Darkness'],abilities:[{name:'Fright Night',...mapping.abilities['Fright Night']}]},
 'xy8-97':{id:'xy8-97',name:'Mr. Mime',kind:'pokemon',stage:'Basic',hp:70,retreat:1,types:['Psychic'],abilities:[{name:'Bench Barrier',...mapping.abilities['Bench Barrier']}]},
 'xy8-103':{id:'xy8-103',name:'Florges',kind:'pokemon',stage:'Stage 2',hp:120,retreat:2,types:['Fairy'],abilities:[{name:'Calming Aroma',...mapping.abilities['Calming Aroma']}]},
 'xy8-70':{id:'xy8-70',name:'Cresselia',kind:'pokemon',stage:'Basic',hp:120,retreat:2,types:['Psychic'],abilities:[{name:'My Way',...mapping.abilities['My Way']}]},
 'xy8-51':{id:'xy8-51',name:'Magnemite',kind:'pokemon',stage:'Basic',hp:60,retreat:3,types:['Lightning'],abilities:[{name:'Sparkling Induction',...mapping.abilities['Sparkling Induction']}]},
 'xy8-133':{id:'xy8-133',kind:'trainer',trainerType:'Tool',name:'Assault Vest',effect:mapping.trainers['133'][1]},
 'xy8-137':{id:'xy8-137',kind:'trainer',trainerType:'Tool',name:'Float Stone',effect:mapping.trainers['137'][1]},
 'xy8-139':{id:'xy8-139',kind:'trainer',trainerType:'Tool',name:'Glalie Spirit Link',effect:mapping.trainers['139'][1]},
 'xy8-142':{id:'xy8-142',kind:'trainer',trainerType:'Tool',name:'Houndoom Spirit Link',effect:mapping.trainers['142'][1]},
 'xy8-144':{id:'xy8-144',kind:'trainer',trainerType:'Tool',name:'Mewtwo Spirit Link',effect:mapping.trainers['144'][1]},
 'xy8-22':{id:'xy8-22',name:'M Houndoom-EX',kind:'pokemon',stage:'Stage 1',hp:210,types:['Fire'],retreat:2,megaEvolution:true,pokemonEX:true,battleEnabled:true,evolvesFrom:'Houndoom-EX',attacks:[{name:'Inferno Fang',cost:'RRC',damage:80,effect:{type:'noop'}}]},
 'xy8-houndoom':{id:'xy8-houndoom',name:'Houndoom-EX',kind:'pokemon',stage:'Basic',hp:170,types:['Fire'],retreat:2,battleEnabled:true},
 'xy8-35':{id:'xy8-35',name:'M Glalie-EX',kind:'pokemon',stage:'Stage 1',hp:210,types:['Water'],retreat:3,megaEvolution:true,pokemonEX:true,battleEnabled:true,evolvesFrom:'Glalie-EX'},
 'xy8-glalie':{id:'xy8-glalie',name:'Glalie-EX',kind:'pokemon',stage:'Basic',hp:170,types:['Water'],retreat:2,battleEnabled:true},
 'xy8-63':{id:'xy8-63',name:'M Mewtwo-EX',kind:'pokemon',stage:'Stage 1',hp:210,types:['Psychic'],retreat:2,megaEvolution:true,pokemonEX:true,battleEnabled:true,evolvesFrom:'Mewtwo-EX'},
 'xy8-mewtwo':{id:'xy8-mewtwo',name:'Mewtwo-EX',kind:'pokemon',stage:'Basic',hp:170,types:['Psychic'],retreat:2,battleEnabled:true}
};
const cardById=id=>cards[id]||data.cardById(id);
const mon=(id,uid=id)=>({uid,cardId:id,stack:[id],energy:{},specialEnergy:[],damage:0,conditions:{},playedOnSideTurn:0});
const scene=()=>({format:'classic',phase:'battle',turnNumber:7,activeSide:'player',log:[],modifiers:[],rules:{winMode:'prizes',benchSize:3},sides:{player:{active:mon('p','a'),bench:[],hand:[],deck:[],discard:[],energyDiscard:{},prizes:[],prizesTaken:0,turnCount:4,benchLimit:3},opponent:{active:mon('w','d'),bench:[],hand:[],deck:[],discard:[],energyDiscard:{},prizes:[],prizesTaken:0,turnCount:3,benchLimit:3}}});
const ctx=s=>({state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById,isAttack:true,random:()=>0.2});
const attack=(s,n,name,base=0)=>effects.resolveAttack({name,damage:base,effect:effect(n,name)},ctx(s));

test('new XY8 descriptors are valid shared engine effects, with no custom identity substitutions',()=>{
 const pairs=['30:Balance Bind','35:Cryo Mouth','45:Frigid Breath','45:Deep Freeze','60:Creep Show','63:Vanishing Strike','64:Psychic Infinity','79:Bone Revenge','81:Gathering Footsteps','82:Primordial Boom','107:Rainbow Force','114:Exhausted Tackle'];
 for(const pair of pairs){assert.deepEqual(effects.validateEffect(mapping.attacks[pair]),[],pair);}
 for(const [id,[kind,e]] of Object.entries(mapping.trainers)){assert.deepEqual(effects.validateEffect(e),[],id);if(['133','137','139','142','144'].includes(id))assert.equal(kind,'Tool',id);}
 for(const [name,a] of Object.entries(mapping.abilities))assert.deepEqual(effects.validateEffect(a.effect),[],name);
});
test('conditional damage only triggers at the printed threshold, and hand-drawn prizes are distinct from KO points',()=>{
 const s=scene();s.sides.player.active.damage=90;
 assert.equal(attack(s,35,'Cryo Mouth',100).damage,100);
 s.sides.player.active.damage=100;assert.equal(attack(s,35,'Cryo Mouth',100).damage,250);
 s.sides.opponent.points=4;s.sides.opponent.prizesTaken=2;
 assert.equal(attack(s,79,'Bone Revenge',20).damage,100);
 s.sides.opponent.prizesTaken=0;assert.equal(attack(s,79,'Bone Revenge',20).damage,20);
});
test('Starmie bench counts and Vanishing Strike Stadium conditions are symmetric',()=>{
 const s=scene();let r=attack(s,30,'Balance Bind',20);assert.equal(r.pendingEffects.length,1);
 s.sides.opponent.bench.push(mon('p','b'));r=attack(s,30,'Balance Bind',20);assert.equal(r.pendingEffects.length,0);
 s.stadium=null;r=attack(s,63,'Vanishing Strike',150);assert.equal(r.damage,150);assert.equal(!!r.damageRules.ignoreResistance,false);
 s.stadium={cardId:'anyStadium',ownerSide:'opponent'};r=attack(s,63,'Vanishing Strike',150);assert.equal(r.damage,200);assert.equal(r.damageRules.ignoreResistance,true);assert.equal(r.damageRules.ignoreEffects,true);
});
test('Psychic Infinity counts both Active Energy units but never applies Weakness',()=>{
 const s=scene();s.sides.player.active.energy={Psychic:2,Colorless:1};s.sides.opponent.active.energy={Water:2};
 const r=attack(s,64,'Psychic Infinity',10);assert.equal(r.damage,160);assert.equal(r.damageRules.ignoreWeakness,true);
});
test('Piloswine totals matching line retreat, Xerneas counts distinct Bench types',()=>{
 const s=scene();s.sides.player.active=mon('pi','a');s.sides.player.bench=[mon('s','b'),mon('m','c')];
 assert.equal(attack(s,81,'Gathering Footsteps',10).damage,90);
 s.sides.player.bench=[mon('f','b'),mon('p','c'),mon('w','e')];
 assert.equal(attack(s,107,'Rainbow Force',10).damage,100);
 s.sides.player.bench=[mon('f','b'),mon('f','c')];assert.equal(attack(s,107,'Rainbow Force',10).damage,40);
});
test('Gengar Creep Show queues KO only when opponent has three counters',()=>{
 const s=scene();s.sides.opponent.active.damage=20;
 assert.equal(attack(s,60,'Creep Show').pendingEffects.length,0);
 s.sides.opponent.active.damage=30;
 const r=attack(s,60,'Creep Show');assert.equal(r.pendingEffects[0]?.type,'knockOut');
 effects.applyEffect(r.pendingEffects[0],ctx(s));assert.equal(s.sides.opponent.active.damage,180);
});
test('Vanilluxe locks both players and both Trainer types through next owner turn; Deep Freeze respects coin outcome',()=>{
 const s=scene();const r=attack(s,45,'Frigid Breath');for(const e of r.pendingEffects)effects.applyEffect(e,ctx(s));
 for(const side of ['player','opponent']){
  const locks=s.sides[side].actionLocks;
  assert.equal(locks.length,2);assert.deepEqual(locks.map(x=>x.cardType),['Supporter','Stadium']);assert.ok(locks.every(x=>x.expiresTurn===9));
 }
 const heads=attack(s,45,'Deep Freeze').pendingEffects;assert.equal(heads[0].status,'paralysis');
 const tails=effects.resolveAttack({damage:0,effect:effect('45','Deep Freeze')},{...ctx(s),random:()=>0.9}).pendingEffects;assert.equal(tails[0].status,'confusion');
});
test('Mamoswine Stadium ownership selects either +40 damage or 40 healing, not both',()=>{
 const s=scene();s.sides.player.active.damage=60;
 s.stadium={cardId:'stadium',ownerSide:'player'};
 let r=attack(s,82,'Primordial Boom',60);assert.equal(r.damage,100);assert.equal(r.pendingEffects.length,0);
 s.stadium.ownerSide='opponent';r=attack(s,82,'Primordial Boom',60);assert.equal(r.damage,60);assert.equal(r.pendingEffects[0]?.type,'heal');effects.applyEffect(r.pendingEffects[0],ctx(s));assert.equal(s.sides.player.active.damage,20);
});
test('Meowth hits opponent only on heads and deals self damage on tails',()=>{
 const s=scene();assert.equal(attack(s,114,'Exhausted Tackle').damage,30);
 const r=effects.resolveAttack({damage:0,effect:effect('114','Exhausted Tackle')},{...ctx(s),random:()=>0.9});assert.equal(r.damage,0);assert.equal(r.pendingEffects[0].type,'selfDamage');
});
test('Tool and Ability passives use shared modifiers, including Bench-only guarding and Fairy reduction',()=>{
 const s=scene(),a=s.sides.player.active;
 a.tool={uid:'fs',cardId:'xy8-137'};
 assert.equal(effects.modifierAmount(s,'player',a,'retreatCost',cardById),-99);
 a.tool=null;s.sides.player.active=mon('xy8-70','a');s.stadium={cardId:'stadium',ownerSide:'player'};
 assert.equal(effects.modifierAmount(s,'player',s.sides.player.active,'retreatCost',cardById),-99);
 s.stadium=null;assert.equal(effects.modifierAmount(s,'player',s.sides.player.active,'retreatCost',cardById),0);
 s.sides.player.active=mon('xy8-51','a');s.sides.player.bench=[mon('xy8-51','b'),mon('xy8-51','c')];
 assert.equal(effects.modifierAmount(s,'player',s.sides.player.active,'retreatCost',cardById),-2);
 s.sides.player.active=mon('p','a');s.sides.player.bench=[mon('xy8-97','m'),mon('f','b')];
 assert.equal(effects.modifierAmount(s,'player',s.sides.player.active,'damageReduction',cardById),0);
 assert.equal(effects.modifierAmount(s,'player',s.sides.player.bench[1],'damageReduction',cardById),999);
 s.sides.player.bench=[mon('xy8-103','m')];assert.equal(effects.modifierAmount(s,'player',s.sides.player.active,'attackCostFairy',cardById),-1);
 s.sides.player.active.tool={uid:'av',cardId:'xy8-133'};assert.equal(effects.modifierAmount(s,'player',s.sides.player.active,'damageReduction',cardById),0);
 s.sides.opponent.active.specialEnergy=[{uid:'special',cardId:'special'}];assert.equal(effects.modifierAmount(s,'player',s.sides.player.active,'damageReduction',cardById),40);
 s.sides.opponent.active=mon('xy8-94','y');assert.equal(effects.toolEffectsSuppressed(s,cardById),true);
});
test('Spirit Links use the existing Mega evolution turn-ending exemption, not a new mechanic',()=>{
 const src=require('node:fs').readFileSync(path.resolve(__dirname,'../app/src/main/assets/tcgp-battle-core.js'),'utf8');
 for(const [mega,link] of [['xy8-35','xy8-139'],['xy8-22','xy8-142'],['xy8-63','xy8-144']])assert.ok(src.includes(`'${mega}'`)&&src.includes(`'${link}'`));
});
