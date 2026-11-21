'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),asset=path.join(root,'app/src/main/assets');
const data=require(path.join(asset,'tcgp-battle-data.js')),fx=require(path.join(asset,'tcgp-battle-effects.js'));
const core=require(path.join(asset,'tcgp-battle-core.js'));
const loan=require(path.join(asset,'tcg-classic-battle-data.js')).CLASSIC30_LOANER_DECK;
const PY=String.raw`
import sys,json,importlib.util
p=sys.argv[1];sys.path.insert(0,p)
spec=importlib.util.spec_from_file_location('xy6gen',p+'/build-xy6.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def row(n,name,sup='Pokémon',sub=None,att=None,abl=None,typ=None,stage=None,trait=None,rules=None):
 sub=sub or ([stage or 'Basic'] if sup=='Pokémon' else ['Item'])
 return [str(n),name,sup,sub,100,typ or (['Dragon'] if sup=='Pokémon' else []),None,att or [],abl or [],None,None,1,'Rare',rules or [],None,trait]
a=[
 row('77','Shaymin-EX',sub=['Basic','EX'],typ=['Colorless'],att=[['Sky Return',['C'],'30','Return this Pokémon and all cards attached to it to your hand.']],abl=[['Set Up','Ability','When you play this Pokémon from your hand onto your Bench, you may draw cards until you have 6 cards in your hand.']]),
 row('77a','Shaymin-EX',sub=['Basic','EX'],typ=['Colorless'],att=[['Sky Return',['C'],'30','Return this Pokémon and all cards attached to it to your hand.']],abl=[['Set Up','Ability','Draw to 6']]),
 row('106','Shaymin-EX',sub=['Basic','EX'],typ=['Colorless'],att=[['Sky Return',['C'],'30','Return this Pokémon and all cards attached to it to your hand.']],abl=[['Set Up','Ability','Draw to 6']]),
 row('97','Double Dragon Energy',sup='Energy',sub=['Special'],rules=['Can be attached only to Dragon Pokémon. Provides every type, but only 2 Energy at a time.']),
 row('84','Healing Scarf',sup='Trainer',sub=['Pokémon Tool']),
 row('86','Mega Turbo',sup='Trainer',sub=['Item']),
 row('92',"Trainers' Mail",sup='Trainer',sub=['Item']),
 row('92a',"Trainers' Mail",sup='Trainer',sub=['Item']),
 row('76','M Rayquaza-EX',sub=['MEGA','EX'],typ=['Colorless'],att=[['Emerald Break',['C','C','C'],'30×','This attack does 30 damage times the number of your Benched Pokémon.']],trait={'name':'Δ Evolution','text':'Early Mega evolution'}),
]
print(json.dumps(m.generate(a),ensure_ascii=False))
`;
const generated=spawnSync('python3',['-c',PY,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(generated.status,0,generated.stderr);
const mapped=Object.fromEntries(JSON.parse(generated.stdout).map(c=>[c.id,c]));
const custom={
 'audit-dragon':{id:'audit-dragon',kind:'pokemon',name:'Test Dragon',stage:'Basic',types:['Dragon'],subtype:'Dragon',hp:120,attacks:[{name:'Dual Strike',cost:'RG',damage:30,effect:{type:'noop'}}],battleEnabled:true},
 'audit-normal':{id:'audit-normal',kind:'pokemon',name:'Test Normal',stage:'Basic',types:['Colorless'],subtype:'Colorless',hp:120,attacks:[{name:'Tap',cost:'C',damage:10,effect:{type:'noop'}}],battleEnabled:true},
 'audit-basic-fire':{id:'audit-basic-fire',kind:'energy',name:'Fire Energy',basicEnergy:true,subtype:'Fire',energyType:'Fire',battleEnabled:true},
};
const ids={...custom,...mapped};
const slot=(id,uid)=>({uid,cardId:id,stack:[id],damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],benchSlot:null,conditions:{},playedOnSideTurn:1});
function using(fn){const prev=data.cardById;data.cardById=id=>ids[id]||prev(id);try{return fn();}finally{data.cardById=prev;}}
function battle(active='audit-normal'){
 const s=core.createBattle({format:'classic',playerDeck:loan,opponentDeck:loan,seed:355,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning'],opponentEnergyTypes:['Grass','Fire','Water','Lightning']});
 s.phase='battle';s.activeSide='player';s.turnNumber=10;s.stadium=null;
 for(const ss of Object.values(s.sides)){ss.turnCount=5;ss.hand=[];ss.bench=[];ss.handEnergyUsed=false;ss.energyUsed=false;ss.supporterUsed=false;ss.stadiumUsed=false;ss.actionLocks=[];ss.handLimit=8;ss.energyAvailable=true;}
 s.sides.player.active=slot(active,'mine');s.sides.opponent.active=slot('audit-normal','theirs');
 return s;
}
const ref=(id,uid)=>({cardId:id,uid:uid||id});
const action=(s,type,pred=()=>true,side='player')=>{const a=core.legalActions(s,side).find(a=>a.type===type&&pred(a));assert.ok(a,`${type} missing; legal: ${JSON.stringify(core.legalActions(s,side).map(a=>({type:a.type,cardId:a.cardId,choiceOption:a.choiceOption,target:a.target,effectEnergyType:a.effectEnergyType})))}`);return a;};
const play=(s,type,pred,side)=>core.applyAction(s,side||'player',action(s,type,pred,side));

test('Stage 3 generator enables full Shaymin trio, Dragon Energy, Healing Scarf and Mega Turbo',()=>{
 for(const id of ['xy6-77','xy6-77a','xy6-106','xy6-97','xy6-84','xy6-86','xy6-92','xy6-92a'])assert.equal(mapped[id].battleEnabled,true,`${id}: ${mapped[id].support.reasons}`);
 assert.deepEqual(mapped['xy6-97'].effect.provides,{Miracle:2});
 assert.equal(mapped['xy6-77'].abilities[0].event,'benched');
 assert.equal(mapped['xy6-77a'].abilities[0].fromHandOnly,true);
 for(const card of Object.values(mapped))if(card.battleEnabled){
  if(card.effect)assert.deepEqual(fx.validateEffect(card.effect),[],card.id);
  for(const a of card.attacks||[])assert.deepEqual(fx.validateEffect(a.effect),[],`${card.id} ${a.name}`);
  for(const a of card.abilities||[])assert.deepEqual(fx.validateEffect(a.effect),[],`${card.id} ${a.name}`);
 }
});

test('Shaymin Set Up is optional and draws only to six after entering from hand',()=>using(()=>{
 for(const id of ['xy6-77','xy6-77a','xy6-106']){
  const s=battle();s.sides.player.hand=[ref(id,'shay-'+id)];s.sides.player.deck=Array.from({length:9},(_,i)=>ref('audit-normal','draw-'+i));
  play(s,'bench',a=>a.cardId===id);
  assert.equal(s.phase,'effectChoice',id);
  assert.deepEqual(s.pendingChoice.options,['Draw until you have 6 cards','Do not use']);
  play(s,'effectChoice',a=>a.choiceOption===0);
  assert.equal(s.sides.player.hand.length,6,id);
  assert.equal(s.sides.player.deck.length,3,id);
 }
}));

test('Shaymin Set Up does not draw when declined or when the card enters from deck',()=>using(()=>{
 const s=battle();s.sides.player.hand=[ref('xy6-77')];s.sides.player.deck=Array.from({length:9},(_,i)=>ref('audit-normal','draw-'+i));
 play(s,'bench',a=>a.cardId==='xy6-77');
 play(s,'effectChoice',a=>a.choiceOption===1);
 assert.equal(s.sides.player.hand.length,0);
 const other=battle();other.sides.player.deck=Array.from({length:9},(_,i)=>ref('audit-normal','deck-'+i));
 core.effectContext(other,'player').benchCard(other.sides.player,ref('xy6-77','from-deck'));
 assert.equal(other.phase,'battle');assert.equal(other.sides.player.hand.length,0);
}));

test('Double Dragon costs two flexible units and cannot attach to a non-Dragon Pokémon',()=>using(()=>{
 const s=battle('audit-dragon');s.sides.player.hand=[ref('xy6-97','energy-1')];
 assert.ok(!core.legalActions(s,'player').some(a=>a.type==='attachSpecial'&&a.target==='bench'));
 play(s,'attachSpecial',a=>a.cardId==='xy6-97'&&a.target==='active');
 assert.equal(s.sides.player.active.specialEnergy.length,1);
 assert.equal(core.effectiveEnergy(s,'player',s.sides.player.active).Miracle,2);
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='attack'&&a.attackIndex===0),'two different typed attack costs must be paid by one Double Dragon');
 const blocked=battle('audit-normal');blocked.sides.player.hand=[ref('xy6-97','wrong')];
 assert.ok(!core.legalActions(blocked,'player').some(a=>a.type==='attachSpecial'&&a.cardId==='xy6-97'));
}));

test('Double Dragon falls off when its attached Pokémon stops being Dragon',()=>using(()=>{
 const s=battle('audit-dragon');s.sides.player.hand=[ref('xy6-97','two-units')];
 play(s,'attachSpecial',a=>a.cardId==='xy6-97');
 s.sides.player.active.cardId='audit-normal';s.sides.player.active.stack=['audit-normal'];
 assert.equal(Number(core.effectiveEnergy(s,'player',s.sides.player.active).Miracle||0),0,'never power off-type attacks');
 play(s,'endTurn');
 assert.equal(s.sides.player.active.specialEnergy.length,0);
 assert.ok(s.sides.player.discard.some(x=>x.uid==='two-units'));
}));

test('Healing Scarf heals twenty on hand attachment, never on an Energy Zone attachment',()=>using(()=>{
 const s=battle('audit-normal');s.sides.player.active.damage=70;
 s.sides.player.hand=[ref('xy6-84','scarf'),ref('audit-basic-fire','fire1')];
 play(s,'trainer',a=>a.cardId==='xy6-84');
 assert.equal(s.sides.player.active.tool?.cardId,'xy6-84');
 core.effectContext(s,'player').onEnergyAttached(s.sides.player.active,'Fire',1,{fromHand:false});
 assert.equal(s.sides.player.active.damage,70);
 play(s,'attachSpecial',a=>a.cardId==='audit-basic-fire');
 assert.equal(s.sides.player.active.damage,50);
}));

test('Mega Turbo attaches one real Basic Energy from discard to a Mega only',()=>using(()=>{
 const s=battle('xy6-76');s.sides.player.energyDiscard={Fire:1};s.sides.player.hand=[ref('xy6-86','mega-turbo')];
 const opts=core.legalActions(s,'player').filter(a=>a.type==='trainer'&&a.cardId==='xy6-86');
 assert.ok(opts.length,'Mega Turbo must be playable with a Mega and discarded Fire');
 const chosen=opts.find(a=>a.effectEnergyType==='Fire');assert.ok(chosen,JSON.stringify(opts));
 core.applyAction(s,'player',chosen);
 assert.equal(s.sides.player.active.energy.Fire,1);assert.equal(s.sides.player.energyDiscard.Fire,0);
 const wrong=battle('audit-normal');wrong.sides.player.energyDiscard={Fire:1};wrong.sides.player.hand=[ref('xy6-86')];
 assert.ok(!core.legalActions(wrong,'player').some(a=>a.type==='trainer'&&a.cardId==='xy6-86'));
}));


test('Both Trainers Mail prints choose a non-Mail Trainer from top four, leaving others in deck',()=>using(()=>{
 for(const mailId of ['xy6-92','xy6-92a']){
  const s=battle();s.sides.player.hand=[ref(mailId,'played-mail')];
  s.sides.player.deck=[ref('xy6-92','not-eligible'),ref('audit-normal','not-trainer'),ref('xy6-84','eligible-tool'),ref('xy6-86','eligible-item'),ref('audit-normal','after-four')];
  play(s,'trainer',a=>a.cardId===mailId);
  assert.equal(s.phase,'effectChoice',mailId);
  const legal=core.legalActions(s,'player').filter(a=>a.type==='effectChoice');
  assert.ok(legal.some(a=>a.choiceDeckIndex===2),JSON.stringify(legal));
  assert.ok(!legal.some(a=>a.choiceDeckIndex===0),'Cannot choose a Trainers Mail with Trainers Mail');
  assert.ok(!legal.some(a=>a.choiceDeckIndex===1),'Cannot take a Pokemon from the top four');
  play(s,'effectChoice',a=>a.choiceDeckIndex===2);
  assert.deepEqual(s.sides.player.hand.map(r=>r.cardId),['xy6-84']);
  assert.equal(s.sides.player.deck.length,4);
  assert.equal(s.sides.player.discard.at(-1).cardId,mailId);
 }
}));

test('Trainers Mail safely shuffles when there are no eligible Trainer cards in the top four',()=>using(()=>{
 const s=battle();s.sides.player.hand=[ref('xy6-92')];
 s.sides.player.deck=[ref('xy6-92','mail'),...Array.from({length:4},(_,i)=>ref('audit-normal','normal-'+i))];
 play(s,'trainer',a=>a.cardId==='xy6-92');
 assert.equal(s.phase,'battle');
 assert.equal(s.sides.player.deck.length,5);
 assert.equal(s.sides.player.hand.length,0);
}));


test('Trainers Mail is optional: declining a valid Trainer does not trap the choice menu',()=>using(()=>{
 const s=battle();s.sides.player.hand=[ref('xy6-92a')];
 s.sides.player.deck=[ref('xy6-84','eligible'),...Array.from({length:4},(_,i)=>ref('audit-normal','remain-'+i))];
 play(s,'trainer',a=>a.cardId==='xy6-92a');
 assert.equal(s.phase,'effectChoice');
 play(s,'effectChoice',a=>a.choiceSkip===true);
 assert.equal(s.phase,'battle');
 assert.equal(s.sides.player.hand.length,0);
 assert.equal(s.sides.player.deck.length,5);
}));
