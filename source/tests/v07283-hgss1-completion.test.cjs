'use strict';
// Additional executable HGSS completion checks. These use the actual shared
// Classic state machine, not static assertions about effect names.
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const core=require(path.join(assets,'tcgp-battle-core.js'));
const cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const ai=require(path.join(assets,'tcgp-battle-ai.js'));
const getDeck=(type='Water',seed=1)=>{const r=cpu.generate({sets:['hgss1'],type,seed});assert.ok(r.ok,JSON.stringify(r));return r.cards;};
function state(type='Water'){
 const deck=getDeck(type);const s=core.createBattle({format:'classic',firstSide:'player',seed:1337,
  playerDeck:deck,opponentDeck:deck,playerEnergyTypes:[...new Set([type,'Fire','Lightning','Water','Grass'])],opponentEnergyTypes:['Water']});
 s.turnNumber=3;s.activeSide='player';s.sides.player.turnCount=2;
 return s;
}
const slot=(id,uid)=>core.makePokemonSlot(id,2,uid);
const ref=(cardId,uid)=>({uid:uid||cardId,cardId});
const pick=(s,predicate)=>{const actions=core.legalActions(s,s.choiceSide||s.activeSide);const action=actions.find(predicate)||actions[0];assert.ok(action,JSON.stringify(s.pendingChoice));core.applyAction(s,s.choiceSide||s.activeSide,action);return action;};

test('both LEGEND halves are mandatory; Ho-Oh enters in one slot and uses Fire-only effective energy',()=>{
 const s=state('Fire'),p=s.sides.player;p.bench=[];p.hand=[ref('hgss1-111','h1')];
 assert.equal(core.legalActions(s,'player').filter(a=>a.type==='legendBench').length,0);
 p.hand.push(ref('hgss1-112','h2'));
 const action=core.legalActions(s,'player').find(a=>a.type==='legendBench');assert.ok(action);
 core.applyAction(s,'player',action);
 assert.equal(p.hand.length,0);assert.equal(p.bench.length,1);
 assert.deepEqual(p.bench[0].stack,['hgss1-111','hgss1-112']);
 p.bench[0].energy={Water:1,Lightning:2};
 const energy=core.effectiveEnergy(s,'player',p.bench[0]);
 assert.equal(energy.Fire,3);assert.equal(energy.Water||0,0);
});

test('LEGEND knockout discards both halves and awards exactly two Prizes',()=>{
 const s=state('Water'),p=s.sides.player,foe=s.sides.opponent;
 const lugia=slot('hgss1-113','l1');lugia.stack=['hgss1-113','hgss1-114'];lugia.damage=140;p.active=lugia;p.bench=[slot('hgss1-72','safe')];
 s.activeSide='opponent';const prizes=foe.prizes.length;
 core.endTurn(s);
 assert.equal(foe.prizes.length,prizes-2);assert.equal(foe.prizesTaken,2);
 assert.deepEqual(p.discard.filter(x=>['hgss1-113','hgss1-114'].includes(x.cardId)).map(x=>x.cardId).sort(),['hgss1-113','hgss1-114']);
 assert.equal(s.log.filter(x=>x.type==='ko'&&x.cardId==='hgss1-113')[0].awarded,2);
});

test('Lugia Ocean Grow attaches only actual top-five Energy cards and discards the non-Energy',()=>{
 const s=state(),p=s.sides.player;p.bench=[];p.hand=[ref('hgss1-113','l1'),ref('hgss1-114','l2')];
 p.deck=[ref('hgss1-115','g'),ref('hgss1-116','f'),ref('hgss1-103','dce'),ref('hgss1-65','growlithe'),ref('hgss1-117','w'),...p.deck.slice(0,8)];
 core.applyAction(s,'player',core.legalActions(s,'player').find(a=>a.type==='legendBench'));
 assert.equal(s.pendingChoice?.effect.rule,'hgss1:113:oceanGrow');
 pick(s,a=>a.choiceOption===1);
 assert.equal(s.phase,'battle');const lugia=p.bench[0];
 assert.deepEqual(lugia.energy,{Grass:1,Fire:1,Water:1});assert.equal(lugia.specialEnergy.length,1);
 assert.ok(p.discard.some(r=>r.uid==='growlithe'));
});

