'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const md=require('../app/src/main/assets/tcg-classic-majestic-dawn');
const data=require('../app/src/main/assets/tcg-classic-battle-data');
const core=require('../app/src/main/assets/tcgp-battle-core');
const fx=require('../app/src/main/assets/tcgp-battle-effects');
const opponent=require('../app/src/main/assets/tcg-classic-opponents');
const auditor=require('../scripts/audit-classic-set.cjs');
const loan=opponent.generate({sets:['dp2'],type:'Grass',seed:17});assert.ok(loan.ok,loan.error);
const ref=(cardId,uid)=>({cardId,uid:uid||cardId+'-ref'});
const slot=(id,uid)=>core.makePokemonSlot(id,2,uid||id+'-slot');
function board(id='dp5-4',defender='dp5-38',seed=23){
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});s.phase='battle';s.activeSide='player';s.turnNumber=10;
 for(const who of ['player','opponent']){s.sides[who].turnCount=7;s.sides[who].hand=[];s.sides[who].bench=[];}
 s.sides.player.active=slot(id,'a');s.sides.player.active.energy={Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Fighting:5,Darkness:5,Metal:5};s.sides.opponent.active=slot(defender,'d');return s;
}
function hit(s,index=0){const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===index);assert.ok(a,'attack unavailable '+s.sides.player.active.cardId+'/'+index);core.applyAction(s,'player',a);}
function choose(s,pred){assert.equal(s.phase,'effectChoice');let options=core.legalActions(s,s.choiceSide).filter(x=>x.type==='effectChoice');assert.ok(options.length,'missing choices');const c=pred?options.find(pred):(options.find(x=>!x.choiceSkip)||options[0]);assert.ok(c,'missing target option: '+JSON.stringify(options));core.applyAction(s,s.choiceSide,c);return c;}
function finish(s){for(let i=0;i<25&&s.phase==='effectChoice';i++)choose(s);assert.notEqual(s.phase,'effectChoice','stalled choice');}
test('Majestic Dawn catalog has exact 100 print identities and correct gating',()=>{
 assert.equal(md.CARDS.length,100);assert.equal(new Set(md.CARDS.map(c=>c.id)).size,100);assert.equal(md.CARDS.filter(c=>c.battleEnabled).length,100);
 for(const c of md.CARDS){assert.equal(data.cardById(c.id),c);assert.equal(c.image,`https://images.pokemontcg.io/dp5/${c.number}.png`);if(c.battleEnabled)for(const p of [...(c.attacks||[]),...(c.abilities||[]),c])if(p.effect)assert.deepEqual(fx.validateEffect(p.effect),[],c.id);}
 assert.ok(data.SETS.some(s=>s.id==='dp5'));
 assert.ok(opponent.SETS.includes('dp5'));
 assert.ok(data.projectOwnedCards([{source:'tcg',setName:'Majestic Dawn',localId:'63',count:2}]).some(x=>x.gameplayId==='dp5-63'&&x.quantity===2));
});
test('Dialga Time Shift only draws up to six and Diamond Blast follows coin result',()=>{
 let s=board();s.sides.player.deck=Array.from({length:8},(_,i)=>ref('dp5-78','t'+i));s.sides.player.hand=[ref('dp5-77','before')];hit(s);assert.equal(s.sides.player.hand.length,6);
 s=board();hit(s,1);const flip=s.log.filter(x=>x.type==='coin').at(-1);assert.ok(flip);assert.equal(s.sides.opponent.active.damage,flip.heads?80:60);
});
test('Leafeon Bind Down locks only retreat and Leaf Guard reduces later damage',()=>{
 let s=board('dp5-7');hit(s);assert.ok(s.sides.opponent.active.locks?.some(l=>l.action==='retreat'));
 s=board('dp5-7');hit(s,1);assert.ok(s.modifiers.some(m=>m.stat==='damageReduction'&&m.amount===20));
});
test('Glaceon Ice Shot hits one Bench Pokémon and main target',()=>{
 const s=board('dp5-20');const b=slot('dp5-77','bench');b.benchSlot=0;s.sides.opponent.bench=[b];hit(s);finish(s);
 assert.equal(s.sides.opponent.active.damage,30);assert.equal(b.damage,10);
});
test('Torterra Earthquake damages own Bench only and Frenzy Plant locks its named attack',()=>{
 let s=board('dp5-30');const b=slot('dp5-78','own-b');b.benchSlot=0;s.sides.player.bench=[b];hit(s);assert.equal(b.damage,10);assert.equal(s.sides.opponent.active.damage,60);
 s=board('dp5-30');hit(s,1);assert.ok(s.sides.player.active.locks?.some(l=>l.attackName==='Frenzy Plant'));
});
test('Monferno Fire Fang burns; Croagunk Poison Sting flips without inventing status',()=>{
 const s=board('dp5-41');hit(s);assert.ok(s.sides.opponent.active.conditions.burn);
 for(let seed=1;seed<12;seed++){const q=board('dp5-60','dp5-38',seed);hit(q,1);const coin=q.log.find(x=>x.type==='coin');assert.ok(coin);assert.equal(!!q.sides.opponent.active.conditions.poison,!!coin.heads);}
});
test('Fearow Fury Attack, Kangaskhan Comet Punch and Lickitung Slam use printed flip counts',()=>{
 for(const [id,idx,count,unit] of [['dp5-36',0,3,20],['dp5-38',1,4,20],['dp5-39',1,2,20]]){
  const s=board(id);hit(s,idx);const f=s.log.find(x=>x.type==='coin');assert.equal(f?.coins,count);assert.equal(s.sides.opponent.active.damage,f.heads*unit);
 }
});
test('Bronzor Hypnosis and coin Confuse Ray have separate status effects',()=>{
 let s=board('dp5-52');hit(s);assert.ok(s.sides.opponent.active.conditions.sleep);
 s=board('dp5-52');hit(s,1);const f=s.log.find(x=>x.type==='coin');assert.equal(!!s.sides.opponent.active.conditions.confusion,!!f.heads);
});
test('Piplup Splatter and Electrike Random Spark expose distinct Active/Bench attack actions',()=>{
 for(const id of ['dp5-72','dp5-64']){const s=board(id);const b=slot('dp5-78','target-bench');b.benchSlot=0;s.sides.opponent.bench=[b];
  const options=core.legalActions(s,'player').filter(x=>x.type==='attack'&&x.attackIndex===0);
  assert.ok(options.some(x=>x.target==='opponentActive')&&options.some(x=>x.target==='opponentBench'),'missing physical targets');
  const action=options.find(x=>x.target==='opponentBench');core.applyAction(s,'player',action);finish(s);
  assert.equal(b.damage,10);assert.equal(s.sides.opponent.active.damage,0);
 }
});
test('Glameow Call for Family selects a real Basic card, not a text placeholder',()=>{
 const s=board('dp5-65');s.sides.player.deck=[ref('dp5-77','grass'),ref('dp5-30','torterra')];hit(s);
 assert.equal(s.phase,'effectChoice');const a=choose(s,x=>x.choiceCardId==='dp5-77');finish(s);assert.equal(a.choiceCardId,'dp5-77');assert.ok(s.sides.player.bench.some(x=>x.cardId==='dp5-77'));
});
test('Mom’s Kindness draws two physical cards and Dusk Ball shows real card IDs',()=>{
 let s=board();s.sides.player.hand=[ref('dp5-83','mom')];s.sides.player.deck=[ref('dp5-77','one'),ref('dp5-78','two'),ref('dp5-76','three')];let a=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='dp5-83');assert.ok(a);core.applyAction(s,'player',a);assert.equal(s.sides.player.hand.length,2);
 s=board();s.sides.player.hand=[ref('dp5-80','dusk')];s.sides.player.deck=[ref('dp5-78','basic'),ref('dp5-77','basic2'),ref('dp5-83','mom2')];a=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='dp5-80');assert.ok(a);core.applyAction(s,'player',a);assert.equal(s.phase,'effectChoice');const opts=core.legalActions(s,s.choiceSide);assert.ok(opts.some(x=>x.choiceCardId==='dp5-78'));
});
test('Majestic Dawn staged auditor has no schema errors or confirmed effect failures',()=>{
 const report=auditor.auditSet('dp5',{data,fx,core,opponents:opponent,smoke:false,cpu:false,engineText:''});assert.equal(report.summary.errors,0);
});

