'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const P='../app/src/main/assets/';
const dp=require(P+'tcg-classic-diamond-pearl'),builder=require(P+'tcg-classic-deck-builder'),data=require(P+'tcg-classic-battle-data'),core=require(P+'tcgp-battle-core'),fx=require(P+'tcgp-battle-effects'),opponents=require(P+'tcg-classic-opponents');
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const added=[15,36,37,42,48,54,78,80,81,91,106,108,111];
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


test('Stage 5 cards are registered with printed descriptions and validated effects',()=>{
 assert.equal(dp.coverage().total,130);assert.equal(dp.coverage().battleEnabled,96);
 for(const n of added){const c=dp.cardById('dp1-'+n);assert.ok(c.battleEnabled,String(n));for(const a of c.attacks||[]){assert.ok(!a.text.includes('See the original card'),`${n}:${a.name}`);assert.deepEqual(fx.validateEffect(a.effect),[],`${n}:${a.name}`);}if(c.kind==='trainer')assert.deepEqual(fx.validateEffect(c.effect),[],String(n));}
});
test('New attack smoke tests execute as both player and CPU',()=>{
 let count=0;for(const n of added.filter(n=>n<105))for(const [i,a] of dp.cardById('dp1-'+n).attacks.entries())for(const side of ['player','opponent']){
  const s=setup('dp1-'+n);if(side==='opponent')s.sides.opponent.active=slot('dp1-'+n,'cpu');
  assert.doesNotThrow(()=>attack(s,i,side),`${n} ${a.name} ${side}`);count++;
 }assert.ok(count>=30,count);
});
test('Baby Evolution offers correct hand target, preserves stack, heals, and remains voluntary',()=>{
 for(const [baby,evo] of [['dp1-42','dp1-41'],['dp1-48','dp1-81'],['dp1-78','dp1-77']]){
  const s=setup(baby);s.sides.player.active.damage=20;s.sides.player.hand=[{uid:'evo-'+evo,cardId:evo}];
  const ability=core.legalActions(s,'player').find(x=>x.type==='ability'&&x.cardId===baby);assert.ok(ability,`${baby} activate`);
  assert.equal(s.sides.player.active.cardId,baby,'doing nothing declines optional Baby Evolution');
  core.applyAction(s,'player',ability);resolveChoices(s,(acts)=>acts.find(x=>x.choiceHandIndex===0));
  assert.equal(s.sides.player.active.cardId,evo);assert.deepEqual(s.sides.player.active.stack,[baby,evo]);assert.equal(s.sides.player.active.damage,0);
 }
});
test('Snorlax retains Munchlax bonus only with actual Baby underneath, and sleeps after attack',()=>{
 for(const [baby,expected] of [[false,40],[true,70]]){const s=setup('dp1-37','dp1-17');if(baby)s.sides.player.active.stack=['dp1-33','dp1-37'];attack(s,1);assert.equal(s.sides.opponent.active.damage,expected);assert.ok(s.log.some(x=>x.type==='status'&&x.status==='sleep'&&x.affectedBySide?.player===1),'Sleep applied before between-turn wake-up');}
});
test('Electabuzz Shock Wave bonus damages Bench only with Elekid underneath',()=>{
 for(const [baby,amount] of [[false,0],[true,20]]){const s=setup('dp1-81','dp1-17');if(baby)s.sides.player.active.stack=['dp1-48','dp1-81'];attack(s,1,'player',acts=>acts.find(x=>x.benchIndex===0)||acts[0]);assert.equal(s.sides.opponent.bench[0].damage,amount);}
});
test('Misdreavus and Wynaut select a hidden card position and return exact card to deck',()=>{
 for(const id of ['dp1-42','dp1-91']){const s=setup(id,'dp1-17');s.sides.opponent.hand=[{uid:'one',cardId:'dp1-94'},{uid:'two',cardId:'dp1-97'}];
  const before=s.sides.opponent.deck.length;const choices=attack(s,0,'player',()=>null,acts=>acts.find(x=>x.choiceOption===1));
  assert.ok(choices.some(x=>x.choiceOption===1),id);
  assert.ok(s.sides.opponent.hand.some(x=>x.uid==='one'));assert.ok(!s.sides.opponent.hand.some(x=>x.uid==='two'));assert.ok(s.log.some(x=>x.type==='ex16Surprise'&&x.revealedCardId==='dp1-97'));
 }
});
test('Purugly High Hat discards selected hidden card, not random or a revealed card',()=>{
 const s=setup('dp1-36','dp1-17');s.sides.opponent.hand=[{uid:'one',cardId:'dp1-94'},{uid:'two',cardId:'dp1-97'}];
 const picks=attack(s,0,'player',()=>null,acts=>acts.find(x=>x.choiceOption===1));assert.ok(picks.some(x=>x.choiceOption===1));
 assert.ok(s.sides.opponent.hand.some(x=>x.uid==='one'));assert.ok(!s.sides.opponent.hand.some(x=>x.uid==='two'));assert.ok(s.sides.opponent.discard.some(x=>x.uid==='two'));
});
test('Night Pokémon Center targets chosen Pokémon; two heads heal and two tails remove all Basic and Special Energy',()=>{
 let heads=false,tails=false;
 for(let seed=1;seed<1000&&(!heads||!tails);seed++){
  const s=setup('dp1-17');s.sides.player.hand=[{uid:'npc',cardId:'dp1-108'}];s.sides.player.bench[0].damage=20;s.sides.player.bench[0].energy={Water:2};
  s.rngState=seed*12345;const action=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='dp1-108');assert.ok(action);core.applyAction(s,'player',action);
  const choices=resolveChoices(s,acts=>acts.find(x=>x.choiceTarget==='bench'));assert.ok(choices.length);
  const logs=s.log.filter(x=>x.reason==='Night Pokémon Center');assert.equal(logs.length,1);const count=logs[0].results.filter(Boolean).length;
  if(count===2){heads=true;assert.equal(s.sides.player.bench[0].damage,0);assert.equal(s.sides.player.bench[0].energy.Water,2);}
  if(count===0){tails=true;assert.equal(s.sides.player.bench[0].damage,20);assert.equal(s.sides.player.bench[0].energy.Water,0);assert.equal(s.sides.player.energyDiscard.Water>=2,true);}
 }
 assert.ok(heads&&tails,'both uncommon coin outcomes');
});
test('Pokédex HANDY910is takes chosen top-two card, puts other at deck bottom and preserves remaining deck order',()=>{
 const s=setup('dp1-17');s.sides.player.deck=[{uid:'top1',cardId:'dp1-94'},{uid:'top2',cardId:'dp1-97'},{uid:'other',cardId:'dp1-103'}];s.sides.player.hand=[{uid:'dex',cardId:'dp1-111'}];
 const action=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='dp1-111');assert.ok(action);core.applyAction(s,'player',action);
 resolveChoices(s,acts=>acts.find(x=>x.choiceOption===1));
 assert.ok(s.sides.player.hand.some(r=>r.uid==='top2'));assert.deepEqual(s.sides.player.deck.map(r=>r.uid),['other','top1']);
});
test('Energy Restore rolls exactly three coins, retrieves no more than heads and actual Basic Energy in discard',()=>{
 let recovered=0;for(let seed=1;seed<60;seed++){
  const s=setup('dp1-17');s.sides.player.hand=[{uid:'restore',cardId:'dp1-106'}];s.sides.player.energyDiscard={Water:3};s.sides.player.discard=[];s.rngState=seed*12345;
  const action=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='dp1-106');assert.ok(action);core.applyAction(s,'player',action);resolveChoices(s,acts=>acts.find(x=>x.choiceOption===0));
  const heads=s.log.filter(l=>String(l.reason||'').startsWith('Energy Restore')).filter(l=>l.results?.[0]).length;
  const n=s.sides.player.hand.filter(r=>r.cardId==='dp1-125').length;
  assert.ok(n<=heads&&n<=3,`retrieved ${n} with ${heads} heads`);assert.equal(s.sides.player.energyDiscard.Water,3-n);
  recovered+=n;
 }assert.ok(recovered>0);
});

