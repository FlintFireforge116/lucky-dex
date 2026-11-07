'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const aqua=require(path.join(A,'tcg-classic-aquapolis.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const fx=require(path.join(A,'tcgp-battle-effects.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const ai=require(path.join(A,'tcgp-battle-ai.js'));
const C=n=>classic.cardById('ecard2-'+n);
function field(seed=47){const deck=opponents.generate({sets:['ecard2'],seed});assert.ok(deck.ok,deck.error);const s=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,playerEnergyTypes:['Water','Fire','Grass','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Water','Fire','Grass','Lightning','Psychic','Fighting','Darkness','Metal'],seed,firstSide:'player'});s.phase='battle';s.activeSide='player';s.turnNumber=7;s.sides.player.turnCount=4;s.sides.opponent.turnCount=3;return s;}
function make(id,uid){return core.makePokemonSlot('ecard2-'+id,4,uid||'slot'+id);}
function ctx(s,action={},random=()=>0.1){return {...core.effectContext(s,'player',action,s.sides.player.active),random};}
test('Aquapolis completion has 182 distinct battle-enabled prints with supported rules',()=>{
 assert.equal(aqua.coverage().total,182);assert.equal(aqua.coverage().battleEnabled,182);assert.deepEqual(aqua.coverage().partial,[]);
 for(const c of aqua.CARDS){assert.equal(c.deckEligible,true,c.id);for(const e of [...(c.attacks||[]),...(c.abilities||[])])assert.ok(fx.supportsEffect(e.effect),`${c.id} ${e.name}`);if(c.technicalMachine)assert.ok(c.attacks.length,`TM ${c.id}`);}
 for(const id of [148,149,150,144,145,146,147,118,125,128,131,134,135,138,139,141])assert.equal(C(id).battleEnabled,true);
 for(const [h,standard] of [[2,2],[11,15],[14,19],[25,37]])assert.equal(C('H'+h).attacks[0].name,C(standard).attacks[0].name);
});
test('Rainbow is ONE flexible Energy and causes 10 damage when attached from hand',()=>{
 const s=field();const p=s.sides.player;p.active=make(148,'kingdra');p.hand=[{uid:'rainbow',cardId:'ecard2-144'}];p.energyUsed=true;
 const act=core.legalActions(s,'player').find(a=>a.type==='attachSpecial'&&a.cardId==='ecard2-144'&&a.target==='active');assert.ok(act);
 core.applyAction(s,'player',act);assert.equal(p.active.damage,10);assert.equal(p.active.specialEnergy.length,1);
 const supplied=core.effectiveEnergy(s,'player',p.active);assert.equal(supplied.Miracle,1);assert.equal(fx.totalEnergy(supplied),1);assert.ok(fx.canPayCost(supplied,'W'));assert.ok(fx.canPayCost(supplied,'L'));assert.equal(fx.canPayCost(supplied,'WL'),false);
});
test('Crystal Energy only supplies a matching attached Basic type, never arbitrary types',()=>{
 const s=field();const p=s.sides.player;p.active=make(148);p.active.energy={Water:1};p.active.specialEnergy=[{uid:'c',cardId:'ecard2-146'}];
 let energy=core.effectiveEnergy(s,'player',p.active);assert.equal(fx.totalEnergy(energy),2);assert.ok(fx.canPayCost(energy,'WW'));assert.equal(fx.canPayCost(energy,'WR'),false);
 p.active.energy={Water:1,Fire:1};energy=core.effectiveEnergy(s,'player',p.active);assert.equal(fx.totalEnergy(energy),3);assert.ok(fx.canPayCost(energy,'WWR'));assert.ok(fx.canPayCost(energy,'WRR'));assert.equal(fx.canPayCost(energy,'WRRL'),false);
});
test('Boost Energy is Evolved-only, supplies three Colorless, forbids retreat and expires',()=>{
 const s=field();const p=s.sides.player;p.active=make(148,'kingdra');const b=make(70,'chinchou');b.benchSlot=0;p.bench=[b];p.hand=[{uid:'boost',cardId:'ecard2-145'}];
 const avail=core.legalActions(s,'player').filter(x=>x.type==='attachSpecial'&&x.cardId==='ecard2-145');assert.ok(avail.some(x=>x.target==='active'));assert.ok(!avail.some(x=>x.target==='bench'));
 core.applyAction(s,'player',avail.find(x=>x.target==='active'));assert.equal(core.effectiveEnergy(s,'player',p.active).Colorless,3);
 assert.ok(!core.legalActions(s,'player').some(x=>x.type==='retreat'));
 core.endTurn(s);assert.ok(!p.active.specialEnergy.some(r=>r.cardId==='ecard2-145'));assert.ok(p.discard.some(r=>r.cardId==='ecard2-145'));
});
test('Crystal Type changes with a matching Energy attached FROM HAND, not Zone',()=>{
 const s=field(),p=s.sides.player;p.active=make(149,'lugia');p.hand=[{uid:'fire',cardId:'ecard1-161'}];
 const action=core.legalActions(s,'player').find(x=>x.type==='attachSpecial'&&x.cardId==='ecard1-161'&&x.target==='active');assert.ok(action);
 core.applyAction(s,'player',action);assert.deepEqual(fx.effectiveTypes(s,'player',p.active,classic.cardById),['Fire']);
 assert.equal(p.active.typeOverride.expiresTurn,s.turnNumber);
});
test('Fire Blow options discard exactly selected Fire and calculate coin damage',()=>{
 const s=field(),p=s.sides.player;p.active=make(2);p.active.energy={Fire:3};s.sides.opponent.active=make(117);
 const e=C(2).attacks[0].effect,choices=fx.choicesForEffect(e,{...ctx(s),isAttack:true,attack:C(2).attacks[0]});assert.ok(choices.some(x=>x.effectSelection==='2'));
 const result=fx.resolveAttack(C(2).attacks[0],ctx(s,{effectSelection:'2'}));assert.equal(result.damage,90);assert.equal(p.active.energy.Fire,1);assert.equal(p.energyDiscard.Fire,2);
});
test('Exeggutor Super Eggsplosion allows choosing the actual source Energy',()=>{
 const s=field(),p=s.sides.player;p.active=make(12,'egg');p.active.energy={Grass:1};const b=make(76,'exeggcute');b.benchSlot=0;b.energy={Water:1};p.bench=[b];
 const opts=fx.choicesForEffect(C(12).attacks[0].effect,{...ctx(s),isAttack:true,attack:C(12).attacks[0]});const choice=opts.find(x=>x.effectSelection==='exeggcute~Water');assert.ok(choice);
 const out=fx.resolveAttack(C(12).attacks[0],ctx(s,{effectSelection:choice.effectSelection}));assert.equal(out.damage,40);assert.equal(b.energy.Water,0);assert.equal(p.active.energy.Grass,1);
});
test('Dark Impact is an actual ability lock and Dark Moon requires an opponent-hand choice',()=>{
 const s=field(),p=s.sides.player;p.active=make(15,'houndoom');s.sides.opponent.active=make(16,'hypno');fx.applyEffect(C(15).attacks[1].effect,ctx(s));assert.ok(s.sides.opponent.active.neoDestinyPowerLockUntil>=s.turnNumber+1);
 p.active=make(41,'umbreon');p.active.energy={Darkness:1};const prompts=[];fx.applyEffect(C(41).abilities[0].effect,{...ctx(s),requestChoice:x=>prompts.push(x)});assert.ok(prompts.length);assert.equal(prompts[0].kind,'opponentHandCard');
});
test('Healing Berry heals at 20 or less HP and is discarded between turns',()=>{
 const s=field(),p=s.sides.player;p.active=make(69);p.active.damage=80;p.active.tool={uid:'berry',cardId:'ecard2-125'};core.endTurn(s);
 assert.equal(p.active.damage,50);assert.ok(p.discard.some(r=>r.cardId==='ecard2-125'));assert.equal(p.active.tool,null);
});
test('Aquapolis Stadiums grant one choice action per turn and remain set-legal',()=>{
 const s=field(),p=s.sides.player;p.active=make(69);p.hand=[{uid:'plant',cardId:'ecard2-139'},{uid:'energy',cardId:'ecard1-161'}];p.discard=[{uid:'discardE',cardId:'ecard1-162'}];
 s.stadium={uid:'stadium',cardId:'ecard2-139',ownerSide:'player'};
 const acts=core.legalActions(s,'player').filter(x=>x.type==='stadiumAction');assert.equal(acts.length,1);
 core.applyAction(s,'player',acts[0]);assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.kind,'handCard');
});
test('Aquapolis CPU decks generate and AI can advance with the complete set',()=>{
 for(const seed of [13,49,91]){
  const r=opponents.generate({sets:['ecard2'],seed});assert.ok(r.ok,r.error);assert.equal(r.cards.length,30);assert.equal(classic.validateDeck(r.cards).ok,true);
  const s=core.createBattle({format:'classic',playerDeck:r.cards,opponentDeck:r.cards,playerEnergyTypes:['Water','Grass','Fire','Lightning','Fighting','Psychic','Darkness','Metal'],opponentEnergyTypes:['Water','Grass','Fire','Lightning','Fighting','Psychic','Darkness','Metal'],seed,firstSide:'player'});
  let steps=0;for(;steps<110&&!['complete','finished','gameOver'].includes(s.phase);steps++){const side=s.choiceSide||s.activeSide||'player',act=ai.chooseAction(s,side);if(!act)break;core.applyAction(s,side,act);}assert.ok(steps>15,`seed ${seed}: ${steps}`);
 }
});
test('Android, JavaScript and both visible version labels always agree',()=>{
 const gradle=fs.readFileSync(path.resolve(A,'../../../build.gradle'),'utf8'),html=fs.readFileSync(path.join(A,'index.html'),'utf8'),js=fs.readFileSync(path.join(A,'app-v0167.js'),'utf8');
 const version=/versionName '([^']+)'/.exec(gradle)?.[1],code=Number(/versionCode (\d+)/.exec(gradle)?.[1]);
 assert.match(version||'',/^0\.69\.\d+$/);
 assert.equal(code,6980+Number(version.split('.').at(-1)),'versionCode sequence must stay in sync');
 assert.ok(js.includes("window.__LUCKYDEX_BUILD='"+version+"'"));
 assert.equal(html.split('v'+version).length-1,2);
});
test('Weakness Guard removes weakness until end of opponent turn, then expires',()=>{
 const s=field(),p=s.sides.player,foe=s.sides.opponent;p.active=make(69);foe.active=make(91);p.hand=[{uid:'guard',cardId:'ecard2-141'}];
 const action=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='ecard2-141'&&a.target==='active');assert.ok(action);
 core.applyAction(s,'player',action);assert.ok(p.active.weaknessGuard);
 core.endTurn(s);assert.ok(p.active.tool?.cardId==='ecard2-141');
 s.phase='battle';s.activeSide='opponent';s.turnNumber++;core.endTurn(s);
 assert.equal(p.active.tool,null);assert.ok(p.discard.some(r=>r.cardId==='ecard2-141'));assert.ok(!p.active.weaknessGuard);
});
test('Time Shard offers optional selected basic Energy during a real opposing attack KO',()=>{
 const s=field(),p=s.sides.player,opp=s.sides.opponent;
 p.active=make(69,'chansey');p.active.damage=90;p.active.energy={Water:1,Grass:1};p.active.tool={uid:'shard',cardId:'ecard2-135'};
 opp.active=make(69,'foe');opp.active.energy={Colorless:3};
 s.activeSide='opponent';s.turnNumber=8;
 // KO through an attack rather than directly modifying hit points, to
 // exercise the same resume flow as the in-app CPU.
 const choices=core.legalActions(s,'opponent').filter(a=>a.type==='attack');
 const slam=choices.find(a=>a.attackIndex===1);assert.ok(slam);
 core.applyAction(s,'opponent',slam);
 assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.effect.rule,'aquapolis:timeShardRescue');
 const actions=core.legalActions(s,'player');assert.ok(actions.some(x=>x.choiceOption===0));
 const selected=actions.find(x=>x.choiceOption>0);assert.ok(selected);
 core.applyAction(s,'player',selected);
 assert.equal(s.phase,'effectChoice');
 const skip=core.legalActions(s,'player').find(x=>x.choiceOption===0);assert.ok(skip);
 core.applyAction(s,'player',skip);
 assert.ok(p.hand.some(ref=>classic.cardById(ref.cardId)?.basicEnergy));
});
test('Warp Energy attached from hand offers switching the Active Pokémon',()=>{
 const s=field(),p=s.sides.player;p.active=make(69,'active');const b=make(70,'bench');b.benchSlot=0;p.bench=[b];p.hand=[{uid:'warp',cardId:'ecard2-147'}];
 const attach=core.legalActions(s,'player').find(a=>a.type==='attachSpecial'&&a.cardId==='ecard2-147'&&a.target==='active');assert.ok(attach);
 core.applyAction(s,'player',attach);
 assert.equal(p.active.specialEnergy.length,1);assert.equal(s.phase,'effectChoice');
 const move=core.legalActions(s,'player').find(a=>a.choiceBenchIndex===0);assert.ok(move);
 core.applyAction(s,'player',move);assert.equal(p.active.cardId,'ecard2-70');
});
test('Memory Berry offers previous Evolution attacks and expires when used',()=>{
 const s=field(),p=s.sides.player;p.active=make(2,'arcanine');p.active.stack=['ecard2-51','ecard2-2'];p.active.energy={Colorless:2,Fire:1};p.active.tool={uid:'mem',cardId:'ecard2-128'};
 const options=core.attackOptions(s,'player');assert.ok(options.some(o=>o.previous&&o.cardId==='ecard2-51'));
 const oldMove=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackCardId==='ecard2-51');assert.ok(oldMove);
 core.applyAction(s,'player',oldMove);
 assert.equal(p.active.tool,null);assert.ok(p.discard.some(r=>r.cardId==='ecard2-128'));
});
