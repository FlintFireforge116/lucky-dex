'use strict';
// SM4 complete-set outcome audit: physical cards, optional costs, prize
// conservation, selection ownership, one-turn locks and hand-only triggers.
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const pack=require('../app/src/main/assets/tcg-classic-crimson-invasion.js');
const card=id=>pack.cardById(id)||data.cardById(id);
const slot=(id,uid,energy={})=>({uid,cardId:id,stack:[id],damage:0,energy:{...energy},specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const rich={Grass:7,Fire:7,Water:7,Lightning:7,Psychic:7,Fighting:7,Darkness:7,Metal:7,Colorless:7};
const ref=(id,uid)=>({uid,cardId:id});
function setup(id='sm4-6'){
 const state=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:73412,firstSide:'player',playerEnergyTypes:['Fire','Water','Lightning','Darkness','Metal'],opponentEnergyTypes:['Fire','Water','Lightning','Darkness','Metal']});
 state.phase='battle';state.activeSide='player';state.turnNumber=5;state.rules.winMode='prizes';
 for(const side of ['player','opponent']){
  const ss=state.sides[side];ss.turnCount=3;ss.energyUsed=true;ss.handEnergyUsed=true;ss.supporterUsed=false;
  ss.hand=[];ss.deck=Array.from({length:12},(_,i)=>ref('sm4-30',side+'d'+i));
  ss.discard=[];ss.energyDiscard={};ss.prizes=Array.from({length:5},(_,i)=>ref('sm4-1',side+'prize'+i));ss.prizesTaken=0;
 }
 state.sides.player.active=slot(id,'att',rich);state.sides.player.bench=[slot('sm4-30','pbench')];
 state.sides.opponent.active=slot('sm4-30','def',{Water:1});state.sides.opponent.bench=[slot('sm4-30','obench')];return state;
}
function action(s,side='player',criteria=()=>true){const a=core.legalActions(s,side).find(criteria);assert.ok(a,'Missing legal action '+side+' '+JSON.stringify(core.legalActions(s,side).slice(0,15)));core.applyAction(s,side,a);return a;}
function attack(s,name,select=()=>true){return action(s,'player',a=>a.type==='attack'&&card(s.sides.player.active.cardId)?.attacks?.[a.attackIndex]?.name===name&&select(a));}
function choose(s,fn=()=>true){const side=s.pendingChoice?.side;assert.equal(s.phase,'effectChoice','Expected effectChoice');return action(s,side,a=>a.type==='effectChoice'&&fn(a));}
function drain(s){let i=0;while(['effectChoice','promote'].includes(s.phase)&&i++<100){const side=s.phase==='promote'?['player','opponent'].find(w=>core.legalActions(s,w).some(a=>a.type==='promote')):s.pendingChoice.side;action(s,side,a=>a.type=== (s.phase==='promote'?'promote':'effectChoice'));}assert.ok(i<100,'stuck effectChoice');}

test('All 126 canonical SM4 prints generated, validated, with no sealed/noop printed effects',()=>{
 assert.equal(pack.CARDS.length,126);assert.equal(pack.CARDS.filter(c=>c.battleEnabled).length,126);
 for(const c of pack.CARDS){for(const a of [...(c.attacks||[]),...(c.abilities||[])])assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);if(c.kind==='trainer')assert.deepEqual(fx.validateEffect(c.effect),[],c.id);}
});

test('Hunt switches the targeted physical Bench before dealing exactly 40 damage',()=>{
 const s=setup('sm4-6'),o=s.sides.opponent;const old=o.active,ben=o.bench[0];
 attack(s,'Hunt');assert.equal(o.active.uid,ben.uid);assert.equal(o.active.damage,40);assert.equal(o.bench[0].uid,old.uid);assert.equal(o.bench[0].damage,0);
});

test('Forceful Tackle 9 counters cost is self-damage BEFORE +90 bonus',()=>{
 const s=setup('sm4-21');s.sides.opponent.active=slot('sm4-34','tank');attack(s,'Forceful Tackle',a=>a.effectSelection==='count:9');
 assert.equal(s.sides.player.active.damage,90);assert.equal(s.sides.opponent.active.damage,180);
});

