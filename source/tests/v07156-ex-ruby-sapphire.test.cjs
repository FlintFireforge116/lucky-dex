'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),A=path.join(ROOT,'app/src/main/assets');
const set=require(path.join(A,'tcg-classic-ruby-sapphire.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const builder=require(path.join(A,'tcg-classic-deck-builder.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const picker=require(path.join(A,'tcg-classic-set-picker.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const fx=require(path.join(A,'tcgp-battle-effects.js'));
const ai=require(path.join(A,'tcgp-battle-ai.js'));
const C=n=>classic.cardById('ex1-'+n);
function slot(n){return core.makePokemonSlot('ex1-'+n,4,'ruby'+n);}
function battle(seed=17){const deck=opponents.generate({sets:['ex1'],seed});assert.ok(deck.ok,deck.error);const state=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],seed,firstSide:'player'});state.phase='battle';state.activeSide='player';state.turnNumber=7;state.sides.player.turnCount=4;return state;}
function context(state,heads){return {...core.effectContext(state,'player',{},state.sides.player.active),random:()=>heads?0.1:0.9,isAttack:true};}
function resolve(state,n,index,heads){const ctx=context(state,heads),out=fx.resolveAttack(C(n).attacks[index],ctx);for(const e of out.pendingEffects)fx.applyEffect(e,ctx);return out;}

test('EX Ruby & Sapphire has exactly 109 distinct official prints, attacks and artwork identities',()=>{
 assert.equal(set.CARDS.length,109);assert.equal(new Set(set.CARDS.map(c=>c.id)).size,109);
 assert.equal(set.coverage().battleEnabled,109);
 for(let n=1;n<=109;n++){
  const card=C(n);assert.ok(card,'missing '+n);assert.equal(card.setId,'ex1');assert.equal(card.number,String(n));
  assert.equal(card.image,`https://images.pokemontcg.io/ex1/${n}.png`);
  assert.equal(card.deckEligible===true,card.battleEnabled&&!card.basicEnergy,'deck eligibility mismatch '+n);
  if(!card.battleEnabled)assert.ok(card.support.reasons.length,'unsupported card must report why '+n);
  else for(const attack of card.attacks||[])assert.ok(fx.supportsEffect(attack.effect),`${card.id}: ${attack.name}`);
 }
 assert.equal(C(1).name,'Aggron');assert.equal(C(96).name,'Chansey ex');assert.equal(C(103).name,'Sneasel ex');
 assert.equal(C(109).name,'Lightning Energy');
 assert.equal(C(4).attacks[1].damage,100);assert.equal(C(25).attacks[1].damage,0);
});
test('eight original Pokémon-ex are Basic, receive exactly 2 prizes on knockout and have their correct card rarity',()=>{
 const ex=set.CARDS.filter(c=>c.pokemonEx);assert.equal(ex.length,8);
 for(const card of ex){assert.equal(card.prizeCards,2);assert.equal(card.isEx,true);assert.equal(card.stage,'Basic');assert.equal(card.rarity,'Rare Holo EX');}
 assert.equal(C(103).attacks[1].name,'Beat Up');
 assert.equal(C(1).prizeCards,1);
});
test('Classic battle actually awards two Prize cards for a Knocked Out original Pokémon-ex',()=>{
 const s=battle();const p=s.sides.player,o=s.sides.opponent;
 p.active=slot(14);p.active.energy={Water:5};o.active=slot(97);o.active.damage=40;
 o.bench=[slot(52)];o.bench[0].benchSlot=0;
 const attack=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===1);
 assert.ok(attack,'Wailord Surf must be legal with five Water Energy');
 core.applyAction(s,'player',attack);
 assert.equal(p.prizesTaken,2,'defeating Electabuzz ex awards two Prize cards');
 assert.equal(p.prizes.length,3);
 assert.ok(s.log.some(e=>e.type==='ko'&&e.cardId==='ex1-97'&&e.awarded===2));
});

