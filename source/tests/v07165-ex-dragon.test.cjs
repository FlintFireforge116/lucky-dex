'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const set=require(path.join(A,'tcg-classic-dragon.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const picker=require(path.join(A,'tcg-classic-set-picker.js'));
const builder=require(path.join(A,'tcg-classic-deck-builder.js'));
const opp=require(path.join(A,'tcg-classic-opponents.js'));
const fx=require(path.join(A,'tcgp-battle-effects.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const meta=require(path.join(A,'tcg-deck-synergy.js'));
const TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const C=n=>set.cardById('ex3-'+n);
const sl=(n,uid)=>core.makePokemonSlot('ex3-'+n,2,uid||'slot'+n);
const sample=opp.generate({sets:['ex3'],seed:31});
function battle(){
 assert.ok(sample.ok,sample.error);const s=core.createBattle({format:'classic',playerDeck:sample.cards,opponentDeck:sample.cards,playerEnergyTypes:TYPES,opponentEnergyTypes:TYPES,seed:31,firstSide:'player'});
 s.phase='battle';s.activeSide='player';s.turnNumber=8;s.sides.player.turnCount=4;s.sides.opponent.turnCount=3;
 s.sides.player.active=sl(89,'attacker');s.sides.opponent.active=sl(75,'defender');
 s.sides.player.bench=[sl(65,'bench')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.bench=[sl(60,'foebench')];s.sides.opponent.bench[0].benchSlot=0;
 s.sides.player.active.energy=Object.fromEntries(TYPES.map(t=>[t,10]));s.sides.opponent.active.energy={Water:3};
 s.sides.player.energyDiscard=Object.fromEntries(TYPES.map(t=>[t,3]));
 return s;
}
function settle(s){let tries=0;while(s.phase==='effectChoice'&&tries<30){const side=s.choiceSide,acts=core.legalActions(s,side);assert.ok(acts.length,JSON.stringify(s.pendingChoice));core.applyAction(s,side,acts[0]);tries++;}assert.notEqual(s.phase,'effectChoice',JSON.stringify(s.pendingChoice));}
function preview(s,n,i,energy){s.sides.player.active=sl(n,'p');s.sides.player.active.energy=energy||{};return fx.resolveAttack(C(n).attacks[i],{...core.effectContext(s,'player',{},s.sides.player.active),random:()=>0.1,isAttack:true});}
test('EX Dragon has all 100 numbered and secret rare cards, full moves and metadata',()=>{
 assert.equal(set.CARDS.length,100);assert.equal(set.coverage().battleEnabled,100);
 assert.equal(set.CARDS.filter(c=>c.kind==='pokemon').length,93);
 assert.equal(set.CARDS.filter(c=>c.kind==='trainer').length,7);
 assert.equal(set.CARDS.reduce((n,c)=>n+(c.attacks?.length||0),0),161);
 assert.equal(set.CARDS.reduce((n,c)=>n+(c.abilities?.length||0),0),17);
 assert.equal(set.CARDS.filter(c=>c.pokemonEx).length,9);
 for(const c of set.CARDS){assert.equal(c.id,'ex3-'+c.number);assert.equal(c.image,`https://images.pokemontcg.io/ex3/${c.number}.png`);assert.equal(c.support.status,'FULL',c.id);
  for(const k of ['roles','inflicts','payoffs','energyTypes','stages'])assert.ok(Array.isArray(meta.metadata(c)[k]),c.id+' '+k);
  for(const x of c.attacks||[])assert.ok(fx.supportsEffect(x.effect),c.id+' '+x.name);
  for(const x of c.abilities||[])assert.ok(fx.supportsEffect(x.effect),c.id+' '+x.name);
  if(c.kind==='trainer')assert.ok(fx.supportsEffect(c.effect),c.id);
 }
 for(const c of set.CARDS.filter(c=>c.pokemonEx)){assert.equal(c.prizeCards,2);assert.equal(builder.rarityTier(c),'ultra');}
});
test('EX Dragon appears in battle selector, owned library and both deck generators',()=>{
 assert.ok(classic.SETS.some(s=>s.id==='ex3'&&s.cardCount===100));assert.ok(builder.SET_IDS.includes('ex3'));assert.ok(opp.SETS.includes('ex3'));
 const html=picker.html({ids:opp.SETS,selected:['ex3'],mode:'opponent'});assert.match(html,/data-set-choice="ex3"/);assert.match(html,/EX Dragon/);
 const owned=classic.projectOwnedCards([{source:'tcg',setId:'ex3',number:'98/100',count:1},{source:'tcg',_librarySetKey:'dr',localId:'060',count:2}]);
 assert.equal(owned.find(x=>x.gameplayId==='ex3-98')?.quantity,1);assert.equal(owned.find(x=>x.gameplayId==='ex3-60')?.quantity,2);
 for(const seed of [31,32,33,34,35,36,37,38]){const d=opp.generate({sets:['ex3'],seed});assert.ok(d.ok,seed+' '+d.error);assert.equal(d.cards.length,30);assert.ok(d.cards.every(id=>id.startsWith('ex3-')));assert.ok(classic.validateDeck(d.cards).ok);}
});
test('all 161 Dragon attacks have executable actions for two seeds',()=>{
 let total=0;
 for(const c of set.CARDS.filter(c=>c.kind==='pokemon'))for(let i=0;i<(c.attacks||[]).length;i++){
  for(const heads of [true,false]){
   const s=battle();s.sides.player.active=sl(Number(c.number),'p');s.sides.player.active.energy=Object.fromEntries(TYPES.map(t=>[t,10]));s.rngState=heads?1:0x7fffffff;
   const action=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===i);
   assert.ok(action,`${c.id} ${c.attacks[i].name} no legal attack`);
   assert.doesNotThrow(()=>{core.applyAction(s,'player',action);settle(s);},`${c.id} ${c.attacks[i].name}`);
  }total++;
 }
 assert.equal(total,161);
});
test('all seven Trainers can be played in valid setup',()=>{
 for(let n=82;n<=88;n++){
  const s=battle();s.sides.player.hand.unshift({uid:'trainer-'+n,cardId:'ex3-'+n});
  if(n===84)s.sides.player.energyDiscard={Water:3,Fire:3};
  const action=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='ex3-'+n);
  assert.ok(action,'No playable Trainer ex3-'+n);
  assert.doesNotThrow(()=>{core.applyAction(s,'player',action);settle(s);},'Trainer '+n);
 }
});
test('EX Dragon damage formulas count damage counters as 10 HP, Energy accurately and coin results',()=>{
 const s=battle();
 s.sides.opponent.active=sl(79,'d');s.sides.opponent.active.energy={Water:3};
 assert.equal(preview(s,5,0,{Fighting:3,Colorless:2}).damage,20);
 s.sides.player.active.damage=20;
 const golem=sl(5,'p');golem.damage=30;s.sides.player.active=golem;
 assert.equal(fx.resolveAttack(C(5).attacks[0],{...core.effectContext(s,'player',{},golem),random:()=>0.1,isAttack:true}).damage,50);
 assert.equal(preview(s,6,0,{Psychic:3}).damage,50);
 assert.equal(preview(s,17,0,{Lightning:2,Fire:2,Water:3}).damage,70);
 assert.equal(preview(s,37,1,{Fighting:2}).damage,10);
 s.sides.opponent.active.damage=20;
 assert.equal(preview(s,37,1,{Fighting:2}).damage,30);
 assert.equal(preview(s,39,0,{Water:2}).damage,30);
 assert.equal(preview(s,39,0,{Water:1}).damage,20);
 assert.equal(preview(s,92,1,{Water:3}).damage,50);
 assert.equal(preview(s,92,1,{Water:3,Fire:3}).damage,90);
 assert.equal(preview(s,95,1,{Fire:3}).damage,40);
 assert.equal(preview(s,96,1,{Grass:2}).damage,50);
});
test('Shedinja Wonder Guard protects vs evolved and ex, not ordinary Basic attackers',()=>{
 const s=battle(),def=sl(11,'shed');s.sides.opponent.active=def;
 s.sides.player.active=sl(79,'basic');assert.equal(fx.attackIsPrevented(s,'opponent',def,s.sides.player.active,classic.cardById),null);
 s.sides.player.active=sl(24,'stage');assert.ok(fx.attackIsPrevented(s,'opponent',def,s.sides.player.active,classic.cardById));
 s.sides.player.active=sl(97,'ex');assert.ok(fx.attackIsPrevented(s,'opponent',def,s.sides.player.active,classic.cardById));
});
test('Stadiums adjust retreat and HP while in play; Muk ex suppresses all other abilities',()=>{
 const s=battle();s.stadium={uid:'stadium',cardId:'ex3-86'};s.sides.player.active=sl(9,'roselia');assert.equal(core.maxHp(s,'player',s.sides.player.active),70);
 s.stadium={uid:'stadium2',cardId:'ex3-85'};s.sides.player.active=sl(24,'fire');s.sides.player.active.energy={Fire:1};assert.ok(core.legalActions(s,'player').some(a=>a.type==='retreat'));s.stadium=null;assert.ok(!core.legalActions(s,'player').some(a=>a.type==='retreat'));s.stadium={uid:'stadium2',cardId:'ex3-85'};
 s.sides.opponent.active=sl(96,'muk');assert.equal(fx.abilitiesSuppressed(s,'player',sl(11,'shed'),classic.cardById),true);
});
test('updated version metadata and Android script ordering',()=>{
 const gradle=fs.readFileSync(path.resolve(__dirname,'../app/build.gradle'),'utf8'),script=fs.readFileSync(path.join(A,'app-v0167.js'),'utf8');
 const version=gradle.match(/versionName '([^']+)'/)?.[1];assert.ok(version);assert.equal(script.match(/__LUCKYDEX_BUILD='([^']+)'/)?.[1],version);
 const html=fs.readFileSync(path.join(A,'index.html'),'utf8');assert.match(html,/tcg-classic-dragon\.js/);
});
test('Balloon Berry grants a free retreat, discards itself and preserves attached Energy',()=>{
 const s=battle();s.sides.player.active=sl(24,'camerupt');s.sides.player.active.energy={};s.sides.player.active.tool={uid:'berry',cardId:'ex3-82'};
 const action=core.legalActions(s,'player').find(a=>a.type==='retreat');assert.ok(action,'Balloon Berry must make energy-free retreat legal');
 core.applyAction(s,'player',action);
 assert.ok(s.sides.player.discard.some(x=>x.cardId==='ex3-82'));assert.equal(s.sides.player.bench[0].tool,null);
});
test('Buffer Piece reduces actual attack damage 20 and expires after opponent turn',()=>{
 const s=battle();s.sides.player.active=sl(25,'fire');s.sides.player.active.energy={Fire:4,Colorless:4};
 s.sides.opponent.active=sl(75,'swablu');s.sides.opponent.active.tool={uid:'buffer',cardId:'ex3-83',attachedTurn:7};
 const move=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===1);assert.ok(move);
 core.applyAction(s,'player',move);settle(s);
 assert.equal(s.sides.opponent.active.damage,20);
 assert.ok(s.sides.opponent.discard.some(x=>x.cardId==='ex3-83'));
});
test('Ampharos ex Conductivity damages attached-from-hand target exactly once',()=>{
 const s=battle();s.sides.opponent.active=sl(75,'swablu');s.sides.opponent.bench=[sl(89,'ampharos')];s.sides.opponent.bench[0].benchSlot=0;
 s.sides.player.active=sl(75,'player');s.sides.player.active.energy={};s.sides.player.energyUsed=false;
 s.sides.player.hand.unshift({uid:'energy',cardId:'ex1-108'});
 const action=core.legalActions(s,'player').find(a=>a.type==='attachSpecial'&&a.cardId==='ex1-108'&&a.target==='active');assert.ok(action);
 core.applyAction(s,'player',action);assert.equal(s.sides.player.active.damage,10);
 assert.equal(s.sides.player.active.energy.Fire,1);
});
test('Lava Flow counts any basic Energy discarded, and Dragon Burst only its selected type',()=>{
 const s=battle();s.sides.player.active=sl(95,'cargo');s.sides.player.active.energy={Fire:1,Water:3};
 let out=fx.resolveAttack(C(95).attacks[1],{...core.effectContext(s,'player',{effectSelection:'2'},s.sides.player.active),isAttack:true,random:()=>.1});
 assert.equal(out.damage,80);assert.ok(out.pendingEffects.some(e=>e.rule==='ex3:lavaFlow'&&e.count===2));
 s.sides.player.active=sl(97,'ray');s.sides.player.active.energy={Fire:3,Lightning:2};
 out=fx.resolveAttack(C(97).attacks[1],{...core.effectContext(s,'player',{effectSelection:'Lightning'},s.sides.player.active),isAttack:true,random:()=>.1});
 assert.equal(out.damage,80);assert.ok(out.pendingEffects.some(e=>e.rule==='ex3:dragonBurst'&&e.energyType==='Lightning'));
});
test('Dragon Dance bonus applies to the player’s next Active rather than only the original Altaria',()=>{
 const s=battle();s.sides.player.active=sl(2,'altaria');
 fx.applyEffect({type:'neoRule',rule:'ex3:dragonDance'},core.effectContext(s,'player',{},s.sides.player.active));
 assert.equal(s.sides.player.ex3DragonDanceUntil,9);
 s.turnNumber=9;s.sides.player.active=sl(24,'camerupt');s.sides.opponent.active=sl(75,'swablu');
 const before=fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',s.sides.opponent.active,20,classic.cardById);
 assert.equal(before,60);
 s.turnNumber=10;assert.equal(fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',s.sides.opponent.active,20,classic.cardById),20);
});
test('Flame Pillar lets player select opposing Bench Pokémon and burns one attached Fire Energy',()=>{
 const s=battle();s.sides.player.active=sl(100,'charizard');s.sides.player.active.energy={Fire:5,Water:5,Colorless:5};
 s.sides.opponent.active=sl(75,'swablu');s.sides.opponent.bench=[sl(52,'crab'),sl(77,'torchic')];s.sides.opponent.bench.forEach((x,i)=>x.benchSlot=i);
 const action=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===1);assert.ok(action);core.applyAction(s,'player',action);
 assert.equal(s.phase,'effectChoice');
 core.applyAction(s,'player',core.legalActions(s,'player').find(x=>x.choiceOption===1));
 assert.equal(s.phase,'effectChoice');
 const select=core.legalActions(s,'player').find(x=>x.choiceBenchIndex===1);assert.ok(select);core.applyAction(s,'player',select);
 assert.equal(s.sides.opponent.bench.find(x=>x.uid==='torchic').damage,30);
 assert.equal(s.sides.opponent.bench.find(x=>x.uid==='crab').damage,0);
 assert.equal(s.sides.player.active.energy.Fire,4);
});
test('Loose Shell on evolving Ninjask offers optional Shedinja Bench from deck',()=>{
 const s=battle();s.sides.player.active=sl(67,'nincada');s.sides.player.active.playedOnSideTurn=2;
 s.sides.player.hand.unshift({uid:'ninjask',cardId:'ex3-18'});s.sides.player.deck.unshift({uid:'shedinja',cardId:'ex3-11'});
 const action=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='ex3-18');assert.ok(action);
 core.applyAction(s,'player',action);assert.equal(s.phase,'effectChoice');
 const choose=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&!a.choiceSkip&&a.choiceCardId==='ex3-11');assert.ok(choose);
 core.applyAction(s,'player',choose);assert.ok(s.sides.player.bench.some(x=>x.cardId==='ex3-11'));
});
test('Energy Recycle System can return one Energy to hand or three to deck',()=>{
 const s=battle();s.sides.player.energyDiscard={Water:4};s.sides.player.hand.unshift({uid:'recycle',cardId:'ex3-84'});
 const beforeDeck=s.sides.player.deck.length;
 core.applyAction(s,'player',core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='ex3-84'));
 assert.equal(s.phase,'effectChoice');
 core.applyAction(s,'player',core.legalActions(s,'player').find(x=>x.choiceOption===1));
 settle(s);
 assert.equal(s.sides.player.energyDiscard.Water,1);
 assert.equal(s.sides.player.deck.length,beforeDeck+3);
});
