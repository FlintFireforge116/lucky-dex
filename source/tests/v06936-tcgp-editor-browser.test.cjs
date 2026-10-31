const t=require('node:test'),a=require('node:assert/strict');const {launch,createPage}=require('../scripts/tcgp-browser-fixture.cjs');
async function fixture(fn){const b=await launch();try{const x=await createPage(b,{width:393,height:873});await x.page.evaluate(()=>{state.cards=Object.fromEntries(LuckyDexTCGPBattleData.PRINTS.map(c=>[c.id,{id:c.id,source:'tcgp',count:2}]));LuckyDexTCGPBattleUI.renderHome();});await fn(x.page);a.deepEqual(x.errors,[]);await x.context.close();}finally{await b.close();}}
t('visual deck workspace edits, inspects and saves multiple drafts with no page jumping',()=>fixture(async p=>{
 await p.click('[data-tcgp-action="build"]');a.equal(await p.locator('#tcgpMyDeck').count(),1,'persistent visual My Deck is missing');
 await p.fill('#tcgpDeckSearch','Articuno');await p.locator('[data-deck="add"][data-id="A1-083"]').click();
 a.match(await p.locator('#tcgpMyDeck').innerText(),/1\s*\/\s*20/);a.equal(await p.locator('#tcgpMyDeck img').count(),1);
 await p.locator('#tcgpMyDeck [data-deck="inspect"]').click();a.match(await p.locator('.tcgp-editor-sheet').innerText(),/Ice Beam/);const name=await p.locator('.tcgp-editor-inspect article b').first().boundingBox(),damage=await p.locator('.tcgp-editor-inspect article strong').first().boundingBox();a.ok(damage.x-name.x-name.width>=8,'Attack name and damage need a visible gap');await p.click('[data-deck="close-sheet"]');
 await p.fill('#tcgpDeckName','Ice Draft');await p.click('[data-deck="save"]');await p.click('[data-deck="manage"]');a.match(await p.locator('.tcgp-editor-sheet').innerText(),/Ice Draft/);
 await p.click('[data-deck="duplicate"]');a.equal(await p.locator('[data-deck="edit-saved"]').count(),2);await p.click('[data-deck="close-sheet"]');
 await p.fill('#tcgpDeckSearch','');await p.locator('[data-deck="next"]').click();a.match(await p.locator('#tcgpDeckResults').innerText(),/49–96/);
 await p.locator('#tcgpDeckResults').evaluate(n=>n.scrollTop=400);a.ok(await p.locator('#tcgpDeckResults').evaluate(n=>n.scrollTop)>100,'Collection must scroll independently of My Deck');const deckRect=await p.locator('#tcgpMyDeck').boundingBox();a.ok(deckRect.y>=0&&deckRect.y+deckRect.height<873,'My Deck must remain visible while browsing');
 const before=await p.locator('#tcgpDeckResults').evaluate(n=>n.scrollTop);await p.locator('[data-deck="add"]').first().click();const after=await p.locator('#tcgpDeckResults').evaluate(n=>n.scrollTop);a.ok(Math.abs(after-before)<4,`${before}->${after}`);
}));
t('filter sheet combines Water Basic ex A1 owned and text search; offline reopens saved drafts',()=>fixture(async p=>{
 await p.click('[data-tcgp-action="build"]');await p.click('[data-deck="filters"]');
 for(const [key,value] of [['types','Water'],['stage','Basic'],['ex','true'],['setId','A1'],['owned','true']])await p.locator(`[data-filter="${key}"][data-value="${value}"]`).click();
 await p.click('[data-deck="apply-filters"]');await p.fill('#tcgpDeckSearch','Blizzard');a.equal(await p.locator('#tcgpDeckResults .tcgp-editor-card').count(),1);a.match(await p.locator('#tcgpDeckResults').innerText(),/Articuno ex/);
 await p.context().setOffline(true);await p.locator('[data-deck="add"]').click();await p.click('[data-deck="save"]');await p.click('[data-deck="manage"]');a.equal(await p.locator('[data-deck="edit-saved"]').count(),1);
}));
