'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const cards=require(path.join(A,'tcg-classic-aquapolis.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const fx=require(path.join(A,'tcgp-battle-effects.js'));
const opp=require(path.join(A,'tcg-classic-opponents.js'));
const C=id=>classic.cardById('ecard2-'+id);
function field(seed=13){const d=opp.generate({sets:['ecard2'],seed});assert.ok(d.ok,d.error);const s=core.createBattle({format:'classic',playerDeck:d.cards,opponentDeck:d.cards,playerEnergyTypes:['Fire','Water','Fighting','Psychic','Lightning','Grass','Metal','Darkness'],opponentEnergyTypes:['Fire','Water','Fighting','Psychic','Lightning','Grass','Metal','Darkness'],seed,firstSide:'player'});s.phase='battle';s.activeSide='player';s.turnNumber=7;s.sides.player.turnCount=4;return s;}
const slot=(id,uid)=>core.makePokemonSlot('ecard2-'+id,4,uid||'p'+id);
function context(s,random=()=>0.1,action={}){return {...core.effectContext(s,'player',action,s.sides.player.active),random,isAttack:true};}
function resolve(id,index,heads=true){const s=field();s.sides.player.active=slot(id);s.sides.player.active.energy={Fire:2,Water:2,Grass:2,Fighting:2,Lightning:2,Psychic:2,Metal:2,Darkness:2};s.sides.opponent.active=slot(69);const act=C(id).attacks[index];const result=fx.resolveAttack(act,context(s,()=>heads?0.1:0.9));for(const pending of result.pendingEffects)fx.applyEffect(pending,context(s,()=>heads?0.1:0.9));return {s,result};}

test('all Aquapolis attack definitions and holo reprints pass deterministic heads and tails combat sweep',()=>{
 let checked=0,holos=0;
 for(const card of cards.CARDS.filter(c=>c.kind==='pokemon')){
  if(/^H/.test(card.number))holos++;
  for(const [i,move] of card.attacks.entries()){
   assert.ok(fx.supportsEffect(move.effect),`${card.id} ${move.name}`);
   assert.ok(move.name&&move.cost!=null&&move.text,`${card.id} attack has visible metadata`);
   for(const flipHeads of [true,false]){
    const s=field();s.sides.player.active=slot(card.number,'audited'+card.number);s.sides.player.active.energy={Fire:3,Water:3,Grass:3,Fighting:3,Lightning:3,Psychic:3,Metal:3,Darkness:3};
    const bench=slot(77,'benchA');bench.benchSlot=0;bench.energy={Water:2};s.sides.player.bench=[bench];
    s.sides.opponent.active=slot(69,'opponent');s.sides.opponent.active.damage=10;
    const other=slot(91,'benchB');other.benchSlot=0;other.energy={Metal:1};s.sides.opponent.bench=[other];
    let flips=0;const c=context(s,()=>flipHeads&&flips++%5!==4?0.1:0.9);let result;try{result=fx.resolveAttack(move,c);}catch(error){throw new Error(card.id+' '+move.name+' '+(flipHeads?'heads':'tails')+': '+error.message,{cause:error});}
    assert.ok(Number.isFinite(result.damage)&&result.damage>=0,`${card.id} ${move.name} invalid damage`);
    for(const pending of result.pendingEffects){assert.ok(fx.supportsEffect(pending),`${card.id} ${move.name} pending unsupported`);fx.applyEffect(pending,c);}
    checked++;
   }
  }
 }
 assert.equal(holos,32);assert.ok(checked>=400,`expected all attacks in both coin paths, got ${checked}`);
});

test('Houndoom Fireworks keeps Fire on heads, discards Fire (not Water) on tails, including H11',()=>{
 for(const id of [15,'H11']){
  let {s}=resolve(id,0,true);assert.equal(s.sides.player.active.energy.Fire,2);assert.equal(s.sides.player.active.energy.Water,2);
  ({s}=resolve(id,0,false));assert.equal(s.sides.player.active.energy.Fire,1);assert.equal(s.sides.player.active.energy.Water,2);
 }
});

test('Houndoom Burn Up discards only Fire, and no other attached type',()=>{
 let {s}=resolve(14,1,false);assert.equal(s.sides.player.active.energy.Fire,0);assert.equal(s.sides.player.active.energy.Water,2);
 ({s}=resolve(14,1,true));assert.equal(s.sides.player.active.energy.Fire,2);assert.equal(s.sides.player.active.energy.Water,2);
});