test('Skuntank Toxic Cloud applies 20-damage Poison only on successful coin; Frustration excludes damaged targets',()=>{
 let heads=false,tails=false;
 for(let seed=1;seed<300&&(!heads||!tails);seed++){
  const s=setup('dp1-15','dp1-17');s.rngState=seed*9871;
  attack(s,1);const c=s.sides.opponent.active?.conditions?.poison;
  if(c){heads=true;assert.equal(c.amount,20);assert.ok(s.log.some(x=>x.type==='statusDamage'&&x.side==='opponent'&&x.status==='poison'&&x.amount===20),'between-turn Poison tick must do 20');}else tails=true;
 }
 assert.ok(heads&&tails);
 const s=setup('dp1-15','dp1-17');s.sides.opponent.active.damage=10;
 const actions=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===0);
 assert.ok(actions.every(a=>a.target!=='opponentActive'),'Damaged Active must not be targetable');
});

test('Magneton Magnetic Ray is an optional pre-damage switch to Energy-bearing Bench',()=>{
 for(const choose of [false,true]){
  const s=setup('dp1-54','dp1-17');s.sides.opponent.bench[0].energy={Metal:1};
  const actions=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===1);
  assert.ok(actions.length>0);
  const picked=actions.find(a=>a.effectSelection===(choose?'ob':''));
  assert.ok(picked,JSON.stringify(actions));
  core.applyAction(s,'player',picked);resolveChoices(s);
  assert.equal(s.sides.opponent.active.uid,choose?'ob':'def');
  assert.equal(s.sides.opponent.active.damage,40,'damage hits the post-switch defender');
 }
 const s=setup('dp1-54','dp1-17');s.sides.opponent.bench[0].energy={};
 const actions=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===1);
 assert.ok(actions.every(a=>a.effectSelection!=='ob'),'Cannot drag an unpowered Bench Pokémon');
});

