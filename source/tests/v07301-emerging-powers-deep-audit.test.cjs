'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const asset=path.resolve(__dirname,'../app/src/main/assets');
const bw=require(path.join(asset,'tcg-classic-emerging-powers.js'));
const data=require(path.join(asset,'tcg-classic-battle-data.js'));
const fx=require(path.join(asset,'tcgp-battle-effects.js'));
const core=require(path.join(asset,'tcgp-battle-core.js'));
const cpu=require(path.join(asset,'tcg-classic-opponents.js'));
const deck=cpu.generate({sets:['bw2'],type:'Grass',seed:56});assert.ok(deck.ok);
const slot=(id,uid)=>core.makePokemonSlot('bw2-'+id,2,uid||'bw2-'+id);
function scene(){const s=core.createBattle({format:'classic',seed:41,firstSide:'player',playerDeck:deck.cards,opponentDeck:deck.cards,playerEnergyTypes:['Grass','Fire','Water','Darkness'],opponentEnergyTypes:['Grass','Fire','Water','Darkness']});s.phase='battle';s.activeSide='player';s.turnNumber=11;s.log=[];for(const [side,b] of Object.entries(s.sides)){b.active=slot(side==='player'?'2':'69',side+'-active');b.active.energy={Colorless:3};b.bench=[];b.discard=[];b.deck=[];b.hand=[];b.energyDiscard={};b.lostZone=[];b.turnCount=4;}return s;}
function run(s,e,{action={},resolvingChoice=false,src=s.sides.player.active,random=()=>0.1,isAttack=false,effectiveEnergy}={}){let ch=null;const p=s.sides.player,o=s.sides.opponent; const ctx={state:s,side:'player',foeSide:'opponent',attacker:src,defender:o.active,cardById:data.cardById,action,resolvingChoice,random,isAttack,requestChoice:x=>{ch=x;},shuffle:(_,arr)=>arr.reverse(),drawCard:b=>{const r=b.deck.shift();if(r)b.hand.push(r);return r;},onEnergyAttached:()=>{},effectiveEnergy:effectiveEnergy||((x)=>x.energy||{}),maxHp:(_,x)=>data.cardById(x.cardId)?.hp};fx.applyEffect(e,ctx);return ch;}
function choose(s,ch,action){assert.ok(ch,'Expected choice');return run(s,ch.effect,{action,resolvingChoice:true});}
const ref=(cardId,uid)=>({cardId,uid});

test('Recycle can put a discarded Basic Energy ledger unit onto the top of the deck, without consuming ordered Energy Zone',()=>{const s=scene(),p=s.sides.player;p.energyDiscard={Grass:2,Water:1};p.energySupply=['Fire','Grass'];let ch=run(s,bw.cardById('bw2-96').effect);assert.equal(ch?.kind,'option');assert.ok(ch.options.some(x=>x.includes('Grass')));ch=choose(s,ch,{choiceOption:ch.options.findIndex(x=>x.includes('Grass'))});assert.equal(ch,null);assert.equal(p.energyDiscard.Grass,1);assert.equal(p.energySupply.length,2);assert.equal(p.deck.length,1);assert.equal(data.cardById(p.deck[0].cardId)?.energyType,'Grass');});
test('Recycle distinguishes physical cards and Basic Energy ledger when both exist',()=>{const s=scene(),p=s.sides.player;p.discard=[ref('bw2-91','discard-cher')];p.energyDiscard={Water:1};let ch=run(s,bw.cardById('bw2-96').effect);assert.equal(ch?.kind,'option');assert.ok(ch.options.some(x=>x.includes('discarded card')));assert.ok(ch.options.some(x=>x.includes('Water')));ch=choose(s,ch,{choiceOption:0});assert.equal(ch?.kind,'discardCard');choose(s,ch,{choiceDiscardIndex:0});assert.equal(p.deck[0]?.uid,'discard-cher');assert.equal(p.energyDiscard.Water,1);assert.equal(p.discard.length,0);});
test('Recycle tails never moves a card or spent Energy and opposing ledger cannot be recovered',()=>{const s=scene(),p=s.sides.player,o=s.sides.opponent;p.energyDiscard={};o.energyDiscard={Grass:4};assert.equal(run(s,bw.cardById('bw2-96').effect,{random:()=>.9}),null);assert.equal(p.deck.length,0);assert.equal(run(s,bw.cardById('bw2-96').effect),null);assert.equal(o.energyDiscard.Grass,4);});
test('Special Rainbow Energy activates all three elemental-monkey attack payoffs',()=>{for(const [number,attackName,effectStatus,type] of [['2',"Fire's Power",'burn','Fire'],['19',"Water's Power",'sleep','Water'],['23',"Grass' Power",null,'Grass']]){const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(number);p.active.energy={Colorless:2};p.active.specialEnergy=[ref('ecard2-144','rainbow-1')];p.active.damage=60;o.active.conditions={};const att=bw.cardById('bw2-'+number).attacks.find(x=>x.name===attackName);run(s,att.effect,{isAttack:true});if(effectStatus)assert.ok(o.active.conditions[effectStatus],`bw2-${number} should accept Rainbow for ${type}`);else assert.equal(p.active.damage,40);}});
test('Dark Pulse counts Rainbow-provided Darkness Energy attached to any friendly Pokémon',()=>{const s=scene(),p=s.sides.player;p.active=slot('69');p.active.energy={Darkness:1,Colorless:2};const b=slot('64','bench');b.specialEnergy=[ref('ecard2-144','rainbow')];p.bench=[b];const att=bw.cardById('bw2-69').attacks.find(x=>x.name==='Dark Pulse');const ctx={state:s,side:'player',foeSide:'opponent',attacker:p.active,defender:s.sides.opponent.active,attack:att,cardById:data.cardById,random:()=>0.1,isAttack:true,effectiveEnergy:x=>({...x.energy,Darkness:Number(x.energy?.Darkness||0)+(x.specialEnergy?.length||0)})};const res=fx.resolveAttack(att,ctx);assert.equal(res.damage,40);});
test('Great Ball respects the eight-card hand cap during a deferred choice',()=>{const s=scene(),p=s.sides.player;p.hand=Array.from({length:8},(_,i)=>ref('bw2-91','hand-'+i));p.handLimit=8;p.deck=[ref('bw2-1','gb-poke'),ref('bw2-91','gb-trainer')];const ch=run(s,bw.cardById('bw2-93').effect);assert.equal(ch?.kind,'option');choose(s,ch,{choiceOption:0});assert.equal(p.hand.length,8);assert.equal(p.deck.length,2);assert.equal(p.deck.some(x=>x.uid==='gb-poke'),true);});
test('Superpower and Quick Tail Smash retain their optional choices in damage resolution',()=>{const s=scene(),p=s.sides.player;for(const [id,name,selected,expected] of [['31','Superpower','',60],['31','Superpower','boost',80],['79','Quick Tail Smash','',20],['79','Quick Tail Smash','flip',80]]){p.active=slot(id);const att=bw.cardById('bw2-'+id).attacks.find(x=>x.name===name);const ctx={state:s,side:'player',foeSide:'opponent',attacker:p.active,defender:s.sides.opponent.active,attack:att,cardById:data.cardById,action:{effectSelection:selected},random:()=>0.1,isAttack:true};const result=fx.resolveAttack(att,ctx);assert.equal(result.damage,expected,`${name} ${selected}`);}});

