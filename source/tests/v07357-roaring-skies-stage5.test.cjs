'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),asset=path.join(root,'app/src/main/assets');
const data=require(path.join(asset,'tcgp-battle-data.js')),fx=require(path.join(asset,'tcgp-battle-effects.js')),core=require(path.join(asset,'tcgp-battle-core.js'));
const loan=require(path.join(asset,'tcg-classic-battle-data.js')).CLASSIC30_LOANER_DECK;
const PY=String.raw`
import sys,json,importlib.util
p=sys.argv[1];sys.path.insert(0,p)
spec=importlib.util.spec_from_file_location('xy6gen',p+'/build-xy6.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def row(n,name,stage='Basic',att=None,abl=None,typ='Colorless',hp=180,evolves=None,trait=None):
 return [str(n),name,'Pokémon',[stage],hp,[typ],evolves,att or [],abl or [],None,None,1,'Rare',[],None,trait]
a=[
 row('10','Ninjask','Stage 1',[['Afterimage Assault',['C'],'30','Search your deck for up to 2 Ninjask and put them onto your Bench. Shuffle your deck afterward.']],typ='Grass',evolves='Nincada'),
 row('11','Shedinja','Stage 1',[['Cursed Rain',['C'],'','Put 1 damage counter on each of your opponent\'s Pokémon. Switch this Pokémon with 1 of your Benched Pokémon.'],['Hopeless Scream',['C'],'50×','This attack does 50 damage times the number of damage counters on this Pokémon.']],typ='Grass',evolves='Nincada'),
 row('33','Deoxys',att=[['Close Encounter',['P'],'','If you go first, you can use this attack on your first turn. Draw 2 cards.'],['Overdrive Smash',['P','C'],'30','During your next turn, this Pokémon\'s Overdrive Smash attack does 60 more damage (before applying Weakness and Resistance).']],typ='Psychic'),
 row('34','Gallade-EX',att=[['Swift Lunge',['P','C'],'30','You may have your opponent switch his or her Active Pokémon with 1 of his or her Benched Pokémon.'],['Piercing Prizes',['P','C','C'],'50+','This attack does 20 more damage for each of your remaining Prize cards.']],typ='Psychic'),
 row('99','Gallade-EX',att=[['Swift Lunge',['P','C'],'30','You may have your opponent switch his or her Active Pokémon with 1 of his or her Benched Pokémon.'],['Piercing Prizes',['P','C','C'],'50+','This attack does 20 more damage for each of your remaining Prize cards.']],typ='Psychic'),
 row('42','Jirachi',att=[['Diminutive Desire',['P'],'','Look at the top 7 cards of your deck and put 1 of them into your hand. Shuffle the other cards back into your deck.'],['Doom Desire',['P','C'],'','Discard all Energy attached to this Pokémon. The Defending Pokémon is Knocked Out at the end of your opponent\'s next turn.']],typ='Psychic'),
 row('56','Shelgon','Stage 1',[['Rolling Tackle',['C','C','C'],'60','']],[['Exoskeleton','Ability','Any damage done to this Pokémon by attacks is reduced by 10 (after applying Weakness and Resistance).']],'Dragon',100,'Bagon'),
 row('62','Hydreigon-EX',att=[['Shred',['D','C','C'],'80','This attack\'s damage isn\'t affected by any effects on your opponent\'s Active Pokémon.']],abl=[['Dragon Road','Ability','If there is any Stadium card in play, the Retreat Cost of each of your Dragon Pokémon in play is ColorlessColorless less.']],typ='Dragon'),
 row('103','Hydreigon-EX',att=[['Shred',['D','C','C'],'80','This attack\'s damage isn\'t affected by any effects on your opponent\'s Active Pokémon.']],abl=[['Dragon Road','Ability','If there is any Stadium card in play, the Retreat Cost of each of your Dragon Pokémon in play is ColorlessColorless less.']],typ='Dragon'),
 row('51','Dragonite','Stage 2',[['Mach Press',['C','C','C'],'80','Flip 2 coins. If both of them are heads, your opponent\'s Active Pokémon is now Paralyzed.']],[['Max Wind','Ability','When you play this Pokémon from your hand to evolve 1 of your Pokémon, you may heal all damage from 1 of your Pokémon.']],'Dragon',200,'Dragonair'),
 row('58','Latios-EX',att=[['Fast Raid',['P'],'40','If you go first, you can use this attack on your first turn.'],['Light Pulse',['P','C','C'],'110','Prevent all effects of your opponent\'s attacks, except damage, done to this Pokémon during your opponent\'s next turn.']],typ='Dragon'),
 row('59','M Latios-EX','Stage 1',[['Sonic Ace',['P','C','C'],'','Discard 2 Energy attached to this Pokémon. This attack does 120 damage to 1 of your opponent\'s Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)']],typ='Dragon',hp=220,evolves='Latios-EX'),
 row('101','Latios-EX',att=[['Fast Raid',['P'],'40','If you go first, you can use this attack on your first turn.'],['Light Pulse',['P','C','C'],'110','Prevent all effects of your opponent\'s attacks, except damage, done to this Pokémon during your opponent\'s next turn.']],typ='Dragon'),
 row('102','M Latios-EX','Stage 1',[['Sonic Ace',['P','C','C'],'','Discard 2 Energy attached to this Pokémon. This attack does 120 damage to 1 of your opponent\'s Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)']],typ='Dragon',hp=220,evolves='Latios-EX'),
 row('64','Zekrom',att=[['Energy Stream',['L'],'30','Attach a basic Energy card from your discard pile to this Pokémon.'],['Electric Ball',['L','C','C'],'100','']],typ='Dragon'),
 row('73','Swablu',att=[['Bind Wound',['C'],'','Heal 20 damage from 1 of your Pokémon.']],typ='Colorless'),
 row('78','Pidove',att=[['Homing Pidove',['C'],'','Look at the top card of your deck. Then, you may shuffle your deck.'],['Gust',['C'],'20','']],typ='Colorless'),
]
print(json.dumps(m.generate(a),ensure_ascii=False))
`;
const gen=spawnSync('python3',['-c',PY,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(gen.status,0,gen.stderr);
const cards=Object.fromEntries(JSON.parse(gen.stdout).map(c=>[c.id,c]));
Object.assign(cards,{
 'demo-normal':{id:'demo-normal',kind:'pokemon',name:'Test Normal',stage:'Basic',types:['Colorless'],subtype:'Colorless',hp:240,retreat:1,attacks:[{name:'Tap',cost:'C',damage:10,effect:{type:'noop'}}],battleEnabled:true},
 'demo-energy':{id:'demo-energy',kind:'energy',name:'Basic Fire Energy',basicEnergy:true,energyType:'Fire',subtype:'Fire',battleEnabled:true},
 'demo-nincada':{id:'demo-nincada',kind:'pokemon',name:'Nincada',stage:'Basic',types:['Grass'],subtype:'Grass',hp:60,battleEnabled:true,attacks:[{name:'Tap',cost:'C',damage:10,effect:{type:'noop'}}]},
 'demo-dragonair':{id:'demo-dragonair',kind:'pokemon',name:'Dragonair',stage:'Stage 1',types:['Dragon'],subtype:'Dragon',hp:100,battleEnabled:true,attacks:[{name:'Tap',cost:'C',damage:10,effect:{type:'noop'}}]}
});
const ref=(id,uid)=>({cardId:id,uid:uid||id+'-'+Math.random().toString(36).slice(2)});
const slot=(id,uid,benchSlot=null)=>({uid,cardId:id,stack:[id],damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],benchSlot,conditions:{},playedOnSideTurn:1});
function using(fn){const old=data.cardById;data.cardById=id=>cards[id]||old(id);try{return fn();}finally{data.cardById=old;}}
function battle(active='demo-normal'){
 const s=core.createBattle({format:'classic',playerDeck:loan,opponentDeck:loan,seed:357,firstSide:'player',playerEnergyTypes:['Fire','Psychic','Lightning'],opponentEnergyTypes:['Fire','Psychic','Lightning']});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;s.stadium=null;
 for(const ss of Object.values(s.sides)){ss.turnCount=5;ss.hand=[];ss.bench=[];ss.handEnergyUsed=false;ss.energyUsed=false;ss.supporterUsed=false;ss.stadiumUsed=false;ss.handLimit=8;}
 s.sides.player.active=slot(active,'mine');s.sides.opponent.active=slot('demo-normal','theirs');
 return s;
}
function action(s,type,pred=()=>true,side='player'){const a=core.legalActions(s,side).find(a=>a.type===type&&pred(a));assert.ok(a,`${type} missing: ${JSON.stringify(core.legalActions(s,side).map(x=>({type:x.type,cardId:x.cardId,attackIndex:x.attackIndex,target:x.target,choiceOption:x.choiceOption,choiceTarget:x.choiceTarget,choiceDeckIndex:x.choiceDeckIndex,choiceBenchIndex:x.choiceBenchIndex,effectEnergyType:x.effectEnergyType})))}`);return a;}
function play(s,type,pred,side='player'){return core.applyAction(s,side,action(s,type,pred,side));}

test('Stage 5 verified effects activate only implemented official prints and validate their descriptors',()=>{
 for(const id of ['10','11','33','34','99','42','51','56','62','103','58','59','101','102','64','73','78']){
  const c=cards['xy6-'+id];assert.equal(c?.battleEnabled,true,`${id}: ${JSON.stringify(c?.support)}`);
  for(const a of c.attacks||[])assert.deepEqual(fx.validateEffect(a.effect),[],`${id} ${a.name}`);
  for(const a of c.abilities||[])assert.deepEqual(fx.validateEffect(a.effect),[],`${id} ${a.name}`);
 }
});

test('Afterimage Assault selects two real Ninjask from deck to Bench',()=>using(()=>{
 const s=battle('xy6-10');s.sides.player.active.energy={Colorless:1};s.sides.player.benchLimit=3;
 s.sides.player.deck=[ref('xy6-10','n1'),ref('demo-normal','other'),ref('xy6-10','n2')];
 play(s,'attack',a=>a.attackIndex===0);
 assert.equal(s.phase,'effectChoice');
 play(s,'effectChoice',a=>a.choiceDeckIndex===0);
 assert.equal(s.phase,'effectChoice');
 play(s,'effectChoice',a=>a.choiceDeckIndex>=0);
 assert.equal(s.sides.player.bench.length,2);
 assert.ok(s.sides.player.bench.every(p=>p.cardId==='xy6-10'));
 assert.equal(s.sides.player.deck.length,1);
}));

test('Gallade-EX Piercing Prizes adds 20 per *remaining own* Prize (both prints)',()=>using(()=>{
 for(const id of ['xy6-34','xy6-99'])for(const remaining of [5,2,0]){
  const s=battle(id);s.sides.player.active.energy={Psychic:1,Colorless:2};
  s.sides.player.prizes=Array.from({length:remaining},(_,i)=>ref('demo-normal','p'+i));
  play(s,'attack',a=>a.attackIndex===1);
  assert.equal(s.sides.opponent.active.damage,50+20*remaining,`${id} remaining=${remaining}`);
 }
}));

test('Deoxys next-turn Overdrive Smash bonus never stacks on its initial turn',()=>using(()=>{
 const s=battle('xy6-33');s.sides.player.active.energy={Psychic:1,Colorless:1};
 play(s,'attack',a=>a.attackIndex===1);
 assert.equal(s.sides.opponent.active.damage,30);
 assert.equal(s.sides.player.active.nextAttackBonuses?.[0].turn,12);
 s.turnNumber=12;s.activeSide='player';s.phase='battle';s.sides.player.turnCount++;
 play(s,'attack',a=>a.attackIndex===1);
 assert.equal(s.sides.opponent.active.damage,120);
}));

test('Cursed Rain puts one counter on each opposing Pokémon, then switches its user',()=>using(()=>{
 const s=battle('xy6-11');s.sides.player.active.energy={Colorless:1};s.sides.player.bench=[slot('demo-normal','friend',0)];s.sides.opponent.bench=[slot('demo-normal','foe-bench',0)];
 play(s,'attack',a=>a.attackIndex===0);
 assert.equal(s.sides.opponent.active.damage,10);
 assert.equal(s.sides.opponent.bench[0].damage,10);
 // The existing attack-choice engine includes the ally-switch target.
 assert.equal(s.sides.player.active.cardId,'demo-normal');
}));

test('Diminutive Desire looks at seven, chooses one actual top card, then shuffles the rest',()=>using(()=>{
 const s=battle('xy6-42');s.sides.player.active.energy={Psychic:1};
 s.sides.player.deck=Array.from({length:9},(_,i)=>ref('demo-normal','top-'+i));
 play(s,'attack',a=>a.attackIndex===0);
 assert.equal(s.phase,'effectChoice');
 play(s,'effectChoice',a=>a.choiceDeckIndex===6);
 assert.equal(s.sides.player.hand.length,1);
 assert.equal(s.sides.player.hand[0].uid,'top-6');
 assert.equal(s.sides.player.deck.length,8);
}));

test('Doom Desire discards Energy now and schedules a defender-specific KO',()=>using(()=>{
 const s=battle('xy6-42');s.sides.player.active.energy={Psychic:2,Colorless:2};
 play(s,'attack',a=>a.attackIndex===1);
 assert.equal(s.sides.player.energyDiscard.Psychic,2);
 assert.equal(s.sides.player.energyDiscard.Colorless,2);
 assert.equal(s.sides.player.active.energy.Psychic,0);
 assert.ok(s.delayedEffects?.some(e=>e.targetUid==='theirs'&&e.event==='endOpponentNextTurn'));
}));

test('Zekrom Energy Stream attaches only discarded Basic Energy, never fresh Zone Energy',()=>using(()=>{
 const s=battle('xy6-64');s.sides.player.active.energy={Lightning:1};s.sides.player.energyDiscard={Fire:1};
 const attacks=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===0);
 assert.ok(attacks.length,JSON.stringify(core.legalActions(s,'player')));
 const chosen=attacks.find(a=>a.effectEnergyType==='Fire')||attacks[0];
 core.applyAction(s,'player',chosen);
 assert.equal(s.sides.player.active.energy.Fire,1);
 assert.equal(s.sides.player.energyDiscard.Fire,0);
}));

