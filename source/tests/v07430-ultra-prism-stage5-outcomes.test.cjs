'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const f=JSON.parse(execFileSync('python3',['scripts/sm5_stage5_fixture.py'],{cwd:root,encoding:'utf8'}));
const core=require('../app/src/main/assets/tcgp-battle-core.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const ref=(id,uid)=>({cardId:id,uid});
const slot=(id,uid,energy={})=>({cardId:id,uid,stack:[id],energy:{...energy},specialEnergy:[],damage:0,tool:null,extraTools:[],conditions:{},playedOnSideTurn:1});
const enIds={Psychic:'sm5-fixture-P',Darkness:'sm5-fixture-D',Metal:'sm5-fixture-M'};
const name='Ultra Prism Stage 5';
function pokemon(id,name,attacks=[],abilities=[],extra={}){return {id,name,kind:'pokemon',stage:'Basic',hp:180,types:['Psychic'],subtype:'Psychic',retreat:0,weakness:null,resistance:null,prizeCards:1,battleEnabled:true,deckEligible:true,prismStar:/^sm5-(58|62|77|89)$/.test(id),attacks:attacks.map((n)=>({name:n,cost:['C'],damage:n==='Psystorm'?0:n==='Abyssal Sleep'?120:n==='Crisis Dive'?160:n==='Corona Impact'?160:0,effect:f.attacks[n]})),abilities:abilities.map(n=>({name:n,printedPowerType:'ability',disabledByStatus:false,...f.abilities[n]})),...extra};}
function setup(){
 const cards=new Map();let original=data.cardById;
 const add=c=>(cards.set(c.id,c),c);
 const p=add(pokemon('sm5-fixture-attacker','Attacker',['Psystorm','Crisis Dive','Abyssal Sleep','Radiant Star','Full Moon Star','Corona Impact']));
 add(pokemon('sm5-fixture-defender','Defender',[/*plain*/]));
 add(pokemon('sm5-fixture-bench','Bench'));
 for(const [type,id] of Object.entries(enIds))add({id,kind:'energy',name:`${type} Energy`,subtype:type,energyType:type,basicEnergy:true,battleEnabled:true});
 for(const [id,name,abi] of [['sm5-58','Giratina ◇','Chaotic Star'],['sm5-77','Darkrai ◇','Nightmare Star']])add(pokemon(id,name,[],[abi]));
 add({id:'sm5-120',name:'Cyrus ◇',kind:'trainer',trainerType:'Supporter',prismStar:true,battleEnabled:true,deckEligible:true,effect:f.trainers['Cyrus ◇']});
 data.cardById=id=>cards.get(id)||original(id);
 let state;try{state=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:74101,firstSide:'player',playerEnergyTypes:['Psychic','Metal','Darkness'],opponentEnergyTypes:['Psychic','Metal','Darkness']});}catch(e){data.cardById=original;throw e;}
 state.phase='battle';state.activeSide='player';state.turnNumber=5;
 for(const who of ['player','opponent']){const ss=state.sides[who];ss.hand=[];ss.discard=[];ss.lostZone=[];ss.energyDiscard={};ss.deck=Array.from({length:12},(_,i)=>ref('sm4-1',`${who}-deck-${i}`));ss.prizes=Array.from({length:5},(_,i)=>ref('sm4-1',`${who}-prize-${i}`));ss.energyUsed=true;ss.handEnergyUsed=true;ss.supporterUsed=false;ss.turnCount=3;}
 state.sides.player.active=slot(p.id,'pa',{Psychic:6,Metal:6,Darkness:6});state.sides.player.bench=[slot('sm5-fixture-bench','pb')];
 state.sides.opponent.active=slot('sm5-fixture-defender','oa');state.sides.opponent.bench=[slot('sm5-fixture-bench','ob')];
 return {state,cards,restore(){data.cardById=original;}};
}
function attack(h,n){const a=h.cards.get('sm5-fixture-attacker');a.attacks=[a.attacks.find(x=>x.name===n)];assert.ok(a.attacks[0]);const list=core.legalActions(h.state,'player');const move=list.find(x=>x.type==='attack');assert.ok(move,`${n} should be available: ${JSON.stringify(core.attackAvailability(h.state,'player',0))}`);core.applyAction(h.state,'player',move);}
function choose(h,n=0,side=null){const st=h.state;assert.equal(st.phase,'effectChoice',`${name}: choice expected`);assert.equal(st.choiceSide,side||st.choiceSide);const opts=core.legalActions(st,st.choiceSide).filter(x=>x.type==='effectChoice');assert.ok(opts.length,'No legal options for pending choice');assert.ok(opts[n],`Option ${n} missing: ${JSON.stringify(opts)}`);core.applyAction(st,st.choiceSide,opts[n]);return opts[n];}
function drain(h,limit=12){let n=0;while(h.state.phase==='effectChoice'&&n++<limit)choose(h,0);assert.ok(n<limit,'Choice chain did not terminate');}
function totalEnergy(h){return Object.values(h.state.sides.player.active.energy).reduce((n,v)=>n+v,0);}

