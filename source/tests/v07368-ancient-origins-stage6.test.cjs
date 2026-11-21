'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcgp-battle-data.js'));
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const loan=require(path.join(assets,'tcg-classic-battle-data.js')).CLASSIC30_LOANER_DECK;
const python=String.raw`
import sys,json,importlib.util
p=sys.argv[1];sys.path.insert(0,p)
s=importlib.util.spec_from_file_location('xy7',p+'/build-xy7.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
rows=[]
def pokemon(n,name,att,types=['Water'],sub=['Stage 1'],trait=None):
 rows.append([n,name,'Pokémon',sub,220,types,None,att,[],None,None,1,'Uncommon',[],None,trait])
pokemon('21','Gyarados', [['Full Retaliation',['W','C'],'30+','This attack does 30 more damage for each damage counter on each of your Benched Magikarp.'], ['Thrash',['W','W','C'],'100+','Flip a coin. If heads, this attack does 30 more damage. If tails, this Pokémon does 30 damage to itself.']],trait={'name':'θ Double','text':'Up to 2 Pokemon Tools'})
pokemon('46','Malamar', [['Entangling Control',['D'],'','Switch 1 of your opponent\'s Benched Pokémon with his or her Active Pokémon. The new Active Pokémon is now Confused.'], ['Trash Tentacle',['D','C'],'30','Put a card from your discard pile into your hand.']],types=['Darkness'])
pokemon('66','Porygon-Z', [['Cyber Crush',['C'],'','Discard all Special Energy attached to each of your opponent\'s Pokémon.'], ['Slowing Beam',['C','C','C'],'70','During your opponent\'s next turn, the Defending Pokémon\'s attacks cost Colorless more.']],types=['Colorless'],sub=['Stage 2'])
pokemon('58','Goomy', [['Stampede',['C'],'10','']],types=['Dragon'],sub=['Basic'])
rows[-1][8]=[['Water Down','Ability','Whenever you attach a Water Energy card from your hand to this Pokémon, you may search your deck for Goomy and put it onto your Bench. Shuffle your deck afterward.']]
for n,name in [('71','Eco Arm'),('72','Energy Recycler')]:
 rows.append([n,name,'Trainer',['Item'],None,[],None,[],[],None,None,0,'Uncommon',['Recycle cards from discard'],None,None])
print(json.dumps(m.generate(rows)))`;
const p=spawnSync('python3',['-c',python,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(p.status,0,p.stderr);
const cards=Object.fromEntries(JSON.parse(p.stdout).map(c=>[c.id,c]));
const monCard=(id,name,types=['Water'],rest={})=>({id,name,kind:'pokemon',stage:'Basic',battleEnabled:true,hp:210,types,retreat:1,attacks:[{name:'Hit',cost:'C',damage:30,effect:{type:'noop'}}],...rest});
Object.assign(cards,{
 'fixture-magikarp':monCard('fixture-magikarp','Magikarp'),
 'fixture-gyarados':monCard('fixture-gyarados','Gyarados'),
 'fixture-water':monCard('fixture-water','Water Basic'),
 'fixture-special':{id:'fixture-special',name:'Double Colorless Energy',kind:'energy',specialEnergy:true,energyType:'Colorless',effect:{type:'specialEnergy',provides:{Colorless:2}}},
 'fixture-tool':{id:'fixture-tool',name:'Healing Scarf',kind:'trainer',trainerType:'Tool',battleEnabled:true,effect:{type:'noop'}},
 'fixture-tool2':{id:'fixture-tool2',name:'Wide Lens',kind:'trainer',trainerType:'Tool',battleEnabled:true,effect:{type:'noop'}},
 'fixture-item':{id:'fixture-item',name:'Potion',kind:'trainer',trainerType:'Item',battleEnabled:true,effect:{type:'noop'}},
 'fixture-water-special':{id:'fixture-water-special',name:'Water Energy',kind:'energy',specialEnergy:true,energyType:'Water',effect:{type:'specialEnergy',provides:{Water:1}}},
 'fixture-basic-energy':{id:'fixture-basic-energy',name:'Grass Energy',kind:'energy',basicEnergy:true,energyType:'Grass',subtype:'Grass'},
});
const old=data.cardById;const using=fn=>{data.cardById=id=>cards[id]||old(id);try{return fn();}finally{data.cardById=old;}};
const ref=(cardId,uid)=>({cardId,uid:uid||cardId});
const mon=(cardId,uid,benchSlot=null)=>({cardId,uid,stack:[cardId],benchSlot,damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],conditions:{},playedOnSideTurn:1});
function battle(){const s=core.createBattle({format:'classic',playerDeck:loan,opponentDeck:loan,seed:368,firstSide:'player',playerEnergyTypes:['Water'],opponentEnergyTypes:['Grass']});s.phase='battle';s.activeSide='player';s.turnNumber=10;for(const ss of Object.values(s.sides)){ss.turnCount=5;ss.hand=[];ss.deck=[];ss.discard=[];ss.bench=[];ss.supporterUsed=false;ss.handEnergyUsed=false;ss.energyUsed=false;ss.energyDiscard={};}s.sides.player.active=mon('xy7-21','gyara');s.sides.opponent.active=mon('fixture-water','target');return s;}
function act(s,side,pred){const a=core.legalActions(s,side).find(pred);assert.ok(a,'Missing legal action '+JSON.stringify(core.legalActions(s,side).slice(0,16)));core.applyAction(s,side,a);return a;}

test('Stage 6 enables five exact printed card IDs with validated effects',()=>{
 for(const n of ['21','46','66','58','71','72']){
  const c=cards['xy7-'+n];assert.equal(c.battleEnabled,true,c.id+' '+JSON.stringify(c.support));
  for(const a of c.attacks||[])assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);
  if(c.effect)assert.deepEqual(fx.validateEffect(c.effect),[],c.id+' trainer');
 }
});
test('Gyarados Full Retaliation counts only damage counters on currently Benched Magikarp',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.bench=[mon('fixture-magikarp','karp1',0),mon('fixture-gyarados','gyara2',1),mon('fixture-magikarp','karp2',2)];
 p.bench[0].damage=20;p.bench[1].damage=120;p.bench[2].damage=30;p.discard=[ref('fixture-magikarp','discarded')];
 const attack=cards['xy7-21'].attacks[0];const out=fx.resolveAttack(attack,{state:s,side:'player',foeSide:'opponent',attacker:p.active,defender:s.sides.opponent.active,cardById:data.cardById});
 assert.equal(out.damage,180);p.bench.pop();const next=fx.resolveAttack(attack,{state:s,side:'player',foeSide:'opponent',attacker:p.active,defender:s.sides.opponent.active,cardById:data.cardById});assert.equal(next.damage,90);
}));
test('Malamar Entangling Control switches selected opposing Bench first, then confuses new Active',()=>using(()=>{
 const s=battle(),p=s.sides.player,o=s.sides.opponent;p.active=mon('xy7-46','malamar');p.active.energy={Darkness:2};o.bench=[mon('fixture-water','benched',0)];
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(s.phase,'effectChoice');assert.equal(o.active.uid,'target');
 act(s,'player',a=>a.type==='effectChoice'&&a.choiceBenchIndex===0);
 assert.equal(o.active.uid,'benched');assert.ok(o.active.conditions.confusion);assert.ok(!o.bench[0].conditions.confusion);
}));
test('Malamar Trash Tentacle recovers one actual physical discard reference and cannot invent a new card',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.active=mon('xy7-46','malamar');p.active.energy={Darkness:2};p.discard=[ref('fixture-item','existing')];
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===1);
 assert.equal(s.phase,'effectChoice');act(s,'player',a=>a.type==='effectChoice'&&a.choiceCardId==='fixture-item');
 assert.equal(p.discard.length,0);assert.equal(p.hand[0]?.uid,'existing');
}));
test('Porygon-Z Cyber Crush discards Special Energy attached across opponent Active and Bench but not own side',()=>using(()=>{
 const s=battle(),p=s.sides.player,o=s.sides.opponent;p.active=mon('xy7-66','pory');p.active.energy={Colorless:3};p.active.specialEnergy=[ref('fixture-special','ours')];
 o.active.specialEnergy=[ref('fixture-special','active-special')];o.bench=[mon('fixture-water','bench',0)];o.bench[0].specialEnergy=[ref('fixture-special','bench-special')];o.active.energy={Water:1};
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(o.active.specialEnergy.length,0);assert.equal(o.bench[0].specialEnergy.length,0);
 assert.deepEqual(o.discard.map(r=>r.uid).sort(),['active-special','bench-special']);assert.equal(p.active.specialEnergy.length,1);assert.equal(o.active.energy.Water,1);
}));
test('Porygon-Z Slowing Beam increases only defending Pokemon attack cost next turn, then expires',()=>using(()=>{
 const s=battle(),p=s.sides.player,o=s.sides.opponent;p.active=mon('xy7-66','pory');p.active.energy={Colorless:3};
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===1);
 assert.equal(o.active.xy7SlowingBeamUntil,11);
 o.active.energy={Colorless:1};s.activeSide='opponent';s.turnNumber=11;
 assert.ok(!core.legalActions(s,'opponent').some(a=>a.type==='attack'),'1 Colorless cannot pay C+C');
 o.active.energy.Colorless=2;assert.ok(core.legalActions(s,'opponent').some(a=>a.type==='attack'),'2 Colorless can pay C+C');
 o.active.energy.Colorless=1;s.turnNumber=13;
 assert.ok(core.legalActions(s,'opponent').some(a=>a.type==='attack'),'Cost penalty expires');
}));
test('Eco Arm takes only existing Tool refs from discard back into physical draw deck',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.active=mon('fixture-water','p');p.hand=[ref('xy7-71','eco')];
 p.discard=[ref('fixture-tool','t1'),ref('fixture-tool2','t2'),ref('fixture-item','item')];
 act(s,'player',a=>a.type==='trainer'&&a.cardId==='xy7-71');
 act(s,'player',a=>a.type==='effectChoice'&&a.choiceCardId==='fixture-tool');
 act(s,'player',a=>a.type==='effectChoice'&&a.choiceCardId==='fixture-tool2');
 assert.ok(p.deck.some(r=>r.uid==='t1'));assert.ok(p.deck.some(r=>r.uid==='t2'));
 assert.ok(p.discard.some(r=>r.uid==='item'));assert.ok(p.discard.some(r=>r.cardId==='xy7-71'));
}));
test('Energy Recycler returns at most five actually discarded Basics to ordered Energy Zone (no Special)',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.active=mon('fixture-water','p');p.hand=[ref('xy7-72','recycler')];
 p.energyDiscard={Water:3,Grass:1};p.discard=[ref('fixture-basic-energy','physical'),ref('fixture-special','special')];p.energySupply=['Water'];
 act(s,'player',a=>a.type==='trainer'&&a.cardId==='xy7-72');
 for(let i=0;i<5;i++){const a=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceLabel?.includes('Recycle'));
   assert.ok(a,'Missing recycler choice #'+i);core.applyAction(s,'player',a);}
 assert.equal((p.energyDiscard.Water||0)+(p.energyDiscard.Grass||0),0);
 assert.ok(!p.discard.some(r=>r.uid==='physical'));assert.ok(p.discard.some(r=>r.uid==='special'));
 assert.equal(p.energySupply.length,6);assert.equal(s.phase,'battle');
}));

