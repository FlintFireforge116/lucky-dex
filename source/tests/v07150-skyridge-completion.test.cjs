'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const A=path.resolve(__dirname,'../app/src/main/assets');
const sky=require(path.join(A,'tcg-classic-skyridge.js'));
const cards=require(path.join(A,'tcg-classic-battle-data.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const fx=require(path.join(A,'tcgp-battle-effects.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const ai=require(path.join(A,'tcgp-battle-ai.js'));
const C=n=>cards.cardById('ecard3-'+n);
const ref=(id,uid)=>({cardId:id,uid:uid||'test-'+id});
function slot(id,uid){return core.makePokemonSlot(String(id).startsWith('ecard')?id:'ecard3-'+id,3,uid||'slot-'+id);}
function field(seed=11){
 const deck=opponents.generate({sets:['ecard3'],seed});assert.ok(deck.ok,deck.error);
 const s=core.createBattle({format:'classic',playerDeck:deck.cards,opponentDeck:deck.cards,seed,firstSide:'player',playerEnergyTypes:['Fire','Water','Grass','Lightning','Fighting','Psychic','Darkness','Metal'],opponentEnergyTypes:['Fire','Water','Grass','Lightning','Fighting','Psychic','Darkness','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=7;s.sides.player.turnCount=4;s.sides.opponent.turnCount=3;
 s.sides.player.active=slot(54,'player-active');s.sides.opponent.active=slot(65,'opponent-active');
 return s;
}
function context(s,player='player',attacker=s.sides[player].active,random=()=>.9){return {...core.effectContext(s,player,{},attacker),random,isAttack:true};}
function pick(s,predicate){assert.equal(s.phase,'effectChoice','expected a choice');const side=s.choiceSide,actions=core.legalActions(s,side);assert.ok(actions.length,'nonempty choice list');const a=predicate?actions.find(predicate):actions[0];assert.ok(a,'matching choice');core.applyAction(s,side,a);return a;}
const skyridge=(name)=>({type:'neoRule',rule:'skyridge:'+name});
test('All 150 numbered and 32 Holo Skyridge prints are battle-ready, with no incomplete effects',()=>{
 assert.deepEqual(sky.coverage(),{total:182,battleEnabled:182,partial:[]});
 for(const c of sky.CARDS){assert.equal(c.battleEnabled,true,c.id);assert.equal(c.deckEligible,true,c.id);assert.equal(c.support.status,'FULL',c.id);for(const a of [...(c.attacks||[]),...(c.abilities||[])])assert.ok(fx.supportsEffect(a.effect),c.id+': '+a.name);}
});
test('All printed Skyridge attacks dispatch across opposite coin branches without exceptions or invalid choices',()=>{
 let count=0;for(const c of sky.CARDS.filter(x=>x.kind==='pokemon'))for(const attack of c.attacks||[]){
  for(const start of [0,1]){const s=field(17),a=slot(c.id,'audit-attacker');a.energy={Grass:1,Fire:1,Water:1,Lightning:1,Fighting:1,Psychic:1,Darkness:1,Metal:1};s.sides.player.active=a;
   s.sides.player.bench=[slot(62,'pbench')];s.sides.opponent.bench=[slot(67,'obench')];s.sides.player.bench[0].benchSlot=0;s.sides.opponent.bench[0].benchSlot=0;
   let index=start;const ctx=context(s,'player',a,()=>((index++%2)?0.9:0.1));
   const result=fx.resolveAttack(attack,ctx);
   for(const effect of result.pendingEffects||[]){fx.applyEffect(effect,ctx);if(s.phase==='effectChoice')assert.ok(core.legalActions(s,s.choiceSide).length,`No choice: ${c.id} ${attack.name}`);}
   count++;
  }
 }
 assert.ok(count>=480,`ran ${count} attack branches`);
});
test('Energy Jump can move an attached Special Energy card, without converting or losing it',()=>{
 const s=field();s.sides.player.active=slot(2,'alakazam');s.sides.player.bench=[slot(54,'eevee')];s.sides.player.bench[0].benchSlot=0;
 const attached=ref('ecard2-144','rainbow1');s.sides.player.active.specialEnergy=[attached];
 fx.applyEffect(skyridge('energyJump'),context(s));
 pick(s,x=>x.choiceTarget==='active');pick(s,x=>x.choiceOption===0);pick(s,x=>x.choiceTarget==='bench');
 assert.deepEqual(s.sides.player.bench[0].specialEnergy.map(x=>x.uid),['rainbow1']);assert.equal(s.sides.player.active.specialEnergy.length,0);
});
test('Star Piece prompts the owner for a valid deck Evolution between turns',()=>{
 const s=field();const b=s.sides.player;
 b.bench=[slot(65,'hoot')];b.bench[0].benchSlot=0;b.bench[0].damage=30;b.bench[0].tool=ref('ecard3-139','star');
 b.deck=[ref('ecard3-40','noctowl') ,ref('ecard3-65','hoot2'),...b.deck];
 const current=s.turnNumber;
 // No special status at the checkup.
 core.endTurn(s);
 assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'player');assert.equal(s.pendingChoice.effect.rule,'skyridge:starPieceEvolve');
 pick(s,x=>x.choiceCardId==='ecard3-40');
 assert.equal(b.bench[0].cardId,'ecard3-40');assert.equal(b.bench[0].tool,null);
 assert.ok(b.discard.some(x=>x.uid==='star'));
 assert.ok(s.turnNumber>current,'the original end turn finishes after the choice');
});
test('Mystery Plate gamma devolves a chosen opposing Bench Evolution and puts the top card on deck bottom',()=>{
 const s=field(),foe=s.sides.opponent;
 foe.prizes=foe.prizes?.slice(0,2)||[{},{}];foe.prizesTaken=3;
 const target=slot(40,'noct');target.stack=['ecard3-65','ecard3-40'];target.cardId='ecard3-40';target.benchSlot=0;
 foe.bench=[target];
 fx.applyEffect(skyridge('mysteryPlateGammaAttack'),context(s));
 assert.equal(s.phase,'effectChoice');pick(s,x=>x.choiceTarget==='bench');
 assert.equal(target.cardId,'ecard3-65');assert.equal(foe.deck.at(-1).cardId,'ecard3-40');
});
test('Bounce Energy requires attached Basic Energy and lets player select which type returns to hand',()=>{
 const s=field(),p=s.sides.player;p.active.energy={Fire:1,Water:1};p.hand.push(ref('ecard3-142','bounce'));
 const action=core.legalActions(s,'player').find(a=>a.type==='attachSpecial'&&a.cardId==='ecard3-142'&&a.target==='active');assert.ok(action);
 core.applyAction(s,'player',action);assert.equal(s.phase,'effectChoice');
 pick(s,a=>a.choiceOption===1);
 assert.equal(p.active.energy.Water,0);assert.equal(p.active.energy.Fire,1);
 assert.equal(p.active.specialEnergy[0].cardId,'ecard3-142');
 assert.ok(p.hand.some(x=>cards.cardById(x.cardId)?.basicEnergy&&cards.cardById(x.cardId)?.subtype==='Water'));
});
test('Cyclone Energy gives the defending player the switch choice',()=>{
 const s=field(),p=s.sides.player,foe=s.sides.opponent;p.hand.push(ref('ecard3-143','cyclone'));
 foe.bench=[slot(67,'first'),slot(68,'second')];foe.bench[0].benchSlot=0;foe.bench[1].benchSlot=1;
 const action=core.legalActions(s,'player').find(a=>a.type==='attachSpecial'&&a.cardId==='ecard3-143'&&a.target==='active');assert.ok(action);
 core.applyAction(s,'player',action);assert.equal(s.choiceSide,'opponent');
 pick(s,a=>a.choiceBenchIndex===1);
 assert.equal(foe.active.uid,'second');
});
test('Retro Energy chooses whether to devolve and heals 20 when used',()=>{
 const s=field(),p=s.sides.player;p.active=slot(40,'noct');p.active.stack=['ecard3-65','ecard3-40'];p.active.damage=40;p.hand.push(ref('ecard3-144','retro'));
 const a=core.legalActions(s,'player').find(x=>x.type==='attachSpecial'&&x.cardId==='ecard3-144'&&x.target==='active');assert.ok(a);
 core.applyAction(s,'player',a);pick(s,x=>x.choiceOption===1);
 assert.equal(p.active.cardId,'ecard3-65');assert.equal(p.active.damage,20);assert.ok(p.discard.some(x=>x.cardId==='ecard3-40'));
});
test('Opponent deck generation, 30-card legality and CPU actions remain valid with all Skyridge cards available',()=>{
 for(let seed of [11,22,33,44]){
  const d=opponents.generate({sets:['ecard3'],seed});assert.ok(d.ok,d.error);assert.equal(d.cards.length,30);assert.ok(cards.validateDeck(d.cards).ok);
  const s=core.createBattle({format:'classic',playerDeck:d.cards,opponentDeck:d.cards,seed,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Fighting','Psychic','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Fighting','Psychic','Darkness','Metal']});
  let actions=0;for(;actions<150&&!s.winner;actions++){
   const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.phase==='setup'?s.setupSide:s.activeSide;
   const legal=core.legalActions(s,side);if(!legal.length)break;const suggested=ai.chooseAction(s,side,'Advanced',actions);const action=suggested?.action||suggested||legal[0];if(!action?.type)break;core.applyAction(s,side,action);
  }
  assert.ok(actions>10,`CPU seed ${seed}: ${actions}`);assert.ok(!s.log.some(l=>l.type==='battleError'));
 }
});
test('Android, splash labels and JS marker are all 0.69.150',()=>{
 const gradle=fs.readFileSync(path.resolve(A,'../../../build.gradle'),'utf8'),html=fs.readFileSync(path.join(A,'index.html'),'utf8'),app=fs.readFileSync(path.join(A,'app-v0167.js'),'utf8');
 assert.match(gradle,/versionName '0\.69\.150'/);assert.match(gradle,/versionCode 7130/);assert.ok(app.includes("window.__LUCKYDEX_BUILD='0.69.150'"));assert.equal(html.split('v0.69.150').length-1,2);
});
test('Flame Vapor lets the attacker select exact opposing Energy cards for each heads',()=>{
 const s=field(),foe=s.sides.opponent;foe.active.energy={Grass:1,Water:1};foe.active.specialEnergy=[ref('ecard2-144','rainbow-x')];
 fx.applyEffect(skyridge('flameVapor'),context(s,'player',s.sides.player.active,()=>.1));
 assert.equal(s.phase,'effectChoice');pick(s,x=>x.choiceLabel.includes('Water'));
 assert.equal(foe.active.energy.Water,0);
 pick(s,x=>x.choiceLabel.includes('Rainbow'));
 assert.equal(foe.active.specialEnergy.length,0);assert.ok(foe.discard.some(x=>x.uid==='rainbow-x'));assert.equal(foe.active.energy.Grass,1);
});
test('Energy Recharge chooses recovered Basic Energy type from the discard',()=>{
 const s=field(),p=s.sides.player;p.active=slot(3,'arc');p.energyDiscard={Water:1,Fire:1};p.active.energy={};
 fx.applyEffect(skyridge('energyRecharge'),context(s,'player',p.active,()=>.1));
 assert.equal(s.phase,'effectChoice');pick(s,x=>x.choiceLabel.includes('Water'));
 assert.equal(p.active.energy.Water,1);assert.equal(p.active.energy.Fire||0,0);
 pick(s,x=>x.choiceLabel==='Stop');
 assert.equal(p.energyDiscard.Water,0);
});
test('Aqua Trick can move a chosen Special Energy attached to opponent Active',()=>{
 const s=field(),p=s.sides.player,foe=s.sides.opponent;
 p.active=slot(33,'vaporeon');foe.active.specialEnergy=[ref('ecard2-144','rainbow-opp')];foe.bench=[slot(67,'foe-bench')];foe.bench[0].benchSlot=0;
 fx.applyEffect({...skyridge('moveOpposingEnergy'),fromAquaTrick:true},context(s));
 assert.equal(s.phase,'effectChoice');pick(s,x=>x.choiceLabel?.includes('Rainbow'));
 pick(s,x=>x.choiceTarget==='bench');
 assert.equal(foe.active.specialEnergy.length,0);assert.equal(foe.bench[0].specialEnergy[0].uid,'rainbow-opp');
});
test('Mystery Plate beta lets player choose precisely which opposing Energy cards return to deck',()=>{
 const s=field(),foe=s.sides.opponent;foe.prizes=foe.prizes.slice(0,1);
 foe.active.energy={Fire:1,Water:1};foe.active.specialEnergy=[ref('ecard2-144','rainbow-opp')];
 fx.applyEffect(skyridge('mysteryPlateBetaAttack'),context(s));
 assert.equal(s.phase,'effectChoice');pick(s,x=>x.choiceLabel.includes('Water'));
 pick(s,x=>x.choiceLabel?.includes('Rainbow'));
 assert.equal(foe.active.energy.Water,0);assert.equal(foe.active.energy.Fire,1);assert.equal(foe.active.specialEnergy.length,0);
 assert.ok(foe.deck.some(x=>x.uid==='rainbow-opp'));
});
test('Hyper Potion allows target, amount, and individual Basic Energy discard choices',()=>{
 const s=field(),p=s.sides.player;p.active.damage=60;p.active.energy={Fire:1,Water:2};
 fx.applyEffect(skyridge('hyperPotion'),context(s));
 pick(s,x=>x.choiceTarget==='active');pick(s,x=>x.choiceOption===1);
 pick(s,x=>x.choiceLabel.includes('Water'));pick(s,x=>x.choiceLabel.includes('Water'));
 assert.equal(p.active.damage,10);assert.equal(p.active.energy.Fire,1);assert.equal(p.active.energy.Water,0);
});
test('Miracle Sphere beta chooses the exact opposing Energy card to shuffle into deck',()=>{
 const s=field(),p=s.sides.player,foe=s.sides.opponent;p.active.energy={Fire:1,Water:1,Psychic:1};
 foe.active.energy={Fire:1};foe.active.specialEnergy=[ref('ecard2-144','rainbow-opp')];
 fx.applyEffect(skyridge('miracleSphereBetaAttack'),context(s));
 assert.equal(s.phase,'effectChoice');pick(s,x=>x.choiceLabel.includes('Rainbow'));
 assert.equal(foe.active.specialEnergy.length,0);assert.equal(foe.active.energy.Fire,1);
 assert.ok(foe.deck.some(x=>x.uid==='rainbow-opp'));
});
