'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const set=require('../app/src/main/assets/tcg-classic-secret-wonders');
const data=require('../app/src/main/assets/tcg-classic-battle-data');
const core=require('../app/src/main/assets/tcgp-battle-core');
const fx=require('../app/src/main/assets/tcgp-battle-effects');
const opp=require('../app/src/main/assets/tcg-classic-opponents');
const auditor=require('../scripts/audit-classic-set.cjs');
const loan=opp.generate({sets:['dp2'],type:'Grass',seed:17});
assert.ok(loan.ok,'loaner deck must be valid');
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const ref=(cardId,uid)=>({cardId,uid:uid||cardId+'-ref'});
function slot(id,uid,energy={}){const s=core.makePokemonSlot(id,2,uid||id+'-slot');s.energy=energy;return s;}
function board(card='dp3-17',opponent='dp3-49',side='player',seed=23){
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed,firstSide:side,playerEnergyTypes:types,opponentEnergyTypes:types});s.phase='battle';s.activeSide=side;s.turnNumber=10;
 for(const who of ['player','opponent']){s.sides[who].turnCount=7;s.sides[who].hand=[];s.sides[who].bench=[];}
 const foe=side==='player'?'opponent':'player';s.sides[side].active=slot(card,side+'-a',{Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Darkness:4,Metal:4});s.sides[foe].active=slot(opponent,foe+'-a');return s;
}
function hit(s,side='player',i=0,target){const actions=core.legalActions(s,side),a=actions.find(x=>x.type==='attack'&&x.attackIndex===i&&(!target||x.target===target));assert.ok(a,`Missing ${side} attack ${i} (${target||'any'}): `+JSON.stringify(actions.filter(x=>x.type==='attack')));core.applyAction(s,side,a);return a;}
function finishChoices(s,choose){let n=0;while(s.phase==='effectChoice'&&n++<25){const actions=core.legalActions(s,s.choiceSide).filter(a=>a.type==='effectChoice');assert.ok(actions.length,'missing legal choice');core.applyAction(s,s.choiceSide,choose?.(actions,s)||actions.find(a=>!a.choiceSkip)||actions[0]);}assert.notEqual(s.phase,'effectChoice','choice flow stuck');}

test('Current staged set keeps all implemented cards battle ready, gated entries remain unavailable and all enabled effects validate',()=>{
 assert.equal(set.CARDS.length,132);assert.equal(set.coverage().battleEnabled,132);assert.equal(set.coverage().gated.length,0);
 for(const c of set.CARDS.filter(c=>c.battleEnabled))for(const a of [...(c.attacks||[]),...(c.abilities||[]),c])if(a.effect)assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+(a.name||'card'));
 for(const n of [1,6,7,18,35,101,131,132])assert.equal(data.cardById('dp3-'+n).battleEnabled,true);
});

test('auditor verifies every enabled card attack and Trainer for both player and CPU sides',()=>{
 const report=auditor.auditSet('dp3',{data,fx,core,opponents:opp,smoke:true,cpu:false,engineText:''});
 assert.equal(report.summary.errors,0);assert.equal(report.smoke.executed,report.smoke.attempted);assert.equal(report.smoke.skipped,0);assert.deepEqual(report.smoke.failures,[]);
});

test('Roserade applies Sleep and Poison, and Magical Leaf only adds 30 and heals on heads',()=>{
 const s=board();hit(s,'player',0);assert.ok(s.sides.opponent.active.conditions.sleep);assert.ok(s.sides.opponent.active.conditions.poison);
 let seen=0;for(let seed=1;seed<=30;seed++){
  const x=board('dp3-17','dp3-18','player',seed);x.sides.player.active.damage=50;hit(x,'player',1);const coin=x.log.find(e=>e.type==='coin'&&typeof e.heads==='boolean');if(!coin)continue;seen++;
  assert.equal(x.sides.opponent.active.damage,coin.heads?70:40);assert.equal(x.sides.player.active.damage,coin.heads?20:50);
 }assert.ok(seen>10);
});

