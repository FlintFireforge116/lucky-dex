'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(A+'/tcgp-battle-core.js'),data=require(A+'/tcg-classic-battle-data.js'),fx=require(A+'/tcgp-battle-effects.js'),ex=require(A+'/tcg-classic-unseen-forces.js'),cpu=require(A+'/tcg-classic-opponents.js');
const ids=cpu.generate({sets:['ex10'],seed:192}).cards;
let sequence=0;
function mon(id,uid,bs){const p=core.makePokemonSlot(id,2,uid);p.energy={Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Metal:4};p.benchSlot=bs;return p;}
function setup(a='ex10-41',def='ex10-51'){
 const s=core.createBattle({format:'classic',playerDeck:ids,opponentDeck:ids,seed:19200+(++sequence),firstSide:'player',playerEnergyTypes:['Fire','Water','Grass'],opponentEnergyTypes:['Fire','Water','Grass']});
 s.phase='battle';s.activeSide='player';s.turnNumber=11;s.sides.player.turnCount=5;s.sides.opponent.turnCount=5;
 s.sides.player.active=mon(a,'pactive',null);s.sides.player.bench=[mon('ex10-51','pbench',0)];
 s.sides.opponent.active=mon(def,'oactive',null);s.sides.opponent.bench=[mon('ex10-62','obench',0)];return s;
}
function action(s,match){const acts=core.legalActions(s,s.activeSide);const act=acts.find(match);assert.ok(act,JSON.stringify(acts));core.applyAction(s,s.activeSide,act);return act;}
function choose(s,match){assert.equal(s.phase,'effectChoice',JSON.stringify(s.pendingChoice));const acts=core.legalActions(s,s.choiceSide);const a=acts.find(match||((x)=>!x.choiceSkip));assert.ok(a,JSON.stringify(acts));core.applyAction(s,s.choiceSide,a);return a;}
function finish(s){let n=0;while(s.phase==='effectChoice'&&n++<20)choose(s);assert.notEqual(s.phase,'effectChoice','unresolved choices');}
function attack(s,index=0,match){return action(s,x=>x.type==='attack'&&x.attackIndex===index&&(!match||match(x)));}
function effect(s,key){fx.applyEffect({type:'neoRule',rule:'ex10:'+key},{...core.effectContext(s,'player',{},s.sides.player.active),random:()=>0.01});}

