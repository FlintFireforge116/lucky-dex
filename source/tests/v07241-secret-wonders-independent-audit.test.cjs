'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const set=require('../app/src/main/assets/tcg-classic-secret-wonders');
const data=require('../app/src/main/assets/tcg-classic-battle-data');
const core=require('../app/src/main/assets/tcgp-battle-core');
const opp=require('../app/src/main/assets/tcg-classic-opponents');
const ui=require('../app/src/main/assets/tcgp-battle-ui');
const loan=opp.generate({sets:['dp2'],type:'Grass',seed:17});assert.ok(loan.ok);
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const ref=(cardId,uid)=>({cardId,uid:uid||cardId+'-ref'});
function slot(id,uid,energy={}){const s=core.makePokemonSlot(id,2,uid||id+'-slot');s.energy=energy;return s;}
function board(card='dp3-29',opponent='dp3-18',side='player',seed=23){
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed,firstSide:side,playerEnergyTypes:types,opponentEnergyTypes:types});
 s.phase='battle';s.activeSide=side;s.turnNumber=10;
 for(const who of ['player','opponent']){s.sides[who].turnCount=7;s.sides[who].hand=[];s.sides[who].bench=[];}
 const foe=side==='player'?'opponent':'player';
 s.sides[side].active=slot(card,side+'-a',{Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Darkness:4,Metal:4});
 s.sides[foe].active=slot(opponent,foe+'-a');return s;
}
function attack(s,index=0,side='player'){
 const a=core.legalActions(s,side).find(x=>x.type==='attack'&&x.attackIndex===index);
 assert.ok(a,'Attack not available '+JSON.stringify(core.legalActions(s,side).filter(x=>x.type==='attack')));
 core.applyAction(s,side,a);return a;
}
function pick(s,fn){assert.equal(s.phase,'effectChoice');const list=core.legalActions(s,s.choiceSide).filter(x=>x.type==='effectChoice');const a=fn(list);assert.ok(a,'No matching option '+JSON.stringify(list));core.applyAction(s,s.choiceSide,a);return a;}
function finish(s){for(let n=0;n<50&&s.phase==='effectChoice';n++)pick(s,list=>list.find(x=>x.choiceSkip)||list[0]);assert.notEqual(s.phase,'effectChoice','Unresolved choice');}
function selectUI(s){const actions=core.legalActions(s,s.choiceSide);ui._test.setCurrentBattleForTests(s,actions);return {actions,models:actions.map((a,i)=>ui._test.choiceCardModel(a,i))};}

