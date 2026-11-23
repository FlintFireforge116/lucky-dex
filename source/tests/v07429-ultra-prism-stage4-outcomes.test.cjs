'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const fixture=JSON.parse(execFileSync('python3',['scripts/sm5_stage4_fixture.py'],{cwd:root,encoding:'utf8'}));
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const ref=(cardId,uid)=>({cardId,uid});
const slot=(cardId,uid,energy={})=>({uid,cardId,stack:[cardId],damage:0,energy:{...energy},specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const plain=(id,name,options={})=>({id,name,kind:'pokemon',stage:'Basic',types:['Colorless'],subtype:'Colorless',hp:500,retreat:1,battleEnabled:true,deckEligible:true,prizeCards:1,attacks:[{name:'Tackle',cost:['C'],damage:20,effect:{type:'noop'}}],abilities:[],...options});
const energy=(id,name,prism=false)=>({id,name,kind:'energy',specialEnergy:true,basicEnergy:false,energyType:'Colorless',subtype:'Colorless',battleEnabled:true,deckEligible:true,prismStar:prism,effect:fixture.energies[name]});
const hostCards=[energy('sm5-137','Unit Energy GrassFireWater'),energy('sm5-170','Unit Energy GrassFireWater'),energy('sm5-138','Unit Energy LightningPsychicMetal'),energy('sm5-171','Unit Energy LightningPsychicMetal'),energy('sm5-136','Super Boost Energy ◇',true),plain('sm5-test-attacker','Attacker'),plain('sm5-test-defender','Defender'),plain('sm5-test-bench','Other')];
const cards=new Map(hostCards.map(c=>[c.id,c]));
function setup(){const orig=data.cardById;data.cardById=id=>cards.get(id)||orig(id);let state;try{state=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:78411,firstSide:'player',playerEnergyTypes:['Grass','Lightning','Metal'],opponentEnergyTypes:['Grass','Lightning','Metal']});}catch(e){data.cardById=orig;throw e;}state.phase='battle';state.activeSide='player';state.turnNumber=5;
for(const who of ['player','opponent']){const s=state.sides[who];s.turnCount=3;s.energyUsed=true;s.handEnergyUsed=true;s.hand=[];s.deck=Array.from({length:14},(_,i)=>ref('sm4-1',`${who}-deck-${i}`));s.discard=[];s.lostZone=[];s.energyDiscard={};s.prizes=Array.from({length:5},(_,i)=>ref('sm4-1',`${who}-prize-${i}`));}
state.sides.player.active=slot('sm5-test-attacker','pa');state.sides.player.bench=[slot('sm5-test-bench','pb0')];state.sides.opponent.active=slot('sm5-test-defender','oa');state.sides.opponent.bench=[slot('sm5-test-bench','ob0')];return {state,restore(){data.cardById=orig;}};}
function attach(s,which,id,uid){const refCard=ref(id,uid);s.sides[which].active.specialEnergy.push(refCard);return refCard;}
function can(s,side,cost){return fx.canPayCost(core.effectiveEnergy(s,side,s.sides[side].active),cost);}
function abilityCard(id,name,ability,options={}){return plain(id,name,{abilities:[{name:ability,text:'',printedPowerType:'ability',disabledByStatus:false,...fixture.abilities[ability]}],...options});}

test('Stage 4 official-lock energy descriptors validate and do not claim three simultaneous Energy units',()=>{
 assert.equal(Object.keys(fixture.energies).length,3);
 for(const [name,e] of Object.entries(fixture.energies)){assert.deepEqual(fx.validateEffect(e),[],name);assert.deepEqual(e.provides,{Colorless:1});}
 assert.equal(Object.keys(fixture.abilities).length,4);
 for(const [name,a] of Object.entries(fixture.abilities))assert.deepEqual(fx.validateEffect(a.effect),[],name);
});

test('Unit GrassFireWater is ONE physical unit: satisfies G or W, never GW or GG',()=>{const h=setup();try{attach(h.state,'player','sm5-137','unit1');assert.equal(can(h.state,'player','G'),true);assert.equal(can(h.state,'player','W'),true);assert.equal(can(h.state,'player','R'),true);assert.equal(can(h.state,'player','C'),true);for(const cost of ['GW','GG','GR','GL','CC'])assert.equal(can(h.state,'player',cost),false,cost);}finally{h.restore();}});

