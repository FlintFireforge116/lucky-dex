'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(A+'/tcgp-battle-core.js'),effects=require(A+'/tcgp-battle-effects.js'),data=require(A+'/tcg-classic-battle-data.js'),ex10=require(A+'/tcg-classic-unseen-forces.js'),cpu=require(A+'/tcg-classic-opponents.js'),builder=require(A+'/tcg-classic-deck-builder.js'),picker=require(A+'/tcg-classic-set-picker.js');
const deck=cpu.generate({sets:['ex10'],seed:190}).cards;
let seed=1890;
function make(id,uid,slot){const p=core.makePokemonSlot(id,2,uid);p.energy={Fire:3,Water:3,Grass:3,Lightning:3,Fighting:3,Psychic:3,Metal:3};p.benchSlot=slot;return p;}
function game(att='ex10-49',def='ex10-51'){
 const s=core.createBattle({format:'classic',playerDeck:deck,opponentDeck:deck,seed:++seed,firstSide:'player',playerEnergyTypes:['Fire','Water','Grass'],opponentEnergyTypes:['Fire','Water']});
 s.phase='battle';s.turnNumber=11;s.activeSide='player';s.sides.player.turnCount=5;s.sides.opponent.turnCount=5;
 s.sides.player.active=make(att,'my-active',-1);s.sides.opponent.active=make(def,'their-active',-1);
 s.sides.player.bench=[make('ex10-51','my-bench',0)];s.sides.opponent.bench=[make('ex10-62','their-bench',0)];return s;
}
function choose(s,fn){assert.equal(s.phase,'effectChoice','expected a pending choice');const a=core.legalActions(s,s.choiceSide),choice=(fn&&a.find(fn))||a.find(x=>!x.choiceSkip)||a[0];assert.ok(choice,JSON.stringify(s.pendingChoice));core.applyAction(s,s.choiceSide,choice);return choice;}
function attack(s,idx=0,fn){const a=core.legalActions(s,'player').filter(x=>x.type==='attack'&&x.attackIndex===idx),act=(fn&&a.find(fn))||a[0];assert.ok(act,JSON.stringify({card:s.sides.player.active.cardId,idx,actions:a}));core.applyAction(s,'player',act);return act;}
function finish(s,max=12){let n=0;while(s.phase==='effectChoice'&&n++<max)choose(s);assert.notEqual(s.phase,'effectChoice','stuck choice');}
function apply(s,key,choice){effects.applyEffect({type:'neoRule',rule:'ex10:'+key},{...core.effectContext(s,'player',choice||{},s.sides.player.active),random:()=>0.01});}
test('EX Unseen Forces registers authentic 145 cards, 117 numbered and 28 symbol/letter Unown identities',()=>{
 assert.equal(ex10.CARDS.length,145);assert.equal(data.CARDS.filter(c=>c.setId==='ex10').length,145);
 assert.equal(new Set(ex10.CARDS.map(c=>c.id)).size,145);
 assert.equal(ex10.CARDS.filter(c=>c.number.match(/^[A-Z!?]$/)).length,28);
 assert.equal(ex10.cardById('ex10-?').image,'https://images.pokemontcg.io/ex10/question.png');
 assert.equal(ex10.cardById('ex10-113').pokemonStar,true);
 assert.equal(ex10.cardById('ex10-101').pokemonEx,true);
 assert.ok(picker.rows.some(x=>x[0]==='ex10'));
 assert.ok(builder.SET_IDS.includes('ex10'));
});
test('Incomplete EX Unseen Forces cards are explicitly PARTIAL and excluded from legal battles',()=>{
 const c=ex10.cardById('ex10-?');assert.equal(c.support.status,'PARTIAL');assert.equal(c.battleEnabled,false);
 assert.ok(!data.isBattleEnabled(c.id));
 for(const card of ex10.CARDS){if(card.battleEnabled)assert.equal(card.support.status,'FULL');else assert.equal(card.deckEligible,false);}
});
test('CPU selects EX Unseen Forces and creates a 30-card battle-ready deck',()=>{
 assert.equal(deck.length,30);assert.ok(deck.every(id=>data.cardById(id)?.setId==='ex10'&&data.cardById(id)?.battleEnabled));
 assert.equal(data.validateDeck(deck).ok,true,JSON.stringify(data.validateDeck(deck).errors));
});
test('Aipom and Xatu attacks target a specific physical Bench slot, not another identically named Pokemon',()=>{
 const s=game('ex10-49');s.sides.opponent.bench=[make('ex10-62','bench-one',0),make('ex10-62','bench-two',1)];
 const actions=core.legalActions(s,'player').filter(x=>x.type==='attack'&&x.attackIndex===0);
 assert.equal(actions.length,3);assert.ok(actions.some(x=>x.effectSelection==='bench-two'));
 attack(s,0,x=>x.effectSelection==='bench-two');finish(s);
 assert.equal(s.sides.opponent.bench[0].damage,0);assert.equal(s.sides.opponent.bench[1].damage,30);
});
test('Unown Shuffle swaps printed Unown identity, preserving current damage and Energy, and only once per turn',()=>{
 const s=game('ex10-B'),p=s.sides.player;p.active.damage=20;p.active.energy.Fire=3;
 p.deck.unshift({uid:'unown-Z',cardId:'ex10-Z'});
 apply(s,'power:B');assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceDeckIndex===0);finish(s);
 assert.equal(p.active.cardId,'ex10-Z');assert.equal(p.active.damage,20);assert.equal(p.active.energy.Fire,3);
 assert.equal(p.ex10ShuffleUsedTurn,s.turnNumber);assert.ok(p.deck.some(ref=>ref.cardId==='ex10-B'));
 apply(s,'power:Z');assert.equal(s.phase,'battle','another Unown cannot Shuffle in the same turn');
});
test('Unown B and G place actual damage counters without weakness or resistance multiplication',()=>{
 let s=game('ex10-B');s.sides.opponent.hand=[{uid:'a',cardId:'ex10-94'},{uid:'b',cardId:'ex10-86'}];
 attack(s);finish(s);assert.equal(s.sides.opponent.active.damage,20);
 s=game('ex10-G');s.sides.player.bench[0].damage=30;s.sides.player.active.damage=10;
 attack(s);finish(s);assert.equal(s.sides.opponent.active.damage,20);
});
test('Unown Q searches distinct fresh Basic Energy types from Energy Zone to hand',()=>{
 const s=game('ex10-Q'),p=s.sides.player,pick={kind:'neoRule',rule:'ex10:Q:0'};
 p.energySupply=['Fire','Water','Grass','Fire'];p.hand=[];
 apply(s,'Q:0');assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceOption===0);
 assert.ok(p.hand.some(ref=>data.cardById(ref.cardId)?.subtype==='Fire'));
 while(s.phase==='effectChoice')choose(s,x=>x.choiceOption===0);assert.equal(new Set(p.hand.filter(ref=>data.cardById(ref.cardId)?.basicEnergy).map(ref=>data.cardById(ref.cardId).subtype)).size,3);
});
test('Energy Search takes actual Basic Energy from Zone to hand; normal Computer Search does not offer Zone as a generic card',()=>{
 const s=game(),p=s.sides.player;p.energySupply=['Fire','Water'];p.hand=[];p.deck=[];
 apply(s,'trainer:94');assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceOption===0);
 assert.ok(p.hand.length===1&&data.cardById(p.hand[0].cardId)?.basicEnergy);assert.equal(p.energySupply.length,1);
 const e={type:'searchChosen',source:'deck',amount:1,filter:{}};
 effects.applyEffect(e,{...core.effectContext(s,'player',{},p.active),random:()=>0.01});assert.notEqual(s.phase,'effectChoice','Generic any-card search must not create Energy Zone choices');
});
test('New EX-era Darkness and Metal Energy apply the correct pre-Weakness bonus and damage reduction',()=>{
 const dark=data.cardById('ex10-96'),metal=data.cardById('ex10-97');assert.equal(dark.specialEnergy,true);assert.equal(metal.specialEnergy,true);
 const s=game('neo2-13','ex9-94');s.sides.player.active.specialEnergy=[{uid:'dark',cardId:'ex10-96'}];
 assert.equal(core.attackDamagePreview(s,'player',0).damage,30);
 attack(s);finish(s);assert.equal(s.sides.opponent.active.damage,60);
});
test('Unown K offers Keep versus Discard Stadium rather than identical options',()=>{
 const s=game('ex10-K');s.stadium={uid:'stadium',cardId:'ex9-75'};attack(s);assert.equal(s.phase,'effectChoice');
 assert.ok(s.pendingChoice.options.some(x=>x.includes('Keep')));assert.ok(s.pendingChoice.options.some(x=>x.includes('Discard')));
 choose(s,x=>x.choiceOption===1);finish(s);assert.equal(s.stadium,null);
});
test('Yanma Grand Loop draws two cards only once when optional switch choice is resolved',()=>{
 const s=game('ex10-50'),p=s.sides.player,prior=p.hand.length;attack(s,0);assert.equal(s.phase,'effectChoice');
 const afterDraw=p.hand.length;assert.equal(afterDraw,prior+2);choose(s,x=>x.choiceBenchIndex===0);finish(s);
 assert.equal(p.hand.length,afterDraw);assert.equal(p.active.uid,'my-bench');
});
test('EX10 full-coverage simple attacks use their printed damage and target areas',()=>{
 let s=game('ex10-20');attack(s,1);finish(s);assert.equal(s.sides.opponent.active.damage,20,'Chansey Double Tack hits current defender');
 s=game('ex10-61');s.sides.player.active.damage=30;attack(s,0);finish(s);assert.equal(s.sides.opponent.active.damage,30,'Larvitar Retaliate damage counters');
 s=game('ex10-68','ex10-101');attack(s,0);finish(s);assert.equal(s.sides.opponent.active.damage,50,'Poliwhirl Energy Ball maximum 20 bonus');
});
test('EX10 Yanma Spinning Tail adds Bench damage only when successful and Ho-Oh Sacred Fire selects board target',()=>{
 let s;for(let n=0;n<24;n++){s=game('ex10-50');attack(s,1);finish(s);if(s.sides.opponent.active.damage===20)break;}
 assert.equal(s.sides.opponent.active.damage,20,'head result must deal active damage');assert.equal(s.sides.opponent.bench[0].damage,20);
 for(let n=0;n<24;n++){
   s=game('ex10-27');s.sides.opponent.bench=[make('ex10-101','hooh-target',0)];
   const actions=core.legalActions(s,'player').filter(x=>x.type==='attack'&&x.attackIndex===1);
   assert.ok(actions.some(x=>x.effectSelection==='hooh-target'));attack(s,1,x=>x.effectSelection==='hooh-target');finish(s);
   if(s.sides.opponent.bench[0].damage===60)break;
 }
 assert.equal(s.sides.opponent.active.damage,0);assert.equal(s.sides.opponent.bench[0].damage,60);
});
test('Croconaw Aqua Sonic and Quagsire Rock Hurl ignore Resistance (but not Weakness)',()=>{
 let s=game('ex10-38','ecard1-71');attack(s,1);finish(s);assert.equal(s.sides.opponent.active.damage,50,'Aqua Sonic should not lose 30 to Water Resistance');
 s=game('ex10-44','base1-4');attack(s,1);finish(s);assert.equal(s.sides.opponent.active.damage,50,'Rock Hurl should not lose 30 to Fighting Resistance');
});
test('Older Neo Discovery Scizor/Tyranitar use an actual two-type Energy Zone without requiring owned Special Darkness/Metal',()=>{
 const owned=data.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false&&!['neo1-104','neo1-19'].includes(c.id)).map(c=>({gameplayId:c.id,quantity:4}));
 for(const [id,type,secondary] of [['neo2-10','Metal','Grass'],['neo2-12','Darkness','Fighting']]){
   const result=builder.buildDeck(owned,{sets:['neo2'],types:[type],style:'competitive',focusCardId:id,randomSeed:42});
   assert.equal(result.ok,true,JSON.stringify(result.errors));assert.ok(result.cards.includes(id));
   assert.deepEqual(result.energyTypes,[type,secondary]);assert.equal(result.cards.length,30);
   assert.equal(data.validateDeck(result.cards).ok,true);
   const cpuRecipe=cpu.generate({sets:['neo2'],type,seed:1});assert.equal(cpuRecipe.ok,true,cpuRecipe.error);
   assert.ok(cpuRecipe.energyTypes.includes(secondary));assert.equal(data.validateDeck(cpuRecipe.cards).ok,true);
 }
});