test('Lugia Elemental Blast physically discards one Fire, one Water and one Lightning Energy',()=>{
 const s=state(),p=s.sides.player,foe=s.sides.opponent;
 p.active=slot('hgss1-113','l');p.active.stack=['hgss1-113','hgss1-114'];p.active.energy={Fire:1,Water:1,Lightning:1};
 foe.active=slot('hgss1-1','arcanine');
 const attack=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);
 assert.ok(attack,'Lugia Elemental Blast must be payable');
 core.applyAction(s,'player',attack);
 for(let i=0;i<3;i++){
  assert.equal(s.pendingChoice?.effect.rule,'hgss1:113:elementalBlast');
  pick(s,a=>a.choiceOption===0);
 }
 assert.deepEqual(p.active.energy,{Fire:0,Water:0,Lightning:0});
 assert.equal(p.energyDiscard.Fire,1);assert.equal(p.energyDiscard.Water,1);assert.equal(p.energyDiscard.Lightning,1);
});

test('Feraligatr Prime Rain Dance is repeatable within a turn, consuming physical Water from hand',()=>{
 const s=state(),p=s.sides.player;p.active=slot('hgss1-108','feraligatr');p.bench=[slot('hgss1-72','magikarp')];
 p.hand=[ref('hgss1-117','water1'),ref('hgss1-117','water2')];
 for(let i=1;i<=2;i++){
  const ability=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='hgss1-108');assert.ok(ability,'Repeatable Rain Dance disappeared');
  core.applyAction(s,'player',ability);
  pick(s,a=>a.choiceHandIndex===0);
  pick(s,a=>a.choiceTarget==='active');
  assert.equal(p.active.energy.Water,i);
 }
 assert.equal(p.hand.length,0);
});

test('Meganium Prime Leaf Trans moves one real Grass Energy and can be reused',()=>{
 const s=state('Grass'),p=s.sides.player;p.active=slot('hgss1-109','meganium');p.active.energy.Grass=2;p.bench=[slot('hgss1-67','hoppip')];
 for(let i=1;i<=2;i++){
  const ability=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='hgss1-109');assert.ok(ability);
  core.applyAction(s,'player',ability);pick(s,a=>a.effectEnergyType==='Grass');pick(s,a=>a.choiceTarget==='bench');
  assert.equal(p.active.energy.Grass,2-i);assert.equal(p.bench[0].energy.Grass,i);
 }
});

test('all HGSS-only CPU random decks are legal, and never include orphan LEGEND halves',()=>{
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Colorless'])for(let seed=1;seed<=30;seed++){
  const deck=getDeck(type,seed);assert.equal(deck.length,30,`${type}/${seed}`);
  const valid=data.validateDeck(deck);assert.ok(valid.ok,`${type}/${seed} ${JSON.stringify(valid.errors)}`);
  const count=id=>deck.filter(x=>x===id).length;
  assert.equal(count('hgss1-111'),count('hgss1-112'),`${type}/${seed} Ho-Oh`);
  assert.equal(count('hgss1-113'),count('hgss1-114'),`${type}/${seed} Lugia`);
  for(const id of deck){const card=data.cardById(id);assert.equal(card.setId,'hgss1');assert.ok(card.deckEligible,id);}
 }
});


test('Ampharos Prime Conductivity reacts only to opponent attachments from hand, not Energy Zone',()=>{
 const s=state('Water'),me=s.sides.player,foe=s.sides.opponent;
 me.active=slot('hgss1-72','target');foe.active=slot('hgss1-105','ampharos-prime');
 const ctx=core.effectContext(s,'player',{},me.active);
 ctx.onEnergyAttached(me.active,'Water',1,{fromHand:true,energyCardId:'hgss1-117'});
 assert.equal(me.active.damage,10);
 ctx.onEnergyAttached(me.active,'Water',1,{fromHand:false});
 assert.equal(me.active.damage,10);
 assert.equal(s.log.filter(e=>e.rule==='hgss1:105:conductivity').length,1);
});


test('Beginner, Advanced and Expert CPUs all play an available LEGEND pair together',()=>{
 const s=state('Fire'),cpuSide=s.sides.opponent;
 s.activeSide='opponent';cpuSide.hand=[ref('hgss1-111','cpu-top'),ref('hgss1-112','cpu-bottom')];cpuSide.bench=[];
 for(const level of ['Beginner','Advanced','Expert']){
  const chosen=ai.chooseAction(s,'opponent',level,0);
  assert.equal(chosen.type,'legendBench',level);
  assert.equal(chosen.handIndex,0);assert.equal(chosen.secondHandIndex,1);
 }
});
