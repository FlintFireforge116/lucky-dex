'use strict';
// Field-reported regression: Primal Clash Groudon-EX Rip Claw cannot be gated
// by the possible discard, and Ancient Origins Exavolt must resolve its
// optional damage before applying damage, with a safe post-damage recoil.
const {test}=require('node:test'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const python=String.raw`import json,sys
sys.path.insert(0,sys.argv[1]);import xy5_verified as p,xy7_verified as a
print(json.dumps({'rip':p.ATTACKS['85','Rip Claw'],'ripAlt':p.ATTACKS['150','Rip Claw'],
 'exavolt':a.ATTACKS['28','Exavolt'],'exavoltAlt':a.ATTACKS['88','Exavolt'],
 'thunderRod':a.ATTACKS['27','Thunder Rod']}))`;
const py=spawnSync('python3',['-c',python,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(py.status,0,py.stderr);
const mappings=JSON.parse(py.stdout);
const basic=(id,name,hp,attacks)=>({id,name,hp,kind:'pokemon',stage:'Basic',types:['Colorless'],retreat:1,battleEnabled:true,attacks});
const rip=(name,effect)=>({name,cost:['F','C'],damage:30,effect});
const mega=(effect)=>({name:'Exavolt',cost:['L','L','C','C'],damage:120,effect});
const cards={
 'xy5-85':{...basic('xy5-85','Groudon-EX',180,[rip('Rip Claw',mappings.rip)]),types:['Fighting'],pokemonEX:true},
 'xy5-150':{...basic('xy5-150','Groudon-EX',180,[rip('Rip Claw',mappings.ripAlt)]),types:['Fighting'],pokemonEX:true},
 'xy7-28':{...basic('xy7-28','M Ampharos-EX',220,[mega(mappings.exavolt)]),types:['Lightning'],pokemonEX:true},
 'xy7-88':{...basic('xy7-88','M Ampharos-EX',220,[mega(mappings.exavoltAlt)]),types:['Lightning'],pokemonEX:true},
 'fixture-foe':basic('fixture-foe','Target',300,[{name:'Rest',cost:['C'],damage:10,effect:{type:'noop'}}])
};
const orig=data.cardById;
const withCards=fn=>{data.cardById=id=>cards[id]||orig(id);try{return fn();}finally{data.cardById=orig;}};
function state(cardId,defenderEnergy={}){
 const s=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:741,firstSide:'player',playerEnergyTypes:['Fighting','Lightning'],opponentEnergyTypes:['Water']});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;
 for(const ss of Object.values(s.sides)){ss.turnCount=5;ss.hand=[];ss.deck=[];ss.bench=[];ss.discard=[];ss.energyDiscard={};ss.energyUsed=true;ss.handEnergyUsed=true;}
 const make=(id,uid,energy)=>({uid,cardId:id,stack:[id],damage:0,energy,specialEnergy:[],conditions:{},locks:[],tool:null,extraTools:[],playedOnSideTurn:1});
 s.sides.player.active=make(cardId,'attacker',cardId.startsWith('xy5')?{Fighting:1,Colorless:1}:{Lightning:2,Colorless:2});
 s.sides.opponent.active=make('fixture-foe','defender',defenderEnergy);
 return s;
}
function attack(s,predicate=()=>true){const actions=core.legalActions(s,'player').filter(x=>x.type==='attack'&&predicate(x));assert.ok(actions.length,'attack not legal: '+JSON.stringify(core.legalActions(s,'player').slice(0,15)));core.applyAction(s,'player',actions[0]);return actions[0];}

test('Official printed descriptors are valid and alternate arts use identical effects',()=>{
 for(const effect of Object.values(mappings))assert.deepEqual(fx.validateEffect(effect),[]);
 assert.deepEqual(mappings.ripAlt,mappings.rip);
 assert.deepEqual(mappings.exavoltAlt,mappings.exavolt);
 assert.equal(mappings.exavolt.type,'xy7Exavolt');
 assert.equal(mappings.thunderRod.type,'xy7ThunderRod');
});
for(const id of ['xy5-85','xy5-150']){
 test(`${id} Rip Claw is legal with no opposing Energy and still hits for 30`,()=>withCards(()=>{
  const s=state(id);attack(s);assert.equal(s.sides.opponent.active.damage,30);
  assert.equal(s.phase,'battle','attack must finish without crashing/exiting battle');
  assert.equal(s.log.filter(e=>e.type==='attack'&&e.attack==='Rip Claw').length,1);
  assert.equal(s.sides.opponent.energyDiscard?.Fighting||0,0);
 }));
 test(`${id} Rip Claw keeps its coin flip and can discard real opposing Energy`,()=>withCards(()=>{
  const s=state(id,{Water:1});s.sides.player.forceFirstCoinHeadTurn=10;attack(s);
  assert.equal(s.sides.opponent.active.damage,30);
  assert.equal(s.log.filter(e=>e.type==='coin').length,1);
  assert.equal(s.sides.opponent.active.energy.Water||0,0,'heads must discard attached Energy');
  assert.equal(s.sides.opponent.energyDiscard.Water||0,1,'discarded Basic Energy goes to opponent ledger');
 }));
 test(`${id} Rip Claw tails still deals 30 and never discards`,()=>withCards(()=>{
  const s=state(id,{Water:1});s.sides.player.dp2ForceTailsUntil=10;attack(s);
  assert.equal(s.sides.opponent.active.damage,30);
  assert.equal(s.sides.opponent.active.energy.Water,1);
  assert.equal(s.sides.opponent.energyDiscard.Water||0,0);
 }));
}
for(const id of ['xy7-28','xy7-88']){
 test(`${id} Exavolt unboosted is 120 damage without status or recoil`,()=>withCards(()=>{
  const s=state(id);const action=attack(s,a=>a.effectSelection==='base');
  assert.equal(action.effectSelection,'base');assert.equal(s.sides.opponent.active.damage,120);
  assert.equal(s.sides.player.active.damage,0);assert.ok(!s.sides.opponent.active.conditions.paralysis);
  assert.equal(s.phase,'battle');
 }));
 test(`${id} Exavolt boost is 170 damage, paralysis and 30 recoil without choice/modal crash`,()=>withCards(()=>{
  const s=state(id);const actions=core.legalActions(s,'player').filter(a=>a.type==='attack');
  assert.deepEqual(actions.map(a=>a.effectSelection).sort(),['base','boost']);
  attack(s,a=>a.effectSelection==='boost');
  assert.equal(s.sides.opponent.active.damage,170);
  assert.ok(s.sides.opponent.active.conditions.paralysis,'should paralyse the defender');
  assert.equal(s.sides.player.active.damage,30,'30 recoil damage');
  assert.ok(s.pendingChoice==null,'must not leave an after-damage choice pending');
  assert.equal(s.phase,'battle');
 }));
}
