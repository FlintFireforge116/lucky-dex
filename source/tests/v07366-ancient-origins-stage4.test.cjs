'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),asset=path.join(root,'app/src/main/assets');
const data=require(path.join(asset,'tcgp-battle-data.js'));
const fx=require(path.join(asset,'tcgp-battle-effects.js'));
const core=require(path.join(asset,'tcgp-battle-core.js'));
const loan=require(path.join(asset,'tcg-classic-battle-data.js')).CLASSIC30_LOANER_DECK;
const make=String.raw`
import sys,json,importlib.util
p=sys.argv[1];sys.path.insert(0,p)
s=importlib.util.spec_from_file_location('xy7',p+'/build-xy7.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
rows=[]
for n,name,supertype,sub,types,attacks,abilities in [
 ('73','Faded Town','Trainer',['Stadium'],[],[],[]),
 ('74','Forest of Giant Plants','Trainer',['Stadium'],[],[],[]),
 ('75','Hex Maniac','Trainer',['Supporter'],[],[],[]),
 ('75a','Hex Maniac','Trainer',['Supporter'],[],[],[]),
 ('82','Dangerous Energy','Energy',['Special'],[],[],[]),
 ('83','Flash Energy','Energy',['Special'],[],[],[]),
 ('1','Oddish','Pokémon',['Basic'],['Grass'],[['Trip Over',['G'],'10+','Flip a coin. If heads, this attack does 10 more damage.']],[]),
 ('2','Gloom','Pokémon',['Stage 1'],['Grass'],[['Drool',['G'],'20','']],[]),
]:
 rows.append([n,name,supertype,sub,80 if supertype=='Pokémon' else None,types,'Oddish' if n=='2' else None,attacks,abilities,None,None,1,'Uncommon',[],None,None])
print(json.dumps(m.generate(rows)))`;
const generated=spawnSync('python3',['-c',make,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(generated.status,0,generated.stderr);
const printed=Object.fromEntries(JSON.parse(generated.stdout).map(c=>[c.id,c]));
const demo=(id,name,types,opts={})=>({id,name,kind:'pokemon',stage:'Basic',hp:200,types,subtype:types[0],weakness:null,retreat:1,battleEnabled:true,attacks:[{name:'Tap',cost:'C',damage:30,effect:{type:'noop'}}],abilities:[],...opts});
Object.assign(printed,{
 'demo-dark':demo('demo-dark','Darkness Defender',['Darkness']),
 'demo-ex':demo('demo-ex','Fighting EX',['Fighting'],{pokemonEX:true,weakness:'Darkness'}),
 'demo-electric':demo('demo-electric','Electric Defender',['Lightning'],{weakness:'Fighting',weaknessValue:'×2'}),
 'demo-water':demo('demo-water','Water Basic',['Water']),
 'demo-grass':demo('demo-grass','Grass Basic',['Grass']),
 'demo-water-evo':demo('demo-water-evo','Water Evolution',['Water'],{stage:'Stage 1',evolvesFrom:'Water Basic'}),
 'demo-mega':demo('demo-mega','M Test-EX',['Darkness'],{stage:'Stage 1',megaEvolution:true,prizeCards:2}),
 'demo-ability':demo('demo-ability','Ability Pokemon',['Grass'],{abilities:[{name:'Test Power',type:'activated',oncePerTurn:true,effect:{type:'draw',amount:1}}]}),
});
const cardId=id=>printed[id]||oldGet(id);
const oldGet=data.cardById;
function using(fn){data.cardById=cardId;try{return fn();}finally{data.cardById=oldGet;}}
const ref=(cardId,uid)=>({cardId,uid:uid||cardId});
const mon=(cardId,uid,benchSlot=null)=>({uid,cardId,stack:[cardId],damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],benchSlot,conditions:{},playedOnSideTurn:1});
function battle(){const s=core.createBattle({format:'classic',playerDeck:loan,opponentDeck:loan,seed:366,firstSide:'player',playerEnergyTypes:['Grass','Fighting'],opponentEnergyTypes:['Darkness']});s.phase='battle';s.turnNumber=10;s.activeSide='player';for(const ss of Object.values(s.sides)){ss.turnCount=4;ss.hand=[];ss.bench=[];ss.supporterUsed=false;ss.stadiumUsed=false;ss.handEnergyUsed=false;ss.energyUsed=false;ss.handLimit=8;}s.sides.player.active=mon('demo-grass','p');s.sides.opponent.active=mon('demo-dark','o');return s;}
function actual(s,side,filter){const action=core.legalActions(s,side).find(filter);assert.ok(action,'No legal action: '+JSON.stringify(core.legalActions(s,side).slice(0,18)));core.applyAction(s,side,action);return action;}

test('all six Stage 4 prints are unlocked with explicitly supported effects',()=>{
 for(const id of ['73','74','75','75a','82','83']){const c=printed['xy7-'+id];assert.equal(c.battleEnabled,true,c.id+JSON.stringify(c.support));if(c.effect)assert.deepEqual(fx.validateEffect(c.effect),[],id);}
});
test('Forest of Giant Plants permits same-turn and first-turn Grass evolutions, not Water evolution',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.turnCount=1;s.turnNumber=1;p.active=mon('xy7-1','oddish');p.active.playedOnSideTurn=1;
 p.bench=[mon('demo-water','fish',0)];p.bench[0].playedOnSideTurn=1;
 p.hand=[ref('xy7-2','gloom'),ref('demo-water-evo','waterevo')];
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='evolve'),false);
 s.stadium={uid:'forest',cardId:'xy7-74',ownerSide:'opponent'};
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='evolve'&&a.cardId==='xy7-2'));
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='evolve'&&a.cardId==='demo-water-evo'));
 s.stadium={uid:'faded',cardId:'xy7-73',ownerSide:'opponent'};
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='evolve'&&a.cardId==='xy7-2'));
}));
test('Faded Town puts 20 damage on EACH Mega between turns, including Benched and both players; stops on replacement',()=>using(()=>{
 const s=battle();s.stadium={uid:'faded',cardId:'xy7-73',ownerSide:'player'};
 s.sides.player.bench=[mon('demo-mega','myMega',0),mon('xy7-1','myOddish',1)];
 s.sides.opponent.active=mon('demo-mega','theirMega');
 actual(s,'player',a=>a.type==='endTurn');
 assert.equal(s.sides.player.bench[0].damage,20);assert.equal(s.sides.player.bench[1].damage,0);assert.equal(s.sides.opponent.active.damage,20);
 s.stadium={uid:'other',cardId:'xy7-74',ownerSide:'opponent'};
 actual(s,'opponent',a=>a.type==='endTurn');
 assert.equal(s.sides.player.bench[0].damage,20);assert.equal(s.sides.opponent.active.damage,20);
}));
test('Hex Maniac suppresses both teams for its played turn and opposing next turn, including newly benched Pokemon; original player following turn restores them',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.hand=[ref('xy7-75','hex')];p.bench=[mon('demo-ability','power',0)];
 assert.equal(fx.abilitiesSuppressed(s,'player',p.bench[0],data.cardById),false);
 actual(s,'player',a=>a.type==='trainer'&&a.cardId==='xy7-75');
 assert.equal(s.xy7HexManiacUntil,11);
 assert.equal(fx.abilitiesSuppressed(s,'player',p.bench[0],data.cardById),true);
 s.sides.opponent.bench=[mon('demo-ability','later',0)];
 actual(s,'player',a=>a.type==='endTurn');
 assert.equal(fx.abilitiesSuppressed(s,'opponent',s.sides.opponent.bench[0],data.cardById),true);
 actual(s,'opponent',a=>a.type==='endTurn');
 assert.equal(fx.abilitiesSuppressed(s,'player',p.bench[0],data.cardById),false);
}));
test('Flash Energy may attach only to Lightning, prevents weakness including wide-lens bench calculations, and leaves when discarded',()=>using(()=>{
 const s=battle();s.sides.player.active=mon('demo-electric','electric');s.sides.player.hand=[ref('xy7-83','flash')];
 const target=s.sides.player.active;
 assert.equal(fx.attackDamageWithState(s,'opponent',mon('demo-ex','ex'),'player',target,40,data.cardById),80);
 actual(s,'player',a=>a.type==='attachSpecial'&&a.cardId==='xy7-83');
 assert.equal(target.specialEnergy.length,1);
 assert.equal(fx.attackDamageWithState(s,'opponent',mon('demo-ex','ex'),'player',target,40,data.cardById),40);
 target.specialEnergy=[];
 assert.equal(fx.attackDamageWithState(s,'opponent',mon('demo-ex','ex'),'player',target,40,data.cardById),80);
 s.sides.player.hand=[ref('xy7-83','flash2')];s.sides.player.handEnergyUsed=false;s.sides.player.active=mon('demo-dark','dark');
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='attachSpecial'&&a.cardId==='xy7-83'));
}));
test('Dangerous Energy may attach only to Darkness and places damage counters on attacking EX before knockout',()=>using(()=>{
 const s=battle();s.sides.player.hand=[ref('xy7-82','danger')];
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='attachSpecial'&&a.cardId==='xy7-82'));
 s.sides.player.active=mon('demo-dark','dark');
 actual(s,'player',a=>a.type==='attachSpecial'&&a.cardId==='xy7-82');
 assert.equal(s.sides.player.active.specialEnergy[0].cardId,'xy7-82');
 // Normal attack by opponent EX, damage is real even if defender later KOs.
 s.activeSide='opponent';s.sides.opponent.active=mon('demo-ex','attacking-ex');s.sides.opponent.active.energy={Colorless:1};
 const attack=core.legalActions(s,'opponent').find(a=>a.type==='attack');assert.ok(attack);
 core.applyAction(s,'opponent',attack);
 assert.equal(s.sides.opponent.active.damage,20,'EX receives two counters');
}));

