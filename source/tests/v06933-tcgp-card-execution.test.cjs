const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const D=require('../app/src/main/assets/tcgp-battle-data.js'),C=require('../app/src/main/assets/tcgp-battle-core.js'),A=require('../app/src/main/assets/tcgp-battle-ai.js'),E=require('../app/src/main/assets/tcgp-battle-effects.js');
const TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
function fixture(){const b=C.createBattle({playerDeck:D.BEGINNER_IVYSAUR_DECK,opponentDeck:D.BEGINNER_IVYSAUR_DECK,seed:927,firstSide:'player'});b.turnNumber=5;b.activeSide='player';for(const [side,s]of Object.entries(b.sides)){s.turnCount=3;s.hand=[];s.active=C.makePokemonSlot('A1-001',0,side+'-active');s.active.damage=20;s.active.energy=Object.fromEntries(TYPES.map(t=>[t,10]));s.bench=[0,1,2].map(i=>({...C.makePokemonSlot('A1-014',0,side+'-bench-'+i),benchSlot:i,damage:20,energy:{Grass:4}}));s.energyAvailable=true;s.energyUsed=false;s.supporterUsed=false;}return b;}
function sane(b){assert.ok(Number.isFinite(b.turnNumber));for(const s of Object.values(b.sides)){assert.ok(s.points>=0);assert.ok(s.bench.length<=3);assert.ok(s.hand.length<=10);for(const slot of [s.active,...s.bench].filter(Boolean)){assert.ok(Number.isFinite(slot.damage)&&slot.damage>=0);for(const n of Object.values(slot.energy||{}))assert.ok(Number.isInteger(n)&&n>=0);}}}
test('every FULL attack and playable Trainer executes deterministically in a legal target fixture',()=>{
 let attacks=0,trainers=0,abilities=0,passives=0;
 for(const card of D.CARDS.filter(c=>c.battleEnabled&&!c.loaner)){
  if(card.kind==='pokemon'){
   assert.doesNotThrow(()=>C.makePokemonSlot(card.id,0,'instantiate-'+card.id));
   for(let i=0;i<card.attacks.length;i++){
    const run=()=>{const b=fixture();b.sides.player.active={...C.makePokemonSlot(card.id,0,'test-attacker'),damage:Math.min(20,card.hp-1),energy:Object.fromEntries(TYPES.map(t=>[t,10]))};const action=C.legalActions(b,'player').find(a=>a.type==='attack'&&a.attackIndex===i);assert.ok(action,card.id+' attack '+i+' must have a legal execution fixture');C.applyAction(b,'player',action);sane(b);return b;};assert.deepEqual(run(),run(),card.id+' seeded attack');attacks++;
   }
   for(const [index,ability]of (card.abilities?.length?card.abilities:[card.ability].filter(Boolean)).entries()){
    const prepare=()=>{const b=fixture(),s=b.sides.player,source={...C.makePokemonSlot(card.id,0,'ability-source'),damage:Math.min(20,card.hp-1),energy:{Psychic:5}};if(ability.effect.type==='moveEnergy')s.bench[1]={...C.makePokemonSlot('A1-115',0,'psychic-source'),benchSlot:1,energy:{Psychic:3}};if(ability.benchOnly){source.benchSlot=0;s.bench[0]=source;}else s.active=source;return {b,source};};
    if(ability.type==='activated'){const run=()=>{const {b}=prepare();const a=C.legalActions(b,'player').find(a=>a.type==='ability'&&Number(a.abilityIndex||0)===index&&(ability.benchOnly?a.target==='bench'&&a.benchIndex===0:a.target==='active'));assert.ok(a,card.id+' activated ability legal fixture');C.applyAction(b,'player',a);sane(b);return b;};assert.deepEqual(run(),run());abilities++;}
    else if(ability.type==='triggered'&&ability.event==='endTurn'){const {b}=prepare(),before=b.sides.player.hand.length;C.applyAction(b,'player',{type:'endTurn'});assert.equal(b.sides.player.hand.length,before+ability.effect.amount,card.id+' end-turn draw');sane(b);passives++;}
    else if(ability.type==='passive'||ability.event==='damagedByAttack'){const {b,source}=prepare();b.activeSide='opponent';b.sides.opponent.active.energy={Grass:5};b.sides.opponent.active.damage=0;if(ability.effect.type==='preventStatus'){E.applyEffect({type:'status',status:'poison',target:'opponentActive'},C.effectContext(b,'opponent',{}));assert.equal(!!source.conditions?.poison,false,card.id+' immunity');}const attack=C.legalActions(b,'opponent').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(attack);C.applyAction(b,'opponent',attack);if(ability.effect.type==='modifier'&&ability.effect.stat==='damageReduction'){const base=40+(card.weakness==='Grass'?20:0);assert.equal(source.damage,Math.min(20,card.hp-1)+Math.max(0,base-ability.effect.amount),card.id+' passive reduction');}if(ability.event==='damagedByAttack')assert.equal(b.sides.opponent.active.damage,ability.effect.amount,card.id+' reflection');sane(b);passives++;}
   }
  }else{
   const run=()=>{const b=fixture();b.sides.player.hand=[{uid:'trainer',cardId:card.id}];if(card.effect?.type==='playFossil')b.sides.player.bench=[];const action=C.legalActions(b,'player').find(a=>a.type==='trainer');assert.ok(action,card.id+' Trainer must have a legal target fixture');C.applyAction(b,'player',action);sane(b);return b;};assert.deepEqual(run(),run(),card.id+' seeded Trainer');trainers++;
  }
 }
 const out=path.resolve(__dirname,'../artifacts/v06933');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'card-execution.json'),JSON.stringify({attacks,trainers,activatedAbilityDefinitions:abilities,passiveOrTriggeredDefinitions:passives,crashes:0,deterministic:true},null,2));assert.ok(attacks>1000);assert.ok(trainers>0);
});
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
