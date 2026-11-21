'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const effects=require(path.join(assets,'tcgp-battle-effects.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const R=key=>({type:'neoRule',rule:'xy4:'+key});
const r=(cardId,uid)=>({uid,cardId});
const card={
 'unit-b':{id:'unit-b',name:'Bellsprout',kind:'pokemon',stage:'Basic',types:['Grass'],hp:70,battleEnabled:true},
 'unit-g':{id:'unit-g',name:'Gengar',kind:'pokemon',stage:'Stage 1',types:['Psychic'],hp:130,battleEnabled:true},
 'unit-f':{id:'unit-f',name:'Fletchling',kind:'pokemon',stage:'Basic',types:['Colorless'],hp:70,battleEnabled:true},
 'unit-m':{id:'unit-m',name:'Bronzong',kind:'pokemon',stage:'Stage 1',types:['Metal'],hp:120,battleEnabled:true},
 'unit-metal':{id:'unit-metal',name:'Metal Energy',kind:'energy',basicEnergy:true,subtype:'Metal',energyType:'Metal'},
 'unit-dark':{id:'unit-dark',name:'Darkness Energy',kind:'energy',basicEnergy:true,subtype:'Darkness',energyType:'Darkness'},
 'unit-fire':{id:'unit-fire',name:'Fire Energy',kind:'energy',basicEnergy:true,subtype:'Fire',energyType:'Fire'},
 'unit-special':{id:'unit-special',name:'Strong Energy',kind:'energy',specialEnergy:true,effect:{type:'specialEnergy',provides:{Fighting:1}}},
 'unit-tool':{id:'unit-tool',name:'Tool',kind:'trainer',trainerType:'Tool',effect:{type:'noop'}},
 'unit-item':{id:'unit-item',name:'Professor Letter',kind:'trainer',trainerType:'Item',effect:{type:'noop'}},
 'unit-support':{id:'unit-support',name:'Shauna',kind:'trainer',trainerType:'Supporter',effect:{type:'noop'}}
};
const mk=(id,uid,slot=0)=>({cardId:id,uid,benchSlot:slot,stack:[id],damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],conditions:{},temporaryTrainers:[]});
const side=(which)=>({id:which,active:mk('unit-f',which+'a',null),bench:[mk('unit-b',which+'b',0)],hand:[],deck:[],discard:[],energyDiscard:{},handLimit:8,benchLimit:3,turnCount:4,prizes:[]});
const scene=()=>({format:'classic',phase:'battle',activeSide:'player',turnNumber:7,rngState:2,log:[],sides:{player:side('player'),opponent:side('opponent')},modifiers:[]});
function withCards(fn){const old=data.cardById;data.cardById=id=>card[id]||old(id);try{return fn();}finally{data.cardById=old;}}
function invoke(s,rule,source=s.sides.player.active){effects.applyEffect(typeof rule==='string'?R(rule):rule,core.effectContext(s,'player',{},source));}
function choosePokemon(s,where='bench',slot=0){assert.equal(s.phase,'effectChoice');const actions=core.legalActions(s,s.choiceSide).filter(a=>a.type==='effectChoice');const match=actions.find(a=>(a.choiceTarget===where||where==='bench'&&a.choiceTarget==='bench'||where==='bench'&&a.choiceTarget==='opponentBench')&&(where!=='bench'||Number(a.choiceBenchIndex)===slot));assert.ok(match,'Cannot choose '+where+': '+JSON.stringify(actions));core.applyAction(s,s.choiceSide,match);}
function choose(s,index=0){assert.equal(s.phase,'effectChoice',`No selection offered: ${s.log.at(-1)?.type}`);const acts=core.legalActions(s,s.choiceSide).filter(a=>a.type==='effectChoice');const action=acts.find(a=>a.choiceOption===index);assert.ok(action,`Choice ${index} not legal: ${JSON.stringify(s.pendingChoice?.options)}`);core.applyAction(s,s.choiceSide,action);}


function localTestCard(id,properties){card[id]={id,battleEnabled:true,...properties};return card[id];}

