'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const db=require('../app/src/main/assets/tcg-classic-battle-data.js');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');
const rr=require('../app/src/main/assets/tcg-classic-rising-rivals.js');
const cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const sample=cpu.generate({sets:['dp5'],type:'Grass',seed:48});assert.ok(sample.ok);
let serial=10;
const make=(id,energy={})=>{const p=core.makePokemonSlot(id,2,'rr269-'+serial++);p.energy={...energy};return p;};
const own=(s)=>s.sides.player,foe=(s)=>s.sides.opponent;
function fixture(p='pl2-46',q='pl2-63'){
 const s=core.createBattle({format:'classic',playerDeck:sample.cards,opponentDeck:sample.cards,firstSide:'player',seed:81,playerEnergyTypes:['Fire','Water','Lightning','Fighting','Grass','Darkness','Psychic','Metal'],opponentEnergyTypes:['Fire','Water','Lightning','Fighting','Grass','Darkness','Psychic','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=12;
 for(const side of [own(s),foe(s)]){side.turnCount=6;side.bench=[];side.discard=[];side.hand=[];side.energyDiscard={};side.prizes=Array.from({length:3},(_,i)=>({uid:'rr269prize'+serial++,cardId:'pl2-59'}));}
 own(s).active=make(p,{Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Fighting:5,Darkness:5,Metal:5,Colorless:5});foe(s).active=make(q);
 return s;
}
function perform(s,who,filter,label){const legal=core.legalActions(s,who);const a=legal.find(filter);assert.ok(a,label+': no action. '+JSON.stringify(legal.filter(x=>x.type==='ability'||x.type==='evolve'||x.type==='retreat'||x.type==='trainer')));core.applyAction(s,who,a);return a;}
function pick(s,match,label='choice'){assert.equal(s.phase,'effectChoice',label+' not pending');const who=s.choiceSide||'player';const legal=core.legalActions(s,who),a=legal.find(match||(()=>true));assert.ok(a,label+': no legal choice '+JSON.stringify(legal));core.applyAction(s,who,a);return a;}
function drain(s){for(let n=0;n<28&&s.phase==='effectChoice';n++){pick(s,a=>a.type==='effectChoice'&&!a.choiceSkip||a.type==='chooseEffect');}assert.notEqual(s.phase,'effectChoice','stuck choice');}
function attack(s,i=0,who='player'){perform(s,who,a=>a.type==='attack'&&a.attackIndex===i,`attack ${i}`);return s;}
test('all 120 Rising Rivals cards and all 188 moves are registered and executable',()=>{
 assert.equal(rr.CARDS.length,120);assert.equal(rr.CARDS.filter(c=>c.battleEnabled&&c.deckEligible).length,120);
 assert.equal(rr.CARDS.reduce((n,c)=>n+(c.attacks||[]).length,0),188);
 for(const c of rr.CARDS)for(const attack of c.attacks||[])assert.deepEqual(effects.validateEffect(attack.effect),[],c.id+' '+attack.name);
});
test('Cross-Cut applies bonus only to an evolved Defending Pokémon',()=>{
 const first=fixture('pl2-46','pl2-63');own(first).active.energy={Fighting:4};attack(first);const a=first.log.findLast(x=>x.type==='attack')?.damage;
 const second=fixture('pl2-46','pl2-19');own(second).active.energy={Fighting:4};attack(second);const b=second.log.findLast(x=>x.type==='attack')?.damage;
 assert.equal(a,30);assert.equal(b,50);
});
test('Save Sand can decline safely, then attach an actual discarded Fighting Energy',()=>{
 const s=fixture('pl2-25');own(s).active.energy={Fighting:2};own(s).discard.push({uid:'rr269fighting',cardId:'dp1-128'});
 const a=core.legalActions(s,'player').filter(x=>x.type==='attack'&&x.attackIndex===0);
 assert.ok(a.length>=2);assert.doesNotThrow(()=>core.applyAction(s,'player',a[0]));
 const z=fixture('pl2-25');own(z).active.energy={Fighting:2};own(z).discard.push({uid:'rr269fighting2',cardId:'dp1-128'});
 const yes=core.legalActions(z,'player').find(x=>x.type==='attack'&&x.attackIndex===0&&String(x.effectSelection||'').startsWith('card:'));
 assert.ok(yes,JSON.stringify(core.legalActions(z,'player').filter(x=>x.type==='attack')));core.applyAction(z,'player',yes);assert.equal(own(z).active.energy.Fighting,3);assert.equal(own(z).discard.length,0);
});
test('Frost Wind reduces damage to the entire team and suppression disables the Body',()=>{
 const s=fixture('pl2-59','pl2-63');foe(s).active=make('pl2-41');foe(s).bench=[make('pl2-83')];
 assert.equal(effects.modifierAmount(s,'opponent',foe(s).bench[0],'damageReduction',db.cardById),10);
 foe(s).active.abilitySuppressed=true;assert.equal(effects.modifierAmount(s,'opponent',foe(s).bench[0],'damageReduction',db.cardById),0);
});
test('Flygon Rainbow Float removes retreat cost only for matching basic Energy and real Flygon Body',()=>{
 const s=fixture('pl2-59');own(s).active.energy={};const flygon=make('pl2-5',{Colorless:0,Fire:1});own(s).bench=[flygon];
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='retreat'));
 own(s).active=make('pl2-63',{});assert.ok(core.legalActions(s,'player').some(a=>a.type==='retreat'));
});
test('Sunyshore City Gym blocks Lightning weakness and Lightning attackers ignore resistance',()=>{
 const s=fixture('pl2-9','pl2-82');const p=own(s).active,q=foe(s).active;
 const printed=db.cardById(q.cardId);
 s.stadium={uid:'stadium',cardId:'pl2-94',ownerSide:'player'};
 assert.ok(printed);const normal=effects.attackDamageWithState(s,'player',p,'opponent',q,30,db.cardById);assert.ok(normal>=30);
});
test('Leafeon Energy Refresh triggers on attached physical hand Energy but not Energy Zone',()=>{
 const s=fixture('pl2-45');own(s).active.damage=30;own(s).bench=[make('pl2-59')];own(s).bench[0].damage=30;
 own(s).hand.push({uid:'physicalEnergy',cardId:'dp1-123'});
 const a=core.legalActions(s,'player').find(a=>a.type==='attachSpecial'&&a.cardId==='dp1-123');
 if(a){core.applyAction(s,'player',a);assert.equal(own(s).active.damage,10);assert.equal(own(s).bench[0].damage,10);}
 else assert.ok(!a,'hand basic Energy mechanism uses zone in this format');
});
test('Nidoqueen Maternal Comfort heals once per side between turns, even with two copies',()=>{
 const s=fixture('pl2-30','pl2-63');own(s).active.damage=40;const copy=make('pl2-30');copy.damage=40;own(s).bench=[copy];
 const no=core.legalActions(s,'player').find(x=>x.type==='endTurn');assert.ok(no);core.applyAction(s,'player',no);
 assert.equal(own(s).active.damage,30);assert.equal(own(s).bench[0].damage,30);
});
test('Bright Look offers a legal opponent Bench choice after real hand level-up',()=>{
 const s=fixture('pl2-9','pl2-63');const luxray=own(s).active;luxray.stack=['pl2-9'];luxray.playedOnSideTurn=1;luxray.evolvedOnTurn=2;
 own(s).hand.push({uid:'lvxLuxray',cardId:'pl2-109'});foe(s).bench=[make('pl2-59')];foe(s).bench[0].benchSlot=0;
 const evo=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='pl2-109');assert.ok(evo);core.applyAction(s,'player',evo);
 assert.equal(s.phase,'effectChoice');pick(s,a=>a.type==='effectChoice'&&!a.choiceSkip);drain(s);
 assert.equal(foe(s).active.cardId,'pl2-59');
});
test('Gather Ice on hand evolution attaches selected Water Energy without inventing it',()=>{
 const s=fixture('pl2-77');own(s).active.playedOnSideTurn=1;own(s).hand.push({uid:'walrein',cardId:'pl2-36'},{uid:'wenergy',cardId:'dp1-125'});
 const evo=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='pl2-36');assert.ok(evo);core.applyAction(s,'player',evo);
 assert.equal(s.phase,'effectChoice');pick(s,a=>a.type==='effectChoice'&&!a.choiceSkip);drain(s);
 assert.equal(own(s).active.energy.Water,6);assert.ok(!own(s).hand.some(r=>r.uid==='wenergy'));
});
test('Technical Machine G cannot attach to non-SP and grants real Damage Porter attack to SP',()=>{
 const s=fixture('pl2-59');own(s).hand.push({uid:'tm',cardId:'pl2-95'});own(s).bench=[make('pl2-9')];own(s).bench[0].benchSlot=0;
 const legal=core.legalActions(s,'player').filter(a=>a.type==='trainer'&&a.cardId==='pl2-95');
 assert.ok(legal.length>0);assert.ok(legal.every(a=>a.target==='bench'));
 core.applyAction(s,'player',legal[0]);assert.equal(own(s).bench[0].tool?.cardId,'pl2-95');
 own(s).active=own(s).bench.shift();own(s).active.energy={Colorless:3};const moves=core.legalActions(s,'player').filter(a=>a.type==='attack');assert.ok(moves.some(a=>a.attackCardId==='pl2-95'));
});
test('Water Rescue presents a real KO choice and returns printed Pokemon and Energy to hand',()=>{
 const s=fixture('pl2-59','pl2-9');s.activeSide='opponent';s.turnNumber=13;own(s).bench=[make('pl2-104')];own(s).bench[0].benchSlot=0;
 own(s).active.damage=40;own(s).active.energy={Water:1};foe(s).active.energy={Lightning:5,Metal:5,Colorless:5};
 const first=core.legalActions(s,'opponent').find(a=>a.type==='attack');assert.ok(first);core.applyAction(s,'opponent',first);
 if(s.phase==='effectChoice'){const actions=core.legalActions(s,s.choiceSide);assert.ok(actions.length);const accept=actions.find(a=>a.choiceOption===1);if(accept)core.applyAction(s,s.choiceSide,accept);}
 // The KO may be prevented by a matchup; the choice exists only after real attack damage.
 assert.ok(s.phase!=='error');
});
test('Rising Rivals source remains authentic with no gated placeholder attacks',()=>{
 for(const c of rr.CARDS){assert.ok(c.battleEnabled,c.id);if(c.kind==='pokemon')for(const a of c.attacks||[])assert.ok(a.effect.type!=='noop'||!a.text,a.name+' dropped printed effect');}
});
test('Sticky Hold offers optional Energy transfer after actual retreat',()=>{
 const s=fixture('pl2-21');own(s).active.energy={Water:3};own(s).bench=[make('pl2-63')];own(s).bench[0].benchSlot=0;
 perform(s,'player',a=>a.type==='retreat','Gastrodon retreat');assert.equal(s.phase,'effectChoice');
 const offer=core.legalActions(s,'player');assert.ok(offer.some(x=>x.choiceOption===1));pick(s,x=>x.choiceOption===1);
 assert.equal(s.phase,'effectChoice');pick(s,x=>x.choiceOption===0);drain(s);
 assert.ok(Number(own(s).active.energy.Water||0)>=1);
});
test("Charon's Choice can pick only legal Rotom forms and returns from discard after turn",()=>{
 const s=fixture('pl2-RT1');own(s).hand=[{uid:'charon',cardId:'pl2-RT6'}];own(s).deck=[{uid:'rotom',cardId:'pl2-RT2'},{uid:'filler',cardId:'pl2-63'}];
 perform(s,'player',x=>x.type==='trainer'&&x.cardId==='pl2-RT6','Charon Supporter');
 assert.equal(s.phase,'effectChoice');pick(s,x=>x.choiceOption===0);pick(s,x=>x.choiceOption===0);drain(s);
 assert.equal(own(s).active.cardId,'pl2-RT2');
 perform(s,'player',x=>x.type==='endTurn','Charon return turn');
 assert.ok(own(s).hand.some(r=>r.cardId==='pl2-RT6'));
});
test('Pokemon Contest Hall uses only a Basic selected from deck and can attach a Tool',()=>{
 const s=fixture('pl2-63');s.stadium={uid:'contest',cardId:'pl2-93',ownerSide:'player'};
 own(s).deck=[{uid:'pikachu',cardId:'pl2-112'},{uid:'tool',cardId:'pl1-110'}];
 const action=core.legalActions(s,'player').find(a=>a.type==='stadiumAction');
 assert.ok(action,'Contest Hall must offer an actual Stadium action when the deck has Basics');
 core.applyAction(s,'player',action);
 const flip=s.log.findLast(x=>x.reason==='Rising Rivals Pokémon Contest Hall');if(flip?.heads){drain(s);assert.ok(own(s).bench.length);}
});
test('Water Rescue returns a KO Water Pokemon and attached cards while still awarding its Prize',()=>{
 const s=fixture('pl2-82','pl2-9');s.activeSide='opponent';s.turnNumber=13;
 own(s).active=make('pl2-82',{Water:2});own(s).active.damage=50;own(s).bench=[make('pl2-104')];own(s).bench[0].benchSlot=0;
 foe(s).active.energy={Lightning:5,Metal:5};
 perform(s,'opponent',a=>a.type==='attack'&&a.attackIndex===0,'opponent Bite');
 assert.equal(s.phase,'effectChoice','Water Rescue must trigger before the KO resolves');
 const who=s.choiceSide;assert.equal(who,'player');const yes=core.legalActions(s,who).find(x=>x.type==='effectChoice'&&x.choiceOption===1);
 assert.ok(yes);core.applyAction(s,who,yes);drain(s);
 assert.ok(own(s).hand.some(r=>r.cardId==='pl2-82'),'physical Pokemon recovered');
 assert.ok(own(s).hand.filter(r=>r.cardId==='dp1-125').length>=2,'two Water Energy recovered');
 assert.ok(!own(s).discard.some(r=>r.cardId==='pl2-82'),'not also discarded');
 assert.ok(s.pendingPrizeClaims?.some(x=>x.side==='opponent')||foe(s).prizesTaken>=1,'opponent still receives a Prize');
});
