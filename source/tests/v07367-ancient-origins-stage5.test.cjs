'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcgp-battle-data.js'));
const effects=require(path.join(assets,'tcgp-battle-effects.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const loan=require(path.join(assets,'tcg-classic-battle-data.js')).CLASSIC30_LOANER_DECK;
const python=String.raw`
import sys,json,importlib.util
p=sys.argv[1];sys.path.insert(0,p)
s=importlib.util.spec_from_file_location('xy7',p+'/build-xy7.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
rows=[]
def pokemon(n,name,att,typ='Grass',sub=None,trait=None):
 rows.append([n,name,'Pokémon',sub or ['Basic'],230,[typ],None,att,[],None,None,2,'Rare',[],None,trait])
pokemon('8','M Sceptile-EX', [['Jagged Saber',['G','G','C'],'100','You may attach up to 2 Grass Energy cards from your hand to your Benched Pokémon in any way you like. If you attached Energy to a Pokémon in this way, heal all damage from that Pokémon.']],sub=['MEGA','EX'],trait={'name':'θ Stop','text':'Prevent effects of opponent abilities'})
pokemon('85','M Sceptile-EX', [['Jagged Saber',['G','G','C'],'100','You may attach up to 2 Grass Energy cards from your hand to your Benched Pokémon in any way you like. If you attached Energy to a Pokémon in this way, heal all damage from that Pokémon.']],sub=['MEGA','EX'],trait={'name':'θ Stop','text':'Prevent effects of opponent abilities'})
pokemon('12','Virizion', [['Bail Out',['G'],'','Put 2 Pokémon from your discard pile into your hand.'],['Prize Count',['G','C','C'],'40+','If you have more Prize cards left than your opponent, this attack does 80 more damage.']])
pokemon('51','Registeel', [['Iron Head',['M'],'30×','Flip a coin until you get tails. This attack does 30 damage times the number of heads.'],['Forbidden Iron Hammer',['M','C','C'],'70',"If your opponent's Active Pokémon is a Pokémon-EX, discard an Energy attached to that Pokémon."]],typ='Metal')
pokemon('68','Lugia-EX', [['Aero Ball',['C','C'],'20×','This attack does 20 damage times the amount of Energy attached to both Active Pokémon.'],['Deep Hurricane',['C','C','C'],'80+','If there is any Stadium card in play, this attack does 70 more damage. Then, discard that Stadium card.']],typ='Colorless',sub=['Basic','EX'])
pokemon('94','Lugia-EX', [['Aero Ball',['C','C'],'20×','This attack does 20 damage times the amount of Energy attached to both Active Pokémon.'],['Deep Hurricane',['C','C','C'],'80+','If there is any Stadium card in play, this attack does 70 more damage. Then, discard that Stadium card.']],typ='Colorless',sub=['Basic','EX'])
pokemon('36','Hoopa-EX',[['Hyperspace Fury',['P','P','C'],'',"Discard 2 Energy attached to this Pokémon. This attack does 100 damage to 1 of your opponent's Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)"]],typ='Psychic',sub=['Basic','EX'])
rows[-1][8]=[['Scoundrel Ring','Ability',"When you play this Pokémon from your hand onto your Bench, you may search your deck for up to 3 Pokémon-EX (except for Hoopa-EX), reveal them, and put them into your hand. Shuffle your deck afterward."]]
rows.append(['69','Ace Trainer','Trainer',['Supporter'],None,[],None,[],[],None,None,0,'Uncommon',['You can play this card only if you have more Prize cards left than your opponent. Each player shuffles their hand and draws 6 and 3 respectively.'],None,None])
rows.append(['76','Level Ball','Trainer',['Item'],None,[],None,[],[],None,None,0,'Uncommon',['Search your deck for a Pokémon with 90 HP or less, reveal it, and put it into your hand. Shuffle your deck afterward.'],None,None])
print(json.dumps(m.generate(rows)))`;
const generated=spawnSync('python3',['-c',python,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(generated.status,0,generated.stderr);
const cards=Object.fromEntries(JSON.parse(generated.stdout).map(c=>[c.id,c]));
const demo=(id,name,types,opts={})=>({id,name,kind:'pokemon',stage:'Basic',hp:250,types,retreat:1,battleEnabled:true,
  attacks:[{name:'Tap',damage:10,cost:['C'],effect:{type:'noop'}}],...opts});
Object.assign(cards,{
 'demo-bench':demo('demo-bench','Bench One',['Grass']),
 'demo-bench2':demo('demo-bench2','Bench Two',['Grass']),
 'demo-opponent':demo('demo-opponent','Opponent',['Water']),
 'demo-opponent-ex':demo('demo-opponent-ex','Opponent-EX',['Water'],{pokemonEX:true}),
 'demo-basic-energy':{id:'demo-basic-energy',kind:'energy',basicEnergy:true,subtype:'Grass',energyType:'Grass',name:'Basic Grass Energy'},
 'demo-basic-90':demo('demo-basic-90','Small Basic',['Water'],{hp:90}),
 'demo-basic-100':demo('demo-basic-100','Large Basic',['Water'],{hp:100}),
 'demo-tool':{id:'demo-tool',kind:'trainer',trainerType:'Tool',battleEnabled:true,effect:{type:'noop'}},
});
const orig=data.cardById;const using=cb=>{data.cardById=id=>cards[id]||orig(id);try{return cb();}finally{data.cardById=orig;}};
const ref=(cardId,uid)=>({cardId,uid:uid||cardId});
const mon=(cardId,uid,benchSlot=null)=>({uid,cardId,stack:[cardId],damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],benchSlot,conditions:{},playedOnSideTurn:1});
function battle(){const s=core.createBattle({format:'classic',playerDeck:loan,opponentDeck:loan,seed:367,firstSide:'player',playerEnergyTypes:['Grass'],opponentEnergyTypes:['Water']});s.phase='battle';s.turnNumber=10;s.activeSide='player';for(const ss of Object.values(s.sides)){ss.turnCount=5;ss.hand=[];ss.bench=[];ss.supporterUsed=false;ss.handEnergyUsed=false;ss.energyUsed=false;ss.deck=[];}s.sides.player.active=mon('xy7-8','mega');s.sides.opponent.active=mon('demo-opponent','def');return s;}
function doAction(s,side,match){const found=core.legalActions(s,side).find(match);assert.ok(found,'Missing legal action, offered '+JSON.stringify(core.legalActions(s,side).slice(0,15)));core.applyAction(s,side,found);return found;}

test('Stage 5 enablement requires exact effect mapping, both secret print IDs remain distinct',()=>{
 for(const id of ['8','85','12','51','68','94','76','36','69']){const c=cards['xy7-'+id];assert.equal(c.battleEnabled,true,c.id+' '+JSON.stringify(c.support));
  for(const a of c.attacks||[])assert.deepEqual(effects.validateEffect(a.effect),[],c.id+' '+a.name);
  if(c.effect)assert.deepEqual(effects.validateEffect(c.effect),[],c.id+' Trainer');}
});
test('Jagged Saber offers actual Grass hand Energy then chooses individual Benched receivers, healing each after attachment',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.active.energy={Grass:3};
 p.bench=[mon('demo-bench','b1',0),mon('demo-bench2','b2',1)];p.bench[0].damage=90;p.bench[1].damage=45;
 p.hand=[ref('demo-basic-energy','g1'),ref('demo-basic-energy','g2'),ref('demo-tool','tool')];
 const before=JSON.stringify(p.energySupply);
 doAction(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.kind,'handCard');
 doAction(s,'player',a=>a.type==='effectChoice'&&a.choiceCardId==='demo-basic-energy');
 assert.equal(s.pendingChoice.kind,'pokemon');
 doAction(s,'player',a=>a.type==='effectChoice'&&a.choiceBenchIndex===1);
 assert.equal(p.bench[1].damage,0);assert.equal(p.bench[1].energy.Grass,1);
 assert.equal(s.pendingChoice.kind,'handCard');
 doAction(s,'player',a=>a.type==='effectChoice'&&a.choiceCardId==='demo-basic-energy');
 doAction(s,'player',a=>a.type==='effectChoice'&&a.choiceBenchIndex===0);
 assert.equal(p.bench[0].damage,0);assert.equal(p.bench[0].energy.Grass,1);
 assert.equal(p.hand.length,1);assert.equal(p.hand[0].uid,'tool');assert.equal(s.phase,'battle');
 assert.equal(JSON.stringify(p.energySupply),before,'No Zone Energy may be pulled');
 assert.equal(s.log.filter(l=>l.type==='xy7JaggedSaber').length,2);
}));
test('Jagged Saber can decline, cannot attach to Active or invent Grass when there is no physical Energy in hand',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.active.energy={Grass:3};p.bench=[mon('demo-bench','b1',0)];
 p.hand=[ref('demo-basic-energy','g1')];doAction(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='effectChoice'&&a.choiceTarget==='active'));
 doAction(s,'player',a=>a.type==='effectChoice'&&a.choiceSkip);
 assert.equal(p.hand.length,1);assert.equal(p.bench[0].energy.Grass,undefined);
}));
test('Classic CPU Jagged Saber chooses actual hand Grass Energy and a damaged Bench target instead of skipping',()=>using(()=>{
 const ai=require(path.join(assets,'tcgp-battle-ai.js'));
 const s=battle(),p=s.sides.player;p.active.energy={Grass:3};
 p.bench=[mon('demo-bench','b1',0),mon('demo-bench2','b2',1)];
 p.bench[0].damage=10;p.bench[1].damage=100;
 p.hand=[ref('demo-basic-energy','g1'),ref('demo-basic-energy','g2')];
 doAction(s,'player',a=>a.type==='attack'&&a.attackIndex===0);
 let move=ai.chooseAction(s,'player','Beginner',0);
 assert.equal(move.type,'effectChoice');assert.ok(Number.isInteger(move.choiceHandIndex),JSON.stringify(move));
 core.applyAction(s,'player',move);
 move=ai.chooseAction(s,'player','Beginner',1);
 assert.equal(move.choiceTarget,'bench');assert.equal(move.choiceBenchIndex,1);
 core.applyAction(s,'player',move);
 assert.equal(p.bench[1].damage,0);assert.equal(p.bench[1].energy.Grass,1);
 assert.equal(s.pendingChoice.kind,'handCard');
 move=ai.chooseAction(s,'player','Beginner',2);
 assert.ok(Number.isInteger(move.choiceHandIndex));
}));
test('Virizion Prize Count counts unclaimed prizes rather than points or full original prize count',()=>using(()=>{
 const s=battle();s.sides.player.active=mon('xy7-12','v');s.sides.player.active.energy={Grass:3};
 s.sides.player.prizes=Array(4).fill(ref('demo-basic-90'));s.sides.opponent.prizes=Array(2).fill(ref('demo-basic-90'));
 const eff=cards['xy7-12'].attacks.find(a=>a.name==='Prize Count');
 let result=effects.resolveAttack(eff,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById});
 assert.equal(result.damage,120);
 s.sides.player.points=9;s.sides.player.prizes=Array(1).fill(ref('demo-basic-90'));
 result=effects.resolveAttack(eff,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById});
 assert.equal(result.damage,40);
}));
test('Registeel Forbidden Iron Hammer discards defender Energy only if it is EX',()=>using(()=>{
 const s=battle(),p=s.sides.player,o=s.sides.opponent;p.active=mon('xy7-51','steel');p.active.energy={Metal:3};
 o.active.energy={Water:2};p.active.energy.Metal=3;
 doAction(s,'player',a=>a.type==='attack'&&a.attackIndex===1);
 assert.equal(o.active.energy.Water,2);
 s.activeSide='player';o.active=mon('demo-opponent-ex','ex');o.active.energy={Water:2};
 doAction(s,'player',a=>a.type==='attack'&&a.attackIndex===1);
 assert.equal(o.active.energy.Water,1);assert.equal(o.energyDiscard.Water>0,true);
}));
test('Lugia Aero Ball counts both active Energy; Deep Hurricane discards Stadium after using +70 bonus',()=>using(()=>{
 const s=battle(),p=s.sides.player,o=s.sides.opponent;p.active=mon('xy7-68','lugia');p.active.energy={Colorless:2};o.active.energy={Water:3};
 const aero=cards['xy7-68'].attacks[0];let result=effects.resolveAttack(aero,{state:s,side:'player',foeSide:'opponent',attacker:p.active,defender:o.active,cardById:data.cardById,effectiveEnergy:x=>x.energy});
 assert.equal(result.damage,100);
 p.active.energy={Colorless:3};s.stadium={uid:'stadium',cardId:'xy7-73',ownerSide:'opponent'};
 doAction(s,'player',a=>a.type==='attack'&&a.attackIndex===1);
 assert.equal(o.active.damage,150);assert.equal(s.stadium,null);
}));
test('Lugia Aero Ball counts double-unit Special Energy as two Energy, not one physical card',()=>using(()=>{
 const s=battle(),p=s.sides.player,o=s.sides.opponent;
 p.active=mon('xy7-68','lugia');p.active.energy={};o.active.energy={Water:2};
 const eff=cards['xy7-68'].attacks[0];
 const result=effects.resolveAttack(eff,{state:s,side:'player',foeSide:'opponent',attacker:p.active,defender:o.active,cardById:data.cardById,
  effectiveEnergy:slot=>slot===p.active?{Colorless:2}:slot.energy});
 assert.equal(result.damage,80);
}));
test('Level Ball searches the physical deck for a <=90 HP Pokémon, excluding higher HP cards',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.hand=[ref('xy7-76','level')];p.deck=[ref('demo-basic-100','big'),ref('demo-basic-90','small')];
 doAction(s,'player',a=>a.type==='trainer'&&a.cardId==='xy7-76');
 assert.equal(s.phase,'effectChoice');
 assert.deepEqual(core.legalActions(s,'player').filter(a=>a.type==='effectChoice').map(a=>a.choiceCardId),['demo-basic-90']);
 doAction(s,'player',a=>a.type==='effectChoice'&&a.choiceCardId==='demo-basic-90');
 assert.ok(p.hand.some(r=>r.uid==='small'));
 assert.ok(p.deck.some(r=>r.uid==='big'));
}));
test('Hoopa-EX Scoundrel Ring searches actual EX cards only and cannot take Hoopa-EX or non-EX',()=>using(()=>{
 const s=battle(),p=s.sides.player;
 p.active=mon('demo-bench','active');p.hand=[ref('xy7-36','hoopa')];
 p.deck=[ref('xy7-8','sceptile'),ref('xy7-68','lugia'),ref('xy7-36','otherHoopa'),ref('demo-basic-90','small')];
 doAction(s,'player',a=>a.type==='bench'&&a.cardId==='xy7-36');
 assert.equal(s.phase,'effectChoice');
 let choices=core.legalActions(s,'player');
 assert.ok(choices.some(a=>a.choiceLabel&&/Search/.test(a.choiceLabel)),JSON.stringify(choices));
 doAction(s,'player',a=>a.type==='effectChoice'&&/Search/.test(a.choiceLabel||''));
 assert.equal(s.pendingChoice.kind,'deckCard');
 choices=core.legalActions(s,'player').filter(a=>a.type==='effectChoice').map(a=>a.choiceCardId);
 assert.deepEqual(choices.sort(),['xy7-8','xy7-68'].sort());
 doAction(s,'player',a=>a.type==='effectChoice'&&a.choiceCardId==='xy7-68');
 assert.equal(p.hand.length,1);
 assert.equal(p.hand[0].cardId,'xy7-68');
 assert.ok(p.deck.some(r=>r.cardId==='xy7-36'));
}));
test('Hoopa-EX Hyperspace Fury chooses a real opposing target and discards exactly two attached Energy',()=>using(()=>{
 const s=battle(),p=s.sides.player,o=s.sides.opponent;
 p.active=mon('xy7-36','hoopa');p.active.energy={Psychic:4};
 o.bench=[mon('demo-opponent','target',0)];
 const actions=core.legalActions(s,'player').filter(a=>a.type==='attack');
 const selected=actions.find(a=>a.attackIndex===0&&a.target==='opponentBench'&&a.benchIndex===0);
 assert.ok(selected,JSON.stringify(actions));
 core.applyAction(s,'player',selected);
 if(s.phase==='effectChoice'){
  const choices=core.legalActions(s,'player');
  const bench=choices.find(a=>a.type==='effectChoice'&&a.choiceTarget==='bench');
  assert.ok(bench,JSON.stringify(choices));core.applyAction(s,'player',bench);
 }
 assert.equal(o.bench[0].damage,100);
 assert.equal(o.active.damage,0);
 assert.equal(p.active.energy.Psychic,2);
}));
test('Ace Trainer cannot be played unless behind on Prizes, then draws six versus three from physical decks',()=>using(()=>{
 const s=battle(),p=s.sides.player,o=s.sides.opponent;
 p.prizes=[ref('demo-basic-90','p1')];o.prizes=[ref('demo-basic-90','o1'),ref('demo-basic-90','o2')];
 p.hand=[ref('xy7-69','ace'),ref('demo-tool','pTool')];o.hand=[ref('demo-tool','oTool')];
 p.deck=Array.from({length:8},(_,i)=>ref('demo-basic-90','p'+i));o.deck=Array.from({length:8},(_,i)=>ref('demo-basic-100','o'+i));
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='xy7-69'));
 p.prizes=[ref('demo-basic-90','p1'),ref('demo-basic-90','p2'),ref('demo-basic-90','p3')];
 doAction(s,'player',a=>a.type==='trainer'&&a.cardId==='xy7-69');
 assert.equal(p.hand.length,6);assert.equal(o.hand.length,3);
 assert.ok(p.discard.some(r=>r.uid==='ace'));
 assert.ok(p.deck.some(r=>r.uid==='pTool'));
 assert.ok([...o.deck,...o.hand].some(r=>r.uid==='oTool')); 
}));
test('autobuilder recognises Mega Sceptile hand-Grass dependencies and real Steven support without adding Basic Energy to the 30-card deck',()=>{
 const fs=require('node:fs');const src=fs.readFileSync(path.join(assets,'tcg-classic-deck-builder.js'),'utf8');
 assert.match(src,/\['xy7-8','Grass'\]/);
 assert.match(src,/\['xy7-85','Grass'\]/);
 assert.match(src,/c\.id==='xy7-95'/);
 assert.match(src,/The 30-card format EXCLUDES physical Basic Energy/);
});
