const t=require('node:test'),a=require('node:assert/strict'),D=require('../app/src/main/assets/tcgp-battle-data.js'),K=require('../app/src/main/assets/tcgp-battle-decks.js'),W=require('../app/src/main/assets/tcgp-deck-workspace.js');
const owned=D.CARDS.filter(c=>c.battleEnabled&&!c.loaner).map(c=>({gameplayId:c.id,card:c,quantity:2,battleEnabled:true}));
t('legal cards with impossible automatic or manual Energy remain saved drafts, never battle-ready',()=>{
 const cards=K.LOANER_PLAYER_DECK.slice();cards.splice(0,3,'A1-033','A1-053','A1-094');a.equal(K.validateDeck(cards,owned).ok,true);
 const s={},r=W.saveDraft(s,{cards,energyMode:'auto'},owned);a.equal(r.ok,true);a.equal(r.deck.draft,true);a.equal(W.readiness(r.deck,owned).ok,false);a.match(W.readiness(r.deck,owned).errors.join(' '),/Energy/);
 for(const energyTypes of [[],['Water','Water'],['Dragon'],['Grass','Fire','Water','Lightning']]){const x=W.saveDraft(s,{cards:K.LOANER_PLAYER_DECK,energyMode:'manual',energyTypes},owned);a.equal(x.ok,true);a.equal(x.deck.draft,true);}
});
t('test setup selects owned alternate pre-evolution mechanics instead of first global same-name card',()=>{
 const rows=owned.filter(r=>r.gameplayId!=='A1-174');a.ok(rows.some(r=>r.gameplayId==='B1a-045'));const r=K.buildTestSetup(rows,{cardId:'A1-175'});a.equal(r.ready,true,JSON.stringify(r.blockers));a.ok(r.cards.includes('B1a-045'));a.ok(!r.attemptedCards.includes('A1-174'));
});
function effects(e,fn){if(!e||typeof e!=='object')return;fn(e);for(const c of Array.isArray(e.effects)?e.effects:[])effects(c,fn);for(const k of ['heads','tails','effect'])effects(e[k],fn);}
function canInflict(cards,status){return cards.some(id=>{const c=D.cardById(id);let yes=false;for(const e of [c.effect,...(c.attacks||[]).map(a=>a.effect),...(c.abilities||[]).map(a=>a.effect)])effects(e,e=>{if(e.type==='status'&&e.status===status&&e.target==='opponentActive')yes=true;});return yes;});}
t('conditional test setups and focused decks include Burn/Confusion enablers or disclose a precise blocker',()=>{
 for(const [id,status]of [['A4-037','burn'],['B2b-004','confusion']]){const r=K.buildTestSetup(owned,{cardId:id});a.equal(r.ready,true,JSON.stringify(r.blockers));a.ok(canInflict(r.cards,status),id+' requires '+status);a.ok(r.prerequisites.some(p=>p.toLowerCase().includes(status)));
 const normal=K.buildQuickDeck(owned,{cardId:id});a.equal(normal.ok,true);a.ok(canInflict(normal.cards,status),id+' focused synergy');}
 const noBurn=owned.filter(r=>!canInflict([r.gameplayId],'burn')),blocked=K.buildTestSetup(noBurn,{cardId:'A4-037'});a.equal(blocked.ready,false);a.ok(blocked.blockers.some(p=>/burn/i.test(p)));
});
t('set-name search includes reprint sets',()=>{
 const all=W.catalogue(owned);a.equal(W.query(all,{search:'Dual Fusion'}).total,144);a.equal(W.query(all,{filters:{setId:'C1'}}).total,144);
});
t('recent sort reads numeric firstPulled',()=>{
 const rows=[{gameplayId:'A1-001',card:D.cardById('A1-001'),quantity:1,variants:[{row:{firstPulled:1000}}]},{gameplayId:'A1-083',card:D.cardById('A1-083'),quantity:1,variants:[{row:{firstPulled:2000}}]}];a.deepEqual(W.query(rows,{sort:'recent'}).rows.map(r=>r.gameplayId),['A1-083','A1-001']);
});
t('async autobuild yields to UI work, matches the production candidate result and honors cancellation',async()=>{
 a.equal(typeof K.buildDeckAsync,'function');let uiWork=false;const pending=K.buildDeckAsync(owned,{cardId:'A1-083'});setTimeout(()=>{uiWork=true;},0);const result=await pending;a.equal(uiWork,true);a.deepEqual(result,K.buildQuickDeck(owned,{cardId:'A1-083'}));
 let cancelled=false;const stopped=K.buildDeckAsync(owned,{cardId:'A1-083'},{isCancelled:()=>cancelled});cancelled=true;a.equal(await stopped,null);
});
t('Tool, Stadium and Supporter-dependent focuses get actual enablers or a missing-prerequisite blocker',()=>{
 for(const [cardId,type] of [['P-A-039','Tool'],['C1-056','Stadium'],['A3a-061','Supporter']]){const r=K.buildQuickDeck(owned,{cardId});a.equal(r.ok,true);a.ok(r.cards.some(id=>D.cardById(id).trainerType===type),cardId+' needs '+type);}
 const withoutSupporters=owned.filter(r=>r.card.trainerType!=='Supporter'),r=K.buildTestSetup(withoutSupporters,{cardId:'A3a-061'});a.equal(r.ready,false);a.ok(r.blockers.some(p=>p.includes('Supporter')));
});
