'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),asset=path.join(root,'app/src/main/assets');
const data=require(path.join(asset,'tcgp-battle-data.js'));
const fx=require(path.join(asset,'tcgp-battle-effects.js'));
const core=require(path.join(asset,'tcgp-battle-core.js'));
const loan=require(path.join(asset,'tcg-classic-battle-data.js')).CLASSIC30_LOANER_DECK;
const printRows=String.raw`
import importlib.util,json,sys
p=sys.argv[1];sys.path.insert(0,p)
spec=importlib.util.spec_from_file_location('xy6gen',p+'/build-xy6.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def row(num,name,atk=None,trait=None,ab=None,stage='Basic',parent=None,typ='Colorless',hp=130,sub=None):
 return [str(num),name,'Pokémon',sub or [stage],hp,[typ],parent,atk or [],ab or [],None,None,1,'Rare',[],None,{'name':trait,'text':trait} if trait else None]
rows=[
 row(5,'Beautifly',[['Whirlwind',['G'],'80','You may have your opponent switch his or her Active Pokémon with 1 of his or her Benched Pokémon.']],ab=[['Miraculous Scales','Ability','Prevent all damage from attacks of Pokémon-EX.']],stage='Stage 2',parent='Silcoon',typ='Grass'),
 row(8,'Dustox',[['Flap',['G'],'20',''],['Wind Shard',['G','C'],'','This attack does 50 damage to 1 of your opponent\'s Benched Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)']],trait='Δ Plus',stage='Stage 2',parent='Cascoon',typ='Grass'),
 row(17,'Articuno',[['Chilling Sigh',['W'],'','Your opponent\'s Active Pokémon is now Asleep.'],['Tri Edge',['W','C','C'],'20+','Flip 3 coins. This attack does 40 more damage for each heads.']],trait='Δ Plus',typ='Water'),
 row(28,'Natu',[['Psywave',['P'],'10×','This attack does 10 damage times the amount of Energy attached to your opponent\'s Active Pokémon.']],trait='Δ Plus',typ='Psychic'),
 row(30,'Shuppet',[['Bleh',['P'],'','Discard a Special Energy attached to 1 of your opponent\'s Pokémon.']],typ='Psychic'),
 row(32,'Banette',[['Evolution Jammer',['P'],'20','Your opponent can\'t play any Pokémon from his or her hand to evolve his or her Pokémon during his or her next turn.'],['Curse Deeply',['P','C'],'','Put 5 damage counters on your opponent\'s Active Pokémon.']],trait='Δ Evolution',stage='Stage 1',parent='Shuppet',typ='Psychic'),
 row(35,'M Gallade-EX',[['Unwavering Blade',['P','C','C'],'110','This attack does 30 damage to each of your opponent\'s Benched Pokémon that has any damage counters on it. (Don\'t apply Weakness and Resistance for Benched Pokémon.)']],stage='Stage 1',parent='Gallade-EX',typ='Psychic',sub=['MEGA','EX']),
 row(47,'Carbink',[['Spin Tackle',['Y','C'],'60','Flip a coin. If tails, this Pokémon does 20 damage to itself.']],ab=[['Jewel Armor','Ability','While on Bench prevent attack damage.']],typ='Fairy'),
 row(61,'M Rayquaza-EX',[['Dragon Ascent',['R','R','R','C','C'],'300','Discard 2 Energy attached to this Pokémon.']],trait='Δ Wild',stage='Stage 1',parent='Rayquaza-EX',typ='Dragon',sub=['MEGA','EX']),
 row(72,'Swellow',[['Peck',['C'],'30',''],['Wing Attack',['C','C'],'50','']],trait='Δ Plus',stage='Stage 1',parent='Taillow'),
 row(74,'Altaria',[['Wing Attack',['C'],'30','']],trait='Δ Evolution',ab=[['Clear Humming','Ability','Each Colorless Pokémon has no Weakness.']],stage='Stage 1',parent='Swablu'),
 row(76,'M Rayquaza-EX',[['Emerald Break',['C','C','C'],'30×','This attack does 30 damage times the number of your Benched Pokémon.']],trait='Δ Evolution',stage='Stage 1',parent='Rayquaza-EX',sub=['MEGA','EX']),
 row(81,'Unfezant',[['Feather Dance',['C'],'','During your next turn, each of this Pokémon\'s attacks does 80 more damage (before applying Weakness and Resistance).'],['Sky Attack',['C','C','C'],'120','Flip a coin. If tails, this attack does nothing.']],trait='Δ Evolution',stage='Stage 2',parent='Tranquill'),
 row(100,'M Gallade-EX',[['Unwavering Blade',['P','C','C'],'110','This attack does 30 damage to each of your opponent\'s Benched Pokémon that has any damage counters on it. (Don\'t apply Weakness and Resistance for Benched Pokémon.)']],stage='Stage 1',parent='Gallade-EX',typ='Psychic',sub=['MEGA','EX']),
 row(105,'M Rayquaza-EX',[['Emerald Break',['C','C','C'],'30×','This attack does 30 damage times the number of your Benched Pokémon.']],trait='Δ Evolution',stage='Stage 1',parent='Rayquaza-EX',sub=['MEGA','EX']),
]
print(json.dumps(m.generate(rows),ensure_ascii=False))
`;
const p=spawnSync('python3',['-c',printRows,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(p.status,0,p.stderr);
const mapped=Object.fromEntries(JSON.parse(p.stdout).map(c=>[c.id,c]));
const normals={
 'audit-normal':{id:'audit-normal',kind:'pokemon',name:'Normal',stage:'Basic',hp:120,types:['Colorless'],subtype:'Colorless',attacks:[{name:'Hit',cost:'C',damage:30,effect:{type:'noop'}}],battleEnabled:true},
 'audit-fire':{id:'audit-fire',kind:'pokemon',name:'Flame',stage:'Basic',hp:160,types:['Fire'],subtype:'Fire',attacks:[{name:'Hit',cost:'C',damage:60,effect:{type:'noop'}}],battleEnabled:true},
 'audit-shuppet':{id:'audit-shuppet',kind:'pokemon',name:'Shuppet',stage:'Basic',hp:70,types:['Psychic'],subtype:'Psychic',attacks:[],battleEnabled:true},
 'audit-cascoon':{id:'audit-cascoon',kind:'pokemon',name:'Cascoon',stage:'Stage 1',hp:90,types:['Grass'],subtype:'Grass',attacks:[],battleEnabled:true},
 'audit-regular':{id:'audit-regular',kind:'pokemon',name:'Regular',stage:'Stage 1',evolvesFrom:'Shuppet',hp:130,types:['Psychic'],subtype:'Psychic',attacks:[],battleEnabled:true},
};
const refs={...normals,...mapped};
const slot=(id,uid,benchSlot)=>({cardId:id,uid:uid||id,benchSlot:benchSlot??null,stack:[id],damage:0,energy:{},specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
function withCards(fn){const old=data.cardById;data.cardById=id=>refs[id]||old(id);try{return fn();}finally{data.cardById=old;}}
function board(player='xy6-72',opponent='audit-normal'){
 const s=core.createBattle({format:'classic',playerDeck:loan,opponentDeck:loan,seed:61354,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;s.pendingPrizeClaims=[];
 for(const side of Object.values(s.sides)){side.turnCount=5;side.hand=[];side.bench=[];side.actionLocks=[];side.energyUsed=false;side.handEnergyUsed=false;}
 s.sides.player.active=slot(player,'p');s.sides.player.active.energy={Grass:5,Fire:5,Water:5,Lightning:5,Psychic:5,Fighting:5,Darkness:5,Metal:5};
 s.sides.opponent.active=slot(opponent,'o');return s;
}
const hit=(s,index=0,which)=>{const list=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===index);
 assert.ok(list.length,'Attack unavailable: '+s.sides.player.active.cardId+' #'+index);const action=which?list.find(which):list[0];assert.ok(action,'No matching attack action');core.applyAction(s,'player',action);return action;};
function effectCtx(s,e={}){return {state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,random:()=>.1,log:s.log,action:e.action||{},isAttack:true};}
test('Roaring Skies Stage 2 catalogue verifies no partial attack or Ability is enabled',()=>{
 for(const card of Object.values(mapped)){
  assert.equal(card.battleEnabled,true,card.id+': '+card.support.reasons.join(';'));
  for(const attack of card.attacks)assert.deepEqual(fx.validateEffect(attack.effect),[],card.id+': '+attack.name);
  for(const ability of card.abilities)assert.deepEqual(fx.validateEffect(ability.effect),[],card.id+': '+ability.name);
 }
 assert.equal(mapped['xy6-105'].ancientTrait.name,'Δ Evolution');
 assert.equal(mapped['xy6-100'].attacks[0].effect.type,'benchDamage');
});
test('Δ Evolution permits early same-turn evolution but does not permit a non-Δ Stage 1',()=>withCards(()=>{
 const s=board('audit-shuppet');s.turnNumber=1;s.sides.player.turnCount=1;s.sides.player.active.playedOnSideTurn=1;
 // The actual printed Banette expects Shuppet; changing the id in this fixture preserves identity.
 s.sides.player.hand=[{uid:'h-delta',cardId:'xy6-32'},{uid:'h-normal',cardId:'audit-regular'}];
 const moves=core.legalActions(s,'player').filter(x=>x.type==='evolve');
 assert.ok(moves.some(x=>x.cardId==='xy6-32'),JSON.stringify(moves));
 assert.ok(!moves.some(x=>x.cardId==='audit-regular'));
 core.applyAction(s,'player',moves.find(x=>x.cardId==='xy6-32'));
 assert.equal(s.sides.player.active.cardId,'xy6-32');
}));
test('Δ Plus awards two Prize choices on a direct knockout, without revealing hidden cards',()=>withCards(()=>{
 const s=board('xy6-72');s.sides.opponent.active.damage=85;
 hit(s,1);
 assert.equal(s.phase,'effectChoice');
 assert.equal(s.pendingPrizeClaims[0].remaining,2,JSON.stringify(s.pendingPrizeClaims));
 assert.equal(s.pendingChoice.kind,'prizeCard');
 assert.ok(!s.pendingChoice.cards,'hidden Prize IDs must stay hidden');
}));
test('Δ Plus applies to opponent Bench attack knockouts as well',()=>withCards(()=>{
 const s=board('xy6-8');s.sides.opponent.bench=[slot('audit-normal','b',0)];s.sides.opponent.bench[0].damage=80;
 hit(s,1,x=>x.target==='opponentBench');
 assert.equal(s.pendingPrizeClaims[0].remaining,2,JSON.stringify(s.pendingPrizeClaims));
}));
test('Δ Wild subtracts 20 after matchups against the four printed types, but not Psychic',()=>withCards(()=>{
 const s=board('audit-fire','xy6-61'),target=s.sides.opponent.active,src=s.sides.player.active;
 src.energy={Fire:1};
 let dmg=fx.attackDamageWithState(s,'player',src,'opponent',target,50,data.cardById);
 assert.equal(dmg,30);
 s.sides.player.active=slot('xy6-28','p');const psychic=fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',target,50,data.cardById);
 assert.equal(psychic,50);
 target.abilitySuppressed=true;const suppressed=fx.attackDamageWithState(s,'player',src,'opponent',target,50,data.cardById);
 assert.equal(suppressed,30,'Ancient Trait must not depend on Abilities');
}));
test('Miraculous Scales blocks EX attack damage only; Jewel Armor blocks both sides on Bench',()=>withCards(()=>{
 const s=board('xy6-61','xy6-5'),at=s.sides.player.active,beauty=s.sides.opponent.active;
 assert.ok(fx.attackIsPrevented(s,'opponent',beauty,at,data.cardById));
 const non=slot('audit-fire','fire');s.sides.player.active=non;
 assert.ok(!fx.attackIsPrevented(s,'opponent',beauty,non,data.cardById));
 const carb=slot('xy6-47','carb',0);s.sides.opponent.bench=[carb];
 assert.ok(fx.attackIsPrevented(s,'opponent',carb,non,data.cardById));
 s.sides.opponent.active=carb;s.sides.opponent.bench=[];
 assert.ok(!fx.attackIsPrevented(s,'opponent',carb,non,data.cardById));
}));
test('Clear Humming removes Colorless weakness while the Ability is active',()=>withCards(()=>{
 const s=board('audit-fire','audit-normal'),p=s.sides.opponent.active;
 p.cardId='audit-normal';p.stack=['audit-normal'];
 refs['audit-normal'].weakness='Fire';refs['audit-normal'].weaknessValue='×2';
 assert.equal(fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',p,30,data.cardById),60);
 const bird=slot('xy6-74','altaria',0);s.sides.opponent.bench=[bird];
 assert.equal(fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',p,30,data.cardById),30);
 bird.abilitySuppressed=true;
 assert.equal(fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',p,30,data.cardById),60);
 delete refs['audit-normal'].weakness;delete refs['audit-normal'].weaknessValue;
}));
test('Curse Deeply places exactly five damage counters, ignoring Weakness',()=>withCards(()=>{
 const s=board('xy6-32','audit-normal');s.sides.opponent.active.damage=0;
 hit(s,1);assert.equal(s.sides.opponent.active?.damage,50);
}));
test('Emerald Break counts the physical Bench, including the alt-print',()=>withCards(()=>{
 for(const id of ['xy6-76','xy6-105']){
  const s=board(id,'audit-normal');s.sides.player.bench=[slot('audit-normal','b1',0),slot('audit-normal','b2',1)];
  hit(s);assert.equal(s.sides.opponent.active?.damage,60,id);
 }
}));