test('SM5 Stage 5 descriptors are supported and source-locked',()=>{
 assert.equal(Object.keys(f.attacks).length,6);assert.equal(Object.keys(f.abilities).length,2);assert.equal(Object.keys(f.trainers).length,1);
 for(const [name,eff] of Object.entries(f.attacks))assert.deepEqual(fx.validateEffect(eff),[],name);
 for(const [name,abi] of Object.entries(f.abilities))assert.deepEqual(fx.validateEffect(abi.effect),[],name);
 for(const [name,eff] of Object.entries(f.trainers))assert.deepEqual(fx.validateEffect(eff),[],name);
});

test('Giratina hand-only triggered ability uses actual Psychic Energy cards, two at most',()=>{
 const h=setup();try{const s=h.state.sides.player;s.hand=[ref('sm5-58','giratina-uid'),ref(enIds.Psychic,'P1'),ref(enIds.Psychic,'P2'),ref(enIds.Psychic,'P3')];
 const move=core.legalActions(h.state,'player').find(x=>x.type==='bench'&&x.cardId==='sm5-58');assert.ok(move);core.applyAction(h.state,'player',move);assert.equal(h.state.phase,'effectChoice');
 choose(h,0,'player');assert.equal(s.bench.find(x=>x.cardId==='sm5-58').energy.Psychic,1);choose(h,0,'player');
 assert.equal(s.bench.find(x=>x.cardId==='sm5-58').energy.Psychic,2);assert.equal(s.hand.filter(r=>r.cardId===enIds.Psychic).length,1);
 assert.equal(h.state.phase,'battle');}finally{h.restore();}
});

test('Giratina may decline its triggered attachment without consuming Energy',()=>{
 const h=setup();try{const s=h.state.sides.player;s.hand=[ref('sm5-58','giratina'),ref(enIds.Psychic,'P1')];core.applyAction(h.state,'player',core.legalActions(h.state,'player').find(x=>x.type==='bench'&&x.cardId==='sm5-58'));
 choose(h,1);assert.equal(h.state.phase,'battle');assert.equal(s.hand.find(r=>r.uid==='P1')?.cardId,enIds.Psychic);assert.equal(Number(s.bench.find(x=>x.cardId==='sm5-58')?.energy.Psychic||0),0);}finally{h.restore();}
});

test('Darkrai attaches only real Darkness from hand; Energy Zone cannot replace it',()=>{
 const h=setup();try{const s=h.state.sides.player;s.hand=[ref('sm5-77','darkrai')];s.energySupply=['Darkness','Darkness'];core.applyAction(h.state,'player',core.legalActions(h.state,'player').find(x=>x.type==='bench'&&x.cardId==='sm5-77'));
 assert.equal(h.state.phase,'battle');assert.equal(Number(s.bench.find(x=>x.cardId==='sm5-77').energy.Darkness||0),0);
 }finally{h.restore();}
});

