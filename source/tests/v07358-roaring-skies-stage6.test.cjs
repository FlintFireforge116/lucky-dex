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
 row('23','Zapdos',att=[['Drill Peck',['L'],'20',''],['Raging Thunder',['L','C'],'120','This attack does 40 damage to 1 of your Benched Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)']],typ='Lightning'),
 row('29','Xatu','Stage 1',[['Future Sight',['P'],'','Look at the top 5 cards of either player\'s deck and put them back on top of that player\'s deck in any order.'],['Stressful Eye',['P','C'],'30','Your opponent reveals his or her hand. Discard a Trainer card you find there.']],typ='Psychic',evolves='Natu'),
 row('48','Klefki',att=[['Look for Keys',['Y'],'','Reveal cards from the top of your deck until you reveal an Item card. Put it into your hand. Shuffle the other cards back into your deck.'],['Play Rough',['Y','C'],'20+','Flip a coin. If heads, this attack does 20 more damage.']],typ='Fairy'),
 row('53','Altaria','Stage 1',[['Song of Echoes',['C'],'','Shuffle your hand into your deck. Then, draw a number of cards equal to the number of Benched Pokémon (both yours and your opponent\'s).'],['Midnight Eyes',['C'],'30','Your opponent\'s Active Pokémon is now Asleep.']],typ='Dragon',evolves='Swablu'),
 row('14','Fletchinder','Stage 1',[['Peck Off',['R'],'10','Before doing damage, discard all Pokémon Tool cards attached to your opponent\'s Active Pokémon.']],typ='Fire',evolves='Fletchling'),
 row('52','Dragonite','Stage 2',[['Wrapped in Wind',['C'],'','Attach up to 2 basic Energy cards from your hand to this Pokémon.'],['Heavy Impact',['C','C'],'150','']],typ='Dragon',hp=160,evolves='Dragonair',trait={'name':'Δ Plus','text':'If the opponent is Knocked Out by attack damage, take an extra Prize.'}),
 row('63','Reshiram',att=[['Bright Wing',['R','C'],'110','Discard a Fire Energy attached to this Pokémon.']],abl=[['Turboblaze','Ability','Once during your turn, if Active, you may attach a Fire Energy card from your hand to 1 of your Dragon Pokémon.']],typ='Dragon'),
 row('80','Unfezant','Stage 2',[['Quick Attack',['C'],'30+','Flip a coin. If heads, this attack does 30 more damage.'],['Strong Winds',['C','C'],'','Shuffle all cards attached to each player\'s Pokémon into that player\'s deck.']],typ='Colorless',evolves='Tranquill'),
 ['94','Wally','Trainer',['Supporter'],None,[],None,[],[],None,None,0,'Uncommon',["Search your deck for a card that evolves from 1 of your Pokémon (excluding Pokémon-EX) and put it onto that Pokémon. (This counts as evolving that Pokémon.) Shuffle your deck afterward. You can use this card during your first turn or on a Pokémon that was put into play this turn."],'Supporter',None],
 ['107','Wally','Trainer',['Supporter'],None,[],None,[],[],None,None,0,'Ultra Rare',["Search your deck for a card that evolves from 1 of your Pokémon (excluding Pokémon-EX) and put it onto that Pokémon. (This counts as evolving that Pokémon.) Shuffle your deck afterward. You can use this card during your first turn or on a Pokémon that was put into play this turn."],'Supporter',None],
]
print(json.dumps(m.generate(a),ensure_ascii=False))
`;
const gen=spawnSync('python3',['-c',PY,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(gen.status,0,gen.stderr);
const cards=Object.fromEntries(JSON.parse(gen.stdout).map(c=>[c.id,c]));
Object.assign(cards,{
 'demo-normal':{id:'demo-normal',kind:'pokemon',name:'Test Normal',stage:'Basic',types:['Colorless'],subtype:'Colorless',hp:240,retreat:1,attacks:[{name:'Tap',cost:'C',damage:10,effect:{type:'noop'}}],battleEnabled:true},
 'demo-item':{id:'demo-item',kind:'trainer',name:'Test Item',trainerType:'Item',battleEnabled:true,effect:{type:'noop'}},
 'demo-fire-hand':{id:'demo-fire-hand',kind:'energy',name:'Basic Fire Energy',basicEnergy:true,subtype:'Fire',energyType:'Fire',battleEnabled:true},
 'demo-water-hand':{id:'demo-water-hand',kind:'energy',name:'Basic Water Energy',basicEnergy:true,subtype:'Water',energyType:'Water',battleEnabled:true},
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


test('Stage 6 full printed attacks enable four previously gated cards',()=>{
 for(const n of ['14','23','29','48','52','53','63','80']){
  const c=cards['xy6-'+n];assert.equal(c?.battleEnabled,true,`${n} ${JSON.stringify(c?.support)}`);
  for(const a of c.attacks)assert.deepEqual(fx.validateEffect(a.effect),[],`${n} ${a.name}`);
 }
});

test('Zapdos Raging Thunder damages one chosen own Bench after 120 attack damage',()=>using(()=>{
 const s=battle('xy6-23');s.sides.player.active.energy={Lightning:2,Colorless:2};
 s.sides.player.bench=[slot('demo-normal','own1',0),slot('demo-normal','own2',1)];
 play(s,'attack',a=>a.attackIndex===1&&a.target==='bench'&&a.benchIndex===1);
 assert.equal(s.sides.opponent.active.damage,120);
 assert.equal(s.sides.player.bench[0].damage,0);
 assert.equal(s.sides.player.bench[1].damage,40);
}));

test('Klefki takes first physical Item, returning all revealed non-Items to own deck',()=>using(()=>{
 const s=battle('xy6-48');s.sides.player.active.energy={Fairy:1,Colorless:1};
 s.sides.player.deck=[ref('demo-normal','non1'),ref('demo-normal','non2'),ref('demo-item','item1'),ref('demo-item','item2')];
 play(s,'attack',a=>a.attackIndex===0);
 assert.deepEqual(s.sides.player.hand.map(r=>r.uid),['item1']);
 assert.deepEqual(new Set(s.sides.player.deck.map(r=>r.uid)),new Set(['non1','non2','item2']));
 const record=s.log.find(e=>e.type==='revealUntilMatching');
 assert.deepEqual(record.cards,['demo-normal','demo-normal','demo-item']);
}));

test('Klefki with no Item does not fabricate an Item or discard nonmatches',()=>using(()=>{
 const s=battle('xy6-48');s.sides.player.active.energy={Fairy:1};
 s.sides.player.deck=[ref('demo-normal','a'),ref('demo-normal','b')];
 play(s,'attack',a=>a.attackIndex===0);
 assert.equal(s.sides.player.hand.length,0);
 assert.equal(s.sides.player.deck.length,2);
 assert.deepEqual(new Set(s.sides.player.deck.map(r=>r.uid)),new Set(['a','b']));
}));

test('Altaria Song of Echoes draws exactly both players Bench counts, up to eight each',()=>using(()=>{
 for(const n of [0,2,7]){
  const s=battle('xy6-53');s.sides.player.active.energy={Colorless:1};
  s.sides.player.bench=Array.from({length:n},(_,i)=>slot('demo-normal','mine-'+i,i));
  s.sides.opponent.bench=Array.from({length:n},(_,i)=>slot('demo-normal','foe-'+i,i));
  s.sides.player.hand=[ref('demo-normal','from-hand')];
  s.sides.player.deck=Array.from({length:25},(_,i)=>ref('demo-normal','deck-'+i));
  play(s,'attack',a=>a.attackIndex===0);
  assert.equal(s.sides.player.hand.length,Math.min(n*2,s.sides.player.handLimit),`bench=${n}`);
  assert.equal(s.sides.player.hand.some(r=>r.uid==='from-hand')||s.sides.player.deck.some(r=>r.uid==='from-hand'),true);
 }
}));

test('Xatu Future Sight offers a deck choice then a real five-card ordering prompt',()=>using(()=>{
 const s=battle('xy6-29');s.sides.player.active.energy={Psychic:1};
 s.sides.player.deck=Array.from({length:7},(_,i)=>ref('demo-normal','mine-'+i));
 s.sides.opponent.deck=Array.from({length:7},(_,i)=>ref('demo-normal','foe-'+i));
 play(s,'attack',a=>a.attackIndex===0);
 assert.equal(s.phase,'effectChoice');
 const options=core.legalActions(s,'player').filter(a=>a.type==='effectChoice');
 assert.ok(options.some(a=>a.choiceOption===1));
 play(s,'effectChoice',a=>a.choiceOption===1);
 assert.equal(s.phase,'effectChoice');
 // The selected deck's top five can be reordered. Pick last top card first.
 play(s,'effectChoice',a=>a.choiceDeckIndex===4);
 for(let i=0;i<4;i++)play(s,'effectChoice',a=>a.choiceDeckIndex===i);
 assert.equal(s.sides.opponent.hand.some(r=>r.uid==='foe-4'),true,'opponent drew rearranged first card at start of its turn');
 assert.equal(s.sides.player.deck[0].uid,'mine-0');
}));

test('Xatu Stressful Eye reveals hand and chooses an actual opposing Trainer to discard',()=>using(()=>{
 const s=battle('xy6-29');s.sides.player.active.energy={Psychic:1,Colorless:1};
 s.sides.opponent.hand=[ref('demo-normal','pokemon'),ref('demo-item','chosen'),ref('demo-normal','pokemon2')];
 play(s,'attack',a=>a.attackIndex===1);
 assert.ok(s.log.some(e=>e.type==='revealHand'&&e.revealedSide==='opponent'));
 assert.equal(s.phase,'effectChoice');
 play(s,'effectChoice',a=>a.choiceHandIndex===1);
 assert.equal(s.sides.opponent.hand.some(r=>r.uid==='chosen'),false);
 assert.equal(s.sides.opponent.discard.some(r=>r.uid==='chosen'),true);
}));


test('Fletchinder Peck Off discards tools BEFORE damage, so Hard Charm does not reduce hit',()=>using(()=>{
 const s=battle('xy6-14');s.sides.player.active.energy={Fire:1};
 s.sides.opponent.active.tool=ref('xy1-119','hard-charm');
 play(s,'attack',a=>a.attackIndex===0);
 assert.equal(s.sides.opponent.active.tool,null);
 assert.equal(s.sides.opponent.discard.some(r=>r.uid==='hard-charm'),true);
 assert.equal(s.sides.opponent.active.damage,10);
}));

test('Dragonite Wrapped in Wind attaches two selected physical basic cards from hand, not Zone',()=>using(()=>{
 const s=battle('xy6-52');s.sides.player.active.energy={Colorless:1};
 s.sides.player.hand=[ref('demo-water-hand','water'),ref('demo-normal','pokemon'),ref('demo-fire-hand','fire')];
 const supply=s.sides.player.energySupply?.slice();
 play(s,'attack',a=>a.attackIndex===0);
 assert.equal(s.phase,'effectChoice');
 play(s,'effectChoice',a=>a.choiceHandIndex===0);
 assert.equal(s.sides.player.active.energy.Water,1);
 assert.equal(s.phase,'effectChoice');
 play(s,'effectChoice',a=>a.choiceCardId==='demo-fire-hand');
 assert.equal(s.sides.player.active.energy.Fire,1);
 assert.equal(s.sides.player.hand.length,1);
 assert.deepEqual(s.sides.player.energySupply,supply);
}));

test('Dragonite permits declining any optional hand Energy attachments',()=>using(()=>{
 const s=battle('xy6-52');s.sides.player.active.energy={Colorless:1};
 s.sides.player.hand=[ref('demo-water-hand','water')];
 play(s,'attack',a=>a.attackIndex===0);
 play(s,'effectChoice',a=>a.choiceSkip===true);
 assert.equal(s.sides.player.active.energy.Water||0,0);
 assert.equal(s.sides.player.hand[0].uid,'water');
}));

test('Reshiram Turboblaze targets Dragon, uses actual Fire from hand, only while Active',()=>using(()=>{
 const s=battle('xy6-63');s.sides.player.bench=[slot('xy6-64','dragon',0),slot('demo-normal','normal',1)];
 s.sides.player.hand=[ref('demo-fire-hand','fire')];
 const a=core.legalActions(s,'player').filter(a=>a.type==='ability');
 assert.ok(a.length,JSON.stringify(core.legalActions(s,'player')));
 play(s,'ability',a=>true);
 assert.equal(s.phase,'effectChoice');
 play(s,'effectChoice',a=>a.choiceTarget==='bench'&&a.choiceBenchIndex===0);
 assert.equal(s.sides.player.bench[0].energy.Fire,1);
 assert.equal(s.sides.player.bench[1].energy.Fire||0,0);
 assert.equal(s.sides.player.hand.length,0);
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='ability'),false,'once per turn');
 const t=battle('demo-normal');t.sides.player.bench=[slot('xy6-63','reshiram',0)];
 t.sides.player.hand=[ref('demo-fire-hand','fire')];
 assert.equal(core.legalActions(t,'player').some(a=>a.type==='ability'),false,'Active only');
}));


test('Both Wally prints are battle enabled and choose an eligible evolution from actual deck',()=>using(()=>{
 for(const id of ['xy6-94','xy6-107']){
  assert.equal(cards[id].battleEnabled,true);
  const s=battle('demo-normal');s.sides.player.turnCount=1;s.turnNumber=1;
  s.sides.player.active=slot('demo-nincada','base');s.sides.player.active.playedOnSideTurn=1;
  s.sides.player.hand=[ref(id,'wally')];
  s.sides.player.deck=[ref('demo-normal','other'),ref('xy6-10','evo')];
  // Ninjask evolves Nincada, is Stage 1 and is fully implemented.
  const act=core.legalActions(s,'player').filter(a=>a.type==='trainer'&&a.cardId===id);
  assert.ok(act.length,`${id} cannot play on first turn`);
  play(s,'trainer',a=>a.cardId===id);
  assert.equal(s.phase,'effectChoice');
  play(s,'effectChoice',a=>a.choiceTarget==='active');
  assert.equal(s.phase,'effectChoice');
  play(s,'effectChoice',a=>a.choiceCardId==='xy6-10');
  assert.equal(s.sides.player.active.cardId,'xy6-10');
  assert.equal(s.sides.player.active.stack.length,2);
  assert.equal(s.sides.player.deck.length,1);
 }
}));

test('Wally cannot be played when no compatible deck evolution exists',()=>using(()=>{
 const s=battle('demo-normal');s.sides.player.hand=[ref('xy6-94','wally')];
 s.sides.player.deck=[ref('demo-normal','other')];
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='xy6-94'),false);
}));

test('Unfezant Strong Winds shuffles all attachments on both sides without moving Pokémon',()=>using(()=>{
 const s=battle('xy6-80');s.sides.player.active.energy={Fire:2,Water:1};
 s.sides.player.active.tool=ref('demo-item','mine-tool');
 s.sides.opponent.active.energy={Fire:1};
 s.sides.opponent.active.tool=ref('demo-item','enemy-tool');
 s.sides.opponent.active.specialEnergy=[ref('xy6-97','enemy-special')];
 const before=[s.sides.player.deck.length,s.sides.opponent.deck.length];
 play(s,'attack',a=>a.attackIndex===1);
 assert.equal(Object.values(s.sides.player.active.energy).reduce((a,b)=>a+b,0),0);
 assert.equal(Object.values(s.sides.opponent.active.energy).reduce((a,b)=>a+b,0),0);
 assert.equal(s.sides.player.active.tool,null);
 assert.equal(s.sides.opponent.active.tool,null);
 assert.equal(s.sides.opponent.active.specialEnergy.length,0);
 assert.equal(s.sides.player.deck.some(r=>r.uid==='mine-tool'),true);
 assert.equal(s.sides.opponent.deck.some(r=>r.uid==='enemy-tool'),true);
 assert.equal(s.sides.opponent.deck.some(r=>r.uid==='enemy-special'),true);
 assert.equal(s.sides.player.active.cardId,'xy6-80');
 assert.equal(s.sides.player.deck.length,before[0]+4);
 assert.equal(s.sides.opponent.deck.length,before[1]+3-1,'opponent drew one card after turn ended');
}));


test('Turboblaze never offers the CPU an inert action when Fire is absent from hand',()=>using(()=>{
 const s=battle('xy6-63');s.sides.player.hand=[ref('demo-water-hand','water')];
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='ability'),false);
}));

test('Wally cannot evolve a Pokémon-EX, even when its Mega Evolution is in deck',()=>using(()=>{
 const s=battle('xy6-34');s.sides.player.hand=[ref('xy6-94','wally')];
 s.sides.player.deck=[ref('xy6-35','mega')];
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='xy6-94'),false);
}));
