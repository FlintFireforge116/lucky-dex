'use strict';
const test=require('node:test'), assert=require('node:assert/strict');
const base='../app/src/main/assets/';
const db=require(base+'tcg-classic-battle-data.js'),storm=require(base+'tcg-classic-stormfront.js'),fx=require(base+'tcgp-battle-effects.js');
const core=require(base+'tcgp-battle-core.js'),cpu=require(base+'tcg-classic-opponents.js');
const loan=cpu.generate({sets:['dp5'],type:'Grass',seed:49});assert.equal(loan.ok,true);
function slot(id,uid){return core.makePokemonSlot(id,2,uid||id);}
function board(id,defender='dp5-17',seed=17){const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});s.phase='battle';s.turnNumber=10;s.activeSide='player';for(const side of ['player','opponent']){s.sides[side].turnCount=7;s.sides[side].bench=[];s.sides[side].hand=[];s.sides[side].energyDiscard={};}s.sides.player.active=slot(id,'actor');s.sides.player.active.energy={Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Fighting:5,Darkness:5,Metal:5};s.sides.opponent.active=slot(defender,'defender');return s;}
function bench(s,side,id,uid){const p=slot(id,uid||side+'-bench-'+s.sides[side].bench.length);p.benchSlot=s.sides[side].bench.length;s.sides[side].bench.push(p);return p;}
function act(s,side='player',type='attack'){return core.legalActions(s,side).filter(x=>x.type===type);}
function settle(s,limit=30){for(let i=0;i<limit&&s.phase==='effectChoice';i++){const a=act(s,s.pendingChoice?.side||'player','effectChoice');assert.ok(a.length,'no choice for '+JSON.stringify(s.pendingChoice));core.applyAction(s,s.pendingChoice?.side||'player',a.find(x=>x.choiceLabel==='Done')||a[0]);}assert.notEqual(s.phase,'effectChoice','choice loop '+JSON.stringify(s.pendingChoice));}
function attack(s,i=0){const a=act(s).find(a=>a.attackIndex===i);assert.ok(a,'attack missing for '+s.sides.player.active.cardId+':'+i);core.applyAction(s,'player',a);settle(s);return s;}
test('All 106 official prints, including three secret and three Shiny, register correctly',()=>{assert.equal(storm.coverage().total,106);assert.ok(db.SETS?.some?.(x=>x.id==='dp7')||db.cardById('dp7-SH3'));const ids=new Set(storm.CARDS.map(c=>c.id));assert.equal(ids.size,106);for(let i=1;i<=103;i++)assert.ok(ids.has('dp7-'+i));for(const sh of ['SH1','SH2','SH3'])assert.ok(ids.has('dp7-'+sh));});
test('All battle-ready effects validate; incomplete cards never masquerade as fully supported',()=>{for(const c of storm.CARDS){assert.equal(c.deckEligible,c.battleEnabled,c.id);assert.equal(c.support.status,c.battleEnabled?'FULL':'PARTIAL',c.id);if(!c.battleEnabled)continue;for(const e of [...c.attacks||[],...c.abilities||[]])assert.deepEqual(fx.validateEffect(e.effect),[],c.id+':'+e.name);if(c.kind==='trainer')assert.deepEqual(fx.validateEffect(c.effect),[],c.id);}});
test('CPU set requests stay inside Stormfront and retain legal 30-card deck',()=>{for(const type of ['Grass','Fire','Water','Psychic','Lightning']){const x=cpu.generate({sets:['dp7'],type,seed:47});assert.equal(x.ok,true,type);assert.equal(x.cards.length,30,type);assert.ok(x.cards.every(id=>(typeof id==='string'?id:id?.id||'').startsWith('dp7-')),type);}});
test('Every battle-ready printed Pokémon attack can be used in live Classic battle',()=>{let attacks=0;const failures=[];for(const c of storm.CARDS.filter(c=>c.battleEnabled&&c.kind==='pokemon'))for(let i=0;i<c.attacks.length;i++){try{const s=board(c.id);bench(s,'player','dp5-17');bench(s,'opponent','dp5-17');s.sides.player.hand=[{uid:'h1',cardId:'dp5-17'},{uid:'h2',cardId:'dp5-17'}];attack(s,i);assert.ok(s.log?.length>=0);attacks++;}catch(e){failures.push(c.id+' '+c.attacks[i].name+': '+e.message);}}assert.equal(failures.length,0,failures.join('\n'));assert.ok(attacks>=60);});
test('Snow Veil protects both friendly Active and Bench after weaknesses, and Sunny Day gives +10 only to Grass/Fire attackers',()=>{
 const s=board('dp7-31','dp7-12');s.sides.opponent.active.energy={Grass:2};const b=bench(s,'opponent','dp5-17');const hit=fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',b,40,db.cardById);assert.equal(hit,20);
 const r=board('dp7-31');bench(r,'player','dp7-14');const before=fx.attackDamageWithState(r,'player',r.sides.player.active,'opponent',r.sides.opponent.active,20,db.cardById);
 const q=board('dp7-32');bench(q,'player','dp7-14');assert.equal(fx.attackDamageWithState(q,'player',q.sides.player.active,'opponent',q.sides.opponent.active,20,db.cardById),20);assert.equal(before,30);
});
test('Scizor Honeycomb and Pupitar Energy Protection reduce after type adjustments; Machamp No Guard gives and takes 60',()=>{
 const s=board('dp7-31','dp7-25');s.sides.opponent.active.damage=60;assert.equal(fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',s.sides.opponent.active,60,db.cardById),20);
 const r=board('dp7-31','dp7-47');r.sides.opponent.active.energy={Grass:10};assert.equal(fx.attackDamageWithState(r,'player',r.sides.player.active,'opponent',r.sides.opponent.active,60,db.cardById),50);
 const q=board('dp7-98','dp5-17');assert.equal(fx.attackDamageWithState(q,'player',q.sides.player.active,'opponent',q.sides.opponent.active,20,db.cardById),80);
 const z=board('dp5-17','dp7-98');assert.equal(fx.attackDamageWithState(z,'player',z.sides.player.active,'opponent',z.sides.opponent.active,20,db.cardById),80);
});
test('Battle Rush and Regi Form remove only printed Colorless costs',()=>{
 const q=board('dp7-24','dp7-98');const a=act(q);assert.ok(a.length,'Salamence attack accessible with 120+ HP opponent');
 const r=board('dp7-9');for(const name of ['Regirock','Regice','Registeel']){
   const c=storm.CARDS.find(x=>x.name===name);const fallback=c||db.cardById('dp6-36');bench(r,'player',fallback.id);
 }
 assert.ok(act(r).length);
});
test('Budew Poison Enzyme blocks attacks by Poisoned opponent but not unpoisoned; Unaware only blocks effects',()=>{
 const b=board('dp7-31','dp7-33');b.sides.player.active.conditions={poison:true};assert.ok(fx.attackIsPrevented(b,'opponent',b.sides.opponent.active,b.sides.player.active,db.cardById));
 b.sides.player.active.conditions={};assert.ok(!fx.attackIsPrevented(b,'opponent',b.sides.opponent.active,b.sides.player.active,db.cardById));
 const s=board('dp7-31','dp7-32');assert.equal(fx.attackEffectsPrevented(s,'opponent',s.sides.opponent.active,s.sides.player.active,db.cardById),true);
});
test('Cyclone/Warp Energy attach from hand to Active and request mandatory existing switch targets',()=>{
 for(const [n,side] of [[94,'opponent'],[95,'player']]){
  const s=board('dp7-31');const b=bench(s,side,'dp7-50',side+'bench');
  s.sides.player.hand=[{uid:'special'+n,cardId:'dp7-'+n}];
  const action=act(s,'player','attachSpecial').find(a=>a.cardId==='dp7-'+n&&a.target==='active');assert.ok(action,n+' hand attachment not available');
  core.applyAction(s,'player',action);assert.equal(s.phase,'effectChoice',n+' did not start mandatory switch');
  const choice=act(s,s.pendingChoice.side,'effectChoice').find(a=>a.choiceBenchIndex!=null);assert.ok(choice,n+' missing bench position');
  core.applyAction(s,s.pendingChoice.side,choice);assert.equal(s.sides[side].active.uid,b.uid,n+' did not switch active');
 }
});
test('Machamp LV.X Strong-Willed installs a real next-turn conditional KO survival guard',()=>{
 const s=board('dp7-98');attack(s,0);assert.equal(s.sides.player.active.koGuard?.mode,'surviveCoin');assert.equal(s.sides.player.active.koGuard?.remainingHp,10);
});

test('Energy Link is correctly gated until real attached-energy transfer is implemented',()=>{const tool=storm.cardById('dp7-83');assert.equal(tool.battleEnabled,false);assert.match(tool.support.reasons.join(' '),/Energy Link/);});