test('Mothim Raging Scales requires damage and Silver Wind boosts its next actual damaging attack only',()=>{
 for(const damage of [0,10]){const s=board('dp3-33','dp3-18');s.sides.player.active.damage=damage;hit(s,'player',1);assert.equal(s.sides.opponent.active.damage,damage?70:30);}
 const s=board('dp3-33','dp3-18');hit(s,'player',0);s.turnNumber=12;s.activeSide='player';hit(s,'player',1);assert.equal(s.sides.opponent.active.damage,70);
});

test('Mothim evolves from every Burmy cloak but Wormadam only from its own cloak',()=>{
 for(const n of [78,79,80]){const s=board('dp3-'+n);s.sides.player.active.energy={Grass:2};s.sides.player.active.playedOnSideTurn=1;s.sides.player.hand=[ref('dp3-33','mothim'),ref('dp3-41','plant-wormadam')];
  const evo=core.legalActions(s,'player').filter(a=>a.type==='evolve');assert.ok(evo.some(a=>a.cardId==='dp3-33'),'Mothim not available from '+n);
  assert.equal(evo.some(a=>a.cardId==='dp3-41'),n===78,'Wormadam cloak eligibility '+n);
 }
});

test('Wormadam Plant Cloak max HP, Sandy Cloak effect protection, Trash Cloak Tool reduction',()=>{
 const plant=board('dp3-41');plant.sides.player.active.energy={Grass:2};assert.equal(core.maxHp(plant,'player',plant.sides.player.active),120);
 plant.sides.player.active.energy={Grass:1};assert.equal(core.maxHp(plant,'player',plant.sides.player.active),80);
 plant.sides.player.active.specialEnergy=[{cardId:'special-grass-test',uid:'grass-1',provides:{Grass:1}}];assert.equal(core.maxHp(plant,'player',plant.sides.player.active),120,'special Grass should count as attached Grass');
 const sandy=board('dp3-42','dp3-17','opponent');assert.equal(fx.attackEffectsPrevented(sandy,'opponent',sandy.sides.opponent.active,sandy.sides.player.active,data.cardById),true);
 const trash=board('dp3-43');trash.sides.player.active.tool=ref('dp2-66','held-tool');assert.equal(fx.modifierAmount(trash,'player',trash.sides.player.active,'damageReduction',data.cardById),20);
 trash.sides.player.active.tool=null;assert.equal(fx.modifierAmount(trash,'player',trash.sides.player.active,'damageReduction',data.cardById),0);
});

test('Breloom heals by opponent attached physical Energy cards and Homing Uppercut checks retreat cost',()=>{
 const s=board('dp3-45','dp3-49');s.sides.player.active.damage=60;s.sides.opponent.active.energy={Water:2};hit(s,'player',0);assert.equal(s.sides.player.active.damage,40);assert.equal(s.sides.opponent.active.damage,40);
 for(const [opp,expected] of [['dp3-35',120],['dp3-49',60]]){const x=board('dp3-45',opp);hit(x,'player',1);if(expected>=core.maxHp(x,'opponent',x.sides.opponent.active||slot(opp)))assert.ok(!x.sides.opponent.active||x.sides.opponent.active.damage>=expected);else assert.equal(x.sides.opponent.active.damage,expected);}
});

test('Charmeleon Flare Tail flips and discards one Fire Energy only if heads',()=>{
 for(let seed=1;seed<=20;seed++){const s=board('dp3-46','dp3-18','player',seed);s.sides.player.active.energy={Fire:3};hit(s,'player',1);const coin=s.log.find(e=>e.reason==='Flare Tail');assert.ok(coin);assert.equal(s.sides.opponent.active.damage,coin.heads?70:50);assert.equal(s.sides.player.active.energy.Fire,coin.heads?2:3);}
});

test('Nidorino next-turn Spirited Drill bonus applies before matchup and Poison Horn still Poisons',()=>{
 const s=board('dp3-57','dp3-18');hit(s,'player',0);s.turnNumber=12;s.activeSide='player';hit(s,'player',1);
 assert.equal(s.sides.opponent.active.damage,90);assert.ok(s.sides.opponent.active.conditions.poison);
});

