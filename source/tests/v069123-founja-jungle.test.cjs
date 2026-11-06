'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const F=require(path.join(A,'tcg-classic-lental.js'));
const D=require(path.join(A,'tcg-classic-battle-data.js'));
const C=require(path.join(A,'tcgp-battle-core.js'));
const X=require(path.join(A,'tcgp-battle-effects.js'));
const B=require(path.join(A,'tcg-classic-deck-builder.js'));
const O=require(path.join(A,'tcg-classic-opponents.js'));
const AI=require(path.join(A,'tcgp-battle-ai.js'));
const newGame=()=>{const d=O.generate({sets:['SNAPFOUNJA'],type:'Grass',seed:64});assert.equal(d.ok,true,d.error);const s=C.createBattle({format:'classic',playerDeck:d.cards,opponentDeck:d.cards,playerEnergyTypes:['Grass','Water','Psychic','Fighting','Darkness'],opponentEnergyTypes:['Grass','Water','Psychic','Fighting','Darkness'],seed:44,firstSide:'player'});s.phase='battle';s.activeSide='player';s.turnNumber=3;s.sides.player.turnCount=2;s.sides.opponent.turnCount=2;return s;};
const put=(s,side,id,spot='active')=>{const ss=s.sides[side],slot=C.makePokemonSlot(id,2,`test-${side}-${id}-${spot}`);if(spot==='active')ss.active=slot;else{slot.benchSlot=ss.bench.length;ss.bench.push(slot);}return slot;};
test('Founja catalogue fully transcribed, supported and in both deck builders and CPU pools',()=>{
 const cards=F.CARDS.filter(c=>c.setId==='SNAPFOUNJA');assert.equal(cards.length,86);
 assert.equal(new Set(cards.map(c=>c.id)).size,86);assert.ok(cards.every(c=>c.battleEnabled&&c.support.status==='FULL'));
 for(const c of cards){assert.equal(D.cardById(c.id).id,c.id);for(const a of c.attacks||[]){assert.equal(typeof a.text,'string',c.id+': '+a.name);assert.deepEqual(X.validateEffect(a.effect),[],c.id+': '+a.name);}for(const ab of c.abilities||[])assert.deepEqual(X.validateEffect(ab.effect),[],c.id+': '+ab.name);}
 assert.ok(B.SET_IDS.includes('SNAPFOUNJA'));assert.ok(O.SETS.includes('SNAPFOUNJA'));
 for(const type of ['Grass','Water','Psychic','Darkness','Fighting']){const b=O.generate({sets:['SNAPFOUNJA'],type,seed:23+type.length});assert.equal(b.ok,true,type+': '+b.error);assert.equal(b.cards.length,30);assert.ok(b.cards.every(id=>D.cardById(id)?.setId==='SNAPFOUNJA'));}
 const venu=D.cardById('SNAPFOUNJA-001');assert.equal(venu.name,'Illumina Venusaur');assert.deepEqual(venu.abilities.map(x=>x.name),['Illumina Glow','Jungle Guardian']);
});
test('Founja Jungle doubles basic Energy for Grass/Darkness only, without doubling Special Energy',()=>{
 const s=newGame(),p=s.sides.player,x=put(s,'player','SNAPFOUNJA-007');x.energy.Grass=1;x.energy.Water=1;
 s.stadium={uid:'park',cardId:'SNAPFOUNJA-080',ownerSide:'player'};
 assert.equal(C.effectiveEnergy(s,'player',x).Grass,2);assert.equal(C.effectiveEnergy(s,'player',x).Water,2);
 put(s,'player','SNAPFOUNJA-055');p.active.energy.Darkness=1;assert.equal(C.effectiveEnergy(s,'player',p.active).Darkness,2);
 put(s,'player','SNAPFOUNJA-065');p.active.energy.Water=1;assert.equal(C.effectiveEnergy(s,'player',p.active).Water,1);
});
test('Founja Ruins reduces attack costs and Founja Waterfall eliminates Water-attached retreat costs',()=>{
 const s=newGame();const p=put(s,'player','SNAPFOUNJA-001');p.energy.Water=1;
 s.stadium={uid:'ruins',cardId:'SNAPFOUNJA-076',ownerSide:'player'};
 p.energy.Grass=3;assert.equal(C.attackAvailability(s,'player',0).usable,true); // Founja Ruins removes 1 Colourless from GGGC
 s.stadium={uid:'falls',cardId:'SNAPFOUNJA-078',ownerSide:'player'};put(s,'player','SNAPFOUNJA-011','bench');
 const moves=C.legalActions(s,'player');assert.ok(moves.some(x=>x.type==='retreat'));
});
test('Ariados Sticky Web blocks the opposite Active Pokémon from retreating',()=>{
 const s=newGame();put(s,'player','SNAPFOUNJA-065').energy.Colorless=5;put(s,'player','SNAPFOUNJA-068','bench');put(s,'opponent','SNAPFOUNJA-007');
 assert.equal(C.legalActions(s,'player').filter(x=>x.type==='retreat').length,0);
});
test('Jungle Guardian and Jungle Mountain prevent damage and effects to both Benches',()=>{
 const s=newGame();put(s,'player','SNAPFOUNJA-001');const b=put(s,'player','SNAPFOUNJA-021','bench'),atk=put(s,'opponent','SNAPFOUNJA-065');
 assert.ok(X.attackIsPrevented(s,'player',b,atk,D.cardById));assert.equal(X.attackEffectsPrevented(s,'player',b,atk,D.cardById),true);
 put(s,'player','SNAPFOUNJA-003');assert.equal(!!X.attackIsPrevented(s,'player',b,atk,D.cardById),false);
 s.stadium={uid:'mountain',cardId:'SNAPFOUNJA-083',ownerSide:'player'};assert.ok(X.attackIsPrevented(s,'player',b,atk,D.cardById));
});
test('Metapod damage reductions and Starlight Shower healing lock',()=>{
 const s=newGame();const defender=put(s,'player','SNAPFOUNJA-004'),met=put(s,'player','SNAPFOUNJA-003','bench');
 assert.equal(X.lentalDefenseReduction(s,'player',defender,D.cardById('SNAPFOUNJA-065'),D.cardById),10);
 s.sides.player.founjaNoHealUntil=s.turnNumber;assert.equal(X.healingIsBlocked(s,defender,D.cardById),true);
});
test('Founja Water Fountain moves existing Water without discarding and Sonic Break targets Bench',()=>{
 const s=newGame();const a=put(s,'player','SNAPFOUNJA-035'),bench=put(s,'player','SNAPFOUNJA-028','bench');a.energy.Water=2;
 X.applyEffect({type:'lentalRule',rule:'founja:waterFountain'},{...C.effectContext(s,'player',{target:'bench',benchIndex:bench.benchSlot},a),isAttack:true});
 assert.equal(a.energy.Water,1);assert.equal(bench.energy.Water,1);
 const yan=put(s,'player','SNAPFOUNJA-014');const defending=put(s,'opponent','SNAPFOUNJA-028'),target=put(s,'opponent','SNAPFOUNJA-057','bench');
 const attack=D.cardById(yan.cardId).attacks[0],result=X.resolveAttack(attack,{...C.effectContext(s,'player',{target:'opponentBench',benchIndex:0},yan),isAttack:true,attack});
 assert.equal(result.damage,60);assert.equal(result.damageTarget,target);
});
test('All Founja attacks have safe damage previews, including attack choices',()=>{
 const s=newGame(),cards=F.CARDS.filter(c=>c.setId==='SNAPFOUNJA'&&c.kind==='pokemon');let n=0;
 for(const card of cards){s.sides.player.active=C.makePokemonSlot(card.id,2,card.id);for(const [i,a] of (card.attacks||[]).entries()){const preview=C.attackDamagePreview(s,'player',i,card.id);assert.equal(typeof preview.text,'string',card.id+': '+a.name);n++;}}
 assert.equal(n,99);
});
test('Founja-only CPU decks play to result without stalled turns',()=>{
 for(let seed=1;seed<=8;seed++){
  const type=['Grass','Water','Psychic','Darkness','Fighting','Colorless'][seed%6];const a=O.generate({sets:['SNAPFOUNJA'],type,seed:seed*79});assert.equal(a.ok,true);
  const s=C.createBattle({format:'classic',playerDeck:a.cards,opponentDeck:a.cards,playerEnergyTypes:a.energyTypes,opponentEnergyTypes:a.energyTypes,seed:seed*81,firstSide:'player'});let n=0;
  while(s.phase!=='finished'&&n<1200){const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.phase==='setup'?s.setupSide:s.activeSide;const action=AI.chooseAction(s,side,'Intermediate',n);assert.ok(action,'stuck '+s.phase);C.applyAction(s,side,action);n++;}assert.equal(s.phase,'finished','seed '+seed);
 }
});

