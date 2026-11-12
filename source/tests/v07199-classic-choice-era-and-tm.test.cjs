'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../app/src/main/assets');
const load=name=>require(path.join(root,name));
const core=load('tcgp-battle-core.js'),fx=load('tcgp-battle-effects.js'),classic=load('tcg-classic-battle-data.js'),cpu=load('tcg-classic-opponents.js'),synergy=load('tcg-deck-synergy.js'),builder=load('tcg-classic-deck-builder.js');
function game(){const deck=cpu.generate({sets:['ex11'],seed:42}).cards;const s=core.createBattle({format:'classic',playerDeck:deck,opponentDeck:deck,seed:71199,firstSide:'player',playerEnergyTypes:['Metal'],opponentEnergyTypes:['Metal']});s.phase='battle';s.activeSide='player';s.turnNumber=8;s.sides.player.turnCount=4;s.sides.player.active=core.makePokemonSlot('ex11-57',3,'player');s.sides.opponent.active=core.makePokemonSlot('ex11-57',3,'cpu');return s;}
test('Holon Transceiver shows real art identities for each deck/discard choice, even duplicates',()=>{
 const s=game(),p=s.sides.player;p.hand=[];p.deck=[{uid:'d1',cardId:'ex11-93'},{uid:'d2',cardId:'ex11-93'},{uid:'d3',cardId:'ex11-57'}];p.discard=[{uid:'x1',cardId:'ex11-95'}];
 fx.applyEffect({type:'neoRule',rule:'ex11:trainer:98'},core.effectContext(s,'player',{},p.active));
 assert.equal(s.phase,'effectChoice');
 const picks=core.legalActions(s,'player').filter(a=>a.type==='effectChoice'&&!a.choiceSkip);
 assert.deepEqual(picks.map(a=>a.choiceCardId),['ex11-93','ex11-93','ex11-95']);
 assert.deepEqual(picks.map(a=>a.choiceOption),[0,1,2]);
 core.applyAction(s,'player',picks[1]);
 assert.equal(s.phase,'battle');assert.equal(p.hand.length,1);assert.equal(p.hand[0].uid,'d2','second copy was really selected');
 assert.equal(p.deck.length,2);
});
test('Holon Lass card options carry matching identities, not blank option tiles',()=>{
 const s=game(),p=s.sides.player;p.prizes=[{uid:'p1',cardId:'ex11-57'}];s.sides.opponent.prizes=[{uid:'p2',cardId:'ex11-57'}];
 p.hand=[{uid:'cost',cardId:'ex11-57'}];p.deck=[{uid:'en1',cardId:'ex11-104'},{uid:'en2',cardId:'ex11-105'},{uid:'pk',cardId:'ex11-57'}];
 fx.applyEffect({type:'neoRule',rule:'ex11:trainer:92'},core.effectContext(s,'player',{},p.active));
 let actions=core.legalActions(s,'player');core.applyAction(s,'player',actions.find(a=>a.choiceHandIndex===0));
 actions=core.legalActions(s,'player');assert.ok(actions.filter(a=>a.choiceOption!=null).length>=2);assert.ok(actions.filter(a=>a.choiceOption!=null).every(a=>a.choiceCardId&&classic.cardById(a.choiceCardId)));
});
test('Porygon2 records a conditional TM payoff; builder picks compatible Tools',()=>{
 const p=classic.cardById('ex11-25'),meta=synergy.metadata(p);
 assert.deepEqual(meta.requiresTools,['technicalMachine']);assert.ok(meta.conditionalInflicts.includes('sleep')&&meta.conditionalInflicts.includes('burn'));
 assert.ok(!meta.inflicts.includes('sleep'),'Machine Burst is not an unconditional Sleep attack');
 assert.equal(synergy.report([p],['Metal'],'sleep').enablers.length,0);
 assert.ok(synergy.report([p,classic.cardById('ex5-84')],['Metal'],'sleep').enablers.includes('Porygon2'));
 const ctx=synergy.context([p],['Metal'],'sleep');assert.ok(synergy.trainerScore(classic.cardById('ex5-84'),ctx)>synergy.trainerScore(classic.cardById('base1-91'),ctx));
 const sets=['ex11','ex5','ecard1','base1'],owned=classic.CARDS.filter(c=>sets.includes(c.setId)&&c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
 const result=builder.buildDeck(owned,{focusCardId:p.id,sets,style:'competitive',randomSeed:42});
 assert.equal(result.ok,true,result.errors?.join('; '));assert.equal(result.cards.length,30);
 const tms=result.cards.map(classic.cardById).filter(c=>c?.technicalMachine);
 assert.ok(tms.length>=1&&tms.length<=2,`expected 1–2 compatible TMs, got ${tms.length}`);
 assert.ok(tms.every(c=>['ecard1-144','ex5-84','ex5-85','ex5-86'].includes(c.id)));
});
test('Classic filter is grouped by collapsible eras, still filters one set and permits resetting',()=>{
 const src=fs.readFileSync(path.join(root,'tcg-classic-deck-editor.js'),'utf8');
 assert.match(src,/S\.rows\.map\(row=>row\[2\]\)/);assert.match(src,/data-set-era/);
 assert.ok(src.includes('data-classic-filter=\"set\"'));assert.match(src,/filter-all-sets/);
 assert.doesNotMatch(src,/chips\('set',S\.rows/);
});
test('Battle chooser displays card artwork for option-linked IDs with safe text fallback',()=>{
 const src=fs.readFileSync(path.join(root,'tcgp-battle-ui.js'),'utf8');
 assert.match(src,/const cardId=action\.choiceCardId\|\|null/);
 assert.match(src,/model\.art\?`<img/);
 assert.match(src,/tcgp-live-choice-placeholder/);
 assert.match(src,/!model\.art\?`<small>/,'show labels only when art is missing');
});
