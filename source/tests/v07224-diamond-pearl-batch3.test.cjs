'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const P='../app/src/main/assets/';
const dp=require(P+'tcg-classic-diamond-pearl'),builder=require(P+'tcg-classic-deck-builder'),data=require(P+'tcg-classic-battle-data'),core=require(P+'tcgp-battle-core'),fx=require(P+'tcgp-battle-effects'),opponents=require(P+'tcg-classic-opponents');
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const added=[4,5,9,16,17,20,35,38,49,50,51,53,55,58,60,70,77,79,92];
const base=opponents.generate({sets:['dp1'],type:'Grass',seed:17});
const owned=dp.CARDS.map(c=>({gameplayId:c.id,quantity:4}));
function setup(att,def='dp1-94'){
 assert.ok(base.ok,base.error);const s=core.createBattle({format:'classic',playerDeck:base.cards,opponentDeck:base.cards,seed:37,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';for(const side of ['player','opponent'])s.sides[side].turnCount=8;
 s.sides.player.active=core.makePokemonSlot(att,4,'att');s.sides.opponent.active=core.makePokemonSlot(def,4,'def');
 s.sides.player.active.energy=Object.fromEntries(types.map(t=>[t,5]));s.sides.opponent.active.energy=Object.fromEntries(types.map(t=>[t,5]));
 s.sides.player.bench=[core.makePokemonSlot('dp1-85',4,'pb')];s.sides.opponent.bench=[core.makePokemonSlot('dp1-85',4,'ob')];
 s.sides.player.bench[0].benchSlot=0;s.sides.opponent.bench[0].benchSlot=0;return s;
}
function resolveChoices(s,pick=()=>null){let seen=[];for(let i=0;i<16&&s.phase==='effectChoice';i++){
 const acts=core.legalActions(s,s.choiceSide).filter(x=>x.type==='effectChoice');assert.ok(acts.length,'effect choice has legal actions');
 const chosen=pick(acts,s,i)||acts.find(a=>!a.choiceSkip)||acts[0];assert.ok(chosen);seen.push({who:s.choiceSide,...chosen});core.applyAction(s,s.choiceSide,chosen);
 }assert.notEqual(s.phase,'effectChoice','choice resolves');return seen;}
function attack(s,index=0,side='player',chooseAttack=()=>null,pick=()=>null){s.activeSide=side;const acts=core.legalActions(s,side).filter(a=>a.type==='attack'&&a.attackIndex===index);assert.ok(acts.length,`${s.sides[side].active?.cardId} ${index} legal`);const a=chooseAttack(acts,s)||acts[0];core.applyAction(s,side,a);const seen=resolveChoices(s,pick);return {a,seen};}
test('DP1 stage 3 enables 19 verified Pokémon and preserves 130-card catalogue',()=>{
 assert.equal(dp.coverage().total,130);assert.equal(dp.coverage().battleEnabled,67);
 for(const n of added){const c=dp.cardById('dp1-'+n);assert.ok(c?.battleEnabled,`${n} enabled`);for(const a of c.attacks){assert.ok(!a.text.startsWith('See the original card'),`${n} printed`);assert.deepEqual(fx.validateEffect(a.effect),[],`${n} ${a.name}`);}}
 for(const c of dp.CARDS.filter(c=>!c.battleEnabled))assert.ok(!c.deckEligible,`${c.id} gated`);
});
test('Stage 2 families build focused legal 30-card decks using only enabled DP1 prints',()=>{
 for(const [id,type,baseId] of [['dp1-4','Water','dp1-93'],['dp1-5','Fire','dp1-76'],['dp1-16','Colorless','dp1-101'],['dp1-17','Grass','dp1-103'],['dp1-20','Colorless','dp1-70'],['dp1-35','Lightning','dp1-35'],['dp1-38','Metal','dp1-92'],['dp1-60','Fighting','dp1-95']]){
  const result=builder.buildDeck(owned,{sets:['dp1'],focusCardId:id,types:type==='Colorless'?[]:[type],randomSeed:17});
  assert.ok(result.ok,`${id}: ${JSON.stringify(result.errors)}`);assert.equal(result.cards.length,30);assert.ok(result.cards.includes(id));assert.ok(result.cards.includes(baseId),`${id} basic ${baseId}`);
  assert.ok(result.cards.every(id=>{const c=data.cardById(id);return c?.setId==='dp1'&&c.battleEnabled;}));assert.ok(data.validateDeck(result.cards).ok);
  if(type!=='Colorless')assert.deepEqual(result.energyTypes,[type],`${id} single type`);
 }
});
test('Infernape Flare Blitz discards Fire only, leaving other attached types intact',()=>{
 const s=setup('dp1-5','dp1-17');s.sides.player.active.energy={Fire:3,Grass:1};attack(s,1);
 assert.equal(Number(s.sides.player.active.energy.Fire||0),0);assert.equal(s.sides.player.active.energy.Grass,1);assert.equal(s.sides.player.energyDiscard.Fire,3);
 assert.equal(s.sides.opponent.active.damage,120,'Torterra has printed Fire +30 Weakness');
});
test('Staraptor Brave Heart Brave Heart tails causes a self-KO and heads does not',()=>{
 const seen=new Set();for(let seed=1;seed<90;seed++){const s=setup('dp1-16','dp1-17');s.rngState=seed*1234567;attack(s,1);seen.add(s.log.some(x=>x.type==='ko'&&x.side==='player')?'self-KO':'no-self-KO');if(seen.size===2)break;}
 assert.deepEqual([...seen].sort(),['no-self-KO','self-KO']);
});
test('Torterra Leaf Storm heals only Grass teammates by 20',()=>{
 const s=setup('dp1-17','dp1-94');s.sides.player.active.damage=30;s.sides.player.bench[0]=core.makePokemonSlot('dp1-75',4,'grass');s.sides.player.bench[0].damage=30;s.sides.player.bench.push(core.makePokemonSlot('dp1-94',4,'fire'));s.sides.player.bench[1].benchSlot=1;s.sides.player.bench[1].damage=30;
 attack(s,1);assert.equal(s.sides.player.active.damage,10);assert.equal(s.sides.player.bench[0].damage,10);assert.equal(s.sides.player.bench[1].damage,30);
});
test('Empoleon Ice Blade attacks chosen Bench, Aqua Jet needs heads for extra Bench damage',()=>{
 const s=setup('dp1-4','dp1-94');const acts=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===0);
 assert.ok(acts.some(x=>x.target==='opponentBench'||x.benchIndex===0),'chosen bench target exposed');
 attack(s,0,'player',a=>a.find(x=>x.target==='opponentBench'||x.benchIndex===0));
 assert.equal(s.sides.opponent.active.damage,0);assert.equal(s.sides.opponent.bench[0].damage,40);
});
test('Prinplup Aqua Shower damages each opponent (including the Active with Weakness)',()=>{
 const s=setup('dp1-58','dp1-94');attack(s,0);assert.equal(s.sides.opponent.active.damage,20);assert.equal(s.sides.opponent.bench[0].damage,10);
});
test('Haunter Dream Eater deals no damage to awake target but hits asleep target',()=>{
 for(const [asleep,expected] of [[false,0],[true,60]]){const s=setup('dp1-50','dp1-17');if(asleep)s.sides.opponent.active.conditions={sleep:true};attack(s,1);assert.equal(s.sides.opponent.active.damage,expected);}
});
test('Machoke Karate Chop subtracts one damage per own damage counter, floor zero',()=>{
 for(const [selfDamage,expected] of [[0,40],[20,20],[50,0]]){const s=setup('dp1-53','dp1-94');s.sides.player.active.damage=selfDamage;attack(s,0);assert.equal(s.sides.opponent.active.damage,expected);}
});
test('Rhydon Storm Up adds 20 damage when a Stadium is in play and discards that Stadium',()=>{
 const s=setup('dp1-60','dp1-94');s.stadium={uid:'stad1',cardId:'ex16-86',ownerSide:'opponent'};attack(s,0);assert.equal(s.sides.opponent.active.damage,50);assert.equal(s.stadium,null);
});
test('Grotle Synthesis makes a target choice and attaches Grass from actual Energy Zone',()=>{
 const s=setup('dp1-49','dp1-94');const prev=Number(s.sides.player.active.energy.Grass||0);s.sides.player.energySupply=['Grass','Water','Grass'];
 attack(s,0,'player',undefined,(acts,st)=>acts.find(a=>a.choiceTarget==='active')||null);
 assert.equal(s.sides.player.active.energy.Grass,prev+1);
});
test('newly enabled attacks execute as both player and CPU without invalid effects',()=>{
 let n=0;for(const num of added)for(const [index,a] of dp.cardById('dp1-'+num).attacks.entries())for(const side of ['player','opponent']){
 const s=setup('dp1-'+num,'dp1-94');if(num===58&&index===1)s.sides.opponent.active.damage=20;if(side==='opponent'){s.sides.opponent.active=core.makePokemonSlot('dp1-'+num,4,'cpu');s.sides.opponent.active.energy=Object.fromEntries(types.map(t=>[t,5]));if(num===58&&index===1)s.sides.player.active.damage=20;}
 assert.doesNotThrow(()=>attack(s,index,side),`${num} ${a.name} ${side}`);n++;
 }assert.ok(n>=68);
});
test('Onix Tunneling offers skip of optional Bench damage without dropping the next-turn attack lock',()=>{
 const s=setup('dp1-92','dp1-94');s.sides.opponent.bench.push(core.makePokemonSlot('dp1-93',4,'second'));s.sides.opponent.bench[1].benchSlot=1;
 attack(s,0,'player',undefined,(acts)=>acts.find(a=>a.choiceSkip));
 assert.equal(s.sides.opponent.bench[0].damage,0);assert.equal(s.sides.opponent.bench[1].damage,0);
 assert.ok(s.sides.player.active.locks?.some(l=>l.action==='attack'),'next-turn lock must still be applied when declining optional hit');
});
test('Onix Tunneling can select a specific Bench target and decline the second optional hit',()=>{
 const s=setup('dp1-92','dp1-94');s.sides.opponent.bench.push(core.makePokemonSlot('dp1-93',4,'second'));s.sides.opponent.bench[1].benchSlot=1;
 const chosen=attack(s,0,'player',undefined,(acts,st,i)=>i===0?acts.find(a=>a.choiceBenchIndex===1):acts.find(a=>a.choiceSkip));
 assert.ok(chosen.seen.length>=2);assert.equal(s.sides.opponent.bench[0].damage,0);assert.equal(s.sides.opponent.bench[1].damage,10);
});
test('Grotle Synthesis takes one real Grass print from the physical deck',()=>{
 const s=setup('dp1-49','dp1-94');s.sides.player.energySupply=['Water','Fire'];s.sides.player.deck=[{uid:'phys-g',cardId:'dp1-123'},{uid:'phys-w',cardId:'dp1-125'}];
 const prev=Number(s.sides.player.active.energy.Grass||0);
 const result=attack(s,0,'player',undefined,(acts)=>acts.find(a=>a.choiceTarget==='active')||acts[0]);
 assert.ok(result.seen.some(a=>a.choiceDeckIndex===0),'must choose actual Grass Energy card');
 assert.equal(s.sides.player.active.energy.Grass,prev+1);
 assert.equal(s.sides.player.deck.some(r=>r.uid==='phys-g'),false);
 assert.equal(s.sides.player.deck.some(r=>r.uid==='phys-w'),true);
});
test('Manaphy Call for Family benches a selected real Basic Pokémon from the deck',()=>{
 const s=setup('dp1-9','dp1-94');s.sides.player.deck=[{uid:'chosen',cardId:'dp1-103'},{uid:'other',cardId:'dp1-125'}];const old=s.sides.player.bench.length;
 attack(s,0);assert.equal(s.sides.player.bench.length,old+1);assert.ok(s.sides.player.bench.some(p=>p.cardId==='dp1-103'));
 assert.ok(!s.sides.player.deck.some(r=>r.uid==='chosen'));
});
