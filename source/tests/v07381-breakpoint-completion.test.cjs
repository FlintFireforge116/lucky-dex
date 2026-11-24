'use strict';
// BREAKpoint v0.69.381: final four, real choice/card identity tests.
const {test}=require('node:test'), assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const contract=require('../scripts/xy9_release_contract.json');
const rule=name=>({type:'neoRule',rule:'xy9:'+name});
const python=code=>{const p=spawnSync('python3',['-c',code,path.join(root,'scripts')],{encoding:'utf8'});assert.equal(p.status,0,p.stderr);return JSON.parse(p.stdout)};
function scene(){
 const cards={a:{id:'a',name:'Pikachu',kind:'pokemon',stage:'Basic',hp:100,types:['Lightning']},
  basic:{id:'basic',name:'Basic Water',kind:'pokemon',stage:'Basic',hp:100,types:['Water']},
  stage:{id:'stage',name:'Stage One',kind:'pokemon',stage:'Stage 1',hp:100,types:['Water']},
  water:{id:'water',name:'Water Energy',kind:'energy',basicEnergy:true,energyType:'Water',subtype:'Water'},
  fire:{id:'fire',name:'Fire Energy',kind:'energy',basicEnergy:true,energyType:'Fire',subtype:'Fire'},
  other:{id:'other',name:'Other',kind:'trainer',trainerType:'Item'},
  'xy9-109':{id:'xy9-109',name:'Puzzle of Time',kind:'trainer',trainerType:'Item'},
  copySource:{id:'copySource',name:'Original attacker',kind:'pokemon',stage:'Basic',hp:100,attacks:[{name:'Burning Strike',damage:50,effect:{type:'status',target:'opponentActive',status:'burn'}}]},
  switched:{id:'switched',name:'New attacker',kind:'pokemon',stage:'Basic',hp:120,attacks:[]}
 };
 const slot=(cardId,uid,extra={})=>({uid,cardId,benchSlot:0,stack:[cardId],energy:{},specialEnergy:[],damage:0,conditions:{},...extra});
 const p={active:slot('a','active'),bench:[slot('basic','ben',{benchSlot:0})],hand:[],deck:[],discard:[],energySupply:[],energyDiscard:{},turnCount:2,prizes:[{uid:'pr1'}]};
 const o={active:slot('switched','foe'),bench:[],hand:[],deck:[],discard:[],energySupply:[],energyDiscard:{},turnCount:2,prizes:[]};
 const state={format:'classic',activeSide:'player',turnNumber:9,phase:'battle',sides:{player:p,opponent:o},log:[]};
 const choices=[],events=[];let shuffles=0;
 const ctx={state,side:'player',foeSide:'opponent',attacker:p.active,defender:o.active,isAttack:false,cardById:id=>cards[id]||null,
  random:()=>0.1,requestChoice:choice=>choices.push(choice),shuffle:()=>{shuffles++},onEnergyAttached:(...x)=>events.push(x),
  drawCard:ss=>{const ref=ss.deck.shift();if(ref)ss.hand.push(ref);return ref;}};
 const choose=(effect,action)=>fx.applyEffect(effect,{...ctx,resolvingChoice:true,action});
 return {cards,slot,p,o,state,ctx,choices,events,choose,shuffles:()=>shuffles};
}
function ref(cardId,uid){return {cardId,uid};}
test('all final XY9 printed effects are mapped and the release contract is 126/126',()=>{
 assert.equal(contract.expectedPlayable,126);assert.deepEqual(contract.expectedGated,[]);
 assert.deepEqual(contract.completionPlayable,['67','102','109','113']);
 const m=python("import sys,json;sys.path.insert(0,sys.argv[1]);import xy9_verified as v;print(json.dumps({'attack':v.ATK.get(('67','Watch and Learn')),'maxElixir':v.TRAINERS.get('102'),'puzzle':v.TRAINERS.get('109'),'splash':v.ENERGIES.get('113')}))");
 assert.equal(m.attack.rule,'xy9:watchAndLearn');assert.equal(m.maxElixir[0],'Item');assert.equal(m.puzzle[0],'Item');
 assert.equal(m.splash.type,'specialEnergy');assert.equal(m.splash.provides.Water,1);
 for(const v of [m.attack,m.maxElixir[1],m.puzzle[1],m.splash])assert.deepEqual(fx.validateEffect(v),[]);
});
test('Watch and Learn copies the actual previous attack, even after the opponent switched',()=>{
 const s=scene();s.o.lastAttackTurn=8;s.o.lastAttackName='Burning Strike';s.o.lastAttackCardId='copySource';
 const out=fx.resolveAttack({name:'Watch and Learn',damage:0,effect:rule('watchAndLearn')},{...s.ctx,isAttack:true});
 assert.equal(out.damage,50);assert.ok(out.pendingEffects.some(e=>e.type==='status'&&e.status==='burn'));
 assert.equal(s.state.log.at(-1).fromCardId,'copySource');
});
test('Watch and Learn does not copy an older attack, a missing source, or itself recursively',()=>{
 const s=scene();s.o.lastAttackTurn=7;s.o.lastAttackName='Burning Strike';s.o.lastAttackCardId='copySource';
 assert.equal(fx.resolveAttack({name:'Watch and Learn',damage:0,effect:rule('watchAndLearn')},{...s.ctx,isAttack:true}).damage,0);
 s.o.lastAttackTurn=8;s.o.lastAttackCardId='notReal';
 assert.equal(fx.resolveAttack({name:'Watch and Learn',damage:0,effect:rule('watchAndLearn')},{...s.ctx,isAttack:true}).damage,0);
});
test('Max Elixir sees only the top six PHYSICAL cards, not a later Basic Energy',()=>{
 const s=scene();s.p.deck=[...Array.from({length:6},(_,i)=>ref('other','t'+i)),ref('water','seventh')];
 fx.applyEffect(rule('maxElixir'),s.ctx);
 assert.equal(s.choices.length,0);assert.equal(s.p.bench[0].energy.Water||0,0);
 assert.equal(s.p.deck.length,7);assert.equal(s.shuffles(),1);
});
test('Max Elixir chooses one Basic Bench recipient and a real physical top-six Energy',()=>{
 const s=scene();s.p.deck=[ref('other','0'),ref('fire','picked'),ref('water','unused'),...Array.from({length:4},(_,i)=>ref('other','x'+i))];
 s.p.bench.push(s.slot('stage','stagebench',{benchSlot:1}));
 fx.applyEffect(rule('maxElixir'),s.ctx);let q=s.choices.pop();assert.equal(q.kind,'pokemon');assert.equal(q.includeActive,false);assert.equal(q.filter.stage,'Basic');
 s.choose(q.effect,{choiceTarget:'bench',choiceBenchIndex:0});q=s.choices.pop();assert.equal(q.kind,'topDeckCard');assert.equal(q.count,6);
 s.choose(q.effect,{choiceDeckIndex:1});
 assert.equal(s.p.bench[0].energy.Fire,1);assert.equal(s.p.bench[1].energy.Fire||0,0);
 assert.equal(s.p.deck.length,6);assert.equal(s.p.deck.some(x=>x.uid==='picked'),false);
 assert.equal(s.shuffles(),1);assert.equal(s.events.length,1);
});
test('Max Elixir substitutes at most six ordered Energy Zone units when no physical Basic Energy exists',()=>{
 const s=scene();s.p.deck=[ref('other','d')];s.p.energySupply=['Water','Fire','Fire','Water','Water','Water','Fire'];
 fx.applyEffect(rule('maxElixir'),s.ctx);let q=s.choices.pop();s.choose(q.effect,{choiceTarget:'bench',choiceBenchIndex:0});
 q=s.choices.pop();assert.equal(q.kind,'option');assert.equal(q.options.length,6);
 s.choose(q.effect,{choiceOption:1});
 assert.deepEqual(s.p.energySupply,['Water','Fire','Water','Water','Water','Fire']);
 assert.equal(s.p.bench[0].energy.Fire,1);assert.equal(s.p.deck.length,1);assert.equal(s.shuffles(),1);
});
test('one Puzzle of Time reorders the top three physical cards without transferring any to hand',()=>{
 const s=scene();s.p.deck=[ref('a','a'),ref('basic','b'),ref('other','c'),ref('other','d')];
 const first=ref('xy9-109','puzzle1');s.p.discard=[first];
 fx.applyEffect(rule('puzzleOfTime'),{...s.ctx,trainerRef:first});let q=s.choices.pop();assert.equal(q.kind,'topDeckCard');
 s.choose(q.effect,{choiceDeckIndex:2});q=s.choices.pop();assert.equal(q.kind,'topDeckCard');
 s.choose(q.effect,{choiceDeckIndex:0});q=s.choices.pop();s.choose(q.effect,{choiceDeckIndex:1});
 assert.deepEqual(s.p.deck.map(x=>x.uid),['c','a','b','d']);assert.equal(s.p.hand.length,0);assert.equal(s.p.discard.length,1);
});
test('two Puzzle of Time copies consume two distinct real cards before selecting two discard cards',()=>{
 const s=scene();const first=ref('xy9-109','puzzle1'),second=ref('xy9-109','puzzle2');
 s.p.discard=[ref('other','r1'),ref('a','r2'),first];s.p.hand=[second,ref('basic','hand')];
 fx.applyEffect(rule('puzzleOfTime'),{...s.ctx,trainerRef:first});let q=s.choices.pop();assert.equal(q.kind,'option');assert.equal(q.options.length,2);
 s.choose(q.effect,{choiceOption:1});q=s.choices.pop();assert.equal(q.kind,'discardCard');
 assert.deepEqual(q.excludeUids,['puzzle1','puzzle2']);
 s.choose(q.effect,{choiceDiscardIndex:0});q=s.choices.pop();assert.equal(q.kind,'discardCard');
 s.choose(q.effect,{choiceDiscardIndex:0});
 assert.deepEqual(s.p.hand.map(x=>x.uid),['hand','r1','r2']);
 assert.deepEqual(s.p.discard.map(x=>x.uid),['puzzle1','puzzle2']);
 assert.equal(s.state.log.find(x=>x.type==='xy9PuzzlePair').cardUids.length,2);
});
test('Puzzle of Time cannot retrieve either just-played copy even when they are the only discarded cards',()=>{
 const s=scene();const first=ref('xy9-109','puzzle1'),second=ref('xy9-109','puzzle2');s.p.discard=[first];s.p.hand=[second];
 fx.applyEffect(rule('puzzleOfTime'),{...s.ctx,trainerRef:first});const q=s.choices.pop();s.choose(q.effect,{choiceOption:1});
 assert.equal(s.choices.length,0);assert.equal(s.p.hand.length,0);assert.deepEqual(s.p.discard.map(x=>x.uid),['puzzle1','puzzle2']);
});
test('Splash Energy uses the existing real-card KO path and prevents off-type hand attachments',()=>{
 const source=fs.readFileSync(path.join(root,'app/src/main/assets/tcgp-battle-core.js'),'utf8');
 assert.match(source,/card\.id==='xy9-113'&&!mon\?\.types\?\.includes\('Water'\)/);
 assert.match(source,/ref\.cardId==='xy9-113'\?'Water'/);
 // Knockout eligibility is checked by the executable cases below, not a
 // regex requiring adjacent predicates in the shared knockout pipeline.
 assert.match(source,/xy9SplashEnergyRescue/);assert.match(source,/discardKnockedOut\(s,slot\)/);
});

