'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const cards=require(path.join(A,'tcg-classic-ruby-sapphire.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const picker=require(path.join(A,'tcg-classic-set-picker.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const builder=require(path.join(A,'tcg-classic-deck-builder.js'));
const synergy=require(path.join(A,'tcg-deck-synergy.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const fx=require(path.join(A,'tcgp-battle-effects.js'));
const seedDeck=opponents.generate({sets:['ex1'],seed:33});
const TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
function slot(n,uid){return core.makePokemonSlot('ex1-'+n,2,uid);}
function battle(){
 assert.ok(seedDeck.ok,seedDeck.error);
 const s=core.createBattle({format:'classic',playerDeck:seedDeck.cards,opponentDeck:seedDeck.cards,playerEnergyTypes:TYPES,opponentEnergyTypes:TYPES,seed:33,firstSide:'player'});
 s.phase='battle';s.activeSide='player';s.turnNumber=7;s.sides.player.turnCount=4;s.sides.opponent.turnCount=3;
 s.sides.player.active=slot(14,'p');s.sides.opponent.active=slot(72,'o');
 s.sides.player.bench=[slot(73,'pb')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.bench=[slot(74,'ob')];s.sides.opponent.bench[0].benchSlot=0;
 s.sides.player.active.energy=Object.fromEntries(TYPES.map(t=>[t,10]));
 s.sides.opponent.active.energy={Water:3};
 s.sides.player.energyDiscard=Object.fromEntries(TYPES.map(t=>[t,3]));
 s.sides.opponent.energyDiscard=Object.fromEntries(TYPES.map(t=>[t,3]));
 s.sides.player.active.damage=20;s.sides.player.bench[0].damage=20;
 return s;
}
function finishChoices(s){
 let steps=0;
 while(s.phase==='effectChoice'&&steps<16){
  const side=s.choiceSide,choices=core.legalActions(s,side);
  assert.ok(choices.length,`No ${side} response to ${JSON.stringify(s.pendingChoice)}`);
  core.applyAction(s,side,choices[0]);steps++;
 }
 assert.notEqual(s.phase,'effectChoice','effect choice failed to finish in 16 steps');
 assert.ok(!s.log.some(x=>x.type==='battleError'));
}
test('Battle screen uses exactly the sets supported by the Classic CPU, including EX Ruby & Sapphire',()=>{
 const ui=fs.readFileSync(path.join(A,'tcgp-battle-ui.js'),'utf8');
 assert.match(ui,/const CLASSIC_SETS=classicOpponents\.SETS\.slice\(\)/);
 assert.deepEqual(opponents.SETS,builder.SET_IDS,'picker and generator must not drift');
 assert.ok(opponents.SETS.includes('ex1'));
 const html=picker.html({ids:opponents.SETS,selected:['ex1'],mode:'opponent'});
 assert.match(html,/data-set-choice="ex1"/);
 assert.match(html,/EX Ruby &amp; Sapphire/);
 assert.match(html,/data-set-era="EX"/);
 assert.match(html,/data-set-choice="ex1"[^>]+aria-pressed="true"/);
});
test('All 109 EX prints have versioned battle coverage and a stable strategy metadata schema',()=>{
 assert.equal(cards.CARDS.length,109);assert.equal(cards.coverage().battleEnabled,109);
 assert.equal(cards.CARDS.filter(c=>c.kind==='pokemon').length,87);
 assert.equal(cards.CARDS.filter(c=>c.kind==='trainer').length,13);
 assert.equal(cards.CARDS.reduce((n,c)=>n+(c.attacks?.length||0),0),148);
 assert.equal(cards.CARDS.reduce((n,c)=>n+(c.abilities?.length||0),0),18);
 for(const card of cards.CARDS){
  assert.equal(card.support.reasons.length,0,card.id);
  assert.equal(typeof card.deckMeta,'object',card.id);
  for(const key of ['roles','inflicts','payoffs','energyTypes','stages']){
   assert.ok(Array.isArray(card.deckMeta[key]),`${card.id} missing ${key}`);
   assert.ok(Array.isArray(synergy.metadata(card)[key]),`${card.id} strategy ${key}`);
  }
  for(const a of card.attacks||[])assert.ok(fx.supportsEffect(a.effect),`${card.id} ${a.name}`);
  for(const a of card.abilities||[])assert.ok(fx.supportsEffect(a.effect),`${card.id} ${a.name}`);
  if(card.kind==='trainer'||card.specialEnergy)assert.ok(fx.supportsEffect(card.effect),card.id);
 }
});
test('EX-era Poké-Powers, status moves, Berries and utility Trainers feed the deck-builder strategies',()=>{
 const expected={
  3:['energy'],5:['draw'],6:['stall'],7:['energy'],9:['energy'],10:['disruption'],12:['disruption'],
  13:['energy'],18:['search'],20:['energy'],23:['healing'],26:['stall'],28:['healing'],
  29:['energy'],30:['energy'],32:['healing'],41:['healing'],43:['stall'],44:['search'],
  46:['disruption'],49:['stall'],70:['energy'],78:['search'],80:['disruption'],
  81:['energy'],82:['energy'],83:['energy','search'],84:['healing'],85:['healing'],
  88:['search'],90:['energy','search'],101:['energy']
 };
 for(const [n,roles] of Object.entries(expected)){
  const c=cards.cardById('ex1-'+n),m=synergy.metadata(c);
  for(const role of roles)assert.ok(m.roles.includes(role),`${c.id} ${c.name} missing ${role}`);
 }
 for(const status of ['sleep','poison','burn'])assert.ok(synergy.metadata(cards.cardById('ex1-11')).inflicts.includes(status));
 for(const n of [11,13,44,67,69,74,75])assert.ok(['sleep','poison','burn'].some(s=>synergy.metadata(cards.cardById('ex1-'+n)).inflicts.includes(s)),`Missing status ${n}`);
 assert.ok(synergy.pokemonThemeScore(cards.cardById('ex1-3'),'energy')>0);
 assert.ok(synergy.pokemonThemeScore(cards.cardById('ex1-13'),'sleep')>0);
 const ctx=synergy.context([cards.cardById('ex1-3')],['Fire'],'energy');
 assert.ok(synergy.trainerScore(cards.cardById('ex1-81'),ctx)>synergy.trainerScore(cards.cardById('ex1-91'),ctx));
});
test('Original Pokémon-ex are Ultra/ex rarity targets, not ordinary Rare/Holo',()=>{
 const ex=cards.CARDS.filter(c=>c.pokemonEx);assert.equal(ex.length,8);
 for(const card of ex)assert.equal(builder.rarityTier(card),'ultra',card.id);
 assert.equal(builder.rarityTier(cards.cardById('ex1-3')),'rare');
 for(const seed of [3,23,43]){
  const d=opponents.generate({sets:['ex1'],rarityFocus:'ultra',seed});
  assert.ok(d.ok,`${seed}: ${d.error}`);assert.equal(d.cards.length,30);
  assert.ok(d.cards.some(id=>cards.cardById(id)?.pokemonEx),`${seed}: no ex attacker`);
  assert.ok(d.cards.every(id=>id.startsWith('ex1-')));
  assert.ok(classic.validateDeck(d.cards).ok);
 }
});
test('Every one of the 148 printed attacks is a legal battle action and resolves for both coin paths',()=>{
 let attacks=0;
 for(const c of cards.CARDS.filter(c=>c.kind==='pokemon'))for(let i=0;i<c.attacks.length;i++){
  for(const heads of [true,false]){
   const s=battle();s.sides.player.active=slot(Number(c.number),'attacker');
   s.sides.player.active.energy=Object.fromEntries(TYPES.map(t=>[t,10]));
   // Both deterministic seeds and the actual legal-action path are exercised.
   s.rngState=heads?1:0x7fffffff;
   const action=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===i);
   assert.ok(action,`${c.id}: ${c.attacks[i].name} unavailable despite adequate Energy`);
   assert.doesNotThrow(()=>{core.applyAction(s,'player',action);finishChoices(s);},`${c.id}: ${c.attacks[i].name}`);
  }
  attacks++;
 }
 assert.equal(attacks,148);
});
test('All 13 EX-era Trainers can be played through the real battle action and choice flow',()=>{
 for(let n=80;n<=92;n++){
  const s=battle();s.sides.player.hand.unshift({cardId:'ex1-'+n,uid:'t'+n});
  const a=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='ex1-'+n);
  assert.ok(a,`No legal Trainer action for ex1-${n}`);
  assert.doesNotThrow(()=>{core.applyAction(s,'player',a);finishChoices(s);},`EX Trainer ${n}`);
 }
});
test('EX-only CPU decks remain legal across rarity, strategic theme and energy constraints',()=>{
 for(const theme of ['any','sleep','poison','burn','paralysis','healing','energy','disruption']){
  const d=opponents.generate({sets:['ex1'],theme,seed:23});
  if(!d.ok)continue; // Some printed strategies are inherently absent from this set.
  assert.equal(d.cards.length,30);
  assert.ok(d.cards.every(id=>id.startsWith('ex1-')),theme);
  assert.ok(classic.validateDeck(d.cards).ok,theme);
 }
});
test('All six activated EX-era Poké-Powers are usable on the battle board',()=>{
 for(const n of [3,5,7,13,20,46]){
  const s=battle();s.sides.player.active=slot(n,'power-pokemon');
  s.sides.player.active.energy={Grass:3,Fire:3,Water:3,Lightning:2,Psychic:2};
  s.sides.player.hand.unshift({cardId:'ex1-106',uid:'water-from-hand'});
  const action=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='ex1-'+n);
  assert.ok(action,`EX Power missing for ${n}`);
  assert.doesNotThrow(()=>{core.applyAction(s,'player',action);finishChoices(s);},`EX Power ${n}`);
 }
});
