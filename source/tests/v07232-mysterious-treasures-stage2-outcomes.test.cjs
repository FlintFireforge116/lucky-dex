'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const P='../app/src/main/assets/';const mt=require(P+'tcg-classic-mysterious-treasures'),core=require(P+'tcgp-battle-core'),opp=require(P+'tcg-classic-opponents'),builder=require(P+'tcg-classic-deck-builder'),fx=require(P+'tcgp-battle-effects');
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const sample=opp.generate({sets:['dp1'],type:'Grass',seed:17});
function slot(id,uid,energy){const x=core.makePokemonSlot(id,3,uid);x.energy=energy??{Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Darkness:4,Metal:4};return x;}
function field(me='dp2-7',foe='dp1-17'){
 const s=core.createBattle({format:'classic',playerDeck:sample.cards,opponentDeck:sample.cards,seed:42,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});s.phase='battle';s.turnNumber=10;s.activeSide='player';s.sides.player.turnCount=8;s.sides.opponent.turnCount=8;
 s.sides.player.active=slot(me,'player-active');s.sides.opponent.active=slot(foe,'opponent-active');
 s.sides.player.bench=[slot('dp1-94','player-bench',{Grass:1,Lightning:1})];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.bench=[slot('dp1-94','opponent-bench',{Lightning:1})];s.sides.opponent.bench[0].benchSlot=0;
 return s;
}
function resolve(s,picker){const chosen=[];for(let n=0;n<40&&s.phase==='effectChoice';n++){
 const side=s.choiceSide,acts=core.legalActions(s,side).filter(x=>x.type==='effectChoice');assert.ok(acts.length,'Missing continuation '+n);
 const a=picker?.(acts,s,n)||acts.find(x=>x.choiceSkip)||acts[0];assert.ok(a,'No chooser');chosen.push(a);core.applyAction(s,side,a);
 }assert.notEqual(s.phase,'effectChoice','Choice loop remained open');return chosen;}