test('Unit LightningPsychicMetal variants are one unit each and cannot provide Grass',()=>{for(const id of ['sm5-138','sm5-171']){const h=setup();try{attach(h.state,'player',id,id);for(const c of ['L','P','M','C'])assert.equal(can(h.state,'player',c),true,c);for(const c of ['G','LP','MM','CC'])assert.equal(can(h.state,'player',c),false,c);}finally{h.restore();}}});

test('Two different Unit Energy cards cannot illegally cover two same-type requirements',()=>{const h=setup();try{attach(h.state,'player','sm5-137','GFW');attach(h.state,'player','sm5-138','LPM');assert.equal(can(h.state,'player','GL'),true);assert.equal(can(h.state,'player','WP'),true);assert.equal(can(h.state,'player','GG'),false);assert.equal(can(h.state,'player','LL'),false);assert.equal(can(h.state,'player','CC'),true);assert.equal(can(h.state,'player','GLC'),false);}finally{h.restore();}});

test('Two matching Unit Energy cards pay two printed typed costs but do not create a third',()=>{const h=setup();try{attach(h.state,'player','sm5-137','unit1');attach(h.state,'player','sm5-170','unit2');for(const c of ['GG','GW','WR'])assert.equal(can(h.state,'player',c),true,c);for(const c of ['GGG','GWW','GGW'])assert.equal(can(h.state,'player',c),false,c);}finally{h.restore();}});

test('Unit Energy cost checks work on CPU side and with ordinary Basic Energy',()=>{const h=setup();try{attach(h.state,'opponent','sm5-137','u1');h.state.sides.opponent.active.energy={Grass:1};for(const c of ['GG','GR','GW','GC'])assert.equal(can(h.state,'opponent',c),true,c);assert.equal(can(h.state,'opponent','WW'),false);}finally{h.restore();}});

test('Super Boost Prism: Colorless off Stage 2, one rainbow unit on Stage 2',()=>{const h=setup();try{const s=h.state,p=s.sides.player.active;attach(s,'player','sm5-136','boost');assert.equal(can(s,'player','C'),true);assert.equal(can(s,'player','G'),false);p.cardId='sm5-test-stage2';cards.set(p.cardId,plain(p.cardId,'Stage Two',{stage:'Stage 2'}));assert.equal(can(s,'player','G'),true);assert.equal(can(s,'player','M'),true);assert.equal(can(s,'player','GG'),false);assert.equal(can(s,'player','GL'),false);}finally{cards.delete('sm5-test-stage2');h.restore();}});

test('Super Boost Prism: four units only when three Stage 2 Pokemon are in play',()=>{const h=setup();try{const s=h.state,p=s.sides.player.active,card=plain('sm5-test-stage2','Stage Two',{stage:'Stage 2'});cards.set(card.id,card);p.cardId=card.id;attach(s,'player','sm5-136','boost');s.sides.player.bench=[slot(card.id,'b1'),slot(card.id,'b2')];const e=core.effectiveEnergy(s,'player',p);assert.equal(e.Miracle,4);for(const c of ['GGGG','GRWM','CCCC','GMMG'])assert.equal(can(s,'player',c),true,c);assert.equal(can(s,'player','GGGGC'),false);s.sides.player.bench.pop();assert.equal(can(s,'player','GG'),false);}finally{cards.delete('sm5-test-stage2');h.restore();}});

test('Crystal Beach reduces boosted Super Boost to one Colorless as a physical Special Energy',()=>{const h=setup();try{const s=h.state,p=s.sides.player.active,card=plain('sm5-test-stage2','Stage Two',{stage:'Stage 2'});cards.set(card.id,card);p.cardId=card.id;s.sides.player.bench=[slot(card.id,'b1'),slot(card.id,'b2')];attach(s,'player','sm5-136','boost');s.stadium=ref('ex14-75','crystalbeach');const e=core.effectiveEnergy(s,'player',p);assert.equal(e.Colorless,1);assert.equal(e.Miracle||0,0);assert.equal(can(s,'player','G'),false);assert.equal(can(s,'player','CC'),false);}finally{cards.delete('sm5-test-stage2');h.restore();}});

