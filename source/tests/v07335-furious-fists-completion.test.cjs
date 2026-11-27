'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const effects=require(path.join(assets,'tcgp-battle-effects.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const R=k=>({type:'neoRule',rule:'xy3:'+k});
const C={
 'xy3-4':{id:'xy3-4',name:'Heracross-EX',kind:'pokemon',types:['Grass'],hp:170,pokemonEX:true,stage:'Basic'},
 'xy3-5':{id:'xy3-5',name:'M Heracross-EX',kind:'pokemon',types:['Grass'],hp:220,pokemonEX:true,stage:'Stage 1'},
 'xy3-18':{id:'xy3-18',name:'Politoed',kind:'pokemon',types:['Water'],hp:130,stage:'Stage 2',abilities:[{type:'passive',effect:R('kingsSong')}]},
 'xy3-46':{id:'xy3-46',name:'Machamp',kind:'pokemon',types:['Fighting'],hp:140,stage:'Stage 2',abilities:[{type:'passive',effect:R('fightingFury')}]},
 'xy3-63':{id:'xy3-63',name:'Hawlucha',kind:'pokemon',types:['Fighting'],hp:70,stage:'Basic'},
 'xy3-52':{id:'xy3-52',name:'Hariyama',kind:'pokemon',types:['Fighting'],hp:120,stage:'Stage 1'},
 'xy3-26':{id:'xy3-26',name:'Aurorus',kind:'pokemon',types:['Water'],hp:130,stage:'Stage 1'},
 'xy3-73':{id:'xy3-73',name:'Klefki',kind:'pokemon',types:['Fairy'],hp:70,stage:'Basic'},
 'xy3-55':{id:'xy3-55',name:'M Lucario-EX',kind:'pokemon',types:['Fighting'],hp:220,pokemonEX:true,stage:'Stage 1'},
 'xy3-20':{id:'xy3-20',name:'Seismitoad-EX',kind:'pokemon',types:['Water'],hp:180,pokemonEX:true,stage:'Basic'},
 'xy3-25':{id:'xy3-25',name:'Amaura',kind:'pokemon',types:['Water'],hp:90,stage:'Restored'},
 'xy3-61':{id:'xy3-61',name:'Tyrunt',kind:'pokemon',types:['Fighting'],hp:90,stage:'Restored'},
 'xy3-90':{id:'xy3-90',name:'Fighting Stadium',kind:'trainer',trainerType:'Stadium'},
 'xy3-91':{id:'xy3-91',name:'Focus Sash',kind:'trainer',trainerType:'Tool'},
 'xy3-97':{id:'xy3-97',name:'Mountain Ring',kind:'trainer',trainerType:'Stadium'},
 'xy3-99':{id:'xy3-99',name:'Sparkling Robe',kind:'trainer',trainerType:'Tool'},
 'xy3-102':{id:'xy3-102',name:'Training Center',kind:'trainer',trainerType:'Stadium'},
 'xy3-103':{id:'xy3-103',name:'Herbal Energy',kind:'energy',specialEnergy:true,subtype:'Grass',effect:{type:'specialEnergy',provides:{Grass:1}}},
 'xy3-104':{id:'xy3-104',name:'Strong Energy',kind:'energy',specialEnergy:true,subtype:'Fighting',effect:{type:'specialEnergy',provides:{Fighting:1}}},
 'test-water':{id:'test-water',name:'Water Energy',kind:'energy',basicEnergy:true,subtype:'Water'},
 'test-grass':{id:'test-grass',name:'Grass Energy',kind:'energy',basicEnergy:true,subtype:'Grass'},
 'test-item':{id:'test-item',name:'Potion',kind:'trainer',trainerType:'Item'},
 'test-fire':{id:'test-fire',name:'Fire Attacker',kind:'pokemon',types:['Fire'],hp:150,stage:'Basic'},
 'test-wild':{id:'test-wild',name:'Wild Target',kind:'pokemon',types:['Grass'],hp:150,weakness:'Fighting',weaknessValue:'×2',resistance:'Fighting',resistanceValue:'-20',stage:'Basic'},
};
const cardById=id=>C[id]||data.cardById(id);
const ref=(cardId,uid=cardId)=>({cardId,uid});
const mon=(cardId,uid=cardId,benchSlot)=>({cardId,uid,benchSlot,stack:[cardId],energy:{},specialEnergy:[],conditions:{},damage:0,tool:null,extraTools:[],locks:[]});
function scene(){const side=()=>({active:mon('xy3-63'),bench:[],hand:[],deck:[],discard:[],energyDiscard:{},prizes:[],turnCount:5,handLimit:8,benchLimit:3,energyTypes:['Fighting','Water']});return {format:'classic',phase:'battle',activeSide:'player',turnNumber:9,sides:{player:side(),opponent:side()},rngState:8,log:[]};}
function run(s,e,{action={},resolvingChoice=false,attacker=s.sides.player.active,random=()=>.15}={}){let pending;
 const context={state:s,side:'player',foeSide:'opponent',attacker,defender:s.sides.opponent.active,cardById,random,action,resolvingChoice,isAttack:true,
   drawCard:ss=>{const next=ss.deck.shift();if(next)ss.hand.push(next);return next},shuffle:()=>{},requestChoice:q=>{pending=q},
   benchCard:(ss,original)=>{const b=mon(original.cardId,original.uid,ss.bench.length);ss.bench.push(b);return b},onEnergyAttached:()=>{},onEvolved:()=>{},maxHp:(_,slot)=>cardById(slot.cardId)?.hp||100};
 effects.applyEffect(e,context);return pending;}
