'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const core=require('../app/src/main/assets/tcgp-battle-core.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const rows=JSON.parse(execFileSync('python3',['-c',`import sys,json;sys.path.insert(0,'scripts');import sm6_verified as v;print(json.dumps({'attacks':{k:d for k,(txt,d) in v.ATTACKS.items()},'abilities':{k:d for k,(txt,d) in v.ABILITIES.items()},'trainers':{k:d[1] for k,d in v.TRAINERS.items()},'unit':v.energy(['118','Unit Energy FightingDarknessFairy','Energy',[],None,[],None,[],[],None,None,0,'',['This card provides Colorless Energy.','While this card is attached to a Pokémon, it provides Fighting, Darkness, and Fairy Energy but provides only 1 Energy at a time.'],None,None])}))`],{encoding:'utf8'}));
const basic=(id,options={})=>({id,name:id,kind:'pokemon',stage:'Basic',types:['Colorless'],subtype:'Colorless',hp:200,retreat:1,battleEnabled:true,deckEligible:true,attacks:[{name:'Tap',cost:['C'],damage:20,effect:{type:'noop'}}],abilities:[],...options});
const ref=(cardId,uid)=>({cardId,uid});
const slot=(cardId,uid)=>({cardId,uid,stack:[cardId],damage:0,energy:{},specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const unitIds=['sm6-118','sm6-146'];
function setup(){const originals=data.cardById,defs=new Map([...unitIds.map(id=>[id,{id,name:'Unit Energy FightingDarknessFairy',kind:'energy',specialEnergy:true,basicEnergy:false,effect:rows.unit}]),['sm6-probe',basic('sm6-probe')]]);
 data.cardById=id=>defs.get(id)||originals(id);
 try{const s=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:54321,firstSide:'player',playerEnergyTypes:['Fighting','Darkness','Fairy'],opponentEnergyTypes:['Fighting','Darkness','Fairy']});s.phase='battle';s.activeSide='player';s.turnNumber=6;
  for(const k of ['player','opponent']){s.sides[k].turnCount=3;s.sides[k].active=slot('sm6-probe',k+'-active');s.sides[k].bench=[slot('sm6-probe',k+'-bench')];}
  return {state:s,done(){data.cardById=originals;}};
 }catch(e){data.cardById=originals;throw e;}}
const pay=(state,side,cost)=>fx.canPayCost(core.effectiveEnergy(state,side,state.sides[side].active),cost);
test('all selected new descriptions pass the effect schema; new Unit Energy is one physical unit',()=>{
 for(const [name,e] of Object.entries({...rows.attacks,...rows.trainers}))assert.deepEqual(fx.validateEffect(e),[],name);
 for(const [name,p] of Object.entries(rows.abilities))assert.deepEqual(fx.validateEffect(p.effect),[],name);
 assert.deepEqual(rows.unit,{type:'specialEnergy',provides:{Colorless:1}});
});
test('one FightingDarknessFairy Unit card pays exactly one of F/D/Y or C, never two',()=>{
 for(const side of ['player','opponent'])for(const id of unitIds){const h=setup();try{h.state.sides[side].active.specialEnergy.push(ref(id,side+'u'));for(const cost of ['F','D','Y','C'])assert.equal(pay(h.state,side,cost),true,id+' '+cost);for(const cost of ['FD','FY','DY','FF','DD','CC','G'])assert.equal(pay(h.state,side,cost),false,id+' '+cost);}finally{h.done();}}
});
test('two separate Unit cards satisfy two different costs but cannot create a third energy',()=>{const h=setup();try{h.state.sides.player.active.specialEnergy.push(ref('sm6-118','u1'),ref('sm6-146','u2'));
 for(const cost of ['FD','FY','DY','FF','CC'])assert.equal(pay(h.state,'player',cost),true,cost);
 for(const cost of ['FFD','FDY','CCC','G'])assert.equal(pay(h.state,'player',cost),false,cost);
}finally{h.done();}});
test('discard-to-deck effects must use a dedicated deck destination, never discard-to-hand',()=>{
 const result=JSON.parse(execFileSync('python3',['-c',`import sys,json;sys.path.insert(0,'scripts');import sm6_verified as v;
r=['84','Flabébé','Pokémon',['Basic'],'50',['Fairy'],None,[],[],None,None,0,'Common',[],None,None];
a=['Secret Blessings',['Y'],'','Shuffle 3 in any combination of Pokémon and basic Energy cards from your discard pile into your deck.'];
t=['143','Energy Recycler','Trainer',['Item'],None,[],None,[],[],None,None,0,'Uncommon',['Shuffle 5 basic Energy cards from your discard pile into your deck.'],None,None];
print(json.dumps([v.attack(r,a),v.trainer(t)]))`],{encoding:'utf8'}));
 assert.deepEqual(result,[{type:'sm6Rule',rule:'secretBlessings'},null],'searchChosen(discard) returns cards to hand; it must NOT stand in for shuffle-into-deck');
});