test('Real Recycle Item play exposes spent Energy recovery through legal effectChoice actions',()=>{
 const s=scene(),p=s.sides.player;p.hand=[ref('bw2-96','recycle-hand')];p.energyDiscard={Grass:1};s.rngState=1;
 const action=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='bw2-96');assert.ok(action,'Recycle Item should be playable');core.applyAction(s,'player',action);
 assert.equal(s.phase,'effectChoice','Recycle must ask which discarded Basic Energy to return');
 const actions=core.legalActions(s,s.choiceSide);assert.equal(actions.some(a=>String(a.choiceLabel||'').includes('physical')),false,'Recycle must not be able to return itself while resolving');const pick=actions.find(a=>a.type==='effectChoice'&&String(a.choiceLabel||'').includes('Grass Energy'));assert.ok(pick,'Recycle missing first Energy option');core.applyAction(s,s.choiceSide,pick);
 assert.equal(s.phase,'battle');assert.equal(p.energyDiscard.Grass,0);assert.equal(data.cardById(p.deck[0]?.cardId)?.subtype,'Grass');assert.equal(p.discard.some(x=>x.cardId==='bw2-96'),true);
});

test('Advanced CPU can resolve Recycle with both physical and ledger discard options',()=>{
 const ai=require(path.join(asset,'tcgp-battle-ai.js')),s=scene(),p=s.sides.player;
 p.energyDiscard={Darkness:2};p.discard=[ref('bw2-91','cher-discard')];
 s.rngState=1;
 fx.applyEffect(bw.cardById('bw2-96').effect,core.effectContext(s,'player',{},p.active));
 let n=0;while(s.phase==='effectChoice'&&n++<5){const chosen=ai.chooseAction(s,'player','Advanced',n),a=chosen?.action||chosen;assert.equal(a?.type,'effectChoice');core.applyAction(s,'player',a);}
 assert.equal(s.phase,'battle','CPU should not become stuck in nested Recycle choices');assert.equal(p.deck.length,1);
});

test('Recycle consumes only one of two discarded units and makes unique card identities on repeated uses',()=>{
 const s=scene(),p=s.sides.player;p.energyDiscard={Grass:2};
 for(let i=0;i<2;i++){let choice=run(s,bw.cardById('bw2-96').effect);assert.equal(choice?.kind,'option');choose(s,choice,{choiceOption:0});}
 assert.equal(p.energyDiscard.Grass,0);assert.equal(p.deck.length,2);assert.notEqual(p.deck[0].uid,p.deck[1].uid);
});