test('132 Secret Wonders prints have the full expected attack and ability counts and valid image ID',()=>{
 assert.equal(set.CARDS.length,132);const cats={pokemon:0,trainer:0,energy:0,attacks:0,abilities:0};
 for(const c of set.CARDS){cats[c.kind]++;cats.attacks+=(c.attacks||[]).length;cats.abilities+=(c.abilities||[]).length;
  assert.equal(c.id,'dp3-'+c.number);assert.ok(c.battleEnabled,c.id);assert.match(c.image,/dp3\//);}
 assert.deepEqual(cats,{pokemon:120,trainer:10,energy:2,attacks:194,abilities:45});
});

test('Dusk Ball bottom-seven options display ACTUAL individual cards, not label-only tiles',()=>{
 const s=board('dp3-82');s.sides.player.deck=[ref('dp3-76','bagon'),ref('dp3-82','char'),ref('dp3-55','milk')];
 s.sides.player.hand=[ref('dp2-110','dusk')];
 const action=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='dp2-110');assert.ok(action);
 core.applyAction(s,'player',action);assert.equal(s.phase,'effectChoice');
 const {actions,models}=selectUI(s);
 for(let i=0;i<actions.length;i++)if(!actions[i].choiceSkip){
  assert.equal(models[i].cardId,actions[i].choiceCardId);assert.ok(models[i].art,JSON.stringify(models[i]));
  assert.match(ui._test.choiceCardTileHtml(actions[i],i),/<img\s/);
  assert.doesNotMatch(ui._test.choiceCardTileHtml(actions[i],i),/text-option/);
 }
 assert.deepEqual(new Set(models.filter(x=>x.cardId).map(x=>x.cardId)),new Set(['dp3-76','dp3-82','dp3-55']));
 pick(s,list=>list.find(x=>x.choiceCardId==='dp3-55'));
 assert.ok(s.sides.player.hand.some(x=>x.cardId==='dp3-55'));
});

test('hidden Prize choices and unknown opponent hand choices never reveal card fronts',()=>{
 const s=board('dp3-82');s.phase='effectChoice';s.choiceSide='player';s.pendingChoice={kind:'option',originSide:'player',options:['Take unknown face-down Prize 1']};
 s.sides.player.deck=[ref('dp3-55','milk')];ui._test.setCurrentBattleForTests(s,[]);
 const model=ui._test.choiceCardModel({type:'effectChoice',choiceLabel:'Take unknown face-down Prize 1'},0);
 assert.equal(model.art,'');
 s.pendingChoice={kind:'option',originSide:'player',options:['Guess hidden Miltank in opponent hand']};
 s.sides.player.deck=[];s.sides.opponent.hand=[ref('dp3-55','hidden')];
 assert.equal(ui._test.choiceCardModel({choiceLabel:'Guess hidden Miltank in opponent hand'},0).art,'');
});

test('Furret Baton Pass transfers only chosen Energy and may stop with energy remaining',()=>{
 const s=board('dp3-27');s.sides.player.active.energy={Grass:2,Fire:1};
 const b=slot('dp3-82','bench');b.benchSlot=0;s.sides.player.bench=[b];
 attack(s,1);assert.equal(s.phase,'effectChoice');
 pick(s,a=>a.find(x=>x.choiceTarget==='bench'));
 assert.equal(s.phase,'effectChoice');
 const {actions,models}=selectUI(s);assert.ok(models.some(x=>x.cardId&&x.art));
 pick(s,a=>a.find(x=>x.choiceLabel?.includes('Grass')));
 assert.equal(s.sides.player.active.uid,'bench');
 assert.equal(b.energy.Grass,1);
 pick(s,a=>a.find(x=>x.choiceSkip));finish(s);
 assert.equal(s.sides.player.active.energy.Grass,1);
 const old=s.sides.player.bench.find(x=>x.uid==='player-a');assert.ok(old);assert.equal(old.energy.Grass,1);assert.equal(old.energy.Fire,1);
});

test('Furret can decline Baton Pass, leaving all Energy untouched',()=>{
 const s=board('dp3-27');s.sides.player.active.energy={Water:3};const b=slot('dp3-82','b');b.benchSlot=0;s.sides.player.bench=[b];
 attack(s,1);pick(s,a=>a.find(x=>x.choiceSkip));finish(s);
 assert.equal(s.sides.player.active.uid,'player-a');assert.equal(s.sides.player.active.energy.Water,3);
});

test('Nidoking Poison Rub gives ATTACKER the optional switch before applying 20 and Poison',()=>{
 const s=board('dp3-34','dp3-82');const b=slot('dp3-76','bench');b.benchSlot=0;s.sides.opponent.bench=[b];
 attack(s);assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'player');
 pick(s,a=>a.find(x=>x.choiceTarget==='bench'));
 assert.equal(s.sides.opponent.active.uid,'bench');
 assert.equal(s.sides.opponent.active.damage,30,'20 attack damage plus 10 Poison at turn change');
 assert.ok(s.sides.opponent.active.conditions.poison);
 assert.equal(s.sides.opponent.bench[0].damage,0);
});

test('Nidoking Poison Rub decline damages and Poisons original defender',()=>{
 const s=board('dp3-34','dp3-82');const b=slot('dp3-76','bench');b.benchSlot=0;s.sides.opponent.bench=[b];
 attack(s);pick(s,a=>a.find(x=>x.choiceSkip));
 assert.equal(s.sides.opponent.active.uid,'opponent-a');assert.equal(s.sides.opponent.active.damage,30,'20 attack damage plus 10 Poison at turn change');
 assert.ok(s.sides.opponent.active.conditions.poison);
});

test('Golem Double Throw selects two DIFFERENT Pokémon and respects active Resistance',()=>{
 const s=board('dp3-29','dp3-18');const b=slot('dp3-82','bench');b.benchSlot=0;s.sides.opponent.bench=[b];
 attack(s);assert.equal(s.phase,'effectChoice');
 pick(s,a=>a.find(x=>x.choiceTarget==='active'));
 assert.equal(s.phase,'effectChoice');
 const available=core.legalActions(s,s.choiceSide).filter(x=>x.type==='effectChoice');
 assert.ok(available.every(x=>x.choiceTarget!=='active'),'The first target was allowed again');
 pick(s,a=>a.find(x=>x.choiceTarget==='bench'));finish(s);
 assert.equal(s.sides.opponent.active.damage,10,'Salamence Fighting resistance -20');
 assert.equal(b.damage,30,'Benched damage ignores Weakness/Resistance');
});

test('Jumpluff Cottonweed Punch damage against Active correctly applies Resistance',()=>{
 let exercised=0;for(let seed=1;seed<30;seed++){
  const s=board('dp3-11','neo1-13','player',seed);attack(s);const roll=s.log.find(x=>x.reason==='Cottonweed Punch');assert.ok(roll);
  if(!roll.heads)continue;exercised++;pick(s,a=>a.find(x=>x.choiceTarget==='active'));
  assert.equal(s.sides.opponent.active.damage,Math.max(0,roll.heads*30-30),'Grass resistance -30');finish(s);
 }assert.ok(exercised>5);
});