const choose=(s,p,i)=>run(s,p.effect,{action:{choiceOption:i},resolvingChoice:true});
function attack(s,rule,damage=0,selection=''){return effects.resolveAttack({name:rule,damage,effect:R(rule)},
 {state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById,random:()=>.25,isAttack:true,action:{effectSelection:selection}})}
test('Furious Fists effect contracts register in the shared engine',()=>{for(const k of ['gigaPower','bigBangHorn','tagTeamSpark','wreck','boomburst','grenadeHammer','korrina','fossilResearcher','thoroughCrunch','negativeDiscard','sinisterSuggestion','rainbowShower'])assert.deepEqual(effects.validateEffect(R(k)),[]);});
test('dynamic attack damage is computed before Weakness and post-damage effects are real',()=>{
 const s=scene(),p=s.sides.player;
 let x=attack(s,'gigaPower',80,'boost');assert.equal(x.damage,120);assert.equal(x.pendingEffects.length,1);run(s,x.pendingEffects[0]);assert.equal(p.active.damage,20);
 p.active=mon('xy3-5');p.active.damage=50;x=attack(s,'bigBangHorn',180);assert.equal(x.damage,130);
 p.active=mon('xy3-63');p.bench=[mon('test-water','magmortar',0)];C['test-water']={...C['test-water'],name:'Magmortar'};p.bench[0].energy={Fire:3};x=attack(s,'tagTeamSpark',20);assert.equal(x.damage,80);
 C['test-water'].name='Water Energy';p.bench=[];
 s.stadium={cardId:'xy3-90',ownerSide:'player',uid:'st1'};x=attack(s,'wreck',60);assert.equal(x.damage,120);run(s,x.pendingEffects[0]);assert.equal(s.stadium,null);
 x=attack(s,'boomburst',0);assert.equal(x.damage,30);assert.equal(x.pendingEffects[0].type,'benchDamage');
});
test('Fighting Stadium and Strong Energy stack, and both can distinguish an EX target',()=>{
 const s=scene();s.sides.player.active=mon('xy3-63');s.sides.player.active.specialEnergy=[ref('xy3-104','strong1')];s.sides.opponent.active=mon('xy3-20');s.stadium={cardId:'xy3-90',uid:'st',ownerSide:'player'};
 assert.equal(effects.attackDamageWithState(s,'player',s.sides.player.active,'opponent',s.sides.opponent.active,40,cardById),80);
 s.stadium=null;assert.equal(effects.attackDamageWithState(s,'player',s.sides.player.active,'opponent',s.sides.opponent.active,40,cardById),60);
 s.sides.player.bench=[mon('xy3-46','machamp',0)];assert.equal(effects.attackDamageWithState(s,'player',s.sides.player.active,'opponent',s.sides.opponent.active,40,cardById),80);
});
test('Korrina searches one Fighting Pokémon and one real Item card by selection',()=>{
 const s=scene(),p=s.sides.player;p.deck=[ref('xy3-63','fighter'),ref('test-item','item'),ref('test-fire','other')];
 let q=run(s,R('korrina'));assert.ok(q.options[0].includes('Hawlucha'));
 q=choose(s,q,0);assert.ok(q.options[0].includes('Potion'));
 choose(s,q,0);assert.deepEqual(p.hand.map(x=>x.uid),['fighter','item']);assert.deepEqual(p.deck.map(x=>x.uid),['other']);
});
test('Fossil Researcher and Jaw/Sail Fossil only bench their named restored Pokémon',()=>{
 let s=scene(),p=s.sides.player;p.deck=[ref('xy3-25','am'),ref('xy3-61','ty'),ref('test-item','other')];
 let q=run(s,R('fossilResearcher'));assert.equal(q.options.filter(x=>/Bench/.test(x)).length,2);
 q=choose(s,q,0);assert.equal(p.bench.length,1);assert.equal(p.bench[0].cardId,'xy3-25');
 q=choose(s,q,0);assert.equal(p.bench.length,2);assert.deepEqual(p.bench.map(x=>x.cardId),['xy3-25','xy3-61']);
 s=scene();p=s.sides.player;p.deck=[ref('xy3-25','am'),ref('xy3-61','ty')];q=run(s,R('jawFossil'));assert.ok(q.options.some(x=>x.includes('Tyrunt')));assert.ok(q.options.every(x=>!x.includes('Amaura')));
 q=choose(s,q,0);assert.equal(p.bench[0].cardId,'xy3-61');
});
test('Negative Discard takes actual discarded Basic Energy units, not new Zone energy',()=>{
 const s=scene(),p=s.sides.player;p.energyDiscard={Water:1};p.discard=[ref('test-grass','grass-discard')];
 let q=run(s,R('negativeDiscard'));assert.equal(q.options.length,3);
 q=choose(s,q,0);assert.deepEqual(p.hand.map(x=>x.uid),['grass-discard']);
 q=choose(s,q,0);assert.equal(p.energyDiscard.Water,0);assert.equal(p.hand.length,2);assert.equal(p.energyUsed,undefined);
});
test('Rainbow Shower attaches actual chosen physical Basic Energy from hand',()=>{
 const s=scene(),p=s.sides.player;p.hand=[ref('test-grass','grass-card'),ref('test-water','water-card')];p.bench=[mon('xy3-52','bench',0)];
 let q=run(s,R('rainbowShower'));assert.equal(q.options.length,3);
 q=choose(s,q,0);assert.equal(q.options.length,2);q=choose(s,q,1);assert.equal(p.bench[0].energy.Grass,1);
 q=choose(s,q,0);choose(s,q,0);assert.equal(p.active.energy.Water,1);assert.equal(p.hand.length,0);
});
test('Training Center adds 30 maximum HP to Stage 1 and Stage 2 on both boards, not Basics, and reverts when removed',()=>{
 const old=data.cardById;data.cardById=id=>C[id]||old(id);
 try{
  const s=scene();
  for(const side of ['player','opponent']){
   const b=s.sides[side];b.active=mon('xy3-52',side+'-stage1');
   b.bench=[mon('xy3-18',side+'-stage2',0),mon('xy3-63',side+'-basic',1)];
  }
  for(const ownerSide of ['player','opponent']){
   s.stadium={...ref('xy3-102','training-center'),ownerSide};
   for(const side of ['player','opponent']){
    const b=s.sides[side];
    for(const [slot,expected] of [[b.active,150],[b.bench[0],160],[b.bench[1],70]]){
     assert.equal(core.maxHp(s,side,slot),expected,side+' '+slot.cardId);
     assert.equal(effects.maxHp(s,side,slot,data.cardById),expected,'shared HP calculation agrees');
    }
   }
  }
  s.stadium=null;
  for(const side of ['player','opponent']){
   const b=s.sides[side];assert.equal(core.maxHp(s,side,b.active),120);
   assert.equal(core.maxHp(s,side,b.bench[0]),130);assert.equal(core.maxHp(s,side,b.bench[1]),70);
  }
 }finally{data.cardById=old;}
});
test('Politoed cost and Herbal Energy hooks remain installed in core',()=>{
 const source=fs.readFileSync(path.join(assets,'tcgp-battle-core.js'),'utf8');
 assert.match(source,/xy3-18/);assert.match(source,/xy3-103/);
});

