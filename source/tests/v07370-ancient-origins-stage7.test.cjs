'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const ai=require(path.join(assets,'tcgp-battle-ai.js'));
const loan=data.CLASSIC30_LOANER_DECK;
const python=String.raw`
import sys,json,importlib.util
p=sys.argv[1];sys.path.insert(0,p)
s=importlib.util.spec_from_file_location('xy7',p+'/build-xy7.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
rows=[]
def pokemon(n,name,at,stage='Stage 1'):
 rows.append([n,name,'Pokémon',[stage],200,['Psychic'],None,at,[],None,None,1,'Rare',[],None,None])
pokemon('17','Volcarona', [['Solar Birth',['C'],'',"Search your deck for a Basic Pokémon and put it onto your Bench. Then, search your deck for up to 2 basic Energy cards and attach them to that Pokémon. Shuffle your deck afterward."],['Flamethrower',['C'],'60',"Discard an Energy attached to this Pokémon."]])
pokemon('33','Claydol', [['Rewind',['C'],'',"Devolve each of your opponent's evolved Pokémon and put the highest Stage Evolution card on it into your opponent's hand."],['Hyper Beam',['C'],'30',"Flip a coin. If heads, discard an Energy attached to your opponent's Active Pokémon."]])
pokemon('56','Whimsicott', [['Windy Mischief',['C'],'',"Move all damage counters from 1 of your Benched Pokémon to your opponent's Active Pokémon."],['Rolling Tackle',['C'],'30','']])
pokemon('67','Porygon-Z', [['Digital Reboot',['C'],'',"Devolve as many of your Benched Pokémon as many times as you like. Put each Evolution card removed this way into your hand."],['Dazzle Blast',['C'],'50',"Your opponent's Active Pokémon is now Confused."]])
print(json.dumps(m.generate(rows)))`;
const generated=spawnSync('python3',['-c',python,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(generated.status,0,generated.stderr);
const cards=Object.fromEntries(JSON.parse(generated.stdout).map(c=>[c.id,c]));
const basic=(id,name,props={})=>({id,name,kind:'pokemon',stage:'Basic',types:['Colorless'],hp:230,retreat:1,battleEnabled:true,attacks:[{name:'Tap',cost:['C'],damage:20,effect:{type:'noop'}}],...props});
Object.assign(cards,{
 'fixture-basic':basic('fixture-basic','Basic One'),
 'fixture-basic2':basic('fixture-basic2','Basic Two'),
 'fixture-evo1':basic('fixture-evo1','Evo One',{stage:'Stage 1'}),
 'fixture-evo2':basic('fixture-evo2','Evo Two',{stage:'Stage 2'}),
 'fixture-tool':{id:'fixture-tool',kind:'trainer',trainerType:'Tool',name:'Wide Lens',battleEnabled:true,effect:{type:'noop'}},
 'fixture-item':{id:'fixture-item',kind:'trainer',trainerType:'Item',name:'Potion',battleEnabled:true,effect:{type:'noop'}},
 });
const old=data.cardById;
const using=fn=>{data.cardById=id=>cards[id]||old(id);try{return fn();}finally{data.cardById=old;}};
const ref=(cardId,uid)=>({cardId,uid:uid||cardId});
const mon=(cardId,uid,benchSlot=null)=>({uid,cardId,stack:[cardId],benchSlot,damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],conditions:{},playedOnSideTurn:1});
function battle(id='xy7-17'){
 const s=core.createBattle({format:'classic',playerDeck:loan,opponentDeck:loan,seed:370,firstSide:'player',playerEnergyTypes:['Grass'],opponentEnergyTypes:['Water']});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;
 for(const ss of Object.values(s.sides)){ss.turnCount=5;ss.hand=[];ss.deck=[];ss.discard=[];ss.bench=[];ss.handEnergyUsed=false;ss.energyUsed=false;ss.supporterUsed=false;ss.energyDiscard={};}
 s.sides.player.active=mon(id,'actor');s.sides.player.active.energy={Colorless:4};s.sides.opponent.active=mon('fixture-basic','target');return s;
}
function act(s,side,predicate){const legal=core.legalActions(s,side),a=legal.find(predicate);assert.ok(a,'Missing action; have '+JSON.stringify(legal.slice(0,18)));core.applyAction(s,side,a);return a;}

test('Stage 7 enables all four previously gated printed effects; descriptors validate',()=>{
 for(const n of ['17','33','56','67']){const c=cards['xy7-'+n];assert.equal(c.battleEnabled,true,JSON.stringify(c.support));for(const a of c.attacks||[])assert.deepEqual(fx.validateEffect(a.effect),[],n+' '+a.name);}
});
test('Volcarona Solar Birth searches a real Basic and attaches two chosen Zone Energy, leaving other Zone units',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.deck=[ref('fixture-item','item'),ref('fixture-basic','chosen'),ref('fixture-evo1','not-basic')];p.energySupply=['Grass','Water','Grass','Fire'];p.nextEnergyType='Grass';
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.kind,'deckCard');assert.deepEqual(core.legalActions(s,'player').filter(a=>a.type==='effectChoice').map(a=>a.choiceCardId),['fixture-basic']);
 act(s,'player',a=>a.type==='effectChoice'&&a.choiceCardId==='fixture-basic');
 assert.equal(p.bench.length,1);assert.equal(p.bench[0].uid,'chosen');assert.equal(s.pendingChoice.kind,'option');
 act(s,'player',a=>a.choiceLabel==='Attach Water Basic Energy');
 assert.equal(p.bench[0].energy.Water,1);assert.equal(s.pendingChoice.kind,'option');
 act(s,'player',a=>a.choiceLabel==='Attach Grass Basic Energy');
 assert.equal(p.bench[0].energy.Grass,1);assert.deepEqual(p.energySupply,['Grass','Fire']);
 assert.equal(p.deck.length,2);assert.equal(p.hand.length,0);assert.equal(p.energyUsed,false);assert.equal(s.phase,'battle');
}));
test('Solar Birth can stop after one Energy and never takes Specials or creates a Basic',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.deck=[ref('fixture-basic','new')];p.energySupply=['Water','Fire'];
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);act(s,'player',a=>a.choiceCardId==='fixture-basic');
 act(s,'player',a=>a.choiceLabel==='Attach Water Basic Energy');act(s,'player',a=>a.choiceLabel==='Done attaching Energy');
 assert.deepEqual(p.energySupply,['Fire']);assert.deepEqual(p.bench[0].energy,{Water:1});
}));
test('Claydol Rewind devolves each opposing evolved Pokémon exactly once, retains attachments and returns Evolution to hand',()=>using(()=>{
 const s=battle('xy7-33'),o=s.sides.opponent;
 o.active=mon('fixture-evo2','target');o.active.stack=['fixture-basic','fixture-evo1','fixture-evo2'];o.active.energy={Water:2};o.active.tool=ref('fixture-tool','tool');
 o.bench=[mon('fixture-evo1','b1',0),mon('fixture-basic2','b2',1)];o.bench[0].stack=['fixture-basic','fixture-evo1'];
 o.hand=Array.from({length:5},(_,i)=>ref('fixture-item','i'+i));
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(o.active.cardId,'fixture-evo1');assert.equal(o.active.stack.length,2);assert.equal(o.bench[0].cardId,'fixture-basic');assert.equal(o.bench[1].cardId,'fixture-basic2');
 assert.equal(o.hand.length,7);assert.deepEqual(o.hand.slice(-2).map(x=>x.cardId).sort(),['fixture-evo1','fixture-evo2']);
 assert.equal(o.active.energy.Water,2);assert.equal(o.active.tool.uid,'tool');
}));
test('Whimsicott Windy Mischief moves counters from selected damaged Bench, no weakness or Wide Lens multiplication',()=>using(()=>{
 const s=battle('xy7-56'),p=s.sides.player,o=s.sides.opponent;
 p.bench=[mon('fixture-basic','b1',0),mon('fixture-basic2','b2',1)];p.bench[0].damage=60;p.bench[1].damage=20;p.active.tool=ref('fixture-tool','wide');
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(s.pendingChoice.kind,'pokemon');assert.ok(!core.legalActions(s,'player').some(a=>a.choiceTarget==='active'));
 act(s,'player',a=>a.choiceBenchIndex===1);
 assert.equal(p.bench[1].damage,0);assert.equal(p.bench[0].damage,60);assert.equal(o.active.damage,20);
}));
test('Porygon-Z Digital Reboot may repeatedly devolve one Bench while leaving another and Active untouched',()=>using(()=>{
 const s=battle('xy7-67'),p=s.sides.player;
 const first=mon('fixture-evo2','evol2',0),second=mon('fixture-evo1','evol1',1);
 first.stack=['fixture-basic','fixture-evo1','fixture-evo2'];first.energy={Water:2};first.tool=ref('fixture-tool','tool');second.stack=['fixture-basic2','fixture-evo1'];
 p.bench=[first,second];
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(s.pendingChoice.kind,'option');
 act(s,'player',a=>a.choiceLabel?.includes('Bench 1'));
 assert.equal(first.cardId,'fixture-evo1');assert.equal(p.hand.length,1);
 act(s,'player',a=>a.choiceLabel?.includes('Bench 1'));
 assert.equal(first.cardId,'fixture-basic');assert.equal(p.hand.length,2);assert.equal(s.pendingChoice.kind,'option');
 act(s,'player',a=>a.choiceLabel==='Done devolving');
 assert.equal(second.cardId,'fixture-evo1');assert.equal(p.active.cardId,'xy7-67');assert.equal(first.tool.uid,'tool');assert.equal(first.energy.Water,2);
 assert.deepEqual(p.hand.map(r=>r.cardId),['fixture-evo2','fixture-evo1']);assert.equal(s.phase,'battle');
}));
test('Stage 7 CPU picks real Solar Birth Zone Energy and does not endlessly de-evolve its Bench',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.deck=[ref('fixture-basic','new')];p.energySupply=['Grass'];
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);act(s,'player',a=>a.choiceCardId==='fixture-basic');
 const picked=ai.chooseAction(s,'player','Beginner',0);assert.ok(picked,'CPU no action');assert.equal(picked.choiceLabel,'Attach Grass Basic Energy');
}));
test('Solar Birth does not materialise Pokémon or consume Zone Energy when no actual Basic can be found',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.deck=[ref('fixture-evo1','wrong-stage'),ref('fixture-item','item')];p.energySupply=['Grass','Water'];
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(s.phase,'battle');assert.equal(p.bench.length,0);
 assert.deepEqual(p.energySupply,['Grass','Water']);
 assert.equal(p.deck.length,2);
}));
test('Whimsicott cannot move damage counters from Active or an undamaged Bench Pokémon',()=>using(()=>{
 const s=battle('xy7-56'),p=s.sides.player,o=s.sides.opponent;
 p.active.damage=70;p.bench=[mon('fixture-basic','b1',0)];
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(s.phase,'battle');assert.equal(p.active.damage,70);assert.equal(o.active.damage,0);
}));
test('CPU Digital Reboot declines optional devolution instead of looping over its Bench',()=>using(()=>{
 const s=battle('xy7-67'),p=s.sides.player;const b=mon('fixture-evo1','e1',0);b.stack=['fixture-basic','fixture-evo1'];p.bench=[b];
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(s.pendingChoice.kind,'option');
 const chosen=ai.chooseAction(s,'player','Beginner',1);
 assert.equal(chosen.choiceLabel,'Done devolving');
 core.applyAction(s,'player',chosen);
 assert.equal(s.phase,'battle');assert.equal(b.cardId,'fixture-evo1');
}));
