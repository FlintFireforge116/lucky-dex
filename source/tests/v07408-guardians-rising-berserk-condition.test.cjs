'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const py=spawnSync('python3',['-c',"import sys,json;sys.path.insert(0,sys.argv[1]);import sm2_verified as v;print(json.dumps({'Berserk':v.EXACT['Berserk'],'Roaring Seas':v.EXACT['Roaring Seas'],'Torrential Vortex':v.EXACT['Torrential Vortex']}))",path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(py.status,0,py.stderr);
const effects=JSON.parse(py.stdout),effect=effects.Berserk;
const makes=(id,name,hp,attacks)=>({id,name,hp,kind:'pokemon',stage:'Basic',types:['Colorless'],retreat:1,battleEnabled:true,attacks});
const cards={
 'fixture-berserk':makes('fixture-berserk','Drampa-GX',180,[{name:'Berserk',cost:['C'],damage:80,effect}]),
 'fixture-target':makes('fixture-target','Target',330,[{name:'Wait',cost:['C'],damage:10,effect:{type:'noop'}}]),
 'fixture-bench':makes('fixture-bench','Benched',100,[{name:'Wait',cost:['C'],damage:10,effect:{type:'noop'}}]),
};
const original=data.cardById;
function run(damage){data.cardById=id=>cards[id]||original(id);try{
 const state=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:42,firstSide:'player',playerEnergyTypes:['Colorless'],opponentEnergyTypes:['Colorless']});
 state.phase='battle';state.activeSide='player';state.turnNumber=5;
 const slot=(id,uid,damage=0)=>({uid,cardId:id,stack:[id],damage,energy:{Colorless:2},specialEnergy:[],conditions:{},locks:[],tool:null,extraTools:[],playedOnSideTurn:1});
 for(const board of Object.values(state.sides)){board.turnCount=3;board.hand=[];board.deck=[];board.bench=[];board.discard=[];board.energyDiscard={};board.energyUsed=true;board.handEnergyUsed=true;}
 state.sides.player.active=slot('fixture-berserk','drampa');state.sides.player.bench=[slot('fixture-bench','ally',damage)];
 state.sides.opponent.active=slot('fixture-target','target');
 const action=core.legalActions(state,'player').find(a=>a.type==='attack');assert.ok(action,'Berserk attack must remain legal');
 core.applyAction(state,'player',action);
 assert.equal(state.phase,'battle');assert.ok(state.pendingChoice==null);return state.sides.opponent.active.damage;
 }finally{data.cardById=original;}}
test('SM2 Drampa-GX Berserk: benched ally damage adds exactly 70',()=>{
 assert.deepEqual(fx.validateEffect(effect),[]);
 assert.equal(run(0),80);
 assert.equal(run(20),150);
});

test('SM2 mandatory opposing Energy discard: attack remains legal without attached Energy',()=>{
 for(const name of ['Roaring Seas','Torrential Vortex']){
  const old=cards['fixture-berserk'].attacks;cards['fixture-berserk'].attacks=[{name,cost:['C'],damage:120,effect:effects[name]}];
  try{assert.equal(run(0),120,name+' must still deal printed damage if target has no Energy');}
  finally{cards['fixture-berserk'].attacks=old;}
 }
});