test('Restricted XY7 Special Energy moved to an ineligible host is discarded as a physical card',()=>using(()=>{
 const s=battle(),p=s.sides.player;
 p.active=mon('demo-water','water');
 p.active.specialEnergy=[ref('xy7-82','strayDanger'),ref('xy7-83','strayFlash')];
 const before=p.discard.length;
 core.legalActions(s,'player');
 assert.equal(p.active.specialEnergy.length,0);
 assert.deepEqual(p.discard.slice(before).map(r=>r.cardId).sort(),['xy7-82','xy7-83']);
 assert.equal(s.log.filter(x=>x.type==='xy7RestrictedEnergyDiscard').length,2);
}));

test('Hex Maniac temporarily disables discard-zone abilities as well as board abilities',()=>using(()=>{
 const s=battle(),p=s.sides.player;
 p.discard.push(ref('bw10-102','plasma-exeggcute'));
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='bw10DiscardAbility'));
 p.hand.push(ref('xy7-75','hex'));
 actual(s,'player',a=>a.type==='trainer'&&a.cardId==='xy7-75');
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='bw10DiscardAbility'),false);
 actual(s,'player',a=>a.type==='endTurn');
 assert.equal(core.legalActions(s,'opponent').some(a=>a.type==='bw10DiscardAbility'),false);
 actual(s,'opponent',a=>a.type==='endTurn');
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='bw10DiscardAbility'));
}));
