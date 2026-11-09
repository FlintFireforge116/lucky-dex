'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const cards=require(path.join(A,'tcg-classic-sandstorm.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const fx=require(path.join(A,'tcgp-battle-effects.js'));
const opp=require(path.join(A,'tcg-classic-opponents.js'));
const builder=require(path.join(A,'tcg-classic-deck-builder.js'));
const meta=require(path.join(A,'tcg-deck-synergy.js'));
const T=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const C=n=>cards.cardById('ex2-'+n);
const slot=(n,uid)=>core.makePokemonSlot('ex2-'+n,2,uid||'s'+n);
const decks=opp.generate({sets:['ex2'],seed:31});
function battle(){
  assert.ok(decks.ok,decks.error);
  const s=core.createBattle({format:'classic',playerDeck:decks.cards,opponentDeck:decks.cards,playerEnergyTypes:T,opponentEnergyTypes:T,seed:31,firstSide:'player'});
  s.phase='battle';s.activeSide='player';s.turnNumber=8;s.sides.player.turnCount=4;s.sides.opponent.turnCount=3;
  s.sides.player.active=slot(72,'attacker');s.sides.opponent.active=slot(72,'defender');
  s.sides.player.bench=[slot(72,'bench')];s.sides.player.bench[0].benchSlot=0;
  s.sides.opponent.bench=[slot(60,'foebench')];s.sides.opponent.bench[0].benchSlot=0;
  s.sides.player.active.energy=Object.fromEntries(T.map(t=>[t,5]));s.sides.opponent.active.energy={Water:3};
  return s;
}
function settle(s){for(let i=0;i<20&&s.phase==='effectChoice';i++){
  const acts=core.legalActions(s,s.choiceSide);assert.ok(acts.length,JSON.stringify(s.pendingChoice));
  core.applyAction(s,s.choiceSide,acts[0]);
 }assert.notEqual(s.phase,'effectChoice','unresolved choice');}
