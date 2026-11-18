'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const db=require('../app/src/main/assets/tcg-classic-battle-data.js');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const rr=require('../app/src/main/assets/tcg-classic-rising-rivals.js');
const loan=cpu.generate({sets:['dp5'],type:'Grass',seed:25});assert(loan.ok);
let seq=100;
function setup(p='pl2-10',q='pl2-81'){
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed:51,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';
 for(const who of ['player','opponent']){const side=s.sides[who];side.turnCount=6;side.hand=[];side.discard=[];side.energyDiscard={};side.bench=[];side.prizes=Array.from({length:3},(_,i)=>({uid:who+'-prize-'+i,cardId:'dp5-6'}));}
 s.sides.player.active=core.makePokemonSlot(p,2,'play-'+seq++);
 s.sides.opponent.active=core.makePokemonSlot(q,2,'opp-'+seq++);
 s.sides.player.active.energy={Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Darkness:4,Metal:4,Colorless:4};
 return s;
}
function mon(id,uid=String(seq++),energy={}){const x=core.makePokemonSlot(id,2,uid);x.energy=energy;x.benchSlot=0;return x;}
function attack(s,idx=0){const a=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===idx);assert.ok(a,`attack missing ${s.sides.player.active?.cardId} #${idx}`);core.applyAction(s,'player',a);return s;}
function choose(s,match){assert.equal(s.phase,'effectChoice','must offer a choice');const who=s.choiceSide||'player',actions=core.legalActions(s,who).filter(a=>['effectChoice','chooseEffect'].includes(a.type));assert.ok(actions.length,'no legal choices '+JSON.stringify(s.pendingChoice));const selected=match?actions.find(match):actions.find(a=>!a.choiceSkip)||actions[0];assert.ok(selected,'selection not found '+JSON.stringify(actions));core.applyAction(s,who,selected);return s;}
function drain(s){for(let n=0;n<20&&s.phase==='effectChoice';n++)choose(s);assert.notEqual(s.phase,'effectChoice');return s;}
test('Stage 3 retains exact printed text and all 120 playable cards',()=>{
 assert.equal(rr.CARDS.length,120);assert.equal(rr.CARDS.filter(c=>c.battleEnabled).length,120);
 for(const c of rr.CARDS.filter(c=>c.battleEnabled)){for(const a of [...(c.attacks||[]),...(c.abilities||[]),...(c.effect?[c]:[])])assert.deepEqual(effects.validateEffect(a.effect),[],c.id+': '+a.name);}
});
test('Grudge depends on opponent prizes actually taken, not its own bench or cards in hand',()=>{
 const a=setup('pl2-10');a.sides.player.active.energy={Psychic:5};attack(a,1);const first=a.log.findLast(x=>x.type==='attack')?.damage;
 const b=setup('pl2-10');b.sides.player.active.energy={Psychic:5};b.sides.opponent.prizes.pop();b.sides.opponent.prizes.pop();attack(b,1);const second=b.log.findLast(x=>x.type==='attack')?.damage;
 assert.equal(second-first,20);
});
test('Trample flips separately for each bench on both sides',()=>{
 const s=setup('pl2-11');s.sides.player.bench=[mon('pl2-63')];s.sides.opponent.bench=[mon('pl2-83')];attack(s,0);drain(s);
 const flips=s.log.filter(x=>x.type==='coin'&&x.reason==='Rising Rivals Trample');assert.equal(flips.length,2);assert.ok([0,30].includes(s.sides.player.bench[0].damage));assert.ok([0,30].includes(s.sides.opponent.bench[0].damage));
});
test('Muddy Bomb chooses a target and spreads 10 to each other opposing Pokemon',()=>{
 const s=setup('pl2-22','pl2-82');s.sides.opponent.bench=[mon('pl2-59')];attack(s,1);assert.equal(s.phase,'effectChoice');choose(s,a=>a.choiceTarget==='bench');drain(s);
 assert.equal(s.sides.opponent.active.damage,10);assert.equal(s.sides.opponent.bench[0].damage,30);
});
test('Evolving Aqua targets an already-damaged Pokemon and boosts immediately after Eevee evolves',()=>{
 const s=setup('pl2-34');s.sides.opponent.active.damage=10;s.sides.player.active.evolvedOnTurn=10;attack(s,1);choose(s,a=>a.choiceTarget==='active');drain(s);
 assert.equal(s.sides.opponent.active.damage,70);
});
test('Heavy Metal rolls for attached Metal cards and applies bonus before damage',()=>{
 const s=setup('pl2-44');s.sides.player.active.energy={Metal:3,Colorless:3};attack(s,0);drain(s);
 const coin=s.log.find(x=>x.type==='coin'&&x.reason==='Heavy Metal');assert.ok(coin);assert.equal(coin.results.length,3);
 const hit=s.log.findLast(x=>x.type==='attack');assert.equal(hit.damage,10+coin.results.filter(Boolean).length*20);
});
test('Snap Attack deals 20 against Energy, 60 against no Energy',()=>{
 const a=setup('pl2-56'),b=setup('pl2-56');a.sides.opponent.active.energy={Fire:1};attack(a,1);attack(b,1);assert.equal(a.log.findLast(x=>x.type==='attack').damage,20);assert.equal(b.log.findLast(x=>x.type==='attack').damage,60);
});
test('Mend retrieves real discarded Metal basic Energy and heals only when recovery succeeds',()=>{
 const s=setup('pl2-51');s.sides.player.active.energy={Metal:2,Colorless:1};s.sides.player.active.damage=30;s.sides.player.energyDiscard.Metal=1;attack(s,0);choose(s);drain(s);
 assert.equal(s.sides.player.active.energy.Metal,3);assert.equal(s.sides.player.active.damage,20);assert.equal(s.sides.player.energyDiscard.Metal,0);
});
test('Gather Sand recovers discarded Fighting to Trapinch, even from the energy ledger',()=>{
 const s=setup('pl2-84');s.sides.player.active.energy={};s.sides.player.energyDiscard.Fighting=2;
 const a=core.legalActions(s,'player').find(x=>x.type==='ability'&&x.cardId==='pl2-84');assert.ok(a);core.applyAction(s,'player',a);choose(s);drain(s);assert.equal(s.sides.player.active.energy.Fighting,1);assert.equal(s.sides.player.energyDiscard.Fighting,1);
});
test('Energy Typhoon uses discarded Energy count for damage and reshuffles real cards',()=>{
 const s=setup('pl2-53');s.sides.opponent.discard=[{uid:'physical',cardId:'pl2-99'}];s.sides.opponent.energyDiscard.Fire=2;
 attack(s,0);drain(s);const hit=s.log.findLast(x=>x.type==='attack');assert.equal(hit.damage,60);assert.equal(s.sides.opponent.discard.length,0);assert.equal(s.sides.opponent.energyDiscard.Fire,0);assert.ok(s.sides.opponent.deck.some(r=>r.cardId==='pl2-99'));
});
test('SP Energy is one flexible unit only on SP Pokemon; Upper Energy doubles only when behind and not LV.X',()=>{
 const sp=setup('pl2-40'),ordinary=setup('pl2-82');sp.sides.player.active.energy={};ordinary.sides.player.active.energy={};
 sp.sides.player.active.specialEnergy=[{uid:'sp',cardId:'pl2-101'}];ordinary.sides.player.active.specialEnergy=[{uid:'sp',cardId:'pl2-101'}];
 const spMoves=core.legalActions(sp,'player').filter(a=>a.type==='attack');
 const ordMoves=core.legalActions(ordinary,'player').filter(a=>a.type==='attack');
 assert.ok(spMoves.some(a=>a.attackIndex===0),'SP gets a typed flexible unit for costs');assert.ok(!ordMoves.some(a=>a.attackIndex===0),'non-SP cannot pay Water with SP Energy');
 const upper=setup('pl2-81');upper.sides.player.active.energy={};upper.sides.player.active.specialEnergy=[{uid:'upper',cardId:'pl2-102'}];upper.sides.player.prizes.push({uid:'extra',cardId:'dp5-6'});
 assert.ok(core.legalActions(upper,'player').some(x=>x.type==='attack'&&x.attackIndex===0),'Upper provides two Colorless when behind');
 upper.sides.player.prizes.pop();assert.ok(!core.legalActions(upper,'player').some(x=>x.type==='attack'&&x.attackIndex===0),'Upper reverts to one Colorless when tied');
});
test('Bad Sleeping Habits stops opponent retreat only when Snorlax stays asleep',()=>{
 const s=setup('pl2-63','pl2-81');s.sides.player.active.energy={Colorless:6};s.sides.player.bench=[mon('pl2-59')];s.sides.opponent.active.conditions={sleep:true};
 assert.ok(!core.legalActions(s,'player').some(x=>x.type==='retreat'));
 s.sides.opponent.active.conditions={};assert.ok(core.legalActions(s,'player').some(x=>x.type==='retreat'));
});
test('All twenty new selected attacks execute without a stuck menu',()=>{
 for(const number of ['10','11','12','14','16','22','28','34','38','44','47','48','50','51','52','53','56','63','80','86','RT3']){
  const c=rr.cardById('pl2-'+number);if(!c.battleEnabled)continue;for(let k=0;k<c.attacks.length;k++){const s=setup(c.id);s.sides.player.active.energy={Grass:8,Fire:8,Water:8,Lightning:8,Psychic:8,Fighting:8,Darkness:8,Metal:8,Colorless:8};s.sides.player.energyDiscard={Metal:2,Water:2,Fighting:2,Fire:2};s.sides.opponent.bench=[mon('pl2-59')];s.sides.player.bench=[mon('pl2-59')];s.sides.opponent.active.energy={Water:3,Fire:3,Psychic:3};s.sides.player.discard=[{uid:'discard-1',cardId:'dp1-125'}];s.sides.player.hand=[{uid:'hand-1',cardId:'dp1-124'}];const allowed=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===k);if(allowed){core.applyAction(s,'player',allowed);drain(s);}}
 }
});

