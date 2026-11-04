'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const discovery=require(path.join(A,'tcg-classic-neo-discovery.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const effects=require(path.join(A,'tcgp-battle-effects.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const ai=require(path.join(A,'tcgp-battle-ai.js'));
const rule=name=>({type:'neoRule',rule:'discovery:'+name});
const mk=(id,uid)=>core.makePokemonSlot(id,0,uid);
function stateOf(){const recipe=opponents.generate({sets:['neo2'],type:'Grass',seed:9});assert.equal(recipe.ok,true);const state=core.createBattle({format:'classic',playerDeck:recipe.cards,opponentDeck:recipe.cards,seed:42,firstSide:'player',playerEnergyTypes:recipe.energyTypes,opponentEnergyTypes:recipe.energyTypes});state.turnNumber=5;state.activeSide='player';state.sides.player.turnCount=3;state.sides.opponent.turnCount=2;state.sides.player.active=mk('neo2-56','p-active');state.sides.opponent.active=mk('neo2-37','o-active');state.sides.player.bench=[];state.sides.opponent.bench=[];return state;}
function ctx(state,which='player',random=()=>0.01){return {...core.effectContext(state,which,{},state.sides[which].active),random};}
function choice(state,kind,select=()=>true){const who=state.choiceSide;const actions=core.legalActions(state,who).filter(select);assert.ok(actions.length,`No ${kind} choice for ${who}; ${JSON.stringify(state.pendingChoice)}`);core.applyAction(state,who,actions[0]);}

test('All 75 Neo Discovery numbered prints are enabled and their 38 formerly restricted effects have real handlers',()=>{
 assert.equal(discovery.CARDS.length,75);assert.equal(discovery.coverage().battleEnabled,75);assert.equal(discovery.coverage().partial.length,0);
 assert.ok(discovery.CARDS.every(c=>c.battleEnabled&&c.support.status==='FULL'));
 for(const c of discovery.CARDS){assert.equal(classic.cardById(c.id)?.id,c.id);for(const a of c.attacks||[]){assert.equal(a.unimplemented,false,c.id+' '+a.name);assert.equal(effects.supportsEffect(a.effect),true,c.id+' '+a.name);}for(const power of c.abilities||[])assert.equal(effects.supportsEffect(power.effect),true,c.id+' '+power.name);}
});
test('Neo Discovery damage formula: False Swipe rounds half remaining HP to 10s; Lock-on handles Electric Bolt tails',()=>{
 const s=stateOf(),c=ctx(s);s.sides.opponent.active.damage=15;const remaining=effects.resolveAttack(discovery.cardById('neo2-10').attacks[0],c);assert.equal(remaining.damage,10); // Corsola: 50 HP - 15 = 35; half 17.5 rounds down to 10
 s.sides.player.active=mk('neo2-7','magnet');const attack=discovery.cardById('neo2-7').attacks[1];s.turnNumber=7;
 const without=effects.resolveAttack(attack,ctx(s,'player',()=>.9));assert.equal(without.damage,0);
 s.sides.player.active.neoLockOn={turn:7,uid:'magnet'};
 const withLock=effects.resolveAttack(attack,ctx(s,'player',()=>.9));assert.equal(withLock.damage,50);assert.ok(withLock.pendingEffects.some(x=>x.status==='paralysis'));
});
test('Belly Drum takes 30 damage and lets a player choose two generated Basic Energy attachments',()=>{
 const s=stateOf();s.sides.player.active=mk('neo2-44','poliwhirl');s.sides.player.energyTypes=['Water'];s.sides.player.energySupply=Array(12).fill('Water');
 effects.applyEffect(rule('bellyDrum'),ctx(s));assert.equal(s.sides.player.active.damage,30);assert.equal(s.phase,'effectChoice');
 choice(s,'energy');assert.equal(s.sides.player.active.energy.Water,1);choice(s,'energy');assert.equal(s.sides.player.active.energy.Water,2);assert.equal(s.sides.player.energySupply.length,10);
 assert.equal(s.phase,'battle');
});
test('Unown [F] and [U] compact-board powers need all four named Unown in play',()=>{
 const s=stateOf();const mine=s.sides.player;
 mine.active=mk('neo2-48','f');mine.bench=[mk('neo2-68','i'),mk('neo2-50','n'),mk('neo2-47','d')];mine.bench.forEach((p,i)=>p.benchSlot=i);
 mine.deck.unshift({uid:'trainer',cardId:'neo2-75'});
 assert.ok(effects.choicesForEffect(rule('unownFind'),ctx(s)).length>0);
 effects.applyEffect(rule('unownFind'),ctx(s));assert.equal(s.phase,'effectChoice');choice(s,'trainer',a=>a.choiceCardId==='neo2-75');assert.ok(mine.hand.some(ref=>ref.cardId==='neo2-75'));
 mine.active=mk('neo2-51','u');mine.bench=[mk('neo2-50','n2'),mk('neo2-47','d2'),mk('neo2-69','o2')];mine.bench.forEach((p,i)=>p.benchSlot=i);
 assert.ok(effects.choicesForEffect(rule('unownUndo'),ctx(s)).length>0);
 effects.applyEffect(rule('unownUndo'),ctx(s));assert.equal(mine.active,null);assert.ok(mine.hand.some(ref=>ref.cardId==='neo2-51'));
});
test('Fossil Egg can recruit a Fossil evolution from hand, without pretending it was a Basic in the deck',()=>{
 const s=stateOf(),mine=s.sides.player;mine.hand.push({uid:'fossil-in-hand',cardId:'neo2-60'});mine.deck=mine.deck.filter(ref=>classic.cardById(ref.cardId)?.evolvesFrom!=='Mysterious Fossil');
 effects.applyEffect(rule('fossilEgg'),ctx(s));assert.equal(s.phase,'effectChoice');choice(s,'hand',x=>x.choiceCardId==='neo2-60');
 assert.equal(mine.bench.length,1);assert.equal(mine.bench[0].cardId,'neo2-60');assert.equal(mine.hand.some(ref=>ref.uid==='fossil-in-hand'),false);
});
test('Energy Cycle moves a special Energy card from defender to chosen opponent Bench Pokémon',()=>{
 const s=stateOf(),me=s.sides.player,foe=s.sides.opponent;me.active=mk('neo2-52','xatu');foe.active.specialEnergy=[{uid:'special-1',cardId:'neo1-104'}];foe.bench=[mk('neo2-39','target')];foe.bench[0].benchSlot=0;
 effects.applyEffect(rule('energyCycle'),ctx(s));assert.equal(s.phase,'effectChoice');choice(s,'special',x=>x.choiceLabel?.includes('Darkness'));
 assert.equal(s.phase,'effectChoice');choice(s,'bench');assert.equal(foe.active.specialEnergy.length,0);assert.equal(foe.bench[0].specialEnergy.length,1);
});
test('Expert CPU can finish Neo Discovery-only turns using all eight set integrations',()=>{
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']){
  const recipe=opponents.generate({sets:type==='Fire'?['base1','neo2']:['neo2'],type,seed:21});assert.equal(recipe.ok,true,type);
  const state=core.createBattle({format:'classic',playerDeck:recipe.cards,opponentDeck:recipe.cards,seed:9878,firstSide:'opponent',playerEnergyTypes:recipe.energyTypes,opponentEnergyTypes:recipe.energyTypes});
  for(let i=0;i<60;i++){
   const side=state.phase==='effectChoice'?state.choiceSide:state.phase==='promote'?state.promotionSide:state.activeSide;
   if(state.phase==='finished'||side!=='opponent')break;
   const move=ai.chooseAction(state,'opponent','Expert',i);assert.ok(move,type+' '+i);assert.doesNotThrow(()=>core.applyAction(state,'opponent',move),type+' '+i);
  }
 }
});

test('Spikes damages a Pokémon entering Active from Bench during its controller turn',()=>{
 const s=stateOf(),mine=s.sides.player,foe=s.sides.opponent;
 mine.active=mk('neo2-37','corsola');mine.active.energy.Water=2;mine.bench=[mk('neo2-65','new-active')];mine.bench[0].benchSlot=0;
 foe.bench=[mk('neo2-2','forretress')];foe.bench[0].benchSlot=0;
 const action=core.legalActions(s,'player').find(a=>a.type==='retreat');assert.ok(action);
 core.applyAction(s,'player',action);assert.equal(mine.active.uid,'new-active');assert.equal(mine.active.damage,10);
 assert.ok(s.log.some(x=>x.rule==='Spikes'));
});
test('Wobbuffet Counter can return attack damage before a knockout resolves',()=>{
 const s=stateOf(),me=s.sides.player,foe=s.sides.opponent;
 me.active=mk('neo2-55','hoppip');me.active.energy.Grass=1;foe.active=mk('neo2-16','wobbuffet');foe.active.neoCounter={until:5};s.rngState=1;
 const attack=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===0);assert.ok(attack);
 core.applyAction(s,'player',attack);
 const dealt=s.log.find(x=>x.type==='attack')?.damage;assert.ok(dealt>0);assert.equal(foe.active.damage,dealt);assert.equal(me.active.damage,dealt);
 assert.ok(s.log.some(x=>x.reason==='Neo Discovery Counter'));
});
test('One Unown Darkness reduces damage; two copies disable the power',()=>{
 const s=stateOf(),me=s.sides.player,foe=s.sides.opponent;
 me.active=mk('neo2-39','dark-houndour');me.active.energy.Colorless=1;foe.active=mk('neo2-37','corsola');foe.bench=[mk('neo2-47','d-one')];foe.bench[0].benchSlot=0;
 let attack=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===0);assert.ok(attack);
 core.applyAction(s,'player',attack);assert.equal(foe.active.damage,0);
 // A duplicate Unown [D] must turn off the reduction, not stack it.
 const s2=stateOf(),p2=s2.sides.player,f2=s2.sides.opponent;
 p2.active=mk('neo2-39','houndour-2');p2.active.energy.Colorless=1;f2.active=mk('neo2-37','corsola-2');f2.bench=[mk('neo2-47','d-one'),mk('neo2-47','d-two')];f2.bench.forEach((x,i)=>x.benchSlot=i);
 attack=core.legalActions(s2,'player').find(x=>x.type==='attack'&&x.attackIndex===0);
 core.applyAction(s2,'player',attack);assert.equal(f2.active.damage,10);
});
test('Politoed Frog Song boosts a damaging attack only with four Poliwag-family Pokémon in play',()=>{
 const s=stateOf(),mine=s.sides.player,foe=s.sides.opponent;
 mine.active=mk('neo2-8','politoed');mine.active.energy.Water=2;mine.active.energy.Colorless=2;
 mine.bench=[mk('neo2-62','pol1'),mk('neo2-44','pol2')];mine.bench.forEach((x,i)=>x.benchSlot=i);
 foe.bench=[mk('neo2-62','pol3')];foe.bench[0].benchSlot=0;
 s.rngState=1;
 const attack=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===0);assert.ok(attack);
 core.applyAction(s,'player',attack);assert.ok(s.log.find(x=>x.type==='attack')?.damage>=40);
});
test('Smeargle Sketch copies an observed opponent attack without its Energy cost',()=>{
 const s=stateOf(),mine=s.sides.player;
 mine.active=mk('neo2-11','smeargle');mine.neoObservedAttack={turn:4,cardId:'neo2-65',attackIndex:0,witnesses:['smeargle']};
 const result=effects.resolveAttack(discovery.cardById('neo2-11').attacks[0],ctx(s));
 assert.equal(result.damage,10);assert.ok(s.log.some(x=>x.reason==='Smeargle Sketch'));
 mine.neoObservedAttack.witnesses=[];
 assert.equal(effects.resolveAttack(discovery.cardById('neo2-11').attacks[0],ctx(s)).damage,0);
});
test('Gaze suppresses a chosen opposing Benched Pokémon Power during the current turn',()=>{
 const s=stateOf(),me=s.sides.player,foe=s.sides.opponent;
 me.active=mk('neo2-40','igglybuff');foe.bench=[mk('neo2-2','spikes')];foe.bench[0].benchSlot=0;
 effects.applyEffect(rule('gaze'),ctx(s));assert.equal(s.phase,'effectChoice');choice(s,'power');
 assert.equal(effects.abilitiesSuppressed(s,'opponent',foe.bench[0],classic.cardById),true);
 s.turnNumber++;assert.equal(effects.abilitiesSuppressed(s,'opponent',foe.bench[0],classic.cardById),false);
});
test('Neo Discovery hand-played Unown Engage asks the CPU before its owner and resolves cleanly',()=>{
 const s=stateOf(),me=s.sides.player;
 me.hand.unshift({uid:'unown-engage',cardId:'neo2-67'});
 const play=core.legalActions(s,'player').find(x=>x.type==='bench'&&x.cardId==='neo2-67');assert.ok(play);
 core.applyAction(s,'player',play);assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'opponent');
 choice(s,'CPU keep hand',x=>x.choiceOption===1);assert.equal(s.choiceSide,'player');
 choice(s,'player keep hand',x=>x.choiceOption===1);assert.equal(s.phase,'battle');
});

test('Unown [D] protection applies to Tyranitar Trample Bench damage too',()=>{
 const s=stateOf(),mine=s.sides.player,foe=s.sides.opponent;
 mine.active=mk('neo2-12','tyranitar');mine.bench=[mk('neo2-57','own-larvitar')];mine.bench[0].benchSlot=0;
 foe.bench=[mk('neo2-47','their-unown-d'),mk('neo2-57','their-larvitar')];foe.bench.forEach((x,i)=>x.benchSlot=i);
 effects.applyEffect(rule('trample'),ctx(s));
 assert.equal(mine.bench[0].damage,30);
 assert.equal(foe.bench[0].damage,0);assert.equal(foe.bench[1].damage,0);
});
test('Unown Observe reveals the opponent deck top five without altering order',()=>{
 const s=stateOf(),mine=s.sides.player,foe=s.sides.opponent;mine.active=mk('neo2-69','observe');
 const original=foe.deck.map(r=>r.uid);effects.applyEffect(rule('unownObserve'),ctx(s));
 assert.equal(s.phase,'effectChoice');assert.ok(s.pendingChoice.options[0].includes('Top 5:'));
 choice(s,'acknowledge');assert.deepEqual(foe.deck.map(r=>r.uid),original);
});
