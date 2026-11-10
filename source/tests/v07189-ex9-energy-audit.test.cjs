'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(A+'/tcgp-battle-core.js'),effects=require(A+'/tcgp-battle-effects.js'),data=require(A+'/tcg-classic-battle-data.js'),ex9=require(A+'/tcg-classic-emerald.js'),cpu=require(A+'/tcg-classic-opponents.js'),synergy=require(A+'/tcg-deck-synergy.js');
const deck=cpu.generate({sets:['ex9'],seed:189}).cards;
let counter=0;
function slot(id,uid){const p=core.makePokemonSlot(id,2,uid);p.energy={Fire:4,Water:4,Darkness:4,Colorless:4};return p;}
function game(att='ex9-25',def='ex9-47',withBench=true){
 const s=core.createBattle({format:'classic',playerDeck:deck,opponentDeck:deck,seed:189+ ++counter,firstSide:'player',playerEnergyTypes:['Fire','Water','Darkness'],opponentEnergyTypes:['Water','Fire']});
 s.phase='battle';s.turnNumber=11;s.activeSide='player';s.sides.player.turnCount=5;s.sides.opponent.turnCount=5;
 s.sides.player.active=slot(att,'attacker');s.sides.player.bench=[slot('ex9-69','ally')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.active=slot(def,'defender');s.sides.opponent.active.energy={};s.sides.opponent.bench=withBench?[slot('ex9-48','bench-one')]:[];if(withBench)s.sides.opponent.bench[0].benchSlot=0;
 return s;
}
function choose(s,pred){assert.equal(s.phase,'effectChoice','No pending choice');const acts=core.legalActions(s,s.choiceSide);const act=(pred?acts.find(pred):null)||acts.find(a=>!a.choiceSkip);assert.ok(act,JSON.stringify(s.pendingChoice));core.applyAction(s,s.choiceSide,act);return act;}
function finish(s){let count=0;while(s.phase==='effectChoice'&&count++<12)choose(s);assert.notEqual(s.phase,'effectChoice','stuck choice');}
function attack(s,i=0,pred){const acts=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===i),act=(pred?acts.find(pred):null)||acts[0];assert.ok(act,JSON.stringify(acts));core.applyAction(s,'player',act);finish(s);return s.log.filter(x=>x.type==='attack').at(-1);}
function rule(s,key,random=()=>0.01){return effects.applyEffect({type:'neoRule',rule:'ex9:'+key},{...core.effectContext(s,'player',{},s.sides.player.active),random});}

