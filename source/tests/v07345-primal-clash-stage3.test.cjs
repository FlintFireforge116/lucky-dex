'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const effects=require(path.join(assets,'tcgp-battle-effects.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const catalog={
  'test-normal':{id:'test-normal',name:'Rattata',kind:'pokemon',stage:'Basic',battleEnabled:true,hp:100,types:['Colorless'],attacks:[{name:'Pounce',cost:[],damage:10,effect:{type:'noop'}}]},
  'test-alpha':{id:'test-alpha',name:'Swampert',kind:'pokemon',stage:'Stage 2',battleEnabled:true,hp:170,types:['Water'],ancientTrait:{name:'α Growth'},attacks:[{name:'Splash',cost:[],damage:10,effect:{type:'noop'}}]},
  'test-recovery':{id:'test-recovery',name:'Ludicolo',kind:'pokemon',stage:'Stage 2',battleEnabled:true,hp:140,types:['Water'],ancientTrait:{name:'α Recovery'},attacks:[{name:'Splash',cost:[],damage:10,effect:{type:'noop'}}]},
  'test-barrage':{id:'test-barrage',name:'Nidoqueen',kind:'pokemon',stage:'Stage 2',battleEnabled:true,hp:150,types:['Psychic'],ancientTrait:{name:'Ω Barrage'},attacks:[{name:'Jab',cost:[],damage:10,effect:{type:'noop'}}]},
  'test-basic-water':{id:'test-basic-water',name:'Kyogre-EX',kind:'pokemon',stage:'Basic',battleEnabled:true,hp:160,types:['Water'],pokemonEX:true,attacks:[]},
  'xy5-55':{id:'xy5-55',name:'Primal Kyogre-EX',kind:'pokemon',stage:'Stage 1',evolvesFrom:'Kyogre-EX',battleEnabled:true,megaEvolution:true,pokemonEX:true,hp:240,types:['Water'],ancientTrait:{name:'α Growth'},attacks:[]},
  'xy5-132':{id:'xy5-132',name:'Kyogre Spirit Link',kind:'trainer',trainerType:'Tool',battleEnabled:true,effect:{type:'noop'}},
  'test-metal':{id:'test-metal',name:'Registeel',kind:'pokemon',stage:'Basic',battleEnabled:true,hp:100,types:['Metal'],attacks:[]},
  'test-fairy':{id:'test-fairy',name:'Xerneas',kind:'pokemon',stage:'Basic',battleEnabled:true,hp:100,types:['Fairy'],attacks:[]},
  'test-energy-water':{id:'test-energy-water',name:'Water Energy',kind:'energy',basicEnergy:true,subtype:'Water',energyType:'Water'},
  'test-energy-fire':{id:'test-energy-fire',name:'Fire Energy',kind:'energy',basicEnergy:true,subtype:'Fire',energyType:'Fire'},
  'xy5-143':{id:'xy5-143',name:'Shield Energy',kind:'energy',specialEnergy:true,battleEnabled:true,subtype:'Metal',energyType:'Metal',effect:{type:'specialEnergy',provides:{Metal:1}}},
  'xy5-144':{id:'xy5-144',name:'Wonder Energy',kind:'energy',specialEnergy:true,battleEnabled:true,subtype:'Fairy',energyType:'Fairy',effect:{type:'specialEnergy',provides:{Fairy:1}}},
  'test-freshwater':{id:'test-freshwater',name:'Fresh Water Set',kind:'trainer',trainerType:'Item',battleEnabled:true,effect:{type:'heal',target:'selfAll',amount:20}},
  'test-attack-poison':{id:'test-attack-poison',name:'Ekans',kind:'pokemon',stage:'Basic',battleEnabled:true,hp:90,types:['Psychic'],attacks:[{name:'Toxic',cost:[],damage:20,effect:{type:'status',target:'opponentActive',status:'poison'}}]},
  'test-attack-plain':{id:'test-attack-plain',name:'Vulpix',kind:'pokemon',stage:'Basic',battleEnabled:true,hp:90,types:['Fire'],attacks:[{name:'Claw',cost:[],damage:40,effect:{type:'noop'}}]}
};
const ref=(cardId,uid)=>({cardId,uid});
const mk=(cardId,uid,benchSlot=null)=>({cardId,uid,benchSlot,stack:[cardId],damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],conditions:{},temporaryTrainers:[],playedOnSideTurn:1});
const side=w=>({id:w,active:mk('test-normal',w+'a'),bench:[mk('test-normal',w+'b',0)],hand:[],deck:[],discard:[],energyDiscard:{},handLimit:8,benchLimit:3,turnCount:5,energyTypes:['Colorless'],prizes:[ref('test-normal',w+'p1')],handEnergyUsed:false,energyUsed:false});
const scene=()=>({format:'classic',phase:'battle',activeSide:'player',turnNumber:7,rngState:2,log:[],sides:{player:side('player'),opponent:side('opponent')},modifiers:[]});
function withCards(fn){const orig=data.cardById;data.cardById=id=>catalog[id]||orig(id);try{return fn();}finally{data.cardById=orig;}}
function use(s,side,match){const act=core.legalActions(s,side).find(match);assert.ok(act,'No legal action: '+JSON.stringify(core.legalActions(s,side)));core.applyAction(s,side,act);return act;}