test('Prism Star deck constraint applies to alternate prints by NAME across 30 slots',()=>{
 const vm=require('node:vm'),fs=require('node:fs');
 const src=fs.readFileSync(path.join(root,'app/src/main/assets/tcg-classic-battle-data.js'),'utf8');
 const code=src.match(/function validateDeck\(ids,options\)\{[\s\S]*?(?=\nfunction coverage\(\))/)?.[0];
 assert.ok(code,'Extract the production deck validator, not an imitated one');
 const validate=vm.runInNewContext('('+code+')',{cardById:id=>cards.get(id)||data.cardById(id),classicCardName:n=>String(n||'').trim()});
 const first=energy('sm5-test-prism1','Test Star ◇',true),alt=energy('sm5-test-prism2','Test Star ◇',true);
 cards.set(first.id,first);cards.set(alt.id,alt);
 try{const ids=data.CLASSIC30_LOANER_DECK.slice();ids[0]=first.id;ids[1]=alt.id;
  assert.ok(validate(ids).errors.some(e=>/Prism Star/.test(e)));
  ids[1]=data.CLASSIC30_LOANER_DECK[1];assert.equal(validate(ids).errors.some(e=>/Prism Star/.test(e)),false);
 }finally{cards.delete(first.id);cards.delete(alt.id);}
});

test('A discarded Prism Star Special Energy goes to Lost Zone preserving UID, for CPU and player',()=>{for(const defenderSide of ['player','opponent']){const h=setup();try{const s=h.state,atkSide=defenderSide==='player'?'opponent':'player';const active=s.sides[atkSide].active;const battle=cards.get(active.cardId);const old=battle.attacks;battle.attacks=[{name:'Remove Energy',cost:['C'],damage:0,effect:{type:'discardEnergyCard',target:'opponentActive',amount:1}}];active.energy={Colorless:1};s.sides[defenderSide].active.specialEnergy=[ref('sm5-136',`${defenderSide}-boost`)];s.activeSide=atkSide;try{const act=core.legalActions(s,atkSide).find(a=>a.type==='attack');assert.ok(act);core.applyAction(s,atkSide,act);assert.equal(s.sides[defenderSide].lostZone.filter(x=>x.cardId==='sm5-136').length,1);assert.equal(s.sides[defenderSide].lostZone.find(x=>x.cardId==='sm5-136').uid,`${defenderSide}-boost`);assert.equal(s.sides[defenderSide].discard.some(x=>x.cardId==='sm5-136'),false);}finally{battle.attacks=old;}}finally{h.restore();}}});

test('Intimidating Fang prevents 30 opponent attack damage only while active',()=>{const h=setup();try{const s=h.state,b=abilityCard('sm5-test-luxray','Luxray','Intimidating Fang');cards.set(b.id,b);s.sides.opponent.active.cardId=b.id;assert.equal(fx.modifierAmount(s,'player',s.sides.player.active,'attackDamage',data.cardById),-30);const tmp=s.sides.opponent.active;s.sides.opponent.active=s.sides.opponent.bench[0];s.sides.opponent.bench[0]=tmp;assert.equal(fx.modifierAmount(s,'player',s.sides.player.active,'attackDamage',data.cardById),0);}finally{cards.delete('sm5-test-luxray');h.restore();}});

test('Power Huddle applies +30 only to Passimian vs evolved Pokémon while source is Benched',()=>{const h=setup();try{const s=h.state,p=abilityCard('sm5-test-passimian','Passimian','Power Huddle');cards.set(p.id,p);s.sides.player.active.cardId=p.id;s.sides.player.bench[0].cardId=p.id;s.sides.opponent.active.cardId='sm5-test-defender';assert.equal(fx.modifierAmount(s,'player',s.sides.player.active,'attackDamage',data.cardById),0);cards.get('sm5-test-defender').stage='Stage 1';assert.equal(fx.modifierAmount(s,'player',s.sides.player.active,'attackDamage',data.cardById),30);}finally{cards.get('sm5-test-defender').stage='Basic';cards.delete('sm5-test-passimian');h.restore();}});

test('Flashing Head and Earthen Shield prevent damage only against Special Energy attackers',()=>{for(const abi of ['Flashing Head','Earthen Shield']){const h=setup();try{const s=h.state,p=abilityCard('sm5-test-shield',abi,abi,{types:['Metal'],subtype:'Metal'});cards.set(p.id,p);s.sides.opponent.active.cardId=p.id;const sh=fx.modifierAmount(s,'opponent',s.sides.opponent.active,'damageReduction',data.cardById);assert.equal(sh,0);attach(s,'player','sm5-137','energy1');assert.equal(fx.modifierAmount(s,'opponent',s.sides.opponent.active,'damageReduction',data.cardById),999);s.sides.player.active.specialEnergy=[];assert.equal(fx.modifierAmount(s,'opponent',s.sides.opponent.active,'damageReduction',data.cardById),0);}finally{cards.delete('sm5-test-shield');h.restore();}}});