test('set coverage now has 87 executable cards, while other cards remain gated',()=>{
 assert.equal(ex.CARDS.length,145);assert.equal(ex.coverage().battleEnabled,87);
 for(const card of ex.CARDS)if(card.battleEnabled){assert.equal(card.support.status,'FULL');for(const a of card.attacks||[])assert.ok(fx.supportsEffect(a.effect),card.id);}
 assert.equal(data.validateDeck(ids).ok,true,JSON.stringify(data.validateDeck(ids).errors));
});
test('Jolteon and Vaporeon distinct Basic Energy bonus affects both preview and outcome',()=>{
 let s=setup('ex10-8','ex10-101');s.sides.player.active.energy={Fire:1,Water:1,Lightning:1};
 assert.equal(core.attackDamagePreview(s,'player',1).damage,60);attack(s,1);finish(s);assert.equal(s.sides.opponent.active.damage,60);assert.ok(s.sides.opponent.active.conditions.confusion);
 s=setup('ex10-19','ex10-101');s.sides.player.active.energy={Fire:1,Water:1,Lightning:1};
 assert.equal(core.attackDamagePreview(s,'player',1).damage,60);attack(s,1);finish(s);assert.equal(s.sides.opponent.active.damage,60);assert.ok(s.sides.opponent.active.conditions.sleep);
});
test('Vaporeon Aqua Supply consumes an actual hand Energy card but does not touch Energy Zone',()=>{
 const s=setup('ex10-19'),p=s.sides.player;p.hand=[{uid:'water-hand',cardId:'ex9-103'}];p.energySupply=['Fire','Water'];const before=p.bench[0].energy.Water;
 attack(s,0);assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceBenchIndex===0);choose(s,x=>x.choiceOption===0);finish(s);
 assert.equal(p.bench[0].energy.Water,before+1);assert.equal(p.hand.length,0);assert.deepEqual(p.energySupply,['Fire','Water']);
});
test('Slowbro gains Psychic type while Psychic Energy attached; Gligar retreat is free only when empty',()=>{
 const s=setup('ex10-13');const p=s.sides.player.active;assert.ok(fx.effectiveTypes(s,'player',p,data.cardById).includes('Psychic'));
 p.energy={};assert.ok(!fx.effectiveTypes(s,'player',p,data.cardById).includes('Psychic'));
 const g=setup('ex10-57');g.sides.player.active.energy={};assert.equal(fx.modifierAmount(g,'player',g.sides.player.active,'retreatCost',data.cardById),-1);
 g.sides.player.active.specialEnergy=[{uid:'special',cardId:'ex10-96'}];assert.equal(fx.modifierAmount(g,'player',g.sides.player.active,'retreatCost',data.cardById),0);
});
test('Octillery Super Suction Cups blocks opponent retreat only while active',()=>{
 const s=setup('ex10-10'),p=s.sides.player,o=s.sides.opponent;
 s.activeSide='opponent';assert.equal(core.legalActions(s,'opponent').some(x=>x.type==='retreat'),false);
 p.active=mon('ex10-51','other',null);p.bench[0]=mon('ex10-10','oct-bench',0);
 assert.equal(core.legalActions(s,'opponent').some(x=>x.type==='retreat'),true);
});
test('Clefable next-turn bonus is applied to preview and resolved damage',()=>{
 const s=setup('ex10-36');attack(s,1);finish(s);const p=s.sides.player.active;
 assert.ok(p.nextAttackBonuses?.some(x=>x.amount===30));
 s.activeSide='player';s.phase='battle';s.turnNumber+=1;s.sides.player.turnCount++;
 assert.equal(core.attackDamagePreview(s,'player',1).damage,60);
});
test('Magcargo Extra Flame applies ex bonus and Quilava Smokescreen gates the opponent',()=>{
 let s=setup('ex10-41','ex9-96');assert.equal(core.attackDamagePreview(s,'player',1).damage,70);attack(s,1);finish(s);assert.equal(s.sides.opponent.active.damage,70);
 s=setup('ex10-45');attack(s,0);finish(s);assert.ok(s.sides.opponent.active.attackGate);
});
test('Slowpoke Fishing Tail recovers actual discarded Basic Energy into hand',()=>{
 const s=setup('ex10-72'),p=s.sides.player;p.energyDiscard={Water:2};p.discard=[];p.hand=[];
 attack(s,0);choose(s,x=>x.choiceOption===0);finish(s);
 assert.equal(p.energyDiscard.Water,1);assert.equal(data.cardById(p.hand[0].cardId).subtype,'Water');
});
test('Energy Switch moves one Basic Energy to selected Pokémon without generating any',()=>{
 const s=setup(),p=s.sides.player;p.active.energy={Water:1};p.bench[0].energy={};
 effect(s,'trainer:84');choose(s,x=>x.choiceTarget==='active');choose(s,x=>x.choiceOption===0);choose(s,x=>x.choiceBenchIndex===0);
 assert.equal(p.active.energy.Water,0);assert.equal(p.bench[0].energy.Water,1);
});
test('Energy Removal 2 heads discards selected attached Energy to owner discard',()=>{
 const s=setup(),o=s.sides.opponent;o.active.energy={Fire:2};o.bench[0].energy={};
 effect(s,'trainer:82');assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceTarget==='active');choose(s,x=>x.choiceOption===0);finish(s);
 assert.equal(o.active.energy.Fire,1);assert.equal(o.energyDiscard.Fire,1);
});
test('Unown D selects evolved Pokémon and returns highest evolution to owner hand',()=>{
 const s=setup('ex10-D');const target=s.sides.opponent.bench[0];target.cardId='ex10-36';target.stack=['ex10-53','ex10-36'];
 attack(s,0);if(s.phase==='effectChoice')choose(s,x=>x.choiceOption===0);finish(s);
 assert.equal(target.cardId,'ex10-53');assert.ok(s.sides.opponent.hand.some(x=>x.cardId==='ex10-36'));
});
test('Pokemon Star copy restriction remains enforced and Entei blast discards 10 when trailing',()=>{
 let arr=[...ids];arr=arr.filter(id=>!data.cardById(id)?.pokemonStar);arr.splice(0,2,'ex10-113','ex10-114');assert.ok(!data.validateDeck(arr).ok);
 const s=setup('ex10-113'),p=s.sides.player,o=s.sides.opponent;p.prizes=[{uid:'a'},{uid:'b'}];o.prizes=[{uid:'a'},{uid:'b'},{uid:'c'}];
 const count=p.deck.length;attack(s,1);finish(s);assert.equal(p.deck.length,count-10);assert.equal(p.discard.length>=10,true);
});
test('Politoed ex chooses physical target and Swallow Up uses remaining HP comparison',()=>{
 let s=setup('ex10-107','ex10-53');s.sides.opponent.bench[0]=mon('ex10-9','stage2',0);
 attack(s,0,x=>x.effectSelection==='stage2');finish(s);assert.equal(s.sides.opponent.bench[0].damage,50);
 s=setup('ex10-107','ex10-101');s.sides.player.active.damage=10;s.sides.opponent.active.damage=30;
 assert.equal(core.attackDamagePreview(s,'player',2).damage,120);attack(s,2);finish(s);assert.equal(s.sides.opponent.active.damage,150);
});

