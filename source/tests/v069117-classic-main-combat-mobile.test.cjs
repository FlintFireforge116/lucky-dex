'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets'),core=require(path.join(assets,'tcgp-battle-core.js'));
const data=require(path.join(assets,'tcg-classic-battle-data.js')),decks=require(path.join(assets,'tcg-classic-decks.js'));
const ui=require(path.join(assets,'tcgp-battle-ui.js')),_test=ui._test;
const script=fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
function battle(){return core.createBattle({format:'classic',playerDeck:decks.LOANER_DECK.slice(),opponentDeck:decks.LOANER_DECK.slice(),playerEnergyTypes:['Colorless'],opponentEnergyTypes:['Colorless'],seed:4321,firstSide:'player'});}
function setupToolState(active,bench,side='player'){
 const state=battle(),ss=state.sides[side];state.activeSide=side;ss.active=core.makePokemonSlot(active,1,'active-mon');ss.bench=bench?[{...core.makePokemonSlot(bench,1,'bench-mon'),benchSlot:0}]:[];
 ss.hand=[{uid:'battle-stick',cardId:'SNAPFLORIO-103'}];ss.turnCount=3;ss.supporterUsed=false;
 return state;
}
test('Battle Stick is limited to Bidoof, including Illumina prints',()=>{
 const mixed=setupToolState('SNAPFLORIO-078','SNAPFLORIO-089');
 const actions=core.legalActions(mixed,'player').filter(a=>a.type==='trainer'&&a.cardId==='SNAPFLORIO-103');
 assert.deepEqual(actions.map(a=>[a.target,a.benchIndex]),[['bench',0]]);
 assert.throws(()=>core.applyAction(mixed,'player',{type:'trainer',handIndex:0,cardId:'SNAPFLORIO-103',target:'active'}),/Illegal/);
 const reversed=setupToolState('SNAPFLORIO-091','SNAPFLORIO-078');
 assert.deepEqual(core.legalActions(reversed,'player').filter(a=>a.type==='trainer'&&a.cardId==='SNAPFLORIO-103').map(a=>a.target),['active']);
 const cpu=setupToolState('SNAPFLORIO-078','SNAPFLORIO-090','opponent');
 assert.deepEqual(core.legalActions(cpu,'opponent').filter(a=>a.type==='trainer'&&a.cardId==='SNAPFLORIO-103').map(a=>a.target),['bench']);
});
test('every enabled Florio attack has a readable in-combat description',()=>{
 const cards=data.CARDS.filter(c=>c.setId==='SNAPFLORIO'&&c.battleEnabled),attacks=cards.flatMap(c=>c.attacks||[]);
 assert.equal(cards.length,123);assert.ok(attacks.length>150);
 for(const attack of attacks){const text=_test.attackDescription(attack);assert.ok(text.length>5,attack.name);assert.doesNotMatch(text,/^(Special effect|Resolve)\b/i,attack.name);}
 const snorlax=data.cardById('SNAPFLORIO-078');const rules=ui.cardRulesHtml(snorlax);
 assert.match(rules,/Asleep/);assert.match(rules,/Startling Snore/);
 assert.match(_test.attackDescription(data.cardById('SNAPFLORIO-089').attacks[0]),/Fighting/);
 assert.match(_test.attackDescription(data.cardById('SNAPFLORIO-003').attacks[1]),/coin/);
});
test('Sleep check is explicitly logged; tails correctly persists across turns',()=>{
 const state=battle();state.sides.player.active.conditions.sleep=true;state.sides.opponent.active.conditions.sleep=true;
 core.applyAction(state,'player',{type:'endTurn'});
 const checks=state.log.filter(entry=>entry.type==='sleepCheck');
 assert.equal(checks.length,2);
 for(const x of checks){assert.equal(!!state.sides[x.side].active.conditions.sleep,!x.woke);assert.ok(x.coins>=1);}
 assert.equal(state.activeSide,'opponent');
});
test('main combat has touch actions for hand cards, Energy, and centre play lane',()=>{
 assert.match(script,/function openHandActions\(handIndex\)/);
 assert.match(script,/function openEnergyActions\(\)/);
 assert.match(script,/data-card-play-zone="1"/);
 assert.match(script,/applyHandCenterDrop\(handIndex\)/);
 assert.match(script,/data-tcgp-action="open-hand-actions"/);
 assert.match(script,/data-tcgp-action="open-energy-actions"/);
 assert.match(script,/liveHandAndEnergyOverlayHtml\(\)/);
 assert.match(script,/tcgp-live-attack-description/);
});