test('Onix Crush counts each attached Energy card including Special Energy',()=>{
 const s=field();s.sides.player.active=slot(98);s.sides.player.active.energy={Fighting:1};s.sides.player.active.specialEnergy=[{uid:'rainbow',cardId:'ecard2-144'}];s.sides.opponent.active=slot(69);
 assert.equal(fx.resolveAttack(C(98).attacks[0],context(s)).damage,40);
 assert.equal(fx.resolveAttack(C(98).attacks[0],context(s,()=>0.9)).damage,0);
});

test('Seadra Water Bullet counts matching Special Water Energy, not irrelevant Metal Energy',()=>{
 const s=field();s.sides.player.active=slot(58);s.sides.player.active.energy={Water:1};s.sides.player.active.specialEnergy=[{uid:'rainbow',cardId:'ecard2-144'},{uid:'metal',cardId:'ecard2-143'}];s.sides.opponent.active=slot(69);
 assert.equal(fx.resolveAttack(C(58).attacks[1],context(s)).damage,50);
});

test('Poison Scent applies Poison+Confusion on heads and Poison+Sleep on tails',()=>{
 for(const id of [43,'H31']){
  let {s}=resolve(id,0,true);assert.ok(s.sides.opponent.active.conditions.poison);assert.ok(s.sides.opponent.active.conditions.confusion);assert.equal(!!s.sides.opponent.active.conditions.sleep,false);
  ({s}=resolve(id,0,false));assert.ok(s.sides.opponent.active.conditions.poison);assert.ok(s.sides.opponent.active.conditions.sleep);assert.equal(!!s.sides.opponent.active.conditions.confusion,false);
 }
});

test('required Fire discard cannot be paid with Water energy for Growlithe Ember',()=>{
 const s=field(),p=s.sides.player;p.active=slot(51);p.active.energy={Water:3};s.sides.opponent.active=slot(69);
 const actions=core.legalActions(s,'player');assert.ok(!actions.some(x=>x.type==='attack'),'no legal Ember without Fire');
 p.active.energy.Fire=1;assert.ok(core.legalActions(s,'player').some(x=>x.type==='attack'));
});

test('version numbers and splash labels updated to 0.69.147',()=>{
 const gradle=fs.readFileSync(path.resolve(A,'../../../build.gradle'),'utf8'),html=fs.readFileSync(path.join(A,'index.html'),'utf8'),app=fs.readFileSync(path.join(A,'app-v0167.js'),'utf8');
 assert.match(gradle,/versionCode 7127/);assert.match(gradle,/versionName '0\.69\.147'/);assert.match(app,/window\.__LUCKYDEX_BUILD='0\.69\.147'/);assert.equal(html.split('v0.69.147').length-1,2);
});
test('Elekid Energy Kick can select and move Special Energy without creating or losing it',()=>{
 const s=field();s.sides.player.active=slot(9);s.sides.opponent.active=slot(69);
 s.sides.opponent.active.energy={Fire:1};s.sides.opponent.active.specialEnergy=[{uid:'rainbow',cardId:'ecard2-144'}];
 const bench=slot(91,'recipient');bench.benchSlot=0;s.sides.opponent.bench=[bench];
 const effect=C(9).attacks[0].effect,prompts=[];
 const first={...context(s),requestChoice:r=>prompts.push(r)};
 fx.applyEffect(effect,first);assert.equal(prompts[0]?.kind,'option');
 assert.ok(prompts[0].effect.types.includes('special:rainbow'));
 fx.applyEffect(prompts[0].effect,{...first,resolvingChoice:true,action:{choiceOption:prompts[0].effect.types.indexOf('special:rainbow')}});
 assert.equal(prompts.at(-1)?.kind,'pokemon');
 fx.applyEffect(prompts.at(-1).effect,{...first,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});
 assert.equal(s.sides.opponent.active.specialEnergy.length,0);
 assert.equal(bench.specialEnergy.length,1);
 assert.equal(bench.specialEnergy[0].uid,'rainbow');
 assert.equal(s.sides.opponent.active.energy.Fire,1);
});
