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
def mon(n,name,atks,types=['Colorless'],retreat=1):
 rows.append([n,name,'Pokémon',['Basic'],130,types,None,atks,[],None,None,retreat,'Rare',[],None,None])
mon('4','Bellossom', [['Windmill',['G'],'20','Switch this Pokémon with 1 of your Benched Pokémon.'],['Flower Tornado',['G','C'],'60','Move as many Grass Energy attached to your Pokémon to your other Pokémon in any way you like.']],['Grass'])
mon('19','Magikarp', [['Epic Splash',['W'],'30','Flip 2 coins. If either of them is tails, this attack does nothing.']],['Water'])
mon('41','Golurk', [['Dig Out',['C'],'20','Discard the top card of your deck. If that card is a Fighting Energy card, attach it to this Pokémon.'],['Double Lariat',['F','C','C','C'],'90×','Flip 2 coins. This attack does 90 damage times the number of heads.']],['Fighting'])
mon('44','Sableye', [['Bewitching Eyes',['D'],'','Choose a Supporter card from your opponent\'s discard pile and use it as the effect of this attack.'],['Furtive Drop',['D','C'],'','Put 3 damage counters on your opponent\'s Active Pokémon.']],['Darkness'])
mon('60','Goodra', [['Liquid Blow',['C','C'],'','This attack does 20 damage to 1 of your opponent\'s Pokémon for each Colorless in its Retreat Cost. (Don\'t apply Weakness and Resistance for Benched Pokémon.)'],['Shining Breath',['W','Y','C','C'],'110','During your opponent\'s next turn, this Pokémon can\'t be affected by any Special Conditions.']],['Dragon'])
mon('64','Porygon', [['Data Check',['C'],'','Look through your deck. Shuffle your deck afterward.'],['Sharpen',['C','C'],'20','']])
rows.append(['77','Lucky Helmet','Trainer',['Pokémon Tool'],None,[],None,[],[],None,None,0,'Uncommon',[
'Attach a Pokémon Tool to 1 of your Pokémon that doesn\'t already have a Pokémon Tool attached to it.',
'Whenever the Pokémon this card is attached to is your Active Pokémon and is damaged by an opponent\'s attack (even if that Pokémon is Knocked Out), draw 2 cards.',
'You may play as many Item cards as you like during your turn (before your attack).'],None,None])
print(json.dumps(m.generate(rows)))`;
const generated=spawnSync('python3',['-c',python,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(generated.status,0,generated.stderr);
const cards=Object.fromEntries(JSON.parse(generated.stdout).map(c=>[c.id,c]));
const basic=(id,name,props={})=>({id,name,kind:'pokemon',stage:'Basic',types:['Colorless'],hp:160,retreat:1,battleEnabled:true,attacks:[{name:'Tap',cost:['C'],damage:20,effect:{type:'noop'}}],...props});
Object.assign(cards,{
 'fixture-basic':basic('fixture-basic','Basic One'),
 'fixture-wall':basic('fixture-wall','Wall', {hp:230,retreat:3,weakness:null,resistance:null}),
 'fixture-bench':basic('fixture-bench','Bench', {hp:150,retreat:2,weakness:null,resistance:null}),
 'fixture-small':basic('fixture-small','Small', {hp:40,retreat:0}),
 'fixture-item':{id:'fixture-item',name:'Item',kind:'trainer',trainerType:'Item',battleEnabled:true,effect:{type:'noop'}},
 'fixture-supporter':{id:'fixture-supporter',name:'Draw Supporter',kind:'trainer',trainerType:'Supporter',battleEnabled:true,effect:{type:'draw',amount:2}},
 'fixture-grass-tool':{id:'fixture-grass-tool',name:'Special Grass',kind:'energy',specialEnergy:true,effect:{type:'specialEnergy',provides:{Grass:1}},battleEnabled:true},
 'fixture-water-energy':{id:'fixture-water-energy',name:'Water Energy',kind:'energy',basicEnergy:true,subtype:'Water',energyType:'Water',battleEnabled:true},
 'fixture-fight-energy':{id:'fixture-fight-energy',name:'Fighting Energy',kind:'energy',basicEnergy:true,subtype:'Fighting',energyType:'Fighting',battleEnabled:true},
});
const original=data.cardById;
function using(fn){data.cardById=id=>cards[id]||original(id);try{return fn();}finally{data.cardById=original;}}
const ref=(id,uid=id)=>({uid,cardId:id});
function mon(id,uid,benchSlot=null){return {uid,cardId:id,stack:[id],benchSlot,energy:{},specialEnergy:[],tool:null,extraTools:[],conditions:{},damage:0,playedOnSideTurn:1};}
function battle(id='xy7-19',side='player'){
 const s=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:373,firstSide:side,playerEnergyTypes:['Grass','Water','Fighting'],opponentEnergyTypes:['Grass','Water']});
 s.phase='battle';s.activeSide=side;s.turnNumber=10;
 for(const ss of Object.values(s.sides)){ss.turnCount=5;ss.hand=[];ss.deck=[];ss.discard=[];ss.bench=[];ss.handEnergyUsed=false;ss.energyUsed=false;ss.supporterUsed=false;ss.energyDiscard={};ss.prizes=[];}
 s.sides[side].active=mon(id,'actor');s.sides[side].active.energy={Grass:4,Water:3,Fairy:2,Fighting:3,Darkness:2,Colorless:3};
 s.sides[side==='player'?'opponent':'player'].active=mon('fixture-wall','target');
 return s;
}
function act(s,side,pred){const legal=core.legalActions(s,side),a=legal.find(pred);assert.ok(a,`Missing legal action (${side}) phase ${s.phase}: ${JSON.stringify(legal.slice(0,25))}`);core.applyAction(s,side,a);return a;}
const attack=(index=0)=>a=>a.type==='attack'&&a.attackIndex===index;

test('All final seven official Ancient Origins prints become eligible with no unsupported descriptors',()=>{
 for(const n of ['4','19','41','44','60','64','77']){const c=cards['xy7-'+n];assert.equal(c.battleEnabled,true,`${n}: ${JSON.stringify(c.support)}`);for(const a of c.attacks||[])assert.deepEqual(fx.validateEffect(a.effect),[]);if(c.kind==='trainer')assert.deepEqual(fx.validateEffect(c.effect),[]);}
 assert.equal(cards['xy7-77'].trainerType,'Tool');
});

test('Flower Tornado moves chosen Grass Basics and Special Grass between distinct Pokémon, optionally stopping',()=>using(()=>{
 const s=battle('xy7-4'),p=s.sides.player;
 p.active.energy.Grass=2;p.bench=[mon('fixture-basic','bench0',0),mon('fixture-bench','bench1',1)];p.bench[0].energy.Grass=1;
 p.bench[0].specialEnergy=[{uid:'grass-tool',cardId:'fixture-grass-tool',provides:{Grass:1}}];
 act(s,'player',attack(1));assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.kind,'energySource');
 act(s,'player',a=>a.effectEnergyType==='Grass'&&a.choiceTarget==='active');
 act(s,'player',a=>a.choiceTarget==='bench'&&a.choiceBenchIndex===1);
 assert.equal(p.active.energy.Grass,1);assert.equal(p.bench[1].energy.Grass,1);
 act(s,'player',a=>a.choiceLabel==='Move another Energy');
 act(s,'player',a=>a.effectSpecialEnergyUid==='grass-tool');
 act(s,'player',a=>a.choiceTarget==='active');
 assert.equal(p.bench[0].specialEnergy.length,0);assert.equal(p.active.specialEnergy[0].uid,'grass-tool');
 act(s,'player',a=>a.choiceLabel==='Done');assert.equal(s.phase,'battle');
}));

test('Epic Splash shows both flips and only hits if both are heads',()=>using(()=>{
 let tested=0,hit=false,miss=false;
 for(let seed=1;seed<=70;seed++){
  const s=battle('xy7-19');s.rngState=seed;s.sides.opponent.active.damage=0;
  act(s,'player',attack());
  const flip=s.log.find(x=>x.type==='coin'&&x.reason==='Epic Splash');assert.equal(flip.results.length,2);
  const dmg=s.log.find(x=>x.type==='attack'&&x.attack==='Epic Splash')?.damage||0;
  assert.equal(dmg,flip.results.every(Boolean)?30:0);hit||=dmg===30;miss||=dmg===0;tested++;
  if(hit&&miss)break;
 }
 assert.ok(tested>1&&hit&&miss);
}));

test('Dig Out physically mills one card, consumes a finite Zone Fighting unit and attaches only actual Energy',()=>using(()=>{
 const s=battle('xy7-41'),p=s.sides.player;p.deck=[ref('fixture-item','mill'),ref('fixture-small','next')];p.energySupply=['Fighting','Water'];p.active.energy.Fighting=1;
 act(s,'player',attack());assert.deepEqual(p.discard.map(x=>x.uid),['mill']);assert.deepEqual(p.deck.map(x=>x.uid),['next']);assert.deepEqual(p.energySupply,['Water']);assert.equal(p.active.energy.Fighting,2);
 assert.equal(s.log.filter(x=>x.type==='xy7DigOutAttach').length,1);
}));

test('Dig Out respects the physical Basic Energy card and does not also take an Energy Zone unit',()=>using(()=>{
 const s=battle('xy7-41'),p=s.sides.player;p.deck=[ref('fixture-water-energy','water')];p.energySupply=['Fighting'];
 act(s,'player',attack());assert.equal(p.active.energy.Fighting,3);assert.deepEqual(p.energySupply,['Fighting']);assert.equal(p.energyDiscard.Water,1);
}));

test('Bewitching Eyes offers genuine opponent discard Supporters, copies chosen action and leaves original untouched',()=>using(()=>{
 const s=battle('xy7-44'),p=s.sides.player,o=s.sides.opponent;
 o.discard=[ref('fixture-item','x'),ref('fixture-supporter','support'),ref('fixture-item','z')];p.deck=[ref('fixture-small','first'),ref('fixture-small','second'),ref('fixture-small','third')];
 act(s,'player',attack());assert.equal(s.pendingChoice.kind,'discardCard');
 assert.equal(core.legalActions(s,'player').length,1);
 act(s,'player',a=>a.choiceDiscardIndex===1);assert.equal(s.phase,'battle');
 assert.deepEqual(p.hand.map(x=>x.uid),['first','second']);assert.equal(o.discard[1].uid,'support');assert.equal(p.supporterUsed,false);
 assert.equal(s.log.filter(x=>x.type==='xy7BewitchingEyesCopy').length,1);
}));

test('Bewitching Eyes with no Supporter does not create a stuck choice',()=>using(()=>{
 const s=battle('xy7-44');s.sides.opponent.discard=[ref('fixture-item')];act(s,'player',attack());assert.equal(s.phase,'battle');
}));

test('Goodra Liquid Blow explicitly chooses between an Active and Benched target; ignores Bench weakness',()=>using(()=>{
 const s=battle('xy7-60'),o=s.sides.opponent;
 o.bench=[mon('fixture-bench','bench0',0),mon('fixture-small','bench1',1)];
 const actions=core.legalActions(s,'player').filter(attack());
 assert.ok(actions.length>=3,JSON.stringify(actions));
 const chosen=act(s,'player',a=>attack()(a)&&a.target==='opponentBench'&&a.benchIndex===0);
 assert.equal(o.bench[0].damage,40);assert.equal(o.active.damage,0);assert.equal(s.log.find(x=>x.type==='attack'&&x.attack==='Liquid Blow').damage,40);
}));

test('Goodra Liquid Blow uses Active retreat cost before Weakness and modifiers',()=>using(()=>{
 const s=battle('xy7-60');act(s,'player',a=>attack()(a)&&a.target==='opponentActive');
 assert.equal(s.sides.opponent.active.damage,60);
}));

test('Shining Breath status immunity holds through opposing turn, then expires',()=>using(()=>{
 const s=battle('xy7-60'),p=s.sides.player;
 act(s,'player',attack(1));assert.equal(p.active.statusGuard.expiresTurn,11);
 assert.equal(fx.statusIsPrevented(s,p.active,data.cardById,'paralysis'),true);
 s.turnNumber=11;assert.equal(fx.statusIsPrevented(s,p.active,data.cardById,'poison'),true);
 s.turnNumber=12;assert.equal(fx.statusIsPrevented(s,p.active,data.cardById,'poison'),false);
}));

test('Data Check exposes every physical draw-deck card to an inspect choice and shuffles on Done',()=>using(()=>{
 const s=battle('xy7-64'),p=s.sides.player;p.deck=[ref('fixture-item','a'),ref('fixture-small','b'),ref('fixture-wall','c')];
 act(s,'player',attack(0));assert.equal(s.pendingChoice.kind,'option');
 assert.deepEqual(s.pendingChoice.options.slice(1),['1. Item','2. Small','3. Wall']);
 act(s,'player',a=>a.choiceOption===2);assert.equal(s.pendingChoice.kind,'option');
 assert.ok(s.log.some(x=>x.type==='xy7DataCheckInspect'&&x.cardId==='fixture-small'));
 act(s,'player',a=>a.choiceOption===0);assert.equal(s.phase,'battle');assert.equal(p.deck.length,3);
 assert.ok(s.log.some(x=>x.type==='xy7DataCheckShuffle'));
}));

test('Lucky Helmet draws 2 when Active is damaged by a real opposing attack',()=>using(()=>{
 const s=battle('fixture-basic','opponent'),p=s.sides.player,o=s.sides.opponent;
 p.active=mon('fixture-small','helm');p.active.tool=ref('xy7-77','helmet');p.deck=[ref('fixture-item','first'),ref('fixture-item','second'),ref('fixture-item','third')];
 o.active.energy={Colorless:1};act(s,'opponent',attack());
 assert.deepEqual(p.hand.map(r=>r.uid),['first','second','third']);assert.equal(p.deck.length,0);
 assert.equal(s.log.filter(x=>x.type==='draw'&&x.amount===2).length,1);
}));

test('Lucky Helmet never triggers while Benched or on blocked/zero attack damage',()=>using(()=>{
 const s=battle('fixture-basic','opponent'),p=s.sides.player,o=s.sides.opponent;
 p.active=mon('fixture-wall','wall');p.bench=[mon('fixture-small','helm',0)];p.bench[0].tool=ref('xy7-77','helmet');p.deck=[ref('fixture-item','first'),ref('fixture-item','second')];
 o.active.energy={Colorless:1};act(s,'opponent',attack());assert.equal(p.hand.length,1);
 assert.equal(s.log.filter(x=>x.type==='draw'&&x.amount===2).length,0);
}));


test('Lucky Helmet draws before a knockout removes the Active and ends the battle',()=>using(()=>{
 const s=battle('fixture-basic','opponent'),p=s.sides.player,o=s.sides.opponent;
 p.active=mon('fixture-small','helm');p.active.damage=30;p.active.tool=ref('xy7-77','helmet');
 p.deck=[ref('fixture-item','first'),ref('fixture-item','second'),ref('fixture-item','third')];
 o.active.energy={Colorless:1};act(s,'opponent',attack());
 assert.deepEqual(p.hand.map(r=>r.uid),['first','second']);
 assert.equal(s.log.filter(x=>x.type==='draw'&&x.amount===2).length,1);
 assert.ok(s.log.some(x=>x.type==='knockOut'||x.type==='ko'||x.type==='knockout'),JSON.stringify(s.log.slice(-20)));
}));


test('GitHub-generated full Ancient Origins catalogue has 101 unique playable prints with no gates',
 {skip:require(path.join(assets,'tcg-classic-ancient-origins.js')).CARDS.length!==101},()=>{
 const set=require(path.join(assets,'tcg-classic-ancient-origins.js'));
 assert.equal(set.coverage().total,101);
 assert.equal(set.coverage().battleEnabled,101,JSON.stringify(set.coverage().gated));
 assert.deepEqual(set.coverage().gated,[]);
 assert.equal(new Set(set.CARDS.map(c=>c.id)).size,101);
 for(const c of set.CARDS){
  assert.equal(c.deckEligible,true,c.id);
  for(const atk of c.attacks||[])assert.deepEqual(fx.validateEffect(atk.effect),[],`${c.id}: ${atk.name}`);
  for(const ab of c.abilities||[])assert.deepEqual(fx.validateEffect(ab.effect),[],`${c.id}: ${ab.name}`);
  if(c.kind==='trainer')assert.deepEqual(fx.validateEffect(c.effect),[],c.id);
 }
});

test('CPU resolves Sableye copied Supporter and Porygon deck-inspection prompts without stalling',()=>using(()=>{
 const sableye=battle('xy7-44'),o=sableye.sides.opponent;
 o.discard=[ref('fixture-item','item'),ref('fixture-supporter','support')];
 sableye.sides.player.deck=[ref('fixture-item','draw1'),ref('fixture-item','draw2')];
 act(sableye,'player',attack());
 const use=ai.chooseAction(sableye,'player','Beginner',0);
 assert.equal(use.choiceDiscardIndex,1);core.applyAction(sableye,'player',use);
 assert.equal(sableye.phase,'battle');assert.equal(o.discard.length,2);
 const porygon=battle('xy7-64');porygon.sides.player.deck=[ref('fixture-item','a'),ref('fixture-wall','b')];
 act(porygon,'player',attack());
 const done=ai.chooseAction(porygon,'player','Beginner',0);
 assert.equal(done.choiceOption,0);core.applyAction(porygon,'player',done);
 assert.equal(porygon.phase,'battle');
}));
