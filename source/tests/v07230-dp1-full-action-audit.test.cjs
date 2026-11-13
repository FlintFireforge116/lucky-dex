const {test}=require('node:test'),assert=require('node:assert/strict');
const dp=require('../app/src/main/assets/tcg-classic-diamond-pearl'),all=require('../app/src/main/assets/tcg-classic-battle-data'),fx=require('../app/src/main/assets/tcgp-battle-effects'),core=require('../app/src/main/assets/tcgp-battle-core'),opp=require('../app/src/main/assets/tcg-classic-opponents');
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];const deck=opp.generate({sets:['dp1'],type:'Grass',seed:71});const template=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,seed:37,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
function setup(att,def,side){const s=structuredClone(template);s.phase='battle';s.turnNumber=10;s.activeSide=side;for(const w of ['player','opponent'])s.sides[w].turnCount=8;const foe=side==='player'?'opponent':'player';s.sides[side].active=core.makePokemonSlot(att,4,'att');s.sides[foe].active=core.makePokemonSlot(def,4,'def');for(const w of ['player','opponent']){s.sides[w].active.energy=Object.fromEntries(types.map(x=>[x,5]));s.sides[w].bench=[core.makePokemonSlot('dp1-85',4,w+'bench1'),core.makePokemonSlot('dp1-88',4,w+'bench2')];s.sides[w].bench.forEach((p,i)=>{p.benchSlot=i;p.energy={Grass:1,Lightning:1};p.damage=10;});s.sides[w].hand=[{uid:w+'h1',cardId:'dp1-94'},{uid:w+'h2',cardId:'dp1-17'},{uid:w+'h3',cardId:'dp1-125'}];s.sides[w].deck=[{uid:w+'d1',cardId:'dp1-114'},{uid:w+'d2',cardId:'dp1-94'},{uid:w+'d3',cardId:'dp1-125'},...s.sides[w].deck];s.sides[w].discard=[{uid:w+'dis1',cardId:'dp1-125'}];s.sides[w].energyDiscard={Fire:9,Grass:5,Water:5,Lightning:5,Metal:5,Darkness:5};}
if(['dp1-120','dp1-121','dp1-122'].includes(att)){const basic=att==='dp1-120'?'dp1-93':att==='dp1-121'?'dp1-76':'dp1-103';const mid=att==='dp1-120'?'dp1-58':att==='dp1-121'?'dp1-56':'dp1-49';const stage=att==='dp1-120'?'dp1-4':att==='dp1-121'?'dp1-5':'dp1-17';s.sides[side].active.stack=[basic,mid,stage,att];}
return s;}
test('All Diamond & Pearl attacks are selectable and resolve for both players (372 action paths)',()=>{
const failures=[],smoke=[];let n=0;for(const c of dp.CARDS.filter(x=>x.kind==='pokemon'))for(let i=0;i<(c.attacks||[]).length;i++)for(const side of ['player','opponent']){const s=setup(c.id,'dp1-17',side),a=c.attacks[i],legal=core.legalActions(s,side).filter(x=>x.type==='attack'&&x.attackIndex===i&&x.attackCardId===c.id);n++;if(!legal.length){failures.push({id:c.id,name:c.name,attack:a.name,side,cost:a.cost,effect:a.effect,issue:'not selectable'});continue;}try{core.applyAction(s,side,legal[0]);for(let j=0;j<25&&s.phase==='effectChoice';j++){const actions=core.legalActions(s,s.choiceSide).filter(x=>x.type==='effectChoice');if(!actions.length){throw Error('No valid effect choices');}const action=actions.find(x=>!x.choiceSkip)||actions[0];core.applyAction(s,s.choiceSide,action);}if(s.phase==='effectChoice')throw Error('Effect unresolved after 25 decisions');smoke.push(c.id+':'+i+':'+side);}catch(e){failures.push({id:c.id,name:c.name,attack:a.name,side,issue:'error '+String(e.message).slice(0,180)});}}
assert.equal(n,372,'all 186 printed attacks should be audited in both seats');assert.deepEqual(failures,[],'every attack must be a real selectable, executable action');assert.equal(smoke.length,372);
});


test('Every printed DP1 card is battle-enabled, every attack effect validates, and no printed action is an unimplemented placeholder',()=>{
 assert.equal(dp.CARDS.length,130);assert.deepEqual(dp.coverage().gated,[]);
 for(const c of dp.CARDS){assert.equal(c.battleEnabled,true,c.id);
  if(c.kind==='pokemon')for(const a of c.attacks){assert.ok(a.name,`${c.id} missing attack name`);assert.ok(!/See the original card for/.test(a.text),`${c.id} placeholder attack`);assert.deepEqual(fx.validateEffect(a.effect),[],`${c.id} ${a.name}`);}
  if(c.kind==='trainer'){assert.ok(c.text&&!/See the printed card/.test(c.text),`${c.id} missing Trainer text`);assert.notEqual(c.effect?.type,'noop',`${c.id} Trainer placeholder`);assert.deepEqual(fx.validateEffect(c.effect),[],c.id);}
 }
});

