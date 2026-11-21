'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcgp-battle-data.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const loan=require(path.join(assets,'tcg-classic-battle-data.js')).CLASSIC30_LOANER_DECK;
const PY=String.raw`
import sys,json,importlib.util
p=sys.argv[1];sys.path.insert(0,p)
spec=importlib.util.spec_from_file_location('xy6gen',p+'/build-xy6.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
rows=[
 ['10','Ninjask','Pokémon',['Stage 1'],80,['Grass'],'Nincada', [['Afterimage Assault',['C'],'30','Search your deck for up to 2 Ninjask and put them onto your Bench. Shuffle your deck afterward.']], [['Wing Buzz','Ability','Once during your turn (before your attack), if this Pokémon is your Active Pokémon, you may discard a card from your hand. If you do, discard the top card of your opponent\'s deck.']],None,None,1,'Rare',[],None,None],
 ['46','Togekiss','Pokémon',['Stage 2'],140,['Fairy'],'Togetic', [['Fairy Wind',['Y','C'],'60','']], [['Serene Grace','Ability','When you play this Pokémon from your hand to evolve 1 of your Pokémon, you may look at the top 8 cards of your deck. Choose any basic Energy cards you find there and attach them to your Pokémon in any way you like. Shuffle the other cards back into your deck.']],None,None,1,'Rare',[],None,{'name':'Δ Evolution','text':'You may play this card from your hand to evolve a Pokémon during your first turn or the turn you play that Pokémon.'}],
 ['31','Banette','Pokémon',['Stage 1'],90,['Psychic'],'Shuppet', [['Psyshot',['P','C'],'60','']], [['Tool Concealment','Ability','Each Pokémon Tool card in play has no effect.']],None,None,1,'Rare',[],None,None]]
print(json.dumps(m.generate(rows)))
`;
const gen=spawnSync('python3',['-c',PY,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(gen.status,0,gen.stderr);
const cards=Object.fromEntries(JSON.parse(gen.stdout).map(c=>[c.id,c]));
cards['demo-togetic']={id:'demo-togetic',name:'Togetic',kind:'pokemon',stage:'Stage 1',types:['Fairy'],hp:100,retreat:1,battleEnabled:true,attacks:[{name:'Tap',cost:['C'],damage:10,effect:{type:'noop'}}]};
cards['demo-basic']={id:'demo-basic',name:'Other',kind:'pokemon',stage:'Basic',types:['Colorless'],hp:100,retreat:1,battleEnabled:true,attacks:[{name:'Tap',cost:['C'],damage:10,effect:{type:'noop'}}]};
const ref=(cardId,uid)=>({cardId,uid});
const slot=(id,uid,benchSlot=null)=>({uid,cardId:id,stack:[id],damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],benchSlot,conditions:{},playedOnSideTurn:1});
function using(fn){const old=data.cardById;data.cardById=id=>cards[id]||old(id);try{return fn();}finally{data.cardById=old;}}
function battle(){const s=core.createBattle({format:'classic',playerDeck:loan,opponentDeck:loan,seed:360,firstSide:'player',playerEnergyTypes:['Fire','Fairy','Water'],opponentEnergyTypes:['Water']});s.phase='battle';s.activeSide='player';s.turnNumber=10;for(const ss of Object.values(s.sides)){ss.turnCount=5;ss.bench=[];ss.hand=[];ss.handEnergyUsed=false;ss.energyUsed=false;ss.supporterUsed=false;ss.stadiumUsed=false;ss.handLimit=8;}s.sides.player.active=slot('demo-togetic','active');s.sides.player.bench=[slot('demo-basic','bench',0)];s.sides.opponent.active=slot('demo-basic','foe');return s;}
function choice(s,pred){const options=core.legalActions(s,s.choiceSide||'player').filter(a=>a.type==='effectChoice');const found=options.find(pred);assert.ok(found,`Missing choice: ${JSON.stringify(options)}`);return core.applyAction(s,s.choiceSide||'player',found);}
function evolve(s){s.sides.player.hand=[ref('xy6-46','toge')];const a=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='xy6-46');assert.ok(a,'Togekiss not eligible to evolve');return core.applyAction(s,'player',a);}
test('Togekiss, Ninjask and later-completed Banette are enabled',()=>{
 assert.equal(cards['xy6-10'].battleEnabled,true,JSON.stringify(cards['xy6-10'].support));
 assert.deepEqual(fx.validateEffect(cards['xy6-10'].abilities[0].effect),[]);
 assert.equal(cards['xy6-46'].battleEnabled,true,JSON.stringify(cards['xy6-46'].support));
 assert.deepEqual(fx.validateEffect(cards['xy6-46'].abilities[0].effect),[]);
 assert.equal(cards['xy6-31'].battleEnabled,true,JSON.stringify(cards['xy6-31'].support));
});
test('Serene Grace may be declined without removing any zone Energy',()=>using(()=>{
 const s=battle(),ss=s.sides.player;ss.energySupply=['Fairy','Fire','Water','Fairy','Fire','Water','Fairy','Fire','Water'];const before=ss.energySupply.slice();evolve(s);
 assert.equal(s.phase,'effectChoice');choice(s,a=>a.choiceOption===1);
 assert.equal(s.phase,'battle');assert.deepEqual(ss.energySupply,before);assert.deepEqual(ss.active.energy,{});
}));
test('Serene Grace takes real top-eight Zone units and allows multiple chosen destinations',()=>using(()=>{
 const s=battle(),ss=s.sides.player;ss.energySupply=['Fairy','Fire','Water','Fairy','Fire','Water','Fairy','Fire','Water'];const original=ss.energySupply.slice();
 evolve(s);choice(s,a=>a.choiceOption===0); // use Ability
 assert.equal(s.phase,'effectChoice');assert.equal(ss.energySupply.length,1); // top eight held out
 choice(s,a=>a.choiceOption===1);choice(s,a=>a.choiceTarget==='active');
 assert.equal(ss.active.energy.Fairy,1);
 choice(s,a=>a.choiceOption===1);choice(s,a=>a.choiceTarget==='bench');
 assert.equal(ss.bench[0].energy.Fire,1);
 choice(s,a=>a.choiceOption===0); // stop attaching
 assert.equal(s.phase,'battle');assert.equal(ss.energySupply.length,7);
 assert.equal(ss.nextEnergyType,ss.energySupply[0]);
 const after=[...ss.energySupply,'Fairy','Fire'];assert.deepEqual(after.slice().sort(),original.slice().sort());
 assert.equal(s.log.filter(e=>e.type==='xy6SereneGraceAttach').length,2);
}));
test('Serene Grace does not trigger on an empty Energy Zone',()=>using(()=>{
 const s=battle();s.sides.player.energySupply=[];evolve(s);assert.notEqual(s.phase,'effectChoice');
}));

