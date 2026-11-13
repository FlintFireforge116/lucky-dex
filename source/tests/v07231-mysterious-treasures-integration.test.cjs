const {test}=require('node:test'),assert=require('node:assert/strict');
const dp2=require('../app/src/main/assets/tcg-classic-mysterious-treasures');
const all=require('../app/src/main/assets/tcg-classic-battle-data');
const fx=require('../app/src/main/assets/tcgp-battle-effects');
const core=require('../app/src/main/assets/tcgp-battle-core');
const opp=require('../app/src/main/assets/tcg-classic-opponents');
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const base=opp.generate({sets:['dp1'],type:'Grass',seed:71});
const template=core.createBattle({format:'classic',playerDeck:base.cards,opponentDeck:base.cards,seed:37,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
function setup(att,def,side){const s=structuredClone(template);s.phase='battle';s.turnNumber=10;s.activeSide=side;
 for(const w of ['player','opponent'])s.sides[w].turnCount=8;
 const foe=side==='player'?'opponent':'player';s.sides[side].active=core.makePokemonSlot(att,4,'att');s.sides[foe].active=core.makePokemonSlot(def,4,'def');
 for(const w of ['player','opponent']){
  s.sides[w].active.energy=Object.fromEntries(types.map(x=>[x,5]));
  s.sides[w].bench=[core.makePokemonSlot('dp1-85',4,w+'bench1'),core.makePokemonSlot('dp1-88',4,w+'bench2')];
  s.sides[w].bench.forEach((p,i)=>{p.benchSlot=i;p.energy={Grass:1,Lightning:1};p.damage=10;});
  s.sides[w].hand=[{uid:w+'h1',cardId:'dp1-94'},{uid:w+'h2',cardId:'dp1-17'},{uid:w+'h3',cardId:'dp1-125'}];
  s.sides[w].deck=[{uid:w+'d1',cardId:'dp1-114'},{uid:w+'d2',cardId:'dp1-94'},{uid:w+'d3',cardId:'dp1-125'},...s.sides[w].deck];
  s.sides[w].discard=[{uid:w+'dis1',cardId:'dp1-125'}];s.sides[w].energyDiscard={Fire:9,Grass:5,Water:5,Lightning:5,Metal:5,Darkness:5};
 }
 return s;}
test('All Mysterious Treasures prints registered, selectable set picker and ownership',()=>{
 assert.equal(dp2.CARDS.length,124);assert.ok(all.SETS.some(s=>s.id==='dp2'));
 for(let n=1;n<=124;n++)assert.ok(all.cardById('dp2-'+n),`Missing printed card ${n}`);
 const owned=all.projectOwnedCards([{id:'dp2-13',setId:'dp2',source:'tcg',count:2}]);assert.ok(owned.some(c=>c.gameplayId==='dp2-13'&&c.quantity===2));
});
test('Every enabled effect validates and unimplemented effects stay gated',()=>{
 for(const c of dp2.CARDS.filter(c=>c.battleEnabled))for(const a of c.attacks||[])assert.deepEqual(fx.validateEffect(a.effect),[],`${c.id} ${a.name}`);
 for(const c of dp2.CARDS.filter(c=>!c.battleEnabled))assert.equal(c.deckEligible,false,c.id);
});
test('Every enabled Mysterious Treasures attack selectable and resolves for player and opponent',()=>{
 const failures=[];let paths=0;
 for(const c of dp2.CARDS.filter(x=>x.battleEnabled&&x.kind==='pokemon'))for(let i=0;i<c.attacks.length;i++)for(const side of ['player','opponent']){
  paths++;
  const s=setup(c.id,'dp1-17',side),att=c.attacks[i];
  const allowed=core.legalActions(s,side).filter(a=>a.type==='attack'&&a.attackIndex===i&&a.attackCardId===c.id);
  if(!allowed.length){failures.push(`${c.id} ${att.name} ${side}: not selectable`);continue;}
  try{core.applyAction(s,side,allowed[0]);for(let j=0;j<30&&s.phase==='effectChoice';j++){
   const actions=core.legalActions(s,s.choiceSide).filter(a=>a.type==='effectChoice');if(!actions.length)throw Error('No decisions');
   core.applyAction(s,s.choiceSide,(j>0?actions.find(a=>a.choiceSkip):null)||actions.find(a=>!a.choiceSkip)||actions[0]);}
   if(s.phase==='effectChoice')throw Error('Effect choice not resolved');
  }catch(e){failures.push(`${c.id} ${att.name} ${side}: ${String(e.message||e)}`);}
 }
 console.log('Attack paths',paths,'failures',failures.length);assert.deepEqual(failures,[]);
});

test('All enabled Mysterious Treasures Trainers offer legal plays from both seats',()=>{
 const failures=[];let count=0;
 for(const c of dp2.CARDS.filter(x=>x.battleEnabled&&x.kind==='trainer'))for(const side of ['player','opponent']){
  count++;const s=setup('dp1-17','dp1-16',side);s.sides[side].hand.unshift({uid:'target-trainer',cardId:c.id});
  s.sides[side].discard.unshift({uid:'recoverable-mon',cardId:'dp2-79'});
  if(c.id==='dp2-111')s.sides[side].deck.unshift({uid:'fossil-trainer-target',cardId:'dp2-116'});
  const plays=core.legalActions(s,side).filter(a=>a.type==='trainer'&&a.cardId===c.id);
  if(!plays.length){failures.push(c.id+' '+side+' no play');continue;}
  try{core.applyAction(s,side,plays[0]);for(let j=0;j<30&&s.phase==='effectChoice';j++){
   const options=core.legalActions(s,s.choiceSide).filter(a=>a.type==='effectChoice');if(!options.length)throw Error('No choice actions');
   const rule=s.pendingChoice?.effect?.rule,stage=s.pendingChoice?.effect?.stage;
   const selected=(rule==='dp2:115:teamGalacticsWager'&&stage==='foeRock'?options.find(a=>a.choiceOption===2):null)||options.find(a=>!a.choiceSkip)||options[0];
   core.applyAction(s,s.choiceSide,selected);}
   if(s.phase==='effectChoice')throw Error('Effect unresolved');}
  catch(e){failures.push(c.id+' '+side+' '+e.message);}
 }
 console.log('Trainer paths',count,'errors',failures.length);assert.deepEqual(failures,[]);
});
test('Every single Energy type produces a legal Mysterious Treasures CPU deck',()=>{
 for(const type of types){const result=opp.generate({sets:['dp2'],type,seed:17});assert.equal(result.cards.length,30,type);assert.deepEqual(all.validateDeck(result.cards).errors,[],type);}
});