// New abilities and attacks are mocked with the exact printed semantics; the
// immutable 164-card generated set is audited independently on GitHub.
Object.assign(catalog,{
 'xy5-55':{...catalog['xy5-55'],hp:240,attacks:[{name:'Tidal Storm',cost:[],damage:150,effect:{type:'neoRule',rule:'xy5:tidalStorm'}}]},
 'xy5-86':{id:'xy5-86',name:'Primal Groudon-EX',kind:'pokemon',stage:'Stage 1',battleEnabled:true,hp:240,types:['Fighting'],ancientTrait:{name:'Ω Barrier'},attacks:[{name:'Gaia Volcano',cost:[],damage:100,effect:{type:'neoRule',rule:'xy5:gaiaVolcano'}}]},
 'test-ex':{id:'test-ex',name:'Blaziken-EX',kind:'pokemon',stage:'Basic',hp:250,types:['Fire'],pokemonEX:true,battleEnabled:true,attacks:[]},
 'test-nonex':{id:'test-nonex',name:'Blaziken',kind:'pokemon',stage:'Stage 2',hp:250,types:['Fire'],battleEnabled:true,attacks:[]},
 'test-weakmetal':{id:'test-weakmetal',name:'Aron',kind:'pokemon',stage:'Basic',hp:200,types:['Metal'],weakness:'Fire',weaknessValue:'×2',battleEnabled:true,attacks:[]},
 'xy5-100':{id:'xy5-100',name:'Aegislash',kind:'pokemon',stage:'Stage 2',hp:150,types:['Metal'],battleEnabled:true,abilities:[{name:'Miracle Guard',printedPowerType:'ability',type:'passive',effect:{type:'noop'}}],attacks:[]},
 'xy5-77':{id:'xy5-77',name:'Rhyperior',kind:'pokemon',stage:'Stage 2',hp:160,types:['Fighting'],battleEnabled:true,abilities:[{name:'Rock Wall',printedPowerType:'ability',type:'passive',effect:{type:'noop'}}],attacks:[]},
 'xy5-119':{id:'xy5-119',name:'Bouffalant',kind:'pokemon',stage:'Basic',hp:110,types:['Colorless'],battleEnabled:true,abilities:[{name:'Sap Sipper',printedPowerType:'ability',type:'passive',effect:{type:'noop'}}],attacks:[{name:'Headbutt',cost:[],damage:20,effect:{type:'noop'}}]},
 'xy5-137':{id:'xy5-137',name:'Rough Seas',kind:'trainer',trainerType:'Stadium',battleEnabled:true,effect:{type:'stadiumAction',effect:{type:'heal',target:'selfAll',amount:30,filter:{subtype:['Water','Lightning']}}}},
 'xy5-139':{id:'xy5-139',name:'Shrine of Memories',kind:'trainer',trainerType:'Stadium',battleEnabled:true,effect:{type:'noop'}},
 'xy5-140':{id:'xy5-140',name:'Silent Lab',kind:'trainer',trainerType:'Stadium',battleEnabled:true,effect:{type:'noop'}},
 'xy5-142':{id:'xy5-142',name:'Weakness Policy',kind:'trainer',trainerType:'Tool',battleEnabled:true,effect:{type:'noop'}},
 'test-grass':{id:'test-grass',name:'Bulbasaur',kind:'pokemon',stage:'Basic',hp:180,types:['Grass'],battleEnabled:true,attacks:[]},
 'test-lightning':{id:'test-lightning',name:'Pikachu',kind:'pokemon',stage:'Basic',hp:180,types:['Lightning'],battleEnabled:true,attacks:[]},
 'test-stage1':{id:'test-stage1',name:'Raticate',kind:'pokemon',stage:'Stage 1',hp:180,types:['Colorless'],battleEnabled:true,attacks:[{name:'Scratch',cost:[],damage:20,effect:{type:'noop'}}]},
 'test-special':{id:'test-special',name:'Double Colorless Energy',kind:'energy',specialEnergy:true,energyType:'Colorless',battleEnabled:true,effect:{type:'specialEnergy',provides:{Colorless:2}}}
});

