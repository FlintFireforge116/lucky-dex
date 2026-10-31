const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const D=require('../app/src/main/assets/tcgp-battle-data.js'),C=require('../app/src/main/assets/tcgp-battle-core.js'),A=require('../app/src/main/assets/tcgp-battle-ai.js');
const TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
function sane(b){assert.ok(Number.isFinite(b.turnNumber));for(const s of Object.values(b.sides)){assert.ok(s.points>=0);assert.ok(s.bench.length<=3);assert.ok(s.hand.length<=10);for(const slot of [s.active,...s.bench].filter(Boolean)){assert.ok(Number.isFinite(slot.damage)&&slot.damage>=0);for(const n of Object.values(slot.energy||{}))assert.ok(Number.isInteger(n)&&n>=0);}}}
// The complete generated catalogue guard now prepares typed/conditional effects
// and aggregates every failure into artifacts/v06937/catalogue-execution.json.
require('./v06937mechanics-catalogue-execution.cjs');

test('1000 varied seeded supported-card battles terminate without crashes or impossible counters',()=>{
 const pools=TYPES.map(type=>{const names=new Set();return D.CARDS.filter(c=>c.battleEnabled&&c.kind==='pokemon'&&c.stage==='Basic'&&[type,'Colorless'].includes(c.subtype)&&c.attacks.every(a=>!a.cost.replaceAll('C','').replaceAll(({Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M'})[type],''))).filter(c=>{if(names.has(D.normalizeName(c.name)))return false;names.add(D.normalizeName(c.name));return true;});});
 let maxTurns=0,totalActions=0;const reasons={};
 for(let seed=1;seed<=1000;seed++){
  const type=TYPES[seed%TYPES.length],pool=pools[seed%TYPES.length];assert.ok(pool.length>=10,type+' test deck pool');const deck=[];for(let i=0;i<10;i++){const c=pool[(seed+i)%pool.length];deck.push(c.id,c.id);}
  const b=C.createBattle({playerDeck:deck,opponentDeck:D.BEGINNER_IVYSAUR_DECK,playerEnergyTypes:[type],seed,firstSide:seed%2?'player':'opponent'});let turns=0;
  while(b.phase!=='finished'&&turns++<150){const side=b.phase==='promote'?b.promotionSide:b.activeSide;A.runTurn(b,side,'Beginner');sane(b);}
  assert.equal(b.phase,'finished','seed '+seed);assert.ok(b.turnNumber<=50,'seed '+seed);maxTurns=Math.max(maxTurns,b.turnNumber);totalActions+=b.log.length;reasons[b.reason]=(reasons[b.reason]||0)+1;
 }
 const report={battlesCompleted:1000,stalls:0,crashes:0,maxTurns,failingSeeds:[],loggedEvents:totalActions,reasons};const out=path.resolve(__dirname,'../artifacts/v06933');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'stress.json'),JSON.stringify(report,null,2));
});