test('Swablu Bind Wound chooses the injured ally instead of automatically healing itself',()=>using(()=>{
 const s=battle('xy6-73');s.sides.player.active.damage=10;s.sides.player.bench.push(slot('demo-normal','injured',0));s.sides.player.bench[0].damage=40;s.sides.player.active.energy={Colorless:1};
 play(s,'attack',a=>a.attackIndex===0&&a.target==='bench'&&a.benchIndex===0);
 assert.equal(s.sides.player.bench[0].damage,20);
 assert.equal(s.sides.player.active.damage,10);
}));

test('Dragonite Max Wind only triggers when evolved from hand and heals a chosen ally',()=>using(()=>{
 const s=battle('demo-normal');s.sides.player.bench.push(slot('demo-dragonair','evolving',0));s.sides.player.bench[0].stack=['demo-nincada','demo-dragonair'];s.sides.player.bench[0].playedOnSideTurn=1;s.sides.player.bench[0].damage=40;s.sides.player.active.damage=60;
 s.sides.player.hand=[ref('xy6-51','dragonite-evo')];
 play(s,'evolve',a=>a.cardId==='xy6-51');
 assert.equal(s.sides.player.bench[0].cardId,'xy6-51');
 assert.equal(s.phase,'effectChoice');
 play(s,'effectChoice',a=>a.choiceTarget==='active');
 assert.equal(s.sides.player.active.damage,0);
 assert.equal(s.sides.player.bench[0].damage,40);
}));

