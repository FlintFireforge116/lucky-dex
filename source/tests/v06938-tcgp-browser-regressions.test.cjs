const t=require('node:test'),a=require('node:assert/strict');
const {launch,createPage,start}=require('../scripts/tcgp-browser-fixture.cjs');
async function fixture(fn,{height=873}={}){const b=await launch();try{const x=await createPage(b,{width:393,height});await fn(x.page);a.deepEqual(x.errors,[]);await x.context.close();}finally{await b.close();}}

t('synthetic Battle Poké Ball uses the real Poké Ball artwork',()=>fixture(async p=>{
 const url=await p.evaluate(()=>LuckyDexTCGPBattleUI.cardArtUrl('BASIC-POKE-BALL'));
 a.match(url,/P-A|promo|005|_005_/i);a.ok(url.length>10);
}));

t('Auto build menu keeps build-around-card on the card itself',()=>fixture(async p=>{
 await p.evaluate(()=>{state.cards=Object.fromEntries(LuckyDexTCGPBattleData.PRINTS.map(c=>[c.id,{id:c.id,source:'tcgp',count:2}]));LuckyDexTCGPBattleUI.renderHome();});
 await p.click('[data-tcgp-action="build"]');await p.click('[data-deck="auto"]');
 a.equal(await p.locator('[data-deck="pick-card"]').count(),0);
}));

t('deck collection defaults to owned battle-ready cards, not disabled review cards',()=>fixture(async p=>{
 await p.evaluate(()=>{state.cards=Object.fromEntries(LuckyDexTCGPBattleData.PRINTS.map(c=>[c.id,{id:c.id,source:'tcgp',count:2}]));LuckyDexTCGPBattleUI.renderHome();});
 await p.click('[data-tcgp-action="build"]');
 a.equal(await p.locator('#tcgpDeckResults [data-deck="add"]:disabled').count(),0);
 await p.click('[data-deck="filters"]');a.equal(await p.locator('[data-filter="enabled"]').getAttribute('aria-pressed'),'true');
}));

t('paralyzed Mewtwo attack button names paralysis rather than falsely asking for Energy',()=>fixture(async p=>{
 await start(p,{mode:'battle'});
 await p.evaluate(()=>{const b=window.__tcgpBattle;b.phase='battle';b.activeSide='player';b.sides.player.active=LuckyDexTCGPBattleCore.makePokemonSlot('B4a-030',1,'mewtwo');b.sides.player.active.energy={Psychic:3};b.sides.player.active.conditions.paralysis={appliedTurn:b.turnNumber};});
 await p.locator('.tcgp-live-player-active [data-tcgp-action="inspect-card"]').click();await p.locator('[data-tcgp-action="close-overlay"]').first().click();
 const small=await p.locator('.tcgp-live-player-active .tcgp-live-context-action.attack small').first().innerText();a.match(small,/Paralyzed/i);a.doesNotMatch(small,/Needs/i);
}));

t('active Pokémon keeps a usable minimum size even when its action area grows',()=>fixture(async p=>{
 await start(p,{mode:'battle'});
 const min=await p.locator('.tcgp-live-player-active .tcgp-live-card').evaluate(el=>getComputedStyle(el).minHeight);
 a.notEqual(min,'0px');a.ok(parseFloat(min)>=80,min);
},{height:650}));
