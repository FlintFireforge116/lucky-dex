'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const aqua=require(path.join(A,'tcg-classic-aquapolis.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const fx=require(path.join(A,'tcgp-battle-effects.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const ai=require(path.join(A,'tcgp-battle-ai.js'));
const C=n=>classic.cardById('ecard2-'+n);
function field(seed=40){const deck=opponents.generate({sets:['ecard2'],seed});assert.ok(deck.ok,deck.error);const s=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,playerEnergyTypes:['Psychic','Grass','Water','Fire','Lightning','Fighting','Darkness','Metal'],opponentEnergyTypes:['Psychic','Grass','Water','Fire','Lightning','Fighting','Darkness','Metal'],seed,firstSide:'player'});s.phase='battle';s.activeSide='player';s.turnNumber=7;s.sides.player.turnCount=4;s.sides.opponent.turnCount=3;return s;}
function ctx(s,who='player',action={}){return {...core.effectContext(s,who,action,s.sides[who].active),random:()=>0.1};}
test('Aquapolis second mechanics pass effects remain enabled after full completion',()=>{
 assert.ok(aqua.coverage().battleEnabled>=128,aqua.coverage().battleEnabled);
 for(const id of [13,19,20,34,42,49,54,63,121,122,124,132,140])assert.ok(C(id).battleEnabled,`ecard2-${id}`);
 assert.equal(C('H14').battleEnabled,C(19).battleEnabled,'Kingdra holo 14 must match print 19');
 assert.equal(C('H12').battleEnabled,C(16).battleEnabled,'Hypno holo 12 must match print 16');
 for(const id of [148,149,150])assert.equal(C(id).battleEnabled,true,'Crystal Type now enabled');
 for(const c of aqua.CARDS.filter(x=>x.battleEnabled))for(const e of [...(c.attacks||[]),...(c.abilities||[])])assert.ok(fx.supportsEffect(e.effect),`${c.id} ${e.name}`);
});
test('E-Card Exeggutor variable damage uses attached Energy, including the Bench',()=>{
 const s=field();s.sides.player.active=core.makePokemonSlot('ecard2-13',4,'egg');s.sides.player.active.energy={Psychic:3};s.sides.opponent.active=core.makePokemonSlot('ecard2-79',4,'grimer');
 const bench=core.makePokemonSlot('ecard2-77',4,'benchedEgg');bench.energy={Psychic:2};bench.benchSlot=0;s.sides.player.bench=[bench];
 assert.equal(fx.resolveAttack(C(13).attacks[0],ctx(s)).damage,60);
 assert.equal(fx.resolveAttack(C(13).attacks[1],ctx(s)).damage,50);
});
test('Lanturn Conduction counts actual Lightning cards, discards Energy, and flips damage',()=>{
 const s=field();s.sides.player.active=core.makePokemonSlot('ecard2-20',4,'lan');s.sides.player.active.energy={Lightning:3};s.sides.opponent.active=core.makePokemonSlot('ecard2-79',4,'grimer');
 const out=fx.resolveAttack(C(20).attacks[1],ctx(s));assert.equal(out.damage,150);
 assert.equal(s.sides.player.active.energy.Lightning,0);assert.equal(s.sides.player.energyDiscard.Lightning,3);
});
test('damage-based and bench-target attacks resolve actual combat targets',()=>{
 const s=field();s.sides.player.active=core.makePokemonSlot('ecard2-11',4,'esp');s.sides.opponent.active=core.makePokemonSlot('ecard2-79',4,'grimer');s.sides.opponent.active.damage=30;
 assert.equal(fx.resolveAttack(C(11).attacks[0],ctx(s)).damage,60);
 s.sides.player.active=core.makePokemonSlot('ecard2-54',4,'maro');const target=core.makePokemonSlot('ecard2-117',4,'wooper');target.benchSlot=0;s.sides.opponent.bench=[target];
 const choices=fx.choicesForEffect(C(54).attacks[0].effect,{...ctx(s),isAttack:true,attack:C(54).attacks[0]});assert.ok(choices.some(x=>x.benchIndex===0));
 const result=fx.resolveAttack(C(54).attacks[0],ctx(s,'player',{target:'opponentBench',benchIndex:0}));assert.equal(result.damage,30);assert.equal(result.damageTarget,target);
});
test('Gloom puts both Active Pokémon asleep and Tyrogue discards only Special Energy',()=>{
 const s=field();s.sides.player.active=core.makePokemonSlot('ecard2-49',4,'gloom');s.sides.opponent.active=core.makePokemonSlot('ecard2-79',4,'grimer');
 let x=fx.resolveAttack(C(49).attacks[0],ctx(s));for(const e of x.pendingEffects)fx.applyEffect(e,ctx(s));
 assert.ok(s.sides.player.active.conditions?.sleep);assert.ok(s.sides.opponent.active.conditions?.sleep);
 s.sides.player.active=core.makePokemonSlot('ecard2-63',4,'tyrogue');s.sides.opponent.active.specialEnergy=[{uid:'sp',cardId:'ecard2-142'}];
 x=fx.resolveAttack(C(63).attacks[0],ctx(s,'player',{effectSpecialEnergyUid:'sp'}));assert.equal(x.damage,10);
 for(const e of x.pendingEffects)fx.applyEffect(e,ctx(s));assert.equal(s.sides.opponent.active.specialEnergy.length,0);
 assert.ok(s.sides.opponent.discard.some(r=>r.uid==='sp'));
 x=fx.resolveAttack(C(63).attacks[0],{...ctx(s),random:()=>0.9});assert.equal(x.damage,0);
});
test('Technical Machines have attacks and only attach to the printed Pokemon type',()=>{
 const s=field();s.sides.player.active=core.makePokemonSlot('ecard2-74',4,'psychic');s.sides.player.active.energy={Psychic:2};
 const grass=core.makePokemonSlot('ecard2-76',4,'grass');grass.benchSlot=0;s.sides.player.bench=[grass];
 s.sides.player.hand=[{uid:'tool1',cardId:'ecard2-132'},{uid:'tool2',cardId:'ecard2-124'}];
 let actions=core.legalActions(s,'player');const psychic=actions.filter(a=>a.type==='trainer'&&a.cardId==='ecard2-132'),green=actions.filter(a=>a.type==='trainer'&&a.cardId==='ecard2-124');
 assert.ok(psychic.some(a=>a.target==='active'));
 assert.ok(!psychic.some(a=>a.target==='bench'));
 assert.ok(green.some(a=>a.target==='bench'));
 assert.ok(!green.some(a=>a.target==='active'));
 core.applyAction(s,'player',psychic.find(a=>a.target==='active'));
 actions=core.legalActions(s,'player');assert.ok(actions.some(a=>a.type==='attack'&&a.attackCardId==='ecard2-132'),'TM attack granted');
 core.applyAction(s,'player',{type:'endTurn'});
 assert.ok(s.sides.player.discard.some(r=>r.cardId==='ecard2-132'),'TM discarded after its turn');
});
test('Flower Supplement requests actual choices only if basic Energy exists in hand and Bench',()=>{
 const s=field();s.sides.player.active=core.makePokemonSlot('ecard2-5',4,'flower');const b=core.makePokemonSlot('ecard2-112',4,'hoppip');b.benchSlot=0;s.sides.player.bench=[b];s.sides.player.hand=[{uid:'handGrass',cardId:'ecard1-162'}];
 const requests=[];fx.applyEffect(C(5).abilities[0].effect,{...ctx(s),requestChoice:req=>requests.push(req)});
 assert.ok(requests.length,'heads should ask which Basic Energy to attach');assert.equal(requests[0].kind,'handCard');
 assert.equal(C(5).abilities[0].oncePerTurn,true);
});
test('Playability filter prevents incomplete Crystal Type and other flagged cards in CPU decks',()=>{
 for(const seed of [17,29]){const r=opponents.generate({sets:['ecard2'],seed});assert.ok(r.ok,r.error);assert.equal(r.cards.length,30);assert.ok(r.cards.every(id=>classic.cardById(id)?.battleEnabled!==false));}
});
test('v0.69.145 is consistent in Android, build marker and splash labels',()=>{
 const build=fs.readFileSync(path.resolve(A,'../../../build.gradle'),'utf8'),js=fs.readFileSync(path.join(A,'app-v0167.js'),'utf8'),html=fs.readFileSync(path.join(A,'index.html'),'utf8');
 assert.match(build,/versionCode 7126/);assert.match(build,/versionName '0\.69\.146'/);assert.match(js,/window\.__LUCKYDEX_BUILD='0\.69\.146'/);assert.equal(html.split('v0.69.146').length-1,2);
});