test('Latios Light Pulse protects from attack effects but not attack damage',()=>using(()=>{
 for(const id of ['xy6-58','xy6-101']){
  const s=battle(id);s.sides.player.active.energy={Psychic:1,Colorless:2};
  play(s,'attack',a=>a.attackIndex===1);
  assert.equal(s.sides.player.active.attackGuard?.preventEffects,true);
  assert.equal(s.sides.player.active.attackGuard?.expiresTurn,11);
  assert.equal(s.sides.opponent.active.damage,110);
  s.phase='battle';s.activeSide='opponent';s.turnNumber=11;s.sides.opponent.active.energy={Colorless:1};
  play(s,'attack',a=>a.attackIndex===0,'opponent');
  assert.equal(s.sides.player.active.damage,10,'Light Pulse must not block damage');
 }
}));

test('Mega Latios Sonic Ace targets a specific Bench and discards two actual Energy',()=>using(()=>{
 for(const id of ['xy6-59','xy6-102']){
  const s=battle(id);s.sides.player.active.energy={Psychic:1,Colorless:2};s.sides.opponent.bench=[slot('demo-normal','target-bench',0)];
  const moves=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===0);
  assert.ok(moves.length,`${id}: no Sonic Ace`);
  play(s,'attack',a=>a.attackIndex===0&&a.target==='opponentBench');
  assert.equal(s.sides.opponent.bench[0].damage,120);
  assert.equal(s.sides.player.energyDiscard.Psychic+s.sides.player.energyDiscard.Colorless,2);
 }
}));