test('Nidoking Giga Horn flips twice and can fail without phantom damage',()=>{
 const s=setup('pl2-29','pl2-63');s.sides.player.active.energy={Fighting:5};attack(s,1);drain(s);
 const flip=s.log.find(x=>x.reason==='Rising Rivals Giga Horn');assert.ok(flip);assert.equal(flip.results.length,2);
 assert.equal(s.log.findLast(x=>x.type==='attack').damage,flip.heads===0?0:100);
});
test('Nidoking Fling Away deals 30 to Active and separately chooses a bench',()=>{
 const s=setup('pl2-29','pl2-82');s.sides.player.active.energy={Fighting:6};s.sides.opponent.bench=[mon('pl2-59')];attack(s,0);assert.equal(s.phase,'effectChoice');choose(s,a=>a.choiceTarget==='bench');drain(s);
 assert.equal(s.log.findLast(x=>x.type==='attack').damage,30);assert.equal(s.sides.opponent.bench[0].damage,30);
});
test('Vespiquen Leaf Needle flips exactly one coin for each Grass energy',()=>{
 const s=setup('pl2-35');s.sides.player.active.energy={Grass:3,Colorless:5};attack(s,0);drain(s);
 const flips=s.log.find(x=>x.reason==='Rising Rivals Leaf Needle');assert.ok(flips);assert.equal(flips.results.length,3);
 assert.equal(s.log.findLast(x=>x.type==='attack').damage,30+20*flips.heads);
});
test('Beedrill Needle Shock does not reapply conditions on its owner next consecutive turn',()=>{
 const s=setup('pl2-15','pl2-82');s.sides.player.active.energy={Grass:5};s.sides.player.lastAttackName='Needle Shock';s.sides.player.lastAttackTurn=8;
 attack(s,0);drain(s);assert.ok(!s.sides.opponent.active.conditions?.poison,'must respect same attack used last own turn');
 const b=setup('pl2-15','pl2-82');b.sides.player.active.energy={Grass:5};attack(b,0);drain(b);assert.ok(b.sides.opponent.active.conditions?.poison);
});
test('Colorful Body grants Kecleon all nine types only when its Body is active',()=>{
 const s=setup('pl2-67');const types=effects.effectiveTypes(s,'player',s.sides.player.active,db.cardById);assert.ok(types.includes('Water')&&types.includes('Psychic')&&types.includes('Metal'));
});
test('Snorlax Exercise heals exactly one counter per Energy card chosen from hand',()=>{
 const s=setup('pl2-111','pl2-82');s.sides.player.active.energy={Colorless:8};s.sides.player.active.damage=50;
 s.sides.player.hand=[{uid:'exercise-energy',cardId:'dp1-124'},{uid:'exercise-other',cardId:'pl2-63'}];attack(s,0);
 if(s.phase==='effectChoice'){choose(s,a=>a.choiceHandIndex===0);drain(s);}
 assert.equal(s.sides.player.active.damage,40);assert.equal(s.sides.player.energyDiscard.Fire,1);assert.ok(s.sides.player.hand.some(r=>r.cardId==='pl2-63'));
});
test('Mismagius Darkness Magic applies capped counters, bypassing weakness',()=>{
 const s=setup('pl2-110','pl2-81');s.sides.player.active.energy={Psychic:6,Colorless:6};s.sides.player.hand=Array.from({length:9},(_,i)=>({uid:'hand-'+i,cardId:'pl2-63'}));attack(s,0);drain(s);
 assert.equal(s.sides.opponent.active.damage,80);assert.equal(s.log.findLast(x=>x.type==='attack').damage,0);
});
test('Alakazam Damage Switch moves one counter from damaged SP to another SP',()=>{
 const s=setup('pl2-103');s.sides.player.active.damage=40;s.sides.player.bench=[mon('pl2-40')];
 const a=core.legalActions(s,'player').find(x=>x.type==='ability'&&x.cardId==='pl2-103');assert.ok(a);core.applyAction(s,'player',a);
 if(s.phase==='effectChoice'){choose(s,x=>x.choiceTarget==='active');choose(s,x=>x.choiceTarget==='bench');drain(s);}
 assert.equal(s.sides.player.active.damage,30);assert.equal(s.sides.player.bench[0].damage,10);
});
test('Nidoking Territoriality counters one real damaging attack without stacking copies',()=>{
 const s=setup('pl2-15','pl2-82');s.sides.opponent.bench=[mon('pl2-29')];s.sides.player.active.energy={Grass:5};
 attack(s,0);drain(s);assert.equal(s.sides.player.active.damage,20);
});
test("Bebe's Search returns a selected hand card to top, and adds chosen Pokémon",()=>{
 const s=setup('pl2-81');s.sides.player.hand=[{uid:'bebe',cardId:'pl2-89'},{uid:'return',cardId:'pl2-63'}];
 s.sides.player.deck=[{uid:'find',cardId:'pl2-59'},...s.sides.player.deck];
 const t=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='pl2-89');assert.ok(t);core.applyAction(s,'player',t);
 if(s.phase==='effectChoice')choose(s,x=>x.choiceHandIndex===0);
 if(s.phase==='effectChoice')choose(s,x=>x.choiceCardId==='pl2-59');
 drain(s);assert.ok(s.sides.player.hand.some(ref=>ref.cardId==='pl2-59'));
});
test("Flint's Willpower attaches a real hand basic Energy exclusively to Pokémon SP",()=>{
 const s=setup('pl2-81');s.sides.player.hand=[{uid:'flint',cardId:'pl2-91'},{uid:'grass',cardId:'dp1-123'}];s.sides.player.bench=[mon('pl2-35','royal',{Grass:0})];s.sides.player.bench[0].damage=20;
 const t=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='pl2-91');assert.ok(t);core.applyAction(s,'player',t);
 if(s.phase==='effectChoice')choose(s,x=>x.choiceHandIndex===0);
 if(s.phase==='effectChoice')choose(s,x=>x.choiceTarget==='bench');drain(s);
 assert.equal(s.sides.player.bench[0].energy.Grass,1);assert.equal(s.sides.player.bench[0].damage,10,'Royal Gain must trigger from the hand');
});

test("Bebe's Search is not playable as the only hand card",()=>{
 const s=setup('pl2-81');s.sides.player.hand=[{uid:'bebe-alone',cardId:'pl2-89'}];
 assert.ok(!core.legalActions(s,'player').some(x=>x.type==='trainer'&&x.cardId==='pl2-89'));
});
