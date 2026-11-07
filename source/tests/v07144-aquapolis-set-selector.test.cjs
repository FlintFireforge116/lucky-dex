'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const aqua=require(path.join(A,'tcg-classic-aquapolis.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const builder=require(path.join(A,'tcg-classic-deck-builder.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const picker=require(path.join(A,'tcg-classic-set-picker.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const fx=require(path.join(A,'tcgp-battle-effects.js'));
const C=n=>classic.cardById('ecard2-'+n);
function field(seed=31){const deck=opponents.generate({sets:['ecard2'],type:'Psychic',seed});assert.ok(deck.ok,deck.error);const state=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,playerEnergyTypes:['Psychic','Water','Fire','Grass','Lightning','Fighting','Darkness','Metal'],opponentEnergyTypes:['Psychic','Water','Fire','Grass','Lightning','Fighting','Darkness','Metal'],seed,firstSide:'player'});state.phase='battle';state.activeSide='player';state.turnNumber=5;state.sides.player.turnCount=3;state.sides.opponent.turnCount=2;return state;}
test('182 numbered Aquapolis prints including 32 independent H holos',()=>{
 assert.equal(aqua.CARDS.length,182);assert.equal(new Set(aqua.CARDS.map(c=>c.id)).size,182);
 assert.equal(aqua.coverage().total,182);assert.ok(aqua.coverage().battleEnabled>=45);
 for(let i=1;i<=150;i++){let c=C(i);assert.ok(c,'number '+i);assert.equal(c.setId,'ecard2');assert.equal(c.number,String(i));assert.match(c.image,new RegExp(`ecard2/${i}\\.png`));}
 for(let i=1;i<=32;i++){let c=C('H'+i);assert.ok(c,'holo '+i);assert.equal(c.rarity,'Rare Holo');assert.equal(c.number,'H'+i);assert.match(c.image,new RegExp(`ecard2/H${i}\\.png`));}
 assert.equal(C('H12').name,'Hypno');assert.equal(C(16).name,'Hypno');assert.equal(C('H12').attacks[0].name,C(16).attacks[0].name);
 assert.equal(C(148).name,'Kingdra');assert.equal(C(149).name,'Lugia');assert.equal(C(150).name,'Nidoking');
});
test('cards are enabled only when their effects are supported',()=>{
 const unavailable=aqua.CARDS.filter(c=>!c.battleEnabled);
 assert.equal(C(149).battleEnabled,true,'Crystal Type implemented');
 assert.equal(C(119).battleEnabled,true,'Technical Machine cube implemented');
 assert.equal(C(101).battleEnabled,true,'two-heads Super Slice is supported');
 for(let c of unavailable){assert.equal(c.deckEligible,false);assert.equal(c.support.status,'PARTIAL');assert.ok(c.support.reasons.length,c.id);}
 for(let c of aqua.CARDS.filter(c=>c.battleEnabled)){
  assert.equal(c.support.status,'FULL');for(let a of c.attacks||[])assert.ok(fx.supportsEffect(a.effect),`${c.id} ${a.name}`);
  for(let a of c.abilities||[])assert.ok(fx.supportsEffect(a.effect),`${c.id} ${a.name}`);
 }
});
test('Aquapolis set is registered in all card, auto builder, opponent and card ownership systems',()=>{
 assert.ok(classic.SETS.some(s=>s.id==='ecard2'&&s.cardCount===182));assert.deepEqual(builder.SET_IDS,opponents.SETS);
 assert.ok(builder.SET_IDS.includes('ecard2'));assert.ok(picker.rows.some(r=>r[0]==='ecard2'&&r[1]==='Aquapolis'));
 const owned=classic.projectOwnedCards([{source:'tcg',setId:'ecard2',number:'H12',count:2},{source:'tcg',setId:'aq',number:102,count:3},{source:'tcg',setName:'Aquapolis',number:'H29',count:1},{source:'tcgp',setId:'ecard2',number:77,count:99}]);
 assert.equal(owned.find(c=>c.gameplayId==='ecard2-H12')?.quantity,2);
 assert.equal(owned.find(c=>c.gameplayId==='ecard2-102')?.quantity,3);
 assert.equal(owned.find(c=>c.gameplayId==='ecard2-H29')?.quantity,1);
 assert.ok(!owned.some(c=>c.gameplayId==='ecard2-77'));
});
test('set picker supports search, sort, selected-only and bulk actions',()=>{
 const ids=builder.SET_IDS,selected=['ecard1','ecard2'];
 const html=picker.html({ids,selected,mode:'auto',state:{sort:'az',selectedOnly:true,search:'aqua'}});
 for(let token of ['data-set-search','data-set-sort','data-set-bulk="all"','data-set-bulk="none"','data-set-bulk="invert"','data-set-selected-only','data-set-choice="ecard2"','aria-pressed="true"','Selected only'])assert.ok(html.includes(token),token);
 const none=picker.html({ids,selected:[],mode:'opponent'});assert.ok(none.includes('No sets selected'));
 assert.ok(picker.html({ids,selected}).includes('e-Card'));
});
test('player and opponent controls use shared picker with no page rebuild on option changes',()=>{
 const editor=fs.readFileSync(path.join(A,'tcg-classic-deck-editor.js'),'utf8');
 const ui=fs.readFileSync(path.join(A,'tcgp-battle-ui.js'),'utf8');
 assert.match(editor,/const scroll=same\?/);assert.match(editor,/sheet\.scrollTop=scroll/);
 assert.match(editor,/S\.refresh\(selector,autoOptions\.sets,autoSetUI\)/);
 assert.match(ui,/function refreshOpponentControls/);assert.match(ui,/refreshOpponentControls\(\);return;/);
 assert.match(editor,/setPicker|LuckyDexClassicSetPicker/);assert.match(ui,/setPicker/);
});
test('current version matches Android, JavaScript and both visible labels',()=>{
 const gradle=fs.readFileSync(path.resolve(__dirname,'../app/build.gradle'),'utf8');
 const html=fs.readFileSync(path.join(A,'index.html'),'utf8');
 const js=fs.readFileSync(path.join(A,'app-v0167.js'),'utf8');
 const version=/versionName '([^']+)'/.exec(gradle)?.[1];assert.match(version||'',/^0\.69\.\d+$/);
 assert.equal(Number(/versionCode (\d+)/.exec(gradle)?.[1]),6980+Number(version.split('.').at(-1)));
 assert.ok(js.includes("window.__LUCKYDEX_BUILD='"+version+"'"));
 assert.equal(html.split('v'+version).length-1,2);
 assert.ok(html.indexOf('tcg-classic-aquapolis.js')<html.indexOf('tcg-classic-battle-data.js'));
 assert.ok(html.indexOf('tcg-classic-set-picker.js')<html.indexOf('tcg-classic-deck-editor.js'));
});
test('opponents build legal 30-card Aquapolis-only decks across six types',()=>{
 for(const type of ['Grass','Water','Fire','Lightning','Fighting','Psychic']){
  const result=opponents.generate({sets:['ecard2'],type,seed:23});assert.ok(result.ok,`${type}: ${result.error}`);
  assert.equal(result.cards.length,30);assert.equal(classic.validateDeck(result.cards).ok,true);
  assert.ok(result.cards.every(id=>C(id.replace('ecard2-',''))?.battleEnabled),type);
 }
});
test('Aquapolis Meditate accounts for damage counters on defender',()=>{
 const state=field();state.sides.player.active=core.makePokemonSlot('ecard2-18',1,'jynx');state.sides.opponent.active=core.makePokemonSlot('ecard2-93',1,'mareep');state.sides.opponent.active.damage=20;
 const c={...core.effectContext(state,'player',{},state.sides.player.active),random:()=>0.1};
 assert.equal(fx.resolveAttack(C(18).attacks[0],c).damage,30);
});
test('Aquapolis Super Slice needs both heads; Phanpy Flail is live damage',()=>{
 const s=field();s.sides.player.active=core.makePokemonSlot('ecard2-101',1,'pinsir');s.sides.opponent.active=core.makePokemonSlot('ecard2-117',1,'wooper');
 const ctx={...core.effectContext(s,'player',{},s.sides.player.active),random:()=>0.1};
 assert.equal(fx.resolveAttack(C(101).attacks[1],ctx).damage,90);
 ctx.random=()=>0.9;assert.equal(fx.resolveAttack(C(101).attacks[1],ctx).damage,0);
 s.sides.player.active=core.makePokemonSlot('ecard2-100',1,'phanpy');s.sides.player.active.damage=20;
 assert.equal(fx.resolveAttack(C(100).attacks[0],{...core.effectContext(s,'player',{},s.sides.player.active),random:()=>0.1}).damage,20);
});
test('Aquapolis CPU-vs-CPU matches advance without invalid actions',()=>{
 const ai=require(path.join(A,'tcgp-battle-ai.js'));
 for(const seed of [6,27]){
  const deck=opponents.generate({sets:['ecard2'],seed});assert.ok(deck.ok,deck.error);
  const s=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,playerEnergyTypes:['Grass','Water','Psychic','Fire','Lightning','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Water','Psychic','Fire','Lightning','Fighting','Darkness','Metal'],seed,firstSide:'player'});
  let steps=0;
  for(;steps<140&&!s.winner;steps++){
   const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.phase==='setup'?s.setupSide:s.activeSide;
   const choices=core.legalActions(s,side);if(!choices.length)break;
   const recommendation=ai.chooseAction(s,side,'Advanced',steps),action=recommendation?.action||recommendation||choices[0];
   if(!action?.type)break;core.applyAction(s,side,action);
  }
  assert.ok(steps>10,`seed ${seed} only ${steps} actions`);
  assert.ok(!s.log.some(e=>e.type==='battleError'),`seed ${seed} logged a battle error`);
 }
});