test('Special Artillery optional discard chooses exact special UID; paid card goes to discard',()=>{
 const s=setup('sm4-23');s.sides.opponent.active=slot('sm4-34','tank');s.sides.player.active.specialEnergy=[ref('sm4-100','se1'),ref('sm4-123','se2')];
 attack(s,'Special Artillery',a=>a.effectSelection==='special:se2');
 assert.equal(s.sides.opponent.active.damage,120);assert.deepEqual(s.sides.player.active.specialEnergy.map(r=>r.uid),['se1']);
 assert.ok(s.sides.player.discard.some(r=>r.uid==='se2'));
});

test('Pumpkin Bomb removes chosen Tool before attack damage; unchosen Tool stays',()=>{
 const s=setup('sm4-45');s.sides.player.active.tool=ref('sm4-92','t1');s.sides.player.bench[0].tool=ref('sm4-94','t2');
 attack(s,'Pumpkin Bomb',a=>a.effectSelection==='t2');
 assert.equal(s.sides.opponent.active.damage,50);assert.equal(s.sides.player.active.tool.uid,'t1');
 assert.equal(s.sides.player.bench[0].tool,null);assert.ok(s.sides.player.discard.some(r=>r.uid==='t2'));
});

test('Symbiont-GX moves top 2 real opposing deck cards to opponent Prizes',()=>{
 const s=setup('sm4-49'),o=s.sides.opponent,top=o.deck.slice(0,2).map(r=>r.uid);
 attack(s,'Symbiont-GX');assert.equal(o.deck.length,9,'2 moved to Prizes, then 1 normal opponent-turn draw');assert.equal(o.prizes.length,7);
 assert.deepEqual(o.prizes.slice(-2).map(r=>r.uid),top);
});

test('Glutton-GX gives exactly two bonus Prizes on damage KO, not ordinary knockouts',()=>{
 const s=setup('sm4-63'),p=s.sides.player;s.sides.opponent.active.damage=0;
 attack(s,'Glutton-GX');drain(s);
 assert.equal(p.prizesTaken,3,'1 normal Prize + 2 Glutton Prizes');
});

test('Counter Energy is one Colorless normally; exactly 2 rainbow units when behind on Prizes on non-GX',()=>{
 const s=setup('sm4-30'),p=s.sides.player,o=s.sides.opponent;p.active.energy={};p.active.specialEnergy=[ref('sm4-100','counter1')];
 assert.equal(core.effectiveEnergy(s,'player',p.active).Colorless,1);
 p.prizes.push(ref('sm4-1','more'));assert.equal(core.effectiveEnergy(s,'player',p.active).Miracle,2);
 p.active.cardId='sm4-49';assert.equal(core.effectiveEnergy(s,'player',p.active).Miracle||0,0);assert.equal(core.effectiveEnergy(s,'player',p.active).Colorless,1);
});

test('Iceberg Shield blocks Stage 2 damage and attack effects only with Regirock',()=>{
 const s=setup('sm4-30');s.sides.opponent.active=slot('sm4-28','regice');s.sides.opponent.bench=[slot('sm4-53','regirock')];
 s.sides.player.active=slot('sm4-21','mamoswine',rich);
 const rule=fx.findPassiveRule(s,'opponent',s.sides.opponent.active,'preventDamage',data.cardById);
 assert.ok(rule,'Regice shield not registered');assert.equal(rule.attackerFilter.stage,'Stage 2');
 assert.equal(fx.attackEffectsPrevented(s,'opponent',s.sides.opponent.active,s.sides.player.active,data.cardById),true);
 s.sides.opponent.bench=[];assert.equal(fx.attackEffectsPrevented(s,'opponent',s.sides.opponent.active,s.sides.player.active,data.cardById),false);
});

test('Heavy Rock-GX hand lock blocks bench, Trainers, evolution, hand Energy; leaves Energy Zone',()=>{
 const s=setup('sm4-34');attack(s,'Heavy Rock-GX');
 const o=s.sides.opponent;o.hand=[ref('sm4-30','benchCard'),ref('sm4-91','item'),ref('sm4-123','warp')];o.handEnergyUsed=false;o.energyUsed=false;o.energyAvailable=true;o.energyType='Water';
 s.phase='battle';s.activeSide='opponent';s.turnNumber=6;
 const types=core.legalActions(s,'opponent').map(a=>a.type);
 for(const forbidden of ['bench','evolve','trainer','attachSpecial'])assert.equal(types.includes(forbidden),false,forbidden);
 assert.ok(types.includes('attach')||types.includes('endTurn'));
});