test('Cresselia Healing Light removes one counter from Active and each Bench Pokémon',()=>{
 const s=board('dp5-2');s.sides.player.active.damage=30;const b=slot('dp5-77','heal');b.benchSlot=0;b.damage=40;s.sides.player.bench=[b];hit(s,1);
 assert.equal(s.sides.player.active.damage,20);assert.equal(b.damage,30);
});
test('Glaceon Speed Slide bypasses Resistance and defensive effects',()=>{
 const s=board('dp5-5','dp4-45');hit(s,1);
 assert.equal(s.sides.opponent.active.damage,80);
});
test('Grotle Planting attaches a real Grass Energy card from hand to a chosen Pokémon',()=>{
 const s=board('dp5-37');s.sides.player.hand=[ref('base1-99','grass-physical')];
 const b=slot('dp5-78','grass-bench');b.benchSlot=0;s.sides.player.bench=[b];const before=Number(b.energy.Grass||0);
 const actions=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===0);
 const attack=actions.find(a=>a.target==='selfBench')||actions[0];assert.ok(attack);core.applyAction(s,'player',attack);finish(s);
 assert.ok(Number(s.sides.player.active.energy.Grass||0)+Number(b.energy.Grass||0)>5+before);
});
test('Raichu Thunderbolt discards every attached Energy after damage',()=>{
 const s=board('dp5-45','dp5-30');s.sides.player.active.energy={Lightning:3};s.sides.player.active.specialEnergy=[ref('dp5-95','special')];hit(s,1);finish(s);
 assert.equal(s.sides.opponent.active.damage,100);assert.equal(Object.values(s.sides.player.active.energy).reduce((a,b)=>a+b,0),0);assert.equal(s.sides.player.active.specialEnergy.length,0);
});
test('Scyther Fury Cutter uses nonlinear three-coin 10/20/40 bonus',()=>{
 for(let seed=1;seed<12;seed++){const s=board('dp5-46','dp5-38',seed);hit(s,1);const c=s.log.find(x=>x.type==='coin');assert.equal(c?.coins,3);assert.equal(s.sides.opponent.active.damage,10+([0,10,20,40][c.heads]));}
});
test('Chatot Mimic returns the physical hand to deck and draws opponent hand count',()=>{
 const s=board('dp5-55');s.sides.player.hand=[ref('dp5-78','u1'),ref('dp5-77','u2')];s.sides.opponent.hand=[ref('dp5-70','e1'),ref('dp5-71','e2'),ref('dp5-72','e3')];s.sides.player.deck=[ref('dp5-73','d1'),ref('dp5-74','d2'),ref('dp5-75','d3'),ref('dp5-76','d4')];hit(s);
 assert.equal(s.sides.player.hand.length,3);assert.equal(s.sides.opponent.hand.length,4);
});
test('Combee Honey Scent heals exactly 20 from the selected Pokémon',()=>{
 const s=board('dp5-59');s.sides.player.active.damage=30;hit(s);finish(s);
 assert.equal(s.sides.player.active.damage,10);
});
test('Drifloon Delivery recovers a chosen physical discard card on heads',()=>{
 let heads=0;for(let seed=1;seed<15;seed++){const s=board('dp5-61','dp5-38',seed);s.sides.player.discard=[ref('dp5-77','turtwig')];hit(s);const coin=s.log.find(x=>x.type==='coin');if(!coin.heads)continue;heads++;
  if(s.phase==='effectChoice')choose(s,x=>x.choiceCardId==='dp5-77');finish(s);
  assert.ok(s.sides.player.hand.some(x=>x.uid==='turtwig'),'physical card not recovered');
 }assert.ok(heads>0);
});

