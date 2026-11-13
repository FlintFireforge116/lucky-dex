'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const ROOT='../app/src/main/assets/';
const mt=require(ROOT+'tcg-classic-mysterious-treasures'),dp=require(ROOT+'tcg-classic-diamond-pearl'),core=require(ROOT+'tcgp-battle-core'),opp=require(ROOT+'tcg-classic-opponents'),fx=require(ROOT+'tcgp-battle-effects');
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const sample=opp.generate({sets:['dp1'],type:'Grass',seed:17});
function slot(id,uid,energy){const p=core.makePokemonSlot(id,3,uid);p.energy=energy??{Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Darkness:4,Metal:4};return p;}
function field(me='dp2-6',foe='dp1-17'){
 const s=core.createBattle({format:'classic',playerDeck:sample.cards,opponentDeck:sample.cards,seed:42,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';s.sides.player.turnCount=8;s.sides.opponent.turnCount=8;
 s.sides.player.active=slot(me,'player-active');s.sides.opponent.active=slot(foe,'opponent-active');
 s.sides.player.bench=[slot('dp1-94','player-bench',{Grass:1,Lightning:1})];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.bench=[slot('dp1-94','opponent-bench',{Lightning:1})];s.sides.opponent.bench[0].benchSlot=0;
 return s;
}
function resolve(s,picker){for(let n=0;n<40&&s.phase==='effectChoice';n++){
 const acts=core.legalActions(s,s.choiceSide).filter(x=>x.type==='effectChoice');assert.ok(acts.length,'No continuation '+n);
 const a=picker?.(acts,s,n)||acts[0];assert.ok(a);core.applyAction(s,s.choiceSide,a);
 }assert.notEqual(s.phase,'effectChoice','Choice never finished');}
function attack(s,i,pick){const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===i&&x.attackCardId===s.sides.player.active.cardId);assert.ok(a,`Missing attack ${s.sides.player.active.cardId}#${i}`);core.applyAction(s,'player',a);resolve(s,pick);return s;}
function power(s,id,pick){const a=core.legalActions(s,'player').find(x=>x.type==='ability'&&x.cardId===id);assert.ok(a,'Missing power '+id);core.applyAction(s,'player',a);resolve(s,pick);return s;}
const attackLog=s=>s.log.filter(x=>x.type==='attack').at(-1);

test('Stage 3 catalogue and effects are fully supported, other prints remain gated',()=>{
 assert.equal(mt.CARDS.length,124);assert.equal(mt.coverage().battleEnabled,106);
 for(const c of mt.CARDS.filter(c=>c.battleEnabled))for(const a of [...(c.attacks||[]),...(c.abilities||[])])assert.deepEqual(fx.validateEffect(a.effect),[],`${c.id} ${a.name}`);
 for(const n of [2,3,4,10,18,21,23,26,30,36,37,39,43,65,67,115,116,117])assert.equal(mt.cardById('dp2-'+n).battleEnabled,false,n);
});

test('Bronzong Shady Stamp Confuses and Miracle Oracle draws then discards a chosen non-Energy',()=>{
 const s=field('dp2-6');attack(s,0);assert.ok(s.sides.opponent.active.conditions?.confusion);
 const t=field('dp2-6');t.sides.player.hand=[{uid:'non-energy',cardId:'dp2-73'}];const before=t.sides.player.deck.length;
 power(t,'dp2-6',a=>a.find(x=>x.choiceHandIndex===0)||a[0]);
 assert.ok(t.sides.player.discard.some(ref=>ref.uid==='non-energy'));
 assert.equal(t.sides.player.deck.length,before-1);
});
test('Bronzong Miracle Oracle gives an extra draw if the discarded card is Energy',()=>{
 const s=field('dp2-6');s.sides.player.hand=[{uid:'spec',cardId:'dp2-118'}];const before=s.sides.player.deck.length;
 power(s,'dp2-6',a=>a.find(x=>x.choiceHandIndex===0)||a[0]);
 assert.ok(s.sides.player.discard.some(x=>x.uid==='spec'));
 assert.equal(s.sides.player.deck.length,before-2);
});
test('Blissey Happy Chance attaches its selected discarded Basic Energy before damage',()=>{
 const s=field('dp2-5');s.sides.player.active.energy={Colorless:1};s.sides.player.energyDiscard={Water:1};
 const choices=core.legalActions(s,'player').filter(x=>x.type==='attack'&&x.attackIndex===0);
 assert.ok(choices.some(x=>x.effectSelection==='zone:Water'),'printed option');
 const a=choices.find(x=>x.effectSelection==='zone:Water');core.applyAction(s,'player',a);resolve(s);
 assert.equal(s.sides.player.active.energy.Water,1);assert.equal(s.sides.player.energyDiscard.Water,0);
 assert.equal(attackLog(s).damage,40,'20 + 10 per two attached Energy');
});
test('Lumineon Reverse Stream returns Basic Water to hand while preserving non-Water Energy',()=>{
 const s=field('dp2-11');s.sides.player.active.energy={Water:3,Fire:1};s.sides.opponent.active.damage=0;
 s.sides.player.hand=[];const before=s.sides.player.hand.length;
 attack(s,0);assert.equal(attackLog(s).damage,60);assert.equal(s.sides.player.active.energy.Water,0);
 assert.equal(s.sides.player.active.energy.Fire,1);assert.equal(s.sides.player.hand.length,before+3);
 assert.ok(s.sides.player.hand.slice(-3).every(ref=>ref.cardId==='dp1-125'));
});
test('Lumineon Lure Ring only brings in opponent Benched Pokémon with at least 100 printed HP',()=>{
 const s=field('dp2-11','dp1-94');s.sides.opponent.bench.push(slot('dp1-17','large-defender'));s.sides.opponent.bench[1].benchSlot=1;
 power(s,'dp2-11',acts=>acts.find(x=>x.choiceLabel?.includes('Torterra'))||acts.at(-1));
 assert.equal(s.sides.opponent.active.cardId,'dp1-17');assert.equal(s.sides.opponent.bench.find(x=>x.benchSlot===1)?.cardId,'dp1-94','old Active moved to Bench');
});
test('Garchomp Rainbow Scale adds 40 damage only when matching attached Energy is present and no special Energy',()=>{
 const f=()=>{const s=field('dp2-9','dp2-12');s.sides.player.active.energy={Water:1,Fire:0,Colorless:2};return s;};
 const plain=f();attack(plain,0);const base=attackLog(plain).damage;
 const blocked=f();blocked.sides.player.active.specialEnergy=[{uid:'special',cardId:'dp2-118'}];attack(blocked,0);
 assert.equal(base-attackLog(blocked).damage,40);
});
test('Mesprit Upper Material grants free retreat on either side when Uxie and Azelf are allied',()=>{
 const s=field('dp2-14');s.sides.player.active.energy={};s.sides.player.bench=[slot('dp2-18','uxie',{}),slot('dp2-4','azelf',{})];s.sides.player.bench.forEach((p,i)=>p.benchSlot=i);
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='retreat'));
 const t=field('dp2-14');t.sides.player.active.energy={};assert.equal(core.legalActions(t,'player').filter(a=>a.type==='retreat').length,0);
});
test('Ariados Sticky adds one retreat Energy for other Pokémon but not Ariados',()=>{
 const s=field('dp2-14');s.sides.player.active.energy={Psychic:1};s.sides.opponent.bench.push(slot('dp2-20','ariados',{}));s.sides.opponent.bench[1].benchSlot=1;
 assert.equal(core.legalActions(s,'player').filter(a=>a.type==='retreat').length,0);
 s.sides.player.active.energy.Psychic=2;assert.ok(core.legalActions(s,'player').some(a=>a.type==='retreat'));
 const a=field('dp2-20');a.sides.player.active.energy={Grass:1};assert.ok(core.legalActions(a,'player').some(x=>x.type==='retreat'),'Ariados excludes itself');
});
test('Mantine Jumbo Fin reduces Water ally retreat by two if Mantyke is underneath',()=>{
 const s=field('dp2-8');s.sides.player.active.energy={};s.sides.player.bench[0]=slot('dp2-29','mantine',{});s.sides.player.bench[0].stack=['dp1-55','dp2-29'];s.sides.player.bench[0].benchSlot=0;
 assert.ok(core.legalActions(s,'player').some(x=>x.type==='retreat'));
 const t=field('dp2-8');t.sides.player.active.energy={};t.sides.player.bench[0]=slot('dp2-29','mantine',{});t.sides.player.bench[0].benchSlot=0;
 assert.equal(core.legalActions(t,'player').filter(x=>x.type==='retreat').length,0);
});
test('Nidoqueen Mother Pheromone reduces Nidoran Family attacks by one Colorless',()=>{
 const s=field('dp2-91');s.sides.player.active.energy={};s.sides.player.bench[0]=slot('dp2-31','nidoqueen',{});s.sides.player.bench[0].benchSlot=0;
 assert.ok(core.legalActions(s,'player').some(x=>x.type==='attack'&&x.attackIndex===0),'Call for Family free');
 const t=field('dp2-91');t.sides.player.active.energy={};assert.equal(core.legalActions(t,'player').filter(x=>x.type==='attack'&&x.attackIndex===0).length,0);
});
test('Slaking Energetic Impulse heads boosts Lazy Blow and tails disables both attack and retreat',()=>{
 let heads=null,tails=null;
 for(const seed of [1,123456,123456789,0x80000000]){const s=field('dp2-34');s.rngState=seed;power(s,'dp2-34');const log=s.log.find(x=>x.reason==='Energetic Impulse');if(log?.heads)heads=s;else tails=s;}
 assert.ok(heads&&tails);
 attack(heads,0);assert.equal(attackLog(heads).damage,130);
 assert.equal(core.legalActions(tails,'player').filter(x=>x.type==='attack'||x.type==='retreat').length,0);
});
test('Unown M MAGNET switches only when coin heads; Hidden Power deals 30 or self-damages',()=>{
 let heads=null,tails=null;
 for(const seed of [1,123456,123456789,0x80000000]){const s=field('dp2-66');s.rngState=seed;power(s,'dp2-66',a=>a.find(x=>x.choiceTarget==='bench')||a[0]);const log=s.log.find(x=>x.reason==='Unown MAGNET');if(log?.heads)heads=s;else tails=s;}
 assert.ok(heads&&tails);assert.equal(heads.sides.opponent.active.cardId,'dp1-94');assert.equal(tails.sides.opponent.active.cardId,'dp1-17');
 const attackState=field('dp2-66');attack(attackState,0);const flip=attackState.log.find(x=>x.reason==='Unown M Hidden Power');assert.ok(flip);assert.equal(flip.heads?attackLog(attackState).damage:attackState.sides.player.active.damage,30);
});
test('Bidoof Wacan Berry reduces Lightning attacker damage by 20 after weakness',()=>{
 const lightning=field('dp2-15','dp2-73');lightning.sides.player.active.energy={Lightning:3};attack(lightning,1);
 const other=field('dp2-15','dp2-73');other.sides.player.active.energy={Lightning:3};other.sides.opponent.active.cardId='dp2-75';attack(other,1);
 assert.ok(attackLog(lightning).damage<attackLog(other).damage);
});
test('Lake Boundary overrides DP additive Weakness with a true ×2 multiplier',()=>{
 const a=field('dp2-32','dp1-17');a.sides.player.active.energy={Fire:2};attack(a,0);const noLake=attackLog(a).damage;
 const b=field('dp2-32','dp1-17');b.sides.player.active.energy={Fire:2};b.stadium={cardId:'dp2-112',ownerSide:'player',uid:'lake'};attack(b,0);
 assert.notEqual(noLake,attackLog(b).damage);assert.equal(attackLog(b).damage,120,'60 base doubled rather than +30');
});