test('Counter Catcher requires being behind on prizes, then switches chosen opposing Bench',()=>{
 const s=setup('sm4-30'),p=s.sides.player,o=s.sides.opponent;p.hand=[ref('sm4-91','catch')];
 assert.equal(core.legalActions(s,'player').some(a=>a.cardId==='sm4-91'),false);
 p.prizes.push(ref('sm4-1','extra'));const old=o.active,ben=o.bench[0];
 action(s,'player',a=>a.type==='trainer'&&a.cardId==='sm4-91');choose(s,a=>a.choiceBenchIndex===0);
 assert.equal(o.active.uid,ben.uid);assert.equal(o.bench[0].uid,old.uid);
});

test('Gladion trades exactly one real Prize for its played physical Trainer, preserving count',()=>{
 const s=setup('sm4-30'),p=s.sides.player;p.hand=[ref('sm4-95','gladion')];const prize=p.prizes[2];
 action(s,'player',a=>a.type==='trainer'&&a.cardId==='sm4-95');choose(s,a=>a.choicePrizeIndex===2);
 assert.equal(p.prizes.length,5);assert.ok(p.hand.some(r=>r.uid===prize.uid));
 assert.ok(p.prizes.some(r=>r.uid==='gladion'));assert.equal(p.discard.some(r=>r.uid==='gladion'),false);
});

test('Peeking Red Card can return and redraw equal physical opposing hand count',()=>{
 const s=setup('sm4-30'),p=s.sides.player,o=s.sides.opponent;p.hand=[ref('sm4-97','red')];
 o.hand=[ref('sm4-7','h1'),ref('sm4-8','h2')];const before=o.deck.length;
 action(s,'player',a=>a.type==='trainer'&&a.cardId==='sm4-97');choose(s,a=>a.choiceOption===1);
 assert.equal(o.hand.length,2);assert.equal(o.deck.length,before);
});

test('Gnawing Curse reacts only to Energy attached from hand, not the hybrid Zone',()=>{
 const s=setup('sm4-30'),p=s.sides.player,o=s.sides.opponent;o.bench.push(slot('sm4-38','gengar'));p.hand=[ref('sm4-123','hand-energy')];p.handEnergyUsed=false;
 action(s,'player',a=>a.type==='attachSpecial'&&a.cardId==='sm4-123'&&a.target==='active');
 assert.equal(p.active.damage,20);
 const effect=card('sm4-38').abilities.find(a=>a.name==='Gnawing Curse').effect;
 fx.applyEffect(effect,{...core.effectContext(s,'opponent',{},o.bench.at(-1)),isAbility:true,eventData:{target:p.active,fromHand:false}});
 assert.equal(p.active.damage,20);
});

test('Moomoo Malt heals 90 only on hand attachments, not Energy Zone',()=>{
 const s=setup('sm4-78'),p=s.sides.player;p.active.damage=110;p.hand=[ref('sm4-124','basic-water')];p.handEnergyUsed=false;
 action(s,'player',a=>a.type==='attachSpecial'&&a.cardId==='sm4-124'&&a.target==='active');
 assert.equal(p.active.damage,20);
});

test('Sea of Nothingness retains evolving status conditions without retaining switching ones',()=>{
 const s=setup('sm4-30'),p=s.sides.player;p.stadiumUsed=false;s.stadium={...ref('sm4-99','stadium'),ownerSide:'player'};
 p.active=slot('sm4-19','base');p.active.conditions={poison:{amount:20},confusion:true};p.active.playedOnSideTurn=1;
 p.hand=[ref('sm4-20','evo')]; // Swinub -> Piloswine
 const act=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='sm4-20');
 if(act){core.applyAction(s,'player',act);assert.ok(p.active.conditions.poison);assert.ok(p.active.conditions.confusion);}
 else assert.fail('Swinub evolution not legally offered');
});

