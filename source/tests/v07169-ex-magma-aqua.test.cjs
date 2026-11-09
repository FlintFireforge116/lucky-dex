'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const A=path.resolve(__dirname,'../app/src/main/assets');
const cards=require(path.join(A,'tcg-classic-team-magma-aqua.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const builder=require(path.join(A,'tcg-classic-deck-builder.js'));
const opponent=require(path.join(A,'tcg-classic-opponents.js'));
const picker=require(path.join(A,'tcg-classic-set-picker.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const effects=require(path.join(A,'tcgp-battle-effects.js'));
const synergy=require(path.join(A,'tcg-deck-synergy.js'));
const C=n=>cards.cardById('ex4-'+n);
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const sl=(n,uid)=>core.makePokemonSlot('ex4-'+n,2,uid||'slot-'+n);
let sample=null;
function b(){if(!sample){sample=opponent.generate({sets:['ex4'],seed:29});assert.ok(sample.ok,sample.error);}
 const s=core.createBattle({format:'classic',playerDeck:sample.cards,opponentDeck:sample.cards,seed:29,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});s.phase='battle';s.activeSide='player';s.turnNumber=9;s.sides.player.turnCount=5;s.sides.opponent.turnCount=4;
 s.sides.player.active=sl(1,'attack');s.sides.player.bench=[sl(24,'bench')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.active=sl(40,'defend');s.sides.opponent.bench=[sl(48,'foebench')];s.sides.opponent.bench[0].benchSlot=0;
 s.sides.player.active.energy=Object.fromEntries(types.map(x=>[x,10]));s.sides.opponent.active.energy={Fighting:3};s.sides.player.energyDiscard=Object.fromEntries(types.map(x=>[x,2]));return s;}
function settle(s){let k=0;while(s.phase==='effectChoice'&&k<40){const list=core.legalActions(s,s.choiceSide);assert.ok(list.length,JSON.stringify(s.pendingChoice));core.applyAction(s,s.choiceSide,list.find(x=>!x.choiceSkip)||list[0]);k++;}assert.notEqual(s.phase,'effectChoice',JSON.stringify(s.pendingChoice));}
function run(n,i,{def=40,energy=null,defEnergy=null}={}){const s=b();s.sides.player.active=sl(n,'attack');s.sides.player.active.energy=energy||Object.fromEntries(types.map(x=>[x,10]));s.sides.opponent.active=sl(def,'defend');if(defEnergy)s.sides.opponent.active.energy=defEnergy;const action=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===i);assert.ok(action,'no action '+n+':'+i);core.applyAction(s,'player',action);settle(s);return s;}
test('97 complete cards, printed moves and Powers registered',()=>{
 assert.equal(cards.CARDS.length,97);assert.equal(cards.coverage().battleEnabled,97);assert.equal(cards.CARDS.filter(c=>c.kind==='pokemon').length,77);assert.equal(cards.CARDS.filter(c=>c.kind==='trainer').length,17);assert.equal(cards.CARDS.filter(c=>c.kind==='energy').length,3);
 assert.equal(cards.CARDS.filter(c=>c.pokemonEx).length,7);assert.equal(cards.CARDS.reduce((n,c)=>n+(c.attacks?.length||0),0),145);assert.equal(cards.CARDS.reduce((n,c)=>n+(c.abilities?.length||0),0),10);
 for(const card of cards.CARDS){assert.ok(card.battleEnabled,card.id);assert.equal(card.image,`https://images.pokemontcg.io/ex4/${card.number}.png`);for(const k of ['roles','inflicts','payoffs','energyTypes','stages'])assert.ok(Array.isArray(synergy.metadata(card)[k]),card.id+' '+k);
  for(const move of card.attacks||[])assert.ok(effects.supportsEffect(move.effect),card.id+' '+move.name);
  for(const power of card.abilities||[])assert.ok(effects.supportsEffect(power.effect),card.id+' '+power.name);
 }
 assert.deepEqual(C(1).types,['Grass','Darkness']);assert.deepEqual(C(7).types,['Fighting','Darkness']);assert.ok(C(7).weaknesses.includes('Water'));
 assert.equal(builder.rarityTier(C(89)),'ultra');assert.equal(C(89).prizeCards,2);
});
test('player, CPU and visible filter include EX Team Magma vs Team Aqua',()=>{
 assert.ok(builder.SET_IDS.includes('ex4'));assert.ok(opponent.SETS.includes('ex4'));assert.ok(classic.SETS.some(x=>x.id==='ex4'&&x.cardCount===97));
 assert.ok(picker.html({ids:builder.SET_IDS,selected:['ex4'],mode:'auto'}).includes('data-set-choice="ex4"'));
 const owned=classic.projectOwnedCards([{source:'tcg',setId:'ex4',number:'89/97',count:1}]);assert.equal(owned.find(x=>x.gameplayId==='ex4-89')?.quantity,1);
 const rows=classic.CARDS.filter(c=>c.battleEnabled).map(c=>({gameplayId:c.id,quantity:4}));
 const work=require(path.join(A,'tcg-classic-deck-workspace.js'));assert.equal(work.query(work.catalogue(rows),{filters:{set:'ex4',enabled:true},pageSize:200}).total,97);
 for(const seed of [7,27,47,67]){const cpu=opponent.generate({sets:['ex4'],seed});assert.ok(cpu.ok,cpu.error);assert.equal(cpu.cards.length,30);assert.ok(cpu.cards.every(id=>id.startsWith('ex4-')));assert.ok(classic.validateDeck(cpu.cards).ok);
  const player=builder.buildDeck(rows,{style:'random',sets:['ex4'],randomSeed:seed,theme:'any'});assert.ok(player.ok,player.error);assert.equal(player.cards.length,30);assert.ok(player.cards.every(id=>id.startsWith('ex4-')));assert.ok(classic.validateDeck(player.cards).ok);}
});
test('all 143 Pokémon attacks execute across two RNG outcomes',()=>{
 let count=0;for(const card of cards.CARDS.filter(c=>c.kind==='pokemon'))for(let i=0;i<card.attacks.length;i++){
   for(const seed of [1,0x7fffffff]){const s=b();s.sides.player.active=sl(Number(card.number),'attack');s.sides.player.active.energy=Object.fromEntries(types.map(t=>[t,10]));s.rngState=seed;
     const action=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===i);
     if(['ex4-3','ex4-9'].includes(card.id)){s.sides.player.bench.push(sl(Number(card.number),'another'));s.sides.player.bench.at(-1).benchSlot=1;s.sides.opponent.bench.push(sl(Number(card.number),'third'));s.sides.opponent.bench.at(-1).benchSlot=1;s.sides.opponent.active=sl(Number(card.number),'fourth');}
     const legal=action||core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===i);
     assert.ok(legal,card.id+' '+card.attacks[i].name+' attack not offered');
     assert.doesNotThrow(()=>{core.applyAction(s,'player',legal);settle(s);},card.id+' '+card.attacks[i].name);
   }count++;}
 assert.equal(count,143); // 145 printed attacks include two Technical Machine attacks
});
test('all 17 Trainers playable from hand with valid context',()=>{
 for(let n=69;n<=85;n++){const s=b();s.sides.player.hand.unshift({uid:'trainer-'+n,cardId:'ex4-'+n});
  if([74,76,79].includes(n))s.sides.player.active=sl(1,'aqua');if([81,84].includes(n))s.sides.player.active=sl(7,'magma');
  if([69,70].includes(n))s.sides.player.hand.push({uid:'extra'+n,cardId:'ex4-24'});
  if(n===73)s.sides.player.discard.push({uid:'magma-card',cardId:'ex4-7'});
  const action=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='ex4-'+n);
  assert.ok(action,'trainer '+n+' not playable');assert.doesNotThrow(()=>{core.applyAction(s,'player',action);settle(s);},'trainer '+n);
 }
});
test('Aqua/Magma Energy restricted to correct team; Double Rainbow only legal on evolved non-ex',()=>{
 const s=b();s.sides.player.hand.unshift({uid:'aqenergy',cardId:'ex4-86'},{uid:'mgen',cardId:'ex4-87'},{uid:'rainbow',cardId:'ex4-88'});
 s.sides.player.active=sl(1,'aqua');s.sides.player.bench=[sl(7,'magma'),sl(13,'regular'),sl(89,'ex')];s.sides.player.bench.forEach((x,i)=>x.benchSlot=i);
 const actions=core.legalActions(s,'player').filter(a=>a.type==='attachSpecial');
 assert.ok(actions.some(x=>x.cardId==='ex4-86'&&x.target==='active'));
 assert.ok(!actions.some(x=>x.cardId==='ex4-86'&&x.target==='bench'));
 assert.ok(actions.some(x=>x.cardId==='ex4-87'&&x.target==='bench'&&x.benchIndex===0));
 assert.ok(!actions.some(x=>x.cardId==='ex4-87'&&x.target==='active'));
 assert.ok(actions.some(x=>x.cardId==='ex4-88'&&x.target==='active'));
 assert.ok(!actions.some(x=>x.cardId==='ex4-88'&&x.target==='bench'&&x.benchIndex===2));
});
test('Power Saver, Shell Retreat, dual weakness, and stadium modifiers enforce printed rules',()=>{
 const s=b();s.sides.player.active=sl(3,'kyogre');s.sides.player.active.energy={Water:10};
 assert.ok(!core.legalActions(s,'player').some(x=>x.type==='attack'));s.sides.player.bench=[sl(24,'a'),sl(25,'b')];s.sides.player.bench[0].benchSlot=0;s.sides.player.bench[1].benchSlot=1;
 s.sides.opponent.active=sl(26,'c');assert.ok(core.legalActions(s,'player').some(x=>x.type==='attack'));
 s.sides.opponent.active=sl(46,'squirtle');s.sides.opponent.active.energy={Water:1};s.sides.player.active=sl(58,'aron');s.sides.player.active.energy={Fighting:1};
 const reduced=effects.attackDamageWithState(s,'player',s.sides.player.active,'opponent',s.sides.opponent.active,30,classic.cardById);assert.equal(reduced,20);
 s.sides.opponent.active=sl(7,'aggron');s.sides.player.active=sl(44,'psyduck');assert.equal(effects.attackDamageWithState(s,'player',s.sides.player.active,'opponent',s.sides.opponent.active,20,classic.cardById),40);
 s.stadium={cardId:'ex4-78',uid:'aqua-stadium'};s.sides.player.active=sl(13,'raichu');assert.equal(core.effectContext(s,'player',{},s.sides.player.active).retreatCost('player'),C(13).retreat+1);
 s.sides.player.active=sl(1,'aqua');assert.equal(core.effectContext(s,'player',{},s.sides.player.active).retreatCost('player'),C(1).retreat);
});
test('version and script order are consistent',()=>{
 const gradle=fs.readFileSync(path.resolve(__dirname,'../app/build.gradle'),'utf8');assert.match(gradle,/versionName '0\.69\.170'/);
 const html=fs.readFileSync(path.join(A,'index.html'),'utf8');assert.match(html,/tcg-classic-team-magma-aqua\.js/);
});

test('both Team Technical Machine attacks are offered, resolve and Tools expire',()=>{
 for(const [tool,pokemon] of [[79,1],[84,7]]){
  const s=b();s.sides.player.active=sl(pokemon,'tm-user');s.sides.player.active.energy={Colorless:3};s.sides.player.active.tool={uid:'tm-tool',cardId:'ex4-'+tool};
  const move=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackCardId==='ex4-'+tool);
  assert.ok(move,'technical machine '+tool+' attack unavailable');
  core.applyAction(s,'player',move);settle(s);
  assert.ok(s.sides.player.discard.some(ref=>ref.cardId==='ex4-'+tool),'tool should expire');
 }
});
test('representative Team numerical damage outcomes use actual attached Energy and counters',()=>{
 let s=b();s.sides.player.active=sl(5,'shark');s.sides.player.active.damage=20;s.sides.player.active.energy={Colorless:2};
 let attack=C(5).attacks[0];let ctx={...core.effectContext(s,'player',{},s.sides.player.active),attack,random:()=>0.1,isAttack:true};assert.equal(effects.resolveAttack(attack,ctx).damage,30,'Rage with two damage counters');
 s=b();s.sides.player.active=sl(6,'walrein');s.sides.player.active.energy={Water:3,Colorless:2};attack=C(6).attacks[0];ctx={...core.effectContext(s,'player',{},s.sides.player.active),attack,random:()=>0.1,isAttack:true};assert.equal(effects.resolveAttack(attack,ctx).damage,60,'Power Blow 10 plus 5 Energy');
 s=b();s.sides.player.active=sl(23,'zangoose');s.sides.player.active.energy={Colorless:3};s.sides.player.bench=[sl(7,'magma')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.active=sl(9,'magma2');attack=C(23).attacks[1];ctx={...core.effectContext(s,'player',{},s.sides.player.active),attack,random:()=>0.1,isAttack:true};assert.equal(effects.resolveAttack(attack,ctx).damage,30,'Team Play counts all team Pokémon');
 s=b();s.sides.player.active=sl(9,'groudon');s.sides.player.active.energy={Fighting:4};s.sides.opponent.active.damage=20;
 attack=C(9).attacks[1];ctx={...core.effectContext(s,'player',{},s.sides.player.active),attack,random:()=>0.1,isAttack:true};assert.equal(effects.resolveAttack(attack,ctx).damage,70);
});
test('Aqua/Magma special Energy expires at end of owner turn; Rainbow remains attached',()=>{
 const s=b();s.sides.player.active=sl(1,'aqua');s.sides.player.active.specialEnergy=[{uid:'aqua-e',cardId:'ex4-86'},{uid:'double',cardId:'ex4-88'}];
 s.sides.player.bench=[sl(7,'magma')];s.sides.player.bench[0].benchSlot=0;s.sides.player.bench[0].specialEnergy=[{uid:'magma-e',cardId:'ex4-87'}];
 const end=core.legalActions(s,'player').find(x=>x.type==='endTurn');assert.ok(end);core.applyAction(s,'player',end);
 assert.ok(s.sides.player.discard.some(x=>x.cardId==='ex4-86'));assert.ok(s.sides.player.discard.some(x=>x.cardId==='ex4-87'));
 assert.ok(s.sides.player.active.specialEnergy.some(x=>x.cardId==='ex4-88'));
});
test('Team Magma Hideout damages non-Magma Basics played from hand only',()=>{
 const s=b();s.stadium={uid:'hideout',cardId:'ex4-83',ownerSide:'player'};
 s.sides.player.hand.unshift({uid:'ordinary',cardId:'ex4-40'},{uid:'magma',cardId:'ex4-58'});
 let action=core.legalActions(s,'player').find(a=>a.type==='bench'&&a.cardId==='ex4-40');assert.ok(action);core.applyAction(s,'player',action);
 assert.equal(s.sides.player.bench.find(x=>x.cardId==='ex4-40').damage,10);
 action=core.legalActions(s,'player').find(a=>a.type==='bench'&&a.cardId==='ex4-58');if(action){core.applyAction(s,'player',action);assert.equal(s.sides.player.bench.find(x=>x.cardId==='ex4-58').damage,0);}
});
test('Strength Charm adds 10 only after matchup and discards after dealing damage',()=>{
 const s=b();s.sides.player.active=sl(58,'magma-aron');s.sides.player.active.energy={Fighting:5,Colorless:5};s.sides.player.active.tool={uid:'charm',cardId:'ex4-74'};
 s.sides.opponent.active=sl(65,'poochyena');const attack=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(attack);
 core.applyAction(s,'player',attack);settle(s);
 assert.equal(s.sides.opponent.active.damage,30,'10 printed attack, weakness 2x, then charm +10');
 assert.ok(s.sides.player.discard.some(x=>x.cardId==='ex4-74'));
});