test('Gaia Volcano gets +100 only while Stadium is in play, then physically discards that Stadium',()=>withCards(()=>{
 const s=scene(),foe=s.sides.opponent;s.sides.player.active=mk('xy5-86','primal');
 foe.active=mk('test-weakmetal','target');foe.active.cardId='test-nonex';
 s.stadium=ref('xy5-139','stad');s.stadium.ownerSide='opponent';
 use(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(foe.active.damage,200);
 assert.equal(s.stadium,null,'Stadium leaves play, even though opponent owns it');
 assert.ok(foe.discard.some(r=>r.uid==='stad'),'Stadium returns to physical owner discard');
 const clean=scene();clean.sides.player.active=mk('xy5-86','primal');clean.sides.opponent.active=mk('test-nonex','target2');
 use(clean,'player',a=>a.type==='attack');assert.equal(clean.sides.opponent.active.damage,100);
}));

test('Tidal Storm targets one Bench and moves two actual attached Energy cards, including Special',()=>withCards(()=>{
 const s=scene(),p=s.sides.player,foe=s.sides.opponent;
 p.active=mk('xy5-55','kyogre');p.active.energy.Water=1;
 p.active.specialEnergy=[ref('test-special','dbl')];
 p.bench=[mk('test-normal','b1',0),mk('test-normal','b2',1)];
 foe.active=mk('test-nonex','fa');foe.bench=[mk('test-ex','fb',0),mk('test-nonex','fc',1)];
 use(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(foe.active.damage,150,'Active receives printed damage');
 assert.equal(foe.bench[0].damage,30,'Only EX on Bench hit');
 assert.equal(foe.bench[1].damage,0,'Non EX Bench remains undamaged');
 assert.equal(s.phase,'effectChoice','Choice must resolve before Prize / end of turn');
 const choose=(idx)=>{const a=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceOption===idx);assert.ok(a,JSON.stringify(s.pendingChoice));core.applyAction(s,'player',a);};
 assert.equal(s.pendingChoice.options.length,2,'Pick physical destination');choose(1);
 assert.equal(s.pendingChoice.options.length,2,'Choose physical Energy');
 const specialIndex=s.pendingChoice.options.findIndex(x=>x.includes('Double Colorless'));
 assert.ok(specialIndex>=0);choose(specialIndex);
 assert.equal(s.pendingChoice.options.length,1,'Second selection is remaining real Basic Energy');choose(0);
 assert.equal(s.phase,'battle','All mandatory effect choices complete');
 assert.equal(p.active.energy.Water,0);assert.equal(p.active.specialEnergy.length,0);
 assert.equal(p.bench[1].energy.Water,1);assert.equal(p.bench[1].specialEnergy[0].uid,'dbl');
 assert.equal(p.bench[0].energy.Water||0,0);assert.equal(p.energyDiscard.Water||0,0,'Moving does not discard Energy');
 assert.equal(s.log.filter(x=>x.type==='xy5TidalStorm').length,2);
}));

test('Miracle Guard prevents Weakness for teammate and obeys suppression',()=>withCards(()=>{
 const s=scene();s.sides.player.active=mk('test-attack-plain','fire');
 s.sides.opponent.active=mk('test-weakmetal','metal');s.sides.opponent.bench=[mk('xy5-100','aegislash',0)];
 use(s,'player',a=>a.type==='attack');assert.equal(s.sides.opponent.active.damage,40,'No ×2 due to Aegislash');
 const t=scene();t.sides.player.active=mk('test-attack-plain','fire');t.sides.opponent.active=mk('test-weakmetal','metal');
 use(t,'player',a=>a.type==='attack');assert.equal(t.sides.opponent.active.damage,80,'With no Aegislash, ×2 weakness applies');
}));

test('Rhyperior Rock Wall reduces teammate attack damage AFTER weakness/resistance',()=>withCards(()=>{
 const s=scene();s.sides.player.active=mk('test-attack-plain','fire');
 s.sides.opponent.active=mk('test-weakmetal','metal');s.sides.opponent.bench=[mk('xy5-77','wall',0)];
 use(s,'player',a=>a.type==='attack');assert.equal(s.sides.opponent.active.damage,70,'40×2-10 = 70');
}));

test('Sap Sipper adds 40 to Grass targets before Weakness; Silent Lab suppresses Basic Ability',()=>withCards(()=>{
 const s=scene();s.sides.player.active=mk('xy5-119','buff');s.sides.opponent.active=mk('test-grass','grass');
 use(s,'player',a=>a.type==='attack');assert.equal(s.sides.opponent.active.damage,60);
 const t=scene();t.sides.player.active=mk('xy5-119','buff');t.sides.opponent.active=mk('test-grass','grass');
 t.stadium=ref('xy5-140','lab');use(t,'player',a=>a.type==='attack');assert.equal(t.sides.opponent.active.damage,20);
}));

test('Weakness Policy prevents Weakness even if another Pokemon does not provide Miracle Guard',()=>withCards(()=>{
 const s=scene();s.sides.player.active=mk('test-attack-plain','fire');s.sides.opponent.active=mk('test-weakmetal','metal');
 s.sides.opponent.active.tool=ref('xy5-142','wp');use(s,'player',a=>a.type==='attack');
 assert.equal(s.sides.opponent.active.damage,40);
}));

test('Shrine of Memories allows previous Evolution attack, Silent Lab blocks Basic Abilities',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active=mk('test-stage1','evolved');p.active.stack=['test-normal','test-stage1'];
 assert.equal(effects.canUsePreviousEvolutionAttacks(s,'player',p.active,data.cardById),false);
 s.stadium=ref('xy5-139','shrine');assert.equal(effects.canUsePreviousEvolutionAttacks(s,'player',p.active,data.cardById),true);
 s.stadium=ref('xy5-140','lab');
 assert.equal(effects.canUsePreviousEvolutionAttacks(s,'player',p.active,data.cardById),false);
 p.active=mk('xy5-119','buff');assert.equal(effects.abilitiesSuppressed(s,'player',p.active,data.cardById),true);
 p.active=mk('xy5-100','aegis');assert.equal(effects.abilitiesSuppressed(s,'player',p.active,data.cardById),false);
}));