test('Echolocation prevents damage on heads and logs the visible heads/tails result',()=>{
 C['xy3-77']={id:'xy3-77',name:'Noivern',types:['Dragon'],hp:110,stage:'Stage 1',abilities:[{name:'Echolocation',type:'passive',effect:{type:'coinDamageGuard',preventAll:true}}]};
 const s=scene();s.sides.opponent.active=mon('xy3-77');s.rngState=1;
 const amount=effects.attackDamageWithState(s,'player',s.sides.player.active,'opponent',s.sides.opponent.active,50,cardById);
 assert.equal(amount,0);assert.equal(s.log.at(-1).reason,'Echolocation');assert.equal(s.log.at(-1).results.length,1);
 s.rngState=1000;s.sides.opponent.active.conditions={};
 // Seed chosen to produce a tails outcome for the first linear congruential step.
 let seed=1;while(((Math.imul(seed,1664525)+1013904223)>>>0)/4294967296<0.5&&seed<100000)seed++;
 s.rngState=seed;
 assert.equal(effects.attackDamageWithState(s,'player',s.sides.player.active,'opponent',s.sides.opponent.active,50,cardById),50);
 delete C['xy3-77'];
});

test('Accelgor Afterimage Strike actually rolls to prevent its next incoming hit',()=>{
 const s=scene(),p=s.sides.player;p.active=mon('xy3-9');run(s,R('afterimageStrike'));
 assert.equal(p.active.hgss3AfterimageUntil,10);
 s.turnNumber=10;s.rngState=1;
 assert.ok(effects.attackIsPrevented(s,'player',p.active,s.sides.opponent.active,cardById));
 assert.equal(s.log.at(-1).reason,'Afterimage Strike');
});