test('Wing Buzz discards a chosen physical card and exactly one opposing draw-deck card',()=>using(()=>{
 const s=battle(),ss=s.sides.player,foe=s.sides.opponent;
 ss.active=slot('xy6-10','ninjask');ss.hand=[ref('demo-basic','discardMe'),ref('demo-togetic','keepMe')];
 foe.deck=[ref('demo-basic','top'),ref('demo-basic','bottom')];
 let ability=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='xy6-10');assert.ok(ability);
 core.applyAction(s,'player',ability);assert.equal(s.phase,'effectChoice');
 choice(s,a=>a.choiceHandIndex===1);
 assert.equal(s.phase,'battle');assert.deepEqual(ss.hand.map(x=>x.uid),['discardMe']);
 assert.deepEqual(ss.discard.slice(-1).map(x=>x.uid),['keepMe']);
 assert.deepEqual(foe.discard.slice(-1).map(x=>x.uid),['top']);
 assert.deepEqual(foe.deck.map(x=>x.uid),['bottom']);
 assert.equal(core.legalActions(s,'player').filter(a=>a.type==='ability'&&a.cardId==='xy6-10').length,0);
}));
test('Wing Buzz not offered on Bench or without either an actual hand card or opponent deck',()=>using(()=>{
 for(const mode of ['bench','emptyHand','emptyDeck']){
  const s=battle(),ss=s.sides.player,foe=s.sides.opponent;
  ss.hand=[ref('demo-basic','ready')];ss.active=slot('xy6-10','ninja');foe.deck=[ref('demo-basic','target')];
  if(mode==='bench'){ss.bench=[slot('xy6-10','benchNinja',0)];ss.active=slot('demo-basic','active');}
  if(mode==='emptyHand')ss.hand=[];
  if(mode==='emptyDeck')foe.deck=[];
  assert.equal(core.legalActions(s,'player').filter(a=>a.type==='ability'&&a.cardId==='xy6-10').length,0,mode);
 }
}));

test('CPU uses Serene Grace, selects real Zone energy and reaches a useful target',()=>using(()=>{
 const ai=require(path.join(assets,'tcgp-battle-ai.js'));
 const s=battle(),ss=s.sides.player;ss.energySupply=['Fairy','Fire','Water','Fairy','Fire','Water','Fairy','Fire','Water'];
 evolve(s);
 let a=ai.chooseAction(s,'player','Beginner',1);assert.equal(a?.choiceOption,0,'CPU should use beneficial optional Ability');
 core.applyAction(s,'player',a);
 a=ai.chooseAction(s,'player','Beginner',2);assert.equal(a?.choiceOption,1,'CPU should not choose Done');
 core.applyAction(s,'player',a);
 a=ai.chooseAction(s,'player','Beginner',3);assert.ok(['active','bench'].includes(a?.choiceTarget));
 core.applyAction(s,'player',a);
 assert.equal(Number(ss.active.energy.Fairy||0)+Number(ss.bench[0].energy.Fairy||0),1);
}));