// Full battle integration: the branch is testable with a pre-existing classic
// Water Pokémon, independent of the pinned XY9 catalogue generation.
test('Splash Energy returns the KO Water Pokémon while discarding attachments and awarding a normal Prize',()=>{
 const core=require('../app/src/main/assets/tcgp-battle-core.js');
 const opponents=require('../app/src/main/assets/tcg-classic-opponents.js');
 const deck=opponents.generate({sets:['base1'],seed:381,type:'Water'});
 assert.equal(deck.ok,true);
 for(const evolved of [false,true]){
  const s=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,seed:381,firstSide:'opponent',playerEnergyTypes:['Water'],opponentEnergyTypes:['Colorless']});
  s.phase='battle';s.activeSide='opponent';s.turnNumber=8;s.log=[];
  for(const side of ['player','opponent']){const b=s.sides[side];b.turnCount=3;b.hand=[];b.discard=[];b.bench=[];b.energyDiscard={};b.supporterUsed=false;}
  const p=s.sides.player,o=s.sides.opponent;
  p.active=core.makePokemonSlot(evolved?'base1-6':'base1-35',3,'rescue-pokemon');
  if(evolved){p.active.stack=['base1-35','base1-6'];p.active.damage=40;}
  p.active.specialEnergy=[{uid:'splash-physical',cardId:'xy9-113',provides:{Water:1}}];
  p.active.energy={Water:1};
  p.bench=[core.makePokemonSlot('base1-41',3,'seel')];p.bench[0].benchSlot=0;
  o.active=core.makePokemonSlot('base1-3',3,'chansey');o.active.energy={Colorless:4};
  const beforePrizes=o.prizes.length;
  const attack=core.legalActions(s,'opponent').find(a=>a.type==='attack'&&a.attackIndex===1);
  assert.ok(attack,'Chansey Double-edge should be legal');
  core.applyAction(s,'opponent',attack);
  const rescued=evolved?'base1-6':'base1-35';
  assert.deepEqual(p.hand.map(r=>r.cardId),[rescued]);
  assert.ok(p.discard.some(r=>r.uid==='splash-physical'&&r.cardId==='xy9-113'));
  if(evolved)assert.ok(p.discard.some(r=>r.cardId==='base1-35'),'the undercard must be discarded');
  assert.equal(o.prizes.length,beforePrizes-1,'the opponent still earns a Prize');
  assert.ok(s.log.some(x=>x.type==='xy9SplashEnergyRescue'&&x.cardId===rescued));
  assert.equal(s.phase,'promote','the player must promote a new Active Pokémon after the knockout');
 }
});

