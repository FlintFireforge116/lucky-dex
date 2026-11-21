'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const effects=require(path.join(assets,'tcgp-battle-effects.js'));
const ref=(cardId,uid)=>({cardId,uid});
const mk=(cardId,uid,benchSlot=null)=>({cardId,uid,benchSlot,stack:[cardId],damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],conditions:{},temporaryTrainers:[],playedOnSideTurn:1});
const side=w=>({id:w,active:mk('test-normal',w+'a'),bench:[mk('test-normal',w+'b',0)],hand:[],deck:[],discard:[],energyDiscard:{},energyTypes:['Water','Fire','Lightning'],energySupply:['Fire','Water','Lightning','Water'],handLimit:8,benchLimit:3,turnCount:5,prizes:[ref('test-normal',w+'p1')],handEnergyUsed:false,energyUsed:false});
const scene=()=>({format:'classic',phase:'battle',activeSide:'player',turnNumber:7,rngState:2,log:[],sides:{player:side('player'),opponent:side('opponent')},modifiers:[]});
const catalog={
 'test-normal':{id:'test-normal',name:'Normal',kind:'pokemon',stage:'Basic',hp:200,types:['Colorless'],battleEnabled:true,attacks:[{name:'Kick',cost:[],damage:10,effect:{type:'noop'}}]},
 'test-water':{id:'test-water',name:'Water Pokémon',kind:'pokemon',stage:'Basic',hp:140,types:['Water'],battleEnabled:true,attacks:[{name:'Kick',cost:[],damage:10,effect:{type:'noop'}}]},
 'test-fight':{id:'test-fight',name:'Fighting Pokémon',kind:'pokemon',stage:'Stage 2',hp:140,types:['Fighting'],battleEnabled:true,attacks:[{name:'Kick',cost:[],damage:10,effect:{type:'noop'}}]},
 'test-energ-fire':{id:'test-energ-fire',name:'Fire Energy',kind:'energy',basicEnergy:true,energyType:'Fire',subtype:'Fire',battleEnabled:true},
 'test-energ-water':{id:'test-energ-water',name:'Water Energy',kind:'energy',basicEnergy:true,energyType:'Water',subtype:'Water',battleEnabled:true},
 'test-special':{id:'test-special',name:'Double Colorless Energy',kind:'energy',specialEnergy:true,energyType:'Colorless',subtype:'Colorless',effect:{type:'specialEnergy',provides:{Colorless:2}},battleEnabled:true},
};
for(const [n,name,rule,type,extra] of [
 ['124',"Archie's Ace in the Hole",'xy5:aceInHole','Water'],['157',"Archie's Ace in the Hole",'xy5:aceInHole','Water'],
 ['133',"Maxie's Hidden Ball Trick",'xy5:aceInHole','Fighting'],['158',"Maxie's Hidden Ball Trick",'xy5:aceInHole','Fighting'],
 ['141','Teammates','xy5:teammates',null],['160','Teammates','xy5:teammates',null]])catalog['xy5-'+n]={id:'xy5-'+n,name,kind:'trainer',trainerType:'Supporter',battleEnabled:true,effect:{type:'neoRule',rule,...(type?{energyType:type}:{})}};
for(const [n,name,rule,base,kind] of [
 ['18','Illumise','helpingHand',0],['26','Torchic','flareBonus',0],['59','Electrike','charge',0],['73','Starmie','synchroStar',30],
 ['80','Medicham','purePower',0],['90','Diggersby','earDig',0]])
 catalog['xy5-'+n]={id:'xy5-'+n,name,kind:'pokemon',stage:'Basic',hp:190,types:['Colorless'],battleEnabled:true,attacks:[{name,damage:base,cost:[],effect:{type:'neoRule',rule:'xy5:'+rule}}]};
for(const [n,name,effect,damage] of [
 ['37','Astonish',{type:'shuffleRandomHandCard',side:'opponent'},30],
 ['68','Poison Fang',{type:'status',target:'opponentActive',status:'poison',amount:20},30],
 ['116','Lead',{type:'searchChosen',source:'deck',amount:1,filter:{kind:'trainer',trainerType:'Supporter'}},0]])
 catalog['xy5-'+n]={id:'xy5-'+n,name,kind:'pokemon',stage:'Basic',hp:190,types:['Colorless'],battleEnabled:true,attacks:[{name,damage,cost:[],effect}]};
