'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcgp-battle-data.js'));
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const loan=require(path.join(assets,'tcg-classic-battle-data.js')).CLASSIC30_LOANER_DECK;
const script=String.raw`
import sys,json,importlib.util
p=sys.argv[1];sys.path.insert(0,p)
s=importlib.util.spec_from_file_location('xy7',p+'/build-xy7.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
rows=[]
for n,name,sub,evo,att,ability in [
('3','Vileplume',['Stage 2'],'Gloom',[['Solar Beam',['G','G','C'],'70','']],[['Irritating Pollen','Ability','Each player cannot play Item cards from hand.']]),
('6','Ariados',['Stage 1'],'Spinarak',[['Impound',['G'],'30',"The Defending Pokémon can't retreat during your opponent's next turn."]],[['Poisonous Nest','Ability','Once during your turn, both Active Pokémon except Grass Pokémon are now Poisoned.']]),
('13','Flareon',['Stage 1'],'Eevee',[['Heat Breath',['R'],'60+','Flip a coin. If heads, this attack does 20 more damage.']],[['Flare Effect','Ability','Each Stage 1 Pokémon is also Fire.']]),
('22','Vaporeon',['Stage 1'],'Eevee',[['Hydro Splash',['W'],'70','']],[['Aqua Effect','Ability','Each Stage 1 Pokémon is also Water.']]),
('26','Jolteon',['Stage 1'],'Eevee',[['Thunder Blast',['L'],'80','Discard an Energy attached to this Pokémon.']],[['Electric Effect','Ability','Each Stage 1 Pokémon is also Lightning.']]),
('30','Unown',['Basic'],None,[['Hidden Power',['P'],'10','']],[['Farewell Letter','Ability','Once during your turn, if on Bench, discard this and attached cards to draw one card.']]),
('35','Golurk',['Stage 1'],'Golett',[['Superpower',['F','C'],'80+','You may do 40 more damage. If you do, this Pokémon does 20 damage to itself.']],[['Double Type','Ability','While in play, this is Psychic and Fighting type.']]),
]:rows.append([n,name,'Pokémon',sub,100,['Grass' if n in ('3','6') else 'Psychic'],evo,att,ability,None,None,1,'Rare',[],None,None])
print(json.dumps(m.generate(rows)))`;
const py=spawnSync('python3',['-c',script,path.join(root,'scripts')],{encoding:'utf8',maxBuffer:3*1024*1024});
assert.equal(py.status,0,py.stderr);
const cards=Object.fromEntries(JSON.parse(py.stdout).map(c=>[c.id,c]));
Object.assign(cards,{
 'demo-basic':{id:'demo-basic',name:'Test Basic',kind:'pokemon',stage:'Basic',hp:150,types:['Colorless'],battleEnabled:true,attacks:[{name:'Tap',damage:10,cost:'C',effect:{type:'noop'}}]},
 'demo-stage1':{id:'demo-stage1',name:'Test Evolved',kind:'pokemon',stage:'Stage 1',hp:150,types:['Colorless'],battleEnabled:true,attacks:[{name:'Tap',damage:10,cost:'C',effect:{type:'noop'}}]},
 'demo-stage2':{id:'demo-stage2',name:'Test Final',kind:'pokemon',stage:'Stage 2',hp:150,types:['Colorless'],battleEnabled:true,attacks:[{name:'Tap',damage:10,cost:'C',effect:{type:'noop'}}]},
 'demo-item':{id:'demo-item',name:'Test Item',kind:'trainer',trainerType:'Item',battleEnabled:true,effect:{type:'noop'}},
 'demo-tool':{id:'demo-tool',name:'Test Tool',kind:'trainer',trainerType:'Tool',battleEnabled:true,effect:{type:'noop'}},
 'demo-supporter':{id:'demo-supporter',name:'Test Supporter',kind:'trainer',trainerType:'Supporter',battleEnabled:true,effect:{type:'noop'}},
});
const ref=(cardId,uid)=>({cardId,uid:uid||cardId});
const mon=(cardId,uid,benchSlot=null)=>({uid,cardId,stack:[cardId],damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],benchSlot,conditions:{},playedOnSideTurn:1});
function using(fn){const original=data.cardById;data.cardById=id=>cards[id]||original(id);try{return fn();}finally{data.cardById=original;}}
function battle(){const s=core.createBattle({format:'classic',playerDeck:loan,opponentDeck:loan,seed:365,firstSide:'player',playerEnergyTypes:['Grass','Fire'],opponentEnergyTypes:['Psychic']});s.phase='battle';s.turnNumber=10;s.activeSide='player';for(const ss of Object.values(s.sides)){ss.turnCount=5;ss.hand=[];ss.bench=[];ss.supporterUsed=false;ss.handEnergyUsed=false;ss.energyUsed=false;}s.sides.player.active=mon('demo-basic','me');s.sides.opponent.active=mon('demo-basic','opp');return s;}
test('all seven Ancient Origins Ability prints have complete handlers',()=>{
 for(const c of Object.values(cards).filter(c=>c.id.startsWith('xy7-'))){assert.equal(c.battleEnabled,true,c.id+': '+JSON.stringify(c.support));for(const a of c.attacks)assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);for(const a of c.abilities)assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);}
});
test('Vileplume Irritating Pollen stops both players Items but not Supporters, and vanishes when suppressed',()=>using(()=>{
 const s=battle(),p=s.sides.player,o=s.sides.opponent;
 p.active=mon('xy7-3','flower');p.hand=[ref('demo-item','i'),ref('demo-tool','t'),ref('demo-supporter','sp')];
 o.hand=[ref('demo-item','ii')];
 assert.ok(!core.legalActions(s,'player').some(a=>a.cardId==='demo-item'));
 assert.ok(!core.legalActions(s,'player').some(a=>a.cardId==='demo-tool'),'Pokemon Tools are Items for Irritating Pollen');
 assert.ok(core.legalActions(s,'player').some(a=>a.cardId==='demo-supporter'));
 assert.equal(fx.isActionLocked(s,'opponent','Item',data.cardById),true);
 assert.equal(fx.isActionLocked(s,'opponent','Tool',data.cardById),true);
 p.active.abilitySuppressed={duration:'whileInPlay'};
 assert.ok(core.legalActions(s,'player').some(a=>a.cardId==='demo-item'));
 assert.ok(core.legalActions(s,'player').some(a=>a.cardId==='demo-tool')); 
 assert.equal(fx.isActionLocked(s,'opponent','Item',data.cardById),false);
}));
test('Ariados Poisonous Nest affects both Actives once per turn, respects Grass and theta Stop',()=>using(()=>{
 const s=battle();s.sides.player.bench=[mon('xy7-6','spider',0)];
 const action=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='xy7-6');assert.ok(action);
 core.applyAction(s,'player',action);
 assert.equal(s.sides.player.active.conditions.poison.amount,10);
 assert.equal(s.sides.opponent.active.conditions.poison.amount,10);
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='xy7-6'));
 // With a Grass Active and opponent theta Stop, neither should be poisoned.
 s.sides.player.active=mon('xy7-6','grass');s.sides.opponent.active=mon('demo-basic','opptheta');
 cards['demo-basic'].ancientTrait={name:'θ Stop'};
 s.sides.player.bench[0].uid='new-spider';
 const next=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='xy7-6');
 assert.equal(next,undefined,'no inert Ability should be advertised');
 const ctx={state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.bench[0],defender:s.sides.opponent.active,cardById:data.cardById,isAbility:true};
 fx.applyEffect({type:'xy7PoisonousNest'},ctx);
 assert.equal(s.sides.player.active.conditions.poison,undefined);
 assert.equal(s.sides.opponent.active.conditions.poison,undefined);
 // A new Poison cannot reduce a pre-existing 20-damage Poison to ten.
 s.sides.opponent.active.cardId='demo-basic';delete cards['demo-basic'].ancientTrait;
 s.sides.opponent.active.conditions={poison:{amount:20}};
 fx.applyEffect({type:'xy7PoisonousNest'},ctx);
 assert.equal(s.sides.opponent.active.conditions.poison.amount,20);
}));
test('Eeveelution auras add only to friendly Stage 1 types and stack, including suppressed targets',()=>using(()=>{
 const s=battle(),p=s.sides.player;
 p.active=mon('demo-stage1','receiver');p.active.abilitySuppressed={duration:'whileInPlay'};
 p.bench=[mon('xy7-13','fl',0),mon('xy7-22','va',1),mon('xy7-26','jo',2),mon('demo-stage2','end',3)];
 assert.deepEqual(fx.effectiveTypes(s,'player',p.active,data.cardById).sort(),['Colorless','Fire','Lightning','Water'].sort());
 assert.deepEqual(fx.effectiveTypes(s,'player',p.bench[3],data.cardById),['Colorless']);
 assert.deepEqual(fx.effectiveTypes(s,'opponent',s.sides.opponent.active,data.cardById),['Colorless']);
 p.bench[0].abilitySuppressed={duration:'whileInPlay'};
 assert.ok(!fx.effectiveTypes(s,'player',p.active,data.cardById).includes('Fire'));
}));
test('Golurk Double Type is suppressed as a normal Ability',()=>using(()=>{
 const s=battle();s.sides.player.active=mon('xy7-35','golem');
 assert.deepEqual(fx.effectiveTypes(s,'player',s.sides.player.active,data.cardById).sort(),['Fighting','Psychic']);
 s.sides.player.active.abilitySuppressed={duration:'whileInPlay'};
 assert.deepEqual(fx.effectiveTypes(s,'player',s.sides.player.active,data.cardById),['Psychic']);
}));
test('Unown Farewell Letter discards its actual Bench card and attachments before drawing',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.bench=[mon('xy7-30','letter',0)];p.bench[0].tool=ref('demo-item','tool');p.bench[0].energy={Grass:1};
 p.deck=[ref('demo-basic','real-deck')];
 const a=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='xy7-30');assert.ok(a);
 core.applyAction(s,'player',a);
 assert.equal(p.bench.length,0);
 assert.ok(p.discard.some(r=>r.cardId==='xy7-30'));
 assert.ok(p.discard.some(r=>r.uid==='tool'));
 assert.equal(p.energyDiscard.Grass,1);
 assert.ok(p.hand.some(r=>r.uid==='real-deck'));
}));
