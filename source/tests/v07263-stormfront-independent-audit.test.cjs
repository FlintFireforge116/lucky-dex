'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const db=require('../app/src/main/assets/tcg-classic-battle-data.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const storm=require('../app/src/main/assets/tcg-classic-stormfront.js');
const fs=require('node:fs');
const path=require('node:path');
const prints=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../data/classic/dp7-print-source.json'),'utf8'));
const owned=db.CARDS.filter(c=>c.setId==='dp7'&&c.battleEnabled).map(c=>({gameplayId:c.id,quantity:4}));
const allDp1And7=db.CARDS.filter(c=>['dp1','dp7'].includes(c.setId)&&c.battleEnabled).map(c=>({gameplayId:c.id,quantity:4}));
const symbol={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal'};
const counter=(r,id)=>r.cards.filter(x=>x===id).length;
function payable(c,energy){return !c.attacks?.length||c.attacks.some(a=>[...String(a.cost||'')].every(x=>x==='C'||energy.includes(symbol[x])));}
function checkDeck(r,tag){
 assert.ok(r.ok,tag+': '+(r.errors||r.error));assert.equal(r.cards.length,30,tag);
 const counts={};for(const id of r.cards){counts[id]=(counts[id]||0)+1;const c=db.cardById(id);assert.equal(c.setId,'dp7',tag+': off-set '+id);assert.ok(c.battleEnabled,tag+': gated '+id);}
 for(const [id,n] of Object.entries(counts)){
  const c=db.cardById(id);assert.ok(n<=4,tag+': five copies '+id);
  if(c.kind!=='pokemon')continue;
  if(c.evolvesFrom)assert.ok(r.cards.some(x=>db.cardById(x)?.name===c.evolvesFrom),tag+': orphan '+id);
  assert.ok(payable(c,r.energyTypes),tag+': unpayable '+id+' '+r.energyTypes);
 }
 const hasLvX=r.cards.some(id=>db.cardById(id)?.stage==='Level-Up');
 if(!hasLvX)assert.equal(counter(r,'dp7-91'),0,tag+': dead Premier Ball');
 assert.ok(counter(r,'dp7-91')<=2,tag+': Premier Ball overload');
 assert.ok(counter(r,'dp7-86')<=1,tag+': redundant Luxury Balls');
 assert.ok(counter(r,'dp7-85')<=3,tag+': excessive Basic search');
 assert.ok([0,2].includes(counter(r,'dp7-83')),tag+': orphan Energy Link');
 assert.ok(counter(r,'dp7-89')<=4,tag+': invalid Drawer count');
 if(counter(r,'dp7-82'))assert.ok(r.energyTypes.includes('Lightning')||r.energyTypes.includes('Metal'),tag+': empty Conductive Quarry');
}
test('all 106 archived prints match live identity, category, attacks and ability text',()=>{
 assert.equal(prints.length,106);assert.equal(storm.CARDS.length,106);
 for(const c of prints){const id='dp7-'+c.number,p=storm.cardById(id);assert.ok(p,id);assert.equal(p.name,c.name,id);assert.equal(p.battleEnabled,true,id);
   assert.deepEqual((p.attacks||[]).map(x=>[x.name,x.text]),(c.attacks||[]).map(x=>[x.name,x.text||'']),id);
   assert.deepEqual((p.abilities||[]).map(x=>[x.name,x.text]),(c.abilities||[]).map(x=>[x.name,x.text||'']),id);
   assert.ok(!(p.attacks||[]).some(a=>a.text?.trim()&&a.effect?.type==='noop'),id+': printed attack incorrectly marked no-op');
 }
});
test('Electrode Low Current only Paralyzes after a real opponent attack on the preceding turn',()=>{
 const loan=cpu.generate({sets:['dp7'],type:'Lightning',seed:6});assert.ok(loan.ok);
 const fixture=()=>{const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed:83,firstSide:'player',playerEnergyTypes:['Lightning'],opponentEnergyTypes:['Lightning']});s.phase='battle';s.turnNumber=10;s.activeSide='player';s.sides.player.active=core.makePokemonSlot('dp7-36',2,'electrode');s.sides.player.active.energy={Lightning:3};s.sides.opponent.active=core.makePokemonSlot('dp7-69',2,'target');s.sides.player.bench=[];s.sides.opponent.bench=[];return s;};
 for(const [recent,expected] of [[null,false],[8,false],[9,true]]){const s=fixture();if(recent)s.sides.player.active.lastDamageSource={attack:true,side:'opponent',turn:recent,damage:10};const attack=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(attack);core.applyAction(s,'player',attack);assert.equal(!!s.sides.opponent.active.conditions.paralysis,expected,'last hit '+recent);}
});
test('focused Stormfront builds and CPU opponent decks cannot contain dead Premier Ball or orphan Energy Link',()=>{
 let sampled=0;for(const c of storm.CARDS.filter(x=>x.kind==='pokemon')){
  const r=builder.buildDeck(owned,{sets:['dp7'],focusCardId:c.id,randomSeed:47});
  if(!r.ok){assert.ok(['dp7-2','dp7-3','dp7-9','dp7-11','dp7-97','dp7-100'].includes(c.id),c.id+': '+r.errors);continue;}
  checkDeck(r,'focus '+c.id);sampled++;
 }
 assert.ok(sampled>=75,sampled);
 for(let seed=1;seed<=5;seed++)for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless']){
  const r=cpu.generate({sets:['dp7'],type,seed:37*seed});checkDeck(r,'CPU '+type+' '+seed);
 }
});
test('automated Basic-only decks do not sneak in evolutions or Pokémon LV.X',()=>{
 for(const focus of ['dp7-48','dp7-45','dp7-SH1','dp7-70']){
  if(db.cardById(focus)?.stage!=='Basic')continue;
  const r=builder.buildDeck(owned,{sets:['dp7'],focusCardId:focus,basicOnly:true,randomSeed:10});assert.ok(r.ok,focus+': '+r.errors);
  assert.ok(r.cards.every(id=>db.cardById(id)?.kind!=='pokemon'||db.cardById(id).stage==='Basic'),focus);
 }
});
test('unavailable Stormfront-only Stage-2 prerequisites fail rather than importing another expansion',()=>{
 for(const id of ['dp7-2','dp7-3','dp7-11']){
   const r=builder.buildDeck(owned,{sets:['dp7'],focusCardId:id,randomSeed:23});assert.equal(r.ok,false,id);
   const mixed=builder.buildDeck(allDp1And7,{sets:['dp1','dp7'],focusCardId:id,randomSeed:23});assert.ok(mixed.ok,id+' with DP1 prerequisites: '+mixed.errors);
   assert.ok(mixed.cards.includes(id));
 }
});
test('manual preservation can retain explicitly supplied Luxury Ball copies without weakening automatic limits',()=>{
 const prior=['dp7-86','dp7-86'];const r=builder.buildDeck(owned,{sets:['dp7'],focusCardId:'dp7-48',cards:prior,randomSeed:29});assert.ok(r.ok,r.errors?.join('; '));assert.ok(counter(r,'dp7-86')>=2);
 const fresh=builder.buildDeck(owned,{sets:['dp7'],focusCardId:'dp7-48',randomSeed:29});assert.ok(fresh.ok);assert.equal(counter(fresh,'dp7-86'),1);
});
test('version is consistent across Gradle, visible HTML and core JavaScript',()=>{
 const base=path.resolve(__dirname,'../app'),g=fs.readFileSync(path.join(base,'build.gradle'),'utf8');
 const ver=g.match(/versionName '([^']+)'/)?.[1],app=fs.readFileSync(path.join(base,'src/main/assets/app-v0167.js'),'utf8'),html=fs.readFileSync(path.join(base,'src/main/assets/index.html'),'utf8');
 assert.ok(ver);assert.ok(app.includes(`__LUCKYDEX_BUILD='${ver}'`));assert.ok(html.includes(`id="titleBuildVersion">v${ver}`));assert.ok(html.includes(`id="appBuildVersion">LUCKY DEX · v${ver}`));
});