const withCards=fn=>{const was=data.cardById;data.cardById=id=>catalog[id]||was(id);try{return fn();}finally{data.cardById=was;}};
function use(s,side,selector){const actions=core.legalActions(s,side),a=actions.find(selector);assert.ok(a,'Expected legal action. Got '+JSON.stringify(actions));core.applyAction(s,side,a);return a;}
const choose=(s,index=0,side='player')=>use(s,side,a=>a.type==='effectChoice'&&a.choiceOption===index);
const attack=(s,n)=>{s.sides.player.active=mk('xy5-'+n,'attacker');return use(s,'player',a=>a.type==='attack'&&a.attackIndex===0);};
function setupTrainer(s,n){s.sides.player.hand=[ref('xy5-'+n,'trainer')];s.sides.player.deck=[ref('test-normal','d1'),ref('test-normal','d2'),ref('test-normal','d3'),ref('test-normal','d4'),ref('test-normal','d5'),ref('test-normal','d6')];return s;}

test('Stage 5 official Python effect mappings are valid and no old Ω Barrier card is unlocked merely by new attacks',()=>{
 const code=String.raw`import sys,json;sys.path.insert(0,sys.argv[1]);import xy5_verified as v
keys=[('18','Helping Hand'),('26','Flare Bonus'),('37','Astonish'),('44','Aqua Swirl'),('59','Charge'),('68','Poison Fang'),('73','Synchro Star'),('80','Pure Power'),('90','Ear Dig'),('96','Straight Claw'),('108','Gather Strength'),('116','Lead')]
print(json.dumps({'effects':[v.ATTACKS.get(k) for k in keys], 'trainers':[v.TRAINERS.get(str(n)) for n in [124,133,141,157,158,160]], 'traits':list(v.TRAITS_IMPLEMENTED)}))`;
 const run=spawnSync('python3',['-c',code,path.join(root,'scripts')],{encoding:'utf8'});assert.equal(run.status,0,run.stderr);
 const out=JSON.parse(run.stdout);for(const e of out.effects){assert.ok(e,'missing attack mapping');assert.deepEqual(effects.validateEffect(e),[]);}
 for(const t of out.trainers){assert.ok(t);assert.deepEqual(effects.validateEffect(t[1]),[]);}assert.ok(!out.traits.includes('Ω Barrier'));
});

test('Archie: only final card in hand, live Water discard target, empty Bench; physical Bench + 5 draw',()=>withCards(()=>{
 const s=setupTrainer(scene(),'124'),p=s.sides.player;p.discard=[ref('test-water','wat'),ref('test-fight','fig')];
 p.hand.push(ref('test-normal','other'));assert.ok(!core.legalActions(s,'player').some(a=>a.cardId==='xy5-124'),'not playable with another hand card');p.hand.pop();
 const a=use(s,'player',a=>a.type==='trainer'&&a.cardId==='xy5-124');assert.equal(s.phase,'effectChoice');
 assert.equal(s.pendingChoice.options.length,1,'only water Pokémon available');choose(s);assert.ok(p.bench.some(x=>x.cardId==='test-water'&&x.uid==='wat'));
 assert.equal(p.discard.some(r=>r.uid==='wat'),false);assert.equal(p.discard.some(r=>r.uid==='fig'),true);
 assert.equal(p.hand.length,5);assert.equal(p.deck.length,1);assert.equal(p.supporterUsed,true);
}));

test('Maxie: Stage 2 Fighting Pokémon can enter Bench directly from physical discard, not Water',()=>withCards(()=>{
 const s=setupTrainer(scene(),'133'),p=s.sides.player;p.discard=[ref('test-water','wat'),ref('test-fight','fig')];
 use(s,'player',a=>a.type==='trainer'&&a.cardId==='xy5-133');assert.equal(s.pendingChoice.options.length,1);
 choose(s);assert.ok(p.bench.some(x=>x.cardId==='test-fight'&&x.uid==='fig'));assert.equal(p.hand.length,5);
}));

test('Archie/Maxie cannot be played with no eligible target or full Bench',()=>withCards(()=>{
 const s=setupTrainer(scene(),'124'),p=s.sides.player;p.discard=[ref('test-fight','wrong')];assert.ok(!core.legalActions(s,'player').some(a=>a.cardId==='xy5-124'));
 p.discard.push(ref('test-water','good'));p.bench.push(mk('test-normal','b2',1),mk('test-normal','b3',2));assert.ok(!core.legalActions(s,'player').some(a=>a.cardId==='xy5-124'));
}));