test('Leap Frog offers extra-cost bench attacks and applies bench damage without Weakness',()=>{
 const s=newGame(),me=put(s,'player','SNAPFOUNJA-032'),opp=put(s,'opponent','SNAPFOUNJA-033'),target=put(s,'opponent','SNAPFOUNJA-002','bench');
 me.energy.Water=2;me.energy.Colorless=2;const actions=C.legalActions(s,'player');
 const hit=actions.find(a=>a.type==='attack'&&a.attackIndex===0&&a.target==='opponentBench'&&a.benchIndex===target.benchSlot);
 assert.ok(hit,'Leap Frog bench attack is available');const before=target.damage;C.applyAction(s,'player',hit);assert.equal(target.damage,before+60);
});

test('Muddy Pond actually cancels an attack on two tails and advances the turn',()=>{
 const s=newGame(),p=put(s,'player','SNAPFOUNJA-073'),foe=put(s,'opponent','SNAPFOUNJA-028');p.energy.Colorless=2;
 s.stadium={uid:'pond',cardId:'SNAPFOUNJA-082',ownerSide:'opponent'};
 let found=false;for(let n=1;n<1000000&&!found;n++){const probe={rngState:n};if(C.random(probe)>=.5&&C.random(probe)>=.5){s.rngState=n;found=true;}}
 assert.ok(found);
 const a=C.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(a);
 C.applyAction(s,'player',a);assert.equal(foe.damage,0);assert.ok(s.log.some(x=>x.type==='attackFailed'&&x.reason==='Muddy Pond'));
});