test('Maintenance moves exactly two chosen physical hand cards to deck before drawing one',()=>{
 const s=scene(),p=s.sides.player;p.hand=[ref('test-item','a'),ref('test-item','b'),ref('test-item','c')];p.deck=[ref('test-water','d')];
 let q=run(s,R('maintenance'));assert.equal(q.options.length,3);
 q=choose(s,q,0);assert.equal(p.hand.length,2);assert.equal(p.deck.length,2);
 choose(s,q,0);assert.equal(p.hand.length,2);assert.equal(p.deck.length,2);
 assert.equal(p.hand.some(x=>x.uid==='d'),true);
});

test('Tool Retriever moves genuine equipped Tool cards back to hand',()=>{
 const s=scene(),p=s.sides.player;p.active.tool=ref('xy3-91','sash');p.bench=[mon('xy3-52','b',0)];p.bench[0].tool=ref('xy3-99','robe');
 let q=run(s,R('toolRetriever'));assert.equal(q.options.length,3);
 q=choose(s,q,0);assert.equal(p.active.tool,null);assert.equal(p.hand[0].uid,'sash');
 choose(s,q,0);assert.equal(p.bench[0].tool,null);assert.equal(p.hand[1].uid,'robe');
});

test('Special Energy expiry, Focus Sash survival, and both-player stadium effects are guarded in runtime',()=>{
 const source=fs.readFileSync(path.join(assets,'tcgp-battle-core.js'),'utf8');
 assert.match(source,/xy3SpecialEnergyDiscard/);
 assert.match(source,/ineligibleAttachedType/);
 assert.match(source,/xy3FocusSash/);
 assert.match(source,/xy3HerbalEnergy/);
 const s=scene(),enemy=s.sides.opponent;enemy.active=mon('xy3-63');s.sides.player.active=mon('xy3-20');
 s.stadium={cardId:'xy3-90',uid:'stadium',ownerSide:'opponent'};
 assert.equal(effects.attackDamageWithState(s,'opponent',enemy.active,'player',s.sides.player.active,30,cardById),50);
});

test('Patrat Safety Check reveals exactly one chosen own Prize privately without changing prizes or public log',()=>{
 const s=scene(),p=s.sides.player;p.active=mon('xy3-84');p.prizes=[ref('test-water','prize1'),ref('test-item','prize2')];
 let q=run(s,R('safetyCheck'));assert.deepEqual(q.options,['Inspect facedown Prize 1','Inspect facedown Prize 2']);
 q=choose(s,q,1);assert.ok(q.options[0].includes('Potion'));assert.equal(p.prizes.length,2);
 assert.ok(s.log.some(x=>x.rule==='safetyCheck'&&x.inspectedOwnPrizeIndex===2));
 assert.ok(s.log.every(x=>!JSON.stringify(x).includes('test-item')),'public battle log must not expose inspected Prize identity');
 choose(s,q,0);assert.equal(p.prizes[1].uid,'prize2');
});