test('Kind Egg only appears with Happiny in the Blissey stack and returns selected cards before drawing',()=>{
 const notBaby=field('dp2-5');assert.equal(core.legalActions(notBaby,'player').filter(x=>x.type==='ability'&&x.cardId==='dp2-5').length,0);
 const s=field('dp2-5');s.sides.player.active.stack=['dp2-52','dp2-76','dp2-5'];s.sides.player.active.energy={Colorless:3};
 s.sides.player.hand=[{uid:'return-pokemon',cardId:'dp2-73'},{uid:'return-energy',cardId:'dp2-118'}];const original=s.sides.player.deck.length;
 power(s,'dp2-5',(acts,st,n)=>n===0?acts.find(x=>x.choiceLabel?.includes('Shuffle 2')):acts.find(x=>x.choiceHandIndex===0)||acts[0]);
 assert.equal(s.sides.player.deck.length,original,'returned two, drew two');assert.equal(s.sides.player.hand.length,2);
 for(const uid of ['return-pokemon','return-energy'])assert.equal([...s.sides.player.hand,...s.sides.player.deck].filter(x=>x.uid===uid).length,1,'card retained exactly once');
});
test('Dodrio Triple Pick puts 30 onto each distinct evolved opponent and skips their Basic',()=>{
 const s=field('dp2-46');s.sides.opponent.bench.push(slot('dp2-68','opponent-evolved'));s.sides.opponent.bench[1].benchSlot=1;
 s.sides.opponent.bench[1].stack=['dp2-99','dp2-68'];s.sides.opponent.active.stack=['dp1-95','dp1-49','dp1-17'];
 attack(s,1,a=>a.find(x=>x.choiceLabel?.includes('Torterra'))||a[0]);
 assert.equal(s.sides.opponent.active.damage,30);assert.equal(s.sides.opponent.bench[1].damage,30);assert.equal(s.sides.opponent.bench[0].damage,0);
});
test('Aipom Throw Off removes selected Tool before hitting that chosen Pokémon',()=>{
 const s=field('dp2-70');s.sides.player.active.energy={Colorless:2};s.sides.opponent.bench[0].tool={uid:'tool-to-remove',cardId:'ex14-76'};
 const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===1&&x.target==='opponentBench');assert.ok(a);
 core.applyAction(s,'player',a);resolve(s);
 assert.equal(s.sides.opponent.active.damage,0);assert.equal(s.sides.opponent.bench[0].damage,20);
 assert.equal(s.sides.opponent.bench[0].tool,null);assert.ok(s.sides.opponent.discard.some(x=>x.uid==='tool-to-remove'));
});
test('Fossil Excavator searches deck OR discard for a Fossil and shows destination choices',()=>{
 const s=field('dp2-14');s.sides.player.hand=[{uid:'fossil-trainer',cardId:'dp2-111'}];
 s.sides.player.deck.unshift({uid:'armor-search',cardId:'dp2-116'});
 s.sides.player.discard.push({uid:'skull-search',cardId:'dp2-117'});
 const choices=core.legalActions(s,'player').filter(x=>x.type==='trainer'&&x.cardId==='dp2-111');assert.ok(choices.length);
 core.applyAction(s,'player',choices[0]);resolve(s,acts=>acts.find(x=>x.choiceLabel?.includes('From discard: Skull Fossil'))||acts[0]);
 assert.ok(s.sides.player.hand.some(x=>x.uid==='skull-search'));
 assert.ok(s.sides.player.deck.some(x=>x.uid==='armor-search'));
});

test('Slaking Energetic Impulse attack boost ends if it leaves the Active position',()=>{
 const s=field('dp2-34');s.rngState=1;power(s,'dp2-34');
 assert.equal(s.sides.player.active.dp2LazyBlowUntil,s.turnNumber);
 const former=s.sides.player.active;assert.equal(fx.switchPokemon(s.sides.player,0,s),true);
 assert.equal(former.dp2LazyBlowUntil,undefined,'boost cannot survive retreat or forced switch');
 assert.equal(fx.switchPokemon(s.sides.player,0,s),true);
 attack(s,0);assert.equal(attackLog(s).damage,50,'switching back does not revive the attack boost');
});
