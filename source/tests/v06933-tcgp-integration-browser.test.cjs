const test=require('node:test');
const assert=require('node:assert/strict');
const {launch,createPage,start}=require('../scripts/tcgp-browser-fixture.cjs');

async function withPage(fn){const browser=await launch();try{const fixture=await createPage(browser);await fn(fixture.page);assert.deepEqual(fixture.errors,[]);await fixture.context.close();}finally{await browser.close();}}

test('owned catalogue searches unsupported cards, explains rules gaps, and keeps missing-art cards usable',()=>withPage(async page=>{
  await page.route('**/art/owned-paras.webp',route=>route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jV1cAAAAASUVORK5CYII=','base64')}));
  await page.evaluate(()=>{
    const D=LuckyDexTCGPBattleData;
    const card=D.cardById('A1-188');card.battleEnabled=false;card.support={status:'PARTIAL',reasons:['Target selection awaits implementation.']};
    state.cards={basic:{source:'tcgp',id:'A1-014',name:'Paras',setId:'A1',count:2,image:'art/owned-paras.webp'},partial:{source:'tcgp',id:'A1-188',name:'Pidgeot',setId:'A1',count:1}};
    LuckyDexTCGPBattleUI.renderHome();
  });
  await page.click('[data-tcgp-action="build"]');
  await page.fill('#tcgpDeckSearch','Pidgeot');
  await page.click('[data-deck="developer"]');await page.locator('#tcgpDeckResults [data-deck="inspect"]').click();
  assert.match(await page.locator('.tcgp-editor-sheet').innerText(),/PARTIAL.*Target selection awaits implementation/);await page.click('[data-deck="close-sheet"]');
  assert.equal(await page.locator('#tcgpDeckResults [data-deck="add"]').isDisabled(),true);
  await page.fill('#tcgpDeckSearch','Paras');
  // The full app may asynchronously repair the deliberately missing owned
  // fixture art. Both the owned URI and exact-card CDN fallback are valid;
  // another card's art is not.
  assert.ok(['art/owned-paras.webp','https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/pocket/A1/A1_014_EN.webp'].includes(await page.locator('#tcgpDeckResults img').getAttribute('src')));
  assert.equal(await page.locator('#tcgpDeckResults [data-deck="add"]').isDisabled(),false);
  await page.locator('#tcgpDeckResults [data-deck="add"]').click();
  assert.match(await page.locator('#tcgpMyDeck').innerText(),/1\s*\/\s*20/);
}));

test('inspection shows attack and ability rules when card artwork is unavailable',()=>withPage(async page=>{
  await page.evaluate(()=>{
    const card=LuckyDexTCGPBattleData.cardById('A1-001');
    card.attacks[0].text='This attack also poisons the opposing Active Pokémon.';
    card.ability={name:'Recovery',type:'passive',text:'This Pokémon heals 10 damage after every turn.'};
  });
  await start(page,{mode:'battle'});
  await page.click('.tcgp-live-player-active .tcgp-live-card');
  const text=await page.locator('.tcgp-live-card-sheet').innerText();
  assert.match(text,/This attack also poisons/);assert.match(text,/Recovery/);assert.match(text,/heals 10 damage/);
  assert.doesNotMatch(text,/\[object Object\]/);
}));

test('saved owned decks retain their selected Energy type when a battle starts',()=>withPage(async page=>{
  await page.evaluate(()=>{
    const D=LuckyDexTCGPBattleData,cards=LuckyDexTCGPBattleDecks.LOANER_PLAYER_DECK;
    state.cards=Object.fromEntries([...new Set(cards.filter(id=>id!=='BASIC-POKE-BALL'))].map(id=>[id,{source:'tcgp',id,name:D.cardById(id).name,setId:'A1',count:2}]));
    LuckyDexTCGPBattleUI.renderHome();
  });
  await page.click('[data-tcgp-action="quick"]');
  await page.waitForFunction(()=>document.querySelector('#tcgpMyDeck h2')?.textContent.includes('20 / 20'));
  await page.click('[data-deck="energy"]');await page.click('[data-deck="energy-type"][data-id="Water"]');await page.click('[data-deck="energy-type"][data-id="Lightning"]');await page.click('[data-deck="energy-type"][data-id="Grass"]');await page.click('[data-deck="close-sheet"]');
  await page.click('[data-deck="save"]');
  assert.equal(await page.evaluate(()=>state.tcgpBattle.decks[0].energyType),'Water');
  assert.deepEqual(await page.evaluate(()=>state.tcgpBattle.decks[0].energyTypes),['Water','Lightning']);
  await page.click('[data-deck="manage"]');await page.click('[data-deck="battle"]');
  assert.deepEqual(await page.evaluate(()=>__tcgpBattle.sides.player.energyTypes),['Water','Lightning']);
}));

test('targeted attacks retain one readable attack control and offer every physical target',()=>withPage(async page=>{
  await page.evaluate(()=>{LuckyDexTCGPBattleData.cardById('A1-001').attacks=[{name:'Snipe',cost:'',damage:0,text:'Choose an opposing Pokémon and do 30 damage.',effect:{type:'selectedDamage',target:'opponentPokemon',amount:30}}];});
  await start(page,{mode:'battle'});
  assert.equal(await page.locator('.tcgp-live-player-active .attack').count(),1);
  await page.click('.tcgp-live-player-active .attack');
  const targets=page.locator('.tcgp-live-action-sheet [data-tcgp-action="battle-action"]');
  assert.equal(await targets.count(),4);
  await targets.filter({hasText:/Bench 3/}).click();
  assert.equal(await page.evaluate(()=>__tcgpBattle.sides.opponent.bench[2].damage),30);
}));

test('activated Bench abilities offer separate legal effect targets and narrate the action',()=>withPage(async page=>{
  await page.evaluate(()=>{LuckyDexTCGPBattleData.cardById('A1-014').ability={name:'Supply',type:'activated',oncePerTurn:true,effect:{type:'attachEnergy',target:'selfPokemon',energyType:'Grass',amount:1}};});
  await start(page,{mode:'battle'});
  await page.click('.tcgp-live-player-bench .ability');
  const targets=page.locator('.tcgp-live-action-sheet [data-tcgp-action="battle-action"]');
  assert.equal(await targets.count(),4);
  await targets.filter({hasText:/Supply · Paras → Bulbasaur$/}).click();
  assert.equal(await page.evaluate(()=>__tcgpBattle.sides.player.active.energy.Grass),3);
  assert.match(await page.locator('.tcgp-live-action-event').innerText(),/You used Supply/);
  assert.equal(await page.locator('.tcgp-live-player-bench .ability').count(),0);
}));

test('HP Tool modifiers appear in both the battlefield and card inspection',()=>withPage(async page=>{
  await start(page,{mode:'battle'});
  await page.evaluate(()=>{
    const tool=LuckyDexTCGPBattleData.cardById('BASIC-POKE-BALL');tool.trainerType='Tool';tool.effect={type:'modifier',stat:'maxHp',amount:20,duration:'whileInPlay'};
    __tcgpBattle.sides.player.active.tool={cardId:'BASIC-POKE-BALL'};__tcgpBattle.sides.player.active.damage=10;
  });
  await page.click('.tcgp-live-player-active .tcgp-live-card');
  assert.match(await page.locator('.tcgp-live-card-sheet').innerText(),/HP 80\/90/);
  assert.equal(await page.locator('.tcgp-live-player-active .tcgp-live-hp').innerText(),'80');
}));

test('supplied Poke Balls and owned Poké Ball prints share the visible two-copy allowance',()=>withPage(async page=>{
  await page.evaluate(()=>{state.cards={ball:{source:'tcgp',id:'P-A-005',name:'Poké Ball',setId:'P-A',count:2}};LuckyDexTCGPBattleUI.renderHome();});
  await page.click('[data-tcgp-action="build"]');
  const owned=page.locator('#tcgpDeckResults [data-deck="add"][data-id="P-A-005"]');
  await owned.click();await owned.click();
  assert.equal(await page.locator('#tcgpDeckResults [data-deck="add"][data-id="BASIC-POKE-BALL"]').isDisabled(),true);
}));

test('a Fossil played onto the battlefield exposes HP and its activated discard ability',()=>withPage(async page=>{
  await start(page,{mode:'battle',benchCount:2});
  await page.evaluate(()=>{
    const card=LuckyDexTCGPBattleData.cardById('BASIC-POKE-BALL');Object.assign(card,{name:'Fossil',hp:40,subtype:'Colorless',stage:'Basic',tags:['fossil'],attacks:[],ability:{name:'Discard Fossil',type:'activated',effect:{type:'discardSelf'}},effect:{type:'playFossil',hp:40,subtype:'Colorless',canRetreat:false}});
    const slot=LuckyDexTCGPBattleCore.makePokemonSlot(card.id,0);slot.benchSlot=2;__tcgpBattle.sides.player.bench.push(slot);
  });
  await page.click('.tcgp-live-player-active .tcgp-live-card');await page.click('.tcgp-live-sheet-close');
  assert.equal(await page.locator('.tcgp-live-player-bench .ability').count(),1);
  await page.click('.tcgp-live-player-bench .tcgp-live-card-wrap:nth-child(3) .tcgp-live-card');
  assert.match(await page.locator('.tcgp-live-card-sheet').innerText(),/HP 40\/40/);
}));

test('the complete owned print catalogue stays bounded and finds alternate-print IDs by search',()=>withPage(async page=>{
  const sample=await page.evaluate(()=>{
    const D=LuckyDexTCGPBattleData;
    state.cards=Object.fromEntries(D.PRINTS.map(print=>[print.id,{...print,count:1,source:'tcgp'}]));
    const print=D.PRINTS[D.PRINTS.length-1];LuckyDexTCGPBattleUI.renderHome();
    return {id:print.id,name:D.cardById(print.id).name};
  });
  await page.click('[data-tcgp-action="build"]');
  assert.equal(await page.locator('#tcgpDeckResults .tcgp-editor-card').count(),48);
  await page.fill('#tcgpDeckSearch',sample.id);
  assert.equal(await page.locator('#tcgpDeckResults .tcgp-editor-card').count(),1);
  assert.equal(await page.locator('#tcgpDeckResults .tcgp-editor-card-name').first().innerText(),sample.name);
}));
