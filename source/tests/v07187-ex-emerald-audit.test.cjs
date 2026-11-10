'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets'),core=require(A+'/tcgp-battle-core.js'),set=require(A+'/tcg-classic-emerald.js'),effects=require(A+'/tcgp-battle-effects.js'),classic=require(A+'/tcg-classic-battle-data.js'),cpu=require(A+'/tcg-classic-opponents.js');
const E=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],deck=cpu.generate({sets:['ex9'],seed:28});assert.ok(deck.ok);
const slot=(id,uid)=>core.makePokemonSlot(id,2,uid);
function game(id='ex9-1',foe='ex9-96'){
 const s=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,seed:19,firstSide:'player',playerEnergyTypes:E,opponentEnergyTypes:E});s.phase='battle';s.turnNumber=9;s.activeSide='player';s.sides.player.turnCount=5;s.sides.opponent.turnCount=4;
 s.sides.player.active=slot(id,'player');s.sides.player.bench=[slot('ex9-47','ally')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.active=slot(foe,'foe');s.sides.opponent.bench=[slot('ex9-47','enemybench')];s.sides.opponent.bench[0].benchSlot=0;
 s.sides.player.active.energy={Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Colorless:4};s.sides.opponent.active.energy={Water:3};s.sides.player.energyDiscard={Grass:3,Fire:3,Water:3,Lightning:3,Psychic:3,Fighting:3};return s;
}
function choice(s,pred){assert.equal(s.phase,'effectChoice','expected choice '+JSON.stringify(s.pendingChoice));const acts=core.legalActions(s,s.choiceSide),x=acts.find(pred||(()=>false))||acts.find(x=>!x.choiceSkip)||acts[0];assert.ok(x,'no choice '+JSON.stringify(s.pendingChoice));core.applyAction(s,s.choiceSide,x);return x;}
function finish(s){let n=0;while(s.phase==='effectChoice'&&n++<30)choice(s);assert.notEqual(s.phase,'effectChoice')}
function attack(s,i=0,sel){const opts=core.legalActions(s,'player').filter(x=>x.type==='attack'&&x.attackIndex===i);const a=sel===undefined?opts[0]:opts.find(x=>x.effectSelection===sel);assert.ok(a,'attack '+i+' '+sel);core.applyAction(s,'player',a);return s;}
function used(s){return s.log.filter(x=>x.type==='attack').at(-1)?.damage}
test('EX Emerald printed attack text preserved for all cards, and no placeholder Special Effect descriptions',()=>{
 for(const c of set.CARDS.filter(c=>c.kind==='pokemon'))for(const a of c.attacks){assert.ok(a.name);assert.ok(!/special effect|effect pending/i.test(a.text||''),c.id+':'+a.name);}
});
test('Blaziken Blaze is suppressed under relevant lock and otherwise adds 40 before Weakness',()=>{
 let s=game('ex9-1');s.sides.player.active.damage=70;assert.equal(core.attackDamagePreview(s,'player',0).damage,50);
 s=game('ex9-1','ex9-12');s.sides.player.active.damage=70;attack(s);finish(s);assert.equal(used(s),50);
});
test('EX Emerald Deoxys Form Change chooses print and keeps conditions and attached energy',()=>{
 const s=game('ex9-2'),p=s.sides.player;p.active.damage=20;p.active.energy={Psychic:2};p.deck.unshift({uid:'new-form',cardId:'ex8-16'});
 const a=core.legalActions(s,'player').find(x=>x.type==='ability'&&x.cardId==='ex9-2');assert.ok(a);
 core.applyAction(s,'player',a);const c=core.legalActions(s,s.choiceSide);assert.ok(c.some(x=>x.choiceCardId==='ex8-16'));choice(s,x=>x.choiceCardId==='ex8-16');assert.equal(p.active.cardId,'ex8-16');assert.equal(p.active.energy.Psychic,2);assert.equal(p.active.damage,20);
});
test('Rayquaza Dragon Dance boosts next-turn Active damage and preview, then expires',()=>{
 const s=game('ex9-9','ex9-12');attack(s,0);finish(s);assert.equal(s.sides.player.ex9DragonDanceUntil,11);
 const end=core.legalActions(s,'opponent').find(x=>x.type==='endTurn');assert.ok(end);core.applyAction(s,'opponent',end);
 assert.equal(s.activeSide,'player');s.sides.player.active=slot('ex9-60','player-next');s.sides.player.active.energy={Lightning:3,Colorless:3};
 assert.equal(core.attackDamagePreview(s,'player',0).damage,40);attack(s,0);finish(s);assert.equal(used(s),40);
});
test('Battle Frontier blocks Colorless evolved Powers but not Basic or Grass',()=>{
 const s=game('ex9-4');s.stadium={uid:'stad',cardId:'ex9-75'};
 assert.equal(effects.abilitiesSuppressed(s,'player',s.sides.player.active,classic.cardById),false);
 s.sides.opponent.active=slot('ex9-90','opposing-altaria');assert.equal(effects.abilitiesSuppressed(s,'opponent',s.sides.opponent.active,classic.cardById),true);
 s.sides.opponent.active=slot('ex9-9','basic-ray');assert.equal(effects.abilitiesSuppressed(s,'opponent',s.sides.opponent.active,classic.cardById),false);
});
test('Medicham ex Wise Aura blocks non-ex Pokemon Powers from both sides, not EX Powers',()=>{
 const s=game('ex9-95','ex9-4');assert.equal(effects.abilitiesSuppressed(s,'opponent',s.sides.opponent.active,classic.cardById),true);
 s.sides.opponent.active=slot('ex9-93','deoxys-ex');assert.equal(effects.abilitiesSuppressed(s,'opponent',s.sides.opponent.active,classic.cardById),false);
});
test('EX Emerald Camerupt ex rejects sleep and paralysis but permits other conditions',()=>{
 const s=game('ex9-92');assert.equal(effects.statusIsPrevented(s,s.sides.player.active,classic.cardById,'sleep'),true);assert.equal(effects.statusIsPrevented(s,s.sides.player.active,classic.cardById,'paralysis'),true);assert.equal(effects.statusIsPrevented(s,s.sides.player.active,classic.cardById,'poison'),false);
});
test('Gardevoir Heal Dance heals chosen ally by 20 and consumes one Power use',()=>{
 const s=game('ex9-4'),p=s.sides.player;p.bench[0].damage=30;const a=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='ex9-4');assert.ok(a);core.applyAction(s,'player',a);choice(s,x=>x.choiceTarget==='bench');assert.equal(p.bench[0].damage,10);assert.ok(!core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId==='ex9-4'));
});
test('Shadow Beam and Pure Power place damage counters independent of defender Resistance',()=>{
 let s=game('ex9-94','ex9-96');s.sides.player.active.energy={Psychic:2};attack(s);finish(s);assert.equal(s.sides.opponent.active.damage,40);
 s=game('ex9-95','ex9-96');attack(s);finish(s);assert.equal(s.sides.opponent.active.damage,30);
});
test('Special Energy types: Double Rainbow supplies 2, Multi supplies 1 all types with no other special',()=>{
 const s=game('ex9-25');s.sides.player.active.specialEnergy=[{uid:'r',cardId:'ex9-87'}];assert.equal(core.effectiveEnergy(s,'player',s.sides.player.active).Miracle,2);
 s.sides.player.active.specialEnergy=[{uid:'m',cardId:'ex9-89'}];assert.equal(core.effectiveEnergy(s,'player',s.sides.player.active).Miracle,1);
 s.sides.player.active.specialEnergy=[{uid:'m',cardId:'ex9-89'},{uid:'r',cardId:'ex9-87'}];assert.equal(core.effectiveEnergy(s,'player',s.sides.player.active).Colorless,5);
});
test('Oran Berry heals exactly 20 between turns and discards after activation',()=>{
 const s=game('ex9-25');s.sides.player.active.damage=30;s.sides.player.active.tool={uid:'berry',cardId:'ex9-80'};
 core.endTurn(s);assert.equal(s.sides.player.active.damage,10);assert.ok(s.sides.player.discard.some(x=>x.cardId==='ex9-80'));
});
test('Lum Berry clears status and discards at next between-turn checkpoint',()=>{
 const s=game('ex9-25');s.sides.player.active.conditions={poison:{amount:10}};s.sides.player.active.tool={uid:'lum',cardId:'ex9-78'};
 core.endTurn(s);assert.equal(!!s.sides.player.active.conditions.poison,false);assert.ok(s.sides.player.discard.some(x=>x.cardId==='ex9-78'));
});
test('Mr. Stone project recovers Basic Energy from the dedicated discard zone into hand',()=>{
 const s=game(),p=s.sides.player;p.hand.unshift({uid:'stone',cardId:'ex9-79'});const a=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='ex9-79');assert.ok(a);core.applyAction(s,'player',a);
 choice(s,x=>x.choiceOption===1);choice(s,x=>x.choiceOption===0);if(s.phase==='effectChoice')choice(s,x=>x.choiceOption===0);
 assert.ok(p.hand.some(x=>x.cardId==='neo1-108'),JSON.stringify(p.hand));assert.equal(p.energyDiscard.Grass,1);
});
test('Cacturne ex blocks Special Energy to opposing Active, permitting Darkness and Metal',()=>{
 const s=game('ex9-91','ex9-96');const p=s.sides.opponent;p.hand=[{uid:'m',cardId:'ex9-89'},{uid:'d',cardId:'ex9-86'},{uid:'metal',cardId:'ex9-88'}];
 s.activeSide='opponent';const acts=core.legalActions(s,'opponent').filter(x=>x.type==='attachSpecial'&&x.target==='active');assert.equal(acts.some(x=>x.cardId==='ex9-89'),false);assert.ok(acts.some(x=>x.cardId==='ex9-86'));assert.ok(acts.some(x=>x.cardId==='ex9-88'));
});
test('Double Full Heal clears only the owners Active Special Conditions',()=>{
 const s=game('ex9-4','ex9-60');s.sides.player.active.conditions={poison:true};s.sides.opponent.active.conditions={sleep:true};
 s.sides.player.hand.unshift({uid:'full-heal',cardId:'ex9-76'});const a=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='ex9-76');assert.ok(a);core.applyAction(s,'player',a);
 assert.equal(!!s.sides.player.active.conditions.poison,false);assert.equal(!!s.sides.opponent.active.conditions.sleep,true);
});
test('Milotic ex Mystic Scale prevents attaching Technical Machines and discards existing ones',()=>{
 const s=game('ex9-25','ex9-96');const tm=classic.CARDS.find(c=>c.kind==='trainer'&&/Technical Machine/i.test(c.name));assert.ok(tm,'requires legacy Technical Machine');
 s.sides.player.active.tool={uid:'old-machine',cardId:tm.id};s.sides.player.hand.unshift({uid:'new-machine',cardId:tm.id});
 const acts=core.legalActions(s,'player');assert.equal(acts.some(x=>x.cardId===tm.id&&x.type==='trainer'),false);
 assert.equal(s.sides.player.active.tool?.cardId===tm.id,false);assert.ok(s.sides.player.discard.some(x=>x.uid==='old-machine'));
});
test('Mr. Stone project can recover a Basic Pokemon card and not just discarded basic Energy',()=>{
 const s=game(),p=s.sides.player;p.hand.unshift({uid:'stone-pokemon',cardId:'ex9-79'});p.discard.push({uid:'rare-basic',cardId:'ex9-56'});
 const a=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='ex9-79');assert.ok(a);core.applyAction(s,'player',a);
 choice(s,x=>x.choiceOption===1);choice(s,x=>x.choiceOption===6); // six energy-ledger types precede the Pokemon card
 assert.ok(p.hand.some(r=>r.uid==='rare-basic'),JSON.stringify(p.hand));assert.ok(!p.discard.some(r=>r.uid==='rare-basic'));
});
test('Form Change and Baby Evolution do not invent special-condition activation locks',()=>{
 for(const id of ['ex9-2','ex9-93','ex9-59']){const c=classic.cardById(id);assert.ok(c.abilities.some(a=>a.type==='activated'&&!a.disabledByStatus),id);}
});
test('EX Emerald Rare Candy can evolve a Basic directly into a legal Stage 2 with the real chain',()=>{
 const s=game('ex9-69','ex9-64'),p=s.sides.player;
 p.hand.unshift({uid:'candy',cardId:'ex9-83'},{uid:'stage2',cardId:'ex9-1'});
 const play=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='ex9-83');assert.ok(play);core.applyAction(s,'player',play);
 choice(s,x=>x.choiceTarget==='active');choice(s,x=>x.choiceOption===0);assert.equal(p.active.cardId,'ex9-1');assert.ok(!p.hand.some(r=>r.uid==='stage2'));
});