// Team Up cross-era regression: the protection must stop the rescue, not
// the KO or its Prize award. Test both orientations and suppression.
for(const owner of ['player','opponent'])test(owner+' Splash Energy respects opposing Scoop-Up Block and Ability suppression',()=>{
 const core=require('../app/src/main/assets/tcgp-battle-core.js');
 const opponents=require('../app/src/main/assets/tcg-classic-opponents.js');
 const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
 const deck=opponents.generate({sets:['base1'],seed:381,type:'Water'});
 assert.equal(deck.ok,true);assert.ok(data.cardById('sm9-66')?.battleEnabled);
 const attacker=owner==='player'?'opponent':'player';
 for(const suppressed of [false,true]){
  const s=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,seed:381,firstSide:attacker,playerEnergyTypes:['Water'],opponentEnergyTypes:['Colorless']});
  s.phase='battle';s.activeSide=attacker;s.turnNumber=8;s.log=[];
  for(const side of ['player','opponent']){const b=s.sides[side];b.turnCount=3;b.hand=[];b.discard=[];b.bench=[];b.energyDiscard={};b.supporterUsed=false;}
  const p=s.sides[owner],o=s.sides[attacker];
  p.active=core.makePokemonSlot('base1-35',3,'rescue-pokemon');
  p.active.specialEnergy=[{uid:'splash-physical',cardId:'xy9-113',provides:{Water:1}}];p.active.energy={Water:1};
  p.bench=[core.makePokemonSlot('base1-41',3,'seel')];p.bench[0].benchSlot=0;
  o.active=core.makePokemonSlot('base1-3',3,'chansey');o.active.energy={Colorless:4};
  o.bench=[core.makePokemonSlot('sm9-66',3,'mime')];o.bench[0].benchSlot=0;
  if(suppressed)s.xy7HexManiacUntil=s.turnNumber;
  const before=o.prizes.length;const a=core.legalActions(s,attacker).find(a=>a.type==='attack'&&a.attackIndex===1);assert.ok(a);
  core.applyAction(s,attacker,a);
  assert.equal(p.hand.some(r=>r.cardId==='base1-35'),suppressed);
  assert.equal(p.discard.some(r=>r.cardId==='base1-35'),!suppressed);
  assert.ok(p.discard.some(r=>r.uid==='splash-physical'));
  if(s.pendingChoice?.special==='chooseClassicPrize'){const claim=core.legalActions(s,attacker).find(a=>a.type==='effectChoice');assert.ok(claim);core.applyAction(s,attacker,claim);}
  assert.equal(o.prizes.length,before-1);
  assert.equal(s.log.some(x=>x.type==='xy9SplashEnergyRescue'),suppressed);
  assert.equal(s.phase,'promote');
 }
});