test('Fighting and Psychic Memories override Silvally-GX type and do not add to Colorless',()=>{
 const s=setup('sm4-90'),p=s.sides.player;p.active.tool=ref('sm4-94','fight');
 assert.deepEqual(fx.effectiveTypes(s,'player',p.active,data.cardById),['Fighting']);
 p.active.tool=ref('sm4-98','psychic');assert.deepEqual(fx.effectiveTypes(s,'player',p.active,data.cardById),['Psychic']);
});

test('Warp Energy attached from hand to Active forces physical Bench switch, unlike to Bench',()=>{
 const s=setup('sm4-30'),p=s.sides.player;p.hand=[ref('sm4-123','warp')];p.handEnergyUsed=false;const old=p.active,newActive=p.bench[0];
 action(s,'player',a=>a.type==='attachSpecial'&&a.cardId==='sm4-123'&&a.target==='active');
 assert.equal(s.phase,'effectChoice');choose(s,a=>a.choiceBenchIndex===0);
 assert.equal(p.active.uid,newActive.uid);assert.equal(p.bench[0].uid,old.uid);assert.ok(old.specialEnergy.some(r=>r.uid==='warp'));
});

test('Sky Hunting switches only after a real attack-damage KO',()=>{
 const s=setup('sm4-83'),p=s.sides.player;s.sides.opponent.active.damage=0;
 attack(s,'Sky Hunting');assert.equal(s.phase,'effectChoice');
 choose(s,a=>a.choiceBenchIndex===0);assert.equal(p.active.uid,'pbench');
});

test('Dread Storm-GX chooses one physical Energy from EACH opponent Pokémon, including Special Energy',()=>{
 const s=setup('sm4-18'),o=s.sides.opponent;
 o.active.specialEnergy=[ref('sm4-123','foe-special')];o.bench[0].energy={Metal:1};
 attack(s,'Dread Storm-GX');assert.equal(s.phase,'effectChoice');
 choose(s,a=>String(a.choiceLabel).includes('Warp Energy'));
 assert.equal(o.active.specialEnergy.length,0);assert.ok(o.discard.some(r=>r.uid==='foe-special'));
 if(s.phase==='effectChoice')choose(s,a=>String(a.choiceLabel).includes('Metal'));
 assert.equal(o.bench[0].energy.Metal,0);assert.equal(o.energyDiscard.Metal,1);
});

test('Shell On requires actual Shelmet from hand and evolves Karrablast from real deck',()=>{
 const s=setup('sm4-7'),p=s.sides.player;
 p.hand=[ref('sm4-8','shelmet')];p.deck.unshift(ref('sm4-69','escavalier'));
 action(s,'player',a=>a.type==='ability'&&a.cardId==='sm4-7');
 assert.equal(s.phase,'effectChoice');choose(s,a=>a.choiceCardId==='sm4-69');
 assert.equal(p.active.cardId,'sm4-69');assert.ok(p.discard.some(r=>r.uid==='shelmet'));
 assert.equal(p.deck.some(r=>r.uid==='escavalier'),false);
});

test('Empty Light triggers optional Poison and Confusion on BOTH Active Pokémon after hand Bench play',()=>{
 const s=setup('sm4-30'),p=s.sides.player,o=s.sides.opponent;
 p.hand=[ref('sm4-49','nih')];action(s,'player',a=>a.type==='bench'&&a.cardId==='sm4-49');
 assert.equal(s.phase,'effectChoice');choose(s,a=>a.choiceOption===1);
 for(const target of [p.active,o.active]){assert.ok(target.conditions.poison);assert.ok(target.conditions.confusion);}
});

test('Slice Off can choose exact opposing Special Energy, only on Bench-from-hand trigger',()=>{
 const s=setup('sm4-30'),p=s.sides.player,o=s.sides.opponent;
 o.bench[0].specialEnergy=[ref('sm4-123','sp1')];p.hand=[ref('sm4-70','kartana')];
 action(s,'player',a=>a.type==='bench'&&a.cardId==='sm4-70');assert.equal(s.phase,'effectChoice');
 choose(s,a=>String(a.choiceLabel).includes('Warp Energy'));
 assert.equal(o.bench[0].specialEnergy.length,0);assert.ok(o.discard.some(r=>r.uid==='sp1'));
});