test('Homing Pidove reveals its actual top card and allows declining the shuffle',()=>using(()=>{
 const s=battle('xy6-78');s.sides.player.active.energy={Colorless:1};s.sides.player.deck=[ref('demo-normal','top'),ref('demo-normal','second')];
 play(s,'attack',a=>a.attackIndex===0);
 assert.equal(s.phase,'effectChoice');
 assert.equal(s.log.some(e=>e.type==='inspectTop'&&e.cards.includes('demo-normal')),true);
 play(s,'effectChoice',a=>a.choiceOption===1);
 assert.equal(s.sides.player.deck[0].uid,'top');
}));

test('Shelgon Exoskeleton reduces attack damage by ten but not after ability suppression',()=>using(()=>{
 const s=battle('demo-normal');s.sides.opponent.active=slot('xy6-56','shelgon');s.sides.player.active.energy={Colorless:1};
 play(s,'attack',a=>a.attackIndex===0);
 assert.equal(s.sides.opponent.active.damage,0,'10 attack minus 10 Exoskeleton');
 const t=battle('demo-normal');t.sides.opponent.active=slot('xy6-56','shelgon2');t.sides.opponent.active.abilitySuppressed={duration:'whileActive'};t.sides.player.active.energy={Colorless:1};
 play(t,'attack',a=>a.attackIndex===0);
 assert.equal(t.sides.opponent.active.damage,10);
}));

test('Hydreigon-EX Dragon Road lowers only allied Dragon retreat under a Stadium, respects suppression',()=>using(()=>{
 for(const id of ['xy6-62','xy6-103']){
  const s=battle('xy6-64');s.sides.player.active.energy={Lightning:2};s.sides.player.bench=[slot(id,'dragonroad',0)];
  cards['xy6-64'].retreat=3;
  assert.equal(core.retreatCost(s,'player'),3);
  s.stadium={cardId:'xy6-89',ownerSide:'opponent',uid:'stadium'};
  assert.equal(core.retreatCost(s,'player'),1);
  s.sides.player.bench[0].abilitySuppressed={duration:'whileInPlay'};
  assert.equal(core.retreatCost(s,'player'),3);
  s.sides.player.bench[0].abilitySuppressed=null;s.sides.player.active=slot('demo-normal','normal');
  assert.equal(core.retreatCost(s,'player'),1,'non-Dragon retreat unchanged');
 }
}));