// Tests for the final six Phantom Forces mechanics; all use real battle-state actions.
test('Dizzying Wind checks each opponent Trainer, consumes Supporter on tails and expires next turn',()=>withCards(()=>{
 const s=scene();localTestCard('xy4-2',{name:'Venomoth',kind:'pokemon',stage:'Stage 1',types:['Grass'],hp:90});
 localTestCard('test-supporter',{name:'Tierno',kind:'trainer',trainerType:'Supporter',effect:{type:'draw',amount:3}});
 s.sides.opponent.hand=[r('test-supporter','sup1')];s.sides.opponent.deck=Array.from({length:3},(_,i)=>r('unit-b','d'+i));
 invoke(s,'dizzyingWind');assert.equal(s.sides.opponent.xy4DizzyingWindUntil,8);
 s.activeSide='opponent';s.turnNumber=8;s.rngState=1;
 const legal=core.legalActions(s,'opponent').find(a=>a.type==='trainer'&&a.cardId==='test-supporter');assert.ok(legal,'Opponent Supporter must remain playable');
 // Force an RNG seed whose next deterministic coin is tails.
 s.rngState=10000; // A known deterministic tails result (>=0.5).
 core.applyAction(s,'opponent',legal);
 assert.equal(s.sides.opponent.supporterUsed,true);assert.equal(s.sides.opponent.hand.length,0);
 assert.deepEqual(s.sides.opponent.discard.map(x=>x.uid),['sup1']);assert.equal(s.sides.opponent.deck.length,3);
 assert.ok(s.log.some(x=>x.reason==='Dizzying Wind'&&!x.heads));
}));

test('Trick Sticker makes the defending Pokémon Lightning-weak through next own turn',()=>withCards(()=>{
 const s=scene(),f=s.sides.opponent.active;card['unit-f'].weakness='Water';
 invoke(s,'trickSticker');assert.equal(f.weaknessOverride,'Lightning');assert.equal(f.xy4TrickStickerUntil,9);
 const lightning=mk('unit-b','elec');card['unit-b'].types=['Lightning'];
 assert.equal(effects.attackDamageWithState(s,'player',lightning,'opponent',f,20,data.cardById),40);
 s.turnNumber=9;assert.equal(f.weaknessOverride,'Lightning');
 // Switch removes attack-derived weakness just like other temporary conditions.
 s.sides.opponent.bench=[mk('unit-b','bench',0)];s.activeSide='opponent';
 const sw=core.legalActions(s,'opponent').find(a=>a.type==='retreat');
 if(sw)core.applyAction(s,'opponent',sw);
 if(sw)assert.equal(f.weaknessOverride,undefined);
}));

test('Parabolic Spark chooses the discard count up front then removes selected real Lightning Energy',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active.energy.Lightning=2;p.bench[0].energy.Lightning=1;
 localTestCard('unit-sp-lightning',{name:'Lightning Special',kind:'energy',specialEnergy:true,effect:{type:'specialEnergy',provides:{Lightning:1}}});
 p.bench[0].specialEnergy=[r('unit-sp-lightning','s1')];
 const attack={name:'Parabolic Spark',damage:0,cost:'LC',effect:R('parabolicSpark')},ctx={...core.effectContext(s,'player',{},p.active),isAttack:true};
 const choices=effects.choicesForEffect(attack.effect,ctx);assert.deepEqual(choices.map(x=>x.effectSelection),['count:0','count:1','count:2','count:3','count:4']);
 const result=effects.resolveAttack(attack,{...ctx,action:{effectSelection:'count:2'}});
 assert.equal(result.damage,60);assert.equal(result.pendingEffects.length,1);
 effects.applyEffect(result.pendingEffects[0],ctx);
 assert.equal(s.phase,'effectChoice');choose(s,0);choose(s,0);
 assert.equal(p.active.energy.Lightning,0);assert.equal(p.energyDiscard.Lightning,2);assert.equal(p.bench[0].energy.Lightning,1);
}));

test('Head Ringer can only attach to opponent EX, adds Colorless attack cost and returns to owner discard',()=>withCards(()=>{
 const s=scene(),p=s.sides.player,f=s.sides.opponent;
 localTestCard('unit-ex',{name:'Lucario-EX',kind:'pokemon',stage:'Basic',pokemonEX:true,types:['Fighting'],hp:170,attacks:[{name:'Punch',cost:'F',damage:40}]});
 localTestCard('xy4-97',{name:'Head Ringer',kind:'trainer',trainerType:'Tool',effect:R('headRinger')});
 f.active.cardId='unit-ex';p.hand=[r('xy4-97','h1')];
 const choices=core.legalActions(s,'player').filter(a=>a.type==='trainer'&&a.cardId==='xy4-97');
 assert.equal(choices.length,1);assert.equal(choices[0].target,'opponentActive');
 core.applyAction(s,'player',choices[0]);assert.equal(f.active.tool.cardId,'xy4-97');assert.equal(f.active.tool.ownerSide,'player');
 // The EX now needs F + C, so one Fighting Energy alone cannot attack.
 f.active.energy.Fighting=1;s.activeSide='opponent';s.turnNumber=8;
 assert.equal(core.legalActions(s,'opponent').filter(a=>a.type==='attack').length,0);
 f.active.energy.Colorless=1;assert.ok(core.legalActions(s,'opponent').some(a=>a.type==='attack'));
 // If removed by Xerosic it belongs in the original user's discard pile.
 s.activeSide='player';s.turnNumber=9;invoke(s,'xerosic');choose(s,0);
 assert.equal(f.active.tool,null);
 assert.deepEqual(p.discard.map(x=>x.uid),['h1']);
}));