test('EX Emerald Lava Burn deals 20 to the Active AND 10 to the selected Bench, rather than replacing base damage',()=>{
 const s=game();const preview=core.attackDamagePreview(s,'player',0);assert.equal(preview.damage,20);
 const actions=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===0);assert.equal(actions.length,1);
 attack(s,0,a=>a.effectSelection==='bench-one');assert.equal(s.sides.opponent.active.damage,20);assert.equal(s.sides.opponent.bench[0].damage,10);
});
test('Lava Burn remains usable with no opponent Bench and retains base 20 damage',()=>{
 const s=game('ex9-25','ex9-47',false);const acts=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(acts.length);
 attack(s);assert.equal(s.sides.opponent.active.damage,20);
});
test('Lava Burn and other Bench-damage effects respect Double Rainbow reduction on each target',()=>{
 const s=game();s.sides.player.active.specialEnergy=[{uid:'rainbow',cardId:'ex9-87'}];
 attack(s);assert.equal(s.sides.opponent.active.damage,10);assert.equal(s.sides.opponent.bench[0].damage,0);
});
test('Double Rainbow reduces Swift even when attack ignores Weakness or Resistance',()=>{
 const s=game('ex9-10','ex9-96',false);s.sides.player.active.specialEnergy=[{uid:'rainbow',cardId:'ex9-87'}];
 assert.equal(core.attackDamagePreview(s,'player',1).damage,50);
 attack(s,1);assert.equal(s.sides.opponent.active.damage,50);
});
for(const id of ['ex1-93','ex9-86']){
 test(`${id} EX-era Darkness Energy adds 10 BEFORE Weakness for Darkness attackers`,()=>{
  const s=game('neo2-13','ex9-94',false);s.sides.player.active.specialEnergy=[{uid:'dark',cardId:id}];
  assert.equal(core.attackDamagePreview(s,'player',0).damage,30);
  attack(s);assert.equal(s.sides.opponent.active.damage,60,'(20+10)*2 against Darkness-weak Dusclops ex');
 });
}
for(const id of ['neo1-104','ecard1-158','ecard2-142']){
 test(`${id} Neo/e-Card Darkness Energy adds 10 AFTER Weakness even for non-Dark attackers`,()=>{
  let s=game('neo2-13','ex9-94',false);s.sides.player.active.specialEnergy=[{uid:'dark',cardId:id}];
  assert.match(core.attackDamagePreview(s,'player',0).text,/after W\/R/);
  attack(s);assert.equal(s.sides.opponent.active.damage,50,'20*2+10 against Darkness-weak Dusclops ex');
  s=game('ex9-25','ex9-96',false);s.sides.player.active.specialEnergy=[{uid:'dark',cardId:id}];
  attack(s);assert.equal(s.sides.opponent.active.damage,30,'20+10 from Neo Energy on non-Dark Combusken');
 });
}
test('EX-era Darkness Energy does not boost a Pokémon without the Darkness type or Dark name',()=>{
 const s=game('ex9-25','ex9-96',false);s.sides.player.active.specialEnergy=[{uid:'dark',cardId:'ex9-86'}];
 assert.equal(core.attackDamagePreview(s,'player',0).damage,20);attack(s);assert.equal(s.sides.opponent.active.damage,20);
});
test('PokéNav takes one of the actual top three physical cards then allows ordering the other two',()=>{
 const s=game(),p=s.sides.player;
 p.hand.unshift({uid:'nav',cardId:'ex9-81'});p.deck=[{uid:'top-a',cardId:'ex9-47'},{uid:'top-b',cardId:'ex9-48'},{uid:'top-c',cardId:'ex9-57'},...p.deck];
 const original=p.deck.length;
 const play=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='ex9-81');assert.ok(play);
 core.applyAction(s,'player',play);
 choose(s,a=>a.choiceDeckIndex===1);
 assert.ok(p.hand.some(r=>r.uid==='top-b'));assert.equal(p.deck.length,original-1);
 assert.equal(s.phase,'effectChoice','must offer real order choice for remaining top two');
 const reorders=core.legalActions(s,s.choiceSide);assert.ok(reorders.some(x=>x.choiceDeckIndex===1),JSON.stringify(reorders));
 choose(s,x=>x.choiceDeckIndex===1);finish(s);
 assert.deepEqual(p.deck.slice(0,2).map(r=>r.uid),['top-c','top-a']);
});
test('Regice ex Iceberg Crush can choose opposing Special Energy rather than auto-discard first Basic',()=>{
 const s=game('ex9-98','ex9-47',false),foe=s.sides.opponent;
 s.sides.player.bench=[slot('ex9-99','regirock')];foe.active.energy={Fire:1,Water:1};foe.active.specialEnergy=[{uid:'special-m',cardId:'ex9-89'}];
 rule(s,'98:1');assert.equal(s.phase,'effectChoice');const acts=core.legalActions(s,s.choiceSide);assert.equal(acts.length,3);assert.ok(s.pendingChoice.options.some(x=>x.includes('Multi')));
 choose(s,a=>a.choiceOption===2);assert.equal(foe.active.specialEnergy.length,0);assert.equal(foe.discard.at(-1)?.uid,'special-m');assert.equal(foe.active.energy.Fire,1);assert.equal(foe.active.energy.Water,1);
});
test('Regice ex Iceberg Crush selected Basic Energy enters defender Basic discard',()=>{
 const s=game('ex9-98','ex9-47',false),foe=s.sides.opponent;
 s.sides.player.bench=[slot('ex9-99','regirock')];foe.active.energy={Fire:1,Water:1};
 rule(s,'98:1');choose(s,a=>a.choiceOption===1);
 assert.equal(foe.energyDiscard.Water,1);assert.equal(foe.active.energy.Fire,1);assert.equal(foe.active.energy.Water,0);
});
test('Regice ex Iceberg Crush tails and absence of Regirock ex never discard Energy',()=>{
 const s=game('ex9-98','ex9-47',false);s.sides.opponent.active.energy={Fire:2};
 rule(s,'98:1');assert.equal(s.phase,'battle');assert.equal(s.sides.opponent.active.energy.Fire,2);
 s.sides.player.bench=[slot('ex9-99','regirock')];rule(s,'98:1',()=>0.99);
 assert.equal(s.phase,'battle');assert.equal(s.sides.opponent.active.energy.Fire,2);
});
test('EX Emerald energy archetype metadata distinguishes damage scaling from acceleration/recovery',()=>{
 for(const id of [14,15,22])assert.equal(ex9.cardById('ex9-'+id).deckMeta.roles.includes('energy'),false,'mis-tagged damage scaler '+id);
 for(const id of [11,79,96,99])assert.ok(ex9.cardById('ex9-'+id).deckMeta.roles.includes('energy'),'missing real Energy role '+id);
 for(const id of [25,30,41,50,52,97])assert.ok(ex9.cardById('ex9-'+id).deckMeta.roles.includes('snipe'));
 for(const id of [7,11,13,17,100])assert.ok(ex9.cardById('ex9-'+id).deckMeta.roles.includes('spread'));
 assert.equal(ex9.cardById('ex9-81').deckMeta.roles.includes('draw'),false,'PokéNav selects, it does not draw');
 assert.ok(ex9.cardById('ex9-107').deckMeta.roles.includes('draw'));
});
test('Classic Energy attachment limits remain independent: Zone then hand, not two hand cards',()=>{
 const s=game(),p=s.sides.player;p.hand=[{uid:'basic-one',cardId:'neo1-107'},{uid:'basic-two',cardId:'neo1-111'}];
 let acts=core.legalActions(s,'player');const zone=acts.find(a=>a.type==='attach'&&a.target==='active');assert.ok(zone);
 core.applyAction(s,'player',zone);assert.equal(p.energyUsed,true);assert.equal(p.handEnergyUsed,false);
 acts=core.legalActions(s,'player');const fromHand=acts.find(a=>a.type==='attachSpecial'&&a.target==='active');assert.ok(fromHand);
 core.applyAction(s,'player',fromHand);assert.equal(p.handEnergyUsed,true);assert.ok(!core.legalActions(s,'player').some(a=>a.type==='attachSpecial'));
});