test('Elekid and Cleffa are selected in their payoff partners set-only decks without incompatible Basic Energy',()=>{
 for(const [focus,baby,type] of [['dp1-81','dp1-48','Lightning'],['dp1-77','dp1-78','Colorless']]){
  const r=builder.buildDeck(owned,{style:'focused',focusCardId:focus,types:[type],sets:['dp1'],randomSeed:19});
  assert.ok(r.ok,`${focus}: ${r.error||''}`);
  assert.ok(r.cards.includes(baby),`${focus}: Baby payoff ${baby} missing`);
  assert.equal(r.cards.length,30);assert.ok(r.energyTypes.length===1&&(type==='Colorless'||r.energyTypes[0]===type),JSON.stringify(r.energyTypes));
 }
});

test('DP1-only CPU generates legal single-type decks for all eight Energy types, including Metal-only Steelix',()=>{
 const symbol={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal'};
 for(const type of types)for(const seed of [7,11,19]){
  const r=opponents.generate({sets:['dp1'],type,seed});assert.ok(r.ok,`${type} seed ${seed}: ${r.error}`);
  assert.deepEqual(r.energyTypes,[type]);assert.equal(r.cards.length,30);assert.ok(data.validateDeck(r.cards).ok);
  for(const id of r.cards){const c=data.cardById(id);assert.equal(c.setId,'dp1');if(c.kind!=='pokemon'||!c.attacks?.length)continue;
   assert.ok(c.attacks.some(a=>[...String(a.cost||'')].every(t=>t==='C'||r.energyTypes.includes(symbol[t]))),`${id} has no payable attack in ${type}`);
  }
 }
});