function attack(s,n,i,energy={Fighting:4,Water:4,Colorless:4}){
  s.sides.player.active=slot(n,'att');s.sides.player.active.energy=energy;
  const action=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===i);
  assert.ok(action,`missing ${n}:${i}`);core.applyAction(s,'player',action);settle(s);
}
function preview(n,index,energy,foeEnergy={Water:2}){
 const s=battle();s.sides.player.active=slot(n,'att');s.sides.player.active.energy=energy;
 s.sides.opponent.active.energy=foeEnergy;
 const ctx={...core.effectContext(s,'player',{},s.sides.player.active),random:()=>.1,isAttack:true};
 return fx.resolveAttack(C(n).attacks[index],ctx).damage;
}
test('EX2 Water bonus excludes Energy actually used to pay the printed attack cost',()=>{
 // WCC must consume 3 Water if no other types pay the Colorless symbols.
 assert.equal(preview(7,0,{Water:3}),50);
 assert.equal(preview(7,0,{Water:4}),60);
 assert.equal(preview(7,0,{Water:3,Fire:2}),70);
 // CC cost: with two Water there is no bonus, but with two non-Water there is.
 assert.equal(preview(19,1,{Water:2}),30);
 assert.equal(preview(19,1,{Water:4}),70);
 assert.equal(preview(19,1,{Water:2,Fire:2}),70);
 assert.equal(preview(50,0,{Water:2}),30);
 assert.equal(preview(50,0,{Water:4}),50);
 assert.equal(preview(50,0,{Water:2,Fire:2}),50);
});
test('Dark Mind hits the defending Pokémon AND the selected Bench Pokémon',()=>{
 for(const [id,damage] of [[47,20],[62,10]]){
  const s=battle();s.sides.opponent.active=slot(83,'wailmer');
  const front=s.sides.opponent.active,bench=s.sides.opponent.bench[0];
  attack(s,id,1,{Darkness:4,Colorless:4,Psychic:4});
  assert.equal(front.damage,damage,`${id} front damage`);
  assert.equal(bench.damage,10,`${id} bench damage`);
 }
});
test('Spread attacks use normal damage rules on Active, including Weakness',()=>{
 for(const [id,index,damage] of [[21,0,40],[23,1,20],[37,0,20]]){
  const s=battle();s.sides.opponent.active=slot(id===21?72:83,'target');
  attack(s,id,index,{Fighting:4,Metal:4,Colorless:4});
  assert.equal(s.sides.opponent.active.damage,damage,`${id}:${index}`);
 }
});
test('Fast Evolution can only select Evolution cards, never Basics',()=>{
 const effect=C(27).attacks[0].effect;
 assert.deepEqual(effect.filter.stage,['Stage 1','Stage 2']);
 assert.ok(fx.matchesFilter(C(95),effect.filter));
 assert.ok(fx.matchesFilter(C(27),effect.filter));
 assert.ok(!fx.matchesFilter(C(72),effect.filter));
});
test('Lanette can retrieve up to 3 DIFFERENT types of non-Baby Basic Pokemon',()=>{
 const s=battle();const u=s.sides.player;
 u.deck=[{uid:'pika',cardId:'ex2-72'},{uid:'raichu',cardId:'ex2-98'},
 {uid:'pichu',cardId:'ex2-20'},{uid:'elekid',cardId:'ex2-36'},
 {uid:'electabuzz',cardId:'ex2-35'},{uid:'wailmer',cardId:'ex2-83'},
 {uid:'dunsparce',cardId:'ex2-60'},{uid:'baltoy',cardId:'ex2-32'}];
 const handBefore=u.hand.length;u.hand.push({uid:'lanette',cardId:'ex2-87'});
 const play=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='ex2-87');assert.ok(play);
 core.applyAction(s,'player',play);
 assert.equal(s.phase,'effectChoice');
 let selections=[];
 for(let i=0;i<3;i++){
  const choices=core.legalActions(s,s.choiceSide);
  const offered=choices.filter(a=>a.choiceCardId).map(a=>a.choiceCardId);
  assert.ok(!offered.includes('ex2-20'));assert.ok(!offered.includes('ex2-36'));assert.ok(!offered.includes('ex2-98'));
  const first=choices.find(a=>a.choiceCardId&&['ex2-72','ex2-83','ex2-60','ex2-32'].includes(a.choiceCardId));assert.ok(first,`missing valid choices ${offered}`);
  const picked=classic.cardById(first.choiceCardId);
  selections.push(picked.types[0]);core.applyAction(s,s.choiceSide,first);
  if(s.phase==='effectChoice')assert.ok(!core.legalActions(s,s.choiceSide).some(a=>classic.cardById(a.choiceCardId)?.types?.[0]===picked.types[0]));
 }
 assert.equal(new Set(selections).size,3);
 assert.ok(u.hand.length>=handBefore+3);
});
test('Deck synergy metadata records relevant Sandstorm payoffs and restrictions',()=>{
 for(const n of [38,53]){
  const m=meta.metadata(C(n));for(const t of ['sleep','poison','burn','paralysis','confusion'])assert.ok(m.payoffs.includes(t),C(n).name+' '+t);
 }
 assert.ok(meta.metadata(C(3)).inflicts.includes('poison'));
 assert.ok(meta.metadata(C(2)).inflicts.includes('poison'));
 assert.deepEqual(meta.metadata(C(87)).stages,['Basic']);
 assert.ok(meta.metadata(C(7)).energyTypes.includes('Water'));
 for(let n=1;n<=100;n++)for(const key of ['roles','inflicts','payoffs','energyTypes','stages'])assert.ok(Array.isArray(meta.metadata(C(n))[key]),`${n} ${key}`);
});
test('Player and CPU build legal Sandstorm-only decks under multiple styles and themes',()=>{
 const pool=classic.CARDS.filter(c=>c.setId==='ex2'&&c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
 let p=0,c=0;
 for(const theme of ['any','healing','poison','disruption','energy']){
  for(const seed of [17,59,89]){
   const built=builder.buildDeck(pool,{sets:['ex2'],style:'random',theme,randomSeed:seed});
   if(built.ok){p++;assert.equal(built.cards.length,30);assert.ok(classic.validateDeck(built.cards).ok);assert.ok(built.cards.every(id=>id.startsWith('ex2-')));}
   const cpu=opp.generate({sets:['ex2'],seed,theme});
   if(cpu.ok){c++;assert.equal(cpu.cards.length,30);assert.ok(classic.validateDeck(cpu.cards).ok);assert.ok(cpu.cards.every(id=>id.startsWith('ex2-')));}
  }
 }
 assert.ok(p>=9,`not enough player decks generated: ${p}`);
 assert.ok(c>=9,`not enough CPU decks generated: ${c}`);
});
test('Fan Away selects either basic or special Energy and returns a valid card to hand',()=>{
 for(const wanted of ['Metal','Darkness','Multi Energy']){
  const s=battle(),u=s.sides.player,them=s.sides.opponent;
  u.active=slot(12,'shiftry');them.active.energy={Metal:1,Darkness:1};
  them.active.specialEnergy=[{uid:'multi',cardId:'ex2-93'}];
  const effect=C(12).abilities[0].effect;
  fx.applyEffect(effect,{...core.effectContext(s,'player',{},u.active),random:()=>.1,isAbility:true});
  assert.equal(s.phase,'effectChoice');
  const action=core.legalActions(s,s.choiceSide).find(a=>a.choiceLabel?.includes(wanted));assert.ok(action,wanted);
  const before=them.hand.length;core.applyAction(s,s.choiceSide,action);
  assert.equal(them.hand.length,before+1);
  assert.ok(classic.cardById(them.hand.at(-1).cardId)?.kind==='energy');
  if(wanted==='Multi Energy')assert.equal(them.active.specialEnergy.length,0);
  else assert.equal(them.active.energy[wanted],0);
 }
});
test('Sableye Supernatural allows choosing which opposing Supporter to copy',()=>{
 const s=battle();s.sides.player.active=slot(10,'sableye');
 s.sides.opponent.hand=[{uid:'lanette',cardId:'ex2-87'},{uid:'wally',cardId:'ex2-89'}];
 fx.applyEffect(C(10).attacks[0].effect,{...core.effectContext(s,'player',{},s.sides.player.active),random:()=>.1,isAttack:true});
 assert.equal(s.phase,'effectChoice');
 const options=core.legalActions(s,s.choiceSide).filter(a=>a.choiceCardId).map(a=>a.choiceCardId);
 assert.deepEqual(options,['ex2-87','ex2-89']);
});
test('Fossils remain no-Prize, no-retreat playable Basic targets for evolution',()=>{
 const s=battle();s.sides.player.hand.unshift({uid:'fossil90',cardId:'ex2-90'});
 const action=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='ex2-90');assert.ok(action);
 core.applyAction(s,'player',action);
 const placed=s.sides.player.bench.find(x=>x.cardId==='ex2-90');assert.ok(placed);
 assert.equal(classic.cardById(placed.cardId).noPrize,true);
 assert.equal(classic.cardById('ex2-27').evolvesFrom,'Claw Fossil');
 assert.equal(classic.cardById('ex2-94').evolvesFrom,'Mysterious Fossil');
});