test('Politoed Upward Lick applies Weakness to Active but not Benched targets',()=>{
 let s=setup('ex10-107','ex10-5');attack(s,0,x=>!x.effectSelection);finish(s);assert.equal(s.sides.opponent.active.damage,60);
 s=setup('ex10-107','ex10-101');s.sides.opponent.bench[0]=mon('ex10-5','flar',0);
 attack(s,0,x=>x.effectSelection==='flar');finish(s);assert.equal(s.sides.opponent.bench[0].damage,30);
});
test('Granbull Crushing Blow lets the attacker choose a Special Energy rather than auto-discarding Basic',()=>{
 let found=false;
 for(let tries=0;tries<30;tries++){
   const s=setup('ex10-39','ex10-101'),o=s.sides.opponent;o.active.energy={Fire:2};o.active.specialEnergy=[{uid:'special-metal',cardId:'ex10-97'}];
   attack(s,0);
   if(s.phase!=='effectChoice')continue;
   assert.ok(s.pendingChoice.options.some(x=>x.includes('Metal Energy')));
   choose(s,x=>x.choiceOption===1);finish(s);
   assert.equal(o.active.energy.Fire,2);assert.equal(o.active.specialEnergy.length,0);
   assert.ok(o.discard.some(x=>x.cardId==='ex10-97'));found=true;break;
 }
 assert.equal(found,true,'At least one of 30 seeded coin flips should be heads');
});
test('Scyther Agility heads protects against the next opponent attack and its effects',()=>{
 let checked=false;
 for(let tries=0;tries<30;tries++){
   const s=setup('ex10-46','ex10-51');attack(s,1);finish(s);
   if(!s.sides.player.active?.attackGuard)continue;
   assert.equal(s.activeSide,'opponent');
   const legal=core.legalActions(s,'opponent').find(x=>x.type==='attack'&&x.attackIndex===0);
   assert.ok(legal);
   core.applyAction(s,'opponent',legal);
   assert.equal(s.sides.player.active.damage,0);checked=true;break;
 }
 assert.equal(checked,true,'Expected an Agility heads result');
});

test('Raikou and Suicune Star disadvantage attacks apply exact self damage and Energy discard',()=>{
 let s=setup('ex10-114','ex10-101'),p=s.sides.player,o=s.sides.opponent;
 p.prizes=[{uid:'a'}];o.prizes=[{uid:'a'},{uid:'b'}];
 attack(s,1);finish(s);assert.equal(p.active.damage,40);assert.equal(p.bench[0].damage,40);
 s=setup('ex10-115','ex10-101');p=s.sides.player;o=s.sides.opponent;
 p.prizes=[{uid:'a'}];o.prizes=[{uid:'a'},{uid:'b'}];
 p.active.specialEnergy=[{uid:'metal',cardId:'ex10-97'}];const old=p.energyDiscard.Water||0;
 attack(s,1);finish(s);
 assert.equal(p.active.specialEnergy.length,0);assert.ok(p.discard.some(x=>x.cardId==='ex10-97'));
 assert.equal(p.energyDiscard.Water,old+8);assert.ok(Object.values(p.active.energy).every(n=>n===0));
 assert.ok(Object.values(p.bench[0].energy).every(n=>n===0));
});
test('Unown O returns itself and both Basic/Special Energy to hand, requiring legal promotion',()=>{
 const s=setup('ex10-O','ex10-101'),p=s.sides.player;
 p.active.energy={Psychic:2};p.active.specialEnergy=[{uid:'sp',cardId:'ex10-97'}];p.hand=[];
 attack(s,0);finish(s);
 assert.equal(s.phase,'promote');assert.equal(p.active,null);
 assert.equal(p.hand.filter(x=>x.cardId==='ex10-O').length,1);
 assert.equal(p.hand.filter(x=>data.cardById(x.cardId)?.basicEnergy).length,2);
 assert.ok(p.hand.some(x=>x.cardId==='ex10-97'));
});

test('Unown O mandatory return is not silently lost at the ordinary draw/search hand cap',()=>{
 const s=setup('ex10-O','ex10-101'),p=s.sides.player;
 p.active.energy={Psychic:2};p.hand=Array.from({length:10},(_,i)=>({uid:'old'+i,cardId:'ex10-51'}));
 attack(s,0);finish(s);
 assert.equal(s.phase,'promote');assert.ok(p.hand.some(x=>x.cardId==='ex10-O'));
 assert.equal(p.hand.filter(x=>data.cardById(x.cardId)?.basicEnergy).length,2);
});
