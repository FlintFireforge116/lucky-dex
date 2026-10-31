const test=require('node:test'),a=require('node:assert/strict');
const D=require('../app/src/main/assets/tcgp-battle-data.js'),K=require('../app/src/main/assets/tcgp-battle-decks.js');
let W;try{W=require('../app/src/main/assets/tcgp-deck-workspace.js');}catch{}
const all=D.CARDS.filter(c=>!c.loaner).map(c=>({gameplayId:c.id,card:c,name:c.name,quantity:2,battleEnabled:c.battleEnabled,variants:[]}));
test('combined filters use all attack text, stage, type, ex, set and ownership',()=>{
 a.ok(W,'workspace query model must exist');
 const r=W.query(all,{search:'Blizzard',filters:{types:['Water'],stage:'Basic',ex:true,setId:'A1',owned:true},cards:[]});
 a.deepEqual(r.rows.map(r=>r.card.id),['A1-084']);
 a.equal(W.query(all,{search:'Blizzard',filters:{types:['Water'],stage:'Stage 2',ex:true,setId:'A1',owned:true}}).total,0);
});
test('pagination reaches every matching card, with stable sorting and combined quantity/in-deck filters',()=>{
 a.ok(W);const first=W.query(all,{page:0,pageSize:48,sort:'name'}),last=W.query(all,{page:first.pages-1,pageSize:48,sort:'name'});
 a.ok(first.total>100);a.equal(first.rows.length,48);a.ok(last.rows.length>0);a.notEqual(last.rows[0].gameplayId,first.rows[0].gameplayId);
 a.deepEqual(W.query(all,{filters:{inDeck:'yes',minOwned:2},cards:['A1-083']}).rows.map(r=>r.gameplayId),['A1-083']);
 a.equal(W.query(all,{filters:{minOwned:3}}).total,0);
});
test('edit resolves print aliases and enforces owned quantity, two names and 20 cards',()=>{
 a.ok(W);const alias=D.PRINTS.find(p=>p.gameplayId==='A1-083'&&p.id!=='A1-083');a.ok(alias);
 let r=W.edit([],alias.id,1,all);a.deepEqual(r.cards,['A1-083']);r=W.edit(r.cards,'A1-083',1,all);a.equal(r.cards.length,2);
 a.equal(W.edit(r.cards,alias.id,1,all).ok,false);a.deepEqual(W.edit(r.cards,alias.id,-1,all).cards,['A1-083']);
 a.equal(W.edit([], 'A1-083',1,[]).ok,false);a.equal(W.edit(Array(20).fill('A1-001'),'A1-083',1,all).ok,false);
 const partial=D.CARDS.find(c=>!c.battleEnabled);a.equal(W.edit([],partial.id,1,all).ok,false);
});
test('recipes count real owned canonical copies and never invent missing copies',()=>{
 a.ok(W);const r=W.recipe(['A1-083','A1-083','A1-001','BASIC-POKE-BALL'],[{gameplayId:'A1-083',quantity:1}]);
 a.equal(r.owned,2);a.equal(r.total,4);a.deepEqual(r.missing.map(x=>[x.cardId,x.quantity]),[['A1-083',1],['A1-001',1]]);
});
test('saved draft lifecycle preserves legacy decks and does not mark incomplete drafts battle-ready',()=>{
 a.ok(W);const s={tcgpBattle:{decks:[{id:'old',name:'Old',cards:K.LOANER_PLAYER_DECK}],activeDeckId:'old',stats:{wins:3}}};
 const draft=W.saveDraft(s,{name:'Water',cards:['A1-083'],energyMode:'auto'},all);a.ok(draft.ok);a.equal(s.tcgpBattle.decks.length,2);a.equal(draft.deck.draft,true);
 const copy=W.duplicate(s,draft.deck.id);a.notEqual(copy.id,draft.deck.id);a.deepEqual(copy.cards,['A1-083']);
 W.activate(s,'old');a.equal(s.tcgpBattle.activeDeckId,'old');W.remove(s,copy.id);a.equal(s.tcgpBattle.decks.length,2);a.equal(s.tcgpBattle.stats.wins,3);
});