test('Rough Seas once per turn heals Water/Lightning team only, including α Recovery',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active=mk('test-recovery','ludicolo');p.active.damage=60;
 p.bench=[mk('test-lightning','pikachu',0),mk('test-grass','bulbasaur',1)];
 p.bench[0].damage=40;p.bench[1].damage=40;
 s.stadium=ref('xy5-137','rough');s.stadium.ownerSide='player';
 const acts=core.legalActions(s,'player').filter(a=>a.type==='stadiumAction');assert.equal(acts.length,1,JSON.stringify(acts));
 core.applyAction(s,'player',acts[0]);assert.equal(p.active.damage,0,'α Recovery doubles 30 to 60');
 assert.equal(p.bench[0].damage,10);assert.equal(p.bench[1].damage,40);
 assert.equal(core.legalActions(s,'player').filter(a=>a.type==='stadiumAction').length,0,'Once per turn');
}));

Object.assign(catalog,{
 'xy5-94':{id:'xy5-94',name:'M Aggron-EX',kind:'pokemon',stage:'Stage 1',hp:240,types:['Metal'],pokemonEX:true,megaEvolution:true,battleEnabled:true,
   attacks:[{name:'Megaton Slam',cost:[],damage:120,effect:{type:'neoRule',rule:'xy5:megatonSlam'}}]},
 'xy5-106':{id:'xy5-106',name:'M Gardevoir-EX',kind:'pokemon',stage:'Stage 1',hp:210,types:['Fairy'],pokemonEX:true,battleEnabled:true,
   attacks:[{name:'Brilliant Arrow',cost:[],damage:0,effect:{type:'neoRule',rule:'xy5:brilliantArrow'}}]},
 'xy5-105':{id:'xy5-105',name:'Gardevoir-EX',kind:'pokemon',stage:'Basic',hp:170,types:['Fairy'],weakness:'Metal',weaknessValue:'×2',battleEnabled:true,
   attacks:[{name:'Shining Wind',cost:[],damage:100,effect:{type:'weaknessGuard',duration:'opponentTurn'}}]},
 'xy5-122':{id:'xy5-122',name:'Acro Bike',kind:'trainer',trainerType:'Item',battleEnabled:true,effect:{type:'neoRule',rule:'xy5:acroBike'}},
 'xy5-136':{id:'xy5-136',name:'Repeat Ball',kind:'trainer',trainerType:'Item',battleEnabled:true,effect:{type:'neoRule',rule:'xy5:repeatBall'}},
 'xy5-138':{id:'xy5-138',name:'Scorched Earth',kind:'trainer',trainerType:'Stadium',battleEnabled:true,effect:{type:'stadiumAction',effect:{type:'neoRule',rule:'xy5:scorchedEarth'}}},
 'test-metal-attack':{id:'test-metal-attack',name:'Steelix',kind:'pokemon',stage:'Basic',hp:300,types:['Metal'],battleEnabled:true,attacks:[{name:'Metal Claw',cost:[],damage:40,effect:{type:'noop'}}]},
 'test-opp-item':{id:'test-opp-item',name:'Energy Removal',kind:'trainer',trainerType:'Item',battleEnabled:true,effect:{type:'discardEnergyCard',target:'opponentActive',amount:1}},
 'test-opp-tool':{id:'test-opp-tool',name:'Tool Jam',kind:'trainer',trainerType:'Tool',battleEnabled:true,effect:{type:'discardEnergyCard',target:'opponentActive',amount:1}},
 'test-omega':{id:'test-omega',name:'Sceptile',kind:'pokemon',stage:'Stage 2',hp:180,types:['Grass'],battleEnabled:true,ancientTrait:{name:'Ω Barrier'},attacks:[]}
});

