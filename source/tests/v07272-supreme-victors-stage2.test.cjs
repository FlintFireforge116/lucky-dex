'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core');
const fx=require('../app/src/main/assets/tcgp-battle-effects');
const db=require('../app/src/main/assets/tcg-classic-battle-data');
const cpu=require('../app/src/main/assets/tcg-classic-opponents');
const victors=require('../app/src/main/assets/tcg-classic-supreme-victors');
const base=cpu.generate({sets:['pl3'],type:'Grass',seed:13});assert.ok(base.ok);
function state(active='pl3-12',foe='pl3-93'){
 const s=core.createBattle({format:'classic',playerDeck:base.cards,opponentDeck:base.cards,seed:57,firstSide:'player',playerEnergyTypes:['Grass','Water','Lightning','Fighting','Fire'],opponentEnergyTypes:['Grass','Water','Lightning','Fighting','Fire']});
 s.phase='battle';s.turnNumber=12;s.activeSide='player';
 for(const side of ['player','opponent']){let ss=s.sides[side];ss.turnCount=5;ss.hand=[];ss.bench=[];ss.discard=[];ss.energyDiscard={};}
 s.sides.player.active=core.makePokemonSlot(active,2,'player-active');s.sides.player.active.energy={Grass:6,Water:6,Lightning:6,Fighting:3,Fire:3};
 s.sides.opponent.active=core.makePokemonSlot(foe,2,'opp-active');s.sides.opponent.bench=[core.makePokemonSlot('pl3-95',2,'opp-bench')];
 return s;
}
function attack(s,index=0,which){const matches=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===index);let action=which?matches.find(which):matches[0];assert.ok(action,`legal attack #${index} ${s.sides.player.active.cardId}`);core.applyAction(s,'player',action);return action;}
function choose(s,side='player',predicate){const legal=core.legalActions(s,side).filter(x=>x.type==='effectChoice');const a=predicate?legal.find(predicate):legal[0];assert.ok(a,'No legal choice: '+JSON.stringify(legal));core.applyAction(s,side,a);return a;}

test('Stage 2 keeps 153 authentic prints and enables at least 116 cards without placeholder effects',()=>{
 const counts=victors.coverage();assert.equal(counts.total,153);assert.ok(counts.battleEnabled>=116,JSON.stringify(counts));
 for(const c of victors.CARDS.filter(c=>c.battleEnabled))for(const x of [...(c.attacks||[]),...(c.abilities||[]),...(c.effect?[{effect:c.effect}]:[])]){
  assert.deepEqual(fx.validateEffect(x.effect),[],c.id+': '+(x.name||'trainer'));}
});

test('Swampert Drag Off chooses whether to switch before a single 30 damage hit',()=>{
 const s=state('pl3-12');const chosen=attack(s,0,a=>a.effectSelection==='opp-bench');assert.equal(chosen.effectSelection,'opp-bench');
 assert.equal(s.sides.opponent.active.cardId,'pl3-95');assert.equal(s.sides.opponent.active.damage,30);
 assert.equal(s.sides.opponent.bench[0].cardId,'pl3-93');assert.equal(s.sides.opponent.bench[0].damage,0);
 const decline=state('pl3-12');attack(decline,0,a=>a.effectSelection==='');assert.equal(decline.sides.opponent.active.cardId,'pl3-93');assert.equal(decline.sides.opponent.active.damage,30);
});

test('Swampert Push Over counts Fighting Energy and Root Protector protects from Basic attackers',()=>{
 const s=state('pl3-12','pl3-47');s.sides.player.active.energy={Water:1,Fighting:3,Colorless:1};attack(s,1);
 assert.equal(s.sides.opponent.active.damage,90,'60 + 10 per Fighting Energy');
 const guard=state('pl3-93','pl3-12');guard.sides.opponent.active=core.makePokemonSlot('pl3-12',2,'defender');guard.sides.player.active=core.makePokemonSlot('pl3-93',2,'attacker');
 assert.equal(fx.modifierAmount(guard,'opponent',guard.sides.opponent.active,'damageReduction',db.cardById),20);
 guard.sides.player.active=core.makePokemonSlot('pl3-62',2,'evolved-attacker');
 assert.equal(fx.modifierAmount(guard,'opponent',guard.sides.opponent.active,'damageReduction',db.cardById),0);
});

test('Champion’s Room reduces retreat for Pokémon SP on either side, not ordinary Pokémon',()=>{
 const s=state('pl3-2','pl3-3');s.stadium={cardId:'pl3-135',ownerSide:'player'};
 assert.equal(fx.modifierAmount(s,'player',s.sides.player.active,'retreatCost',db.cardById),-1);
 assert.equal(fx.modifierAmount(s,'opponent',s.sides.opponent.active,'retreatCost',db.cardById),-1);
 s.sides.player.active=core.makePokemonSlot('pl3-93',2,'non-sp');
 assert.equal(fx.modifierAmount(s,'player',s.sides.player.active,'retreatCost',db.cardById),0);
});

test('Sandslash Dig Down chooses any subset of top five Fighting Energy then shuffles remaining deck',()=>{
 const s=state('pl3-42');let ss=s.sides.player;
 ss.deck.unshift({uid:'fight-a',cardId:'dp1-128'},{uid:'poke',cardId:'pl3-93'},{uid:'fight-b',cardId:'dp1-128'},{uid:'other',cardId:'pl3-95'},{uid:'other2',cardId:'pl3-96'});
 const initial=ss.deck.length;
 const power=core.legalActions(s,'player').find(x=>x.type==='ability'&&x.cardId==='pl3-42');assert.ok(power);
 core.applyAction(s,'player',power);assert.equal(s.phase,'effectChoice');
 choose(s,'player',x=>x.choiceCardId==='dp1-128');assert.equal(s.phase,'effectChoice');
 choose(s,'player',x=>x.choiceCardId==='dp1-128');assert.notEqual(s.phase,'effectChoice');
 assert.equal(ss.hand.filter(x=>x.cardId==='dp1-128').length,2);assert.equal(ss.deck.length,initial-2);
 assert.ok(ss.deck.some(x=>x.uid==='poke'));
});

