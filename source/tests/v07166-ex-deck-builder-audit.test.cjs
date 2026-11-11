'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const work=require(path.join(A,'tcg-classic-deck-workspace.js'));
const builder=require(path.join(A,'tcg-classic-deck-builder.js'));
const opponent=require(path.join(A,'tcg-classic-opponents.js'));
const picker=require(path.join(A,'tcg-classic-set-picker.js'));
const synergy=require(path.join(A,'tcg-deck-synergy.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const source=fs.readFileSync(path.join(A,'tcg-classic-deck-editor.js'),'utf8');
const rows=classic.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
const c=id=>classic.cardById(id);

test('Normal and Test Lab Classic card-filter menu derives set list from the canonical picker',()=>{
 assert.match(source,/S\.rows\.map\(row=>row\[2\]\)/);
 assert.match(source,/data-set-era/);
 assert.match(source,/filter-all-sets/);
 for(const [id,name] of [['ex2','EX Sandstorm'],['ex3','EX Dragon']]){
  assert.ok(picker.rows.some(row=>row[0]===id&&row[1]===name));
  assert.ok(builder.SET_IDS.includes(id)&&opponent.SETS.includes(id));
  assert.match(picker.html({ids:builder.SET_IDS,selected:[id],mode:'auto'}),new RegExp(`data-set-choice="${id}"`));
  assert.equal(work.query(work.catalogue(rows),{filters:{set:id,enabled:true},pageSize:200}).total,100);
  assert.equal(work.query(work.catalogue(rows),{filters:{set:id,enabled:true,rarity:'ultra'},pageSize:200}).total,id==='ex2'?7:12); // EX Dragon: nine ex plus three secret rares
 }
});
test('Auto-build default set list includes both new EX sets on initial load and each editor reopen',()=>{
 assert.equal((source.match(/sets:\[\.\.\.B\.SET_IDS\]/g)||[]).length,2);
 assert.ok(!source.includes("'ex1','SNAPFLORIO'"),'stale hard-coded set default');
});
test('Player and CPU can each build legal set-exclusive and mixed EX decks',()=>{
 for(const [sets,style] of [[['ex2'],'random'],[['ex3'],'random'],[['ex2','ex3'],'competitive']]){
  let playerSuccess=0,cpuSuccess=0;
  for(const seed of [11,37,73,115]){
   const built=builder.buildDeck(rows,{style,sets,randomSeed:seed,theme:'any'});
   if(built.ok){playerSuccess++;assert.equal(built.cards.length,30);assert.ok(classic.validateDeck(built.cards).ok);assert.ok(built.cards.every(id=>sets.includes(c(id).setId)),built.cards.join(','));}
   const opp=opponent.generate({sets,seed,theme:'any'});
   if(opp.ok){cpuSuccess++;assert.equal(opp.cards.length,30);assert.ok(classic.validateDeck(opp.cards).ok);assert.ok(opp.cards.every(id=>sets.includes(c(id).setId)));}
  }
  assert.ok(playerSuccess>=2,`player ${sets}: ${playerSuccess}`);
  assert.ok(cpuSuccess>=2,`CPU ${sets}: ${cpuSuccess}`);
 }
});
test('EX Dragon Stadium metadata supports BOTH printed Pokémon types, not only the final type',()=>{
 const high=c('ex3-85'),low=c('ex3-86');
 assert.deepEqual(new Set(synergy.metadata(high).energyTypes),new Set(['Fire','Water']));
 assert.deepEqual(new Set(synergy.metadata(low).energyTypes),new Set(['Grass','Lightning']));
 assert.ok(synergy.metadata(high).roles.includes('retreat'));
 assert.ok(synergy.metadata(low).roles.includes('stall'));
 const context=type=>synergy.context([c({Fire:'ex3-24',Water:'ex3-65',Grass:'ex3-9',Lightning:'ex3-7',Psychic:'ex3-6'}[type])],[type]);
 for(const type of ['Fire','Water'])assert.ok(Number.isFinite(synergy.trainerScore(high,context(type))),`High Pressure ${type}`);
 for(const type of ['Grass','Lightning'])assert.ok(Number.isFinite(synergy.trainerScore(low,context(type))),`Low Pressure ${type}`);
 assert.equal(synergy.trainerScore(high,context('Psychic')),-Infinity);
 assert.equal(synergy.trainerScore(low,context('Fire')),-Infinity);
});
test('Tool and Energy recovery metadata expresses actual strategies, not status coin flips as payoffs',()=>{
 assert.ok(synergy.metadata(c('ex3-82')).roles.includes('retreat'));
 assert.ok(synergy.metadata(c('ex3-83')).roles.includes('stall'));
 assert.ok(synergy.metadata(c('ex3-84')).roles.includes('energy'));
 assert.deepEqual(synergy.metadata(c('ex3-75')).payoffs,[]);
 assert.ok(synergy.metadata(c('ex3-75')).inflicts.includes('paralysis'));
 assert.ok(synergy.metadata(c('ex2-53')).payoffs.includes('sleep'));
 assert.ok(synergy.metadata(c('ex2-53')).payoffs.includes('poison'));
});
test('Both Stadium modifiers actually apply to each of their two eligible types',()=>{
 const sample=opponent.generate({sets:['ex3'],seed:31});assert.ok(sample.ok);
 const s=core.createBattle({format:'classic',playerDeck:sample.cards,opponentDeck:sample.cards,seed:31,playerEnergyTypes:['Fire','Water','Grass','Lightning'],opponentEnergyTypes:['Fire','Water','Grass','Lightning']});
 s.phase='battle';s.activeSide='player';s.turnNumber=4;s.sides.player.turnCount=2;
 s.sides.player.bench=[core.makePokemonSlot('ex3-75',2,'bench')];s.sides.player.bench[0].benchSlot=0;
 s.stadium={cardId:'ex3-85',uid:'high'};
 for(const [id,expected] of [['ex3-24',1],['ex3-65',0],['ex3-9',1],['ex3-7',1]]){
  const slot=core.makePokemonSlot(id,2,'active'+id);s.sides.player.active=slot;
  // EX3 Camerupt has base retreat 2 -> 1; Mudkip has 1 -> 0; Roselia & Minun remain base 1.
  assert.equal(core.effectContext(s,'player',{},slot).retreatCost('player'),expected,id);
 }
 s.stadium={cardId:'ex3-86',uid:'low'};
 for(const [id,bonus] of [['ex3-9',10],['ex3-7',10],['ex3-24',0],['ex3-65',0]]){
  const slot=core.makePokemonSlot(id,2,'active'+id);s.sides.player.active=slot;
  assert.equal(core.maxHp(s,'player',slot),c(id).hp+bonus,id);
 }
});
test('EX Dragon Ninjask Quick Touch optionally transfers an exact count of Grass Energy after switching',()=>{
 const sample=opponent.generate({sets:['ex3'],seed:37});assert.ok(sample.ok);
 const state=core.createBattle({format:'classic',playerDeck:sample.cards,opponentDeck:sample.cards,seed:37,playerEnergyTypes:['Grass'],opponentEnergyTypes:['Water'],firstSide:'player'});
 state.phase='battle';state.activeSide='player';state.turnNumber=8;state.sides.player.turnCount=4;state.sides.opponent.turnCount=3;
 state.sides.player.active=core.makePokemonSlot('ex3-18',2,'ninjask');state.sides.player.active.energy={Grass:3};
 state.sides.player.bench=[core.makePokemonSlot('ex3-75',2,'swablu')];state.sides.player.bench[0].benchSlot=0;
 state.sides.opponent.active=core.makePokemonSlot('ex3-69',2,'foe');
 const a=core.legalActions(state,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(a);
 core.applyAction(state,'player',a);
 assert.equal(state.phase,'effectChoice','Quick Touch should ask whether to switch');
 const pick=core.legalActions(state,state.choiceSide).find(x=>x.choiceBenchIndex===0&&!x.choiceSkip);assert.ok(pick);
 core.applyAction(state,state.choiceSide,pick);
 assert.equal(state.sides.player.active.uid,'swablu');
 assert.equal(state.phase,'effectChoice','Quick Touch should then offer Grass Energy transfer');
 const transfer=core.legalActions(state,state.choiceSide).find(x=>x.choiceOption===2);assert.ok(transfer);
 core.applyAction(state,state.choiceSide,transfer);
 assert.equal(state.sides.player.active.energy.Grass,2);
 assert.equal(state.sides.player.bench[0].uid,'ninjask');
 assert.equal(state.sides.player.bench[0].energy.Grass,1);
});

test('Release version identifiers match the installed build',()=>{
 const gradle=fs.readFileSync(path.resolve(__dirname,'../app/build.gradle'),'utf8');
 const js=fs.readFileSync(path.join(A,'app-v0167.js'),'utf8');
 const version=gradle.match(/versionName '([^']+)'/)?.[1];assert.ok(version);
 assert.match(gradle,/versionCode \d+/);
 assert.ok(js.includes(`__LUCKYDEX_BUILD='${version}'`));
});
