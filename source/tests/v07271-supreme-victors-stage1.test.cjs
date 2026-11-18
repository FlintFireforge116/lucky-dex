'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const printed=JSON.parse(fs.readFileSync(path.join(root,'data/classic/pl3-print-source.json'),'utf8'));
const supreme=require(path.join(assets,'tcg-classic-supreme-victors.js'));
const db=require(path.join(assets,'tcg-classic-battle-data.js'));
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
const active=supreme.CARDS.filter(c=>c.battleEnabled);
const energy={Grass:10,Fire:10,Water:10,Lightning:10,Psychic:10,Fighting:10,Darkness:10,Metal:10,Colorless:10};

test('Supreme Victors exact 153 official prints; 254 attacks and 34 abilities retain names, texts and identity',()=>{
 assert.equal(printed.length,153);assert.equal(supreme.CARDS.length,153);assert.equal(new Set(supreme.CARDS.map(c=>c.id)).size,153);
 assert.equal(printed.reduce((n,c)=>n+(c.attacks||[]).length,0),254);
 assert.equal(printed.reduce((n,c)=>n+(c.abilities||[]).length,0),34);
 assert.ok(active.length>=84,'Generated playable coverage decreased from v0.69.273 baseline');
 for(const p of printed){
  const c=supreme.cardById('pl3-'+p.number);assert.ok(c,p.number);assert.equal(c.name,p.name);assert.equal(c.kind,p.supertype==='Pokémon'?'pokemon':'trainer');
  assert.deepEqual((c.attacks||[]).map(x=>[x.name,x.text,x.cost]),(p.attacks||[]).map(x=>[x.name,x.text||'',(x.cost||[]).map(t=>({Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M',Colorless:'C'})[t]).join('')]));
  assert.deepEqual((c.abilities||[]).map(x=>[x.name,x.text,x.printedPowerType]),(p.abilities||[]).map(x=>[x.name,x.text||'',x.type==='Poké-Power'?'power':'body']));
  if(c.kind==='pokemon'){assert.equal(c.hp,Number(p.hp));assert.deepEqual(c.types,p.types);assert.equal(c.stage,p.subtypes[0]);assert.equal(c.evolvesFrom,p.evolvesFrom||(c.stage==='Level-Up'?c.name.replace(/ LV\.X$/,''):null));}
  if(c.battleEnabled){assert.equal(c.deckEligible,true);assert.equal(c.support.status,'FULL');for(const x of [...(c.attacks||[]),...(c.abilities||[]),...(c.effect?[{effect:c.effect}]:[])])assert.deepEqual(fx.validateEffect(x.effect),[],`${c.id}:${x.name}`);}
  else{assert.equal(c.deckEligible,false);assert.ok(c.support.reasons.length,'missing disabled reason '+c.id);}
 }
});

test('Supreme Victors is visible and resolvable in collection, picker, CPU and deck builder',()=>{
 assert.ok(db.SETS.some(s=>s.id==='pl3'));
 assert.ok(cpu.SETS.includes('pl3'));assert.ok(builder.SET_IDS.includes('pl3'));
 assert.ok(db.cardById('pl3-SH9'));assert.ok(db.cardById('pl3-150'));
 const owned=db.projectOwnedCards([{source:'tcg',setId:'pl3',number:'93',count:2},{source:'tcg',setId:'pl3',number:'SH9',quantity:1}]);
 assert.ok(owned.some(r=>r.gameplayId==='pl3-93'&&r.quantity===2),JSON.stringify(owned));
 assert.ok(owned.some(r=>r.gameplayId==='pl3-SH9'),JSON.stringify(owned));
});

test('Supreme Victors CPU makes legal, playable 30-card decks for eight available Energy categories',()=>{
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Colorless']){
  const r=cpu.generate({sets:['pl3'],type,seed:13});assert.ok(r.ok,`${type}: ${r.error}`);
  assert.equal(r.cards.length,30,type);const legal=db.validateDeck(r.cards);assert.ok(legal.ok,`${type}: ${(legal.errors||[]).join('; ')}`);
  for(const id of r.cards){const c=db.cardById(id);assert.ok(c&&c.setId==='pl3'&&c.battleEnabled&&c.deckEligible!==false,type+': '+id);}
  for(const id of r.cards){const c=db.cardById(id);if(c.kind==='pokemon'&&c.evolvesFrom&&c.stage!=='Basic')assert.ok(r.cards.some(x=>db.cardById(x).name===c.evolvesFrom),`${type}: orphan ${c.id}`);}
 }
});

test('all enabled Supreme Victors attacks resolve or provide a legal choice; no stalling',()=>{
 const loan=cpu.generate({sets:['pl3'],type:'Grass',seed:13});assert.ok(loan.ok);
 let checked=0;
 for(const c of active.filter(x=>x.kind==='pokemon'))for(let k=0;k<c.attacks.length;k++){
  const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed:57,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
  s.phase='battle';s.turnNumber=12;s.activeSide='player';
  for(const side of ['player','opponent']){const ss=s.sides[side];ss.turnCount=5;ss.hand=[{uid:'hand-'+side,cardId:'pl3-136'}];ss.discard=[{uid:'discard-'+side,cardId:'pl3-90'},{uid:'water-energy-'+side,cardId:'dp1-125'},{uid:'grass-energy-'+side,cardId:'dp1-123'}];ss.lostZone=[];ss.bench=[];}
  s.sides.player.active=core.makePokemonSlot(c.id,2,'supreme-'+c.id);s.sides.player.active.energy={...energy};s.sides.player.active.damage=10;
  s.sides.opponent.active=core.makePokemonSlot('pl3-90',2,'opponent');s.sides.opponent.active.energy={...energy};s.sides.opponent.active.damage=10;s.sides.opponent.bench=[core.makePokemonSlot('pl3-95',2,'opp-bench')];
  s.sides.player.bench=[core.makePokemonSlot('pl3-91',2,'my-bench')];
  s.sides.player.deck.unshift({uid:'extra-basic',cardId:'pl3-93'},{uid:'extra-stadium',cardId:'pl1-104'},{uid:'extra-trainer',cardId:'pl3-140'});
  const action=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===k);
  assert.ok(action,`${c.id} ${c.attacks[k].name}: attack unavailable`);
  assert.doesNotThrow(()=>core.applyAction(s,'player',action),c.id+' '+c.attacks[k].name);
  for(let n=0;n<12&&s.phase==='effectChoice';n++){
   const who=s.choiceSide||'player',options=core.legalActions(s,who),choice=options.find(x=>x.type==='effectChoice'&&!x.choiceSkip)||options.find(x=>x.type==='effectChoice')||options.find(x=>x.type==='chooseEffect')||options[0];
   assert.ok(choice,`${c.id} ${c.attacks[k].name}: effectChoice without action`);
   assert.doesNotThrow(()=>core.applyAction(s,who,choice),`${c.id} choice ${n}`);
  }
  assert.notEqual(s.phase,'effectChoice',`${c.id} ${c.attacks[k].name}: unresolved choice`);checked++;
 }
 assert.ok(checked>=135,`Only ${checked} attacks exercised`);
});

test('the APK build version agrees across Gradle, UI and boot JS',()=>{
 const g=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');const app=fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8');const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
 assert.ok(g.includes("versionName '0.69.273'"));assert.ok(app.includes("__LUCKYDEX_BUILD='0.69.273'"));
 assert.ok(html.includes('id="titleBuildVersion">v0.69.273'));assert.ok(html.includes('id="appBuildVersion">LUCKY DEX · v0.69.273'));
});