test('Xatu Energy Singe damage uses Resistance for Active and raw Bench damage',()=>{
 const s=board('dp3-44','dp3-18');s.sides.opponent.active.energy={Water:2};
 const b=slot('dp3-82','bench',{Fire:1});b.benchSlot=0;s.sides.opponent.bench=[b];
 attack(s,0);pick(s,a=>a.find(x=>x.choiceTarget==='active'));assert.equal(s.sides.opponent.active.damage,40);
 const t=board('dp3-44','dp3-18');const b2=slot('dp3-82','b2',{Fire:1});b2.benchSlot=0;t.sides.opponent.bench=[b2];
 attack(t,0);pick(t,a=>a.find(x=>x.choiceTarget==='bench'));assert.equal(b2.damage,30);
});

test('Card-choice rules carry exact print IDs for bottom-seven, deck and discard picks',()=>{
 const text=fs.readFileSync(path.resolve(__dirname,'../app/src/main/assets/tcgp-battle-effects.js'),'utf8');
 for(const part of ["' from bottom seven'",'optionCardIds:eligible.map(ref=>ref.cardId)','optionCardIds:cards.map(x=>x.kind'])assert.ok(text.includes(part),part);
 assert.match(text,/29:doubleThrow/);assert.match(text,/excludeUids:exclude/);
});

test('Bebe’s Search reprint offers the exact printed Pokémon from deck',()=>{
 const s=board('dp3-82');s.sides.player.hand=[ref('dp3-119','bebe'),ref('dp3-123','rowan')];
 s.sides.player.deck=[ref('dp3-76','bagon'),ref('dp3-55','miltank')];
 const action=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='dp3-119');assert.ok(action);
 core.applyAction(s,'player',action);
 pick(s,a=>a.find(x=>x.choiceCardId==='dp3-123'));
 const {actions,models}=selectUI(s);
 assert.ok(actions.some(x=>x.choiceCardId==='dp3-55'));
 assert.ok(actions.some(x=>x.choiceCardId==='dp3-76'));
 for(let i=0;i<actions.length;i++)if(actions[i].choiceCardId)assert.ok(models[i].art);
 pick(s,a=>a.find(x=>x.choiceCardId==='dp3-55'));
 assert.ok(s.sides.player.hand.some(x=>x.uid==='miltank'));
});

test('Night Maintenance reprint displays physical Pokémon, Basic Energy and Energy Zone artwork',()=>{
 const s=board('dp3-82');s.sides.player.hand=[ref('dp3-120','night')];
 s.sides.player.discard=[ref('dp3-76','bagon'),ref('neo1-111','water'),ref('dp3-127','potion')];
 s.sides.player.energyDiscard={Fire:1};
 const action=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='dp3-120');assert.ok(action);
 core.applyAction(s,'player',action);const {actions,models}=selectUI(s);
 for(const cardId of ['dp3-76','neo1-111']){
  const i=actions.findIndex(a=>a.choiceCardId===cardId);assert.ok(i>=0,cardId);assert.ok(models[i].art,cardId);
 }
 const virtual=actions.findIndex(a=>a.choiceLabel?.includes('Fire Basic Energy'));
 assert.ok(virtual>=0);assert.ok(models[virtual].art,'Energy Zone option should have real Basic Fire art');
 assert.ok(!actions.some(a=>a.choiceCardId==='dp3-127'));
});

test('Rival reprint gives opponent actual visible top-deck prints to choose among',()=>{
 const s=board('dp3-82');s.sides.player.hand=[ref('dp3-124','rival')];
 s.sides.player.deck=[ref('dp3-76','bagon'),ref('dp3-55','milk'),ref('dp3-82','charm'),ref('dp3-83','clefairy'),ref('dp3-85','diglett'),ref('dp3-86','beyond')];
 const action=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='dp3-124');assert.ok(action);
 core.applyAction(s,'player',action);assert.equal(s.choiceSide,'opponent');
 const actions=core.legalActions(s,'opponent').filter(a=>a.type==='effectChoice');
 ui._test.setCurrentBattleForTests(s,actions);
 for(let i=0;i<actions.length;i++)assert.ok(ui._test.choiceCardModel(actions[i],i).art);
 assert.deepEqual(new Set(actions.map(a=>a.choiceCardId)),new Set(['dp3-76','dp3-55','dp3-82','dp3-83','dp3-85']));
});

test('Gardevoir LV.X Bring Down ties show both eligible real Pokémon prints',()=>{
 const s=board('dp3-131','dp3-82');
 const b=slot('dp3-76','my-bagon');b.benchSlot=0;s.sides.player.bench=[b];
 attack(s);assert.equal(s.phase,'effectChoice');
 const {actions,models}=selectUI(s);
 assert.ok(actions.some(a=>a.choiceCardId==='dp3-82'));
 assert.ok(actions.some(a=>a.choiceCardId==='dp3-76'));
 assert.ok(models.filter(m=>m.cardId).every(m=>m.art));
});