test('Crisis Dive discards exactly two of attached Energy (real discard ledger)',()=>{
 const h=setup();try{const before=totalEnergy(h);attack(h,'Crisis Dive');assert.equal(totalEnergy(h),before-2);assert.equal(Object.values(h.state.sides.player.energyDiscard).reduce((a,b)=>a+b,0),2);}finally{h.restore();}
});

test('Abyssal Sleep imposes two-coin recovery condition',()=>{
 const h=setup();try{attack(h,'Abyssal Sleep');const sleep=h.state.sides.opponent.active.conditions.sleep;assert.equal(sleep?.recoveryCoins,2);}finally{h.restore();}
});

test('Psystorm counts both players full boards, each physical Special Energy card once',()=>{
 const h=setup();try{const s=h.state;s.sides.player.active.energy={Psychic:4};s.sides.player.bench[0].energy={Metal:2};s.sides.opponent.active.energy={Grass:1};s.sides.opponent.bench[0].specialEnergy=[ref('sm5-137','unit-energy')];attack(h,'Psystorm');assert.equal(s.sides.opponent.active.damage,160);}finally{h.restore();}
});

test('Radiant Star recovers Metal from discard only, chooses one recipient per opponent Pokemon',()=>{
 const h=setup();try{const s=h.state;s.sides.player.energyDiscard={Metal:3};s.sides.player.active.energy={Metal:2};const b=s.sides.player.bench[0];b.energy={};const old=s.sides.player.energySupply;s.sides.player.energySupply=['Metal','Metal','Metal'];attack(h,'Radiant Star');assert.equal(s.phase,'effectChoice');
 choose(h,1);choose(h,1);assert.equal(b.energy.Metal,2);assert.equal(s.sides.player.energyDiscard.Metal,1);assert.deepEqual(s.sides.player.energySupply,['Metal','Metal','Metal']);assert.equal(s.phase,'battle');}finally{h.restore();}
});

test('Full Moon Star cannot attach Energy absent from physical discard',()=>{
 const h=setup();try{h.state.sides.player.energyDiscard={};h.state.sides.player.energySupply=['Psychic','Psychic','Psychic'];attack(h,'Full Moon Star');assert.equal(h.state.phase,'battle');assert.equal(h.state.sides.player.bench[0].energy.Psychic||0,0);}finally{h.restore();}
});

test('Corona Impact blocks entire next own attack turn',()=>{
 const h=setup();try{attack(h,'Corona Impact');assert.ok(h.state.sides.player.active.locks.some(x=>x.action==='attack'));}finally{h.restore();}
});

test('Cyrus requires Water or Metal Active before Supporter can be played',()=>{
 const h=setup();try{const s=h.state.sides.player;s.hand=[ref('sm5-120','cyrus')];h.cards.get('sm5-fixture-attacker').types=['Psychic'];assert.equal(core.legalActions(h.state,'player').some(x=>x.type==='trainer'&&x.cardId==='sm5-120'),false);
 h.cards.get('sm5-fixture-attacker').types=['Metal'];assert.equal(core.legalActions(h.state,'player').some(x=>x.type==='trainer'&&x.cardId==='sm5-120'),true);
 }finally{h.restore();}
});

test('Cyrus opponent chooses exactly two survivor Bench Pokemon (including attachment conservation)',()=>{
 const h=setup();try{const s=h.state,us=s.sides.player,them=s.sides.opponent;h.cards.get('sm5-fixture-attacker').types=['Water'];us.hand=[ref('sm5-120','cyrus-physical')];them.bench=[slot('sm5-fixture-bench','keep1'),slot('sm5-fixture-bench','removed',{Metal:2}),slot('sm5-fixture-bench','keep2')];them.bench.forEach((p,i)=>p.benchSlot=i);them.bench[1].specialEnergy=[ref('sm5-137','special-uid')];them.bench[1].tool=ref('sm4-113','tool-uid');const before=them.deck.length;
 const move=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='sm5-120');assert.ok(move);core.applyAction(s,'player',move);assert.equal(s.choiceSide,'opponent');
 choose(h,0,'opponent');assert.equal(s.choiceSide,'opponent');choose(h,1,'opponent');
 assert.deepEqual(them.bench.map(x=>x.uid),['keep1','keep2']);assert.equal(them.deck.length,before+5); // removed basic stack, Special, Tool and 2 Basic Energy
 assert.ok(them.deck.some(r=>r.uid==='special-uid'));assert.ok(them.deck.some(r=>r.uid==='tool-uid'));
 assert.equal(them.discard.length,0);assert.equal(s.phase,'battle');assert.equal(us.lostZone.some(r=>r.uid==='cyrus-physical'),true);
 }finally{h.restore();}
});

