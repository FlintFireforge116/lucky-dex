'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const asset=name=>path.join(root,'app/src/main/assets',name);
const read=name=>fs.readFileSync(asset(name),'utf8');
function fresh(name){const p=asset(name);delete require.cache[require.resolve(p)];return require(p);}

function idleCpus(race){for(const cpu of race.racers.slice(1))cpu.nextTapAt=null;}

test('Rattata gives Normal a wider player jump window while Hard keeps the tighter timing',()=>{
  const core=fresh('arcade-run-rattata-run-core.js');
  const normal=core.createRace({difficulty:'normal',rng:()=>.5,nowMs:0});
  const hard=core.createRace({difficulty:'hard',rng:()=>.5,nowMs:0});
  assert.equal(core.pressJump(normal,normal.player,1000).accepted,true);
  assert.equal(core.pressJump(hard,hard.player,1000).accepted,true);
  assert.ok(normal.player.jumpUntil-hard.player.jumpUntil>=100,'Normal jump should stay airborne materially longer than Hard');
  assert.ok(normal.player.jumpUntil-1000>=600,'Normal should provide at least a 600ms clear window');
});

test('Dynamo punishes mistakes more and cycles lamps faster',()=>{
  const core=fresh('arcade-thundering-dynamo-core.js');
  assert.ok(core.CONFIG.wrongDrain>=6,'wrong presses should erase at least two correct taps worth of charge');
  assert.ok(core.CONFIG.transitionMs<400,'neutral handoff should be quicker than the old 400ms delay');
  assert.ok(core.CONFIG.lampMaxMs<1450,'active lamp window should change sooner than the old maximum');
  const race=core.createRace({difficulty:'normal',rng:()=>.5,nowMs:0});
  race.player.charge=20;
  const wrong=race.lamp==='a'?'b':'a';
  core.pressPlayer(race,wrong,10);
  assert.equal(race.player.charge,20-core.CONFIG.wrongDrain);
});

test('Dynamo Hard randomly chooses the next lamp and its CPU is slightly slower than before',()=>{
  const core=fresh('arcade-thundering-dynamo-core.js');
  const hard=core.difficultyProfile('hard');
  assert.ok(hard.reactionMinMs>=90,'Hard reaction floor should be slowed from the old 65ms');
  assert.ok(hard.tapIntervalMinMs>=85,'Hard repeat tapping should be slowed from the old 70ms');

  const repeat=core.createRace({difficulty:'hard',rng:()=>.1,nowMs:0});
  repeat.lamp='a';repeat.nextLampAt=100;idleCpus(repeat);
  core.advanceRace(repeat,100,()=>.1);
  assert.equal(repeat.lamp,'neutral');
  core.advanceRace(repeat,100+core.CONFIG.transitionMs,()=>.1);
  assert.equal(repeat.lamp,'a','Hard random selection must be able to repeat the same button');

  const swap=core.createRace({difficulty:'hard',rng:()=>.9,nowMs:0});
  swap.lamp='a';swap.nextLampAt=100;idleCpus(swap);
  core.advanceRace(swap,100,()=>.9);
  core.advanceRace(swap,100+core.CONFIG.transitionMs,()=>.9);
  assert.equal(swap.lamp,'b','Hard random selection must also be able to choose the other button');

  const normal=core.createRace({difficulty:'normal',rng:()=>.1,nowMs:0});
  normal.lamp='a';normal.nextLampAt=100;idleCpus(normal);
  core.advanceRace(normal,100,()=>.1);
  core.advanceRace(normal,100+core.CONFIG.transitionMs,()=>.1);
  assert.equal(normal.lamp,'b','Easy/Normal should retain the readable alternating pattern');
});

test('Pokemon GO hidden Ditto helper only converts authentic reverse-holo covers',()=>{
  assert.equal(fs.existsSync(asset('pokemon-go-ditto-v04029.js')),true,'Ditto helper asset must exist');
  const ditto=fresh('pokemon-go-ditto-v04029.js');
  const set={id:'pgo',name:'Pokémon GO'};
  const descriptor={id:'reverse',finish:'reverse-holo'};
  for(const [localId,name] of [['6','Spinarak'],['13','Numel'],['59','Bidoof']]){
    const cover={id:`pgo-${localId}`,localId,name,image:`cover-${localId}.webp`,rarity:'Common',_foil:'Reverse Holo'};
    assert.equal(ditto.isEligibleCover(set,descriptor,cover),true,`${name} should be peelable in the reverse slot`);
    const hidden=ditto.wrapHiddenDitto(cover,{id:'pgo-53',localId:'53',name:'Ditto',image:'ditto.webp',rarity:'Rare Holo'});
    assert.equal(hidden.id,'pgo-53');assert.equal(hidden.name,'Ditto');assert.equal(hidden.localId,'53');
    assert.equal(hidden._hiddenDitto,true);assert.equal(hidden._hiddenDittoRevealed,false);
    assert.equal(hidden._hiddenDittoCover.id,cover.id);assert.equal(hidden._hiddenDittoCover.name,name);
  }
  assert.equal(ditto.isEligibleCover(set,{id:'common-1',finish:'normal'},{localId:'6',name:'Spinarak'}),false,'ordinary Spinarak must not become Ditto');
  assert.equal(ditto.isEligibleCover({id:'swsh10',name:'Astral Radiance'},descriptor,{localId:'6',name:'Spinarak'}),false,'other sets must not use the mechanic');
});

test('pack reveal has a subtle peel layer and pack summary has an explicit NEW badge',()=>{
  const opening=read('pack-opening-v0160.js'),flow=read('pack-flow-v0165.js'),app=read('app-v0167.js'),css=read('pack-opening-v0160.css'),styles=read('styles-v013.css'),html=read('index.html');
  assert.match(opening,/ditto-peel-layer/,'hidden Ditto should mount a separate peelable cover layer');
  assert.match(opening,/revealHiddenDitto/,'reveal runtime should expose a dedicated Ditto peel action');
  assert.match(app,/const helper=window\.LuckyDexPokemonGoDitto/,'physical pack building must load the GO Ditto helper');
  assert.match(app,/helper\.wrapHiddenDitto\(cover/,'physical pack building must wrap authentic GO reverse-slot covers as Ditto');
  assert.match(flow,/applyPokemonGoHiddenDittoV04030\(/,'pack orchestration must preserve the hidden-Ditto wrapper after audited construction');
  assert.match(css,/\.ditto-peel-corner/,'the front sticker needs a subtle lifted-corner tell');
  assert.match(flow,/pack-summary-new/,'summary should use a distinct NEW badge rather than only prefixing the card name');
  assert.match(styles,/\.pack-summary-new/,'summary NEW badge needs dedicated styling');
  assert.match(html,/pokemon-go-ditto-v04030\.js/,'current Ditto helper must load before pack building/runtime code');
});