test('Mega Aggron may decline its coin; heads add 120 and tails deal 20 to own Bench',()=>withCards(()=>{
 const prep=seed=>{const s=scene();s.rngState=seed;s.sides.player.active=mk('xy5-94','aggron');
   s.sides.opponent.active=mk('test-metal-attack','opponent');return s;};
 const no=prep(2);use(no,'player',a=>a.type==='attack'&&!a.effectSelection);
 assert.equal(no.sides.opponent.active.damage,120);assert.equal(no.sides.player.bench[0].damage,0);
 const heads=prep(2);use(heads,'player',a=>a.type==='attack'&&a.effectSelection==='flip');
 assert.equal(heads.sides.opponent.active.damage,240);assert.equal(heads.sides.player.bench[0].damage,0);
 const tails=prep(4000000000);use(tails,'player',a=>a.type==='attack'&&a.effectSelection==='flip');
 assert.equal(tails.sides.opponent.active.damage,120);assert.equal(tails.sides.player.bench[0].damage,20);
 assert.ok(tails.log.some(x=>x.type==='benchDamage'&&x.amount===20));
}));

test('Mega Gardevoir counts real Fairy Energy on the whole team, one per compatible Special card',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active=mk('xy5-106','mega');p.active.energy.Fairy=1;
 p.bench=[mk('test-fairy','fairy',0),mk('test-normal','other',1)];p.bench[0].energy.Fairy=2;
 p.bench[0].specialEnergy=[ref('xy5-144','wonder')];
 s.sides.opponent.active=mk('test-metal-attack','target');
 use(s,'player',a=>a.type==='attack');assert.equal(s.sides.opponent.active.damage,120);
}));

