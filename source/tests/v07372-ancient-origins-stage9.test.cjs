'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const ai=require(path.join(assets,'tcgp-battle-ai.js'));
const python=String.raw`
import sys,json,importlib.util
p=sys.argv[1];sys.path.insert(0,p)
s=importlib.util.spec_from_file_location('xy7',p+'/build-xy7.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
rows=[]
def mon(n,name,att,subtypes=['Basic']):
 rows.append([n,name,'Pokémon',subtypes,180,['Fire' if n=='14' else 'Lightning'],None,att,[],None,None,1,'Rare',[],None,None])
mon('14','Entei', [['Burning Roar',['C'],'','Discard the top 4 cards of your deck. If any of those cards are Fire Energy cards, attach them to your Pokémon in any way you like.'],['Combat Blaze',['R','R'],'20+','This attack does 20 more damage for each of your opponent\'s Benched Pokémon.']])
for n in ['27','87']:
 mon(n,'Ampharos-EX',[['Thunder Rod',['C'],'','Look at the top 4 cards of your deck and attach as many Lightning Energy cards you find there as you like to this Pokémon. Shuffle the other cards back into your deck.'],['Sparkling Tail',['L','L','C','C'],'100',"This attack's damage isn't affected by Weakness, Resistance, or any other effects on your opponent's Active Pokémon."]],['Basic','EX'])
print(json.dumps(m.generate(rows)))`;
const generated=spawnSync('python3',['-c',python,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(generated.status,0,generated.stderr);
const cards=Object.fromEntries(JSON.parse(generated.stdout).map(c=>[c.id,c]));
const basic=(id,name,props={})=>({id,name,kind:'pokemon',stage:'Basic',types:['Colorless'],hp:180,retreat:1,battleEnabled:true,attacks:[{name:'Tap',cost:['C'],damage:20,effect:{type:'noop'}}],...props});
Object.assign(cards,{
 'fixture-basic':basic('fixture-basic','Basic One'),
 'fixture-basic2':basic('fixture-basic2','Basic Two'),
 'fixture-item':{id:'fixture-item',kind:'trainer',trainerType:'Item',name:'Item',battleEnabled:true,effect:{type:'noop'}},
 'fixture-stadium':{id:'fixture-stadium',kind:'trainer',trainerType:'Stadium',name:'Stadium',battleEnabled:true,effect:{type:'noop'}},
 'fixture-basic-fire':{id:'fixture-basic-fire',kind:'energy',name:'Fire Energy',basicEnergy:true,subtype:'Fire',energyType:'Fire',battleEnabled:true},
 'fixture-basic-water':{id:'fixture-basic-water',kind:'energy',name:'Water Energy',basicEnergy:true,subtype:'Water',energyType:'Water',battleEnabled:true},
 'fixture-special-fire':{id:'fixture-special-fire',kind:'energy',name:'Special Fire',specialEnergy:true,subtype:'Fire',effect:{type:'specialEnergy',provides:{Fire:1}},battleEnabled:true}
});
const old=data.cardById;
const using=fn=>{data.cardById=id=>cards[id]||old(id);try{return fn();}finally{data.cardById=old;}};
const ref=(cardId,uid)=>({cardId,uid:uid||cardId});
const mon=(cardId,uid,benchSlot=null)=>({uid,cardId,stack:[cardId],benchSlot,damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],conditions:{},playedOnSideTurn:1});
function battle(id='xy7-14'){
 const s=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:372,firstSide:'player',playerEnergyTypes:['Fire','Lightning','Water'],opponentEnergyTypes:['Water']});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;
 for(const ss of Object.values(s.sides)){ss.turnCount=5;ss.hand=[];ss.deck=[];ss.discard=[];ss.bench=[];ss.handEnergyUsed=false;ss.energyUsed=false;ss.supporterUsed=false;ss.energyDiscard={};}
 s.sides.player.active=mon(id,'actor');s.sides.player.active.energy={Fire:4,Lightning:4,Colorless:1};
 s.sides.opponent.active=mon('fixture-basic','target');return s;
}
function act(s,side,predicate){const actions=core.legalActions(s,side);const a=actions.find(predicate);assert.ok(a,'Missing legal action '+side+'; phase='+s.phase+'; have '+JSON.stringify(actions.slice(0,18)));core.applyAction(s,side,a);return a;}
function sorted(a){return a.slice().sort();}

