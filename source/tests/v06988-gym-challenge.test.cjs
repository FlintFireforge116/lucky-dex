'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const a=path.resolve(__dirname,'../app/src/main/assets'),G=require(path.join(a,'tcg-classic-gym-challenge.js')),D=require(path.join(a,'tcg-classic-battle-data.js')),O=require(path.join(a,'tcg-classic-opponents.js')),B=require(path.join(a,'tcg-classic-deck-builder.js')),Core=require(path.join(a,'tcgp-battle-core.js')),Decks=require(path.join(a,'tcg-classic-decks.js')),FX=require(path.join(a,'tcgp-battle-effects.js'));
function state(seed=881){const s=Core.createBattle({format:'classic',playerDeck:Decks.LOANER_DECK,opponentDeck:Decks.LOANER_DECK,seed,playerEnergyTypes:['Fire','Psychic'],opponentEnergyTypes:['Fire','Psychic']});s.phase='battle';s.activeSide='player';s.turnNumber=12;s.sides.player.turnCount=6;s.sides.opponent.turnCount=5;s.sides.player.attackUsed=false;return s;}
function act(s,id,energy,opponent='gym2-67'){const ss=s.sides.player,os=s.sides.opponent;ss.active=Core.makePokemonSlot(id,0,'own');ss.active.energy={...energy};os.active=Core.makePokemonSlot(opponent,0,'foe');os.active.energy={Fighting:1};os.bench=[Core.makePokemonSlot('gym2-84',1,'foebench')];os.bench[0].benchSlot=0;s.phase='battle';s.activeSide='player';return s;}
function attack(s,name){const actions=Core.legalActions(s,'player');const action=actions.find(x=>x.type==='attack'&&x.attackName===name)||actions.find(x=>x.type==='attack'&&D.cardById(s.sides.player.active.cardId).attacks[x.attackIndex]?.name===name);assert.ok(action,`missing attack ${name}: ${JSON.stringify(actions.filter(a=>a.type==='attack'))}`);Core.applyAction(s,'player',action);}
test('Gym Challenge all prints indexed, no Basic Energy in 30-card deck',()=>{
 assert.equal(G.CARDS.length,132);assert.equal(new Set(G.CARDS.map(c=>c.id)).size,132);assert.equal(G.CARDS.filter(c=>c.basicEnergy).length,6);
 assert.ok(G.CARDS.filter(c=>!c.basicEnergy&&c.battleEnabled).length>=49);
 assert.ok(G.CARDS.filter(c=>!c.battleEnabled).every(c=>!c.deckEligible));
 for(const card of G.CARDS.filter(c=>c.battleEnabled)){for(const attack of card.attacks||[])assert.ok(FX.supportsEffect(attack.effect),`${card.id}: ${attack.name}`);if(card.kind==='trainer')assert.ok(FX.supportsEffect(card.effect),card.id);}
 assert.equal(D.cardById('gym2-14').name,"Rocket's Mewtwo");assert.equal(D.cardById('gym2-2').name,"Blaine's Charizard");
 assert.ok(D.SETS.some(s=>s.id==='gym2'));assert.ok(D.cardById('gym1-1'));
});
test('Gym Challenge cards with incomplete forced-switch sequences stay view-only',()=>{
 assert.equal(G.cardById('gym2-126').battleEnabled,false);
 assert.equal(G.cardById('gym2-126').deckEligible,false);
});
test('Star Boomerang and Fade Out return generated Basic and Special Energy to hand',()=>{
 for(const [id,move,energy,seed] of [['gym2-92','Star Boomerang',{Water:1},882],['gym2-96','Fade Out',{Psychic:2},881]]){
  const s=act(state(seed),id,energy,'gym2-67');
  s.sides.player.hand=[];s.sides.player.active.specialEnergy=[{uid:'dce',cardId:'base1-96'}];
  attack(s,move);
  const hand=s.sides.player.hand.map(c=>c.cardId);
  assert.ok(hand.includes(id),`${move} should return the Pokémon`);
  assert.ok(hand.includes('base1-96'),`${move} should return Double Colorless Energy`);
  const energyId=id==='gym2-92'?'gym1-132':'gym1-131';
  assert.equal(hand.filter(x=>x===energyId).length,Object.values(energy)[0],`${move} should return Basic Energy`);
 }
});
test('Gym Challenge physical G2 identity projects owned copies, without mixing Gym Heroes',()=>{
 const p=D.projectOwnedCards([
  {id:'G2-1',setId:'library:G2',source:'tcg',count:2,number:'1'},
  {id:'gym2-2',setId:'gym2',source:'tcg',count:1,number:'2/132'},
  {id:'G1-1',setId:'library:G1',source:'tcg',count:3,number:'1'}]);
 assert.equal(p.find(c=>c.gameplayId==='gym2-1')?.quantity,2);
 assert.equal(p.find(c=>c.gameplayId==='gym2-2')?.quantity,1);
 assert.equal(p.find(c=>c.gameplayId==='gym1-1')?.quantity,3);
});
test('Gym Challenge-only generated decks are legal and can include cross-set evolutions when mixed',()=>{
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Colorless']){
  const cpu=O.generate({seed:8800,sets:['gym2'],type,includeColorless:true});assert.ok(cpu.ok,`${type}: ${cpu.error}`);
  assert.equal(cpu.cards.length,30);assert.equal(D.validateDeck(cpu.cards).ok,true);
  assert.ok(cpu.cards.every(id=>id.startsWith('gym2-')));
 }
 const own=D.CARDS.filter(c=>c.battleEnabled&&c.deckEligible).map(c=>({gameplayId:c.id,quantity:4}));
 const auto=B.buildDeck(own,{sets:['gym1','gym2'],types:['Fire'],focusCardId:'gym2-2',style:'competitive'});
 assert.ok(auto.ok,JSON.stringify(auto.errors));assert.ok(auto.cards.includes('gym2-2'));
 assert.ok(auto.cards.some(id=>D.cardById(id)?.name==="Blaine's Charmeleon"));
 assert.ok(auto.cards.some(id=>D.cardById(id)?.name==="Blaine's Charmander"));
});
test('Blaine Charmeleon Bonfire discards Fire Energy, and damages both Active and Bench',()=>{
 const s=act(state(8811),'gym2-31',{Fire:3},'gym2-74');let before=s.sides.opponent.bench[0].damage;
 attack(s,'Bonfire');const coin=s.log.find(l=>l.type==='coin'&&l.reason==='challengeBonfire');assert.ok(coin);
 assert.equal(s.sides.player.active.energy.Fire,3-coin.heads);
 assert.equal(s.sides.opponent.bench[0].damage-before,coin.heads*10);
});
test('Blaine Charizard Roaring Flames spends Fire Energy and scales damage',()=>{
 const s=act(state(8831),'gym2-2',{Fire:4},'base1-3');const before=s.sides.opponent.active.damage;
 attack(s,'Roaring Flames');assert.equal(s.sides.player.active.energy.Fire,0);assert.equal(s.sides.opponent.active.damage-before,100);
});
test('Rocket Mewtwo Juxtapose swaps damage counts only when coin lands heads',()=>{
 let found=false;
 for(let seed=8810;seed<8850;seed++){
  const s=act(state(seed),'gym2-14',{Psychic:3},'gym2-69');s.sides.player.active.damage=30;s.sides.opponent.active.damage=10;
  attack(s,'Juxtapose');const log=s.log.find(l=>l.reason==='challengeJuxtapose');assert.ok(log);
  if(log.heads){assert.equal(s.sides.player.active.damage,10);assert.equal(s.sides.opponent.active.damage,30);found=true;break;}
 }
 assert.ok(found,'test seeds never produced heads');
});
test('Gym Challenge UI is loaded before shared catalogue, and both selectors include gym2',()=>{
 const html=fs.readFileSync(path.join(a,'index.html'),'utf8');assert.ok(html.indexOf('tcg-classic-gym-challenge.js')<html.indexOf('tcg-classic-battle-data.js'));
 for(const file of ['tcgp-battle-ui.js','tcg-classic-deck-editor.js'])assert.match(fs.readFileSync(path.join(a,file),'utf8'),/Gym Challenge/);
 assert.ok(O.SETS.includes('gym2'));assert.ok(B.SET_IDS.includes('gym2'));
});
test('Every enabled Gym Challenge Pokémon attack is executable with its required Energy',()=>{
 let count=0;const errors=[];
 for(const card of G.CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled))for(const move of card.attacks){
  try{
   const s=act(state(9000+Number(card.number)),card.id,{Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Fighting:5,Colorless:5},'base1-3');
   if(move.name==='Roaring Flames')s.sides.opponent.active=Core.makePokemonSlot('base1-3',0,'foe');
   if(move.name==='Retaliation')s.sides.player.active.damage=20;
   if(move.name==='Synchronize')s.sides.opponent.active.energy={Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Fighting:5,Colorless:5};
   const action=Core.legalActions(s,'player').find(x=>x.type==='attack'&&card.attacks[x.attackIndex]?.name===move.name);
   assert.ok(action,`${card.id} ${move.name} unavailable`);Core.applyAction(s,'player',action);assert.ok(s.phase,['battle','effectChoice','promote','finished'].includes(s.phase));count++;
  }catch(e){errors.push(`${card.id} ${card.name} / ${move.name}: ${e.message}`)}
 }
 assert.deepEqual(errors,[],errors.join('\n'));assert.ok(count>=60,`Only ${count} attacks executed`);
});
test('Gym Challenge-only CPU opponents finish full matches with all actions resolved',()=>{
 const AI=require(path.join(a,'tcgp-battle-ai.js'));
 for(const seed of [8801,8802,8803,8804]){
  const o=O.generate({seed,sets:['gym2'],includeColorless:true});assert.ok(o.ok);
  const s=Core.createBattle({format:'classic',playerDeck:Decks.LOANER_DECK.slice(),opponentDeck:o.cards,playerEnergyTypes:['Fighting','Fire'],opponentEnergyTypes:o.energyTypes,seed,firstSide:'opponent'});
  let actions=0;
  while(s.phase!=='finished'&&actions<1300){const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.phase==='setup'?s.setupSide:s.activeSide;const chosen=AI.chooseAction(s,side,'Beginner',actions);assert.ok(chosen,`missing ${side} action seed=${seed}, phase=${s.phase}`);Core.applyAction(s,side,chosen);actions++;}
  assert.equal(s.phase,'finished',`seed ${seed} stalled after ${actions} actions`);
 }
});
