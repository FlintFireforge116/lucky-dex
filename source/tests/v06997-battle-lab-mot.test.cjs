'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const ASSETS=path.resolve(__dirname,'../app/src/main/assets');
const ui=require(path.join(ASSETS,'tcgp-battle-ui.js'));
const core=require(path.join(ASSETS,'tcgp-battle-core.js'));
const ai=require(path.join(ASSETS,'tcgp-battle-ai.js'));
const classic=require(path.join(ASSETS,'tcg-classic-decks.js'));
const pocketData=require(path.join(ASSETS,'tcgp-battle-data.js'));
const text=name=>fs.readFileSync(path.join(ASSETS,name),'utf8');

test('CPU pacing gives attacks and important plays a readable interval; animations already elapsed count towards the interval',()=>{
 const {cpuActionDwellMs:dwell,cpuRemainingDwellMs:remaining}=ui._test;
 assert.ok(dwell({type:'attack'},[])>=1600);
 assert.ok(dwell({type:'trainer'},[])>=1200);
 assert.ok(dwell({type:'attach'},[])>=1000);
 assert.ok(dwell({type:'effectChoice'},[])>=850);
 assert.ok(dwell({type:'endTurn'},[])<dwell({type:'attack'},[]));
 assert.ok(dwell({type:'trainer'},[{type:'coin',heads:true}])>dwell({type:'attach'},[]));
 assert.equal(remaining({type:'trainer'},[],300),dwell({type:'trainer'},[])-300);
 assert.equal(remaining({type:'attack'},[],2200),0);
});

test('Pocket and Classic use one paced CPU controller, complete with readable action events',()=>{
 const src=text('tcgp-battle-ui.js');
 assert.match(src,/cpuActionDwellMs\(action,logs\)/);
 assert.match(src,/cpuRemainingDwellMs\(chosen,added,Date\.now\(\)-started\)/);
 assert.match(src,/setBattleEvent\(eventForAction\(chosen,'opponent',before\)\)/);
 assert.match(src,/entry\.type==='attachSpecial'/);
 assert.match(src,/action\.type==='effectChoice'/);
 assert.ok(!src.includes('cpuTimer=setTimeout(cpuStep,220)'),'no rapid 220 ms follow-up CPU steps');
 assert.match(text('tcgp-battle.css'),/\.tcgp-live-action-event\{[^}]*font-size:11px/);
});

test('Classic AI difficulty is selectable, stored per save and defaults to previous Beginner behaviour',()=>{
 const cfg=ui._test.classicOpponentConfig();
 assert.equal(cfg.difficulty,'Beginner');
 assert.deepEqual(ai.DIFFICULTIES,['Beginner','Intermediate','Advanced','Expert']);
 assert.ok(cfg.sets.includes('neo1'));
 const src=text('tcgp-battle-ui.js');
 assert.match(src,/data-tcgp-action=\\?"classic-opponent-difficulty/);
 assert.match(src,/cfg\.opponentDifficulty=id/);
 assert.match(src,/difficulty:preferences\.difficulty/);
 assert.match(src,/id==='ecard1'\?'Expedition Base Set'/);
});

test('Classic AI values actual Prize progress, while Pocket still scores Points',()=>{
 const s=core.createBattle({format:'classic',playerDeck:classic.LOANER_DECK,opponentDeck:classic.LOANER_DECK,seed:123,firstSide:'player'});
 const side=s.sides.opponent;
 const before=ai._test.sideValue(s,'opponent',2);
 side.prizesTaken=2;
 assert.equal(ai._test.sideValue(s,'opponent',2)-before,1400);
 side.prizesTaken=0;s.format='pocket';const pocketBefore=ai._test.sideValue(s,'opponent',2);
 side.points=2;
 assert.equal(ai._test.sideValue(s,'opponent',2)-pocketBefore,1400);
});

test('Classic AI uses effective Energy, including special cards, for attack readiness',()=>{
 const slot=core.makePokemonSlot('neo1-24',0);
 const state={format:'classic',turnNumber:1,sides:{player:{active:slot,bench:[]},opponent:{active:null,bench:[]}}};
 assert.equal(ai._test.deficit(slot,{cost:'D'},state,'player'),1);
 slot.specialEnergy=[{uid:'d',cardId:'neo1-104'}];
 assert.equal(core.effectiveEnergy(state,'player',slot).Darkness,1);
 assert.equal(ai._test.deficit(slot,{cost:'D'},state,'player'),0);
 assert.equal(ai._test.deficit(slot,{cost:'DC'},state,'player'),1);
 const metal=core.makePokemonSlot('neo1-13',0);state.sides.player.active=metal;
 metal.specialEnergy=[{uid:'m',cardId:'neo1-19'}];
 assert.equal(ai._test.deficit(metal,{cost:'M'},state,'player'),0);
});

test('CPU selects legal actions at each difficulty in both battle formats',()=>{
 const suites=[
  {format:'classic',cards:classic.LOANER_DECK,types:['Fighting']},
  {format:'pocket',cards:pocketData.BEGINNER_IVYSAUR_DECK,types:['Grass']}
 ];
 for(const sample of suites)for(const level of ai.DIFFICULTIES){
  const state=core.createBattle({format:sample.format,playerDeck:sample.cards,opponentDeck:sample.cards,playerEnergyTypes:sample.types,opponentEnergyTypes:sample.types,seed:214,firstSide:'opponent'});
  for(let i=0;i<10&&state.phase!=='finished';i++){
   const side=state.phase==='setup'?state.setupSide:state.phase==='effectChoice'?state.choiceSide:state.phase==='promote'?state.promotionSide:state.activeSide;
   if(side!=='opponent')break;
   const actions=core.legalActions(state,side),chosen=ai.chooseAction(state,side,level,i);
   assert.ok(chosen,`${sample.format} ${level} has no choice at ${state.phase}`);
   assert.ok(actions.some(a=>ai.sameAction(a,chosen)),`${sample.format} ${level} action not legal`);
   core.applyAction(state,side,chosen);
  }
 }
});