test('Stage 9 enables Entei and both Ampharos-EX prints with complete verified attacks',()=>{
 for(const n of ['14','27','87']){const c=cards['xy7-'+n];assert.equal(c.battleEnabled,true,JSON.stringify(c.support));for(const a of c.attacks||[])assert.deepEqual(fx.validateEffect(a.effect),[],n+' '+a.name);}
 for(const n of ['14','27','87'])assert.ok(cards['xy7-'+n].deckMeta?.roles?.includes('ramp'),'Accelerator synergy role '+n);
 assert.equal(cards['xy7-14'].attacks[0].effect.type,'xy7BurningRoar');
 assert.equal(cards['xy7-87'].attacks[0].effect.type,'xy7ThunderRod');
});
test('Thunder Rod reveals only four ordered Zone units; player may attach two Lightning and shuffles all leftovers',()=>using(()=>{
 const s=battle('xy7-27'),p=s.sides.player;p.energySupply=['Lightning','Fire','Lightning','Water','Lightning'];p.nextEnergyType='Lightning';
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(s.pendingChoice.kind,'option');assert.equal(p.energySupply.length,1,'Four energy units held aside while player chooses');
 act(s,'player',a=>a.choiceLabel==='Attach 1 revealed Lightning Energy');
 assert.equal(p.active.energy.Lightning,5);
 act(s,'player',a=>a.choiceLabel==='Attach 1 revealed Lightning Energy');
 assert.equal(p.active.energy.Lightning,6);assert.equal(s.phase,'battle');
 assert.equal(p.energySupply.length,3);assert.deepEqual(sorted(p.energySupply),sorted(['Fire','Water','Lightning']));
 assert.equal(p.energyDiscard.Fire||0,0);assert.equal(p.energyDiscard.Water||0,0);
 assert.equal(s.log.filter(x=>x.type==='xy7ThunderRodAttach').length,2);
}));
test('Thunder Rod Done returns unrecovered units without creating Energy or milling the physical deck',()=>using(()=>{
 const s=battle('xy7-87'),p=s.sides.player;p.energySupply=['Fire','Lightning','Grass','Lightning','Water'];p.deck=[ref('fixture-item','item')];
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 act(s,'player',a=>a.choiceLabel==='Done attaching Lightning Energy');
 assert.equal(p.active.energy.Lightning,4);assert.deepEqual(sorted(p.energySupply),sorted(['Fire','Lightning','Grass','Lightning','Water']));
 assert.equal(p.deck.length,1);assert.equal(s.phase,'battle');
}));
test('Thunder Rod with no Lightning in the first four creates no prompt even if fifth Zone unit is Lightning',()=>using(()=>{
 const s=battle('xy7-27'),p=s.sides.player;p.energySupply=['Fire','Water','Grass','Metal','Lightning'];
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(p.active.energy.Lightning,4);assert.equal(p.energySupply.length,5);
 assert.equal(s.phase,'battle');
}));
test('Burning Roar mills four genuine physical cards, and attaches both revealed Fire to chosen Pokémon',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.deck=[ref('fixture-item','a'),ref('fixture-basic','b'),ref('fixture-stadium','c'),ref('fixture-special-fire','d'),ref('fixture-basic2','fifth')];
 p.energySupply=['Fire','Water','Fire','Grass','Fire'];p.bench=[mon('fixture-basic','bench0',0),mon('fixture-basic2','bench1',1)];
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(s.pendingChoice.kind,'pokemon');assert.deepEqual(p.discard.map(x=>x.uid),['a','b','c','d']);
 assert.deepEqual(p.deck.map(x=>x.uid),['fifth']);assert.deepEqual(p.energySupply,['Fire']);
 act(s,'player',a=>a.type==='effectChoice'&&a.choiceTarget==='bench'&&a.choiceBenchIndex===1);
 assert.equal(p.bench[1].energy.Fire,1);assert.equal(s.pendingChoice.kind,'pokemon');
 act(s,'player',a=>a.type==='effectChoice'&&a.choiceTarget==='active');
 assert.equal(p.active.energy.Fire,5);assert.equal(s.phase,'battle');
 assert.deepEqual(p.energyDiscard,{Water:1,Grass:1});
}));
test('Burning Roar with no Fire mills physical cards, discards the four sampled non-Fire Zone units, and offers no idle choice',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.deck=[ref('fixture-item','a'),ref('fixture-item','b')];p.energySupply=['Water','Grass','Water','Lightning','Fire'];
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(s.phase,'battle');assert.equal(p.deck.length,0);assert.equal(p.discard.length,2);
 assert.deepEqual(p.energySupply,['Fire']);assert.deepEqual(p.energyDiscard,{Water:2,Grass:1,Lightning:1});
}));
test('Burning Roar converts physical Basic Fire refs correctly and discards non-Fire Basic refs as Basic Energy ledger units',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.deck=[ref('fixture-basic-fire','fire'),ref('fixture-basic-water','water'),ref('fixture-item','item')];p.energySupply=[];
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(s.pendingChoice.kind,'pokemon');assert.deepEqual(p.discard.map(x=>x.uid),['item']);
 act(s,'player',a=>a.type==='effectChoice'&&a.choiceTarget==='active');
 assert.equal(p.active.energy.Fire,5);assert.equal(p.energyDiscard.Water,1);assert.equal(s.phase,'battle');
}));
test('Basic Energy acceleration uses actual Energy units rather than Special Energy card refs',()=>using(()=>{
 const s=battle('xy7-87'),p=s.sides.player;p.energySupply=['Water','Lightning'];p.deck=[ref('fixture-special-fire','special')];
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 act(s,'player',a=>a.choiceLabel==='Attach 1 revealed Lightning Energy');
 assert.equal(p.active.energy.Lightning,5);assert.deepEqual(p.deck.map(x=>x.uid),['special']);
 assert.equal(p.active.specialEnergy.length,0);assert.equal(s.phase,'battle');
}));
test('CPU Thunder Rod attaches revealed Lightning rather than selecting Done prematurely',()=>using(()=>{
 const s=battle('xy7-87'),p=s.sides.player;p.energySupply=['Water','Lightning','Lightning','Fire'];
 p.energyUsed=true;p.handEnergyUsed=true;
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 for(let n=0;n<2;n++){
  const selected=ai.chooseAction(s,'player','Beginner',0);
  assert.equal(selected.choiceOption,1,'CPU should attach a real revealed Lightning unit');
  core.applyAction(s,'player',selected);
 }
 assert.equal(p.active.energy.Lightning,6);assert.equal(s.phase,'battle');
}));
test('CPU Burning Roar prioritises a Fire attacker that needs Energy rather than a highly charged Active',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.energySupply=['Fire'];
 p.bench=[mon('xy7-14','fire-attacker',0),mon('fixture-basic','no-fire',1)];p.bench[0].energy={};
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(s.phase,'effectChoice');
 const selected=ai.chooseAction(s,'player','Beginner',0);
 assert.equal(selected.choiceTarget,'bench');assert.equal(selected.choiceBenchIndex,0);
 core.applyAction(s,'player',selected);
 assert.equal(p.bench[0].energy.Fire,1);assert.equal(s.phase,'battle');
}));