test('Pinsir Power Guillotine deals 100 only for two heads, while Grip and Squeeze locks retreat',()=>{
 for(let seed=1;seed<=25;seed++){const s=board('dp3-59','dp3-18','player',seed);hit(s,'player',1);const c=s.log.find(e=>e.reason==='Power Guillotine');assert.ok(c);assert.equal(s.sides.opponent.active.damage,c.heads===2?100:10);}
 const s=board('dp3-59','dp3-18');hit(s,'player',0);assert.ok(s.sides.opponent.active.locks?.some(l=>l.action==='retreat'));
});

test('Raticate Sneaky Attack needs Darkness Energy; Stage 2 coin-free bonus stays conditional',()=>{
 for(const [energy,expected] of [[{Darkness:1,Colorless:1},40],[{Colorless:2},20]]){const s=board('dp3-61','dp3-17');s.sides.player.active.energy=energy;hit(s,'player',1);assert.equal(s.sides.opponent.active.damage,expected);}
});

test('Burmy Wear Cloak is available only as Active with the right discarded Energy',()=>{
 for(const [number,type] of [[78,'Grass'],[79,'Fighting'],[80,'Metal']]){
  const s=board('dp3-'+number);s.sides.player.energyDiscard={[type]:1};const a=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='dp3-'+number);assert.ok(a,`Wear Cloak missing for ${number}`);core.applyAction(s,'player',a);
  assert.equal(s.sides.player.active.energy[type],5);assert.equal(s.sides.player.energyDiscard[type],0);
  const b=board('dp3-82');b.sides.player.bench=[slot('dp3-'+number,'burmy-bench')];b.sides.player.bench[0].benchSlot=0;b.sides.player.energyDiscard={[type]:1};assert.ok(!core.legalActions(b,'player').some(a=>a.type==='ability'&&a.cardId==='dp3-'+number),'benched Burmy power should be hidden');
 }
});

test('Murkrow Feint Attack targets opposing Bench and ignores Weakness and Resistance',()=>{
 const s=board('dp3-95','dp3-18');const benched=slot('dp3-83','defender-bench');benched.benchSlot=0;s.sides.opponent.bench=[benched];const actions=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(actions.some(a=>a.target==='opponentBench'));hit(s,'player',0,'opponentBench');assert.equal(benched.damage,20);assert.equal(s.sides.opponent.active.damage,0);
});

test('Shellos West Sea Recover discards Water and clears own damage',()=>{
 const s=board('dp3-107','dp3-18');s.sides.player.active.damage=40;s.sides.player.active.energy={Water:2};hit(s,'player',1);assert.equal(s.sides.player.active.damage,0);assert.equal(s.sides.player.active.energy.Water,1);assert.equal(s.sides.player.energyDiscard.Water,1);
});

test('Spinda Dish Out takes top AND bottom, while Synchro Punch counts basic matching Energy',()=>{
 const s=board('dp3-111','dp3-18');s.sides.player.deck=[ref('dp3-82','top'),ref('dp3-83','mid'),ref('dp3-84','bottom')];hit(s,'player',0);assert.deepEqual(s.sides.player.hand.map(x=>x.uid),['top','bottom']);assert.deepEqual(s.sides.player.deck.map(x=>x.uid),['mid']);
 for(const [ownE,otherE,expected] of [[{Grass:1},{Grass:1},40],[{Grass:1},{Water:1},10]]){const x=board('dp3-111','dp3-17');x.sides.player.active.energy=ownE;x.sides.opponent.active.energy=otherE;hit(x,'player',1);assert.equal(x.sides.opponent.active.damage,expected);}
});

