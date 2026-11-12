'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const A='../app/src/main/assets/';
const pk=require(A+'tcg-classic-power-keepers'),cards=require(A+'tcg-classic-battle-data'),builder=require(A+'tcg-classic-deck-builder'),opp=require(A+'tcg-classic-opponents'),core=require(A+'tcgp-battle-core'),fx=require(A+'tcgp-battle-effects');
const owned=pk.CARDS.map(c=>({gameplayId:c.id,quantity:4}));
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const result=[];
test('Every ex16 Pokémon can be focused into a legal, cohesive 30-card build, one-set source',()=>{
for(const c of pk.CARDS.filter(c=>c.kind==='pokemon')){
 const d=builder.buildDeck(owned,{sets:['ex16'],focusCardId:c.id,randomSeed:19});
 if(!d.ok){result.push({id:c.id,name:c.name,error:d.errors});continue;}assert.equal(d.cards.length,30,c.id);assert.ok(d.cards.includes(c.id),c.id);
 const val=cards.validateDeck(d.cards);assert.ok(val.ok,c.id+': '+val.errors);
 const attackLines=d.cards.filter(id=>cards.cardById(id)?.kind==='pokemon').map(cards.cardById);
 const offType=attackLines.filter(x=>x.attacks?.some(a=>a.cost&&[...a.cost].some(z=>z!=='C'&&!d.energyTypes.includes(({G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal'})[z]))));
 const incomplete=attackLines.filter(x=>x.stage==='Stage 2'&&builder.familyLine(x,attackLines).length!==3);
 result.push({id:c.id,name:c.name,energy:d.energyTypes,pokemon:[...new Set(attackLines.map(x=>x.name))],offType:offType.map(x=>x.name),incomplete:incomplete.map(x=>x.name),warn:d.warnings});
 }
 console.log('FOCUSED BUILD SUMMARY',JSON.stringify({total:result.length,failures:result.filter(x=>x.error),offType:result.filter(x=>x.offType?.length).map(x=>({id:x.id,energy:x.energy,offType:x.offType})),incomplete:result.filter(x=>x.incomplete?.length).map(x=>({id:x.id,incomplete:x.incomplete})),results:result.slice(0,5)},null,2));
 assert.equal(result.length,81);
 assert.deepEqual(result.filter(x=>x.error).map(x=>x.id),['ex16-16'],'The one-set Magneton focus is intentionally excluded because its catalogued Magnezone evolution is outside this set');
 assert.ok(result.filter(x=>!x.error).every(x=>!x.offType.length),'No off-Energy-cost focused lines');
});
test('Full ex16 attack action smoke checks with deterministic state, record unresolved choices',()=>{
 const deck=opp.generate({sets:['ex16'],seed:44});assert.ok(deck.ok);
 const survey=[];
 for(const c of pk.CARDS.filter(x=>x.kind==='pokemon'))for(let i=0;i<c.attacks.length;i++){
  const s=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,seed:44,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
  s.phase='battle';s.turnNumber=12;s.activeSide='player';s.sides.player.turnCount=9;s.sides.opponent.turnCount=9;
  s.sides.player.active=core.makePokemonSlot(c.id,4,'attack');s.sides.opponent.active=core.makePokemonSlot('ex16-95',4,'defender');
  s.sides.player.active.energy=Object.fromEntries(types.map(x=>[x,6]));s.sides.opponent.active.conditions={sleep:true};
  s.sides.player.bench=[core.makePokemonSlot('ex16-59',4,'ourbench')];s.sides.player.bench[0].benchSlot=0;
  s.sides.opponent.bench=[core.makePokemonSlot('ex16-57',4,'theirbench')];s.sides.opponent.bench[0].benchSlot=0;
  s.sides.player.deck=[{uid:'test',cardId:'ex16-59'}];s.sides.player.hand=[{uid:'testhand',cardId:'ex16-57'}];
  s.sides.opponent.deck=[{uid:'testenemy',cardId:'ex16-57'}];s.sides.opponent.hand=[{uid:'testenemyhand',cardId:'ex16-57'}];
  s.sides.player.energyDiscard={Fire:2,Lightning:2,Psychic:2,Fighting:2};s.sides.opponent.energyDiscard={Fire:2,Lightning:2};
  const act=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===i);
  if(!act){survey.push({id:c.id,name:c.name,attack:c.attacks[i].name,status:'NO LEGAL ACTION'});continue;}
  try{core.applyAction(s,'player',act);let steps=0;while(s.phase==='effectChoice'&&steps++<30){const choice=core.legalActions(s,s.choiceSide).filter(a=>a.type==='effectChoice');if(!choice.length)break;const pick=choice.find(x=>!x.choiceSkip)||choice[0];core.applyAction(s,s.choiceSide,pick);}survey.push({id:c.id,name:c.name,attack:c.attacks[i].name,status:s.phase==='effectChoice'?'UNRESOLVED':'ok',steps,damage:s.sides.opponent.active?.damage});}
  catch(err){survey.push({id:c.id,name:c.name,attack:c.attacks[i].name,status:'ERROR '+err.message});}
 }
 console.log('ATTACK SURVEY',JSON.stringify({attacks:survey.length,problems:survey.filter(r=>r.status!=='ok')},null,2));
 assert.ok(survey.every(r=>r.status==='ok'),'Failed: '+JSON.stringify(survey.filter(r=>r.status!=='ok')));
});

test('EX16 single-type locked decks remain strictly mono-type over 64 seeded builds',()=>{
 for(const type of types)for(let seed=10;seed<18;seed++){
  const d=builder.buildDeck(owned,{sets:['ex16'],types:[type],randomSeed:seed});
  assert.ok(d.ok,`${type}/${seed}: ${JSON.stringify(d.errors)}`);
  assert.deepEqual(d.energyTypes,[type],`${type}/${seed} must not introduce an unselected Basic Energy type`);
  assert.ok(cards.validateDeck(d.cards).ok,`${type}/${seed} legal deck`);
 }
});