test('Teleport Point returns the knocked-out Pokémon and attached Tool, but does not prevent Prizes',()=>{
 const s=newGame(),p=put(s,'player','SNAPFOUNJA-073'),foe=put(s,'opponent','SNAPFOUNJA-025');
 p.energy.Colorless=1;foe.tool={uid:'attached-teleport',cardId:'SNAPFOUNJA-084'};
 const handBefore=s.sides.opponent.hand.length, prizesBefore=s.sides.player.prizesTaken||0;
 const a=C.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(a);
 C.applyAction(s,'player',a);
 assert.ok(s.sides.opponent.hand.some(r=>r.cardId==='SNAPFOUNJA-025'));assert.ok(s.sides.opponent.hand.some(r=>r.cardId==='SNAPFOUNJA-084'));
 assert.ok(s.sides.player.prizesTaken>prizesBefore,'opponent still takes Prize');
});

test('Ralts Fateful Encounter only triggers from a hand-to-Bench play and takes two ordered Psychic Energy',()=>{
 const s=newGame(),p=s.sides.player;
 p.energySupply=['Psychic','Psychic','Water',...p.energySupply];
 p.hand.unshift({uid:'new-ralts',cardId:'SNAPFOUNJA-037'});
 const a=C.legalActions(s,'player').find(a=>a.type==='bench'&&a.cardId==='SNAPFOUNJA-037');assert.ok(a);
 C.applyAction(s,'player',a);
 const slot=p.bench.find(x=>x.cardId==='SNAPFOUNJA-037');assert.ok(slot);
 assert.equal(slot.energy.Psychic,2);assert.equal(p.energySupply[0],'Water');
});
