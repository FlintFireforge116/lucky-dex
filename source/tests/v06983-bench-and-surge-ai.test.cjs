'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const Core=require(path.join(assets,'tcgp-battle-core.js'));
const Decks=require(path.join(assets,'tcg-classic-decks.js'));
const UI=require(path.join(assets,'tcgp-battle-ui.js'));
const AI=require(path.join(assets,'tcgp-battle-ai.js'));

function battle(){
 const s=Core.createBattle({format:'classic',playerDeck:Decks.LOANER_DECK,opponentDeck:Decks.LOANER_DECK,playerEnergyTypes:['Lightning'],opponentEnergyTypes:['Grass'],seed:8317});
 s.phase='battle';s.activeSide='player';s.turnNumber=8;s.sides.player.turnCount=4;
 s.sides.player.hand=[];return s;
}
function narrow(s){s.stadium={uid:'narrow-gym',cardId:'gym1-124',ownerSide:'opponent'};for(const side of ['player','opponent'])s.sides[side].benchLimit=2;}
function slot(id,index,uid){const x=Core.makePokemonSlot(id,2,uid);x.benchSlot=index;return x;}

test('Narrow Gym makes an occupied third physical slot visible after reducing the Bench to two',()=>{
 const s=battle(),ss=s.sides.player;narrow(s);
 ss.bench=[slot('gym1-81',1,'pika'),slot('gym1-83',2,'spearow')];
 Core.legalActions(s,'player');
 assert.deepEqual(ss.bench.map(x=>x.benchSlot).sort(),[0,1],'neither Pokémon may remain hidden at slot 2');
 assert.ok(Core.benchSlotAt(ss,0));assert.ok(Core.benchSlotAt(ss,1));
});
test('Narrow Gym shows a single survivor previously at slot 2 and allows Lickitung in the genuinely free slot',()=>{
 const s=battle(),ss=s.sides.player;narrow(s);
 ss.bench=[slot('gym1-81',2,'pika')];ss.hand=[{uid:'lick-1',cardId:'gym1-41'}];
 const actions=Core.legalActions(s,'player');
 assert.equal(Core.benchSlotAt(ss,0)?.cardId,'gym1-81');
 const bench=actions.filter(a=>a.type==='bench'&&a.cardId==='gym1-41');
 assert.equal(bench.length,1,'one slot remains for a Basic Pokémon');
 assert.equal(bench[0].benchIndex,1);
 assert.ok(UI.directHandDropActionIndex(actions,s,0,'bench',1)>=0);
 Core.applyAction(s,'player',bench[0]);
 assert.deepEqual(ss.bench.map(x=>x.cardId).sort(),['gym1-41','gym1-81']);
 assert.deepEqual(ss.bench.map(x=>x.benchSlot).sort(),[0,1]);
});

function surgeState(n,discarded=0){
 const s=battle(),ss=s.sides.player,foe=s.sides.opponent;
 ss.active=slot('gym1-6',null,'buzz');ss.active.energy={Lightning:n};ss.energyDiscard={Lightning:discarded};
 ss.bench=[];foe.active=slot('base1-44',null,'defender');foe.bench=[];
 return s;
}
for(const difficulty of ['Beginner','Intermediate','Advanced','Expert']){
 test(`${difficulty} CPU chooses Discharge rather than endless Charge or surplus Energy attachments`,()=>{
  const s=surgeState(10,0);
  const a=AI.chooseAction(s,'player',difficulty,0);
  assert.equal(a.type,'attack');
  assert.equal(a.attackIndex,1,'use Discharge instead of 0-damage Charge');
  Core.applyAction(s,'player',a);
  const coin=s.log.filter(e=>e.type==='coin'&&e.side==='player').at(-1);
  assert.equal(coin?.coins,10,'Discharge must flip once for each Lightning Energy');
  assert.equal(s.sides.player.energyDiscard.Lightning,10,'Discharge discards every Lightning Energy');
  assert.equal(s.sides.player.active.energy.Lightning,0);
 });
}
test('CPU may still use Charge to recover Energy from discard when Discharge is not yet worth using',()=>{
 const s=surgeState(1,2);s.sides.player.energyUsed=true;
 const a=AI.chooseAction(s,'player','Beginner',0);
 assert.equal(a.type,'attack');assert.equal(a.attackIndex,0);
 Core.applyAction(s,'player',a);
 assert.equal(s.sides.player.active.energy.Lightning,3);
 assert.equal(s.sides.player.energyDiscard.Lightning,0);
});
test('playing Narrow Gym immediately repacks previously occupied slot 2, even before the next legal-action call',()=>{
 const s=battle(),ss=s.sides.player;
 ss.bench=[slot('gym1-81',1,'pika'),slot('gym1-83',2,'spearow')];
 ss.hand=[{uid:'narrow-own',cardId:'gym1-124'}];
 const action=Core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='gym1-124');
 assert.ok(action);
 Core.applyAction(s,'player',action);
 assert.equal(s.stadium.cardId,'gym1-124');
 assert.deepEqual(ss.bench.map(x=>x.benchSlot).sort(),[0,1]);
 assert.equal(Core.legalActions(s,'player').filter(a=>a.type==='bench').length,0);
});
