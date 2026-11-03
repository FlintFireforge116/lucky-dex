'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const cards=()=>require(path.join(assets,'tcg-classic-battle-data.js'));
const ws=()=>require(path.join(assets,'tcg-classic-deck-workspace.js'));
const builder=()=>require(path.join(assets,'tcg-classic-deck-builder.js'));
const core=()=>require(path.join(assets,'tcgp-battle-core.js'));
test('Jungle has 64 distinct printable identities and Base Set remains available',()=>{
 const c=cards();assert.equal(c.CARDS.filter(x=>x.setId==='base2').length,64);assert.equal(c.CARDS.filter(x=>x.setId==='base1').length,102);
 assert.equal(c.cardById('base2-10').name,'Scyther');assert.equal(c.cardById('base2-26').name,'Scyther');assert.equal(c.cardById('base2-64').name,'Poké Ball');
});
test('physical Jungle JU cards map to separate collection identities',()=>{
 const c=cards();let rows=c.projectOwnedCards([{id:'JU-10',source:'tcg',setId:'library:JU',number:'10',count:3},{id:'JU-26',source:'tcg',setId:'library:JU',number:'26',count:2},{id:'BS-44',source:'tcg',setId:'library:BS',number:'44',count:3}]);
 assert.equal(rows.find(r=>r.gameplayId==='base2-10').quantity,3);assert.equal(rows.find(r=>r.gameplayId==='base2-26').quantity,2);assert.equal(rows.find(r=>r.gameplayId==='base1-44').quantity,3);
 assert.equal(ws().catalogue(rows).find(r=>r.gameplayId==='base2-10').quantity,3);
});
test('holo and non-holo share a four-copy name limit',()=>{
 const c=cards();const deck=[...Array(3).fill('base2-10'),...Array(2).fill('base2-26'),...Array(25).fill('base1-7')];
 assert.match(c.validateDeck(deck).errors.join(' '),/Scyther exceeds the four-copy limit/i);
});
test('Jungle evolution lines can use Basic Pokemon from earlier sets',()=>{
 const c=cards(),b=builder();const pool=c.CARDS.filter(x=>x.kind==='pokemon'&&x.battleEnabled);
 assert.deepEqual(b.familyLine(c.cardById('base2-44'),pool).map(x=>x.name),['Ponyta','Rapidash']);
 assert.deepEqual(b.familyLine(c.cardById('base2-7'),pool).map(x=>x.name),['Nidoran ♀','Nidorina','Nidoqueen']);
 assert.deepEqual(b.familyLine(c.cardById('base2-3'),pool).map(x=>x.name),['Eevee','Flareon']);
});
test('owned mixed set cards can produce valid Classic battle decks',()=>{
 const c=cards(),b=builder(),owned=c.CARDS.filter(x=>x.deckEligible!==false&&x.battleEnabled).map(x=>({gameplayId:x.id,quantity:4}));
 const result=b.buildDeck(owned,{style:'competitive',types:['Grass'],focusCardId:'base2-10'});
 assert.equal(result.ok,true,result.errors?.join('; '));assert.equal(result.cards.length,30);assert.equal(c.validateDeck(result.cards).ok,true);assert.ok(result.cards.includes('base2-10'));assert.ok(core().createBattle({format:'classic',playerDeck:result.cards,opponentDeck:result.cards,playerEnergyTypes:result.energyTypes,opponentEnergyTypes:result.energyTypes,seed:74}));
});
test('Jungle unusual printed effects have supported battle mechanics',()=>{
 const c=cards(),fx=require(path.join(assets,'tcgp-battle-effects.js'));
 for(const id of ['base2-2','base2-8','base2-18','base2-24'])assert.equal(c.cardById(id).battleEnabled,true,`${id} must not remain a disabled placeholder`);
 for(const id of ['base2-6','base2-11','base2-13','base2-15','base2-55'])assert.equal(c.cardById(id).battleEnabled,true,`${id} Pokémon Power must be playable`);
 assert.equal(fx.supportsEffect(c.cardById('base2-8').attacks[1].effect),true);
});
test('Jungle Coin attacks and healing can describe their true effects',()=>{
 const c=cards(),fx=require(path.join(assets,'tcgp-battle-effects.js'));
 assert.equal(c.cardById('base2-33').attacks[1].effect.fraction,0.5);
 assert.equal(c.cardById('base2-51').attacks[0].effect.heads.type,'lock');
 assert.equal(c.cardById('base2-55').abilities[0].effect.type,'peek');
});
test('Mr. Mime Invisible Wall blocks 40 but not 20 damage',()=>{
 const d=require(path.join(assets,'tcg-classic-decks.js'));
 function hit(attackName){const s=core().createBattle({format:'classic',playerDeck:d.LOANER_DECK.slice(),opponentDeck:d.LOANER_DECK.slice(),playerEnergyTypes:['Fighting'],opponentEnergyTypes:['Psychic'],seed:997});s.phase='battle';s.turnNumber=3;s.activeSide='player';s.sides.player.turnCount=2;
  const atk=core().makePokemonSlot('base1-7',0,'hitmonchan'),def=core().makePokemonSlot('base2-6',0,'mr-mime');atk.energy={Fighting:3};s.sides.player.active=atk;s.sides.opponent.active=def;
  const action=core().legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===cards().cardById('base1-7').attacks.findIndex(x=>x.name===attackName));assert.ok(action,`missing ${attackName}`);core().applyAction(s,'player',action);return def.damage;}
 assert.equal(hit('Jab'),20);assert.equal(hit('Special Punch'),0);
});
test('Jungle Electrode Chain Lightning hits matching benches on both sides',()=>{
 const d=require(path.join(assets,'tcg-classic-decks.js'));
 const s=core().createBattle({format:'classic',playerDeck:d.LOANER_DECK.slice(),opponentDeck:d.LOANER_DECK.slice(),playerEnergyTypes:['Lightning'],opponentEnergyTypes:['Grass'],seed:965});s.phase='battle';s.turnNumber=3;s.activeSide='player';s.sides.player.turnCount=2;
 s.sides.player.active=core().makePokemonSlot('base2-2',0,'electrode');s.sides.player.active.energy={Lightning:3};s.sides.player.bench=[core().makePokemonSlot('base2-10',0,'scyther')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.active=core().makePokemonSlot('base1-44',0,'bulbasaur');s.sides.opponent.bench=[core().makePokemonSlot('base2-9',0,'pinsir')];s.sides.opponent.bench[0].benchSlot=0;
 const action=core().legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===1);assert.ok(action);core().applyAction(s,'player',action);
 assert.equal(s.sides.player.bench[0].damage,10);assert.equal(s.sides.opponent.bench[0].damage,10);
});
test('Jungle Pidgeot Hurricane returns a surviving opponent and promotes its bench',()=>{
 const d=require(path.join(assets,'tcg-classic-decks.js'));
 const s=core().createBattle({format:'classic',playerDeck:d.LOANER_DECK.slice(),opponentDeck:d.LOANER_DECK.slice(),playerEnergyTypes:['Grass'],opponentEnergyTypes:['Fire'],seed:221});s.phase='battle';s.turnNumber=3;s.activeSide='player';s.sides.player.turnCount=2;
 s.sides.player.active=core().makePokemonSlot('base2-8',0,'pidgeot');s.sides.player.active.energy={Grass:3};s.sides.opponent.active=core().makePokemonSlot('base1-28',0,'growlithe');s.sides.opponent.bench=[core().makePokemonSlot('base1-60',0,'ponyta')];s.sides.opponent.bench[0].benchSlot=0;
 const action=core().legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===1);assert.ok(action);core().applyAction(s,'player',action);
 assert.ok(s.sides.opponent.hand.some(r=>r.cardId==='base1-28'),'survivor should return to hand');assert.equal(s.phase,'promote');assert.equal(s.promotionSide,'opponent');
});
test('generated Jungle opponents can finish matches without ability deadlocks',()=>{
 const ai=require(path.join(assets,'tcgp-battle-ai.js')), opp=require(path.join(assets,'tcg-classic-opponents.js')), decks=require(path.join(assets,'tcg-classic-decks.js'));
 for(let seed of [104,215,326,437,548,659]){const r=opp.generate({seed,excludeTypes:[]});assert.ok(r.ok);let s=core().createBattle({format:'classic',playerDeck:decks.LOANER_DECK.slice(),opponentDeck:r.cards,playerEnergyTypes:['Fighting','Fire'],opponentEnergyTypes:r.energyTypes,firstSide:'opponent',seed});let steps=0;
 while(s.phase!=='finished'&&steps<750){const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.phase==='setup'?s.setupSide:s.activeSide;const action=ai.chooseAction(s,side,'Beginner',steps);assert.ok(action,`no action ${r.type}: turn ${s.turnNumber}, phase ${s.phase}, step ${steps}`);core().applyAction(s,side,action);steps++;}
 assert.equal(s.phase,'finished',`stuck ${r.type} seed=${seed} turn=${s.turnNumber} phase=${s.phase} steps=${steps}`);
 }
});
test('competitive Jungle Nidoqueen considers the explicitly named Nidoking synergy',()=>{
 const c=cards(),b=builder(),owned=c.CARDS.filter(x=>x.battleEnabled&&x.deckEligible!==false).map(x=>({gameplayId:x.id,quantity:4}));
 const deck=b.buildDeck(owned,{style:'competitive',focusCardId:'base2-7',types:['Grass']});
 assert.equal(deck.ok,true,deck.errors?.join(';'));assert.ok(deck.cards.includes('base2-7'));
 for(const id of ['base1-11','base1-37','base1-55'])assert.ok(deck.cards.includes(id),`missing ${c.cardById(id)?.name} that powers Boyfriends`);
});
