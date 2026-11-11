'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js'),cpu=require('../app/src/main/assets/tcg-classic-opponents.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),ex11=require('../app/src/main/assets/tcg-classic-delta-species.js');
let serial=0;
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Metal','Darkness'];
const deck=cpu.generate({sets:['ex11'],seed:112}).cards;
const ref=(cardId,uid)=>({uid:uid||cardId,cardId});
function slot(id,uid,benchSlot=-1){const p=core.makePokemonSlot(id,3,uid);p.benchSlot=benchSlot;p.energy={};return p;}
function game(id='ex11-1',enemy='ex11-57'){
 const s=core.createBattle({format:'classic',playerDeck:deck,opponentDeck:deck,seed:19700+(++serial),firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
 s.phase='battle';s.activeSide='player';s.turnNumber=11;s.sides.player.turnCount=5;s.sides.opponent.turnCount=5;
 s.sides.player.active=slot(id,'pa');s.sides.opponent.active=slot(enemy,'oa');s.sides.player.bench=[slot('ex11-57','pb',0)];s.sides.opponent.bench=[slot('ex11-57','ob',0)];return s;
}
function choose(s,fn){assert.equal(s.phase,'effectChoice',JSON.stringify(s.pendingChoice));const actions=core.legalActions(s,s.choiceSide||s.activeSide),a=actions.find(fn||((x)=>!x.choiceSkip))||actions.find(x=>!x.choiceSkip);assert.ok(a,JSON.stringify(actions));core.applyAction(s,s.choiceSide||s.activeSide,a);return a;}
function finish(s){let n=0;while(s.phase==='effectChoice'&&n++<35)choose(s);assert.notEqual(s.phase,'effectChoice','stuck effect choice');}
function attack(s,i=0,fn){s.sides.player.active.energy=Object.fromEntries(types.map(t=>[t,9]));const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===i&&(!fn||fn(x)));assert.ok(a,JSON.stringify(core.legalActions(s,'player')));core.applyAction(s,'player',a);finish(s);return a;}
function power(s,id){return fx.applyEffect({type:'neoRule',rule:'ex11:power:'+id},{...core.effectContext(s,'player',{},s.sides.player.active),random:()=>0.12});}
test('Unown W Hidden Power deals its printed 20 without any eligible discard recovery',()=>{const s=game('ex10-W','ex11-57');s.sides.player.discard=[];s.sides.player.energyDiscard={};assert.equal(core.attackDamagePreview(s,'player',0).damage,20,'visible damage preview should show 20');attack(s);assert.equal(s.sides.opponent.active.damage,20);});
test('Unown T, K, O, W, V fixed printed damage is never lost to optional effects',()=>{for(const id of ['K','O','T','V','W']){const s=game('ex10-'+id,'ex11-57');attack(s);assert.equal(s.sides.opponent.active.damage,20,id);}});
test('EX Delta Species Shelgon δ Exoskeleton reduces incoming attack damage by ten',()=>{const s=game('ex11-41','ex11-54');assert.equal(fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',s.sides.opponent.active,40,data.cardById),30);});
test('EX Delta Species secret Azumarill Thick Fat reduces Fire and Water attacks by thirty',()=>{const s=game('ex11-5','ex11-114');assert.equal(fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',s.sides.opponent.active,50,data.cardById),20);s.sides.player.active.cardId='ex11-6';assert.equal(fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',s.sides.opponent.active,50,data.cardById),50);});
test('EX Delta Species damage scaling: Beedrill evolves, Porygon no false damage boost, Jolteon ex counters',()=>{let s=game('ex11-1','ex11-108');attack(s);assert.equal(s.sides.opponent.active.damage,80);s=game('ex11-109','ex11-108');s.sides.opponent.active.damage=30;attack(s);assert.equal(s.sides.opponent.active.damage,80);});
test('EX Delta Species Latias/Latios special attack requires matching opponent in play',()=>{let s=game('ex11-8','ex11-57');attack(s,1);assert.equal(s.sides.opponent.active.damage,0);s=game('ex11-9','ex11-57');attack(s,1);assert.equal(s.sides.opponent.active.damage,0);});
test('EX Delta Species metadata distinguishes deck search from drawing cards and Holon basic-energy synergies',()=>{const persian=ex11.cardById('ex11-50');assert.ok(persian.deckMeta.roles.includes('search'));assert.ok(!persian.deckMeta.roles.includes('draw'),'Prowl searches; it does not draw blind cards');assert.ok(!ex11.cardById('ex11-6').deckMeta.roles.includes('energy-acceleration'),'Energy Jump moves existing Energy; does not create it');assert.ok(ex11.cardById('ex11-6').deckMeta.roles.includes('energy-transfer'));assert.ok(!ex11.cardById('ex11-110').deckMeta.roles.includes('draw'),'Opponent hand disruption is not card draw for our deck');assert.ok(ex11.cardById('ex11-110').deckMeta.roles.includes('disruption'));for(const [id,required] of [['ex11-104','Fire'],['ex11-105','Grass'],['ex11-106','Water']]){assert.ok(ex11.cardById(id).deckMeta.preferredEnergyTypes.includes(required),id+' conditional Basic type missing');}});
test('Vaporeon ex Evolutionary Swirl is optional and the opponent chooses 0–4 cards to draw',()=>{
 const s=game('ex11-110'),foe=s.sides.opponent;foe.hand=[ref('ex11-57','h1'),ref('ex11-57','h2'),ref('ex11-57','h3')];
 power(s,110);assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'player');
 assert.ok(s.pendingChoice.options.some(x=>/unchanged/.test(x)));
 choose(s,a=>a.choiceOption===0);assert.equal(foe.hand.length,3,'declining leaves opponent hand untouched');
 power(s,110);choose(s,a=>a.choiceOption===1);
 assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'opponent','affected player owns their draw-count choice');
 assert.equal(foe.hand.length,0);choose(s,a=>a.choiceOption===2);finish(s);assert.equal(foe.hand.length,2);
});
test('EX Delta Species CPU builds legal complete lines and makes progress through all four difficulty levels',()=>{
 const ai=require('../app/src/main/assets/tcgp-battle-ai.js');
 for(const level of ai.DIFFICULTIES)for(const seed of [3,7,19]){
  const d1=cpu.generate({sets:['ex11'],seed}),d2=cpu.generate({sets:['ex11'],seed:seed+801});
  assert.ok(d1.ok&&d2.ok,level+' '+seed);assert.ok(data.validateDeck(d1.cards).ok&&data.validateDeck(d2.cards).ok);
  const s=core.createBattle({format:'classic',playerDeck:d1.cards,opponentDeck:d2.cards,playerEnergyTypes:d1.energyTypes,opponentEnergyTypes:d2.energyTypes,firstSide:'opponent',seed});
  let turns=0,effects=0,actions=0;
  while(s.phase!=='finished'&&actions<110){
    const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.activeSide;
    const a=ai.chooseAction(s,side,level,actions%34);
    assert.ok(a,level+'/'+seed+' stranded at '+s.phase+'; '+JSON.stringify(s.pendingChoice||{}));
    if(a.type==='effectChoice')effects++;
    if(a.type==='endTurn')turns++;
    core.applyAction(s,side,a);
    actions++;
  }
  assert.ok(actions>=8,level+'/'+seed+' too few actions');
 }
});