test('set integrates ownership, search/filters, auto builder and CPU selected pools',()=>{
 assert.ok(classic.SETS.some(s=>s.id==='ex1'&&s.cardCount===109));
 assert.ok(builder.SET_IDS.includes('ex1'));assert.ok(opponents.SETS.includes('ex1'));
 assert.ok(picker.rows.some(row=>row[0]==='ex1'&&row[2]==='EX'));
 assert.match(picker.html({ids:builder.SET_IDS,selected:['ex1']}),/data-set-choice="ex1"/);
 const owned=classic.projectOwnedCards([{source:'tcg',setId:'ex1',number:'97/109',count:2},{source:'tcg',_librarySetKey:'rs',localId:'039',count:3},{source:'tcgp',setId:'ex1',number:'97',count:4}]);
 assert.equal(owned.find(x=>x.gameplayId==='ex1-97')?.quantity,2);
 assert.equal(owned.find(x=>x.gameplayId==='ex1-39')?.quantity,3);
 assert.ok(!owned.some(x=>x.gameplayId==='ex1-97'&&x.quantity===6));
});
test('EX Ruby & Sapphire-only CPU decks are 30 cards, legal and from the chosen set',()=>{
 for(const type of ['Grass','Fire','Water','Lightning','Fighting','Psychic','Darkness','Metal']){
  const d=opponents.generate({sets:['ex1'],seed:23,type});assert.ok(d.ok,`${type}: ${d.error}`);
  assert.equal(d.cards.length,30);assert.ok(d.cards.every(id=>id.startsWith('ex1-')&&C(Number(id.slice(4))).battleEnabled));
  const result=classic.validateDeck(d.cards);assert.ok(result.ok,`${type}: ${result.errors.join(', ')}`);
 }
});
test('original EX attacks resolve both coin outcomes, self-damage and status faithfully',()=>{
 for(const heads of [true,false]){
  const s=battle();s.sides.player.active=slot(97);s.sides.opponent.active=slot(67);
  assert.equal(resolve(s,97,1,heads).damage,heads?60:40);
  assert.equal(resolve(s,97,0,heads).damage,10);
  assert.equal(!!s.sides.opponent.active.conditions.paralysis,heads);
  const t=battle();t.sides.player.active=slot(98);t.sides.opponent.active=slot(67);
  assert.equal(resolve(t,98,0,heads).damage,heads?20:10);
  const c=battle();c.sides.player.active=slot(73);c.sides.player.active.energy={Fire:2};c.sides.opponent.active=slot(67);
  resolve(c,73,1,heads);assert.equal(c.sides.player.active.energy.Fire,heads?2:1);
 }
 const s=battle();s.sides.player.active=slot(14);s.sides.opponent.active=slot(67);
 assert.equal(resolve(s,14,0,true).damage,50);assert.equal(s.sides.player.active.damage,20);
 const t=battle();t.sides.player.active=slot(99);t.sides.player.active.energy={Water:3};t.sides.opponent.active=slot(67);
 assert.equal(resolve(t,99,0,true).damage,30);
 const p=battle();p.sides.player.active=slot(69);p.sides.opponent.active=slot(67);
 resolve(p,69,0,true);assert.equal(!!p.sides.opponent.active.conditions.sleep,true);
});
test('newly enabled attacks respect damage counters, Bench damage and Energy discard',()=>{
 const s=battle();s.sides.player.active=slot(1);s.sides.player.active.damage=40;s.sides.opponent.active=slot(67);
 assert.equal(resolve(s,1,0,true).damage,40);assert.equal(resolve(s,1,0,false).damage,0);
 const f=battle();f.sides.player.active=slot(15);f.sides.player.active.energy={Fire:3};f.sides.opponent.active=slot(67);
 assert.equal(resolve(f,15,1,true).damage,80);assert.equal(f.sides.player.active.energy.Fire,2);
 const w=battle();w.sides.player.active=slot(24);w.sides.opponent.active=slot(67);
 w.sides.opponent.bench=[slot(59)];w.sides.opponent.bench[0].benchSlot=0;
 resolve(w,24,1,true);assert.ok(w.sides.opponent.active.conditions.poison);
 assert.equal(w.sides.opponent.bench[0].damage,10);
 const e=battle();e.sides.player.active=slot(103);e.sides.opponent.active=slot(67);
 e.sides.player.bench=[slot(67),slot(71)];e.sides.player.bench.forEach((c,i)=>c.benchSlot=i);
 const out=resolve(e,103,1,true);assert.equal(out.damage,60);assert.ok(e.log.some(x=>x.type==='coin'&&x.coins===3));
});

