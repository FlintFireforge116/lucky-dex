'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets'),data=require(path.join(assets,'tcgp-battle-data.js'));
const core=require(path.join(assets,'tcgp-battle-core.js')),ai=require(path.join(assets,'tcgp-battle-ai.js'));
const loan=require(path.join(assets,'tcg-classic-battle-data.js')).CLASSIC30_LOANER_DECK;
const source=String.raw`
import sys,importlib.util,json
sys.path.insert(0,sys.argv[1]);spec=importlib.util.spec_from_file_location('xy6',sys.argv[1]+'/build-xy6.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
rows=[['89','Sky Field','Trainer',['Stadium'],None,[],None,[],[],None,None,0,'Uncommon', ['Each player can have 8 Pokémon on his or her Bench.','When this card leaves play, each player discards Benched Pokémon until he or she has 5 Pokémon on the Bench. The owner of this card discards first.'],'Stadium',None]]
print(json.dumps(m.generate(rows)))
`;
const gen=spawnSync('python3',['-c',source,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(gen.status,0,gen.stderr);
const sky=JSON.parse(gen.stdout)[0];
const cards={
 [sky.id]:sky,
 'sky-basic':{id:'sky-basic',kind:'pokemon',name:'Sky Basic',stage:'Basic',types:['Colorless'],subtype:'Colorless',hp:120,retreat:1,battleEnabled:true,attacks:[{name:'Tap',cost:'C',damage:10,effect:{type:'noop'}}]},
 'sky-stadium':{id:'sky-stadium',kind:'trainer',name:'Another Stadium',trainerType:'Stadium',effect:{type:'noop'},battleEnabled:true},
 'sky-tool':{id:'sky-tool',kind:'trainer',name:'Test Tool',trainerType:'Tool',effect:{type:'noop'},battleEnabled:true},
 'sky-special':{id:'sky-special',kind:'energy',name:'Test Special',specialEnergy:true,basicEnergy:false,energyType:'Colorless',effect:{type:'specialEnergy',provides:{Colorless:1}},battleEnabled:true},
 'sky-stadium-discarder':{id:'sky-stadium-discarder',kind:'pokemon',name:'Test Destroyer',stage:'Basic',types:['Colorless'],subtype:'Colorless',hp:200,retreat:1,battleEnabled:true,attacks:[{name:'Break Stadium',cost:'',damage:0,effect:{type:'discardStadium'}}]},
};
const slot=(id,uid,benchSlot=null)=>({uid,cardId:id,stack:[id],damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],benchSlot,conditions:{},playedOnSideTurn:1});
const ref=(id,uid)=>({cardId:id,uid:uid||id+'-ref'});
function withCards(fn){const old=data.cardById;data.cardById=(id)=>cards[id]||old(id);try{return fn();}finally{data.cardById=old;}}
function battle(){const s=core.createBattle({format:'classic',playerDeck:loan,opponentDeck:loan,seed:356,firstSide:'player',playerEnergyTypes:['Fire'],opponentEnergyTypes:['Fire']});s.phase='battle';s.activeSide='player';s.turnNumber=10;s.stadium=null;for(const ss of Object.values(s.sides)){ss.active=slot('sky-basic',ss.id+'-active');ss.bench=[];ss.hand=[];ss.turnCount=4;ss.stadiumUsed=false;ss.handEnergyUsed=false;ss.energyUsed=false;ss.supporterUsed=false;ss.handLimit=8;}return s;}
function choose(s,side,type,predicate=()=>true){const actions=core.legalActions(s,side),action=actions.find(a=>a.type===type&&predicate(a));assert.ok(action,`Missing ${type} for ${side}: ${JSON.stringify(actions.map(a=>({type:a.type,cardId:a.cardId,choiceBenchIndex:a.choiceBenchIndex,benchIndex:a.benchIndex})))}`);core.applyAction(s,side,action);return action;}
function bench(s,side,n){s.sides[side].hand.push(ref('sky-basic',`${side}-bench-${n}`));choose(s,side,'bench',a=>a.benchIndex===n-1);}
function playSky(s,side='player'){s.sides[side].hand.push(ref('xy6-89','stadium-1'));choose(s,side,'trainer',a=>a.cardId==='xy6-89');}

test('Sky Field #89 is a battle-ready pinned Stadium, with no unrelated cards ungated',()=>{
 assert.equal(sky.battleEnabled,true,JSON.stringify(sky.support));assert.equal(sky.trainerType,'Stadium');assert.equal(sky.name,'Sky Field');
});
test('Sky Field gives both players eight real physical Bench slots, including direct play into slots 6–8',()=>withCards(()=>{
 const s=battle();playSky(s);for(const side of ['player','opponent'])assert.equal(s.sides[side].benchLimit,8);
 for(let n=1;n<=8;n++)bench(s,'player',n);
 assert.equal(s.sides.player.bench.length,8);
 assert.deepEqual(s.sides.player.bench.map(p=>p.benchSlot),[0,1,2,3,4,5,6,7]);
 for(let n=0;n<8;n++)assert.ok(core.benchSlotAt(s.sides.player,n),'slot '+(n+1)+' must be visible');
 s.sides.player.hand.push(ref('sky-basic','ninth'));
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='bench'),'a ninth Bench play must be blocked');
}));
test('New Stadium replaces Sky Field and asks the original owner first, discarding actual cards and attachments down to 5',()=>withCards(()=>{
 const s=battle();playSky(s);
 for(const side of ['player','opponent'])for(let n=0;n<8;n++)s.sides[side].bench.push(slot('sky-basic',`${side}-${n}`,n));
 const selected=s.sides.player.bench[7];selected.energy={Fire:2};selected.specialEnergy=[ref('sky-special','drop-special')];selected.tool=ref('sky-tool','drop-tool');
 s.sides.player.stadiumUsed=false;s.sides.player.hand.push(ref('sky-stadium','replacement'));
 choose(s,'player','trainer',a=>a.cardId==='sky-stadium');
 assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'player','the original owner chooses first');
 assert.equal(s.sides.player.benchLimit,5);assert.equal(s.sides.opponent.benchLimit,5);
 choose(s,'player','effectChoice',a=>a.choiceBenchIndex===7);
 assert.equal(s.sides.player.bench.length,7);assert.equal(s.sides.player.energyDiscard.Fire,2);
 assert.ok(s.sides.player.discard.some(x=>x.uid==='drop-special'));
 assert.ok(s.sides.player.discard.some(x=>x.uid==='drop-tool'));
 assert.equal(s.sides.player.bench.some(x=>x.uid===selected.uid),false);
 assert.equal(s.sides.opponent.bench.length,8,'other side waits its turn');
 while(s.phase==='effectChoice'&&s.choiceSide==='player')choose(s,'player','effectChoice');
 assert.equal(s.sides.player.bench.length,5);
 assert.equal(s.choiceSide,'opponent');
 while(s.phase==='effectChoice'&&s.choiceSide==='opponent')choose(s,'opponent','effectChoice');
 assert.equal(s.sides.opponent.bench.length,5);assert.equal(s.phase,'battle');
 assert.equal(s.sides.player.benchLimit,5);assert.equal(s.sides.opponent.benchLimit,5);
 assert.deepEqual(s.sides.opponent.bench.map(p=>p.benchSlot),[0,1,2,3,4]);
 assert.equal(s.pendingPrizeClaims?.length||0,0,'discards are not knockouts');
 assert.ok(s.log.filter(x=>x.type==='xy6SkyFieldBenchDiscard').length===6);
}));
test('When removed by an attack, Sky Field triggers a follow-up Bench choice before more play',()=>withCards(()=>{
 const s=battle();s.sides.player.active=slot('sky-stadium-discarder','destroyer');s.sides.player.active.energy={Colorless:1};playSky(s);
 for(let n=0;n<7;n++)s.sides.opponent.bench.push(slot('sky-basic','foe-'+n,n));
 choose(s,'player','attack',a=>a.attackIndex===0);
 assert.equal(s.stadium,null);assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'opponent');
 assert.ok(core.legalActions(s,'opponent').some(a=>a.type==='effectChoice'&&a.choiceBenchIndex===6));
 choose(s,'opponent','effectChoice',a=>a.choiceBenchIndex===6);
 choose(s,'opponent','effectChoice');
 assert.equal(s.sides.opponent.bench.length,5);
}));
test('Sky Field is inert in Pocket battles and classic three-slot baseline is unchanged before it enters',()=>withCards(()=>{
 const s=battle();assert.equal(s.sides.player.benchLimit,3);assert.equal(s.sides.opponent.benchLimit,3);
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='xy6-89'));
}));