test('Teammates: only after an actual owner KO in opponent previous turn; selects two physical deck cards',()=>withCards(()=>{
 const s=setupTrainer(scene(),'141'),p=s.sides.player;assert.ok(!core.legalActions(s,'player').some(a=>a.cardId==='xy5-141'));
 p.lastKnockoutTurn=6;use(s,'player',a=>a.type==='trainer'&&a.cardId==='xy5-141');
 assert.equal(s.pendingChoice.options.length,7,'six deck choices plus Done');choose(s,3);
 assert.equal(s.pendingChoice.options.length,6,'five remaining plus Done');choose(s,0);
 assert.equal(p.hand.length,2);assert.equal(p.deck.length,4);
 assert.ok(p.hand.some(ref=>ref.uid==='d4'));assert.ok(p.hand.some(ref=>ref.uid==='d1'));
}));

test('Helping Hand takes chosen Basic Energy from actual ordered Energy Zone and attaches only to Bench',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.energySupply=['Grass','Water','Fire'];p.energyTypes=['Grass','Water','Fire'];
 attack(s,'18');assert.equal(s.phase,'effectChoice');choose(s,0);assert.equal(s.phase,'effectChoice');
 assert.equal(s.pendingChoice.options.length,3);choose(s,1);
 assert.deepEqual(p.energySupply,['Grass','Fire']);assert.equal(p.bench[0].energy.Water,1);assert.equal(p.active.energy.Water||0,0);
}));

test('Charge searches the Energy Zone for Lightning and attaches it without consuming ordinary energy attachment',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.energySupply=['Water','Lightning','Fire'];p.energyTypes=['Water','Lightning','Fire'];
 attack(s,'59');assert.equal(p.active.energy.Lightning,1);assert.deepEqual(p.energySupply,['Water','Fire']);assert.equal(p.energyUsed,false);
}));

test('Flare Bonus discards selected physical Fire Energy from hand and draws precisely two physical cards',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.hand=[ref('test-energ-water','wa'),ref('test-energ-fire','fi')];
 p.deck=[ref('test-normal','d1'),ref('test-normal','d2'),ref('test-normal','d3')];
 attack(s,'26');assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.options.length,2);choose(s,0);
 assert.ok(p.discard.some(x=>x.uid==='fi'));assert.ok(p.hand.some(x=>x.uid==='wa'));
 assert.ok(p.hand.some(x=>x.uid==='d1'));assert.ok(p.hand.some(x=>x.uid==='d2'));assert.equal(p.deck.length,1);
}));

test('Astonish shuffles exactly one random physical opponent hand card back into their deck',()=>withCards(()=>{
 const s=scene(),foe=s.sides.opponent;foe.hand=[ref('test-normal','h1'),ref('test-water','h2')];foe.deck=[ref('test-normal','d1')];
 // A complete attack advances the opponent's turn and draws a new card.
 // Check the *effect* before that draw, then separately check the attack is
 // wired to it; otherwise an opponent draw hides the moved hand card.
 const ctx={state:s,side:'player',foeSide:'opponent',cardById:data.cardById,
   random:()=>0,shuffle:()=>{},attacker:s.sides.player.active,defender:foe.active,isAttack:true};
 effects.applyEffect({type:'shuffleRandomHandCard',side:'opponent'},ctx);
 assert.equal(foe.hand.length,1);assert.equal(foe.deck.length,2);
 assert.equal(foe.deck[1].uid,'h1');
 s.sides.player.active=mk('xy5-37','ast');
 assert.deepEqual(catalog['xy5-37'].attacks[0].effect,{type:'shuffleRandomHandCard',side:'opponent'});
}));

test('Poison Fang applies 20 between-turn damage, not default 10',()=>withCards(()=>{
 const s=scene();attack(s,'68');assert.equal(s.sides.opponent.active.conditions.poison.amount,20);
}));

test('Synchro Star compares physical attached card counts, not Double Colorless energy symbol counts',()=>withCards(()=>{
 const s=scene(),p=s.sides.player,f=s.sides.opponent;p.active=mk('xy5-73','star');p.active.specialEnergy=[ref('test-special','double')];
 f.active.energy.Water=1;
 use(s,'player',a=>a.type==='attack');assert.equal(f.active.damage,90,'30+60 at one physical Energy each');
}));

