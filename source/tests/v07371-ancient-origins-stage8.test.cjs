'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const ai=require(path.join(assets,'tcgp-battle-ai.js'));
const loan=data.CLASSIC30_LOANER_DECK;
const python=String.raw`
import sys,json,importlib.util
p=sys.argv[1];sys.path.insert(0,p)
s=importlib.util.spec_from_file_location('xy7',p+'/build-xy7.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
rows=[]
def mon(n,name,at,abilities=[],stage='Basic'):
 rows.append([n,name,'Pokémon',[stage],200,['Dragon'],None,at,abilities,None,None,1,'Rare',[],None,None])
mon('49','Metagross', [['Iron Cannon',['M','M'],'80+','You may discard all Metal Energy attached to this Pokémon. If you do, this attack does 80 more damage.']], [['Magnetic Warp','Ability','Once during your turn (before your attack), you may switch your Active Pokémon with 1 of your Benched Pokémon. If you do, your opponent switches his or her Active Pokémon with 1 of his or her Benched Pokémon.']], 'Stage 2')
for n in ['57','93']:
 mon(n,'Giratina-EX',[['Chaos Wheel',['G','P','C'],'100',"Your opponent can't play any Pokémon Tool, Special Energy, or Stadium cards from his or her hand during his or her next turn."]], [['Renegade Pulse','Ability',"Prevent all effects of attacks, including damage, done to this Pokémon by your opponent's Mega Evolution Pokémon."]])
print(json.dumps(m.generate(rows)))`;
const generated=spawnSync('python3',['-c',python,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(generated.status,0,generated.stderr);
const cards=Object.fromEntries(JSON.parse(generated.stdout).map(c=>[c.id,c]));
const basic=(id,name,props={})=>({id,name,kind:'pokemon',stage:'Basic',types:['Colorless'],hp:230,retreat:1,battleEnabled:true,attacks:[{name:'Tap',cost:['C'],damage:20,effect:{type:'noop'}}],...props});
Object.assign(cards,{
 'fixture-basic':basic('fixture-basic','Basic One'),
 'fixture-basic2':basic('fixture-basic2','Basic Two'),
 'fixture-theta-stop':basic('fixture-theta-stop','Ancient Guard',{ancientTrait:{name:'θ Stop',text:'Prevent opposing Ability effects'}}),
 'fixture-mega':basic('fixture-mega','M Rayquaza-EX',{stage:'Stage 1',megaEvolution:true,attacks:[{name:'Mega Attack',cost:['C'],damage:60,effect:{type:'status',target:'opponentActive',status:'poison'}}]}),
 'fixture-tool':{id:'fixture-tool',kind:'trainer',trainerType:'Tool',name:'Test Tool',battleEnabled:true,effect:{type:'noop'}},
 'fixture-stadium':{id:'fixture-stadium',kind:'trainer',trainerType:'Stadium',name:'Test Stadium',battleEnabled:true,effect:{type:'noop'}},
 'fixture-metal':{id:'fixture-metal',kind:'energy',specialEnergy:true,energyType:'Metal',subtype:'Metal',battleEnabled:true,effect:{type:'specialEnergy',provides:{Metal:1}}}
});
const old=data.cardById;
const using=fn=>{data.cardById=id=>cards[id]||old(id);try{return fn();}finally{data.cardById=old;}};
const ref=(cardId,uid)=>({cardId,uid:uid||cardId});
const mon=(cardId,uid,benchSlot=null)=>({uid,cardId,stack:[cardId],benchSlot,damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],conditions:{},playedOnSideTurn:1});
function battle(id='xy7-57'){
 const s=core.createBattle({format:'classic',playerDeck:loan,opponentDeck:loan,seed:371,firstSide:'player',playerEnergyTypes:['Grass','Psychic','Metal'],opponentEnergyTypes:['Water']});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;
 for(const ss of Object.values(s.sides)){ss.turnCount=5;ss.hand=[];ss.deck=[];ss.discard=[];ss.bench=[];ss.actionLocks=[];ss.handEnergyUsed=false;ss.energyUsed=false;ss.supporterUsed=false;ss.energyDiscard={};}
 s.sides.player.active=mon(id,'actor');s.sides.player.active.energy={Grass:3,Psychic:3,Metal:3};s.sides.opponent.active=mon('fixture-basic','target');return s;
}
function act(s,side,predicate){const legal=core.legalActions(s,side),a=legal.find(predicate);assert.ok(a,'Missing action for '+side+'; have '+JSON.stringify(legal.slice(0,20)));core.applyAction(s,side,a);return a;}

test('Stage 8 enables both Giratina-EX prints and Metagross with valid descriptors',()=>{
 for(const n of ['49','57','93']){
  const c=cards['xy7-'+n];assert.equal(c.battleEnabled,true,JSON.stringify(c.support));
  for(const a of c.attacks||[])assert.deepEqual(fx.validateEffect(a.effect),[],n+' '+a.name);
  for(const a of c.abilities||[])assert.deepEqual(fx.validateEffect(a.effect),[],n+' '+a.name);
 }
});
test('Giratina-EX Renegade Pulse prevents Mega attack damage and effects, but not ordinary attacks or when suppressed',()=>using(()=>{
 const s=battle('fixture-mega'),t=s.sides.opponent.active;t.cardId='xy7-57';
 assert.ok(fx.attackIsPrevented(s,'opponent',t,s.sides.player.active,data.cardById)?.effects);
 assert.equal(fx.attackEffectsPrevented(s,'opponent',t,s.sides.player.active,data.cardById),true);
 t.abilitySuppressed={duration:'whileInPlay'};
 assert.ok(!fx.attackIsPrevented(s,'opponent',t,s.sides.player.active,data.cardById)?.effects);
 assert.equal(fx.attackEffectsPrevented(s,'opponent',t,s.sides.player.active,data.cardById),false);
 delete t.abilitySuppressed;s.sides.player.active.cardId='fixture-basic';
 assert.ok(!fx.attackIsPrevented(s,'opponent',t,s.sides.player.active,data.cardById)?.effects);
}));
test('Chaos Wheel locks hand-played Tools, Stadiums and Special Energy only for the next opposing turn',()=>using(()=>{
 const s=battle(),o=s.sides.opponent;o.hand=[ref('fixture-tool','tool'),ref('fixture-stadium','stadium'),ref('fixture-metal','metal')];
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(o.active.damage,100);
 assert.equal(s.activeSide,'opponent');
 for(const t of ['Tool','Stadium','SpecialEnergy'])assert.equal(fx.isActionLocked(s,'opponent',t,data.cardById),true,t);
 assert.equal(fx.isActionLocked(s,'opponent','Item',data.cardById),false);
 assert.equal(fx.isActionLocked(s,'opponent','Supporter',data.cardById),false);
 assert.ok(!core.legalActions(s,'opponent').some(a=>a.type==='trainer'&&['fixture-tool','fixture-stadium'].includes(a.cardId)||a.type==='attachSpecial'&&a.cardId==='fixture-metal'));
 s.turnNumber+=2;
 for(const t of ['Tool','Stadium','SpecialEnergy'])assert.equal(fx.isActionLocked(s,'opponent',t,data.cardById),false,t+' after expiry');
}));
test('Magnetic Warp lets each player select their own replacement, with correct controller for second choice',()=>using(()=>{
 const s=battle('xy7-49'),p=s.sides.player,o=s.sides.opponent;
 p.bench=[mon('fixture-basic','p1',0),mon('fixture-basic2','p2',1)];o.bench=[mon('fixture-basic','o1',0),mon('fixture-basic2','o2',1)];
 p.active.tool=ref('fixture-tool','attached');
 act(s,'player',a=>a.type==='ability'&&a.cardId==='xy7-49');
 assert.equal(s.pendingChoice.kind,'switchBench');assert.equal(s.choiceSide,'player');
 act(s,'player',a=>a.type==='effectChoice'&&a.choiceBenchIndex===1);
 assert.equal(p.active.uid,'p2');assert.equal(p.bench[1].uid,'actor');
 assert.equal(s.pendingChoice.kind,'switchBench');assert.equal(s.choiceSide,'opponent');
 act(s,'opponent',a=>a.type==='effectChoice'&&a.choiceBenchIndex===0);
 assert.equal(o.active.uid,'o1');assert.equal(o.bench[0].uid,'target');
 assert.equal(p.bench[1].tool.uid,'attached');assert.equal(s.phase,'battle');
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='xy7-49'),'Once-per-turn cooldown');
}));
test('Magnetic Warp gracefully ends after friendly switch when enemy has no Bench',()=>using(()=>{
 const s=battle('xy7-49'),p=s.sides.player;p.bench=[mon('fixture-basic','p1',0)];
 act(s,'player',a=>a.type==='ability'&&a.cardId==='xy7-49');
 act(s,'player',a=>a.type==='effectChoice'&&a.choiceBenchIndex===0);
 assert.equal(s.phase,'battle');assert.equal(p.active.uid,'p1');assert.equal(s.sides.opponent.active.uid,'target');
}));
test('Metagross Iron Cannon offers keep/discard, then discards real Basic and Special Metal after 160 damage',()=>using(()=>{
 const s=battle('xy7-49'),p=s.sides.player;
 p.active.specialEnergy=[ref('fixture-metal','metal-card')];p.active.energy={Metal:3};
 const opts=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===0);
 assert.ok(opts.some(a=>a.effectSelection==='keep'));
 assert.ok(opts.some(a=>a.effectSelection==='discard'));
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0&&a.effectSelection==='discard');
 assert.equal(s.sides.opponent.active.damage,160);
 assert.equal(p.active.energy.Metal,0);assert.equal(p.energyDiscard.Metal,3);
 assert.deepEqual(p.discard.map(x=>x.uid),['metal-card']);assert.equal(p.active.specialEnergy.length,0);
}));
test('Iron Cannon can retain Metal Energy for base damage and offers no empty discard option',()=>using(()=>{
 const s=battle('xy7-49'),p=s.sides.player;p.active.energy={Metal:3};
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0&&a.effectSelection==='keep');
 assert.equal(s.sides.opponent.active.damage,80);assert.equal(p.active.energy.Metal,3);
 const reset=battle('xy7-49');reset.sides.player.active.energy={Colorless:3};
 assert.equal(core.legalActions(reset,'player').filter(a=>a.type==='attack'&&a.attackIndex===0&&a.effectSelection==='discard').length,0);
}));