function attack(s,i,picker){const acts=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackCardId===s.sides.player.active.cardId&&a.attackIndex===i);assert.ok(acts.length,`Cannot choose ${s.sides.player.active?.cardId}:${i}`);core.applyAction(s,'player',acts[0]);resolve(s,picker);return s;}
function level(s,id,pick){s.sides.player.hand.unshift({uid:'lvx-'+id,cardId:id});const a=core.legalActions(s,'player').find(x=>x.type==='evolve'&&x.cardId===id&&x.target==='active');assert.ok(a,'LV.X not legal '+id);core.applyAction(s,'player',a);resolve(s,pick);return s;}
test('Stage 2 cards enabled only when their attacks and powers are implemented',()=>{
 assert.equal(mt.CARDS.length,124);assert.equal(mt.coverage().battleEnabled,106);
 for(const c of mt.CARDS.filter(c=>c.battleEnabled))for(const x of [...(c.attacks||[]),...(c.abilities||[])])assert.deepEqual(fx.validateEffect(x.effect),[],c.id+' '+x.name);
 assert.equal(mt.cardById('dp2-70').battleEnabled,true,'Aipom tool removal implemented before damage');
});
test('Celebi Sprouting takes a Grass Energy from ordered zone and Leaf Tornado moves Basic Energy by choice',()=>{
 const s=field('dp2-7');s.sides.player.active.energy={Grass:2};s.sides.player.bench[0].energy={Grass:0};const before=s.sides.player.energySupply.filter(x=>x==='Grass').length;
 attack(s,0);assert.equal(s.sides.player.active.energy.Grass,3);assert.equal(s.sides.player.energySupply.filter(x=>x==='Grass').length,before-1);
 const m=field('dp2-7');m.sides.player.active.energy={Grass:2};m.sides.player.bench[0].energy={Grass:0};attack(m,1,(a,st,n)=>n>0?a.find(x=>x.choiceSkip):a.find(x=>x.choiceLabel?.includes('→'))||a[0]);assert.equal(m.sides.player.active.energy.Grass,1);assert.equal(m.sides.player.bench[0].energy.Grass,1);
});
test('Exeggutor String Bomb logs one flip per attached Basic Energy, and Nutritional Support moves actual supply',()=>{
 const s=field('dp2-24');s.sides.player.active.energy={Grass:2};s.sides.opponent.active.energy={Fire:1};attack(s,0);const flips=s.log.find(x=>x.reason==='String Bomb');assert.equal(flips.results.length,3);
 const t=field('dp2-24');const before=t.sides.player.energySupply.filter(x=>x==='Grass').length;attack(t,1,(a)=>a.find(x=>x.choiceTarget==='bench')||a.find(x=>x.choiceSkip));assert.equal(t.sides.player.energySupply.filter(x=>x==='Grass').length,before-2);assert.equal(t.sides.player.bench[0].energy.Grass,3);
});
test('Exeggcute Direct-hit Bomb targets a chosen opposing Benched Pokémon',()=>{
 const s=field('dp2-82');s.sides.player.active.energy={Grass:10};s.sides.opponent.active.damage=0;s.sides.opponent.bench[0].damage=0;
 attack(s,0,acts=>acts.find(x=>x.choiceTarget==='bench')||acts[0]);const flips=s.log.find(x=>x.reason==='Direct-hit Bomb');const amount=flips.heads*10;assert.ok(amount>0);assert.equal(s.sides.opponent.bench[0].damage,amount);assert.equal(s.sides.opponent.active.damage,0);
});
test('Vigoroth Wake-up Punch remembers Slakoth was Asleep when evolved',()=>{
 const s=field('dp2-99');s.sides.player.active.conditions={sleep:{appliedTurn:9}};s.sides.player.hand.unshift({uid:'vigoroth',cardId:'dp2-68'});
 const act=core.legalActions(s,'player').find(x=>x.type==='evolve'&&x.cardId==='dp2-68');assert.ok(act);core.applyAction(s,'player',act);
 assert.equal(s.sides.player.active.dp2EvolvedFromSleep,true);assert.equal(s.sides.player.active.conditions?.sleep,undefined);
 attack(s,0);assert.ok(s.sides.opponent.active.damage>=60);
});
test('Electrike Electromagnetic Jam locks only hand Energy to Active, not ordinary Zone attach',()=>{
 let s;for(let seed=10;seed<150;seed++){const t=field('dp2-81');t.rngState=seed;attack(t,0);if(t.log.some(x=>x.reason==='Electromagnetic Jam'&&x.heads)){s=t;break;}}
 assert.ok(s,'seeded heads');s.turnNumber=11;s.activeSide='opponent';s.sides.opponent.energyAvailable=true;s.sides.opponent.energyUsed=false;s.sides.opponent.handEnergyUsed=false;s.sides.opponent.hand.unshift({uid:'special-energy-hand',cardId:'dp2-118'});
 const opts=core.legalActions(s,'opponent');assert.ok(opts.some(a=>a.type==='attach'&&a.target==='active'),'Energy Zone not blocked');assert.equal(opts.filter(a=>a.type==='attachSpecial'&&a.target==='active').length,0,'hand Energy to Active blocked');
 assert.ok(opts.some(a=>a.type==='attachSpecial'&&a.target==='bench'),'Bench hand attachment allowed');
});
test('Spheal Willpower success changes next-own-turn Rollout base damage',()=>{
 let s;for(let seed=1;seed<150;seed++){const t=field('dp2-102');t.rngState=seed;attack(t,1);if(t.log.some(x=>x.reason==='Spheal Willpower'&&x.heads)){s=t;break;}}
 assert.ok(s);assert.ok(s.sides.player.active.nextAttackBonuses.some(x=>x.attackName==='Rollout'&&x.turn===12));
 s.turnNumber=12;s.activeSide='player';s.sides.player.active.energy={Colorless:2};s.sides.opponent.active.damage=0;attack(s,0);assert.ok(s.sides.opponent.active.damage>=40);
});
test('Electivire LV.X keeps inherited previous-level attacks and Shocking Tail responds to hand Energy',()=>{
 const s=field('dp1-3');s.sides.player.active.stack=['dp1-48','dp1-81','dp1-3'];s.sides.player.active.energy={Lightning:5};level(s,'dp2-121');
 assert.deepEqual(s.sides.player.active.stack,['dp1-48','dp1-81','dp1-3','dp2-121']);const allowed=core.legalActions(s,'player').filter(x=>x.type==='attack');assert.ok(allowed.some(x=>x.attackCardId==='dp1-3'));assert.ok(allowed.some(x=>x.attackCardId==='dp2-121'));
 s.turnNumber=11;s.activeSide='opponent';s.sides.opponent.handEnergyUsed=false;s.sides.opponent.hand.unshift({uid:'spec',cardId:'dp2-118'});
 const hand=core.legalActions(s,'opponent').find(a=>a.type==='attachSpecial'&&a.target==='bench');assert.ok(hand);const before=s.sides.opponent.bench[0].damage;core.applyAction(s,'opponent',hand);assert.equal(s.sides.opponent.bench[0].damage,before+20);
});
test('Electivire Pulse Barrier discards Stadium and Tool and gains attack prevention',()=>{
 const s=field('dp2-121');s.sides.player.active.stack=['dp1-3','dp2-121'];s.sides.player.active.energy={Lightning:3};s.stadium={uid:'stadium',cardId:'dp1-114',ownerSide:'opponent'};
 s.sides.opponent.bench[0].tool={uid:'tool',cardId:'ex14-76'};
 attack(s,0);assert.equal(s.stadium,null);assert.ok(s.sides.opponent.discard.some(x=>x.uid==='tool'));assert.ok(s.sides.opponent.discard.some(x=>x.uid==='stadium'));assert.ok(s.sides.player.active.attackGuard?.preventEffects);
});
test('Lucario LV.X offers optional Stance only on level-up, not as ordinary turn Power',()=>{
 const s=field('dp1-6');s.sides.player.active.stack=['dp1-86','dp1-6'];const opts=[];
 level(s,'dp2-122',(a)=>{opts.push(...a);return a.find(x=>x.choiceOption===1)||a[0];});
 assert.ok(opts.some(x=>x.choiceLabel==='Use Stance to prevent the next attack'));assert.ok(s.sides.player.active.attackGuard?.preventEffects);
 assert.equal(core.legalActions(s,'player').filter(a=>a.type==='ability'&&a.cardId==='dp2-122').length,0);
 const n=field('dp1-6');level(n,'dp2-122',a=>a.find(x=>x.choiceOption===0));assert.equal(n.sides.player.active.attackGuard,undefined);
});
test('Magmortar LV.X can level up on regular Magmortar; Flame Bluster discards Fire, damages Bench, locks only that attack',()=>{
 const s=field('dp2-12');s.sides.player.active.stack=['dp2-88','dp2-54','dp2-12'];s.sides.player.active.energy={Fire:5};s.sides.opponent.bench[0]=slot('dp1-17','opponent-bench',{Grass:1});s.sides.opponent.bench[0].benchSlot=0;level(s,'dp2-123');
 const opts=core.legalActions(s,'player').filter(x=>x.type==='attack');assert.ok(opts.some(x=>x.attackCardId==='dp2-12'));assert.ok(opts.some(x=>x.attackCardId==='dp2-123'));
 attack(s,0,a=>a.find(x=>x.choiceTarget==='bench')||a[0]);assert.equal(s.sides.player.active.energy.Fire,3);assert.equal(s.sides.opponent.bench[0].damage,100);assert.equal(s.sides.opponent.active.damage,0);
 assert.ok(s.sides.player.active.locks.some(x=>x.attackName==='Flame Bluster'&&x.expiresTurn===12));
});
test('Magmortar Flame Drum requires two Energy cards in hand unless Magby is under it',()=>{
 const none=field('dp2-12');none.sides.player.hand=[];attack(none,1);assert.equal(none.sides.opponent.active.damage,0);
 const enough=field('dp2-12');enough.sides.player.hand=[{uid:'e1',cardId:'dp2-118'},{uid:'e2',cardId:'dp2-119'}];attack(enough,1,a=>a.find(x=>x.choiceHandIndex===0)||a[0]);assert.ok(enough.sides.opponent.active.damage>0);assert.ok(enough.sides.player.discard.some(x=>x.uid==='e1'));assert.ok(enough.sides.player.discard.some(x=>x.uid==='e2'));
 const baby=field('dp2-12');baby.sides.player.active.stack=['dp2-88','dp2-54','dp2-12'];baby.sides.player.hand=[];attack(baby,1);assert.ok(baby.sides.opponent.active.damage>0);
});
test('Magmortar LV.X Torrid Wave applies stronger Burn tick after power',()=>{
 const s=field('dp2-123');s.sides.player.active.stack=['dp2-12','dp2-123'];const act=core.legalActions(s,'player').find(x=>x.type==='ability'&&x.cardId==='dp2-123');assert.ok(act);core.applyAction(s,'player',act);resolve(s);
 assert.ok(s.sides.opponent.active.conditions?.burn);assert.equal(s.sides.opponent.active.dp2TorridDamage,30);
});
test('CPU focused Level-Up lines still have at least one playable prior form',()=>{
 for(const [id,type] of [[121,'Lightning'],[122,'Fighting'],[123,'Fire']]){
 const owned=[...mt.CARDS.filter(c=>c.battleEnabled&&c.deckEligible),...require(P+'tcg-classic-diamond-pearl').CARDS.filter(c=>c.battleEnabled&&c.deckEligible)].map(c=>({gameplayId:c.id,quantity:4}));
 const build=builder.buildDeck(owned,{sets:['dp1','dp2'],types:[type],focusCardId:'dp2-'+id,randomSeed:31});assert.ok(build.ok,`${id} ${build.errors}`);assert.equal(build.cards.length,30);assert.ok(build.cards.includes('dp2-'+id));
 }
});

