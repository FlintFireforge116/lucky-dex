'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const lc=require(path.join(A,'tcg-classic-legendary-collection.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const decks=require(path.join(A,'tcg-classic-decks.js'));
const builder=require(path.join(A,'tcg-classic-deck-builder.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const fx=require(path.join(A,'tcgp-battle-effects.js'));
const ai=require(path.join(A,'tcgp-battle-ai.js'));
const full=classic.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
const fromSet=full.filter(row=>classic.cardById(row.gameplayId).setId==='base6');
function battle(seed=12){const o=opponents.generate({sets:['base6'],seed,type:'Psychic'});assert.ok(o.ok,o.error);const s=core.createBattle({format:'classic',playerDeck:o.cards,opponentDeck:o.cards,playerEnergyTypes:['Psychic','Lightning','Water'],opponentEnergyTypes:['Psychic','Lightning','Water'],seed,firstSide:'player'});s.phase='battle';s.activeSide='player';s.turnNumber=5;s.sides.player.turnCount=3;s.sides.opponent.turnCount=2;return s;}
function ref(id,n=1){return {cardId:id,uid:'test-'+id+'-'+n};}

test('all 110 numbered Legendary Collection prints are individually registered, functional and shown in the Classic set pickers',()=>{
 assert.equal(lc.CARDS.length,110);assert.equal(new Set(lc.CARDS.map(c=>c.id)).size,110);
 assert.deepEqual(lc.coverage(),{total:110,battleEnabled:110,partial:[]});
 for(let n=1;n<=110;n++){const c=classic.cardById('base6-'+n);assert.ok(c);assert.equal(c.setId,'base6');assert.equal(Number(c.number),n);assert.equal(c.battleEnabled,true,c.name);assert.equal(c.support.status,'FULL');assert.match(c.image,new RegExp(`/base6/${n}\\.png$`));for(const a of c.attacks||[])assert.ok(a.name&&a.cost!=null&&a.text!=null,c.id);}
 assert.ok(classic.SETS.some(s=>s.id==='base6'&&s.cardCount===110));
 assert.deepEqual(builder.SET_IDS,opponents.SETS);
 for(const f of ['tcgp-battle-ui.js','tcg-classic-deck-editor.js'])assert.match(fs.readFileSync(path.join(A,f),'utf8'),/Legendary Collection/);
 const html=fs.readFileSync(path.join(A,'index.html'),'utf8');assert.ok(html.indexOf('tcg-classic-team-rocket.js')<html.indexOf('tcg-classic-legendary-collection.js'));assert.ok(html.indexOf('tcg-classic-legendary-collection.js')<html.indexOf('tcg-classic-battle-data.js'));
 assert.match(fs.readFileSync(path.resolve(__dirname,'../app/build.gradle'),'utf8'),/versionName '0\.69\.141'/);
 assert.match(fs.readFileSync(path.join(A,'app-v0167.js'),'utf8'),/window\.__LUCKYDEX_BUILD='0\.69\.141'/);
});
test('physical ownership projects strictly from Legendary Collection and preserves numbered print copies',()=>{
 const projected=classic.projectOwnedCards([{source:'tcg',setId:'base6',number:5,count:2},{source:'tcg',setName:'Legendary Collection',number:6,count:1},{source:'tcg',setId:'lc',number:10,count:3},{source:'tcgp',setId:'base6',number:18,count:100}]);
 assert.equal(projected.find(x=>x.gameplayId==='base6-5')?.quantity,2);
 assert.equal(projected.find(x=>x.gameplayId==='base6-6')?.quantity,1);
 assert.equal(projected.find(x=>x.gameplayId==='base6-10')?.quantity,3);
 assert.equal(projected.some(x=>x.gameplayId==='base6-18'),false);
});
test('four-copy limit and deck editing normalize typography across printed reprints',()=>{
 const invalid=classic.validateDeck(['base5-73','base6-105','base6-105','base6-105','base6-105']);
 assert.match(invalid.errors.join(' '),/exceeds the four-copy limit/);
 const a=classic.cardById('base6-83'),b=classic.cardById('base1-55');assert.equal(a.name.replace(/\s/g,''),b.name.replace(/\s/g,''));
 const invalid2=classic.validateDeck(['base1-55','base6-83','base6-83','base6-83','base6-83']);assert.match(invalid2.errors.join(' '),/four-copy limit/);
 const owned=[{gameplayId:'base5-73',quantity:4},{gameplayId:'base6-105',quantity:4}];
 assert.equal(decks.edit(['base5-73','base5-73','base5-73','base6-105'],'base6-105',1,owned).ok,false);
});
test('cross-print Nidoran evolution is legal, including newly imported Legendary Nidorino',()=>{
 const s=battle(34),p=s.sides.player;
 p.active=core.makePokemonSlot('base1-55',1,'nidoran');p.hand=[ref('base6-56')];
 const evolve=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='base6-56'&&a.target==='active');assert.ok(evolve);
 core.applyAction(s,'player',evolve);assert.equal(p.active.cardId,'base6-56');
});
test('Legendary Mewtwo Energy Control lets the ATTACKER select both opponent source and destination',()=>{
 const s=battle(94),p=s.sides.player,o=s.sides.opponent;
 p.active=core.makePokemonSlot('base6-29',1,'mewtwo');o.active=core.makePokemonSlot('base6-67',1,'opponent-active');o.active.energy={Psychic:2};
 const bench=core.makePokemonSlot('base6-68',1,'opponent-bench');bench.benchSlot=0;o.bench=[bench];
 // Applying the heads branch bypasses RNG to test the important ownership and targeting logic.
 fx.applyEffect({type:'neoRule',rule:'legendary:energyControl'},core.effectContext(s,'player',{},p.active));
 assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'player');
 assert.equal(s.pendingChoice.selectionSide,'opponent');assert.equal(s.pendingChoice.kind,'energySource');
 const source=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceTarget==='active'&&a.effectEnergyType==='Psychic');assert.ok(source);
 core.applyAction(s,'player',source);
 assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'player');assert.equal(s.pendingChoice.kind,'pokemon');
 const dest=core.legalActions(s,'player').find(a=>a.choiceTarget==='bench');assert.ok(dest);
 core.applyAction(s,'player',dest);
 assert.equal(o.active.energy.Psychic,1);assert.equal(bench.energy.Psychic,1);
});
test('Legendary Mewtwo Telekinesis targets an opponent and deals exactly 30 even to Psychic-weak Pokémon',()=>{
 const s=battle(210),p=s.sides.player,o=s.sides.opponent;
 p.active=core.makePokemonSlot('base6-29',1,'mewtwo');p.active.energy={Psychic:3};
 o.active=core.makePokemonSlot('base6-25',1,'hypno');o.bench=[];
 const move=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===1&&a.target==='opponentActive');assert.ok(move);
 core.applyAction(s,'player',move);
 assert.equal(o.active.damage,30,'Ignore printed Psychic x2 weakness');
});
test('original and reprinted Potion Energy / Full Heal Energy trigger printed on-attach effects',()=>{
 for(const id of ['base5-81','base5-82','base6-100','base6-101']){
  const s=battle(23),p=s.sides.player;
  p.active=core.makePokemonSlot('base6-67',1,'heal-target');p.active.damage=20;p.active.conditions.sleep=true;p.hand=[ref(id)];
  const action=core.legalActions(s,'player').find(a=>a.type==='attachSpecial'&&a.cardId===id&&a.target==='active');assert.ok(action,'No attachment: '+id);
  core.applyAction(s,'player',action);
  assert.equal(p.active.specialEnergy.length,1,id);
  if(id.endsWith('81')||id.endsWith('100'))assert.equal(!!p.active.conditions.sleep,false,id);
  else assert.equal(p.active.damage,10,id);
 }
});
test('Mirror Shell reflects the actual attack damage, including a lethal blow, exactly once',()=>{
 const s=battle(65),p=s.sides.player,o=s.sides.opponent;
 p.active=core.makePokemonSlot('base6-86',1,'pikachu');p.active.energy={Lightning:2};
 o.active=core.makePokemonSlot('base6-39',1,'wartortle');o.active.legendaryMirrorShellUntil=s.turnNumber;
 const action=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(action,'Could not attack');
 core.applyAction(s,'player',action);
 const reflection=s.log.filter(x=>x.type==='legendaryMirrorShell');assert.equal(reflection.length,1);
 const attack=s.log.find(x=>x.type==='attack'&&x.cardId==='base6-86');assert.ok(attack);
 assert.equal(reflection[0].amount,attack.damage);
 assert.equal(p.active?.damage||0,attack.damage);
});
test('Dark Dragonite evolution offers deck search for two Basic Pokémon, not placeholder effects',()=>{
 const s=battle(66),p=s.sides.player;
 p.active=core.makePokemonSlot('base6-38',1,'dark-dragonair');p.hand=[ref('base6-5')];
 p.deck.unshift(ref('base6-67',11),ref('base6-68',12));
 const action=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='base6-5');assert.ok(action);
 core.applyAction(s,'player',action);
 assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.kind,'deckCard');
 const pick=core.legalActions(s,'player').find(a=>a.choiceCardId==='base6-67');assert.ok(pick);
 core.applyAction(s,'player',pick);
 assert.ok(p.bench.some(x=>x.cardId==='base6-67'));
 assert.equal(s.phase,'effectChoice');
 const pick2=core.legalActions(s,'player').find(a=>a.choiceCardId==='base6-68');assert.ok(pick2);core.applyAction(s,'player',pick2);
 assert.equal(p.bench.length,2);
});
test('Challenge! opponent can decline, then trainer draws two cards',()=>{
 const s=battle(77),p=s.sides.player;const before=p.hand.length;
 fx.applyEffect(classic.cardById('base6-106').effect,core.effectContext(s,'player',{},p.active));
 assert.equal(s.choiceSide,'opponent');
 const no=core.legalActions(s,'opponent').find(a=>a.choiceOption===1);assert.ok(no);
 core.applyAction(s,'opponent',no);
 assert.equal(p.hand.length,before+2);
});
test('Challenge! acceptance lets BOTH players fill their Benches, and a player skipping does not skip the opponent phase',()=>{
 const s=battle(177),p=s.sides.player,o=s.sides.opponent;
 p.active=core.makePokemonSlot('base6-67',1,'active-self');o.active=core.makePokemonSlot('base6-67',1,'active-foe');
 p.deck.unshift(ref('base6-68',81));o.deck.unshift(ref('base6-70',82));
 fx.applyEffect(classic.cardById('base6-106').effect,core.effectContext(s,'player',{},p.active));
 core.applyAction(s,'opponent',core.legalActions(s,'opponent').find(a=>a.choiceOption===0));
 assert.equal(s.choiceSide,'player');assert.equal(s.pendingChoice.effect.phase,'self');
 core.applyAction(s,'player',core.legalActions(s,'player').find(a=>a.choiceSkip));
 assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'opponent');assert.equal(s.pendingChoice.effect.phase,'opponent');
 const pick=core.legalActions(s,'opponent').find(a=>a.choiceCardId==='base6-70');assert.ok(pick);
 core.applyAction(s,'opponent',pick);assert.ok(o.bench.some(x=>x.cardId==='base6-70'));
});
test('restricted-to-Legendary random and competitive builders and opponents generate valid 30-card decks',()=>{
 for(const style of ['random','competitive'])for(let seed=1;seed<=18;seed++){
  const b=builder.buildDeck(fromSet,{sets:['base6'],style,randomSeed:seed});assert.ok(b.ok,`${style} ${seed}: ${b.errors}`);assert.equal(b.cards.length,30);assert.ok(b.cards.every(id=>classic.cardById(id).setId==='base6'));assert.ok(decks.readiness({cards:b.cards,energyMode:'manual',energyTypes:b.energyTypes},fromSet).ok);
 }
 for(const type of ['Grass','Water','Fire','Psychic','Fighting','Lightning','Colorless']){const o=opponents.generate({sets:['base6'],type,seed:100+type.length});assert.ok(o.ok,`${type}: ${o.error}`);assert.ok(classic.validateDeck(o.cards).ok);}
});
test('advanced CPU finishes real Legendary Collection battles without hanging at effect choices',()=>{
 for(let seed=1;seed<=3;seed++){
  const o=opponents.generate({sets:['base6'],seed:seed+99,type:'Psychic'});assert.ok(o.ok,o.error);
  const s=core.createBattle({format:'classic',playerDeck:o.cards,opponentDeck:o.cards,playerEnergyTypes:o.energyTypes,opponentEnergyTypes:o.energyTypes,seed:seed*117,firstSide:'player'});
  let step=0;while(s.phase!=='finished'&&step<1800){const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.phase==='setup'?s.setupSide:s.activeSide;const action=ai.chooseAction(s,side,'Advanced',step);assert.ok(action,'No AI action '+s.phase);core.applyAction(s,side,action);step++;}
  assert.equal(s.phase,'finished',`Match ${seed} stuck after ${step} actions`);
 }
});