test('Renegade Pulse protects against actual Mega attack damage and status in a full turn',()=>using(()=>{
 const s=battle('fixture-mega'),target=s.sides.opponent.active;target.cardId='xy7-93';
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(target.damage,0);assert.ok(!target.conditions?.poison);
}));
test('Hex Maniac suppresses Renegade Pulse, allowing Mega attack damage and effects',()=>using(()=>{
 const s=battle('fixture-mega'),target=s.sides.opponent.active;target.cardId='xy7-57';s.xy7HexManiacUntil=s.turnNumber;
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(target.damage,70,'60 damage plus 10 poison at end-of-turn checkup');assert.ok(target.conditions?.poison);
}));
test('Magnetic Warp does not forcibly move an opposing θ Stop Pokemon',()=>using(()=>{
 const s=battle('xy7-49'),p=s.sides.player,o=s.sides.opponent;
 p.bench=[mon('fixture-basic','p1',0)];o.active=mon('fixture-theta-stop','guard');o.bench=[mon('fixture-basic2','o1',0)];
 act(s,'player',a=>a.type==='ability'&&a.cardId==='xy7-49');
 act(s,'player',a=>a.type==='effectChoice'&&a.choiceBenchIndex===0);
 assert.equal(s.phase,'battle');assert.equal(p.active.uid,'p1');assert.equal(o.active.uid,'guard');
}));

test('Beginner CPU preserves attached Metal unless Iron Cannon boosted damage scores a knockout',()=>using(()=>{
 const s=battle('xy7-49'),p=s.sides.player;p.energyUsed=true;p.handEnergyUsed=true;p.active.energy={Metal:3};
 const calm=ai.chooseAction(s,'player','Beginner',0);
 assert.equal(calm.type,'attack');assert.equal(calm.effectSelection,'keep');
 s.sides.opponent.active.damage=130;
 const knockout=ai.chooseAction(s,'player','Beginner',0);
 assert.equal(knockout.type,'attack');assert.equal(knockout.effectSelection,'discard');
}));
