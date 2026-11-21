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
 row('37','Gliscor','Stage 1',[['Rock Slide',['F','C'],'20',"This attack does 20 damage to 2 of your opponent\'s Benched Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)"],['Slash',['F','C','C'],'40','']],typ='Fighting',evolves='Gligar'),
 ['95','Wide Lens','Trainer',['Pokémon Tool'],None,[],None,[],[],None,None,0,'Uncommon',["Damage from the attacks of the Pokémon this card is attached to is affected by Weakness and Resistance for your opponent\'s Benched Pokémon."],'Tool',None],
 row('22','Electrode','Stage 1',[['Continuous Tumble',['L'],'20×','Flip a coin until you get tails. This attack does 20 damage times the number of heads.'],['Energy Bomb',['L','C','C'],'70','You may move all Energy from this Pokémon to your Benched Pokémon in any way you like.']],typ='Lightning',evolves='Voltorb'),
 row('40','Absol',att=[['Mach Claw',['D'],'30',"This attack's damage isn't affected by Resistance."]],abl=[['Cursed Eyes','Ability',"When you play this Pokémon from your hand onto your Bench, you may move 3 damage counters from 1 of your opponent's Pokémon to another of his or her Pokémon."]],typ='Darkness'),
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
 'demo-dragon-special':{id:'demo-dragon-special',kind:'energy',name:'Double Dragon Energy',specialEnergy:true,basicEnergy:false,effect:{type:'specialEnergy',provides:{Miracle:2},attachOnlyTypes:['Dragon']}},
 'demo-weak':{id:'demo-weak',kind:'pokemon',name:'Weak Example',stage:'Basic',hp:200,types:['Grass'],weakness:'Fighting',weaknessValue:'×2',battleEnabled:true},
 'demo-resist':{id:'demo-resist',kind:'pokemon',name:'Resist Example',stage:'Basic',hp:200,types:['Colorless'],resistance:'Fighting',resistanceValue:'-20',battleEnabled:true},
 'demo-weak-dragon':{id:'demo-weak-dragon',kind:'pokemon',name:'Weak to Dragon',stage:'Basic',hp:300,types:['Colorless'],weakness:'Dragon',weaknessValue:'×2',battleEnabled:true},
 'demo-dragon':{id:'demo-dragon',kind:'pokemon',name:'Test Dragon',stage:'Basic',hp:200,types:['Dragon'],subtype:'Dragon',battleEnabled:true},
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



test('Electrode Energy Bomb allows declining the optional full transfer',()=>using(()=>{
 const s=battle('xy6-22');s.sides.player.active.energy={Lightning:2,Fire:1,Colorless:1};
 s.sides.player.bench=[slot('demo-dragon','dragon',0)];
 play(s,'attack',a=>a.attackIndex===1);
 assert.equal(s.phase,'effectChoice');
 play(s,'effectChoice',a=>a.choiceOption===1);
 assert.equal(s.sides.player.active.energy.Lightning,2);
 assert.equal(s.sides.player.bench[0].energy.Lightning||0,0);
}));

test('Electrode Energy Bomb transfers each physical basic and Dragon-only Special Energy to chosen eligible Bench',()=>using(()=>{
 const s=battle('xy6-22');s.sides.player.active.energy={Lightning:2,Fire:1,Colorless:1};
 s.sides.player.active.specialEnergy=[ref('demo-dragon-special','special1')];
 s.sides.player.bench=[slot('demo-normal','normal',0),slot('demo-dragon','dragon',1)];
 play(s,'attack',a=>a.attackIndex===1);
 play(s,'effectChoice',a=>a.choiceOption===0);
 for(const index of [0,1,0,1]){
  assert.equal(s.phase,'effectChoice');
  play(s,'effectChoice',a=>a.choiceTarget==='bench'&&a.choiceBenchIndex===index);
 }
 assert.equal(s.phase,'effectChoice');
 const options=core.legalActions(s,'player').filter(a=>a.type==='effectChoice');
 assert.deepEqual(options.filter(a=>a.choiceTarget==='bench').map(a=>a.choiceBenchIndex),[1]);
 play(s,'effectChoice',a=>a.choiceTarget==='bench'&&a.choiceBenchIndex===1);
 assert.deepEqual(s.sides.player.active.energy,{Lightning:0,Fire:0,Colorless:0});
 assert.equal(s.sides.player.active.specialEnergy.length,0);
 assert.equal(s.sides.player.bench[1].specialEnergy[0].uid,'special1');
 assert.equal(s.sides.player.bench[0].energy.Lightning,1);
 assert.equal(s.sides.player.bench[1].energy.Lightning,1);
}));