test('Aggron Heap Up returns real printed Basic Energy types and Special Metal, with the +30 bonus',()=>{
 const s=field('dp2-1','dp1-17');s.sides.player.energyDiscard={Grass:1,Water:2,Fighting:1};s.sides.player.discard.push({uid:'special-metal',cardId:'dp2-120'});
 const before=s.sides.player.deck.length;attack(s,0);const count=id=>s.sides.player.deck.filter(x=>x.cardId===id).length;
 assert.ok(s.sides.opponent.active.damage>=70,'Metal Special Energy in discard gives bonus');assert.equal(s.sides.player.energyDiscard.Water,0);
 assert.ok(count('dp1-123')>=1,'Grass');assert.ok(count('dp1-125')>=2,'Water');assert.ok(count('dp1-128')>=1,'Fighting');assert.ok(count('dp2-120')>=1,'Special Metal preserved');
 assert.ok(s.sides.player.deck.length>=before+5);assert.ok(!s.sides.player.discard.some(x=>x.uid==='special-metal'));
});
test('Aggron Hard Metal offers non-boost versus boost and applies exactly 40 recoil',()=>{
 const keep=field('dp2-1');const keepAction=core.legalActions(keep,'player').find(x=>x.type==='attack'&&x.attackIndex===1&&x.effectSelection==='');assert.ok(keepAction);core.applyAction(keep,'player',keepAction);resolve(keep);
 const boost=field('dp2-1');const boostAction=core.legalActions(boost,'player').find(x=>x.type==='attack'&&x.attackIndex===1&&x.effectSelection==='boost');assert.ok(boostAction);core.applyAction(boost,'player',boostAction);resolve(boost);
 assert.equal(keep.sides.player.active.damage,0);assert.equal(boost.sides.player.active.damage,40);
 assert.equal(boost.sides.opponent.active.damage-keep.sides.opponent.active.damage,40);
});
test('Feraligatr Energy Cyclone takes chosen Energy from hand, reshuffles, and adds 20 per card',()=>{
 const s=field('dp2-8');s.sides.player.hand=[{uid:'e1',cardId:'dp2-118'},{uid:'e2',cardId:'dp2-119'},{uid:'junk',cardId:'dp2-105'}];
 const action=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===0&&x.effectSelection==='2');assert.ok(action,'option for 2 Energy in hand');const initial=s.sides.player.deck.length;
 core.applyAction(s,'player',action);resolve(s,acts=>acts.find(a=>a.choiceHandIndex===0)||acts[0]);
 assert.ok(s.sides.opponent.active.damage>=40);assert.equal(s.sides.player.hand.filter(ref=>ref.uid.startsWith('e')).length,0);assert.equal(s.sides.player.deck.length,initial+2);
 assert.ok(s.sides.player.deck.some(ref=>ref.uid==='e1'));assert.ok(s.sides.player.deck.some(ref=>ref.uid==='e2'));
});
test('Feraligatr Breaking Tail discards exactly one hidden opponent card',()=>{
 const s=field('dp2-8');s.sides.opponent.hand=[{uid:'secret1',cardId:'dp2-109'},{uid:'secret2',cardId:'dp2-110'}];attack(s,1);
 assert.equal(s.sides.opponent.hand.filter(x=>x.uid.startsWith('secret')).length,1);assert.equal(s.sides.opponent.discard.filter(x=>x.uid.startsWith('secret')).length,1);
});
test('Abomasnow Glacier Snow puts attacker Asleep when damaged in Active position',()=>{
 const s=field('dp1-17','dp2-19');attack(s,1);assert.ok(s.sides.player.active.conditions?.sleep,'attacker should be Asleep after the hit');
});
test('Glalie Craggy Face reduces Stage 2 damage but not Stage 1 damage',()=>{
 const stage2=field('dp1-17','dp2-25');attack(stage2,1);const hit2=stage2.sides.opponent.active.damage;
 const stage1=field('dp2-45','dp2-25');stage1.sides.player.active.energy={Water:5};attack(stage1,0);const hit1=stage1.sides.opponent.active.damage;
 assert.equal(hit2,40,'Torterra Leaf Storm base 60 reduced to 40');assert.equal(hit1,60,'Dewgong Collapse base 60 unaffected by Glalie Stage 2 guard');
});
test('Ninetales Color Shift changes type to chosen opponent until turn expires',()=>{
 const s=field('dp2-32');const powers=core.legalActions(s,'player').filter(x=>x.type==='ability'&&x.cardId==='dp2-32');assert.ok(powers.length);
 core.applyAction(s,'player',powers[0]);resolve(s,acts=>acts.find(a=>a.choiceTarget==='bench')||acts[0]);
 assert.ok(s.sides.player.active.typeOverride);assert.deepEqual(s.sides.player.active.typeOverride.types,require(P+'tcg-classic-diamond-pearl').cardById(s.sides.opponent.bench[0].cardId).types);
});
test('Croconaw Evolutionary Vitality takes Energy from top 5 upon evolving from hand',()=>{
 const s=field('dp2-106');const prefix=[{uid:'ev1',cardId:'dp2-118'},{uid:'ev2',cardId:'dp2-119'},{uid:'p1',cardId:'dp2-73'},{uid:'p2',cardId:'dp2-75'},{uid:'ev3',cardId:'dp2-120'}];s.sides.player.deck.unshift(...prefix);s.sides.player.hand.unshift({uid:'evo-croco',cardId:'dp2-44'});
 const act=core.legalActions(s,'player').find(x=>x.type==='evolve'&&x.cardId==='dp2-44');assert.ok(act);core.applyAction(s,'player',act);resolve(s);
 assert.equal(s.sides.player.active.cardId,'dp2-44');for(const uid of ['ev1','ev2','ev3'])assert.ok(s.sides.player.hand.some(x=>x.uid===uid),uid);
});
test('Dewgong Cold Fat applies only while Asleep',()=>{
 const awake=field('dp1-17','dp2-45');attack(awake,1);
 const asleep=field('dp1-17','dp2-45');asleep.sides.opponent.active.conditions={sleep:{appliedTurn:9}};attack(asleep,1);
 assert.equal(awake.sides.opponent.active.damage-asleep.sides.opponent.active.damage,40);
});
test('Sandslash Spike Armor counters next-turn damage with four counters',()=>{
 const s=field('dp2-61','dp1-17');attack(s,0);assert.equal(s.sides.player.active.dp2SpikeArmorUntil,11);
 s.turnNumber=11;s.activeSide='opponent';const foeMoves=core.legalActions(s,'opponent').filter(x=>x.type==='attack'&&x.attackIndex===0);assert.ok(foeMoves.length);core.applyAction(s,'opponent',foeMoves[0]);resolve(s);
 assert.ok(s.log.some(x=>x.type==='dp2SpikeArmor'&&x.amount===40));assert.ok(s.sides.opponent.active.damage>=40);
});
test('Larvitar Mountain Bite optional discard raises damage and puts self Asleep',()=>{
 const keep=field('dp2-87');const keepChoice=core.legalActions(keep,'player').find(x=>x.type==='attack'&&x.attackIndex===0&&x.effectSelection==='');assert.ok(keepChoice);core.applyAction(keep,'player',keepChoice);resolve(keep);
 const burn=field('dp2-87');const burnChoice=core.legalActions(burn,'player').find(x=>x.type==='attack'&&x.attackIndex===0&&x.effectSelection==='discard');assert.ok(burnChoice);const n=burn.sides.player.deck.length;core.applyAction(burn,'player',burnChoice);resolve(burn);
 assert.equal(burn.sides.opponent.active.damage-keep.sides.opponent.active.damage,10);assert.ok(burn.sides.player.active.conditions?.sleep);assert.equal(burn.sides.player.deck.length,n-1);
});