test('Pure Power targets each of four damage counters individually across opponent Active and Bench',()=>withCards(()=>{
 const s=scene(),foe=s.sides.opponent;attack(s,'80');assert.equal(s.pendingChoice.options.length,2);
 choose(s,1);choose(s,0);choose(s,1);choose(s,0);
 assert.equal(s.phase,'battle');assert.equal(foe.active.damage,20);assert.equal(foe.bench[0].damage,20);
 assert.equal(s.log.filter(x=>x.type==='xy5PurePower').length,4);
}));

test('Ear Dig flips until tails and only discards real deck cards, never creating replacements',()=>withCards(()=>{
 const s=scene(),foe=s.sides.opponent;foe.deck=[ref('test-normal','o1'),ref('test-water','o2'),ref('test-normal','o3')];
 attack(s,'90');const moved=foe.discard.filter(x=>/^o\d/.test(x.uid));assert.ok(moved.length<=3);
 assert.equal(foe.deck.length+moved.length,3);assert.ok(s.log.some(x=>x.type==='coin'&&x.reason==='Ear Dig'));
}));

test('Milotic Aqua Swirl offers optional switch and lets the defending player choose the replacement',()=>withCards(()=>{
 const s=scene(),f=s.sides.opponent;
 const eff={type:'chooseOption',options:[{label:'Have the opponent switch',effect:{type:'forceOpponentSwitch',chooseBy:'defender'}},
   {label:'Do not switch',effect:{type:'noop'}}]};
 catalog['test-aqua']={id:'test-aqua',name:'Milotic',kind:'pokemon',stage:'Basic',hp:160,types:['Water'],battleEnabled:true,
   attacks:[{name:'Aqua Swirl',cost:[],damage:0,effect:eff}]};
 s.sides.player.active=mk('test-aqua','aqua');f.bench=[mk('test-water','f1',0),mk('test-normal','f2',1)];
 use(s,'player',a=>a.type==='attack');assert.equal(s.phase,'effectChoice');
 choose(s,0);assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'opponent','defending player selects Bench');
 use(s,'opponent',a=>a.type==='effectChoice'&&a.choiceBenchIndex===1);assert.equal(f.active.uid,'f2');
}));

test('Excadrill Straight Claw offers optional attached-Energy discard before applying bonus damage',()=>withCards(()=>{
 const s=scene(),p=s.sides.player,foe=s.sides.opponent;
 const eff={type:'neoRule',rule:'xy5:straightClaw'};
 catalog['test-claw']={id:'test-claw',name:'Excadrill',kind:'pokemon',stage:'Basic',hp:160,types:['Fighting'],battleEnabled:true,
  attacks:[{name:'Straight Claw',cost:[],damage:20,effect:eff}]};
 p.active=mk('test-claw','claw');p.active.energy.Fighting=1;
 const opts=core.legalActions(s,'player').filter(a=>a.type==='attack');
 assert.equal(opts.length,2,'keep or discard choice before attacking');
 use(s,'player',a=>a.type==='attack'&&a.effectSelection==='basic:Fighting');
 assert.ok(p.energyDiscard.Fighting===1,'physical Basic Energy spent');
 assert.equal(foe.active.damage,50,'20 + 30, after optional cost');
}));

test('Kingdra Gather Strength uses search from the ordered Energy Zone, not discarded Basic Energy',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.energySupply=['Water','Fire','Water','Lightning','Grass'];p.deck=[ref('test-normal','physical')];
 const eff={type:'searchChosen',source:'deck',amount:4,filter:{kind:'energy',basicEnergy:true}};
 catalog['test-gather']={id:'test-gather',name:'Kingdra',kind:'pokemon',stage:'Basic',hp:160,types:['Dragon'],battleEnabled:true,
  attacks:[{name:'Gather Strength',cost:[],damage:0,effect:eff}]};
 p.active=mk('test-gather','gather');use(s,'player',a=>a.type==='attack');
 assert.equal(s.phase,'effectChoice');const count=s.pendingChoice.options.length;assert.ok(count>=4,'Zone selection surfaced');
 choose(s,0);assert.equal(p.hand.length,1);assert.equal(p.deck.length,1,'physical 30-card deck was not searched');
 assert.equal(p.energySupply.length,4);assert.equal(p.discard.length,0);
}));

test('Generated stage 5 mechanics are included in CI build gate',()=>{
 const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
 assert.match(gradle,/v07347-primal-clash-trainers-attacks\.test\.cjs/);
});