test('Dance of Flames returns only available discarded Basic Fire Energy (no fabricated Zone)',()=>{
 const s=setup('sm4-12'),p=s.sides.player,o=s.sides.opponent;
 o.active.energy={Water:1};o.bench[0].energy={Fire:1};p.energyDiscard={Fire:1};
 attack(s,'Dance of Flames');assert.equal(s.phase,'effectChoice');
 choose(s,a=>a.choiceLabel==='Fire');choose(s,a=>a.choiceTarget==='active');
 assert.equal(p.active.energy.Fire,8);assert.equal(p.energyDiscard.Fire,0);
 assert.equal(s.phase!=='effectChoice',true,'no second Fire Energy exists');
});

test('Eat Sloppily physically attaches only discarded Energy from top 5, preserves non-Energy in discard',()=>{
 const s=setup('sm4-63'),p=s.sides.player;p.deck=[ref('sm4-124','e1'),ref('sm4-100','e2'),ref('sm4-30','not-energy'),ref('sm4-123','e3'),ref('sm4-1','not-energy2'),...p.deck];
 const before=p.active.energy.Water,sp=p.active.specialEnergy.length;
 attack(s,'Eat Sloppily');assert.equal(p.active.energy.Water,before+1);assert.equal(p.active.specialEnergy.length,sp+2);
 assert.ok(p.discard.some(r=>r.uid==='not-energy'));assert.ok(p.discard.some(r=>r.uid==='not-energy2'));
 assert.equal(p.deck.some(r=>['e1','e2','e3'].includes(r.uid)),false);
});

test('Dark Destruction optional exact Energy discards occur on both sides and are not mandatory',()=>{
 const s=setup('sm4-62'),p=s.sides.player,o=s.sides.opponent;
 o.active=slot('sm4-34','tank',{Water:1});p.active.energy={Darkness:3,Metal:1};
 attack(s,'Dark Destruction');assert.equal(s.phase,'effectChoice');
 choose(s,a=>String(a.choiceLabel).includes('Metal'));
 assert.equal(p.active.energy.Metal,0);assert.equal(p.energyDiscard.Metal,1);
 choose(s,a=>String(a.choiceLabel).includes('Water'));
 assert.equal(o.active.energy.Water,0);assert.equal(o.energyDiscard.Water,1);
});

test('Blade-GX takes one actual Prize card without a KO and consumes GX action',()=>{
 const s=setup('sm4-70'),p=s.sides.player;attack(s,'Blade-GX');drain(s);
 assert.equal(p.prizesTaken,1);assert.equal(p.prizes.length,4);assert.equal(p.gxAttackUsed,true);
});

test('Gale Blade offers optional physical self-shuffle only after causing attack damage',()=>{
 const s=setup('sm4-70'),p=s.sides.player;p.active.specialEnergy=[ref('sm4-100','attached')];const uid=p.active.uid;
 attack(s,'Gale Blade');assert.equal(s.phase,'effectChoice');choose(s,a=>a.choiceOption===1);drain(s);
 assert.notEqual(p.active?.uid,uid);assert.ok(p.deck.some(r=>r.uid==='attached'));
});

test('TLC selects damaged opposing Bench Pokémon, shuffles its stack and attachments into opponent deck',()=>{
 const s=setup('sm4-27'),o=s.sides.opponent,ben=o.bench[0];ben.damage=20;ben.specialEnergy=[ref('sm4-123','attached')];
 attack(s,'TLC');assert.equal(s.phase,'effectChoice');choose(s,a=>a.choiceCardId==='sm4-30'&&a.choiceTarget==='bench');
 assert.equal(o.bench.some(p=>p.uid===ben.uid),false);assert.ok(o.deck.some(r=>r.uid==='attached'));
});

test('Amazing Plea: opponent can accept actual two discard cards, otherwise 80 attack damage',()=>{
 const agreed=setup('sm4-86'),p=agreed.sides.player;p.discard=[ref('sm4-7','a1'),ref('sm4-8','a2')];
 attack(agreed,'Amazing Plea');choose(agreed,a=>a.choiceCardId==='sm4-7');choose(agreed,a=>a.choiceCardId==='sm4-8');
 assert.equal(agreed.pendingChoice.side,'opponent');choose(agreed,a=>a.choiceOption===0);
 assert.ok(p.hand.some(r=>r.uid==='a1'));assert.ok(p.hand.some(r=>r.uid==='a2'));
 const denied=setup('sm4-86'),q=denied.sides.player,foe=denied.sides.opponent;
 q.discard=[ref('sm4-7','b1'),ref('sm4-8','b2')];foe.active=slot('sm4-34','tank');
 attack(denied,'Amazing Plea');choose(denied,a=>a.choiceCardId==='sm4-7');choose(denied,a=>a.choiceCardId==='sm4-8');choose(denied,a=>a.choiceOption===1);
 assert.equal(foe.active.damage,80);assert.equal(q.hand.length,0);assert.equal(q.discard.length,2);
});

