'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const set=require(path.join(A,'tcg-classic-sandstorm.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const picker=require(path.join(A,'tcg-classic-set-picker.js'));
const builder=require(path.join(A,'tcg-classic-deck-builder.js'));
const opp=require(path.join(A,'tcg-classic-opponents.js'));
const fx=require(path.join(A,'tcgp-battle-effects.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const meta=require(path.join(A,'tcg-deck-synergy.js'));
const TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const C=n=>set.cardById('ex2-'+n);
const sl=(n,uid)=>core.makePokemonSlot('ex2-'+n,2,uid||'slot'+n);
const sample=opp.generate({sets:['ex2'],seed:31});
function battle(){
 assert.ok(sample.ok,sample.error);const s=core.createBattle({format:'classic',playerDeck:sample.cards,opponentDeck:sample.cards,playerEnergyTypes:TYPES,opponentEnergyTypes:TYPES,seed:31,firstSide:'player'});
 s.phase='battle';s.activeSide='player';s.turnNumber=8;s.sides.player.turnCount=4;s.sides.opponent.turnCount=3;
 s.sides.player.active=sl(95,'attacker');s.sides.opponent.active=sl(72,'defender');
 s.sides.player.bench=[sl(72,'bench')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.bench=[sl(60,'foebench')];s.sides.opponent.bench[0].benchSlot=0;
 s.sides.player.active.energy=Object.fromEntries(TYPES.map(t=>[t,10]));s.sides.opponent.active.energy={Water:3};
 s.sides.player.energyDiscard=Object.fromEntries(TYPES.map(t=>[t,3]));
 return s;
}
function resolveChoices(s){let tries=0;while(s.phase==='effectChoice'&&tries<20){const side=s.choiceSide,acts=core.legalActions(s,side);assert.ok(acts.length,JSON.stringify(s.pendingChoice));core.applyAction(s,side,acts[0]);tries++;}assert.notEqual(s.phase,'effectChoice',JSON.stringify(s.pendingChoice));}
test('EX Sandstorm has 100 unique official prints and usable deck metadata',()=>{
 assert.equal(set.CARDS.length,100);assert.equal(set.coverage().battleEnabled,100);
 assert.equal(set.CARDS.filter(c=>c.kind==='pokemon').length,92);
 assert.equal(set.CARDS.filter(c=>c.kind==='trainer').length,7);
 assert.equal(set.CARDS.filter(c=>c.kind==='energy').length,1);
 assert.equal(set.CARDS.reduce((n,c)=>n+(c.attacks?.length||0),0),154);
 assert.equal(set.CARDS.reduce((n,c)=>n+(c.abilities?.length||0),0),28);
 for(const c of set.CARDS){assert.equal(c.id,'ex2-'+c.number);assert.equal(c.image,`https://images.pokemontcg.io/ex2/${c.number}.png`);
  assert.equal(c.support.status,'FULL',c.id);for(const key of ['roles','inflicts','payoffs','energyTypes','stages'])assert.ok(Array.isArray(meta.metadata(c)[key]),c.id+' '+key);
  for(const x of c.attacks||[])assert.ok(fx.supportsEffect(x.effect),c.id+' '+x.name);
  for(const x of c.abilities||[])assert.ok(fx.supportsEffect(x.effect),c.id+' '+x.name);
  if(c.kind==='trainer'||c.kind==='energy')assert.ok(fx.supportsEffect(c.effect),c.id);
 }
 assert.equal(set.CARDS.filter(x=>x.pokemonEx).length,7);
 for(const c of set.CARDS.filter(x=>x.pokemonEx)){assert.equal(c.prizeCards,2);assert.equal(builder.rarityTier(c),'ultra');}
});
test('EX Sandstorm is available in all catalogues, filters, and CPU selection',()=>{
 assert.ok(classic.SETS.some(s=>s.id==='ex2'&&s.cardCount===100));assert.ok(builder.SET_IDS.includes('ex2'));assert.ok(opp.SETS.includes('ex2'));
 const html=picker.html({ids:opp.SETS,selected:['ex2'],mode:'opponent'});assert.match(html,/data-set-choice="ex2"/);assert.match(html,/EX Sandstorm/);
 const owned=classic.projectOwnedCards([{source:'tcg',setId:'ex2',number:'98/100',count:1},{source:'tcg',_librarySetKey:'ss',localId:'060',count:2}]);
 assert.equal(owned.find(x=>x.gameplayId==='ex2-98')?.quantity,1);assert.equal(owned.find(x=>x.gameplayId==='ex2-60')?.quantity,2);
 for(const type of [null,'Grass','Fire','Water','Lightning','Psychic','Darkness','Metal']){
  const d=opp.generate({sets:['ex2'],seed:31,type:type||undefined});assert.ok(d.ok,type+' '+d.error);assert.equal(d.cards.length,30);assert.ok(d.cards.every(id=>id.startsWith('ex2-')));assert.ok(classic.validateDeck(d.cards).ok);
 }
});
test('All 154 attacks are legal and resolvable, including coin outcomes and choices',()=>{
 let n=0;
 for(const c of set.CARDS.filter(c=>c.kind==='pokemon'))for(let i=0;i<(c.attacks||[]).length;i++){
  for(const heads of [true,false]){
   const s=battle();s.sides.player.active=sl(Number(c.number),'p');s.sides.player.active.energy=Object.fromEntries(TYPES.map(t=>[t,10]));
   s.rngState=heads?1:0x7fffffff;
   const action=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===i);
   assert.ok(action,`${c.id} ${c.attacks[i].name} no legal action`);
   assert.doesNotThrow(()=>{core.applyAction(s,'player',action);resolveChoices(s);},`${c.id} ${c.attacks[i].name}`);
   assert.ok(!s.log.some(e=>e.type==='battleError'),c.id);
  }n++;
 }
 assert.equal(n,154);
});
test('All EX Sandstorm Trainers perform an actual battle action',()=>{
 for(let n=86;n<=92;n++){
  const s=battle();s.sides.player.hand.unshift({uid:'trainer-'+n,cardId:'ex2-'+n});
  if(n===88){s.sides.player.active=sl(74,'ralts');s.sides.player.active.playedOnSideTurn=1;s.sides.player.hand.push({uid:'gardevoir',cardId:'ex2-96'});}
  if(n===89){s.sides.player.active=sl(74,'ralts');s.sides.player.deck.unshift({uid:'kirlia',cardId:'ex2-40'});}
  const action=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='ex2-'+n);
  assert.ok(action,'No playable action for ex2-'+n);
  assert.doesNotThrow(()=>{core.applyAction(s,'player',action);resolveChoices(s);},'Trainer ex2-'+n);
 }
});
test('Rage damage counters remain HP-unit exact, not ten times too large',()=>{
 for(const [n,index,baseDamage] of [[23,0,10],[71,1,10]])for(const damage of [0,10,20,30]){
  const s=battle();s.sides.player.active=sl(n,'p');s.sides.player.active.damage=damage;
  const attack=C(n).attacks[index],ctx={...core.effectContext(s,'player',{},s.sides.player.active),random:()=>0.1,isAttack:true};
  const outcome=fx.resolveAttack(attack,ctx);
  assert.equal(outcome.damage,baseDamage+damage,`ex2-${n} at ${damage} damage`);
 }
});
test('dynamic EX damage changes with the correct game state',()=>{
 const s=battle();const ctx=(n,i)=>fx.resolveAttack(C(n).attacks[i],{...core.effectContext(s,'player',{},s.sides.player.active),random:()=>0.1,isAttack:true});
 s.sides.player.active=sl(100,'p');s.sides.player.active.damage=40;assert.equal(ctx(100,1).damage,60);
 s.sides.player.active=sl(12,'p');s.sides.opponent.active.energy={Water:3};assert.equal(ctx(12,0).damage,50);
 s.sides.player.active=sl(14,'p');s.sides.opponent.active=sl(11,'op');assert.equal(ctx(14,0).damage,40);
 s.sides.opponent.active=sl(72,'op');assert.equal(ctx(14,0).damage,10);
 s.sides.player.active=sl(7,'p');s.sides.player.active.energy={Water:3};assert.equal(ctx(7,0).damage,50);
});

test('Sandstorm passive rules preserve printed damage, retreat, healing, statuses and Supporter locks',()=>{
 // Armaldo prevents Supporters for both sides, but not Items.
 const armaldo=battle();armaldo.sides.player.active=sl(1,'armaldo');
 assert.ok(fx.isActionLocked(armaldo,'player','Supporter',classic.cardById));
 assert.ok(fx.isActionLocked(armaldo,'opponent','Supporter',classic.cardById));
 assert.ok(!fx.isActionLocked(armaldo,'player','Item',classic.cardById));
 // Cradily stops retreat of opponent, never its own owner.
 const cradily=battle();cradily.sides.opponent.active=sl(3,'cradily');
 cradily.sides.player.active.energy={Colorless:10};
 assert.ok(!core.legalActions(cradily,'player').some(x=>x.type==='retreat'));
 cradily.sides.opponent.active=sl(72,'pikachu');
 assert.ok(core.legalActions(cradily,'player').some(x=>x.type==='retreat'));
 // Volbeat has zero retreat cost with Illumise in play.
 const volbeat=battle();volbeat.sides.player.active=sl(53,'volbeat');volbeat.sides.player.active.energy={};
 assert.ok(!core.legalActions(volbeat,'player').some(x=>x.type==='retreat'));
 volbeat.sides.player.bench=[sl(38,'illumise')];volbeat.sides.player.bench[0].benchSlot=0;
 assert.ok(core.legalActions(volbeat,'player').some(x=>x.type==='retreat'));
 // Rain Dish heals 10 at checkup, but no more than accumulated damage.
 const rain=battle();rain.sides.player.active=sl(7,'ludicolo');rain.sides.player.active.damage=30;
 rain.sides.player.bench=[sl(92,'root')];rain.sides.player.bench[0].benchSlot=0;rain.sides.player.bench[0].damage=20;
 core.checkup(rain);
 assert.equal(rain.sides.player.active.damage,20);
 assert.equal(rain.sides.player.bench[0].damage,10);
 // Kecleon Energy Variation maps Basic Energy, and Solrock's override is turn-limited.
 const kec=battle();kec.sides.player.active=sl(18,'kec');kec.sides.player.active.energy={Water:2,Grass:1};
 assert.deepEqual(fx.effectiveTypes(kec,'player',kec.sides.player.active,classic.cardById).sort(),['Grass','Water']);
 const sol=battle();sol.sides.player.active=sl(13,'sol');sol.sides.player.active.ex2TypeOverride={type:'Fire',turn:sol.turnNumber};
 assert.deepEqual(fx.effectiveTypes(sol,'player',sol.sides.player.active,classic.cardById),['Fire']);
 sol.turnNumber++;assert.deepEqual(fx.effectiveTypes(sol,'player',sol.sides.player.active,classic.cardById),['Fighting']);
});

test('Multi Energy is exactly one flexible unit, becoming Colorless beside another Special Energy',()=>{
 const s=battle();const slot=s.sides.player.active;slot.energy={};slot.specialEnergy=[{uid:'multi',cardId:'ex2-93'}];
 const alone=core.effectiveEnergy(s,'player',slot);assert.equal(alone.Miracle,1);assert.equal(fx.totalEnergy(alone),1);
 assert.ok(fx.canPayCost(alone,'R'));assert.ok(fx.canPayCost(alone,'W'));assert.ok(!fx.canPayCost(alone,'RW'));
 slot.specialEnergy.push({uid:'colourless',cardId:'base1-96',provides:{Colorless:1}});
 const beside=core.effectiveEnergy(s,'player',slot);assert.equal(beside.Miracle||0,0);assert.equal(beside.Colorless,2);
 assert.ok(!fx.canPayCost(beside,'R'));assert.ok(fx.canPayCost(beside,'CC'));
});

test('ex2 damage-reduction bodies are not blanket damage immunity',()=>{
 const s=battle();const hit=(att,def,amount)=>fx.attackDamageWithState(s,'player',att,'opponent',def,amount,classic.cardById);
 s.sides.player.active=sl(72,'pika');s.sides.opponent.active=sl(29,'arbok');
 assert.equal(hit(s.sides.player.active,s.sides.opponent.active,40),30);
 s.sides.opponent.active=sl(39,'kabuto');assert.equal(hit(s.sides.player.active,s.sides.opponent.active,50),30);
 s.sides.opponent.active=sl(38,'illumise');s.sides.opponent.bench=[sl(53,'volbeat')];
 s.sides.player.active=sl(21,'sandslash');assert.equal(hit(s.sides.player.active,s.sides.opponent.active,50),20);
});

test('Aerodactyl ex Primal Lock removes enemy tools and blocks new Tools',()=>{
 const s=battle();s.sides.player.active=sl(94,'aero');s.sides.opponent.active.tool={uid:'item',cardId:'ecard1-150'};
 assert.ok(fx.isActionLocked(s,'opponent','Tool',classic.cardById));
 assert.ok(!fx.isActionLocked(s,'player','Tool',classic.cardById));
 core.checkup(s);assert.equal(s.sides.opponent.active.tool,null);
 assert.ok(s.sides.opponent.discard.some(r=>r.cardId==='ecard1-150'));
});

test('Sandslash Sand Swirl applies 20 real HP damage as well as retreat lock',()=>{
 const s=battle();s.sides.player.active=sl(21,'sand');s.sides.player.active.energy={Fighting:5,Colorless:2};
 const move=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(move);
 const before=s.sides.opponent.active.damage;
 core.applyAction(s,'player',move);resolveChoices(s);
 assert.equal(s.sides.opponent.active.damage-before,40); // Pikachu is Fighting-weak
 assert.ok(s.sides.opponent.active.locks?.some(l=>l.action==='retreat'));
});
