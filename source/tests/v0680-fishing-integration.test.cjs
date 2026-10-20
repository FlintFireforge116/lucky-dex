'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'..','app','src','main','assets');const read=f=>fs.readFileSync(path.join(root,f),'utf8');

test('Fishing is a dedicated Arcade venue/game with shared help and mobile UI',()=>{
 const world=read('arcade-world.js'),index=read('index.html'),help=read('arcade-help.js');
 assert.match(world,/id:"fishingLodge"/);assert.match(world,/games:\['fishing'\]/);assert.match(world,/fishing:'Fishing'/);assert.match(world,/fishing:\(\)=>window\.LuckyDexFishing/);
 assert.match(index,/id="fishingGame"/);assert.match(index,/arcade-fishing-core\.js/);assert.match(index,/arcade-fishing\.js/);assert.match(index,/arcade-fishing\.css/);
 assert.match(help,/fishing:\{name:'Fishing'/);assert.match(index,/id="fishingBook"/);assert.match(index,/id="fishingShop"/);assert.match(index,/id="fishingCatchZone"/);
});

test('Fishing has persistent records, achievements, book silhouettes and Developer rare forcing',()=>{
 const platform=read('arcade-platform.js'),records=read('arcade-records.js'),ach=read('achievements-v0341.js'),app=read('app-v0167.js'),index=read('index.html'),css=read('arcade-fishing.css');
 assert.match(platform,/fishing:\{casts:0/);assert.match(records,/fishing:/);assert.match(ach,/fishing_first_catch/);assert.match(ach,/secret_fishing_slowpoke_tail/);assert.match(ach,/secret_fishing_eon_ticket/);
 for(const key of ['fishingTreasure','fishingEasterJunk','fishingJumbo','fishingRarePokemon'])assert.match(app,new RegExp(key+':'));
 for(const id of ['rareFishingTreasureOddsSelect','rareFishingEasterJunkOddsSelect','rareFishingJumboOddsSelect','rareFishingRarePokemonOddsSelect'])assert.match(index,new RegExp(id));
 assert.match(css,/\.fishing-book-entry\.is-unknown img\{[^}]*filter:/);assert.match(css,/min-height:\s*44px/);
 const fishing=read('arcade-fishing.js');assert.match(fishing,/fish\.textContent=''[^;]*;/,'Pokemon renders clear any previous junk/treasure emoji');assert.match(css,/@media\(max-height:700px\)/,'short phones receive a compact gameplay layout');
});

test('Adventure fishing is a lightweight Gen III-style message flow rather than the Arcade reeling minigame',()=>{
 const js=read('adventure/adventure-fishing.js'),css=read('adventure/adventure-activities.css');
 assert.match(js,/A Pokémon's on the hook!/);assert.match(js,/Not even a nibble/);assert.match(js,/It got away/);
 assert.doesNotMatch(js,/LINE TENSION|REEL PROGRESS|HOLD TO REEL/);
 assert.match(css,/adv-fishing-gen3/);
});
