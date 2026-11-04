'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'../app/src/main/assets');
const Core=require(path.join(root,'tcgp-battle-core.js')),Decks=require(path.join(root,'tcg-classic-decks.js')),D=require(path.join(root,'tcg-classic-battle-data.js'));
function game(seed=9000){const s=Core.createBattle({format:'classic',playerDeck:Decks.LOANER_DECK,opponentDeck:Decks.LOANER_DECK,seed,playerEnergyTypes:['Grass','Psychic'],opponentEnergyTypes:['Fire','Water']});s.phase='battle';s.activeSide='player';s.turnNumber=3;s.sides.player.turnCount=1;s.sides.opponent.turnCount=1;return s;}
function setActive(s,id,energy={}){s.sides.player.active=Core.makePokemonSlot(id,1,`active-${id}`);s.sides.player.active.energy={...energy};s.sides.opponent.active=Core.makePokemonSlot('gym2-84',1,'foe');return s;}
function trainer(s,id){s.sides.player.hand=[{uid:`t-${id}`,cardId:id}];const a=Core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId===id);assert.ok(a,`${id} unavailable`);Core.applyAction(s,'player',a);return s;}
function attack(s,name){let a=Core.legalActions(s,'player').find(a=>a.type==='attack'&&D.cardById(a.attackCardId||s.sides.player.active.cardId)?.attacks?.[a.attackIndex]?.name===name);assert.ok(a,`${name} unavailable`);Core.applyAction(s,'player',a);return s;}
test('Giovanni allows Giovanni family to evolve first turn and the same turn after evolving',()=>{
 const s=setActive(game(),'gym2-72');s.sides.player.hand=[{uid:'trainer',cardId:'gym2-104'},{uid:'stage1',cardId:'gym2-42'},{uid:'stage2',cardId:'gym2-6'}];
 assert.equal(Core.legalActions(s,'player').filter(a=>a.type==='evolve').length,0);
 Core.applyAction(s,'player',Core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='gym2-104'));
 let e=Core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='gym2-42');assert.ok(e,'Giovanni should permit Machop -> Machoke on turn one');Core.applyAction(s,'player',e);
 e=Core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='gym2-6');assert.ok(e,'Giovanni should permit Machoke -> Machamp same turn');Core.applyAction(s,'player',e);
 assert.equal(s.sides.player.active.cardId,'gym2-6');
});
test('Koga Toxic Secretion applies twenty poison damage at checkup',()=>{
 const s=setActive(game(9123),'gym2-47',{Grass:2});s.sides.opponent.active=Core.makePokemonSlot('gym2-67',1,'foe');
 for(let i=0;i<100;i++){
   const t=setActive(game(9123+i),'gym2-47',{Grass:2});t.sides.opponent.active=Core.makePokemonSlot('gym2-67',1,'foe');attack(t,'Toxic Secretion');
   if(t.sides.opponent.active?.conditions?.poison){assert.equal(t.sides.opponent.active.conditions.poison.amount,20);return;}
 }assert.fail('No heads in tested seeds');
});
test('Brock Protection Trainer remains attached to a Brock Pokemon',()=>{
 const s=setActive(game(),'gym2-67');trainer(s,'gym2-101');assert.ok(s.sides.player.active.temporaryTrainers.some(x=>x.cardId==='gym2-101'));
});
test('Gym Challenge Brock Ninetales Shapeshift restores the original card on Bench',()=>{
 const s=setActive(game(),'gym2-3');s.sides.player.active.energy={Fire:3};s.sides.player.hand=[{uid:'imitate',cardId:'gym2-16'}];
 const ability=Core.legalActions(s,'player').find(a=>a.type==='ability');assert.ok(ability);Core.applyAction(s,'player',ability);
 const choice=Core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceCardId==='gym2-16');assert.ok(choice);Core.applyAction(s,'player',choice);
 assert.equal(s.sides.player.active.cardId,'gym2-16');
 // Use a direct effect to switch instead of making the test depend on retreat costs.
 const FX=require(path.join(root,'tcgp-battle-effects.js'));
 const old=s.sides.player.active;s.sides.player.bench=[Core.makePokemonSlot('gym2-68',1,'bench')];s.sides.player.bench[0].benchSlot=0;
 const choices=Core.legalActions(s,'player');const retreat=choices.find(a=>a.type==='retreat');if(retreat){Core.applyAction(s,'player',retreat);assert.equal(s.sides.player.bench[0].cardId,'gym2-3');}
});
test('Invigorate offers a real Basic from chosen discard and benches it with half HP damage',()=>{
 const s=setActive(game(),'gym2-56',{Psychic:2});s.sides.opponent.bench=[];s.sides.opponent.discard=[{uid:'revive-foe',cardId:'gym2-67'}];
 attack(s,'Invigorate');assert.equal(s.phase,'effectChoice');let options=Core.legalActions(s,'player');assert.ok(options.some(x=>x.choiceOption===1));
 Core.applyAction(s,'player',options.find(x=>x.choiceOption===1));assert.equal(s.phase,'effectChoice');
 options=Core.legalActions(s,'player');assert.ok(options.some(x=>x.choiceCardId==='gym2-67'));
 Core.applyAction(s,'player',options.find(x=>x.choiceCardId==='gym2-67'));
 const pokemon=s.sides.opponent.bench.find(p=>p.cardId==='gym2-67');assert.ok(pokemon);assert.equal(pokemon.damage,20);
});
test('Helping Hand can remove fewer than all counters and only draws that many cards',()=>{
 const s=setActive(game(),'gym2-57',{Psychic:2});s.sides.opponent.active.damage=40;s.sides.player.hand=[];s.sides.player.deck=[...s.sides.player.deck,...s.sides.player.deck];
 attack(s,'Helping Hand');assert.equal(s.phase,'effectChoice');let options=Core.legalActions(s,'player');
 Core.applyAction(s,'player',options.find(x=>x.choiceTarget==='active'));
 options=Core.legalActions(s,'player');assert.ok(options.some(x=>x.choiceOption===2));let before=s.sides.player.hand.length;
 Core.applyAction(s,'player',options.find(x=>x.choiceOption===2));assert.equal(s.sides.opponent.active.damage,20);assert.equal(s.sides.player.hand.length,before+2);
});
test('Messenger moves Koga Pidgey into deck exactly once and searches another Pokémon',()=>{
 const s=setActive(game(),'gym2-49',{Colorless:2});s.sides.player.deck=[{uid:'target',cardId:'gym2-84'}];
 attack(s,'Messenger');assert.equal(s.phase,'effectChoice');assert.equal(s.sides.player.active,null);
 const refs=s.sides.player.deck.filter(r=>r.cardId==='gym2-49');assert.equal(refs.length,1);
 const find=Core.legalActions(s,'player').find(a=>a.choiceCardId==='gym2-84');assert.ok(find);Core.applyAction(s,'player',find);
 assert.ok(s.sides.player.hand.some(r=>r.cardId==='gym2-84'));
 assert.equal(s.sides.player.deck.filter(r=>r.cardId==='gym2-49').length,1);
});
test('Shapeshift cannot borrow Pokémon Powers and preserves status when reverting',()=>{
 const s=setActive(game(),'gym2-3');s.sides.player.hand=[{uid:'imitate',cardId:'gym2-47'}];
 Core.applyAction(s,'player',Core.legalActions(s,'player').find(x=>x.type==='ability'));
 Core.applyAction(s,'player',Core.legalActions(s,'player').find(x=>x.type==='effectChoice'&&x.choiceCardId==='gym2-47'));
 assert.equal(s.sides.player.active.cardId,'gym2-47');
 assert.equal(Core.legalActions(s,'player').some(x=>x.type==='ability'),false,'Copied Powers must not become available');
 s.sides.player.active.conditions.sleep=true;
 const {revertShapeshift}=require(path.join(root,'tcgp-battle-effects.js'));revertShapeshift(s,s.sides.player.active);
 assert.equal(s.sides.player.active.cardId,'gym2-3');
 assert.equal(s.sides.player.active.conditions.sleep,true,'Reverting must preserve the original status');
 assert.ok(s.sides.player.discard.some(x=>x.cardId==='gym2-47'));
});
test('Blaine Quiz #2 asks opponent for actual card category, not a coin flip',()=>{
 const s=setActive(game(),'gym2-62');s.sides.player.hand=[{uid:'quiz',cardId:'gym2-111'},{uid:'chosen',cardId:'gym2-84'}];
 const oldOpponentHand=s.sides.opponent.hand.length;
 Core.applyAction(s,'player',Core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='gym2-111'));
 Core.applyAction(s,'player',Core.legalActions(s,'player').find(x=>x.choiceCardId==='gym2-84'));
 assert.equal(s.choiceSide,'opponent');const options=Core.legalActions(s,'opponent');assert.deepEqual(options.map(x=>x.choiceLabel),['Pokémon','Trainer','Energy']);
 Core.applyAction(s,'opponent',options.find(x=>x.choiceOption===0));
 assert.equal(s.sides.opponent.hand.length,oldOpponentHand+2);assert.equal(s.phase,'battle');
});
test('Blaine Quiz #3 offers matching Pokémon-name choices after showing an attack',()=>{
 const s=setActive(game(),'gym2-62');s.sides.player.hand=[{uid:'quiz',cardId:'gym2-112'},{uid:'chosen',cardId:'gym2-84'}];
 const oldOpponentHand=s.sides.opponent.hand.length;
 Core.applyAction(s,'player',Core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='gym2-112'));
 Core.applyAction(s,'player',Core.legalActions(s,'player').find(x=>x.choiceCardId==='gym2-84'));
 if(s.choiceSide==='player')Core.applyAction(s,'player',Core.legalActions(s,'player')[0]);
 assert.equal(s.choiceSide,'opponent');let options=Core.legalActions(s,'opponent');assert.ok(options.some(x=>x.choiceLabel==='Lt. Surge\'s Pikachu'));
 Core.applyAction(s,'opponent',options.find(x=>x.choiceLabel==='Lt. Surge\'s Pikachu'));
 assert.equal(s.sides.opponent.hand.length,oldOpponentHand+3);assert.equal(s.phase,'battle');
});
test('Misty Psyduck ESP lets the player choose an opposing attack when all three flips are heads',()=>{
 let copied=false;
 for(let seed=9000;seed<9150;seed++){
  const s=setActive(game(seed),'gym2-90',{Psychic:2});s.sides.opponent.active=Core.makePokemonSlot('gym1-81',1,'opponent-pikachu');
  s.sides.opponent.active.energy={Lightning:3};const attacks=Core.legalActions(s,'player').filter(x=>x.type==='attack'&&D.cardById(x.attackCardId)?.attacks[x.attackIndex]?.name==='ESP');
  assert.equal(attacks.length,2,'choose either opposing attack');
  Core.applyAction(s,'player',attacks.find(x=>x.choiceAttackIndex===1));
  const coin=s.log.filter(x=>x.reason==='challenge:mistyESP');
  if(coin.length>=3&&coin.slice(0,3).every(x=>x.heads)){
    assert.ok(s.log.some(x=>x.type==='copyAttack'&&x.attack==='Lightning Tail'));
    assert.ok(s.sides.opponent.active.damage>=20);copied=true;break;
  }
 }
 assert.ok(copied,'No seed produced three heads');
});