test('Gardevoir Shining Wind cancels incoming Weakness only on opponent next turn',()=>withCards(()=>{
 const s=scene();s.sides.player.active=mk('xy5-105','gard');s.sides.opponent.active=mk('test-metal-attack','steel');
 use(s,'player',a=>a.type==='attack');assert.equal(s.sides.player.active.weaknessGuard?.duration,'opponentTurn');
 use(s,'opponent',a=>a.type==='attack');assert.equal(s.sides.player.active.damage,40,'40 not 80');
}));

test('Acro Bike takes one of the actual top two physical deck refs and discards the other',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.hand=[ref('xy5-122','bike')];
 p.deck=[ref('test-grass','top1'),ref('test-lightning','top2'),ref('test-normal','top3')];
 use(s,'player',a=>a.type==='trainer'&&a.cardId==='xy5-122');
 assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.options.length,2);
 const choice=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceOption===1);assert.ok(choice);
 core.applyAction(s,'player',choice);
 assert.ok(p.hand.some(r=>r.uid==='top2'));
 assert.ok(p.discard.some(r=>r.uid==='top1'));assert.ok(p.deck.some(r=>r.uid==='top3'));
 assert.ok(!p.deck.some(r=>r.uid==='top1'||r.uid==='top2'));
}));

test('Repeat Ball searches only for an identical name in play and transfers actual deck ref',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.hand=[ref('xy5-136','ball')];
 p.deck=[ref('test-normal','same1'),ref('test-grass','wrong'),ref('test-normal','same2')];
 use(s,'player',a=>a.type==='trainer'&&a.cardId==='xy5-136');
 assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.options.length,2);
 const choice=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceOption===1);core.applyAction(s,'player',choice);
 assert.ok(p.hand.some(r=>r.uid==='same2'));assert.ok(p.deck.some(r=>r.uid==='wrong'));
 assert.ok(p.deck.some(r=>r.uid==='same1'));assert.equal(p.deck.some(r=>r.uid==='same2'),false);
}));

test('Scorched Earth needs real Fire/Fighting Energy in hand; discards chosen ref and draws two',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;s.stadium=ref('xy5-138','earth');
 p.hand=[ref('test-energy-water','water')];p.deck=[ref('test-grass','d1'),ref('test-normal','d2')];
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='stadiumAction'),false);
 p.hand.push(ref('test-energy-fire','fire'));
 use(s,'player',a=>a.type==='stadiumAction');assert.equal(s.phase,'effectChoice');
 const choice=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceOption===0);
 assert.ok(choice);core.applyAction(s,'player',choice);
 assert.ok(p.discard.some(r=>r.uid==='fire'));assert.ok(p.hand.some(r=>r.uid==='d1'));assert.ok(p.hand.some(r=>r.uid==='d2'));
 assert.equal(p.hand.some(r=>r.uid==='fire'),false);assert.equal(p.deck.length,0);
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='stadiumAction'),false);
}));

test('Ω Barrier is scoped to opposing Item/Supporter effects, not opponent Tools or attacks',()=>withCards(()=>{
 const s=scene();s.sides.opponent.active=mk('test-omega','barrier');s.sides.opponent.active.energy.Water=2;
 const ctx={state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,
  cardById:data.cardById,trainerRef:ref('test-opp-item','item'),isTrainer:true};
 effects.applyEffect({type:'discardEnergyCard',target:'opponentActive',amount:1},ctx);
 assert.equal(s.sides.opponent.active.energy.Water,2,'Opponent Item cannot discard Energy from Ω Barrier');
 effects.applyEffect({type:'discardEnergyCard',target:'opponentActive',amount:1},{...ctx,trainerRef:ref('test-opp-tool','tool')});
 assert.equal(s.sides.opponent.active.energy.Water,1,'Tool is excluded by printed Ω Barrier');
 effects.applyEffect({type:'discardEnergyCard',target:'opponentActive',amount:1},{...ctx,trainerRef:null,isAttack:true});
 assert.equal(s.sides.opponent.active.energy.Water,0,'Attacks are not protected by Ω Barrier');
}));

