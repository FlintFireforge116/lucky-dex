const t=require('node:test'),a=require('node:assert/strict'),{launch,createPage}=require('../scripts/tcgp-browser-fixture.cjs');
async function fixture(fn){const b=await launch();try{const x=await createPage(b,{width:393,height:873});await x.page.evaluate(()=>{state.cards=Object.fromEntries(LuckyDexTCGPBattleData.PRINTS.map(c=>[c.id,{id:c.id,source:'tcgp',count:2}]));LuckyDexTCGPBattleUI.renderHome();});await fn(x.page);a.deepEqual(x.errors,[]);await x.context.close();}finally{await b.close();}}
t('pending autobuild cannot mutate a newly opened draft or a closed workspace',()=>fixture(async p=>{
 await p.click('[data-tcgp-action="build"]');await p.evaluate(()=>{const timer=window.setTimeout;window.setTimeout=(fn,ms,...args)=>ms===25?(window.__heldBuild=fn,123):timer(fn,ms,...args);});
 await p.click('[data-deck="auto"]');await p.click('[data-deck="recommended"]');await p.click('[data-deck="manage"]');await p.click('[data-deck="new"]');await p.evaluate(()=>__heldBuild());a.match(await p.locator('#tcgpMyDeck h2').innerText(),/0\s*\/\s*20/);
 await p.click('[data-deck="auto"]');await p.click('[data-deck="recommended"]');await p.click('#tcgpBattleBack');await p.evaluate(()=>__heldBuild());a.equal(await p.locator('#tcgpMyDeck').count(),0);
}));
t('editing at the end of My Deck preserves horizontal position',()=>fixture(async p=>{
 await p.evaluate(()=>{state.cards=Object.fromEntries([...new Set(LuckyDexTCGPBattleDecks.LOANER_PLAYER_DECK.filter(id=>id!=='BASIC-POKE-BALL'))].map(id=>[id,{id,source:'tcgp',count:2}]));LuckyDexTCGPBattleUI.renderHome();});
 await p.click('[data-tcgp-action="quick"]');await p.waitForFunction(()=>document.querySelector('#tcgpMyDeck h2')?.textContent.includes('20 / 20'));
 await p.locator('.tcgp-editor-deck-grid').evaluate(n=>n.scrollLeft=400);const before=await p.locator('.tcgp-editor-deck-grid').evaluate(n=>n.scrollLeft);a.ok(before>200);
 await p.locator('#tcgpMyDeck [data-deck="remove"]').nth(6).click();const after=await p.locator('.tcgp-editor-deck-grid').evaluate(n=>n.scrollLeft);a.ok(Math.abs(after-before)<4,`${before}->${after}`);
}));
t('normal inspection hides implementation diagnostics while Developer inspection shows them once',()=>fixture(async p=>{
 await p.click('[data-tcgp-action="build"]');await p.fill('#tcgpDeckSearch','C1-015');await p.click('#tcgpDeckResults [data-deck="inspect"]');a.doesNotMatch(await p.locator('.tcgp-editor-sheet').innerText(),/PARTIAL|Unimplemented ability/);await p.click('[data-deck="close-sheet"]');await p.click('[data-deck="developer"]');await p.click('#tcgpDeckResults [data-deck="inspect"]');const text=await p.locator('.tcgp-editor-sheet').innerText();a.equal((text.match(/PARTIAL/g)||[]).length,1);a.match(text,/Sweet Honey/);
}));
t('test-pair rematch preserves the opposing deck and practice rewards stay unchanged',()=>fixture(async p=>{
 await p.click('[data-tcgp-action="build"]');await p.click('[data-deck="developer"]');await p.fill('#tcgpDeckSearch','A1a-060');await p.click('#tcgpDeckResults [data-deck="inspect"]');await p.click('[data-deck="test-card"]');await p.click('[data-deck="play-test"]');
 const before=await p.evaluate(()=>{const s=__tcgpBattle.sides.opponent;window.__beforeReward=JSON.stringify({coins:state.profile.coins,clears:state.tcgpBattle.firstClears});return [s.active,...s.bench,...s.hand,...s.deck].filter(Boolean).map(x=>x.cardId).sort();});
 await p.evaluate(()=>{const C=LuckyDexTCGPBattleCore,b=__tcgpBattle,p=b.sides.player,o=b.sides.opponent;b.phase='battle';b.setupSide=null;b.activeSide='player';b.turnNumber=5;p.turnCount=3;p.points=2;p.active=C.makePokemonSlot('A1a-060',0,'finisher');p.active.energy={Fire:5};o.active.damage=LuckyDexTCGPBattleData.cardById(o.active.cardId).hp-10;});
 await p.click('.tcgp-live-opponent-active .tcgp-live-card');await p.click('.tcgp-live-sheet-close');await p.click('.tcgp-live-player-active .attack');await p.locator('[data-tcgp-action="rematch"]').waitFor();a.equal(await p.evaluate(()=>JSON.stringify({coins:state.profile.coins,clears:state.tcgpBattle.firstClears})===__beforeReward),true);
 await p.click('[data-tcgp-action="rematch"]');const after=await p.evaluate(()=>{const s=__tcgpBattle.sides.opponent;return [s.active,...s.bench,...s.hand,...s.deck].filter(Boolean).map(x=>x.cardId).sort();});a.deepEqual(after,before);
}));
