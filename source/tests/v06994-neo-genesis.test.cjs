'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const neo=require(path.join(assets,'tcg-classic-neo-genesis.js'));
const classic=require(path.join(assets,'tcg-classic-battle-data.js'));
const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
const decks=require(path.join(assets,'tcg-classic-decks.js'));
const opponents=require(path.join(assets,'tcg-classic-opponents.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const ai=require(path.join(assets,'tcgp-battle-ai.js'));
const owned=classic.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));

test('Neo Genesis catalogue registers 111 unique authentic numbered cards beside the earlier sets',()=>{
  assert.equal(neo.SET.cardCount,111);assert.equal(neo.CARDS.length,111);
  assert.equal(classic.SETS.length,7);assert.equal(classic.SETS.at(-1).id,'neo1');
  assert.equal(builder.SET_IDS.at(-1),'neo1');assert.equal(opponents.SETS.at(-1),'neo1');
  for(let num=1;num<=111;num++)assert.equal(classic.cardById(`neo1-${num}`),neo.CARDS[num-1]);
  assert.equal(classic.cardById('neo1-9').name,'Lugia');
  assert.equal(classic.cardById('neo1-15').name,'Steelix');
  assert.equal(classic.cardById('neo1-24').name,'Murkrow');
  assert.equal(classic.cardById('neo1-25').name,'Sneasel');
  assert.equal(classic.cardById('base1-4').name,'Charizard');
  assert.equal(classic.cardById('gym2-124').name,'Fervor');
  assert.equal(neo.CARDS.filter(c=>c.kind==='pokemon').length,81);
});

test('all Neo cards have their full catalogued abilities while the six Basic Energy prints stay in the Energy Zone',()=>{
  for(const n of [12,20,22,23]){const c=classic.cardById(`neo1-${n}`);assert.equal(c.baby,true);assert.equal(c.battleEnabled,true);}
  for(const n of [19,104,105]){const c=classic.cardById(`neo1-${n}`);assert.equal(c.kind,'energy');assert.equal(c.specialEnergy,true);assert.equal(c.battleEnabled,true);}
  for(let n=106;n<=111;n++){const c=classic.cardById(`neo1-${n}`);assert.equal(c.kind,'energy');assert.equal(c.basicEnergy,true);assert.equal(c.deckEligible,false);}
  assert.equal(classic.cardById('neo1-17').battleEnabled,true);
  assert.equal(classic.cardById('neo1-14').battleEnabled,true);
  assert.equal(classic.cardById('neo1-25').battleEnabled,true);
  assert.equal(neo.coverage().battleEnabled,111);
  for(const c of neo.CARDS){assert.equal(c.support?.status,'FULL',c.id);if(c.kind==='pokemon')assert.ok(c.attacks.length||c.abilities.length,c.id);}
});

test('Neo Genesis owned cards project correctly from LuckyDex N1 collection identifiers',()=>{
  const rows=classic.projectOwnedCards([
    {source:'tcg',setId:'N1',id:'N1-070',number:'070',count:2},
    {source:'tcg',setId:'neo1',id:'neo1-9',number:9,count:1},
    {source:'tcg',setName:'Neo Genesis',id:'library:n1:070',number:70,count:1},
    {source:'tcg',setId:'N1',id:'N1-999',count:1}
  ]);
  assert.equal(rows.find(x=>x.gameplayId==='neo1-70')?.quantity,3);
  assert.equal(rows.find(x=>x.gameplayId==='neo1-9')?.quantity,1);
  assert.equal(rows.some(x=>x.gameplayId==='neo1-999'),false);
});

test('Classic deck filter and battle script are loaded in correct order; release identity is consistent',()=>{
  const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
  assert.ok(html.indexOf('tcg-classic-neo-genesis.js')>html.indexOf('tcg-classic-gym-challenge.js'));
  assert.ok(html.indexOf('tcg-classic-neo-genesis.js')<html.indexOf('tcg-classic-battle-data.js'));
  assert.match(fs.readFileSync(path.join(assets,'tcg-classic-deck-editor.js'),'utf8'),/Neo Genesis/);
  assert.match(fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8'),/Neo Genesis/);
  const build=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
  assert.match(build,/versionName '0\.69\.95'/);assert.match(build,/versionCode 7075/);
  assert.match(fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8'),/window\.__LUCKYDEX_BUILD='0\.69\.95'/);
});

test('all seven Classic sets can produce legal 30-card seeded auto decks with no missing Energy types',()=>{
 for(const setId of builder.SET_IDS)for(const style of ['random','competitive'])for(let seed=1;seed<=12;seed++){
  const result=builder.buildDeck(owned,{style,sets:[setId],randomSeed:seed});
  assert.equal(result.ok,true,`${setId} ${style} ${seed}: ${(result.errors||[]).join('; ')}`);
  assert.equal(result.cards.length,30);
  assert.ok(result.cards.every(id=>classic.cardById(id)?.setId===setId));
  assert.equal(decks.readiness({cards:result.cards,energyMode:'manual',energyTypes:result.energyTypes},owned).ok,true);
  assert.ok(result.energyTypes.length<=2);
 }
});

test('Neo-only CPU battle decks can finish simulated matches',()=>{
 let finished=0;
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Colorless']){
  const p=opponents.generate({seed:9400+type.length,sets:['neo1'],type});
  assert.equal(p.ok,true,`${type}: ${p.error}`);
  assert.ok(p.cards.every(id=>classic.cardById(id)?.setId==='neo1'));
  const s=core.createBattle({format:'classic',playerDeck:p.cards,opponentDeck:p.cards,playerEnergyTypes:p.energyTypes,opponentEnergyTypes:p.energyTypes,seed:9400+type.length,firstSide:'player'});
  for(let count=0;count<2000&&s.phase!=='finished';count++){
   const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.phase==='setup'?s.setupSide:s.activeSide;
   const move=ai.chooseAction(s,side,'Intermediate',count);
   assert.ok(move,`No action ${type} phase ${s.phase} side ${side}`);
   core.applyAction(s,side,move);
  }
  assert.equal(s.phase,'finished',`${type} battle failed to complete`);finished++;
 }
 assert.equal(finished,7);
});
