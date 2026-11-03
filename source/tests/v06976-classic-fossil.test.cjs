'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const req=s=>require(path.join(assets,s));
test('Fossil has 62 numbered playable cards and existing Base/Jungle survive',()=>{
 const data=req('tcg-classic-battle-data.js');assert.deepEqual(Object.entries(Object.groupBy(data.CARDS,c=>c.setId)).map(([id,cards])=>[id,cards.length]),[['base1',102],['base2',64],['base3',62]]);
 assert.equal(data.cardById('base3-45').name,'Weezing');assert.equal(data.cardById('base3-62').name,'Mysterious Fossil');
});
test('Fossil binder collection ownership maps and separates holo/non-holo prints',()=>{
 const d=req('tcg-classic-battle-data.js');const rows=d.projectOwnedCards([{source:'tcg',setId:'library:FO',id:'FO-1',number:'1',count:2},{source:'tcg',setId:'library:FO',id:'FO-16',number:'16',count:3}]);assert.equal(rows.find(r=>r.gameplayId==='base3-1').quantity,2);assert.equal(rows.find(r=>r.gameplayId==='base3-16').quantity,3);
});
test('Fossil is an Auto Builder and random CPU source, including base3-only',()=>{
 const d=req('tcg-classic-battle-data.js'),b=req('tcg-classic-deck-builder.js'),opp=req('tcg-classic-opponents.js');assert.ok(b.SET_IDS.includes('base3'));assert.ok(opp.SETS.includes('base3'));
 const owned=d.CARDS.filter(c=>c.setId==='base3'&&c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));const deck=b.buildDeck(owned,{sets:['base3'],types:['Water'],style:'competitive'});assert.equal(deck.ok,true,deck.errors?.join(';'));assert.equal(d.validateDeck(deck.cards).ok,true);
 const cpu=opp.generate({sets:['base3'],type:'Water',seed:2026});assert.ok(cpu.ok,cpu.error);assert.ok(cpu.cards.every(id=>d.cardById(id).setId==='base3'));
});
test('Fossil evolves Mysterious Fossil, uses existing Koffing, and limits shared holo prints',()=>{
 const d=req('tcg-classic-battle-data.js'),b=req('tcg-classic-deck-builder.js');assert.equal(d.cardById('base3-50').evolvesFrom,'Mysterious Fossil');assert.deepEqual(b.familyLine(d.cardById('base3-45'),d.CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled)).map(c=>c.name),['Koffing','Weezing']);
 const mixed=[...Array(3).fill('base3-1'),...Array(2).fill('base3-16'),...Array(25).fill('base3-39')];assert.match(d.validateDeck(mixed).errors.join(' '),/Aerodactyl exceeds/i);
});
test('Fossil special rule effects are executable, never placeholder damage',()=>{
 const d=req('tcg-classic-battle-data.js'),fx=req('tcgp-battle-effects.js');
 for(const id of ['base3-1','base3-5','base3-6','base3-8','base3-12','base3-13','base3-15','base3-43','base3-50','base3-52','base3-61'])assert.equal(d.cardById(id).battleEnabled,true,`${id}: ${d.cardById(id).support.reasons.join(', ')}`);
 assert.equal(d.cardById('base3-59').battleEnabled,false,'Energy Search must not invent Basic Energy cards in hybrid format');
});
test('Aerodactyl locks both players from evolving, status turns the Power off',()=>{
 const c=req('tcgp-battle-core.js'),d=req('tcg-classic-decks.js'),fx=req('tcgp-battle-effects.js');const s=c.createBattle({format:'classic',playerDeck:d.LOANER_DECK,opponentDeck:d.LOANER_DECK,seed:102});s.phase='battle';s.activeSide='player';s.sides.player.bench=[c.makePokemonSlot('base3-1',0,'aero')];
 assert.equal(fx.isActionLocked(s,'player','Evolution',req('tcgp-battle-data.js').cardById),true);
 assert.equal(fx.isActionLocked(s,'opponent','Evolution',req('tcgp-battle-data.js').cardById),true);
 s.sides.player.bench[0].conditions={sleep:true};assert.equal(fx.isActionLocked(s,'opponent','Evolution',req('tcgp-battle-data.js').cardById),false);
});
test('Fossil Wildfire, Thunderstorm and Recycle support legal effect schemas',()=>{
 const c=req('tcg-classic-battle-data.js'),fx=req('tcgp-battle-effects.js');for(const n of [12,15,61]){const card=c.cardById('base3-'+n);const effects=n===61?[card.effect]:card.attacks.map(a=>a.effect).filter(Boolean);for(const effect of effects)assert.equal(fx.supportsEffect(effect),true,card.name);}
});
function battle(seed=76){const c=req('tcgp-battle-core.js'),d=req('tcg-classic-decks.js');const state=c.createBattle({format:'classic',playerDeck:d.LOANER_DECK,opponentDeck:d.LOANER_DECK,playerEnergyTypes:['Fighting'],opponentEnergyTypes:['Psychic'],seed});state.phase='battle';state.activeSide='player';state.turnNumber=5;state.sides.player.turnCount=3;return {c,state};}
test('Haunter Transparency actually flips and prevents all damage on heads',()=>{
 let blocked=false,allowed=false;for(let seed=1;seed<32;seed++){
 const {c,state}=battle(seed),atk=c.makePokemonSlot('base1-7',0,'atk'),def=c.makePokemonSlot('base3-6',0,'haunter');atk.energy={Fighting:3};state.sides.player.active=atk;state.sides.opponent.active=def;
 const act=c.legalActions(state,'player').find(a=>a.type==='attack'&&a.attackIndex===1);assert.ok(act);c.applyAction(state,'player',act);
 const flips=state.log.filter(e=>e.reason==='fossilTransparency');assert.equal(flips.length,1,'Haunter should flip for every attack');if(flips[0].heads){blocked=true;assert.equal(def.damage,0);}else{allowed=true;assert.equal(def.damage,10); /* Haunter resists Fighting by 30. */}
 }assert.ok(blocked&&allowed,'both coin outcomes must be tested');
});
test('Gengar Curse lets owner select opponent damage source and destination',()=>{
 const {c,state}=battle(),g=c.makePokemonSlot('base3-5',0,'gengar');state.sides.player.active=g;
 const defending=c.makePokemonSlot('base1-7',0,'foe-active'),benched=c.makePokemonSlot('base1-28',0,'foe-bench');defending.damage=20;benched.benchSlot=0;state.sides.opponent.active=defending;state.sides.opponent.bench=[benched];
 const action=c.legalActions(state,'player').find(a=>a.type==='ability'&&a.cardId==='base3-5');assert.ok(action,'Curse power should be available');c.applyAction(state,'player',action);
 assert.equal(state.phase,'effectChoice');assert.equal(state.choiceSide,'player','Gengar player must choose opponent cards');
 let choices=c.legalActions(state,'player');assert.ok(choices.some(a=>a.choiceTarget==='active'));
 c.applyAction(state,'player',choices.find(a=>a.choiceTarget==='active'));
 assert.equal(state.phase,'effectChoice');assert.equal(state.choiceSide,'player');
 choices=c.legalActions(state,'player');assert.ok(choices.some(a=>a.choiceTarget==='bench'));
 c.applyAction(state,'player',choices.find(a=>a.choiceTarget==='bench'));
 assert.equal(defending.damage,10);assert.equal(benched.damage,10);
});
test('Fossil-only generated opponents complete real matches',()=>{
 const opp=req('tcg-classic-opponents.js'),decks=req('tcg-classic-decks.js'),core=req('tcgp-battle-core.js'),ai=req('tcgp-battle-ai.js');
 for(const seed of [761,762,763,764,765,766]){
  const cpu=opp.generate({sets:['base3'],seed,includeColorless:true});assert.equal(cpu.ok,true,cpu.error);
  const s=core.createBattle({format:'classic',playerDeck:decks.LOANER_DECK.slice(),opponentDeck:cpu.cards,playerEnergyTypes:['Fighting','Fire'],opponentEnergyTypes:cpu.energyTypes,firstSide:'opponent',seed});let step=0;
  while(s.phase!=='finished'&&step<900){const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.phase==='setup'?s.setupSide:s.activeSide;const action=ai.chooseAction(s,side,'Beginner',step);assert.ok(action,`missing action: seed=${seed} phase=${s.phase} turn=${s.turnNumber}`);core.applyAction(s,side,action);step++;}
  assert.equal(s.phase,'finished',`Fossil-only match stuck for ${cpu.type} at step ${step}, phase ${s.phase}`);
 }
});
test('Fossil evolution families include the Mysterious Fossil Trainer and selected endpoint',()=>{
 const d=req('tcg-classic-battle-data.js'),b=req('tcg-classic-deck-builder.js');
 const pool=d.CARDS.filter(c=>c.battleEnabled);
 assert.deepEqual(b.familyLine(d.cardById('base3-9'),pool).map(x=>x.name),['Mysterious Fossil','Kabuto','Kabutops']);
 const owned=pool.map(c=>({gameplayId:c.id,quantity:4}));
 for(const focus of ['base3-1','base3-9','base3-40']){
  const out=b.buildDeck(owned,{style:'competitive',sets:['base3'],focusCardId:focus});
  assert.equal(out.ok,true,`${focus}: ${out.errors?.join(';')}`);
  assert.ok(out.cards.includes(focus),`${focus} must be in the built deck`);
  assert.ok(out.cards.includes('base3-62'),'Mysterious Fossil must be included');
 }
});
test('Fossil Raichu can hit fewer than three Benched Pokemon without stalling',()=>{
 const {c,state}=battle(),atk=c.makePokemonSlot('base3-14',0,'raichu');atk.energy={Lightning:4};state.sides.player.active=atk;
 state.sides.opponent.active=c.makePokemonSlot('base1-28',0,'foe');const one=c.makePokemonSlot('base1-60',0,'one'),two=c.makePokemonSlot('base1-44',0,'two');one.benchSlot=0;two.benchSlot=1;state.sides.opponent.bench=[one,two];
 const action=c.legalActions(state,'player').find(a=>a.type==='attack');assert.ok(action);c.applyAction(state,'player',action);
 assert.equal(state.phase,'effectChoice');assert.equal(state.choiceSide,'player','attacking player must choose targets');
 let n=0;while(state.phase==='effectChoice'&&n<4){const options=c.legalActions(state,'player');assert.ok(options.length,'Gigashock must have targets');c.applyAction(state,'player',options[0]);n++;}
 assert.ok(n<=2,'Gigashock should stop after both Bench targets');assert.notEqual(state.phase,'effectChoice');assert.equal(one.damage,10);assert.equal(two.damage,10);
});
test('Mysterious Fossil can be put onto Bench and evolve into Kabuto next turn',()=>{
 const {c,state}=battle();state.sides.player.bench.pop();state.sides.player.hand=[{uid:'fossil-hand',cardId:'base3-62'},{uid:'kabuto-hand',cardId:'base3-50'}];const action=c.legalActions(state,'player').find(a=>a.type==='trainer'&&a.cardId==='base3-62');assert.ok(action);c.applyAction(state,'player',action);
 const slot=state.sides.player.bench.find(s=>s.cardId==='base3-62');assert.ok(slot);assert.equal(c.legalActions(state,'player').some(a=>a.type==='evolve'&&a.cardId==='base3-50'),false,'newly played fossil cannot evolve this turn');
 state.sides.player.turnCount++;state.turnNumber+=2;const evolve=c.legalActions(state,'player').find(a=>a.type==='evolve'&&a.cardId==='base3-50');assert.ok(evolve);c.applyAction(state,'player',evolve);
 assert.equal(state.sides.player.bench.find(s=>s.cardId==='base3-50')?.cardId,'base3-50');
});
test('Muk temporarily suppresses other Pokemon Powers; Kabuto Armor halves damage',()=>{
 const fx=req('tcgp-battle-effects.js'),{c,state}=battle();state.sides.opponent.active=c.makePokemonSlot('base3-50',0,'kabuto');state.sides.player.active=c.makePokemonSlot('base1-7',0,'hitmonchan');state.sides.player.active.energy={Fighting:3};
 const hit=()=>{const action=c.legalActions(state,'player').find(a=>a.type==='attack'&&a.attackIndex===1);assert.ok(action);c.applyAction(state,'player',action);return state.sides.opponent.active?.damage;};
 assert.equal(hit(),20,'40 damage halves to 20 through Kabuto Armor');
 const muk=c.makePokemonSlot('base3-13',0,'muk');muk.benchSlot=0;state.sides.player.bench=[muk];assert.equal(fx.abilitiesSuppressed(state,'opponent',state.sides.opponent.active,req('tcgp-battle-data.js').cardById),true);assert.equal(fx.abilitiesSuppressed(state,'player',muk,req('tcgp-battle-data.js').cardById),false);
});
test('Omanyte Clairvoyance reveals the opposing hand only while its Power works',()=>{
 const {c,state}=battle(),ui=req('tcgp-battle-ui.js'),omanyte=c.makePokemonSlot('base3-52',0,'omanyte');omanyte.benchSlot=0;state.sides.player.bench=[omanyte];
 assert.equal(ui._test.classicOpponentHandRevealed(state),true);
 omanyte.conditions.sleep=true;assert.equal(ui._test.classicOpponentHandRevealed(state),false);
 omanyte.conditions.sleep=false;const muk=c.makePokemonSlot('base3-13',0,'muk');muk.benchSlot=0;state.sides.opponent.bench=[muk];assert.equal(ui._test.classicOpponentHandRevealed(state),false);
});
test('Fossil Slowbro can use Strange Behavior more than once on its turn as printed',()=>{
 const {c,state}=battle(),slowbro=c.makePokemonSlot('base3-43',0,'slowbro'),chansey=c.makePokemonSlot('base1-3',0,'chansey');state.sides.player.active=slowbro;chansey.damage=30;chansey.benchSlot=0;state.sides.player.bench=[chansey];
 for(let n=0;n<2;n++){
  const act=c.legalActions(state,'player').find(a=>a.type==='ability'&&a.cardId==='base3-43');assert.ok(act,`Strange Behavior must be usable again (${n})`);c.applyAction(state,'player',act);
  if(state.phase==='effectChoice'){const choices=c.legalActions(state,'player');const target=choices.find(a=>a.choiceTarget==='bench');assert.ok(target);c.applyAction(state,'player',target);}
 }
 assert.equal(slowbro.damage,20);assert.equal(chansey.damage,10);
});
test('Kabuto Armor is disabled while Kabuto is asleep',()=>{
 const {c,state}=battle(),atk=c.makePokemonSlot('base1-7',0,'attacker'),kabuto=c.makePokemonSlot('base3-50',0,'kabuto');atk.energy={Fighting:3};kabuto.conditions.sleep=true;state.sides.player.active=atk;state.sides.opponent.active=kabuto;
 const attack=c.legalActions(state,'player').find(a=>a.type==='attack'&&a.attackIndex===1);assert.ok(attack);c.applyAction(state,'player',attack);
 assert.equal(kabuto.damage,40,'disabled Armor must not halve damage');
});
test('Haunter Transparency also protects it from attacks that target the Bench',()=>{
 let yes=false,no=false;for(let seed=1;seed<=24;seed++){
  const {c,state}=battle(seed),attacker=c.makePokemonSlot('base2-2',0,'electrode'),defender=c.makePokemonSlot('base1-10',0,'mewtwo'),haunter=c.makePokemonSlot('base3-6',0,'haunter');attacker.energy={Lightning:3};haunter.benchSlot=0;
  state.sides.player.active=attacker;state.sides.opponent.active=defender;state.sides.opponent.bench=[haunter];
  const attack=c.legalActions(state,'player').find(a=>a.type==='attack'&&a.attackIndex===1);assert.ok(attack);c.applyAction(state,'player',attack);
  const log=state.log.find(x=>x.reason==='fossilTransparency');assert.ok(log,'Transparency must flip for attack splash damage');
  if(log.heads){yes=true;assert.equal(haunter.damage,0);}else{no=true;assert.equal(haunter.damage,10);}
 }assert.ok(yes&&no);
});
test('Fossil generated deck labels its actual core, not a generic shared Fossil trainer',()=>{
 const c=req('tcg-classic-battle-data.js'),b=req('tcg-classic-deck-builder.js');const owned=c.CARDS.filter(x=>x.setId==='base3'&&x.battleEnabled).map(x=>({gameplayId:x.id,quantity:4}));
 const built=b.buildDeck(owned,{sets:['base3'],types:['Water'],style:'competitive'});assert.equal(built.ok,true);
 assert.doesNotMatch(built.strategy,/Mysterious Fossil core/i);
});
test('Moltres Wildfire chooses and discards exactly the paid Fire Energy count',()=>{
 const {c,state}=battle(93),moltres=c.makePokemonSlot('base3-12',0,'moltres');moltres.energy={Fire:3};state.sides.player.active=moltres;const before=state.sides.opponent.deck.length;
 const action=c.legalActions(state,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(action);c.applyAction(state,'player',action);
 assert.equal(state.phase,'effectChoice');assert.equal(state.choiceSide,'player');const choose=c.legalActions(state,'player').find(a=>a.type==='effectChoice'&&a.choiceOption===2);assert.ok(choose);c.applyAction(state,'player',choose);
 assert.equal(moltres.energy.Fire,1);assert.equal(state.sides.opponent.deck.length,before-3); // two milled plus one start-of-CPU-turn draw
 assert.ok(state.log.some(x=>x.type==='fossilWildfire'&&x.amount===2));
});
test('Mr Fuji shuffles an attached Double Colorless Energy with Benched Pokemon',()=>{
 const {c,state}=battle(76),chansey=c.makePokemonSlot('base1-3',0,'chansey');chansey.specialEnergy=[{uid:'dce-1',cardId:'base1-96'}];chansey.benchSlot=0;state.sides.player.bench=[chansey];state.sides.player.hand=[{uid:'mr-fuji',cardId:'base3-58'}];const before=state.sides.player.deck.length;
 const action=c.legalActions(state,'player').find(a=>a.type==='trainer'&&a.cardId==='base3-58');assert.ok(action);c.applyAction(state,'player',action);
 assert.equal(state.sides.player.bench.length,0);assert.equal(state.sides.player.deck.length,before+2);assert.ok(state.sides.player.deck.some(ref=>ref.cardId==='base1-96'));
});
