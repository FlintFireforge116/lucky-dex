'use strict';
// Runtime outcome tests can run BEFORE the canonical SM5 source is downloaded.
// The actual pinned 178-print catalogue is validated by the SM5 release gate.
const {test}=require('node:test'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const fixture=JSON.parse(execFileSync('python3',['scripts/sm5_stage2_fixture.py'],{cwd:require('node:path').resolve(__dirname,'..'),encoding:'utf8'}));
const rich={Grass:6,Fire:6,Water:6,Lightning:6,Psychic:6,Fighting:6,Darkness:6,Metal:6,Colorless:6};
const ref=(id,uid)=>({uid,cardId:id});
const slot=(id,uid,energy={})=>({uid,cardId:id,stack:[id],damage:0,energy:{...energy},specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const makeCard=(name,effect,damage=0,stage='Basic')=>({id:'sm5-stage2-test-'+name,number:'0',name,kind:'pokemon',stage,hp:1000,types:['Colorless'],subtype:'Colorless',weakness:null,retreat:0,battleEnabled:true,deckEligible:true,prizeCards:1,attacks:[{name,cost:['C'],damage,effect}],abilities:[]});
function setup(name,damage=0){
 const attack=makeCard(name,fixture.attacks[name],damage),defender=makeCard('Defender', {type:'noop'},0),evo={...makeCard('Evolution Defender',{type:'noop'},0,'Stage 1'),evolvesFrom:'Defender'};
 const extras=new Map([attack,defender,evo].map(c=>[c.id,c]));const original=data.cardById;data.cardById=id=>extras.get(id)||original(id);
 let state;
 try{state=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:73613,firstSide:'player',playerEnergyTypes:['Grass','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Water','Lightning','Psychic','Fighting','Darkness','Metal']});}
 catch(e){data.cardById=original;throw e;}
 state.phase='battle';state.activeSide='player';state.turnNumber=5;
 for(const who of ['player','opponent']){let s=state.sides[who];s.turnCount=3;s.energyUsed=true;s.handEnergyUsed=true;s.hand=[];s.deck=Array.from({length:12},(_,i)=>ref('sm4-1',who+'deck'+i));s.discard=[];s.energyDiscard={};s.prizes=Array.from({length:5},(_,i)=>ref('sm4-1',who+'prize'+i));}
 state.sides.player.active=slot(attack.id,'pa',rich);state.sides.player.bench=[slot('sm4-1','pb',{})];state.sides.opponent.active=slot(defender.id,'oa',rich);state.sides.opponent.bench=[slot('sm4-1','ob',{})];
 return {state,attack,defender,evo,extras,restore:()=>{data.cardById=original;}};
}
function doAttack(s,name){const act=core.legalActions(s,'player').find(a=>a.type==='attack'&&data.cardById(s.sides.player.active.cardId)?.attacks?.[a.attackIndex]?.name===name);assert.ok(act,`Missing legal attack: ${name}`);core.applyAction(s,'player',act);return act;}
function choose(s,side='player',filter=()=>true){let count=0;while(s.phase==='effectChoice'&&count++<16){const actions=core.legalActions(s,s.choiceSide);let a=actions.find(x=>x.type==='effectChoice'&&filter(x))||actions.find(x=>x.type==='effectChoice');assert.ok(a,'Pending choice has no legal action');core.applyAction(s,s.choiceSide,a);}assert.ok(count<16,'Choice loop');}

test('SM5 Stage 2: all text-locked attack and Trainer descriptors are valid',()=>{
 assert.ok(Object.keys(fixture.attacks).length>=35);assert.ok(Object.keys(fixture.trainers).length>=8);
 for(const [n,e] of [...Object.entries(fixture.attacks),...Object.entries(fixture.trainers)])assert.deepEqual(fx.validateEffect(e),[],n);
});
test('SM5 Panic Poison applies burn, confusion AND poison together',()=>{
 const h=setup('Panic Poison');try{doAttack(h.state,'Panic Poison');let c=h.state.sides.opponent.active.conditions;assert.ok(h.state.log.some(e=>e.type==='status'&&e.status==='burn'&&e.affectedCount===1));assert.ok(h.state.log.some(e=>e.type==='statusDamage'&&e.status==='burn'&&e.amount===20));assert.ok(c.confusion);assert.ok(c.poison);}finally{h.restore();}
});
test('SM5 Hunter\'s Nails gives 60 bonus only against a Special Condition',()=>{
 for(const poisoned of [false,true]){const h=setup("Hunter's Nails",60);try{if(poisoned)h.state.sides.opponent.active.conditions.confusion=true;doAttack(h.state,"Hunter's Nails");assert.equal(h.state.sides.opponent.active.damage,poisoned?120:60);}finally{h.restore();}}
});
test('SM5 Clean Hit doubles 60 damage against an Evolution, not a Basic',()=>{
 for(const evolved of [false,true]){const h=setup('Clean Hit',60);try{if(evolved){h.state.sides.opponent.active.cardId=h.evo.id;h.state.sides.opponent.active.stack=[h.defender.id,h.evo.id];}doAttack(h.state,'Clean Hit');assert.equal(h.state.sides.opponent.active.damage,evolved?120:60);}finally{h.restore();}}
});
test('SM5 Mega Drain heals 30 without producing additional Energy',()=>{
 const h=setup('Mega Drain',30);try{h.state.sides.player.active.damage=70;const before={...h.state.sides.player.active.energy};doAttack(h.state,'Mega Drain');assert.equal(h.state.sides.player.active.damage,40);assert.deepEqual(h.state.sides.player.active.energy,before);}finally{h.restore();}
});
test('SM5 Disconnect prevents Item play by the opponent on their next turn',()=>{
 const h=setup('Disconnect',30);try{h.state.sides.opponent.hand=[ref('sm4-97','opItem')];doAttack(h.state,'Disconnect');assert.equal(h.state.activeSide,'opponent');assert.ok(!core.legalActions(h.state,'opponent').some(a=>a.cardId==='sm4-97'));}finally{h.restore();}
});
test('SM5 Sand Tomb prevents defending Pokemon retreating',()=>{
 const h=setup('Sand Tomb',50);try{doAttack(h.state,'Sand Tomb');assert.equal(h.state.activeSide,'opponent');assert.equal(core.legalActions(h.state,'opponent').filter(a=>a.type==='retreat').length,0);}finally{h.restore();}
});
test('SM5 Overclock draws exactly up to six cards',()=>{
 const h=setup('Overclock');try{h.state.sides.player.hand=[ref('sm4-1','one')];doAttack(h.state,'Overclock');assert.equal(h.state.sides.player.hand.length,6);}finally{h.restore();}
});
test('SM5 searching for Basic Energy consumes the Energy Zone, not arbitrary cards',()=>{
 const h=setup('Charge');try{const s=h.state.sides.player;const before=s.energySupply.filter(t=>t==='Lightning').length;const prev=s.active.energy.Lightning;doAttack(h.state,'Charge');assert.equal(s.active.energy.Lightning,prev+1);assert.equal(s.energySupply.filter(t=>t==='Lightning').length,before-1);}finally{h.restore();}
});
test('SM5 Stompy Stomp damage equals coin heads times 40',()=>{
 const h=setup('Stompy Stomp');try{doAttack(h.state,'Stompy Stomp');const coins=h.state.log.filter(e=>e.type==='coin');assert.ok(coins.length);const v=coins.at(-1);assert.equal(h.state.sides.opponent.active.damage,(v.heads||0)*40);}finally{h.restore();}
});
test('SM5 Trainer Looker draws from the BOTTOM, keeping the top cards in place',()=>{
 const eff=fixture.trainers.Looker;assert.deepEqual(eff,{type:'draw',amount:3,fromBottom:true});
 const h=setup('Mega Drain');try{const s=h.state.sides.player;s.hand=[];s.deck=[ref('sm4-1','top'),ref('sm4-91','middle'),ref('sm4-97','bottom')];
  fx.applyEffect(eff,{state:h.state,side:'player',foeSide:'opponent',attacker:s.active,defender:h.state.sides.opponent.active,cardById:data.cardById,random:()=>0.1,drawCard:ss=>ss.deck.length&&ss.hand.push(ss.deck.shift())});
  assert.deepEqual(s.hand.map(r=>r.uid),['bottom','middle','top']);assert.equal(s.deck.length,0);
 }finally{h.restore();}
});

function context(h,side='player'){
 return {state:h.state,side,foeSide:side==='player'?'opponent':'player',attacker:h.state.sides[side].active,defender:h.state.sides[side==='player'?'opponent':'player'].active,
   cardById:data.cardById,random:()=>0.1,drawCard:ss=>{if(ss.deck.length)ss.hand.push(ss.deck.shift());}};
}
test('SM5 Mars discards only after a successful draw and keeps physical card identities',()=>{
 for(const haveDeck of [false,true]){const h=setup('Mega Drain');try{
  const ss=h.state.sides.player,foe=h.state.sides.opponent;
  ss.hand=[];ss.deck=haveDeck?[ref('sm4-1','d1'),ref('sm4-1','d2')]:[];foe.hand=[ref('sm4-91','item1'),ref('sm4-97','item2')];
  fx.applyEffect(fixture.trainers.Mars,context(h));
  assert.equal(ss.hand.length,haveDeck?2:0);assert.equal(foe.hand.length,haveDeck?1:2);assert.equal(foe.discard.length,haveDeck?1:0);
 }finally{h.restore();}}
});
test('SM5 Mars applies the same rules when the CPU uses it',()=>{
 const h=setup('Mega Drain');try{const foe=h.state.sides.opponent,us=h.state.sides.player;
  foe.deck=[ref('sm4-1','cpuDraw')];us.hand=[ref('sm4-91','humanItem')];
  fx.applyEffect(fixture.trainers.Mars,context(h,'opponent'));
  assert.equal(foe.hand.length,1);assert.equal(us.hand.length,0);assert.equal(us.discard[0].uid,'humanItem');
 }finally{h.restore();}
});
test('SM5 Lana heals only Pokemon with Water Energy',()=>{
 const h=setup('Mega Drain');try{const s=h.state.sides.player;s.active.damage=90;s.bench[0].damage=70;
  s.active.energy={Water:1};s.bench[0].energy={Grass:1};
  fx.applyEffect(fixture.trainers.Lana,context(h));
  assert.equal(s.active.damage,40);assert.equal(s.bench[0].damage,70);
 }finally{h.restore();}
});
test('SM5 Synthesis attaches exactly one Grass Energy from zone and permits a chosen target',()=>{
 const h=setup('Synthesis');try{const s=h.state.sides.player;
  s.energySupply=['Grass','Water','Grass'];const before=s.energySupply.length;
  doAttack(h.state,'Synthesis');choose(h.state);
  assert.equal(s.energySupply.length,before-1);
  assert.equal(Number(s.active.energy.Grass||0)+Number(s.bench[0].energy.Grass||0),rich.Grass+1);
 }finally{h.restore();}
});
test('SM5 Searching Magnet finds virtual Metal Energy rather than duplicating cards',()=>{
 const h=setup('Searching Magnet');try{const s=h.state.sides.player;
  s.energySupply=['Metal','Water','Metal','Metal'];s.hand=[];s.deck=[ref('sm4-1','notEnergy')];
  doAttack(h.state,'Searching Magnet');choose(h.state);
  assert.ok(s.hand.some(r=>data.cardById(r.cardId)?.basicEnergy&&data.cardById(r.cardId)?.subtype==='Metal'));
  assert.ok(s.energySupply.filter(t=>t==='Metal').length<3);
  assert.equal(s.deck.some(r=>r.uid==='notEnergy'),true);
 }finally{h.restore();}
});
test('SM5 Looker Whistle searches for named Looker prints, not unrelated supporters',()=>{
 const h=setup('Mega Drain');try{const e=fixture.trainers['Looker Whistle'];assert.deepEqual(e.filter,{name:'Looker'});assert.equal(e.amount,2);
  assert.deepEqual(fx.validateEffect(e),[]);
 }finally{h.restore();}
});

test('SM5 Mt. Coronet recovers discarded Metal Energy, never fresh supply',()=>{
 const h=setup('Mega Drain');try{
  const s=h.state.sides.player,original=h.state.sides.player.energySupply.slice();
  const stadium={id:'sm5-stage2-test-coronet',name:'Mt. Coronet',kind:'trainer',trainerType:'Stadium',battleEnabled:true,effect:fixture.trainers['Mt. Coronet']};
  h.extras.set(stadium.id,stadium);
  h.state.stadium={uid:'coronet',cardId:stadium.id,ownerSide:'player'};
  s.energyDiscard={Metal:2,Water:1};s.hand=[];
  const a=core.legalActions(h.state,'player').find(x=>x.type==='stadiumAction'&&x.cardId===stadium.id);
  assert.ok(a,'Mt. Coronet action available');core.applyAction(h.state,'player',a);choose(h.state);
  assert.equal(s.energyDiscard.Metal,0);assert.equal(s.energyDiscard.Water,1);
  assert.equal(s.hand.filter(r=>data.cardById(r.cardId)?.basicEnergy&&data.cardById(r.cardId)?.subtype==='Metal').length,2);
  assert.deepEqual(s.energySupply,original);assert.ok(!core.legalActions(h.state,'player').some(x=>x.type==='stadiumAction'),'once per turn');
 }finally{h.restore();}
});

test('SM5 Gardenia cannot target a Pokemon without Grass Energy',()=>{
 const h=setup('Mega Drain');try{
  const s=h.state.sides.player;s.active.damage=140;s.active.energy={Water:1};s.bench[0].damage=90;s.bench[0].energy={Grass:1};
  const trainer={id:'sm5-stage2-test-gardenia',name:'Gardenia',kind:'trainer',trainerType:'Supporter',battleEnabled:true,effect:fixture.trainers.Gardenia};
  h.extras.set(trainer.id,trainer);s.hand=[ref(trainer.id,'gardenia')];s.supporterUsed=false;
  const a=core.legalActions(h.state,'player').find(x=>x.cardId===trainer.id);
  assert.ok(a,'Gardenia Supporter action');
  const alternatives=core.legalActions(h.state,'player').filter(x=>x.cardId===trainer.id);
  assert.ok(alternatives.length);assert.ok(alternatives.every(x=>x.target!=='active'),'Cannot select Water-only active');
  core.applyAction(h.state,'player',a);choose(h.state);assert.equal(s.active.damage,140);assert.equal(s.bench[0].damage,10);
 }finally{h.restore();}
});

test('SM5 Order Pad respects heads/tails and does not fabricate a deck Item',()=>{
 const h=setup('Mega Drain');try{
  const eff=fixture.trainers['Order Pad'];assert.deepEqual(fx.validateEffect(eff),[]);
  assert.equal(eff.type,'coinFlip');assert.deepEqual(eff.heads.filter,{kind:'trainer',trainerType:'Item'});
  const s=h.state.sides.player;s.hand=[];s.deck=[ref('sm4-1','basic')];
  const before=s.deck.map(r=>r.uid);
  fx.applyEffect(eff,{...context(h),random:()=>0.999});
  assert.deepEqual(s.deck.map(r=>r.uid),before);assert.equal(s.hand.length,0);
 }finally{h.restore();}
});


test('SM5 Cynthia shuffles hand into deck, then draws exactly six cards',()=>{
 const h=setup('Mega Drain');try{const s=h.state.sides.player;
  const support={id:'sm5-stage2-test-cynthia',name:'Cynthia',kind:'trainer',trainerType:'Supporter',battleEnabled:true,effect:fixture.trainers.Cynthia};
  h.extras.set(support.id,support);s.hand=[ref(support.id,'cynthia'),ref('sm4-91','before1'),ref('sm4-97','before2')];s.deck=Array.from({length:8},(_,i)=>ref('sm4-1','d'+i));
  const a=core.legalActions(h.state,'player').find(x=>x.cardId===support.id);assert.ok(a);
  core.applyAction(h.state,'player',a);
  assert.equal(s.hand.length,6);assert.ok(s.deck.some(x=>x.uid==='before1'||x.uid==='before2'),'Original hand was shuffled into deck');
  assert.equal(s.discard.filter(x=>x.cardId===support.id).length,1,'Supporter moved to discard, not the draw deck');
 }finally{h.restore();}
});