test('Hippowdon Vacuum Sand moves discarded Fighting Energy and Sand Impact counts per attached card',()=>{
 const s=board('dp5-21');s.sides.player.energyDiscard={Fighting:2};s.sides.player.active.energy={Fighting:3,Colorless:1};hit(s);finish(s);
 assert.equal(s.sides.player.active.energy.Fighting,4);assert.equal(s.sides.player.energyDiscard.Fighting,1);
 const q=board('dp5-21','dp4-30');q.sides.player.active.energy={Fighting:3,Colorless:1};hit(q,1);const c=q.log.find(x=>x.type==='coin');assert.equal(c.coins,3);assert.equal(q.sides.opponent.active.damage,50+c.heads*20);
});
test('Infernape Mega Bravo counts Fire Energy before discarding it; Mach Punch hits Bench',()=>{
 const s=board('dp5-22','dp4-30');s.sides.player.active.energy={Fire:3,Colorless:1};hit(s,1);finish(s);
 assert.equal(s.sides.opponent.active.damage,120);assert.equal(s.sides.player.active.energy.Fire,0);
 const q=board('dp5-22');const b=slot('dp5-75','bench');b.benchSlot=0;q.sides.opponent.bench=[b];hit(q);finish(q);
 assert.equal(q.sides.opponent.active.damage,30);assert.equal(b.damage,10);
});
test('Scizor Special Blow checks physical Special Energy on defender, and X-Scissor adds only on heads',()=>{
 let s=board('dp5-29','dp4-30');hit(s);assert.equal(s.sides.opponent.active.damage,30);
 s=board('dp5-29','dp4-30');s.sides.opponent.active.specialEnergy=[ref('dp5-95','metal')];hit(s);assert.equal(s.sides.opponent.active.damage,80);
 s=board('dp5-29','dp4-30');hit(s,1);const c=s.log.find(x=>x.type==='coin');assert.equal(s.sides.opponent.active.damage,50+(c.heads?40:0));
});
test('Prinplup Ice Blade targets real Active or Bench and Wash Over hits separate Bench Pokémon',()=>{
 const s=board('dp5-44');const b=slot('dp5-74','b'),d=slot('dp5-73','d');b.benchSlot=0;d.benchSlot=1;s.sides.opponent.bench=[b,d];
 const attacks=core.legalActions(s,'player').filter(x=>x.type==='attack'&&x.attackIndex===0);
 assert.ok(attacks.some(x=>x.target==='opponentActive')&&attacks.some(x=>x.target==='opponentBench'));
 core.applyAction(s,'player',attacks.find(x=>x.target==='opponentBench'));finish(s);assert.equal(b.damage,30);assert.equal(s.sides.opponent.active.damage,0);
 const q=board('dp5-44');const b1=slot('dp5-74','b1'),b2=slot('dp5-73','b2');b1.benchSlot=0;b2.benchSlot=1;q.sides.opponent.bench=[b1,b2];hit(q,1);finish(q);
 assert.equal(b1.damage,10);assert.equal(b2.damage,10);assert.equal(q.sides.opponent.active.damage,50);
});
test('Buneary Extend Ears heals every Benched Pokémon, not a single selected target',()=>{
 const s=board('dp5-53');const b=slot('dp5-77','bench1'),c=slot('dp5-78','bench2');b.damage=30;c.damage=20;b.benchSlot=0;c.benchSlot=1;s.sides.player.bench=[b,c];hit(s,1);finish(s);assert.equal(b.damage,20);assert.equal(c.damage,10);
});
test('Majestic Dawn reprinted Special Darkness and Metal apply real cross-set attack bonuses',()=>{
 const dark=board('dp3-21','dp4-30');dark.sides.player.active.energy={Darkness:2};dark.sides.player.active.specialEnergy=[ref('dp5-93','darkprint')];hit(dark,1);finish(dark);
 assert.equal(dark.sides.opponent.active.damage,20);
 const metal=board('dp5-47','dp4-16');metal.sides.opponent.active.specialEnergy=[ref('dp5-95','metalprint')];hit(metal,1);finish(metal);
 assert.equal(metal.sides.opponent.active.damage,40);
});