test('Cyrus does not enter a choice loop when opponent has two or fewer Benched Pokemon',()=>{
 const h=setup();try{const s=h.state;s.sides.player.hand=[ref('sm5-120','cyrus-short')];h.cards.get('sm5-fixture-attacker').types=['Water'];const move=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='sm5-120');assert.ok(move);core.applyAction(s,'player',move);assert.equal(s.phase,'battle');assert.equal(s.sides.opponent.bench.length,1);}finally{h.restore();}
});

test('Darkrai hand-only trigger offers correct choices on CPU side, not just player',()=>{
 const h=setup();try{const state=h.state,s=state.sides.opponent;state.activeSide='opponent';
 s.hand=[ref('sm5-77','cpu-darkrai'),ref(enIds.Darkness,'cpu-D1'),ref(enIds.Darkness,'cpu-D2')];
 const move=core.legalActions(state,'opponent').find(a=>a.type==='bench'&&a.cardId==='sm5-77');assert.ok(move);
 core.applyAction(state,'opponent',move);assert.equal(state.choiceSide,'opponent');
 choose(h,0,'opponent');choose(h,0,'opponent');
 assert.equal(s.bench.find(p=>p.cardId==='sm5-77').energy.Darkness,2);assert.equal(state.phase,'battle');
 }finally{h.restore();}
});

test('Discarded actual Basic Energy card from discard pile is recovered by Full Moon Star, not synthetic Zone Energy',()=>{
 const h=setup();try{const state=h.state,s=state.sides.player;s.energyDiscard={};s.discard=[ref(enIds.Psychic,'physical-P')];s.energySupply=['Psychic'];
 attack(h,'Full Moon Star');assert.equal(state.phase,'effectChoice');choose(h,1);
 assert.equal(s.discard.length,0);assert.equal(s.bench[0].energy.Psychic,1);assert.equal(s.energySupply.length,1);assert.equal(state.phase,'battle');
 }finally{h.restore();}
});

test('Knocked-out Prism Star Pokemon enters Lost Zone, not discard, on both sides',()=>{
 for(const victim of ['player','opponent']){const h=setup();try{const state=h.state,attackerSide=victim==='player'?'opponent':'player';state.activeSide=attackerSide;
 const prism=state.sides[victim].active;prism.cardId='sm5-58';prism.stack=['sm5-58'];prism.damage=170;
 const actor=state.sides[attackerSide].active,card=data.cardById(actor.cardId);const orig=card.attacks;
 card.attacks=[{name:'Prism knockout',cost:['C'],damage:40,effect:{type:'noop'}}];actor.energy.Colorless=2;
 try{const action=core.legalActions(state,attackerSide).find(x=>x.type==='attack');assert.ok(action);core.applyAction(state,attackerSide,action);
 assert.equal(state.sides[victim].discard.some(r=>r.cardId==='sm5-58'),false);
 assert.equal(state.sides[victim].lostZone.some(r=>r.cardId==='sm5-58'),true);
 const actual=state.sides[victim].lostZone.find(r=>r.cardId==='sm5-58');assert.equal(actual.uid,prism.uid,'Prism Pokemon must retain its original Basic physical UID');
 }finally{card.attacks=orig;}
 }finally{h.restore();}}
});
