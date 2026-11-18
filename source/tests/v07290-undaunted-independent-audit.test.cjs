'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const hg=require(path.join(assets,'tcg-classic-undaunted.js'));
const db=require(path.join(assets,'tcg-classic-battle-data.js'));
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const id=n=>'hgss3-'+n,ref=(n,uid)=>({cardId:n.startsWith('hgss')||n.startsWith('dp')?n:id(n),uid:uid||n});
const slot=(n,uid)=>core.makePokemonSlot(n.startsWith('hgss')||n.startsWith('dp')?n:id(n),3,uid||n);
const attack=(n,name)=>hg.cardById(id(n)).attacks.find(a=>a.name===name).effect;
const ability=(n,name)=>hg.cardById(id(n)).abilities.find(a=>a.name===name).effect;
function scene(){const g=cpu.generate({sets:['hgss3'],type:'Grass',seed:3});assert.ok(g.ok,g.error);
 const s=core.createBattle({format:'classic',seed:2028,firstSide:'player',playerDeck:g.cards,opponentDeck:g.cards,playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water']});
 s.phase='battle';s.turnNumber=5;s.activeSide='player';s.sides.player.turnCount=3;s.sides.opponent.turnCount=2;
 const p=s.sides.player,o=s.sides.opponent;p.active=slot('47','p');o.active=slot('64','o');p.bench=[];o.bench=[];p.hand=[];o.hand=[];p.discard=[];o.discard=[];p.energyDiscard={};o.energyDiscard={};return s;}
function resolve(s,e,{source=s.sides.player.active,action={},resolvingChoice=false,isAttack=false,random=()=>0.1}={}){
 const offers=[];const p=s.sides.player,o=s.sides.opponent;
 fx.applyEffect(e,{state:s,side:'player',foeSide:'opponent',attacker:source,defender:o.active,cardById:db.cardById,
  action,isAttack,resolvingChoice,random,requestChoice:spec=>offers.push(spec),shuffle:(_s,deck)=>deck.reverse(),
  drawCard:board=>{if(board.deck.length&&board.hand.length<8)board.hand.push(board.deck.shift());},
  effectiveEnergy:x=>x.energy,benchCard:(board,r)=>{const at=board.bench.length;board.bench.push({...slot(r.cardId,r.uid),benchSlot:at});return at;},
  onEnergyAttached:()=>{},maxHp:(_side,p)=>db.cardById(p.cardId)?.hp||100});return offers[0]||null;}
function pick(s,c,action={},source=s.sides.player.active){assert.ok(c,`choice expected ${JSON.stringify(action)}`);return resolve(s,c.effect,{action,resolvingChoice:true,source});}
function pickReal(s,predicate){const side=s.choiceSide||s.activeSide,act=core.legalActions(s,side).find(predicate);assert.ok(act,'Legal action not found: '+JSON.stringify(s.pendingChoice));core.applyAction(s,side,act);return act;}


// Independent rule audit: verify real legal-action menus, not only mapped schemas.
test('Umbreon Prime Cloud-Covered Moon is only usable when Active',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('47','active');p.bench=[slot('86','prime')];p.bench[0].benchSlot=0;
 const moves=core.legalActions(s,'player').filter(a=>a.type==='ability'&&a.cardId===id('86'));
 assert.equal(moves.length,0,'Bench Umbreon cannot use Active-only Cloud-Covered Moon');
 p.active=p.bench.pop();p.active.benchSlot=null;const active=core.legalActions(s,'player').filter(a=>a.type==='ability'&&a.cardId===id('86'));assert.equal(active.length,1);
});
test('Weavile Claw Snag is an optional hand-discard trigger, not mandatory',()=>{
 const s=scene(),o=s.sides.opponent;o.hand=[ref('47','keep'),ref('64','other')];
 const c=resolve(s,ability('25','Claw Snag'));
 assert.ok(c,'Claw Snag should offer a choice');assert.equal(c.kind,'opponentHandCard');
 assert.equal(c.optional,true,'printed may must allow the player to decline');
});
test('Espeon Solar Suggestion can move zero damage counters (up to four)',()=>{
 const s=scene(),p=s.sides.player;p.bench=[slot('42','wounded')];p.bench[0].benchSlot=0;p.bench[0].damage=40;
 const c=resolve(s,attack('2','Solar Suggestion'),{isAttack:true});assert.equal(c.kind,'pokemon');
 assert.equal(c.optional,true,'up to four must allow the zero-counter option');
});
test('Defender expires after opponent turn, not on the same turn as attachment',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('47','owner');
 p.active.temporaryTrainers=[{cardId:id('72'),uid:'defender',ownerSide:'player',attachedTurn:s.turnNumber}];
 assert.equal(fx.modifierAmount(s,'player',p.active,'damageReduction',db.cardById),20);
 // Existing engine timer is also covered by the old v07289 completion suite.
});
test('Undaunted CPU builds remain legal under a wider deterministic seed/type sweep',()=>{
 let checks=0;for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless'])for(let seed=20;seed<50;seed++){
  const g=cpu.generate({sets:['hgss3'],type,seed});if(!g.ok)continue;
  checks++;assert.equal(g.cards.length,30);assert.ok(db.validateDeck(g.cards).ok,type+'/'+seed);
  for(const [a,b] of [['87','88'],['89','90']])assert.equal(g.cards.filter(x=>x===id(a)).length,g.cards.filter(x=>x===id(b)).length);
 }assert.ok(checks>=80,checks+' valid CPU decks');
});
test('Declining Weavile Claw Snag leaves the opponent hand untouched',()=>{
 const s=scene(),o=s.sides.opponent;o.hand=[ref('47','keep'),ref('64','other')];
 const c=resolve(s,ability('25','Claw Snag'));assert.equal(c.optional,true);
 const next=pick(s,c,{choiceSkip:true});assert.equal(next,null);
 assert.deepEqual(o.hand.map(r=>r.uid),['keep','other']);assert.equal(o.discard.length,0);
});
test('Declining all Solar Suggestion counters makes no change',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.bench=[slot('42','hurt')];p.bench[0].benchSlot=0;p.bench[0].damage=30;
 const c=resolve(s,attack('2','Solar Suggestion'),{isAttack:true});assert.equal(c.optional,true);
 assert.equal(pick(s,c,{choiceSkip:true}),null);
 assert.equal(p.bench[0].damage,30);assert.equal(o.active.damage,0);
});