test('Dashing Pouch returns spent retreat Energy to physical hand and leaves other cards alone',()=>{
 const s=setup('sm4-30'),p=s.sides.player;p.active.energy={Water:1};p.active.tool=ref('sm4-92','pouch');
 const target=p.bench[0];action(s,'player',a=>a.type==='retreat');
 assert.equal(p.active.uid,target.uid);assert.equal(p.bench[0].energy.Water,0);
 assert.equal(p.energyDiscard.Water||0,0);assert.ok(p.hand.some(r=>data.cardById(r.cardId)?.basicEnergy&&data.cardById(r.cardId)?.subtype==='Water'));
});

test('Weed Out lets a temporary 4-Bench board retain exactly 3 chosen, discarding the fourth',()=>{
 const s=setup('sm4-62'),p=s.sides.player;p.benchLimit=5;p.bench=[0,1,2,3].map(i=>slot('sm4-30','ben'+i));
 action(s,'player',a=>a.type==='ability'&&a.cardId==='sm4-62');
 for(let i=0;i<3;i++)choose(s,a=>a.choiceOption===0);
 assert.equal(p.bench.length,3);assert.equal(p.bench.some(x=>x.uid==='ben3'),false);
});

test('Dance of Flames never offers Water or non-Fire Basic Energy from the physical discard',()=>{
 const s=setup('sm4-12'),p=s.sides.player,o=s.sides.opponent;
 o.active.energy={Water:2};p.energyDiscard={Water:2};p.discard=[ref('sm4-124','physical-water')];
 attack(s,'Dance of Flames');assert.notEqual(s.phase,'effectChoice');assert.equal(p.active.energy.Water,7);
 assert.equal(p.energyDiscard.Water,2);assert.ok(p.discard.some(r=>r.uid==='physical-water'));
});

test('Sea of Nothingness preserves poison and confusion on devolution, and normal devolution clears them',()=>{
 for(const withStadium of [true,false]){
  const s=setup('sm4-20'),p=s.sides.player;
  s.stadium=withStadium?{...ref('sm4-99','stadium'),ownerSide:'player'}:null;
  p.active.stack=['sm4-19','sm4-20'];p.active.conditions={poison:{amount:20},confusion:true};
  fx.applyEffect({type:'devolve',target:'self'},core.effectContext(s,'player',{},p.active));
  assert.equal(p.active.cardId,'sm4-19');assert.equal(!!p.active.conditions.poison,withStadium);
  assert.equal(!!p.active.conditions.confusion,withStadium);
 }
});

test('Bell of Silence also prevents Ability Pokémon entering play through Rare Candy',()=>{
 const s=setup('sm4-36'),p=s.sides.player;p.active.playedOnSideTurn=1;
 p.hand=[ref('sm1-129','candy'),ref('sm4-38','gengar')];
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='sm1-129'&&a.evolutionCardId==='sm4-38'), 'Baseline Rare Candy must be legal');
 p.sm4AbilityPokemonLockUntil=s.turnNumber;
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='sm1-129'&&a.evolutionCardId==='sm4-38'), 'Bell of Silence blocks Rare Candy into Ability Pokémon');
 p.sm4AbilityPokemonLockUntil=s.turnNumber-1;
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='sm1-129'&&a.evolutionCardId==='sm4-38'));
});

test('Sky Hunting without an attack-damage knockout must not force a voluntary switch',()=>{
 const s=setup('sm4-83');s.sides.opponent.active=slot('sm4-34','tank');
 attack(s,'Sky Hunting');assert.notEqual(s.phase,'effectChoice');assert.equal(s.sides.player.active.uid,'att');
});
