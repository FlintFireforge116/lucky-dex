'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const A=path.resolve(__dirname,'../app/src/main/assets');
const cards=require(path.join(A,'tcg-classic-team-magma-aqua.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const builder=require(path.join(A,'tcg-classic-deck-builder.js'));
const opponent=require(path.join(A,'tcg-classic-opponents.js'));
const picker=require(path.join(A,'tcg-classic-set-picker.js'));
const work=require(path.join(A,'tcg-classic-deck-workspace.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const synergy=require(path.join(A,'tcg-deck-synergy.js'));
const C=n=>cards.cardById('ex4-'+n);
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const sl=(n,uid)=>core.makePokemonSlot('ex4-'+n,2,uid);
const BASE=opponent.generate({sets:['ex4'],seed:29});assert.ok(BASE.ok,BASE.error);
function setup(att=1,def=95,ben=62){const s=core.createBattle({format:'classic',playerDeck:BASE.cards,opponentDeck:BASE.cards,seed:29,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});s.phase='battle';s.activeSide='player';s.turnNumber=9;s.sides.player.turnCount=5;s.sides.opponent.turnCount=4;
 s.sides.player.active=sl(att,'a');s.sides.player.active.energy=Object.fromEntries(types.map(t=>[t,10]));
 s.sides.opponent.active=sl(def,'d');s.sides.opponent.active.energy={Water:2};
 s.sides.opponent.bench=[sl(ben,'b')];s.sides.opponent.bench[0].benchSlot=0;s.sides.opponent.bench[0].energy={Water:2};return s;}
function attack(s,index,selection=''){const choices=core.legalActions(s,'player').filter(x=>x.type==='attack'&&x.attackIndex===index);const action=choices.find(x=>x.effectSelection===selection)||choices[0];assert.ok(action,'Attack not offered '+index+' '+selection);core.applyAction(s,'player',action);return s;}
function settle(s,chooser){let count=0;while(s.phase==='effectChoice'&&count++<50){const actions=core.legalActions(s,s.choiceSide);assert.ok(actions.length,JSON.stringify(s.pendingChoice));const action=chooser?.(s,actions)||actions.find(x=>!x.choiceSkip)||actions[0];core.applyAction(s,s.choiceSide,action);}assert.notEqual(s.phase,'effectChoice','Effect choice not resolved');}

test('player card filter, set picker, opponent registry, and catalogue all contain EX4',()=>{
 assert.ok(builder.SET_IDS.includes('ex4'));assert.ok(opponent.SETS.includes('ex4'));assert.equal(classic.SETS.find(x=>x.id==='ex4')?.cardCount,97);
 assert.match(picker.html({ids:builder.SET_IDS,selected:['ex4'],mode:'player'}),/data-set-choice="ex4"/);
 assert.match(picker.html({ids:opponent.SETS,selected:['ex4'],mode:'cpu'}),/data-set-choice="ex4"/);
 const rows=classic.CARDS.filter(c=>c.battleEnabled).map(c=>({gameplayId:c.id,quantity:4}));
 assert.equal(work.query(work.catalogue(rows),{filters:{set:'ex4',enabled:true},pageSize:150}).total,97);
 for(const c of cards.CARDS){const m=synergy.metadata(c);for(const field of ['roles','inflicts','payoffs','energyTypes','stages'])assert.ok(Array.isArray(m[field]),c.id+' '+field);}
});
test('100 CPU seeds and 100 player auto builds are legal; dead Team support stays out',()=>{
 const rows=classic.CARDS.filter(c=>c.battleEnabled).map(c=>({gameplayId:c.id,quantity:4}));
 const required={aqua:new Set([71,75,76,77,78,79]),magma:new Set([73,80,81,82,83,84])};
 for(let seed=1;seed<=100;seed++)for(const [name,result] of [['CPU',opponent.generate({sets:['ex4'],seed})],['Player',builder.buildDeck(rows,{sets:['ex4'],style:'random',randomSeed:seed,theme:'any'})]]){
   assert.ok(result.ok,`${name} seed=${seed}: ${result.error||result.errors}`);assert.equal(result.cards.length,30);assert.ok(classic.validateDeck(result.cards).ok);
   assert.ok(result.cards.every(id=>id.startsWith('ex4-')),`${name} unexpected expansion`);
   const deck=result.cards.map(classic.cardById),mons=deck.filter(c=>c.kind==='pokemon');
   for(const [team,numbers] of Object.entries(required)){
     const has=mons.some(c=>c.deckMeta?.team===team);
     if(!has)assert.equal(deck.filter(c=>numbers.has(Number(c.number))).length,0,`${name} ${seed} has dead ${team} support`);
   }
 }
});
test('Aqua-only and Magma-only supporters are ineligible without their target team',()=>{
 const ctx=synergy.context([C(58),C(60)],['Fighting']);
 for(const n of [71,75,76,77,78,79])assert.equal(synergy.trainerScore(C(n),ctx),-Infinity,'aqua '+n);
 for(const n of [73,80,81,82,83,84])assert.ok(Number.isFinite(synergy.trainerScore(C(n),ctx)),'magma '+n);
 const any=synergy.context([C(40)],['Fighting']);
 assert.ok(Number.isFinite(synergy.trainerScore(C(69),any)),'Schemer still draws 3 without team');
 assert.ok(synergy.metadata(C(79)).inflicts.includes('paralysis'));
 for(const status of ['sleep','poison','burn','paralysis','confusion'])assert.ok(synergy.metadata(C(79)).inflicts.includes(status));
});
test('Aqua Reverse switches opponent BEFORE damage and uses incoming Fire weakness',()=>{
 const s=setup(2,95,62);attack(s,0,'b');assert.equal(s.sides.opponent.active.cardId,'ex4-62');assert.equal(s.sides.opponent.active.damage,40);assert.equal(s.sides.opponent.bench[0].damage,0);
});
test('Team Magma Mightyena Overrun cannot hit Active and hits Bench for 10',()=>{
 const s=setup(21);const actions=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===0);
 assert.ok(actions.length);assert.ok(actions.every(a=>a.effectSelection==='b'));
 attack(s,0,'b');assert.equal(s.sides.opponent.active.damage,0);assert.equal(s.sides.opponent.bench[0].damage,10);
});
test('Claydol Clay Curse may put damage counters on two separate targets',()=>{
 const s=setup(33);attack(s,0,'d|b');assert.equal(s.sides.opponent.active.damage,10);assert.equal(s.sides.opponent.bench[0].damage,10);
 const t=setup(33);attack(t,0,'b|b');assert.equal(t.sides.opponent.active.damage,0);assert.equal(t.sides.opponent.bench[0].damage,20);
});
test('Baltoy Night Attack chooses Bench without targeting Active',()=>{
 const s=setup(61);attack(s,0,'b');assert.equal(s.sides.opponent.active.damage,0);assert.equal(s.sides.opponent.bench[0].damage,10);
});
test('Baltoy Psymist allows a different foe for each successful coin',()=>{
 let s=null;for(let seed=1;seed<=100;seed++){const trial=setup(32);trial.rngState=seed;attack(trial,0);if(trial.phase==='effectChoice'){s=trial;break;}}
 assert.ok(s,'No successful coin found in seeded tests');assert.equal(s.pendingChoice.kind,'pokemon');
 settle(s,(_s,actions)=>actions.find(a=>a.choiceTarget==='bench'&&a.choiceBenchIndex===0)||actions.find(a=>a.choiceTarget==='active')||actions[0]);
 assert.ok(s.sides.opponent.bench[0].damage>0,'Bench should receive selected counter');
});
test('Suicune ex Energy Flip hits only Benched Pokemon and can move Energy to another foe',()=>{
 const s=setup(94);const actions=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===0);
 assert.deepEqual(actions.map(a=>a.effectSelection),['b']);const before=s.sides.opponent.bench[0].energy.Water;
 attack(s,0,'b');assert.equal(s.pendingChoice.kind,'option');
 settle(s,(_s,acts)=>acts.find(a=>a.choiceOption===0)||acts.find(a=>a.choiceTarget==='active')||acts[0]);
 assert.equal(s.sides.opponent.active.energy.Water,3);assert.equal(s.sides.opponent.bench[0].energy.Water,before-1);assert.equal(s.sides.opponent.bench[0].damage,10);
});
test('Suicune ex Reverse Stream returns ALL attached basic Energy or none, never a partial amount',()=>{
 const s=setup(94);s.sides.player.active.energy={Water:3};s.sides.player.energyDiscard={Water:0};const before=s.sides.player.hand.length;
 const acts=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===1);
 assert.deepEqual(acts.map(a=>a.effectSelection),['','all']);attack(s,1,'all');assert.equal(s.sides.player.active.energy.Water,0);assert.equal(s.sides.player.hand.length,before+3);assert.equal(s.sides.player.energyDiscard.Water,0);assert.equal(s.sides.opponent.active.damage,80);
 const t=setup(94);t.sides.player.active.energy={Water:3};attack(t,1,'');assert.equal(t.sides.player.active.energy.Water,3);assert.equal(t.sides.opponent.active.damage,50);
});
test('Walrein Hydro Reverse returns Water to hand without adding it to discarded Energy ledger',()=>{
 const s=setup(6);s.sides.player.active.energy={Water:3,Colorless:2};s.sides.player.energyDiscard={Water:0};const hand=s.sides.player.hand.length;
 attack(s,1,'2');assert.equal(s.sides.player.hand.length,hand+2);assert.equal(s.sides.player.energyDiscard.Water,0);assert.equal(s.sides.opponent.active.damage,70);
});
test('Archie and Maxie can bench a Team Stage 2 and apply the printed two counters',()=>{
 for(const [trainer,pokemon] of [[71,6],[73,7]]){
  const s=setup(40);s.sides.player.bench=[];s.sides.player.hand.unshift({uid:'trainer',cardId:'ex4-'+trainer});
  const ref={uid:'stage2-'+trainer,cardId:'ex4-'+pokemon};
  if(trainer===71)s.sides.player.deck.unshift(ref);else s.sides.player.discard.unshift(ref);
  const action=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='ex4-'+trainer);assert.ok(action);
  core.applyAction(s,'player',action);
  settle(s,(_s,actions)=>actions.find(a=>a.choiceCardId===ref.cardId)||actions.find(a=>a.choiceLabel?.includes(cards.cardById(ref.cardId)?.name))||actions[0]);
  assert.equal(s.sides.player.bench.find(x=>x.cardId===ref.cardId)?.damage,20);
 }
});
test('app, Android, and both visible version labels agree',()=>{
 const gradle=fs.readFileSync(path.resolve(__dirname,'../app/build.gradle'),'utf8');
 const index=fs.readFileSync(path.join(A,'index.html'),'utf8');
 const runtime=fs.readFileSync(path.join(A,'app-v0167.js'),'utf8');
 assert.match(gradle,/versionCode 7150/);assert.match(gradle,/versionName '0\.69\.170'/);
 assert.match(runtime,/__LUCKYDEX_BUILD='0\.69\.170'/);
 assert.match(index,/id="titleBuildVersion">v0\.69\.170/);
 assert.match(index,/id="appBuildVersion">LUCKY DEX · v0\.69\.170/);
});