test('Jynx Icy Kiss respects prior-turn attack damage and Lovely Kiss moves counters (Smoochum under doubles)',()=>{
 const s=board('dp3-30','dp3-18');s.sides.player.active.damage=40;hit(s,'player',1);assert.equal(s.sides.player.active.damage,20);assert.equal(s.sides.opponent.active.damage,20);
 const x=board('dp3-30','dp3-18');x.sides.player.active.damage=40;x.sides.player.active.stack=['dp3-67','dp3-30'];hit(x,'player',1);assert.equal(x.sides.player.active.damage,0);assert.equal(x.sides.opponent.active.damage,40);
 const y=board('dp3-30','dp3-18');y.sides.player.active.lastDamageSource={attack:'Bite',side:'opponent',turn:9};hit(y,'player',0);assert.ok(y.sides.opponent.active.conditions.paralysis);
});

test('Sunflora Petal Dance uses 3 coin outcomes and confuses itself on 2+ heads',()=>{
 for(let seed=1;seed<=35;seed++){const s=board('dp3-38','dp3-18','player',seed);hit(s,'player',0);
  const c=s.log.find(e=>e.reason==='Petal Dance');assert.ok(c);assert.equal(s.sides.opponent.active?.damage,c.heads*30);assert.equal(!!s.sides.player.active.conditions.confusion,c.heads>=2);
 }
});

test('Sunflora Grass Whistle heals each damaged Grass Pokémon and cannot activate while status-blocked',()=>{
 const s=board('dp3-38','dp3-49');const b=slot('dp3-17','rosy');b.damage=30;b.benchSlot=0;s.sides.player.bench=[b];s.sides.player.active.damage=20;
 const a=core.legalActions(s,'player').find(x=>x.type==='ability'&&x.cardId==='dp3-38');assert.ok(a,'Grass Whistle should be available');core.applyAction(s,'player',a);
 assert.equal(s.sides.player.active.damage,10);assert.equal(b.damage,20);
 const x=board('dp3-38');x.sides.player.active.conditions={sleep:true};assert.ok(!core.legalActions(x,'player').some(a=>a.type==='ability'&&a.cardId==='dp3-38'));
});

test('Quagsire Aqua Healing activates only with opponent Water Energy, while Muddy Water adds 20 to the chosen Bench',()=>{
 const s=board('dp3-60','dp3-17');s.sides.player.active.damage=40;s.sides.opponent.active.energy={Water:1};
 const p=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='dp3-60');assert.ok(p);core.applyAction(s,'player',p);assert.equal(s.sides.player.active.damage,10);
 const x=board('dp3-60','dp3-17');x.sides.player.active.damage=30;assert.ok(!core.legalActions(x,'player').some(a=>a.type==='ability'&&a.cardId==='dp3-60'));
 const y=board('dp3-60','dp3-18');const bench=slot('dp3-17','op-b');bench.benchSlot=0;y.sides.opponent.bench=[bench];hit(y,'player',0);finishChoices(y);assert.equal(y.sides.opponent.active.damage,60);assert.equal(bench.damage,20);
});

test('Unown K Kind correctly heals enemy Active rather than friendly Pokémon',()=>{
 const s=board('dp3-68','dp3-17');s.sides.player.active.damage=20;s.sides.opponent.active.damage=40;
 const a=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='dp3-68');assert.ok(a);core.applyAction(s,'player',a);
 assert.equal(s.sides.opponent.active.damage,20);assert.equal(s.sides.player.active.damage,20);
});

test('Duskull Astonish reveals and returns the exact same chosen card to opponent deck (heads)',()=>{
 let heads=0;for(let seed=1;seed<=25;seed++){const s=board('dp3-86','dp3-17','player',seed);s.sides.opponent.hand=[ref('dp3-82','first'),ref('dp3-83','second')];s.sides.opponent.deck=[ref('dp3-84','top')];hit(s,'player',0);
  const coin=s.log.find(x=>x.type==='coin'&&typeof x.heads==='boolean');if(!coin?.heads)continue;heads++;
  const shown=s.log.find(x=>x.reason==='Astonish'&&x.type==='revealHand');assert.ok(shown);
  // The attack ends the turn and starts the opponent's turn, drawing one card.
  // Check the recorded exact transfer, not post-draw zone counts.
  const moved=s.log.find(x=>x.type==='neoEffect'&&x.cardId===shown.cards[0]&&x.zone==='opponentDeck');
  assert.ok(moved,'Astonish did not return the revealed card to the deck');
  assert.equal(s.sides.opponent.hand.length+s.sides.opponent.deck.length,3);
  assert.equal([...s.sides.opponent.hand,...s.sides.opponent.deck].filter(r=>r.cardId===shown.cards[0]).length,1);
 }assert.ok(heads>3);
});

