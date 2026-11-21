'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), path=require('node:path'), {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'), assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcgp-battle-data.js')),
  core=require(path.join(assets,'tcgp-battle-core.js')),
  effects=require(path.join(assets,'tcgp-battle-effects.js'));
const loan=require(path.join(assets,'tcg-classic-battle-data.js')).CLASSIC30_LOANER_DECK;
const py=String.raw`
import sys,importlib.util,json
p=sys.argv[1];sys.path.insert(0,p)
s=importlib.util.spec_from_file_location('xy6',p+'/build-xy6.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
rows=[
 ['31','Banette','Pokémon',['Stage 1'],90,['Psychic'],'Shuppet',[['Psyshot',['P','C'],'60','']],[['Tool Concealment','Ability','Each Pokémon Tool card in play has no effect.']],None,None,1,'Rare',[],None,None],
 ['11','Shedinja','Pokémon',['Stage 1'],30,['Grass'],'Nincada',[['Cursed Rain',['C'],'','Put 1 damage counter on each of your opponent\'s Pokémon. Switch this Pokémon with 1 of your Benched Pokémon.']],[],None,None,0,'Rare',[],None,None]
]
print(json.dumps(m.generate(rows)))`;
const gen=spawnSync('python3',['-c',py,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(gen.status,0,gen.stderr);
const cards=Object.fromEntries(JSON.parse(gen.stdout).map(x=>[x.id,x]));
cards['audit-basic']={id:'audit-basic',name:'Audit Basic',stage:'Basic',kind:'pokemon',types:['Colorless'],hp:160,retreat:1,battleEnabled:true,attacks:[{name:'Tap',damage:10,cost:'C',effect:{type:'noop'}}]};
cards['audit-weak']={id:'audit-weak',name:'Audit Weak',stage:'Basic',kind:'pokemon',types:['Colorless'],hp:160,weakness:'Grass',weaknessValue:'×2',battleEnabled:true,attacks:[{name:'Tap',damage:10,cost:'C',effect:{type:'noop'}}]};
cards['audit-fight']={id:'audit-fight',name:'Audit Fighter',stage:'Basic',kind:'pokemon',types:['Fighting'],hp:160,retreat:1,battleEnabled:true,attacks:[{name:'Tap',damage:10,cost:'C',effect:{type:'noop'}}]};
cards['xy4-97']={id:'xy4-97',name:'Head Ringer',kind:'trainer',trainerType:'Tool',effect:{type:'neoRule',rule:'xy4:headRinger'},battleEnabled:true};
cards['xy6-95']={id:'xy6-95',name:'Wide Lens',kind:'trainer',trainerType:'Tool',effect:{type:'noop'},battleEnabled:true};
cards['bw7-133']={id:'bw7-133',name:'Rocky Helmet',kind:'trainer',trainerType:'Tool',effect:{type:'noop'},battleEnabled:true};
cards['dp2-65']={id:'dp2-65',name:'Unown [E]',kind:'pokemon',stage:'Basic',types:['Psychic'],hp:50,retreat:1,battleEnabled:true};
const ref=(id,uid)=>({cardId:id,uid:uid||id});
const mon=(id,uid,benchSlot=null)=>({uid,cardId:id,stack:[id],damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],benchSlot,playedOnSideTurn:1,conditions:{}});
function using(fn){const old=data.cardById;data.cardById=id=>cards[id]||old(id);try{return fn();}finally{data.cardById=old;}}
function battle(p='audit-basic',o='audit-basic'){
 const s=core.createBattle({format:'classic',playerDeck:loan,opponentDeck:loan,seed:362,firstSide:'player',playerEnergyTypes:['Colorless','Psychic'],opponentEnergyTypes:['Colorless']});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;
 for(const ss of Object.values(s.sides)){ss.turnCount=5;ss.hand=[];ss.bench=[];ss.energyUsed=false;ss.handEnergyUsed=false;ss.supporterUsed=false;ss.handLimit=8;}
 s.sides.player.active=mon(p,'mine');s.sides.opponent.active=mon(o,'foe');return s;
}
const addBanette=s=>s.sides.opponent.bench.push(mon('xy6-31','banette',0));
test('Cursed Rain must place counters, not damage, even if Shedinja has Wide Lens and foe has Grass Weakness',()=>using(()=>{
 const s=battle('xy6-11','audit-basic');s.sides.player.active.energy={Colorless:1};s.sides.player.active.tool=ref('xy6-95','lens');
 s.sides.player.bench=[mon('audit-basic','friend',0)];s.sides.opponent.bench=[mon('audit-weak','foebench',0)];
 const a=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(a);
 core.applyAction(s,'player',a);
 assert.equal(s.sides.opponent.active.damage,10);assert.equal(s.sides.opponent.bench[0].damage,10,'Wide Lens does not multiply placed damage counters');
}));
test('Cursed Rain descriptor must explicitly represent counter placement',()=>{
 const eff=cards['xy6-11'].attacks[0].effect;assert.equal(eff.type,'sequence');
 assert.equal(eff.effects[0].type,'placeDamageCounters');assert.equal(eff.effects[0].target,'opponentAll');
 assert.deepEqual(effects.validateEffect(eff),[]);
});
test('Banette suppresses Head Ringer additional attack Energy without detaching it',()=>using(()=>{
 const s=battle();s.sides.player.active.energy={Colorless:1};s.sides.player.active.tool=ref('xy4-97','headringer');
 assert.equal(core.attackAvailability(s,'player',0).cost,'CC');addBanette(s);
 assert.equal(core.attackAvailability(s,'player',0).cost,'C');assert.equal(s.sides.player.active.tool.uid,'headringer');
}));
test('Banette suppresses Rocky Helmet retaliation without detaching it',()=>using(()=>{
 for(const haveBanette of [false,true]){
  const s=battle();s.sides.player.active.energy={Colorless:1};s.sides.opponent.active.tool=ref('bw7-133','helmet');if(haveBanette)addBanette(s);
  const a=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(a);
  core.applyAction(s,'player',a);
  assert.equal(s.sides.player.active.damage,haveBanette?0:20);
  assert.equal(s.sides.opponent.active.tool.uid,'helmet');
 }
}));
test('Banette suppresses Unown E EQUIP maximum-HP bonus while attached',()=>using(()=>{
 const s=battle();s.sides.player.active.tool=ref('dp2-65','unown-e');
 assert.equal(core.maxHp(s,'player',s.sides.player.active),170);
 addBanette(s);assert.equal(core.maxHp(s,'player',s.sides.player.active),160);
 assert.equal(s.sides.player.active.tool.uid,'unown-e');
}));
test('Older Plasma Badge granted type depends on active Tool effects, never physical attachment alone',()=>{
 const fs=require('node:fs'),src=fs.readFileSync(path.join(assets,'tcgp-battle-effects.js'),'utf8');
 const badgeLines=src.split('\n').filter(line=>line.includes("cardId==='bw9-104'"));
 assert.ok(badgeLines.length>=5,'covers historic Plasma bonus / condition branches');
 assert.ok(badgeLines.every(line=>line.includes('activeToolsOf(')),badgeLines.join('\n'));
});
test('Build-generated 112-print catalogue preserves counter placement, distinct artwork and no gated effects',t=>{
 const fs=require('node:fs'),source=path.join(root,'data/classic/xy6-print-compact.json');
 if(!fs.existsSync(source))return t.skip('Official generated XY6 assets are checked on GitHub');
 const sky=require(path.join(assets,'tcg-classic-roaring-skies.js'));
 assert.equal(sky.CARDS.length,112);assert.equal(sky.coverage().battleEnabled,112);
 assert.deepEqual(sky.coverage().gated,[]);
 assert.equal(sky.CARDS.reduce((n,c)=>n+(c.attacks?.length||0),0),147);
 assert.equal(sky.CARDS.reduce((n,c)=>n+(c.abilities?.length||0),0),15);
 assert.equal(sky.CARDS.filter(c=>c.ancientTrait).length,12);
 assert.equal(new Set(sky.CARDS.map(c=>c.id)).size,112);
 for(const id of ['xy6-77','xy6-77a','xy6-92','xy6-92a'])assert.ok(sky.cardById(id)?.deckEligible);
 for(const card of sky.CARDS){assert.equal(card.battleEnabled,true,card.id);for(const attack of card.attacks||[])assert.deepEqual(effects.validateEffect(attack.effect),[],`${card.id} ${attack.name}`);}
 assert.equal(sky.cardById('xy6-11').attacks[0].effect.effects[0].type,'placeDamageCounters');
});