test('Absol Cursed Eyes offers optional choice only when there are enough counters and a destination',()=>using(()=>{
 const s=battle('demo-normal');s.sides.opponent.active.damage=50;
 s.sides.opponent.bench=[slot('demo-normal','foebench',0)];
 s.sides.player.hand=[ref('xy6-40','absol')];
 play(s,'bench',a=>a.cardId==='xy6-40');
 assert.equal(s.phase,'effectChoice');
 play(s,'effectChoice',a=>a.choiceOption===0);
 play(s,'effectChoice',a=>a.choiceTarget==='active');
 play(s,'effectChoice',a=>a.choiceTarget==='bench'&&a.choiceBenchIndex===0);
 assert.equal(s.sides.opponent.active.damage,20);
 assert.equal(s.sides.opponent.bench[0].damage,30);
 assert.ok(s.log.some(e=>e.type==='xy6CursedEyes'));
}));

test('Absol Cursed Eyes does not trigger from deck or without a legal pair',()=>using(()=>{
 const s=battle('demo-normal');s.sides.opponent.active.damage=20;s.sides.opponent.bench=[slot('demo-normal','foe',0)];
 s.sides.player.hand=[ref('xy6-40','absol')];
 play(s,'bench',a=>a.cardId==='xy6-40');
 assert.notEqual(s.phase,'effectChoice');
}));


test('Wide Lens doubles true Fighting-weak Bench damage and reduces resisted damage for spread attacks',()=>using(()=>{
 assert.equal(cards['xy6-95'].battleEnabled,true);
 const s=battle('xy6-37');s.sides.player.active.energy={Fighting:2,Colorless:2};
 s.sides.player.active.tool=ref('xy6-95','lens');
 s.sides.opponent.bench=[slot('demo-weak','weak',0),slot('demo-resist','resist',1)];
 play(s,'attack',a=>a.attackIndex===0);
 play(s,'effectChoice',a=>a.choiceTarget==='bench'&&a.choiceBenchIndex===0);
 play(s,'effectChoice',a=>a.choiceTarget==='bench'&&a.choiceBenchIndex===1);
 assert.equal(s.sides.opponent.bench[0].damage,40);
 assert.equal(s.sides.opponent.bench[1].damage,0);
}));

test('Wide Lens does not change Bench matchup without the Tool',()=>using(()=>{
 const s=battle('xy6-37');s.sides.player.active.energy={Fighting:2,Colorless:2};
 s.sides.opponent.bench=[slot('demo-weak','weak',0),slot('demo-resist','resist',1)];
 play(s,'attack',a=>a.attackIndex===0);
 play(s,'effectChoice',a=>a.choiceTarget==='bench'&&a.choiceBenchIndex===0);
 play(s,'effectChoice',a=>a.choiceTarget==='bench'&&a.choiceBenchIndex===1);
 assert.equal(s.sides.opponent.bench[0].damage,20);
 assert.equal(s.sides.opponent.bench[1].damage,20);
}));

test('Wide Lens applies to targeted direct Bench damage, respecting Weakness Policy',()=>using(()=>{
 const s=battle('xy6-59');s.sides.player.active.energy={Psychic:2,Colorless:2};
 s.sides.player.active.tool=ref('xy6-95','lens');
 s.sides.opponent.bench=[slot('demo-weak-dragon','weak',0),slot('demo-weak-dragon','protected',1)];
 s.sides.opponent.bench[1].tool=ref('xy5-142','policy');
 play(s,'attack',a=>a.attackIndex===0&&a.target==='opponentBench'&&Number(a.benchIndex??a.effectBenchIndex)===0);
 assert.equal(s.sides.opponent.bench[0].damage,240);
 const t=battle('xy6-59');t.sides.player.active.energy={Psychic:2,Colorless:2};t.sides.player.active.tool=ref('xy6-95','lens2');
 t.sides.opponent.bench=[slot('demo-weak-dragon','protected2',0)];t.sides.opponent.bench[0].tool=ref('xy5-142','policy2');
 play(t,'attack',a=>a.attackIndex===0&&a.target==='opponentBench'&&Number(a.benchIndex??a.effectBenchIndex)===0);
 assert.equal(t.sides.opponent.bench[0].damage,120);
}));