test('Primal Clash generator enables only completed new rules and still gates Ω Barrier prints',()=>{
 const {spawnSync}=require('node:child_process');
 const code=String.raw`
import sys,json,importlib.util
s=sys.argv[1];sys.path.insert(0,s)
sp=importlib.util.spec_from_file_location('buildxy5',s+'/build-xy5.py')
m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
def row(n,name,sup='Pokémon',sub=None,types=None,att=None,ab=None,trait=None,ev=None,rules=None):
 return [str(n),name,sup,sub or (['Basic'] if sup=='Pokémon' else ['Item']),220,types or (['Water'] if sup=='Pokémon' else []),ev,att or [],ab or [],None,None,1,'Rare',rules or [],None,trait]
omega={'name':'Ω Barrier','text':'Prevent certain opposing Trainer effects'}
alpha={'name':'α Growth','text':'Attach an extra card from hand'}
rows=[
 row(55,'Primal Kyogre-EX',sub=['MEGA','EX'],trait=alpha,ev='Kyogre-EX',att=[['Tidal Storm',['W','W','W','C'],'150','Move 2 Energy from this Pokémon to 1 of your Benched Pokémon.']]),
 row(86,'Primal Groudon-EX',sub=['MEGA','EX'],trait=omega,ev='Groudon-EX',att=[['Gaia Volcano',['F','F','F','C'],'100+','If there is any Stadium card in play, this attack does 100 more damage. Discard that Stadium card.']]),
 row(94,'M Aggron-EX',sub=['MEGA','EX'],types=['Metal'],ev='Aggron-EX',att=[['Megaton Slam',['M','M','C','C'],'120+','You may flip a coin.']]),
 row(106,'M Gardevoir-EX',sub=['MEGA','EX'],types=['Fairy'],ev='Gardevoir-EX',att=[['Brilliant Arrow',['Y','C','C'],'30×','This attack does 30 damage times the amount of Fairy Energy attached to all of your Pokémon.']]),
 row(100,'Aegislash',sub=['Stage 2'],types=['Metal'],ab=[['Miracle Guard','Ability','Each of your Pokémon has no Weakness.']]),
 row(119,'Bouffalant',ab=[['Sap Sipper','Ability','This Pokémon does 40 more damage to Grass Pokémon.']]),
 row(122,'Acro Bike','Trainer',['Item']),row(136,'Repeat Ball','Trainer',['Item']),
 row(137,'Rough Seas','Trainer',['Stadium']),row(138,'Scorched Earth','Trainer',['Stadium']),
 row(139,'Shrine of Memories','Trainer',['Stadium']),row(140,'Silent Lab','Trainer',['Stadium']),
 row(142,'Weakness Policy','Trainer',['Pokémon Tool']),row(164,'Weakness Policy','Trainer',['Pokémon Tool'])
]
print(json.dumps(m.generate(rows)))`;
 const p=require('node:path').resolve(__dirname,'../scripts');
 const result=spawnSync('python3',['-c',code,p],{encoding:'utf8',maxBuffer:1024*1024});
 assert.equal(result.status,0,result.stderr);
 const by=Object.fromEntries(JSON.parse(result.stdout).map(c=>[c.number,c]));
 assert.equal(by['86'].battleEnabled,false,'Ω Barrier still gated despite working Gaia Volcano attack');
 assert.equal(by['86'].attacks[0].effect.rule,'xy5:gaiaVolcano');
 for(const n of ['55','94','100','106','119','122','136','137','138','139','140','142','164']){
   const c=by[n];assert.equal(c.battleEnabled,true,c.id+': '+c.support.reasons.join('; '));
   for(const a of c.attacks||[])assert.deepEqual(effects.validateEffect(a.effect),[],c.id+' '+a.name);
   if(c.kind==='trainer')assert.deepEqual(effects.validateEffect(c.effect),[],c.id);
 }
 assert.deepEqual(by['94'].attacks[0].cost,['M','M','C','C']);
 assert.equal(by['106'].attacks[0].damage,0,'dynamic 30× is not interpreted as flat 30');
});
