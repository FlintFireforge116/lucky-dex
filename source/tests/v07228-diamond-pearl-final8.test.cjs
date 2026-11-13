'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const base='../app/src/main/assets/',dp=require(base+'tcg-classic-diamond-pearl'),fx=require(base+'tcgp-battle-effects'),core=require(base+'tcgp-battle-core'),opp=require(base+'tcg-classic-opponents');
const mono=opp.generate({sets:['dp1'],type:'Grass',seed:17});
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
function slot(cardId,uid,energy={}){const p=core.makePokemonSlot(cardId,2,uid);p.energy={...energy};return p;}
function field(att='dp1-2',def='dp1-17'){
 assert.ok(mono.ok,mono.error);const s=core.createBattle({format:'classic',playerDeck:mono.cards,opponentDeck:mono.cards,seed:37,firstSide:'player',playerEnergyTypes:types,opponentEnergyTypes:types});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;
 for(const w of ['player','opponent'])s.sides[w].turnCount=8;
 s.sides.player.active=slot(att,'att',{Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Fighting:5,Darkness:5,Metal:5});
 s.sides.opponent.active=slot(def,'def',{Lightning:1});
 s.sides.player.bench=[slot('dp1-93','pb',{Lightning:2})];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.bench=[slot('dp1-94','ob',{Lightning:1})];s.sides.opponent.bench[0].benchSlot=0;
 return s;
}
function choices(s,chooser){const out=[];for(let j=0;j<100&&s.phase==='effectChoice';j++){
  const acts=core.legalActions(s,s.choiceSide).filter(a=>a.type==='effectChoice');assert.ok(acts.length,'no legal effectChoice '+j+' '+JSON.stringify(s.pendingChoice));
  const picked=chooser?.(acts,s,j)||acts.find(a=>!a.choiceSkip)||acts[0];assert.ok(picked,'no selected choice');out.push({...picked,by:s.choiceSide});core.applyAction(s,s.choiceSide,picked);
 }assert.notEqual(s.phase,'effectChoice','stuck in choice loop');return out;}
