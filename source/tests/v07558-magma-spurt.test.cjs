'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const ai=require('../app/src/main/assets/tcgp-battle-ai.js');
const attack=data.cardById('ex4-10').attacks[1];
function setup(side,supply){
 const s=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:41,firstSide:side,playerEnergyTypes:['Fire','Fighting'],opponentEnergyTypes:['Fire','Fighting']});
 s.phase='battle';s.activeSide=side;s.turnNumber=9;const foeSide=side==='player'?'opponent':'player',us=s.sides[side],foe=s.sides[foeSide];
 us.active=core.makePokemonSlot('ex4-10',2,'hound');us.active.energy={Fire:1,Colorless:2};foe.active=core.makePokemonSlot('ex4-95',2,'target');
 us.energySupply=[...supply];us.nextEnergyType=supply[0]||null;us.energyType='Fire';us.energyAvailable=true;us.energyUsed=false;us.energyDiscard={Fire:2};us.turnCount=5;foe.turnCount=4;
 return {s,us,foe,foeSide};
}
for(const side of ['player','opponent']){
 for(const [label,supply,flips,spent,damage] of [
 ['all heads',['Fire','Fighting','Water','Fire','Psychic','Fighting'],[1,1,1,1,1],['Fire','Fighting','Water','Fire','Psychic'],90],
 ['mixed flips',['Water','Fire','Fighting','Fire'],[0,1,0,1,1],['Water','Fire','Fighting'],60],
 ['all tails',['Fire','Fighting'],[0,0,0,0,0],[],0],
 ['short supply',['Fighting','Fire'],[1,1,1,1,1],['Fighting','Fire'],60],
 ['empty supply',[],[1,1,1,1,1],[],0],
 ['maximum',['Fire','Fire','Fighting','Fire','Fighting'],[1,1,1,1,1],['Fire','Fire','Fighting','Fire','Fighting'],150],
 ['wrong types',['Water','Grass','Metal','Water','Psychic'],[1,1,1,1,1],['Water','Grass','Metal','Water','Psychic'],0]
 ])test(`${side}: ${label}`,()=>{
  const {s,us,foe,foeSide}=setup(side,supply);const deck=structuredClone(us.deck),discard=structuredClone(us.discard);let i=0;
  const result=fx.resolveAttack(attack,{state:s,side,foeSide,attacker:us.active,defender:foe.active,cardById:data.cardById,isAttack:true,random:()=>flips[i++]?0.1:0.9,action:{}});
  assert.equal(i,5);assert.equal(result.damage,damage);assert.equal(result.pendingEffects.length,0);assert.deepEqual(us.energySupply,supply.slice(spent.length));assert.equal(us.nextEnergyType,us.energySupply[0]||null);
  const ledger={Fire:2};for(const t of spent)ledger[t]=(ledger[t]||0)+1;assert.deepEqual(us.energyDiscard,ledger);assert.deepEqual(us.deck,deck);assert.deepEqual(us.discard,discard);assert.equal(us.energyType,'Fire');assert.equal(us.energyAvailable,true);assert.equal(us.energyUsed,false);assert.deepEqual(us.active.energy,{Fire:1,Colorless:2});
  assert.deepEqual(s.log.find(x=>x.type==='coin'&&x.reason==='Magma Spurt').results,flips.map(Boolean));
 });
 test(`${side}: legal attack resolves once through battle engine`,()=>{
  const {s,us,foe}=setup(side,['Fire','Fighting','Water','Fire','Fighting','Fire']);const deck=structuredClone(us.deck);const original=s.rngState;
  const preview=core.attackDamagePreview(s,side,1);assert.equal(preview.text,'0–150');assert.equal(s.rngState,original);assert.equal(us.energySupply.length,6);
  const action=core.legalActions(s,side).find(x=>x.type==='attack'&&x.attackIndex===1);assert.ok(action);
  core.applyAction(s,side,action);const event=s.log.find(x=>x.type==='ex4MagmaSpurt');assert.ok(event);assert.equal(s.log.filter(x=>x.type==='ex4MagmaSpurt').length,1);assert.deepEqual(us.deck,deck);assert.equal(foe.active.damage,event.damage);assert.equal(us.energySupply.length,6-event.discarded.length);
 });
 test(`${side}: CPU evaluator accounts for probabilistic attack without mutating supply`,()=>{
  const {s,us}=setup(side,['Fire','Fighting','Fire','Fighting','Fire']);const before=structuredClone(s);assert.equal(ai._test.matchupDamage(s,side,us.active,attack,1,'ex4-10'),75);assert.deepEqual(s,before);
 });
}
test('original printed card preserved and battle explanation explicitly adapted',()=>{assert.match(attack.text,/Discard the top 5 cards from your deck/);const ui=fs.readFileSync(require.resolve('../app/src/main/assets/tcgp-battle-ui.js'),'utf8');assert.match(ui,/LuckyDex hybrid rule: Flip 5 coins/);});