test('Goomy Water Down only triggers from hand-attached Water Energy and benches a real Goomy from physical deck',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.active=mon('xy7-58','goomy');
 p.hand=[ref('fixture-water-special','water')];p.deck=[ref('xy7-58','otherGoomy'),ref('fixture-water','unrelated')];
 act(s,'player',a=>a.type==='attachSpecial'&&a.cardId==='fixture-water-special');
 assert.equal(s.phase,'effectChoice');
 act(s,'player',a=>a.type==='effectChoice'&&/Search/.test(a.choiceLabel||''));
 assert.equal(s.pendingChoice.kind,'deckCard');
 act(s,'player',a=>a.type==='effectChoice'&&a.choiceCardId==='xy7-58');
 assert.equal(p.bench.length,1);assert.equal(p.bench[0].uid,'otherGoomy');
 assert.equal(p.deck.length,1);assert.equal(p.deck[0].cardId,'fixture-water');
}));
test('Slowing Beam penalty clears when Defending Pokémon switches to Bench',()=>using(()=>{
 const s=battle(),p=s.sides.player,o=s.sides.opponent;p.active=mon('xy7-66','pory');p.active.energy={Colorless:3};
 o.bench=[mon('fixture-water','incoming',0)];
 act(s,'player',a=>a.type==='attack'&&a.attackIndex===1);
 assert.equal(o.active.xy7SlowingBeamUntil,11);
 s.activeSide='opponent';s.turnNumber=11;o.active.energy={Colorless:2};
 act(s,'opponent',a=>a.type==='retreat');
 assert.equal(o.bench[0].xy7SlowingBeamUntil,undefined);
}));
test('Water Down does not trigger on a Zone attachment instead of a Water card attached from hand',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.active=mon('xy7-58','goomy');p.deck=[ref('xy7-58','not-played')];
 p.energyAvailable=true;p.energyUsed=false;p.nextEnergyType='Water';p.energySupply=['Water'];
 act(s,'player',a=>a.type==='attach'&&a.target==='active');
 assert.notEqual(s.phase,'effectChoice');assert.equal(p.bench.length,0);
 assert.equal(p.deck[0].uid,'not-played');
}));
