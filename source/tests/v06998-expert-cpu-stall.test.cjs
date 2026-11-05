'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ASSETS=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(ASSETS,'tcgp-battle-core.js'));
const ai=require(path.join(ASSETS,'tcgp-battle-ai.js'));
const classic=require(path.join(ASSETS,'tcg-classic-decks.js'));
const opponents=require(path.join(ASSETS,'tcg-classic-opponents.js'));
const pocket=require(path.join(ASSETS,'tcgp-battle-data.js'));
const uiSource=fs.readFileSync(path.join(ASSETS,'tcgp-battle-ui.js'),'utf8');

function classicMatch(seed, type='Fire'){
 const opponent=opponents.generate({seed,sets:opponents.SETS,type});
 assert.ok(opponent.ok,`seed ${seed}: ${opponent.error||'no deck'}`);
 const state=core.createBattle({format:'classic',playerDeck:classic.LOANER_DECK,opponentDeck:opponent.cards,firstSide:'opponent',seed:seed+97,playerEnergyTypes:['Fighting'],opponentEnergyTypes:opponent.energyTypes,manualPlayerSetup:false});
 return state;
}
function playCpuActions(state,side='opponent',difficulty='Expert',limit=35){
 let count=0;
 for(;count<limit;count++){
  const acting=state.phase==='effectChoice'?state.choiceSide:state.phase==='promote'?state.promotionSide:state.activeSide;
  if(state.phase==='finished'||acting!==side)break;
  const legal=core.legalActions(state,side);
  assert.ok(legal.length,`CPU has no legal action in ${state.phase}`);
  let choice;
  assert.doesNotThrow(()=>{choice=ai.chooseAction(state,side,difficulty,count);});
  assert.ok(choice,`CPU should choose a legal action at step ${count}`);
  assert.doesNotThrow(()=>core.applyAction(state,side,choice));
 }
 assert.ok(count<limit||state.activeSide!==side,`CPU must not get stuck repeating plays`);
 return count;
}

test('Expert does not crash evaluating Gym Heroes Good Manners on a redacted deck',()=>{
 for(const seed of [8,10]){
  const state=classicMatch(seed);
  // Fixture explicitly supplies Good Manners: adding later sets changes seeded CPU decks.
  if(!state.sides.opponent.hand.some(x=>x.cardId==='gym1-111'))state.sides.opponent.hand.push({uid:'regression-good-manners-'+seed,cardId:'gym1-111'});
  assert.ok(core.legalActions(state,'opponent').some(a=>a.cardId==='gym1-111'));
  playCpuActions(state);
 }
});

test('Expert Classic CPU progresses through nine-set random Fire matches without unhandled AI evaluation errors',()=>{
 let actions=0;
 for(let seed=1;seed<=45;seed++){
  const state=classicMatch(seed);
  actions+=playCpuActions(state);
 }
 assert.ok(actions>=100,`expected many CPU plays, got ${actions}`);
});

test('Higher difficulty selection and Pocket opponent turns still work',()=>{
 const deck=pocket.BEGINNER_IVYSAUR_DECK;
 for(let seed=1;seed<=12;seed++){
  const state=core.createBattle({format:'pocket',playerDeck:deck,opponentDeck:deck,seed,firstSide:'opponent',playerEnergyTypes:['Grass'],opponentEnergyTypes:['Grass'],manualPlayerSetup:false});
  playCpuActions(state);
 }
 for(const difficulty of ['Beginner','Intermediate','Advanced','Expert']){
  const state=classicMatch(91,'Water');
  const action=ai.chooseAction(state,'opponent',difficulty,0);
  assert.ok(action);
  assert.doesNotThrow(()=>core.applyAction(state,'opponent',action));
 }
});

test('CPU controller protects against search/execution/presentation errors and exposes recovery in the board UI',()=>{
 assert.match(uiSource,/CPU search failed; using legal fallback/);
 assert.match(uiSource,/ai\.chooseAction\(currentBattle,'opponent','Beginner',99\)/);
 assert.match(uiSource,/CPU action failed; recovering/);
 assert.match(uiSource,/CPU presentation failed; continuing turn/);
 assert.match(uiSource,/data-tcgp-action="resume-cpu"/);
 assert.match(uiSource,/if\(action==='resume-cpu'\)return maybeCpu\(\)/);
});