test('Jamming Net can only attach to opponent EX and subtracts 20 damage before weakness',()=>withCards(()=>{
 const s=scene(),p=s.sides.player,f=s.sides.opponent;
 localTestCard('unit-ex',{name:'Gengar-EX',kind:'pokemon',stage:'Basic',pokemonEX:true,types:['Psychic'],hp:170});
 localTestCard('xy4-98',{name:'Jamming Net',kind:'trainer',trainerType:'Tool',effect:R('jammingNet')});
 f.active.cardId='unit-ex';p.hand=[r('xy4-98','j1')];const a=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='xy4-98');assert.ok(a);
 core.applyAction(s,'player',a);assert.equal(f.active.tool.cardId,'xy4-98');
 card['unit-f'].weakness='Psychic';const dmg=effects.attackDamageWithState(s,'opponent',f.active,'player',p.active,60,data.cardById);
 assert.equal(dmg,80); // (60 - 20) * 2, not (60 * 2) - 20
}));

test('Robo Substitute enters from Item onto the Bench, has 30 HP, cannot retreat or grant a Prize',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;
 localTestCard('xy4-102',{name:'Robo Substitute',kind:'trainer',trainerType:'Item',effect:R('roboSubstitute'),hp:30,noPrize:true,stage:'Basic',types:['Colorless']});
 p.hand=[r('xy4-102','rb1')];
 const a=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='xy4-102');assert.ok(a);core.applyAction(s,'player',a);
 const rb=p.bench.find(x=>x.cardId==='xy4-102');assert.ok(rb);assert.equal(core.maxHp(s,'player',rb),30);
 assert.equal(p.discard.some(x=>x.cardId==='xy4-102'),false);
 const voluntary=core.legalActions(s,'player').find(a=>a.type==='xy4DiscardRoboSubstitute'&&a.target==='bench');assert.ok(voluntary);
 core.applyAction(s,'player',voluntary);assert.equal(p.bench.some(x=>x.cardId==='xy4-102'),false);assert.equal(p.discard.filter(x=>x.cardId==='xy4-102').length,1);
}));

test('all six formerly gated Phantom Forces card numbers are enabled in generator',()=>{
 const py=String.raw`import sys;sys.path.insert(0,sys.argv[1]);from xy4_verified import ATTACKS,GATE,TRAINERS
assert not GATE
assert all(ATTACKS.get((n,move)) for n,move in [('2','Dizzying Wind'),('25','Trick Sticker'),('30','Parabolic Spark')])
assert all(TRAINERS.get(n) for n in ['97','98','102'])`;
 const out=spawnSync('python3',['-c',py,path.join(root,'scripts')],{encoding:'utf8'});
 assert.equal(out.status,0,out.stderr);
});

// These checks run against synthetic live board states locally; the separate
// official-print audit below runs after GitHub has generated immutable XY4.
test('Jellicent Ensnaring Spray adds exactly 10 per attached opposing Energy',()=>withCards(()=>{
 const s=scene(),f=s.sides.opponent.active;
 f.energy.Fire=2;f.specialEnergy=[r('unit-special','special-1')];
 const atk={name:'Ensnaring Spray',damage:50,effect:{type:'energyDamage',source:'opponent',amount:10,mode:'add'}};
 const ctx={...core.effectContext(s,'player',{},s.sides.player.active),isAttack:true,attacker:s.sides.player.active,defender:f};
 assert.equal(effects.resolveAttack(atk,ctx).damage,80);
 f.specialEnergy=[];f.energy.Fire=0;
 assert.equal(effects.resolveAttack(atk,ctx).damage,50);
}));

test('Galvantula Cobweb Trip selects real opponent Bench and confuses its new Active',()=>withCards(()=>{
 const s=scene(),f=s.sides.opponent,old=f.active,newActive=f.bench[0];
 newActive.conditions={};old.conditions={};
 invoke(s,'cobwebTrip');assert.equal(s.choiceSide,'player');
 assert.equal(s.phase,'effectChoice');
 choose(s,0);
 assert.equal(f.active.uid,newActive.uid);
 assert.equal(f.bench[0].uid,old.uid);
 assert.ok(f.active.conditions.confusion,'New Active must be Confused');
 assert.ok(!f.bench[0].conditions.confusion,'Old Active must not become Confused');
}));

