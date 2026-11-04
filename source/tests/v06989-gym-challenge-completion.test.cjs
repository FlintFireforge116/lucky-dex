'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../app/src/main/assets'),G=require(path.join(root,'tcg-classic-gym-challenge.js')),F=require(path.join(root,'tcgp-battle-effects.js'));
test('every non-Basic Energy Gym Challenge print has functional battle definitions',()=>{
 const all=G.CARDS.filter(c=>!c.basicEnergy);assert.equal(all.length,126);
 assert.deepEqual(all.filter(c=>!c.battleEnabled).map(c=>`${c.id}: ${c.support.reasons.join(', ')}`),[]);
 for(const c of all){if(c.kind==='pokemon'){
 assert.ok(c.attacks.length,`${c.id} missing attacks`);
 for(const a of c.attacks)assert.ok(F.supportsEffect(a.effect),`${c.id} ${a.name} unsupported`);
 }else assert.ok(F.supportsEffect(c.effect),`${c.id} trainer unsupported`);}
});
const Core=require(path.join(root,'tcgp-battle-core.js')),D=require(path.join(root,'tcg-classic-decks.js'));
function game(seed=901){const s=Core.createBattle({format:'classic',playerDeck:D.LOANER_DECK,opponentDeck:D.LOANER_DECK,seed,playerEnergyTypes:['Psychic','Water'],opponentEnergyTypes:['Grass','Fighting']});s.phase='battle';s.activeSide='player';s.turnNumber=8;s.sides.player.turnCount=4;s.sides.opponent.turnCount=4;return s;}
test('Gaseous Form adds HP per Psychic energy',()=>{const s=game();s.sides.player.active=Core.makePokemonSlot('gym2-97',1,'gastly');s.sides.player.active.energy={Psychic:2};assert.equal(Core.maxHp(s,'player',s.sides.player.active),60);});
test('Hyper Needle cannot repeat even after switching to Bench',()=>{const s=game();s.sides.player.active=Core.makePokemonSlot('gym2-9',1,'beedrill');s.sides.player.active.energy={Grass:5};s.sides.opponent.active=Core.makePokemonSlot('gym2-72',1,'enemy');const action=Core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===1);assert.ok(action);Core.applyAction(s,'player',action);s.activeSide='player';s.turnNumber+=2;s.sides.player.attackUsed=false;assert.equal(Core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===1).length,0);});
test('Psylink includes allied Psychic moves from other Pokémon',()=>{const s=game();s.sides.player.active=Core.makePokemonSlot('gym2-16',1,'ally');s.sides.player.active.energy={Psychic:6,Colorless:4};const p=Core.makePokemonSlot('gym2-14',1,'rocket-mewtwo');p.benchSlot=0;s.sides.player.bench=[p];s.sides.opponent.active=Core.makePokemonSlot('gym2-72',1,'enemy');assert.ok(Core.legalActions(s,'player').some(a=>a.type==='attack'&&a.attackCardId==='gym2-14'&&a.attackIndex===2),'Psylink should borrow Psyburn');});
