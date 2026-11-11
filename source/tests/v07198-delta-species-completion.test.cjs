'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const root='../app/src/main/assets/';
const core=require(root+'tcgp-battle-core.js'),fx=require(root+'tcgp-battle-effects.js');
const data=require(root+'tcg-classic-battle-data.js'),set=require(root+'tcg-classic-delta-species.js');
const cpu=require(root+'tcg-classic-opponents.js');
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Metal','Darkness'];
const deck=cpu.generate({sets:['ex11'],seed:42}).cards;
let seed=711980;
const ref=(cardId,uid)=>({cardId,uid});
function slot(id,uid,benchSlot=-1){const p=core.makePokemonSlot(id,3,uid);p.benchSlot=benchSlot;p.energy={};return p;}
function game(id='ex11-57',enemy='ex11-57'){
 const s=core.createBattle({format:'classic',playerDeck:deck,opponentDeck:deck,seed:++seed,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
 s.phase='battle';s.activeSide='player';s.turnNumber=9;s.sides.player.turnCount=5;s.sides.opponent.turnCount=4;
 s.sides.player.active=slot(id,'attacker');s.sides.opponent.active=slot(enemy,'defender');
 s.sides.player.bench=[slot('ex11-57','ownbench',0)];s.sides.opponent.bench=[slot('ex11-57','foebench',0)];
 return s;
}
function choose(s,fn){assert.equal(s.phase,'effectChoice',JSON.stringify(s.pendingChoice));const side=s.choiceSide||s.activeSide,acts=core.legalActions(s,side),a=acts.find(fn||(()=>true));assert.ok(a,'No matching choice: '+JSON.stringify(acts));core.applyAction(s,side,a);return a;}
function finish(s){let n=0;while(s.phase==='effectChoice'&&n++<80)choose(s,a=>!a.choiceSkip);assert.notEqual(s.phase,'effectChoice','choice loop or softlock');}
function effect(s,name){return fx.applyEffect({type:'neoRule',rule:'ex11:'+name},{...core.effectContext(s,'player',{},s.sides.player.active),random:()=>0.01});}
function playAttack(s,n=0){s.sides.player.active.energy=Object.fromEntries(types.map(t=>[t,8]));const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===n);assert.ok(a,'Attack missing');core.applyAction(s,'player',a);return a;}

test('114 Delta Species cards and all attacks are battle-enabled, with functional attack metadata',()=>{
 assert.equal(set.CARDS.length,114);assert.equal(set.coverage().battleEnabled,114);assert.deepEqual(set.coverage().partial,[]);
 const mons=set.CARDS.filter(c=>c.kind==='pokemon');assert.equal(mons.reduce((a,c)=>a+c.attacks.length,0),147);
 for(const c of set.CARDS){assert.ok(c.battleEnabled&&c.deckEligible,c.id);assert.equal(c.support.status,'FULL');}
});
test('Holon Stage 1 Pokémon can be played as Pokémon OR attached as two-energy Special, returning an existing Energy card',()=>{
 const s=game(),p=s.sides.player;p.hand=[ref('ex11-22','holon-magneton')];p.active.energy={Metal:1};
 const actions=core.legalActions(s,'player').filter(a=>a.type==='attachSpecial'&&a.cardId==='ex11-22');
 assert.ok(actions.some(a=>a.target==='active'));
 core.applyAction(s,'player',actions.find(a=>a.target==='active'));
 assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'player');
 assert.equal(p.active.specialEnergy.length,1);assert.equal(p.active.specialEnergy[0].cardId,'ex11-22');
 choose(s,a=>a.choiceOption===0);
 assert.equal(p.active.energy.Metal,0);assert.ok(p.hand.some(x=>data.cardById(x.cardId)?.basicEnergy));
 assert.equal(fx.canPayCost(core.effectiveEnergy(s,'player',p.active),'MM'),true);
 assert.equal(fx.canPayCost(core.effectiveEnergy(s,'player',p.active),'MMM'),false);
 const s2=game(),q=s2.sides.player;q.hand=[ref('ex11-21','holon-electrode')];
 assert.ok(!core.legalActions(s2,'player').some(a=>a.type==='attachSpecial'&&a.cardId==='ex11-21'));
});
test('Holon Magnemite and Voltorb can be attached as Colorless one or benched as Pokémon',()=>{
 for(const id of ['ex11-70','ex11-71']){
  const s=game(),p=s.sides.player;p.hand=[ref(id,id+'-inhand')];
  assert.ok(core.legalActions(s,'player').some(a=>a.type==='bench'&&a.cardId===id),id+' cannot be benched');
  const action=core.legalActions(s,'player').find(a=>a.type==='attachSpecial'&&a.cardId===id&&a.target==='active');assert.ok(action,id+' cannot be Energy');
  core.applyAction(s,'player',action);assert.equal(s.phase,'battle');
  assert.equal(p.active.specialEnergy[0].cardId,id);assert.equal(fx.canPayCost(core.effectiveEnergy(s,'player',p.active),'C'),true);
  assert.equal(fx.canPayCost(core.effectiveEnergy(s,'player',p.active),'M'),false);
 }
});
test('Holon Research Tower offers a choice of original type or Metal per Basic Energy, not double counts',()=>{
 const s=game('ex11-41'),p=s.sides.player;p.active.energy={Lightning:1};
 assert.equal(fx.canPayCost(core.effectiveEnergy(s,'player',p.active),'M'),false);
 s.stadium=ref('ex11-94','tower');let e=core.effectiveEnergy(s,'player',p.active);
 assert.equal(fx.canPayCost(e,'L'),true);assert.equal(fx.canPayCost(e,'M'),true);
 assert.equal(fx.canPayCost(e,'LM'),false,'single energy cannot supply two requirements');
 p.active.energy={Lightning:1,Grass:1};e=core.effectiveEnergy(s,'player',p.active);
 assert.equal(fx.canPayCost(e,'LM'),true);assert.equal(fx.canPayCost(e,'MM'),true);
 assert.equal(fx.canPayCost(e,'LLM'),false);
 p.active.cardId='ex11-56';e=core.effectiveEnergy(s,'player',p.active);
 assert.equal(fx.canPayCost(e,'MM'),false,'non-δ must not get Metal conversion');
});
test('Hypno Sleep Inducer gives the defending player the swap choice',()=>{
 const s=game('ex11-23');s.sides.opponent.bench.push(slot('ex11-58','foebench2',1));
 playAttack(s,0);assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'opponent');
 choose(s,a=>a.choiceTarget==='bench'&&a.choiceBenchIndex===1);
 assert.equal(s.sides.opponent.active.uid,'foebench2');assert.ok(s.sides.opponent.active.conditions.sleep);
});
test('Critical Collection recovery scales by opponent prizes actually won, not prize count remaining',()=>{
 const s=game('ex11-111'),p=s.sides.player,foe=s.sides.opponent;
 foe.prizesTaken=2;foe.prizes=[ref('ex11-57','t1'),ref('ex11-57','t2'),ref('ex11-57','t3')];
 p.energyDiscard={Fighting:3};p.active.energy.Fighting=1;
 const act=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===0);assert.ok(act);core.applyAction(s,'player',act);finish(s);
 assert.equal(p.active.energy.Fighting,3,'one to pay the attack and two recovered from discard');
 assert.equal(p.energyDiscard.Fighting,1);
});
test('Holon Farmer retrieves up to 3 discarded Basic Energy and Pokémon, with finite choices',()=>{
 const s=game(),p=s.sides.player;p.hand=[ref('ex11-57','farmer-cost')];p.energyDiscard={Fighting:2};p.discard=[ref('ex11-58','return-bagon'),ref('ex11-53','return-shelgon')];
 const before=p.deck.length;effect(s,'trainer:91');choose(s,a=>a.choiceHandIndex===0);
 finish(s);
 assert.equal(p.energyDiscard.Fighting,0);assert.equal(p.discard.length,0,'all three Pokémon, including the discarded hand-cost Pokémon, may be returned');
 assert.ok(p.deck.length>=before+5,'two Energy plus three Pokémon returned to deck');
});
test('Holon Lass looks only at the prize-count top cards and lets the user claim several Energy',()=>{
 const s=game(),p=s.sides.player;p.hand=[ref('ex11-57','discard-for-lass')];
 p.prizes=[ref('ex11-57','p1'),ref('ex11-57','p2')];s.sides.opponent.prizes=[ref('ex11-57','o1'),ref('ex11-57','o2')];
 p.deck=[ref('ex11-104','energy-1'),ref('ex11-57','pokemon-1'),ref('ex11-107','energy-2'),ref('ex11-57','pokemon-2'),ref('ex11-105','energy-below-top-four')];
 effect(s,'trainer:92');choose(s,a=>a.choiceHandIndex===0);assert.equal(s.phase,'effectChoice');
 choose(s,a=>a.choiceOption===0);assert.equal(s.phase,'effectChoice');choose(s,a=>a.choiceOption===0);finish(s);
 assert.equal(p.hand.filter(x=>data.cardById(x.cardId)?.kind==='energy').length,2);
 assert.ok(p.deck.some(x=>x.uid==='energy-below-top-four'),'card beyond original top N must remain in deck');
});
test('Classic CPU can generate all 30 cards legally from complete EX Delta Species with compatible evolutions',()=>{
 for(let seed=1;seed<=8;seed++)for(const type of ['Grass','Fire','Water','Metal','Psychic','Darkness']){
  const built=cpu.generate({sets:['ex11'],type,seed});assert.ok(built.ok,`${seed} ${type}: ${built.error}`);assert.equal(built.cards.length,30);
  assert.ok(data.validateDeck(built.cards).ok,`${seed} ${type}: invalid deck`);
  const included=new Set(built.cards);
  for(const id of included){const c=data.cardById(id);if(c.kind==='pokemon'&&c.stage!=='Basic'){
    assert.ok(set.CARDS.some(x=>included.has(x.id)&&x.kind==='pokemon'&&x.name.replace(/ δ$/,'')===c.evolvesFrom.replace(/ δ$/,'')),`${seed} ${type}: ${c.name} missing ${c.evolvesFrom}`);
  }}
 }
});