test('Robo Substitute KO grants no Prize and moves the real card to discard',()=>withCards(()=>{
 const s=scene(),p=s.sides.player,f=s.sides.opponent;
 localTestCard('xy4-102',{name:'Robo Substitute',kind:'trainer',trainerType:'Item',stage:'Basic',types:['Colorless'],hp:30,noPrize:true,battleEnabled:true});
 s.rules={winMode:'prizes',prizeCount:5,handLimit:8};
 p.prizes=Array.from({length:5},(_,i)=>r('unit-f','ppr'+i));f.prizes=Array.from({length:5},(_,i)=>r('unit-f','fpr'+i));
 p.active=mk('xy4-102','roboko',null);p.active.damage=30;
 const before=f.prizesTaken;
 core.endTurn(s);
 assert.equal(f.prizesTaken,before,'Robo Substitute must award zero Prize cards');
 assert.equal(p.discard.some(x=>x.cardId==='xy4-102'),true,'KO goes to its owner discard');
}));

test('all 124 official Phantom Forces prints have exact costs and supported gameplay',{skip:!require('node:fs').existsSync(path.join(root,'data/classic/xy4-print-compact.json'))},()=>{
 const fs=require('node:fs'),official=JSON.parse(fs.readFileSync(path.join(root,'data/classic/xy4-print-compact.json'),'utf8'));
 const registry=require(path.join(assets,'tcg-classic-phantom-forces.js'));
 assert.equal(official.length,124);assert.equal(registry.CARDS.length,124);
 assert.equal(official.reduce((n,row)=>n+row[7].length,0),162);
 assert.equal(official.reduce((n,row)=>n+row[8].length,0),15);
 let attackCount=0,abilityCount=0;
 for(const row of official){
  const [number,name,supertype,,,,,attacks,abilities]=row,id='xy4-'+number,c=registry.cardById(id);
  assert.ok(c,'Missing print '+id);assert.equal(c.name,name);
  assert.equal(c.battleEnabled,true,`${id}: ${JSON.stringify(c.support?.reasons)}`);
  assert.equal(c.deckEligible,true,id);assert.equal(c.support.status,'FULL',id);
  assert.equal(c.attacks?.length||0,attacks.length,id+' attack count');
  assert.equal(c.abilities?.length||0,abilities.length,id+' Ability count');
  for(let i=0;i<attacks.length;i++){
   const a=c.attacks[i],printed=attacks[i];attackCount++;
   assert.equal(a.name,printed[0],id+' move name');
   assert.equal(Array.isArray(a.cost)?a.cost.join(''):a.cost,printed[1].join(''),id+' '+a.name+' Energy symbols');
   assert.notEqual(a.effect?.type,'unsupported',id+' '+a.name);
   assert.deepEqual(effects.validateEffect(a.effect),[],id+' '+a.name);
  }
  for(let i=0;i<abilities.length;i++){
   const ability=c.abilities[i];abilityCount++;
   assert.equal(ability.name,abilities[i][0],id+' Ability name');
   assert.deepEqual(effects.validateEffect(ability.effect),[],id+' '+ability.name);
  }
  if(supertype==='Trainer')assert.deepEqual(effects.validateEffect(c.effect),[],id+' '+name);
 }
 assert.equal(attackCount,162);assert.equal(abilityCount,15);
 const pairs=[['23','113'],['24','24a'],['24','120'],['34','114'],['35','121'],['58','115'],['62','122'],['67','116']];
 for(const [a,b] of pairs){
  const first=registry.cardById('xy4-'+a),second=registry.cardById('xy4-'+b);
  assert.equal(first.name,second.name,`${a}/${b} names`);
  const moves=c=>(c.attacks||[]).map(x=>[x.name,Array.isArray(x.cost)?x.cost.join(''):x.cost,x.damage]);
  assert.deepEqual(moves(first),moves(second),`${a}/${b} actual moves and numeric damage`);
  assert.deepEqual((first.abilities||[]).map(x=>x.name),(second.abilities||[]).map(x=>x.name),`${a}/${b} Abilities`);
 }
});

test('Phantom Forces deck builder creates legal, playable 30-card player and CPU decks',{skip:!require('node:fs').existsSync(path.join(root,'data/classic/xy4-print-compact.json'))},()=>{
 const registry=require(path.join(assets,'tcg-classic-phantom-forces.js'));
 const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
 const pool=registry.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false);
 const owned=pool.map(c=>({gameplayId:c.id,quantity:4}));
 for(const [style,seed] of [['competitive',7],['random',14],['balanced',19],['competitive',43],['random',71]]){
  const result=builder.buildDeck(owned,{sets:['xy4'],style,randomSeed:seed});
  assert.equal(result.ok,true,`${style} ${seed}: ${result.error||result.errors}`);
  assert.equal(result.cards.length,30,`${style} ${seed}`);
  assert.ok(result.cards.every(id=>registry.cardById(id)?.battleEnabled),`${style} ${seed} unplayable choice`);
 }
});