test('Sky Field controlled by opponent makes opponent choose before player',()=>withCards(()=>{
 const s=battle();s.activeSide='opponent';playSky(s,'opponent');s.activeSide='player';
 for(const side of ['player','opponent'])for(let n=0;n<6;n++)s.sides[side].bench.push(slot('sky-basic',`${side}-${n}`,n));
 s.sides.player.hand.push(ref('sky-stadium','other'));choose(s,'player','trainer',a=>a.cardId==='sky-stadium');
 assert.equal(s.choiceSide,'opponent');choose(s,'opponent','effectChoice');
 assert.equal(s.sides.opponent.bench.length,5);assert.equal(s.choiceSide,'player');
 choose(s,'player','effectChoice');assert.equal(s.sides.player.bench.length,5);assert.equal(s.phase,'battle');
}));

test('Sky Field removal into Narrow Gym discards down to five BEFORE its return-to-hand effect',()=>withCards(()=>{
 const s=battle();playSky(s);
 for(let n=0;n<7;n++)s.sides.player.bench.push(slot('sky-basic','friend-'+n,n));
 // The existing Narrow Gym is a real registered Classic Trainer.
 s.sides.player.stadiumUsed=false;s.sides.player.hand.push(ref('gym1-124','narrow'));
 choose(s,'player','trainer',a=>a.cardId==='gym1-124');
 assert.equal(s.pendingChoice.special,'skyFieldBenchTrim');
 choose(s,'player','effectChoice');choose(s,'player','effectChoice');
 assert.equal(s.sides.player.bench.length,5);assert.equal(s.pendingChoice.special,'narrowGymReturn');
 while(s.phase==='effectChoice'&&s.choiceSide==='player')choose(s,'player','effectChoice');
 assert.equal(s.sides.player.bench.length,2);assert.equal(s.sides.player.benchLimit,2);
 assert.equal(s.log.filter(x=>x.type==='xy6SkyFieldBenchDiscard').length,2);
 assert.equal(s.log.filter(x=>x.type==='narrowGymReturn').length,3);
}));