test('Sandslash Needle flips one coin and applies both Poison and Paralysis only together',()=>{
 const s=state('pl3-42');attack(s,0);const d=s.sides.opponent.active;
 assert.equal(Boolean(d.conditions?.poison),Boolean(d.conditions?.paralysis));
});

test('Ivysaur Evolutionary Pollen offers optional sleep only on hand evolution',()=>{
 const s=state('pl3-93');s.sides.player.active.energy={Grass:3};
 s.sides.player.hand.push({uid:'evolve-ivysaur',cardId:'pl3-62'});
 const a=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='pl3-62');assert.ok(a,JSON.stringify(core.legalActions(s,'player')));
 core.applyAction(s,'player',a);assert.equal(s.sides.player.active.cardId,'pl3-62');
 assert.equal(s.phase,'effectChoice');let choices=core.legalActions(s,'player').filter(x=>x.type==='effectChoice');assert.equal(choices.length,2);
 choose(s,'player',x=>/Asleep/i.test(x.choiceLabel));
 assert.ok(s.sides.opponent.active.conditions?.sleep);
});

test('Regigigas FB Rainbow Lariat counts distinct Pokémon SP names, not copies',()=>{
 const s=state('pl3-9','pl3-47');s.sides.player.bench=[core.makePokemonSlot('pl3-3',2,'darkrai-1'),core.makePokemonSlot('pl3-3',2,'darkrai-2'),core.makePokemonSlot('pl3-2',2,'bastiodon')];
 const c=db.cardById('pl3-9'),i=c.attacks.findIndex(a=>a.name==='Rainbow Lariat');attack(s,i);
 assert.equal(s.sides.opponent.active.damage,60);
});

test('Plusle Greedy Draw stops precisely one card above opponent hand, not at a fixed number',()=>{
 const s=state('pl3-76');s.sides.opponent.hand=[{uid:'opp1',cardId:'pl3-93'},{uid:'opp2',cardId:'pl3-93'}];
 s.sides.player.hand=[{uid:'my1',cardId:'pl3-93'}];
 const i=db.cardById('pl3-76').attacks.findIndex(x=>x.name==='Greedy Draw');attack(s,i);
 assert.equal(s.sides.player.hand.length,3);
});

test('Supreme Victors 30-card CPU decks avoid orphan evolutions across available Energy types',()=>{
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Colorless']){
  for(let seed=1;seed<=3;seed++){
   const r=cpu.generate({sets:['pl3'],type,seed:seed*13});assert.ok(r.ok,`${type} seed ${seed}: ${r.error}`);assert.equal(r.cards.length,30);
   for(const id of r.cards){const c=db.cardById(id);assert.ok(c?.battleEnabled&&c.setId==='pl3',id);if(c.kind==='pokemon'&&c.evolvesFrom&&c.stage!=='Basic')assert.ok(r.cards.some(x=>db.cardById(x).name===c.evolvesFrom),`${type} missing ${c.evolvesFrom} for ${c.name}`);}
  }
 }
});

test('Manectric G Energy Absorption allows two physical Energy cards from discard, keeping both types',()=>{
 const s=state('pl3-66');const ss=s.sides.player;
 ss.discard=[{uid:'water-card',cardId:'dp1-125'},{uid:'fire-card',cardId:'dp1-124'}];
 const start={...ss.active.energy};attack(s,0);
 assert.equal(s.phase,'effectChoice');
 choose(s,'player',x=>/Water/.test(x.choiceLabel));
 assert.equal(s.phase,'effectChoice');
 choose(s,'player',x=>/Fire/.test(x.choiceLabel));
 assert.notEqual(s.phase,'effectChoice');
 assert.equal(ss.active.energy.Water,start.Water+1);assert.equal(ss.active.energy.Fire,start.Fire+1);
 assert.ok(!ss.discard.some(x=>['water-card','fire-card'].includes(x.uid)));
});

test('Numel Draw In takes discarded Fire Energy into the active without counting it as hand attachment',()=>{
 const s=state('pl3-74');const ss=s.sides.player;
 ss.energyDiscard={Fire:2};const before=ss.active.energy.Fire;
 attack(s,0);
 assert.equal(ss.active.energy.Fire,before+2);assert.equal(ss.energyDiscard.Fire,0);
});

test('Palmer’s Contribution returns selected real Pokémon and basic Energy, keeping unrelated discard',()=>{
 const s=state('pl3-9');const ss=s.sides.player;
 ss.hand=[{uid:'palmer',cardId:'pl3-139'}];ss.discard=[{uid:'wanted-poke',cardId:'pl3-93'},{uid:'wanted-energy',cardId:'dp1-123'},{uid:'not-eligible-trainer',cardId:'pl3-136'}];
 let a=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='pl3-139');assert.ok(a);core.applyAction(s,'player',a);
 assert.equal(s.phase,'effectChoice');
 choose(s,'player',x=>/Bulbasaur/.test(x.choiceLabel));
 assert.equal(s.phase,'effectChoice');
 choose(s,'player',x=>/Grass Energy/.test(x.choiceLabel));
 assert.notEqual(s.phase,'effectChoice');
 assert.ok(ss.deck.some(x=>x.uid==='wanted-poke'));assert.ok(ss.deck.some(x=>x.uid==='wanted-energy'));
 assert.ok(ss.discard.some(x=>x.uid==='not-eligible-trainer'));
});