test('All printed next-own-turn self attack locks use the entire next turn, not opponentTurn',()=>{
 const locks=[['dp1-38','Metal Slash'],['dp1-92','Tunneling'],['dp1-12','Rock Wrecker'],['dp1-120','Hydro Impact']];
 const flatten=e=>!e?[]:e.type==='sequence'?e.effects.flatMap(flatten):(e.type==='coinFlip'||e.type==='coinAttackGate')?[...flatten(e.heads),...flatten(e.tails)]:[e];
 for(const [id,name] of locks){const attack=dp.cardById(id).attacks.find(a=>a.name===name);assert.ok(attack,id+' '+name);assert.ok(flatten(attack.effect).some(e=>e.type==='lock'&&e.action==='attack'&&e.target==='self'&&e.duration==='nextOwnTurn'),`${id} ${name} not locked for next own turn`);}
 const protect=dp.cardById('dp1-16').attacks.find(a=>a.name==='Accelerative Dive');
 assert.ok(flatten(protect.effect).some(e=>e.type==='preventDamage'&&e.duration==='nextOwnTurn'), 'Staraptor shield must last through its own following turn');
});

function takeAttack(s,side,index){const actions=core.legalActions(s,side).filter(a=>a.type==='attack'&&a.attackIndex===index);assert.ok(actions.length,`${s.sides[side].active?.cardId} ${index} missing`);core.applyAction(s,side,actions[0]);for(let i=0;i<30&&s.phase==='effectChoice';i++){const acts=core.legalActions(s,s.choiceSide).filter(a=>a.type==='effectChoice');assert.ok(acts.length);core.applyAction(s,s.choiceSide,acts.find(a=>!a.choiceSkip)||acts[0]);}assert.notEqual(s.phase,'effectChoice');}
function pass(s,side){const a=core.legalActions(s,side).find(a=>a.type==='endTurn');assert.ok(a,`Cannot end ${side} turn`);core.applyAction(s,side,a);}
test('Steelix Metal Slash disables ALL attacks on its next own turn, then recovers after that turn (player and CPU)',()=>{
 for(const attacker of ['player','opponent']){
  const defender=attacker==='player'?'opponent':'player';let s=setup('dp1-38','dp1-17',attacker);
  takeAttack(s,attacker,1);assert.equal(s.activeSide,defender);assert.equal(s.sides[attacker].active.locks.at(-1).expiresTurn,12);
  pass(s,defender);assert.equal(s.activeSide,attacker);assert.equal(s.turnNumber,12);
  for(const i of [0,1])assert.equal(core.legalActions(s,attacker).some(a=>a.type==='attack'&&a.attackIndex===i),false,`Steelix ${attacker} should be locked on turn 12`);
  pass(s,attacker);pass(s,defender);assert.equal(s.turnNumber,14);
  assert.ok(core.legalActions(s,attacker).some(a=>a.type==='attack'&&a.attackIndex===0),`${attacker} Steelix should recover by turn 14`);
 }
});
test('Staraptor Accelerative Dive protects through next OWN turn including Brave Heart self-damage, then expires',()=>{
 let s;for(let seed=1;seed<120;seed++){
  const candidate=setup('dp1-16','dp1-17','player');candidate.rngState=seed*173233;takeAttack(candidate,'player',0);
  if(candidate.sides.player.active?.attackGuard){s=candidate;break;}
 }assert.ok(s,'find heads for Accelerative Dive');
 assert.equal(s.sides.player.active.attackGuard.expiresTurn,12);
 pass(s,'opponent');assert.equal(s.turnNumber,12);
 s.rngState=173233;takeAttack(s,'player',1);
 assert.ok(s.log.some(x=>x.type==='coin'&&x.side==='player'&&x.heads===false),'Brave Heart must actually get tails');
 assert.ok(s.sides.player.active?.cardId==='dp1-16','Staraptor stays alive because its own attack damage is blocked');
 assert.equal(s.sides.player.active.damage,0);
 assert.ok(s.log.some(x=>x.type==='preventedSelfDamage'));
 // Protection should have ended after turn 12 (current turn number 13).
 assert.equal(fx.attackIsPrevented(s,'player',s.sides.player.active,s.sides.opponent.active,all.cardById),null);
});
test('Next-own-turn attack restrictions are cleared when the affected Pokémon switches out',()=>{
 const s=setup('dp1-38','dp1-17','player');takeAttack(s,'player',1);pass(s,'opponent');
 const before=s.sides.player.active;const switched=fx.switchPokemon(s.sides.player,0,s);
 assert.equal(switched,true);assert.equal(s.sides.player.bench[0]?.uid,before.uid);
 assert.equal((before.locks||[]).length,0);
});
test('All 15 printed Diamond & Pearl Trainers offer a real play action from both seats',()=>{
 const failures=[];
 for(const card of dp.CARDS.filter(c=>c.kind==='trainer'))for(const side of ['player','opponent']){
  const s=setup('dp1-17','dp1-16',side);s.sides[side].hand.unshift({uid:'item-to-play',cardId:card.id});
  s.sides[side].active.damage=30;s.sides[side].active.conditions={sleep:true};
  const plays=core.legalActions(s,side).filter(a=>a.type==='trainer'&&a.cardId===card.id);
  if(!plays.length){failures.push(card.id+' '+side+' no legal play');continue;}
  try{core.applyAction(s,side,plays[0]);for(let i=0;i<35&&s.phase==='effectChoice';i++){
   const actions=core.legalActions(s,s.choiceSide).filter(x=>x.type==='effectChoice');if(!actions.length)throw Error('missing effect choice');core.applyAction(s,s.choiceSide,actions.find(x=>!x.choiceSkip)||actions[0]);
  }if(s.phase==='effectChoice')throw Error('choice stuck');}
  catch(e){failures.push(card.id+' '+side+' '+e.message);}
 }
 assert.deepEqual(failures,[],'Trainer action smoke should execute for both sides');
});