test('Kyogre Star Sheer Cold heads prevents the defending Pokémon attacking next turn',()=>{
 const s=game('ex11-112'),opp=s.sides.opponent;
 effect(s,'112:1');assert.equal(opp.active.ex11AttackLockUntil,10);
 s.activeSide='opponent';s.turnNumber=10;opp.active.energy={Fire:6,Metal:6,Water:6};
 assert.equal(core.legalActions(s,'opponent').filter(a=>a.type==='attack').length,0);
 s.turnNumber=12;
 assert.ok(core.legalActions(s,'opponent').some(a=>a.type==='attack'),'lock expires after opponent next turn');
});
test('Metagross Delta Control chooses one of top four and puts others on the deck bottom in chosen order',()=>{
 const s=game('ex11-11'),p=s.sides.player;p.deck=[ref('ex11-57','c1'),ref('ex11-58','c2'),ref('ex11-59','c3'),ref('ex11-60','c4'),ref('ex11-61','c5'),ref('ex11-62','c6')];
 effect(s,'power:11');choose(s,a=>a.choiceOption===1);assert.equal(p.hand.at(-1).uid,'c2');
 choose(s,a=>a.choiceOption===2);choose(s,a=>a.choiceOption===0);choose(s,a=>a.choiceOption===0);
 assert.deepEqual(p.deck.map(x=>x.uid),['c5','c6','c4','c1','c3']);
});
test('EX Delta Species CPU executes optional Critical Collection recovery instead of skipping',()=>{
 const ai=require(root+'tcgp-battle-ai.js'),s=game('ex11-111');s.sides.opponent.prizesTaken=1;s.sides.player.energyDiscard={Fighting:1};
 effect(s,'111:0');assert.equal(s.phase,'effectChoice');
 const action=ai.chooseAction(s,'player','Advanced',5);
 assert.ok(action&&!action.choiceSkip,'CPU discarded beneficial Energy recovery');
 core.applyAction(s,'player',action);
 assert.equal(s.sides.player.active.energy.Fighting,1);
});
test('Super Scoop Up heads returns the Pokémon, evolution stack, Energy and tools to hand',()=>{
 const s=game('ex11-57'),p=s.sides.player,target=p.bench[0];
 target.stack=['ex11-57','ex11-53'];target.cardId='ex11-53';target.energy={Fire:2};target.specialEnergy=[ref('ex11-104','holon-energy')];target.tool=ref('ex10-95','test-tool');
 effect(s,'trainer:100');assert.equal(s.phase,'effectChoice','heads should trigger Pokémon picker');
 choose(s,a=>a.choiceTarget==='bench');
 assert.equal(p.bench.length,0);assert.ok(p.hand.some(r=>r.uid==='holon-energy'));
 assert.ok(p.hand.some(r=>r.cardId==='ex11-53'));assert.ok(p.hand.some(r=>r.cardId==='ex11-57'));
 assert.ok(p.hand.filter(r=>data.cardById(r.cardId)?.basicEnergy&&data.cardById(r.cardId)?.subtype==='Fire').length>=2);
});
