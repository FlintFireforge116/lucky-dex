'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');const core=require(A+'/tcgp-battle-core.js'),data=require(A+'/tcg-classic-battle-data.js'),ex10=require(A+'/tcg-classic-unseen-forces.js'),cpu=require(A+'/tcg-classic-opponents.js');
const d=cpu.generate({sets:['ex10'],seed:190});assert.ok(d.ok);
function game(seed,id){const s=core.createBattle({format:'classic',playerDeck:d.cards,opponentDeck:d.cards,seed,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water']});s.phase='battle';s.activeSide='player';s.turnNumber=9;const p=s.sides.player,o=s.sides.opponent;p.turnCount=5;o.turnCount=5;
 function mon(id,uid,bs){const m=core.makePokemonSlot(id,2,uid);m.benchSlot=bs;m.energy={Grass:6,Fire:6,Water:6,Lightning:6,Psychic:6,Fighting:6,Darkness:6,Metal:6};return m;}
 p.active=mon(id,'active',-1);p.bench=[mon('ex10-60','my-bench',0),mon('ex10-51','my-bench2',1)];o.active=mon('ex10-72','foe',-1);o.bench=[mon('ex10-51','foe-bench',0),mon('ex10-62','foe-bench2',1)];
 p.hand=[{uid:'hand',cardId:'ex10-94'}];p.energyDiscard={Fire:4,Water:2,Lightning:2,Grass:3,Psychic:2,Fighting:2};p.energySupply=['Fire','Water','Grass','Lightning',...p.energySupply];o.energyDiscard={Fire:2,Water:1};return s;}
let attacks=0,choices=0;
test('all FULL EX Unseen Forces attack actions have executable results and resolvable choice flows',()=>{
 const bad=[];
 for(const c of ex10.CARDS.filter(c=>c.battleEnabled&&c.kind==='pokemon'))for(let idx=0;idx<(c.attacks||[]).length;idx++){
  const s=game(19000+attacks,c.id);let a=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===idx);attacks++;
  if(!a){bad.push(c.id+' '+c.attacks[idx].name+': missing legal action');continue;}
  try{core.applyAction(s,'player',a);let i=0;
   while(s.phase==='effectChoice'&&i++<20){const options=core.legalActions(s,s.choiceSide);if(!options.length)throw Error('no choices');const pick=options.find(x=>x.type==='effectChoice'&&!x.choiceSkip)||options[0];core.applyAction(s,s.choiceSide,pick);choices++;}
   if(s.phase==='effectChoice')throw Error('stuck after 20 choices');
  }catch(err){bad.push(c.id+' '+c.attacks[idx].name+': '+err.message);}
 }
 assert.deepEqual(bad,[],bad.join('\n'));
 assert.equal(attacks,ex10.CARDS.filter(c=>c.battleEnabled&&c.kind==='pokemon').reduce((n,c)=>n+c.attacks.length,0));
});
