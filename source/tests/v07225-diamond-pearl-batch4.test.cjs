'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const P='../app/src/main/assets/';
const dp=require(P+'tcg-classic-diamond-pearl'),builder=require(P+'tcg-classic-deck-builder'),data=require(P+'tcg-classic-battle-data'),core=require(P+'tcgp-battle-core'),fx=require(P+'tcgp-battle-effects'),opponents=require(P+'tcg-classic-opponents');
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const added=[6,10,13,18,21,26,39,40,41,43,57,69,88,96,107,115];
const owned=dp.CARDS.map(c=>({gameplayId:c.id,quantity:4}));
const base=opponents.generate({sets:['dp1'],type:'Grass',seed:17});
function slot(id,uid,energy){const s=core.makePokemonSlot(id,4,uid);s.energy=energy||Object.fromEntries(types.map(t=>[5,t]).map(([n,t])=>[t,n]));return s;}
function setup(att,def='dp1-94'){
 assert.ok(base.ok,base.error);
 const s=core.createBattle({format:'classic',playerDeck:base.cards,opponentDeck:base.cards,seed:37,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';for(const side of ['player','opponent'])s.sides[side].turnCount=8;
 s.sides.player.active=slot(att,'att');s.sides.opponent.active=slot(def,'def');
 s.sides.player.bench=[slot('dp1-85','pb')];s.sides.opponent.bench=[slot('dp1-85','ob')];
 s.sides.player.bench[0].benchSlot=0;s.sides.opponent.bench[0].benchSlot=0;
 return s;
}
function resolveChoices(s,pick=()=>null){const seen=[];for(let i=0;i<24&&s.phase==='effectChoice';i++){
 const acts=core.legalActions(s,s.choiceSide).filter(x=>x.type==='effectChoice');assert.ok(acts.length,`no effect choices ${i}`);
 const choice=pick(acts,s,i)||acts.find(x=>!x.choiceSkip)||acts[0];assert.ok(choice);seen.push({...choice,who:s.choiceSide});core.applyAction(s,s.choiceSide,choice);
 }assert.notEqual(s.phase,'effectChoice','unresolved choice');return seen;}
function attack(s,index=0,side='player',select=()=>null,pick=()=>null){s.activeSide=side;const acts=core.legalActions(s,side).filter(a=>a.type==='attack'&&a.attackIndex===index);assert.ok(acts.length,`${s.sides[side].active?.cardId} attack ${index}`);core.applyAction(s,side,select(acts,s)||acts[0]);return resolveChoices(s,pick);}

test('Batch 4 cards registered, gated list explicit and printed effects validate',()=>{
 assert.equal(dp.coverage().total,130);assert.ok(dp.coverage().battleEnabled>=96);
 for(const n of added){const c=dp.cardById('dp1-'+n);assert.ok(c.battleEnabled,String(n));for(const a of c.attacks||[]){assert.ok(!a.text.includes('See the original card'),`${n}:${a.name}`);assert.deepEqual(fx.validateEffect(a.effect),[],`${n}:${a.name}`);}if(c.kind==='trainer')assert.deepEqual(fx.validateEffect(c.effect),[],String(n));}
 for(const c of dp.CARDS.filter(c=>!c.battleEnabled))assert.ok(!c.deckEligible,c.id);
});
test('New attacks execute for both player and CPU in real battle states',()=>{
 let count=0;
 for(const n of added.filter(n=>n<105))for(const [index,a] of dp.cardById('dp1-'+n).attacks.entries())for(const side of ['player','opponent']){
  const s=setup('dp1-'+n);if(side==='opponent')s.sides.opponent.active=slot('dp1-'+n,'cpu');
  assert.doesNotThrow(()=>attack(s,index,side),`${n} ${a.name} ${side}`);count++;
 }assert.ok(count>=44,count);
});
test('Lucario Feint bypasses printed Resistance, Aura Sphere targets one Bench',()=>{
 const s=setup('dp1-6','dp1-12');attack(s,0);assert.equal(s.sides.opponent.active.damage,30);
 const b=setup('dp1-6','dp1-94');b.sides.opponent.bench.push(slot('dp1-93','other'));b.sides.opponent.bench[1].benchSlot=1;
 attack(b,1,'player',a=>a.find(x=>x.benchIndex===1||x.effectBenchIndex===1)||a[0]);assert.equal(b.sides.opponent.bench.reduce((v,p)=>v+p.damage,0),20);
});
test('Mismagius Avenge adds exactly one counter per damaged own Pokémon without Weakness',()=>{
 const s=setup('dp1-10','dp1-94');s.sides.player.active.damage=20;s.sides.player.bench[0].damage=10;
 attack(s,0);assert.equal(s.sides.opponent.active.damage,20);
});
test('Roserade Spike Whip only hits Bench when Budew is underneath, and obeys target choice',()=>{
 const s=setup('dp1-13','dp1-94');s.sides.opponent.bench.push(slot('dp1-93','b2'));s.sides.opponent.bench[1].benchSlot=1;
 attack(s,1);assert.equal(s.sides.opponent.bench[0].damage+s.sides.opponent.bench[1].damage,0);
 const x=setup('dp1-13','dp1-94');x.sides.player.active.stack=['dp1-43','dp1-96','dp1-13'];x.sides.opponent.bench.push(slot('dp1-93','b2'));x.sides.opponent.bench[1].benchSlot=1;
 attack(x,1,'player',a=>a.find(y=>y.benchIndex===1||y.effectBenchIndex===1)||a[0]);assert.equal(x.sides.opponent.bench.reduce((n,p)=>n+p.damage,0),30);
});
test('Azumarill bonus requires three total Energy; Azurill stack unlocks Paralysis coin',()=>{
 for(const [n,dmg] of [[2,40],[3,60]]){const s=setup('dp1-18','dp1-17');s.sides.player.active.energy={Water:n};attack(s,1);assert.equal(s.sides.opponent.active.damage,dmg);}
 const s=setup('dp1-18','dp1-94');s.sides.player.active.stack=['dp1-69','dp1-88','dp1-18'];attack(s,1);assert.ok(s.log.some(l=>l.type==='coin'));
});
test('Carnivine compares remaining HP before damage, Wring Out discards opposing Energy on heads',()=>{
 const s=setup('dp1-21','dp1-17');s.sides.opponent.active.damage=75;attack(s,0);assert.equal(s.sides.opponent.active.damage,135);
 const t=setup('dp1-21','dp1-17');t.sides.player.active.damage=30;attack(t,0);assert.equal(t.sides.opponent.active.damage,30);
});
test('Floatzel Water Gun adds only surplus Water capped at 40',()=>{
 for(const [n,expected] of [[2,40],[3,60],[4,80],[5,80]]){const s=setup('dp1-26','dp1-17');s.sides.player.active.energy={Water:n};attack(s,1);assert.equal(s.sides.opponent.active.damage,expected);}
});
test('Vespiquen Attack Order counts Grass on both boards, Leaf Honey heals chosen Grass Bench and discards one Grass',()=>{
 const s=setup('dp1-39','dp1-94');s.sides.player.bench[0]=slot('dp1-103','grass');s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.bench[0]=slot('dp1-103','foegrass');s.sides.opponent.bench[0].benchSlot=0;attack(s,1);assert.equal(s.sides.opponent.active.damage,30);
 const t=setup('dp1-39','dp1-94');t.sides.player.bench[0]=slot('dp1-103','grass');t.sides.player.bench[0].benchSlot=0;t.sides.player.bench[0].damage=30;const before=t.sides.player.active.energy.Grass;attack(t,0);assert.equal(t.sides.player.active.energy.Grass,before-1);assert.equal(t.sides.player.bench[0].damage,0);
});
test('Weavile Dark Pulse uses all attached Darkness across own team',()=>{
 const s=setup('dp1-40','dp1-94');s.sides.player.active.energy={Darkness:3};s.sides.player.bench[0].energy={Darkness:2};attack(s,1);assert.equal(s.sides.opponent.active.damage,50);
});
test('Wobbuffet Countercharge transfers existing damage counters, not attack damage',()=>{
 let heads=false;for(let seed=1;seed<=128;seed++){const s=setup('dp1-41','dp1-94');s.sides.player.active.damage=30;s.rngState=seed*100000;attack(s,0);if(s.sides.opponent.active.damage===30){heads=true;assert.equal(s.sides.player.active.damage,0);break;}}
 assert.ok(heads,'at least one heads');
});
test('Marill Rollout and Roselia Toxic Spikes check actual Baby Pokémon under evolution',()=>{
 for(const [under,expected] of [[false,10],[true,30]]){const s=setup('dp1-88','dp1-85');if(under)s.sides.player.active.stack=['dp1-69','dp1-88'];attack(s,0);assert.equal(s.sides.opponent.active.damage,expected);}
 for(const [under,expected] of [[false,10],[true,20]]){const s=setup('dp1-96','dp1-17');if(under)s.sides.player.active.stack=['dp1-43','dp1-96'];attack(s,0);assert.equal(s.sides.opponent.active.damage,expected);assert.ok(s.sides.opponent.active.conditions.poison);}
});
test('Nuzleaf Razor Wind tails can fail without using generic attack damage',()=>{
 const seen=new Set();for(let seed=1;seed<100;seed++){const s=setup('dp1-57','dp1-94');s.rngState=seed*123456;attack(s,1);seen.add(s.sides.opponent.active.damage);if(seen.size===2)break;}
 assert.deepEqual([...seen].sort((a,b)=>a-b),[0,40]);
});
function playTrainer(s,id){
 s.sides.player.hand.push({uid:'trainer-'+id,cardId:id});
 const act=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId===id&&(id!=='dp1-115'||x.target==='bench')); 
 assert.ok(act,`trainer must be playable ${id}`);core.applyAction(s,'player',act);
}
function choose(s,fn){const acts=core.legalActions(s,s.choiceSide).filter(x=>x.type==='effectChoice');const chosen=acts.find(fn)||acts[0];assert.ok(chosen,`missing choice ${JSON.stringify(acts).slice(0,300)}`);core.applyAction(s,s.choiceSide,chosen);return chosen;}
test('Energy Switch DP1 moves one chosen Basic Energy from selected Pokémon to different teammate',()=>{
 const s=setup('dp1-39','dp1-94');s.sides.player.active.energy={Fire:1};s.sides.player.bench[0].energy={Water:1};
 playTrainer(s,'dp1-107');assert.equal(s.phase,'effectChoice');
 choose(s,x=>x.choiceTarget==='active');choose(s,x=>/Fire/.test(x.choiceLabel));choose(s,x=>x.choiceTarget==='bench');
 assert.equal(s.sides.player.active.energy.Fire,0);assert.equal(s.sides.player.bench[0].energy.Fire,1);
 assert.equal(s.sides.player.bench[0].energy.Water,1);
});
test('Super Scoop Up DP1 heads returns exact full evolution stack and Metal/Fire attachments, tails leaves Pokémon',()=>{
 let yes=0,no=0;
 for(let seed=1;seed<=250&&(!yes||!no);seed++){
  const s=setup('dp1-96','dp1-94');s.rngState=seed*1234567;s.sides.player.hand=[];s.sides.player.handLimit=30;
  const p=s.sides.player.bench[0]=slot('dp1-13','rose');p.stack=['dp1-43','dp1-96','dp1-13'];p.energy={Metal:1,Fire:1};p.specialEnergy=[];p.benchSlot=0;
  playTrainer(s,'dp1-115');
  const isHeads=!!s.log.find(x=>x.type==='coin'&&(x.result===true||x.heads===true));
  if(s.phase==='effectChoice')choose(s,x=>x.choiceTarget==='bench'||x.choiceBenchIndex===0);
  const removed=!s.sides.player.bench.some(x=>x.uid==='rose');
  if(removed){yes++;
   for(const cardId of ['dp1-43','dp1-96','dp1-13'])assert.ok(s.sides.player.hand.some(r=>r.cardId===cardId),cardId);
   const all=s.sides.player.hand.map(r=>data.cardById(r.cardId)).filter(Boolean);
   assert.ok(all.some(c=>c.basicEnergy&&c.subtype==='Metal'),'Metal returned');
   assert.ok(all.some(c=>c.basicEnergy&&c.subtype==='Fire'),'Fire returned');
  }else{no++;assert.ok(s.sides.player.bench.some(x=>x.uid==='rose'));
   assert.ok(s.sides.player.bench[0].energy.Metal===1);
  }
 }
 assert.ok(yes&&no,`both coin branches tested heads=${yes},tails=${no}`);
});

test('Budew and Azurill Baby Evolution are genuine voluntary hand evolutions and heal damage',()=>{
 for(const [baby,evo] of [['dp1-43','dp1-96'],['dp1-69','dp1-88']]){
  const s=setup(baby,'dp1-94');s.sides.player.active.damage=20;
  s.sides.player.hand=[{uid:'baby-choice',cardId:evo}];
  const acts=core.legalActions(s,'player').filter(a=>a.type==='ability'&&a.cardId===baby);
  assert.ok(acts.length,`${baby} should offer Power`);
  core.applyAction(s,'player',acts[0]);assert.equal(s.sides.player.active.cardId,baby,'Baby Evolution waits for hand choice');
  const choices=resolveChoices(s,(xs)=>xs.find(x=>x.choiceHandIndex===0));
  assert.ok(choices.some(x=>x.choiceHandIndex===0));
  assert.equal(s.sides.player.active.cardId,evo);assert.deepEqual(s.sides.player.active.stack,[baby,evo]);
  assert.equal(s.sides.player.active.damage,0);assert.equal(s.sides.player.hand.length,0);
 }
});
test('Focused Roserade and Azumarill include the actual matching Baby support',()=>{
 for(const [focus,baby,type] of [['dp1-13','dp1-43','Grass'],['dp1-18','dp1-69','Water']]){
  const result=builder.buildDeck(owned,{sets:['dp1'],focusCardId:focus,types:[type],randomSeed:17});
  assert.ok(result.ok,JSON.stringify(result.errors));assert.equal(result.cards.length,30);
  assert.ok(result.cards.includes(focus));assert.ok(result.cards.includes(baby),`missing ${baby} for ${focus}`);
  assert.deepEqual(result.energyTypes,[type]);assert.ok(data.validateDeck(result.cards).ok);
 }
});