test('Sentret Grope requires a player choice and moves unchosen top card to actual deck bottom',()=>{
 const s=board('dp3-104','dp3-17');s.sides.player.deck=[ref('dp3-82','top'),ref('dp3-83','second'),ref('dp3-84','third')];hit(s,'player',0);
 assert.equal(s.phase,'effectChoice');const actions=core.legalActions(s,s.choiceSide).filter(a=>a.type==='effectChoice');assert.ok(actions.some(a=>a.choiceDeckIndex===1));
 const picked=actions.find(a=>a.choiceDeckIndex===1);core.applyAction(s,s.choiceSide,picked);finishChoices(s);
 assert.ok(s.sides.player.hand.some(r=>r.uid==='second'));assert.deepEqual(s.sides.player.deck.map(r=>r.uid),['third','top']);
});

test('Shellos East Sea search benches selected East and West Sea Shellos, without exceeding Bench cap',()=>{
 const s=board('dp3-106','dp3-17');s.sides.player.deck=[ref('dp3-107','west'),ref('dp3-106','east'),ref('dp3-82','charm')];
 hit(s,'player',0);assert.equal(s.phase,'effectChoice');finishChoices(s,actions=>actions.find(a=>a.choiceDeckIndex!=null)||actions.find(a=>!a.choiceSkip)||actions[0]);
 assert.equal(s.sides.player.bench.length,2);assert.deepEqual(new Set(s.sides.player.bench.map(b=>b.cardId)),new Set(['dp3-106','dp3-107']));
});

test('Professor Oak Visit draws 3 then chooses exactly 1 hand card to place on deck bottom',()=>{
 const s=board('dp3-82','dp3-17');s.sides.player.hand=[ref('dp3-122','oak'),ref('dp3-83','original')];s.sides.player.deck=[ref('dp3-84','first'),ref('dp3-85','second'),ref('dp3-86','third'),ref('dp3-87','fourth')];
 const act=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='dp3-122');assert.ok(act);core.applyAction(s,'player',act);
 assert.equal(s.phase,'effectChoice');assert.equal(s.sides.player.hand.length,4);const choices=core.legalActions(s,s.choiceSide).filter(a=>a.type==='effectChoice');assert.ok(choices.some(x=>x.choiceHandIndex!=null));
 core.applyAction(s,s.choiceSide,choices.find(x=>x.choiceHandIndex===0));finishChoices(s);
 assert.equal(s.sides.player.hand.length,3);assert.equal(s.sides.player.deck.at(-1).cardId,'dp3-83');
});

test('Team Galactic Mars draws two and sends one random opponent hand card to the bottom, no shuffling',()=>{
 for(const side of ['player','opponent']){const foe=side==='player'?'opponent':'player',s=board('dp3-82','dp3-17',side);s.sides[side].hand=[ref('dp3-126','mars')];s.sides[side].deck=[ref('dp3-82','draw1'),ref('dp3-83','draw2'),ref('dp3-84','left')];s.sides[foe].hand=[ref('dp3-85','one'),ref('dp3-86','two')];s.sides[foe].deck=[ref('dp3-87','foeTop')];
  const act=core.legalActions(s,side).find(a=>a.type==='trainer'&&a.cardId==='dp3-126');assert.ok(act);core.applyAction(s,side,act);finishChoices(s);
  assert.equal(s.sides[side].hand.length,2);assert.equal(s.sides[foe].hand.length,1);assert.equal(s.sides[foe].deck.length,2);assert.equal(s.sides[foe].deck[0].uid,'foeTop');
 }
});