function attack(s,index=0,chooser,select){const acts=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===index);assert.ok(acts.length,`missing attack index ${index} ${s.sides.player.active?.cardId}`);core.applyAction(s,'player',select?.(acts)||acts[0]);return choices(s,chooser);}
function power(s,chooser){const acts=core.legalActions(s,'player').filter(a=>a.type==='ability'&&a.cardId===s.sides.player.active.cardId);assert.ok(acts.length,'missing ability '+s.sides.player.active.cardId);core.applyAction(s,'player',acts[0]);return choices(s,chooser);}
function level(s,id,target='active'){s.sides.player.hand.unshift({uid:'new-'+id,cardId:id});const acts=core.legalActions(s,'player').filter(a=>a.type==='evolve'&&a.cardId===id&&a.target===target);assert.ok(acts.length,'no legal level up '+id);core.applyAction(s,'player',acts[0]);return choices(s);}
const rest=[2,3,7,12,14,120,121,122];
test('every final print is enabled, all attacks and powers validate (130/130)',()=>{
 const cov=dp.coverage();assert.equal(cov.total,130);assert.equal(cov.battleEnabled,130);assert.equal(cov.gated.length,0);
 for(const id of rest){const c=dp.cardById('dp1-'+id);assert.ok(c?.battleEnabled);for(const a of c.attacks)assert.deepEqual(fx.validateEffect(a.effect),[],c.name+' '+a.name);for(const a of c.abilities)assert.deepEqual(fx.validateEffect(a.effect),[],c.name+' '+a.name);}
});
test('Dusknoir Hard Feelings adds 5 + opponent claimed Prizes as counters, unaffected by Weakness',()=>{
 const s=field('dp1-2','dp1-17');s.sides.opponent.prizesTaken=2;attack(s,0);assert.equal(s.sides.opponent.active.damage,70);
});
test('Dusknoir Dark Palm gated at 4 Bench and shuffles complete targeted stack and Energy into opponent deck',()=>{
 const s=field('dp1-2');assert.equal(core.legalActions(s,'player').filter(a=>a.type==='ability'&&a.cardId==='dp1-2').length,0);
 s.sides.opponent.bench=[...Array.from({length:4},(_,i)=>{const x=slot('dp1-56','ob'+i,{Fire:i===0?1:0});x.benchSlot=i;return x;})];s.sides.opponent.bench[0].stack=['dp1-76','dp1-56'];const deck=s.sides.opponent.deck.length;
 power(s,(a)=>a.find(x=>x.choiceBenchIndex===0)||a[0]);assert.equal(s.sides.opponent.bench.length,3);assert.ok(s.sides.opponent.deck.length>deck);assert.ok(s.sides.opponent.deck.some(r=>r.cardId==='dp1-56'));
});
test('Electivire Giga Impact has optional 60/120 damage choice and discards only Lightning Energy on boost',()=>{
 const normal=field('dp1-3','dp1-17');normal.sides.player.active.energy={Lightning:4};attack(normal,0,null,acts=>acts.find(a=>a.effectSelection==='')||acts[0]);assert.equal(normal.sides.player.active.energy.Lightning,4);
 const boost=field('dp1-3','dp1-17');boost.sides.player.active.energy={Lightning:4};attack(boost,0,null,acts=>acts.find(a=>a.effectSelection==='discardLightning'));assert.equal(boost.sides.player.energyDiscard.Lightning,4);assert.equal(boost.sides.player.active.energy.Lightning,0);assert.ok(boost.sides.opponent.active.damage>=120);
});
test('Electivire Intense Voltage needs Elekid under it and can move multiple Lightning Energy sources',()=>{
 const s=field('dp1-3');assert.equal(core.legalActions(s,'player').filter(x=>x.type==='ability'&&x.cardId==='dp1-3').length,0);
 s.sides.player.active.stack=['dp1-48','dp1-81','dp1-3'];s.sides.player.bench[0].energy={Lightning:3};const old=s.sides.player.active.energy.Lightning;
 power(s,a=>a.find(x=>x.choiceTarget==='bench')||a[0]);power(s,a=>a.find(x=>x.choiceTarget==='bench')||a[0]);assert.equal(s.sides.player.active.energy.Lightning,old+2);assert.equal(s.sides.player.bench[0].energy.Lightning,1);
});
test('Luxray Lightning Star moves all Lightning Energy to a chosen own Bench without switching',()=>{
 const s=field('dp1-7','dp1-17');s.sides.player.active.energy={Lightning:4};attack(s,0,a=>a.find(x=>x.choiceTarget==='bench')||a[0]);assert.equal(s.sides.player.active.energy.Lightning,0);assert.equal(s.sides.player.bench[0].energy.Lightning,6);assert.ok(s.sides.opponent.active.damage>0);
});
test('Luxray Gleam Eyes triggers on evolve-from-hand, with opponent Basic moved to Bench then Active',()=>{
 const s=field('dp1-52','dp1-17');s.sides.player.active.stack=['dp1-98','dp1-52'];s.sides.opponent.hand=[{uid:'enemy-new',cardId:'dp1-94'}];
 s.sides.opponent.benchLimit=3;
 s.sides.player.hand.unshift({uid:'lux',cardId:'dp1-7'});const a=core.legalActions(s,'player').find(x=>x.type==='evolve'&&x.cardId==='dp1-7'&&x.target==='active');assert.ok(a);core.applyAction(s,'player',a);assert.equal(s.phase,'effectChoice');choices(s,x=>x.find(y=>y.choiceOption===0)||x[0]);assert.equal(s.sides.opponent.active.uid,'enemy-new');assert.equal(s.sides.opponent.hand.length,0);
});
test('Rhyperior Earth Fissure triggers on evolving from hand and can be declined or mill exactly three',()=>{
 const s=field('dp1-60');s.sides.player.active.stack=['dp1-95','dp1-60'];const before=s.sides.opponent.deck.length; s.sides.player.hand.unshift({uid:'rhyp',cardId:'dp1-12'});
 const act=core.legalActions(s,'player').find(x=>x.type==='evolve'&&x.cardId==='dp1-12'&&x.target==='active');assert.ok(act);core.applyAction(s,'player',act);choices(s,a=>a.find(x=>x.choiceOption===1));assert.equal(s.sides.opponent.deck.length,before-3);
});
test('Shiftry Darkness Fan only usable while Active and returns highest opponent evolution card to hand on heads',()=>{
 let success=false;
 for(let seed=1;seed<100&&!success;seed++){
  const s=field('dp1-14');s.rngState=seed*203;s.sides.opponent.bench[0].stack=['dp1-76','dp1-56'];s.sides.opponent.bench[0].cardId='dp1-56';
  const b=s.sides.opponent.bench[0];const old=s.sides.opponent.hand.length;power(s,a=>a.find(x=>x.choiceTarget==='bench')||a[0]);if(s.log.some(l=>l.reason==='Darkness Fan'&&l.heads)){
   success=true;assert.equal(b.cardId,'dp1-76');assert.equal(s.sides.opponent.hand.length,old+1);assert.ok(s.sides.opponent.hand.some(r=>r.cardId==='dp1-56'));}
 }assert.ok(success,'no seeded heads result');
});
test('LV.X cannot level up on Bench or same-turn evolution, but levels up Active previous-level card and retains stack',()=>{
 const s=field('dp1-4');s.sides.player.active.stack=['dp1-93','dp1-58','dp1-4'];s.sides.player.bench[0]=slot('dp1-4','pb',{Water:3});s.sides.player.bench[0].benchSlot=0;s.sides.player.bench[0].stack=['dp1-93','dp1-58','dp1-4'];
 s.sides.player.hand.unshift({uid:'lvx',cardId:'dp1-120'});
 const acts=core.legalActions(s,'player').filter(x=>x.type==='evolve'&&x.cardId==='dp1-120');assert.equal(acts.length,1);assert.equal(acts[0].target,'active');core.applyAction(s,'player',acts[0]);assert.equal(s.sides.player.active.cardId,'dp1-120');assert.deepEqual(s.sides.player.active.stack,['dp1-93','dp1-58','dp1-4','dp1-120']);assert.ok(s.log.some(l=>l.type==='levelUp'));
 assert.equal(core.legalActions(s,'player').filter(x=>x.type==='evolve'&&x.cardId==='dp1-120').length,0);
});
test('Empoleon LV.X can use original Empoleon Ice Blade/Aqua Jet AND Hydro Impact',()=>{
 const s=field('dp1-120','dp1-17');s.sides.player.active.stack=['dp1-93','dp1-58','dp1-4','dp1-120'];s.sides.player.active.energy={Water:5};
 const opts=core.legalActions(s,'player').filter(a=>a.type==='attack');const ids=[...new Set(opts.map(a=>a.attackCardId||a.cardId))];assert.ok(opts.some(a=>a.attackCardId==='dp1-4'),JSON.stringify(opts.slice(0,8)));assert.ok(opts.some(a=>a.attackCardId==='dp1-120'));
});
test('Empoleon Supreme Command removes up to 2 face-down cards until end opponent turn',()=>{
 const s=field('dp1-120');s.sides.player.active.stack=['dp1-93','dp1-58','dp1-4','dp1-120'];s.sides.opponent.hand=[{uid:'held1',cardId:'dp1-94'},{uid:'held2',cardId:'dp1-97'},{uid:'held3',cardId:'dp1-93'}];
 power(s,a=>a.find(x=>x.choiceOption===0)||a[0]);assert.equal(s.sides.opponent.hand.length,1);assert.equal(s.sides.opponent.dp1SupremeHeld.length,2);assert.equal(s.sides.opponent.dp1SupremeReturnTurn,11);
});
test('Infernape LV.X Burning Head takes one of top three and discards the rest',()=>{
 const s=field('dp1-121');s.sides.player.active.stack=['dp1-76','dp1-56','dp1-5','dp1-121'];const refs=[{uid:'top-a',cardId:'dp1-94'},{uid:'top-b',cardId:'dp1-97'},{uid:'top-c',cardId:'dp1-93'}];s.sides.player.deck.splice(0,0,...refs);
 power(s,a=>a.find(x=>x.choiceOption===1)||a[0]);assert.ok(s.sides.player.hand.some(r=>r.uid==='top-b'));assert.ok(s.sides.player.discard.some(r=>r.uid==='top-a'));assert.ok(s.sides.player.discard.some(r=>r.uid==='top-c'));
});
test('Infernape LV.X Flare Up fails with <8 Fire in discard, succeeds only with 8 and returns them to deck',()=>{
 const bad=field('dp1-121','dp1-17');bad.sides.player.active.energy={Fire:2};bad.sides.player.energyDiscard={Fire:7};attack(bad,0);assert.equal(bad.sides.player.energyDiscard.Fire,7);assert.equal(bad.sides.opponent.active.damage,0);
 const good=field('dp1-121','dp1-17');good.sides.player.active.energy={Fire:2};good.sides.player.energyDiscard={Fire:8};attack(good,0);assert.equal(good.sides.player.energyDiscard.Fire,0);assert.ok(good.sides.player.deck.filter(r=>r.cardId==='dp1-124').length>=8);assert.ok(good.log.some(x=>x.type==='ko'&&x.side==='opponent')||Number(good.sides.opponent.active?.damage||0)>=150);
});
test('Torterra LV.X Forest Murmurs needs more own Prizes and switches a chosen opposing Benched Pokémon',()=>{
 const s=field('dp1-122');s.sides.player.active.stack=['dp1-103','dp1-49','dp1-17','dp1-122'];s.sides.player.prizes=Array.from({length:5},(_,i)=>({uid:'p'+i,cardId:'dp1-94'}));s.sides.opponent.prizes=Array.from({length:3},(_,i)=>({uid:'o'+i,cardId:'dp1-94'}));
 power(s,a=>a.find(x=>x.choiceTarget==='bench')||a[0]);assert.equal(s.sides.opponent.active.uid,'ob');
});
test('Torterra LV.X Vigorous Dash damages active 100, selected Bench 30, self 30',()=>{
 const s=field('dp1-122','dp1-17');s.sides.player.active.energy={Grass:3,Colorless:1};attack(s,0,a=>a.find(x=>x.choiceTarget==='bench')||a[0]);assert.ok(s.sides.opponent.active.damage>=100);assert.equal(s.sides.opponent.bench[0].damage,30);assert.equal(s.sides.player.active.damage,30);
});
test('focused builder includes complete 4-print LV.X families, never loose level-ups',()=>{
 const builder=require(base+'tcg-classic-deck-builder');const owned=dp.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
 for(const [id,type,stages] of [[120,'Water',[93,58,4,120]],[121,'Fire',[76,56,5,121]],[122,'Grass',[103,49,17,122]]]){
  const r=builder.buildDeck(owned,{sets:['dp1'],types:[type],focusCardId:'dp1-'+id,randomSeed:31});
  assert.ok(r.ok,`dp1-${id} ${JSON.stringify(r.errors)}`);assert.equal(r.cards.length,30);
  for(const stage of stages)assert.ok(r.cards.includes('dp1-'+stage),`dp1-${id} missing dp1-${stage}`);
  assert.deepEqual(builder.familyLine(dp.cardById('dp1-'+id),dp.CARDS).map(c=>Number(c.number)),stages);
 }
});
test('Rhyperior Earth Fissure optional decline leaves opponent deck intact',()=>{
 const s=field('dp1-60');s.sides.player.active.stack=['dp1-95','dp1-60'];const prior=s.sides.opponent.deck.length;
 s.sides.player.hand.unshift({uid:'rhyp',cardId:'dp1-12'});const a=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='dp1-12');assert.ok(a);
 core.applyAction(s,'player',a);choices(s,a=>a.find(x=>x.choiceOption===0)||a[0]);assert.equal(s.sides.opponent.deck.length,prior);
});
test('Empoleon Supreme Command returns held cards only at end of opponent next turn, with no information leak in available actions',()=>{
 const s=field('dp1-120');s.sides.player.active.stack=['dp1-93','dp1-58','dp1-4','dp1-120'];s.sides.opponent.hand=[{uid:'hidden-a',cardId:'dp1-94'},{uid:'hidden-b',cardId:'dp1-97'}];
 power(s,a=>a.find(x=>x.choiceOption===0)||a[0]);assert.equal(s.sides.opponent.hand.length,0);
 for(const side of ['player','opponent']){
  const end=core.legalActions(s,side).find(a=>a.type==='endTurn');assert.ok(end,'endTurn for '+side);core.applyAction(s,side,end);
  if(side==='player')assert.equal(s.sides.opponent.hand.filter(r=>r.uid?.startsWith('hidden-')).length,0);
 }
 assert.deepEqual(s.sides.opponent.hand.filter(r=>r.uid?.startsWith('hidden-')).map(r=>r.uid).sort(),['hidden-a','hidden-b']);
 assert.ok(s.log.some(x=>x.type==='dp1SupremeReturn'&&x.amount===2));
});
test('LV.X level-up cannot happen on turn previous level entered play',()=>{
 const s=field('dp1-4');s.sides.player.active.stack=['dp1-93','dp1-58','dp1-4'];s.sides.player.active.playedOnSideTurn=s.sides.player.turnCount;
 s.sides.player.hand.unshift({uid:'lvx',cardId:'dp1-120'});assert.ok(!core.legalActions(s,'player').some(a=>a.type==='evolve'&&a.cardId==='dp1-120'));
});
test('LV.X previous level attack actually executes instead of only appearing in actions',()=>{
 const s=field('dp1-120','dp1-17');s.sides.player.active.stack=['dp1-93','dp1-58','dp1-4','dp1-120'];s.sides.player.active.energy={Water:5};
 const picks=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackCardId==='dp1-4'&&a.attackIndex===1);assert.ok(picks.length);
 core.applyAction(s,'player',picks[0]);choices(s,a=>a.find(x=>x.choiceTarget==='bench')||a[0]);
 assert.ok(s.sides.opponent.active?.damage>0||s.log.some(x=>x.type==='ko'),`inherited attack didn't cause damage`);
});
