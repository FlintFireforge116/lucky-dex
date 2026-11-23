'use strict';
// Regression: Wild Edge boosts modify damage at attack declaration; after-hit
// option modals must not strand the CPU or allow a second attack in one turn.
const {test}=require('node:test'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process'),path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const ai=require('../app/src/main/assets/tcgp-battle-ai.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');
const source=fs.readFileSync(path.join(root,'app/src/main/assets/tcgp-battle-ui.js'),'utf8');
const py=spawnSync('python3',['-c',String.raw`import sys,json
sys.path.insert(0,sys.argv[1]);import xy11_verified as xy
print(json.dumps(xy.ATK['67','Wild Edge']))`,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(py.status,0,py.stderr);
const mapping=JSON.parse(py.stdout);
function withFixture(fn){
 const original=data.cardById;
 data.cardById=id=>id==='test-foe'?{
  id,name:'Target Dummy',kind:'pokemon',stage:'Basic',types:['Colorless'],hp:390,retreat:1,battleEnabled:true,
  attacks:[{name:'Rest',cost:['C'],damage:0,effect:{type:'noop'}}]
 }:original(id);
 try{return fn();}finally{data.cardById=original;}
}
function scenario(id,side='opponent'){
 const s=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:103,firstSide:side,playerEnergyTypes:['Fire'],opponentEnergyTypes:['Metal']});
 s.phase='battle';s.activeSide=side;s.turnNumber=10;
 for(const ss of Object.values(s.sides)){
  ss.turnCount=5;ss.hand=[];ss.deck=[];ss.bench=[];ss.discard=[];ss.energyDiscard={};ss.energyUsed=true;ss.handEnergyUsed=true;
 }
 const attacker=id==='xy11-67'?{Metal:1,Colorless:3}:{Colorless:3};
 const make=(cardId,uid,energy)=>({uid,cardId,stack:[cardId],damage:0,energy,specialEnergy:[],conditions:{},locks:[],tool:null,extraTools:[],playedOnSideTurn:1});
 s.sides[side].active=make(id,'attacker',attacker);
 s.sides[side==='player'?'opponent':'player'].active=make('test-foe','target',{});
 return s;
}
const opponentOf=side=>side==='player'?'opponent':'player';
const attacks=s=>s.log.filter(x=>x.type==='attack'&&x.attack==='Wild Edge');

test('Official XY11 Steelix-EX uses attack-time optional boost, not post-hit chooseOption',()=>{
 assert.deepEqual(mapping,{type:'xy11Rule',rule:'wildEdge'});
 assert.deepEqual(effects.validateEffect(mapping),[]);
 const print=data.cardById('xy11-67');
 assert.equal(print.name,'Steelix-EX');
 assert.deepEqual(print.attacks.find(a=>a.name==='Wild Edge').effect,mapping);
 assert.match(source,/cpuSafeAction\(chosen\)/,'CPU error recovery must avoid replaying the failed effect option');
});
for(const id of ['xy11-67','bw8-116']){
 const high=id==='xy11-67'?130:80,base=id==='xy11-67'?80:60;
 for(const [branch,expected] of [['base',base],['boost',high]]){
  test(`${id} ${branch} resolves once on CPU turn, without pending modal or repeat attack`,()=>withFixture(()=>{
   const s=scenario(id);
   const actions=core.legalActions(s,'opponent').filter(a=>a.type==='attack'&&a.attackIndex===0);
   assert.equal(actions.length,2,'Both legal pre-attack options must be available');
   const chosen=actions.find(a=>a.effectSelection===(branch==='boost'?'boost':id==='xy11-67'?'base':''));
   assert.ok(chosen,`Missing ${branch} option`);
   core.applyAction(s,'opponent',chosen);
   assert.equal(s.sides.player.active.damage,expected);
   assert.equal(s.sides.opponent.active.damage,branch==='boost'?20:0);
   assert.equal(s.phase,'battle','Wild Edge must not leave an unresolved choice or throw');
   assert.ok(s.pendingChoice==null,'no after-attack modal');
   assert.equal(s.activeSide,'player','CPU must yield its attack turn');
   assert.equal(attacks(s).length,1,'exactly one attack per CPU turn');
   assert.deepEqual(core.legalActions(s,'opponent').filter(a=>a.type==='attack'),[],'CPU cannot attack again');
  }));
 }
 test(`${id} live CPU chooses and resolves a Wild Edge action without sticking`,()=>withFixture(()=>{
  const s=scenario(id);
  const chosen=ai.chooseAction(s,'opponent','Beginner',5);
  assert.ok(chosen,'AI should return an action');
  if(chosen.type!=='attack'){
   const available=core.legalActions(s,'opponent').filter(a=>a.type==='attack');
   assert.ok(available.length,'AI must have legal attack choices');
  }
  const attack=chosen.type==='attack'?chosen:core.legalActions(s,'opponent').find(a=>a.type==='attack');
  core.applyAction(s,'opponent',attack);
  assert.equal(attacks(s).length,1);
  assert.equal(s.activeSide,'player');
  assert.ok(s.pendingChoice==null);
 }));
}
