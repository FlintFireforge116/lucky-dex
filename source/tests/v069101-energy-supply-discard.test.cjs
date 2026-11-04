'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(A,'tcgp-battle-core.js'));
const effects=require(path.join(A,'tcgp-battle-effects.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const ai=require(path.join(A,'tcgp-battle-ai.js'));
const ui=require(path.join(A,'tcgp-battle-ui.js'));
function mk(seed=105,types=['Grass','Water']){
 const recipe=opponents.generate({seed:43,sets:['neo1','neo2'],type:'Grass'});
 assert.ok(recipe.ok,recipe.error);
 return core.createBattle({format:'classic',playerDeck:recipe.cards,opponentDeck:recipe.cards,seed,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
}
const choose=(s,who='player',predicate=()=>true)=>{
 const action=core.legalActions(s,who).find(predicate);assert.ok(action,`no eligible ${who} action in ${s.phase}: ${JSON.stringify(s.pendingChoice)}`);core.applyAction(s,who,action);return action;
};
test('Classic Energy Zone takes its top card once per eligible turn; preview truly predicts next turn',()=>{
 const s=mk(808),me=s.sides.player;assert.equal(me.energyType!=null,true);
 assert.equal(me.nextEnergyType,me.energySupply[0]);
 const preview=me.nextEnergyType,before=me.energySupply.length;
 choose(s,'player',x=>x.type==='endTurn');
 choose(s,'opponent',x=>x.type==='endTurn');
 assert.equal(s.activeSide,'player');assert.equal(me.energyType,preview);
 assert.equal(me.energySupply.length,before-1);
 assert.equal(me.nextEnergyType,me.energySupply[0]);
 assert.equal(me.energySupply[1]===undefined,false);
});
test('Energy Ark immediately awards every head in mono Energy decks from the same supply',()=>{
 const s=mk(919,['Fire']);const me=s.sides.player,hand=me.hand.length,len=me.energySupply.length;
 effects.applyEffect({type:'neoRule',rule:'discovery:energyArk'},{...core.effectContext(s,'player',{},me.active),random:()=>.01});
 assert.equal(s.phase,'battle');assert.equal(me.hand.length,hand+2);
 assert.equal(me.hand.filter(x=>x.cardId==='neo1-107').length,2);
 assert.equal(me.energySupply.length,len-2);
 assert.equal(me.nextEnergyType,me.energySupply[0]);
 assert.equal(s.log.filter(x=>x.type==='coin').length,2);
});
test('Mixed Energy Ark displays and resolves the two type choices; each actually awards Energy',()=>{
 const s=mk(920,['Grass','Water']);const me=s.sides.player,hand=me.hand.length,len=me.energySupply.length;
 effects.applyEffect({type:'neoRule',rule:'discovery:energyArk'},{...core.effectContext(s,'player',{},me.active),random:()=>.01});
 assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.kind,'option');assert.match(s.pendingChoice.prompt,/Energy Ark.*2 heads/);
 const first=choose(s,'player',x=>x.choiceOption===0);
 assert.equal(me.hand.length,hand+1);assert.equal(s.phase,'effectChoice');
 choose(s,'player',x=>x.choiceOption===0);
 assert.equal(me.hand.length,hand+2);assert.equal(me.energySupply.length,len-2);assert.equal(s.phase,'battle');
 assert.equal(first.choiceLabel,'Grass');
});
test('Fresh Basic Energy recovery uses the Energy discard, not the supply',()=>{
 const s=mk(511,['Grass']);const me=s.sides.player;
 me.energyDiscard={Grass:2};const before=me.energySupply.length;
 effects.applyEffect({type:'energyRetrieval',energyCardIds:{Grass:'neo1-108'},amount:2},core.effectContext(s,'player',{},me.active));
 assert.equal(s.phase,'effectChoice');choose(s,'player',x=>x.type==='effectChoice'&&x.choiceLabel==='Grass');
 assert.equal(me.energyDiscard.Grass,1);assert.equal(me.energySupply.length,before);
 assert.ok(me.hand.some(x=>x.cardId==='neo1-108'));
});
test('KO deposits attached Basic Energy into dedicated discard; Special Energy retains its physical card',()=>{
 const s=mk(333,['Grass']);const me=s.sides.player,foe=s.sides.opponent;
 me.active=core.makePokemonSlot('neo1-40',3,'magmar');me.active.energy={Fire:3};me.turnCount=3;
 foe.active=core.makePokemonSlot('neo1-43',2,'phanpy');foe.active.damage=35;foe.active.energy={Water:2,Grass:1};foe.active.specialEnergy=[{uid:'metal1',cardId:'neo1-19'}];foe.bench=[];
 const action=core.legalActions(s,'player').find(x=>x.type==='attack');assert.ok(action,'Magmar attack should be legal');
 core.applyAction(s,'player',action);
 assert.equal(foe.energyDiscard.Water,2);assert.equal(foe.energyDiscard.Grass,1);
 assert.ok(foe.discard.some(x=>x.cardId==='neo1-19'));
 assert.ok(!foe.discard.some(x=>x.cardId==='neo1-111'));
});
test('UI exposes top/next/following supply and a distinct Energy discard section',()=>{
 const ss={energyType:'Grass',nextEnergyType:'Fire',energySupply:['Fire','Water','Grass'],energyTypes:['Grass','Fire','Water'],energyUsed:false,energyAvailable:true};
 const html=ui._test.liveEnergySourceHtml(ss);
 assert.match(html,/following/);assert.match(html,/Next: Fire; then: Water/);
 const source=fs.readFileSync(path.join(A,'tcgp-battle-ui.js'),'utf8');
 assert.match(source,/Discarded Energy/);assert.match(source,/tcgp-live-pile-energy-count/);assert.match(source,/tcgp-energy-ark-choice/);
});
test('Expert CPU handles multi-step Energy Ark choices without a frozen turn',()=>{
 const s=mk(344,['Grass','Water']);s.activeSide='opponent';s.sides.opponent.turnCount=3;
 effects.applyEffect({type:'neoRule',rule:'discovery:energyArk'},{...core.effectContext(s,'opponent',{},s.sides.opponent.active),random:()=>.01});
 let n=0;while(s.phase==='effectChoice'&&n<4){const action=ai.chooseAction(s,'opponent','Expert',n);assert.ok(action);core.applyAction(s,'opponent',action);n++;}
 assert.equal(s.phase,'battle');assert.equal(n,2);
});
test('Returning a Pokémon with attached Basic Energy to the deck returns that Energy to the supply, not the 30-card deck',()=>{
 const s=mk(390,['Grass']),p=s.sides.player;
 p.active=core.makePokemonSlot('neo1-61',3,'return-hoppip');p.active.energy={Grass:2};
 const deckCount=p.deck.length,supplyCount=p.energySupply.length;
 effects.applyEffect({type:'shuffleIntoDeck',target:'self',includeAttached:true},core.effectContext(s,'player',{},p.active));
 assert.equal(p.active,null);assert.equal(p.energySupply.length,supplyCount+2);
 assert.deepEqual(p.energySupply.slice(-2),['Grass','Grass']);
 assert.ok(p.deck.length>deckCount);assert.equal(p.deck.some(ref=>ref.zoneGenerated&&ref.cardId==='neo1-108'),false);
});
test('Neo Pilfer shuffles a Pokémon back without slipping generated Basic Energy into the draw deck',()=>{
 const s=mk(397,['Grass']),p=s.sides.player;
 p.active=core.makePokemonSlot('neo1-26',3,'aipom-pilfer');p.active.energy={Grass:2};
 const before=p.energySupply.length;
 effects.applyEffect({type:'neoRule',rule:'pilfer'},{...core.effectContext(s,'player',{},p.active),random:()=>.95});
 assert.equal(p.active,null);assert.equal(p.energySupply.length,before+2);
 assert.equal(p.deck.some(ref=>ref.zoneGenerated&&ref.cardId==='neo1-108'),false);
});
test('Ecogym returns a discarded Basic Energy from the Pokémon straight to its owner without consuming a new supply copy',()=>{
 const s=mk(331,['Grass','Water']),p=s.sides.player,foe=s.sides.opponent;
 s.stadium={uid:'neo-eco',cardId:'neo1-84',ownerSide:'player'};
 foe.active=core.makePokemonSlot('neo1-43',3,'foe-phanpy');foe.active.energy={Water:2};
 const before=foe.energySupply.length,hand=foe.hand.length;
 effects.applyEffect({type:'discardEnergyCard',target:'opponentActive',energyType:'Water',amount:1},{...core.effectContext(s,'player',{target:'opponentActive'}),action:{target:'opponentActive'}});
 assert.equal(foe.active.energy.Water,1);assert.equal(foe.hand.length,hand+1);
 assert.ok(foe.hand.some(r=>r.cardId==='neo1-111'));
 assert.equal(foe.energySupply.length,before);assert.equal(foe.energyDiscard.Water||0,0);
});
test('Misty Tears pays its discarded hand card and generates only Water Energy physically present in the supply',()=>{
 const s=mk(400,['Water']),p=s.sides.player;
 p.hand=[{uid:'pay-misty',cardId:'neo2-57'}];
 const before=p.energySupply.length;
 effects.applyEffect({type:'gymRule',rule:'challenge:mistyTears'},core.effectContext(s,'player',{},p.active));
 assert.equal(s.phase,'effectChoice');choose(s,'player',a=>a.type==='effectChoice'&&a.choiceHandIndex===0);
 assert.equal(p.energySupply.length,before-2);
 assert.equal(p.hand.filter(r=>r.cardId==='gym2-132').length,2);
 assert.equal(p.discard.some(r=>r.uid==='pay-misty'),true);
});
test('Discarding an Energy-bearing Benched Pokémon deposits both its Basic and Special Energy',()=>{
 const s=mk(401,['Grass']),p=s.sides.player;
 const slot=core.makePokemonSlot('neo1-61',3,'disc-early');slot.benchSlot=0;slot.energy={Grass:2};slot.specialEnergy=[{uid:'spec',cardId:'neo1-19'}];p.bench=[slot];
 effects.applyEffect({type:'discardBenchPokemon',target:'selfBench'},core.effectContext(s,'player',{target:'bench',benchIndex:0},p.active));
 assert.equal(p.bench.length,0);
 assert.equal(p.energyDiscard.Grass,2);
 assert.equal(p.discard.some(ref=>ref.uid==='spec'),true);
});