test('Lady Outing EX Deoxys is a legal Energy Zone search in auto-built deck scoring, not falsely classified as hand disruption',()=>{
 const lady=data.cardById('ex8-87'),ctx=synergy.context([data.cardById('ex9-25')],['Fire']);
 assert.ok(Number.isFinite(synergy.trainerScore(lady,ctx)));
 assert.ok(synergy.metadata(lady).roles.includes('energy'));
 assert.ok(!synergy.metadata(lady).roles.includes('disruption'));
});
test('PokéNav permits ordering all three physical top cards if no legal Pokémon or Energy is among them',()=>{
 const s=game(),p=s.sides.player;
 p.hand.unshift({uid:'nav-blank',cardId:'ex9-81'});
 p.deck=[{uid:'trainer-a',cardId:'ex9-76'},{uid:'trainer-b',cardId:'ex9-79'},{uid:'trainer-c',cardId:'ex9-80'},...p.deck];
 const play=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='ex9-81');assert.ok(play);
 core.applyAction(s,'player',play);assert.equal(s.phase,'effectChoice');
 choose(s,a=>a.choiceDeckIndex===2);choose(s,a=>a.choiceDeckIndex===0);choose(s,a=>a.choiceDeckIndex===1);
 assert.deepEqual(p.deck.slice(0,3).map(r=>r.uid),['trainer-c','trainer-a','trainer-b']);
});