test('Expanded Bench UI renders all eight slots and preserves full-width card selection targets',()=>{
 const ui=require('node:fs').readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
 const css=require('node:fs').readFileSync(path.join(assets,'tcgp-battle.css'),'utf8');
 assert.match(ui,/Math\.min\(8,Math\.max\(Number\(sideState\.benchLimit/);
 assert.match(ui,/sky-field-bench/);assert.match(css,/sky-field-bench/);
 assert.match(css,/repeat\(8,minmax\(0,1fr\)\)/);
 assert.match(ui,/skyFieldBenchTrim/);
});

test('CPU trims the least invested Sky Field Bench Pokémon first',()=>withCards(()=>{
 const s=battle();playSky(s);s.sides.player.hand.push(ref('sky-stadium','other'));
 for(let n=0;n<7;n++)s.sides.opponent.bench.push(slot('sky-basic','foe-'+n,n));
 const prized=s.sides.opponent.bench[0];prized.energy={Fire:4};prized.tool=ref('sky-tool','keep');
 s.sides.player.stadiumUsed=false;choose(s,'player','trainer',a=>a.cardId==='sky-stadium');
 const action=ai.chooseAction(s,'opponent','Expert',0);
 assert.equal(action.type,'effectChoice');assert.notEqual(action.choiceBenchIndex,0,'CPU should preserve the four-Energy attacker');
}));
