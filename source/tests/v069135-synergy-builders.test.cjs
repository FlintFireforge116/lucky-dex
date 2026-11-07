'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const S=require('../app/src/main/assets/tcg-deck-synergy.js');
const C=require('../app/src/main/assets/tcg-classic-battle-data.js'),CB=require('../app/src/main/assets/tcg-classic-deck-builder.js'),CO=require('../app/src/main/assets/tcg-classic-opponents.js'),CD=require('../app/src/main/assets/tcg-classic-decks.js'),CW=require('../app/src/main/assets/tcg-classic-deck-workspace.js');
const P=require('../app/src/main/assets/tcgp-battle-data.js'),PB=require('../app/src/main/assets/tcgp-battle-decks.js'),PW=require('../app/src/main/assets/tcgp-deck-workspace.js'),Solo=require('../app/src/main/assets/tcgp-battle-solo.js');
const cr=C.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
const pr=P.CARDS.filter(c=>c.battleEnabled&&!c.loaner&&c.kind!=='energy').map(c=>({gameplayId:c.id,quantity:2}));
const names=(deck,data)=>deck.cards.map(data.cardById).filter(Boolean);
test('rule-derived metadata distinguishes Sleep enablers, payoff and unrelated status',()=>{
 assert.ok(S.metadata(C.cardById('SNAPFLORIO-109')).inflicts.includes('sleep'));
 assert.ok(S.metadata(P.cardById('A1-125')).inflicts.includes('sleep'));
 assert.ok(!S.metadata(P.cardById('P-A-049')).inflicts.includes('sleep'),'self Sleep is not an offensive enabler');
 assert.equal(S.matchesTheme(C.cardById('base1-91'),'sleep'),false);
});
test('off-type Stadiums/Tools are hard rejected, while generic draw cards remain useful',()=>{
 let ctx=S.context([C.cardById('sv1-52')],['Water'],'any');
 assert.equal(S.trainerScore(C.cardById('SNAPFOUNJA-080'),ctx),-Infinity);
 assert.equal(S.trainerScore(C.cardById('sv1-170'),ctx),-Infinity);
 assert.ok(Number.isFinite(S.trainerScore(C.cardById('base1-91'),ctx)));
 ctx=S.context([C.cardById('sv1-73')],['Lightning'],'any');
 assert.ok(Number.isFinite(S.trainerScore(C.cardById('sv1-170'),ctx)));
});
test('Classic Sleep strategy contains Sleep Pokémon and Dream Garden, with no useless Stadiums',()=>{
 const r=CB.buildDeck(cr,{theme:'sleep',style:'competitive',randomSeed:321});assert.equal(r.ok,true,r.errors?.join(' '));
 assert.ok(CD.validateDraft(r.cards,cr,{requireFull:true}).ok);
 const cards=names(r,C),ctx=S.context(cards,r.energyTypes,'sleep');
 assert.ok(cards.some(c=>c.kind==='pokemon'&&S.metadata(c).inflicts.includes('sleep')));
 assert.ok(cards.some(c=>c.id==='SNAPFLORIO-109'));
 assert.ok(cards.filter(c=>c.trainerType==='Stadium').every(c=>S.trainerScore(c,ctx)>-Infinity));
 assert.equal(r.plan.dead.length,0);
});
test('Classic random themed builds keep the featured Pokémon relevant',()=>{
 for(const theme of ['sleep','poison','healing','energy'])for(const seed of [1,3,8]){
  const r=CB.buildDeck(cr,{theme,style:'random',randomSeed:seed});assert.equal(r.ok,true,r.errors?.join(' '));
  assert.ok(S.pokemonThemeScore(C.cardById(r.focusCardId),theme)>0,`${theme} ${r.focusCardId} isn't thematic`);
  assert.equal(CD.validateDraft(r.cards,cr,{requireFull:true}).ok,true);
 }
});
test('Classic CPU receives strategy and produces legal themed deck',()=>{
 const r=CO.generate({seed:17,theme:'sleep',sets:['SNAPFLORIO','SNAPFOUNJA','base1','sv1']});
 assert.equal(r.ok,true,r.error);assert.equal(r.theme,'sleep');
 assert.ok(names(r,C).some(c=>c.kind==='pokemon'&&S.pokemonThemeScore(c,'sleep')>0));
});
test('Pocket themed decks use legal complete lines and avoid off-type Stadiums',()=>{
 for(const theme of ['sleep','poison','healing']){
  const r=PB.buildQuickDeck(pr,{theme,style:'competitive',variant:1});assert.equal(r.ok,true,r.errors?.join(' '));
  assert.ok(PB.validateLoanerDeck(r.cards,r.energyTypes).ok);const cards=names(r,P),ctx=S.context(cards,r.energyTypes,theme);
  assert.ok(cards.some(c=>c.kind==='pokemon'&&S.pokemonThemeScore(c,theme)>0),theme);
  assert.ok(cards.filter(c=>c.trainerType==='Stadium').every(c=>S.trainerScore(c,ctx)>-Infinity));
 }
});
test('Pocket themed Random CPU remains legal and fixed Solo stays unchanged',()=>{
 const random=Solo.CHALLENGES.find(c=>c.randomPool);const official=Solo.CHALLENGES.find(c=>!c.randomPool);
 const r=Solo.createBattle({challengeId:random.id,cpuTheme:'sleep',seed:76});
 assert.equal(PB.validateLoanerDeck(r.opponentDeck).ok,true);
 assert.ok(r.opponentDeck.map(P.cardById).some(c=>c?.kind==='pokemon'&&S.pokemonThemeScore(c,'sleep')>0));
 const first=Solo.createBattle({challengeId:official.id,seed:12}),second=Solo.createBattle({challengeId:official.id,seed:12,cpuTheme:'sleep'});
 assert.deepEqual(first.opponentDeck,second.opponentDeck);
});
test('manual catalogues filter Sleep and healing mechanics from effects',()=>{
 const a=CW.query(CW.catalogue(cr),{filters:{theme:'sleep'},pageSize:200});assert.ok(a.total>0);
 assert.ok(a.rows.every(r=>S.matchesTheme(r.card,'sleep')));
 const b=PW.query(PW.catalogue(pr),{filters:{theme:'healing'},pageSize:200});assert.ok(b.total>0);
 assert.ok(b.rows.every(r=>S.matchesTheme(r.card,'healing')));
});
test('both editors and both battle setup menus include strategy controls',()=>{
 const root=require('node:path').join(__dirname,'../app/src/main/assets');
 for(const f of ['tcg-classic-deck-editor.js','tcgp-deck-editor.js'])assert.match(fs.readFileSync(require('node:path').join(root,f),'utf8'),/auto-theme/);
 const ui=fs.readFileSync(require('node:path').join(root,'tcgp-battle-ui.js'),'utf8');
 assert.match(ui,/classic-opponent-theme/);assert.match(ui,/pocket-opponent-theme/);
});