test('Trainer and recovery actions use existing choice UI and enforce the printed counts',()=>{
 const s=battle(),side=s.sides.player;side.active=slot(38);side.hand=[];
 resolve(s,38,0,true);assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'player');
 const n=battle();n.sides.player.active=slot(45);n.sides.player.active.damage=30;n.sides.opponent.active=slot(67);
 resolve(n,45,1,true);assert.equal(n.sides.player.active.damage,0);
 const p=battle();p.sides.player.active=slot(48);p.sides.player.active.damage=60;p.sides.player.active.conditions={poison:true};
 p.sides.opponent.active=slot(67);resolve(p,48,0,true);
 assert.equal(p.sides.player.active.damage,20);assert.ok(p.sides.player.active.conditions.sleep);
 const birch=C(89),ball=C(86),rev=C(87);
 assert.ok(birch.battleEnabled&&ball.battleEnabled&&rev.battleEnabled);
 assert.equal(birch.effect.type,'drawToHandSize');assert.equal(birch.effect.size,6);
 assert.equal(ball.effect.type,'coinFlip');assert.equal(rev.effect.type,'coinFlip');
});

test('previously gated EX-era Powers, Trainers and Special Energy are enabled without deck Basic Energy',()=>{
 for(const n of [3,7,11,12,18,19,20,21,22,23,26,28,46,51,64,70,78,80,81,82,83,84,85,88,90,93,94,95,96,100,101,102]){
  assert.equal(C(n).battleEnabled,true,`${n} must have completed battle effect support`);
  assert.deepEqual(C(n).support.reasons,[],`${n} must not report missing effects`);
 }
 assert.equal(C(90).battleEnabled,true,'Energy Search receives basic Energy from separate Energy supply');
 assert.equal(C(104).basicEnergy,true);assert.equal(C(104).deckEligible,false);
 for(const n of [97,98,99])assert.equal(C(n).battleEnabled,true);
});
test('EX Ruby & Sapphire opponents take legal CPU turns',()=>{
 for(const seed of [23,58]){
  const d=opponents.generate({sets:['ex1'],seed});assert.ok(d.ok,d.error);
  const s=core.createBattle({format:'classic',playerDeck:d.cards,opponentDeck:d.cards,
   playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],seed});
  let steps=0;for(;steps<100&&!s.winner;steps++){
   const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.phase==='setup'?s.setupSide:s.activeSide;
   const actions=core.legalActions(s,side);if(!actions.length)break;
   const choice=ai.chooseAction(s,side,'Advanced',steps);const act=choice?.action||choice||actions[0];if(!act?.type)break;core.applyAction(s,side,act);
  }
  assert.ok(steps>12,`seed ${seed}: only ${steps} turns`);assert.ok(!s.log.some(e=>e.type==='battleError'));
 }
});
test('Android and splash versions match new ex1 expansion and registration order',()=>{
 const html=fs.readFileSync(path.join(A,'index.html'),'utf8');
 const gradle=fs.readFileSync(path.resolve(A,'../../../build.gradle'),'utf8');
 const app=fs.readFileSync(path.join(A,'app-v0167.js'),'utf8');
 assert.match(gradle,/versionName '0\.69\.157'/);assert.match(gradle,/versionCode 7137/);
 assert.equal(html.split('v0.69.157').length-1,2);
 assert.match(app,/window\.__LUCKYDEX_BUILD='0\.69\.157'/);
 assert.ok(html.indexOf('tcg-classic-ruby-sapphire.js')>html.indexOf('tcg-classic-skyridge.js'));
 assert.ok(html.indexOf('tcg-classic-ruby-sapphire.js')<html.indexOf('tcg-classic-battle-data.js'));
});
