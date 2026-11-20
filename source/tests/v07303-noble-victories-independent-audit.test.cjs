'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const root=require('node:path').resolve(__dirname,'..');
const base=root+'/app/src/main/assets/';
const data=require(base+'tcg-classic-battle-data.js');
const cpu=require(base+'tcg-classic-opponents.js');
const builder=require(base+'tcg-classic-deck-builder.js');
const fx=require(base+'tcgp-battle-effects.js');
const core=require(base+'tcgp-battle-core.js');
const bw=require(base+'tcg-classic-noble-victories.js');
const owned=data.CARDS.filter(c=>c.setId==='bw3'&&c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
const count=(cards,id)=>cards.filter(x=>x===id).length;
const cardsByID=ids=>ids.map(id=>data.cardById(id));
function normalScene(){
 const d=cpu.generate({sets:['bw3'],type:'Fire',seed:11});assert.ok(d.ok);
 const s=core.createBattle({format:'classic',seed:11,firstSide:'player',playerDeck:d.cards,opponentDeck:d.cards,playerEnergyTypes:['Fire','Water','Lightning','Fighting'],opponentEnergyTypes:['Fire','Water','Lightning','Fighting']});
 s.phase='battle';s.activeSide='player';s.turnNumber=9;s.log=[];
 for(const [key,b] of Object.entries(s.sides)){b.turnCount=4;b.active=core.makePokemonSlot(key==='player'?'bw3-8':'bw3-11',4,key+'active');b.active.energy={Colorless:3};b.bench=[];b.hand=[];b.deck=[];b.discard=[];b.energyDiscard={};b.energySupply=[];b.lostZone=[];}
 return s;
}
function apply(s,e,action={},resolvingChoice=false){let choice=null;const p=s.sides.player,o=s.sides.opponent;fx.applyEffect(e,{state:s,side:'player',foeSide:'opponent',attacker:p.active,defender:o.active,cardById:data.cardById,action,resolvingChoice,random:()=>.1,isAttack:true,requestChoice:x=>choice=x,shuffle:(_state,a)=>a.reverse(),maxHp:(_side,m)=>data.cardById(m.cardId).hp});return choice;}
function assertNoOrphan(cards,label){
 assert.ok(!(count(cards,'bw3-90')&&!count(cards,'bw3-25')),label+' Cover Fossil without Tirtouga');
 assert.ok(!(count(cards,'bw3-93')&&!count(cards,'bw3-66')),label+' Plume Fossil without Archen');
 assert.ok(!(count(cards,'bw3-25')&&!count(cards,'bw3-90')),label+' Tirtouga without Cover Fossil');
 assert.ok(!(count(cards,'bw3-66')&&!count(cards,'bw3-93')),label+' Archen without Plume Fossil');
}
test('The actual printed Restored entry Items are deck-family prerequisites, never generic Trainer filler',()=>{
 const cases=[['bw3-25','bw3-25','bw3-90'],['bw3-26','bw3-25','bw3-90'],['bw3-90','bw3-25','bw3-90'],['bw3-66','bw3-66','bw3-93'],['bw3-67','bw3-66','bw3-93'],['bw3-93','bw3-66','bw3-93']];
 for(const [focus,root,fossil] of cases){const r=builder.buildDeck(owned,{sets:['bw3'],focusCardId:focus,style:'competitive'});assert.ok(r.ok,focus+': '+r.errors?.join('; '));assert.equal(r.cards.length,30);assert.ok(count(r.cards,root)>=2);assert.ok(count(r.cards,fossil)>=2);assertNoOrphan(r.cards,focus);assert.ok(data.validateDeck(r.cards).ok);}
});
test('The Noble Victories-only CPU generator never inserts orphan Fossils or unpayable V-create in 108 sampled decks',()=>{
 let fossilCore=0;
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless'])for(let seed=1;seed<=12;seed++){
  const r=cpu.generate({sets:['bw3'],type,seed});assert.ok(r.ok,type+'/'+seed+' '+r.error);
  assert.equal(r.cards.length,30);assert.ok(data.validateDeck(r.cards).ok);
  assertNoOrphan(r.cards,type+'/'+seed);
  assert.ok(!r.cards.includes('bw3-15'),'V-create requires five Benched Pokemon, but normal Classic cap is three');
  if(count(r.cards,'bw3-90')||count(r.cards,'bw3-93'))fossilCore++;
 }
 assert.ok(fossilCore>0,'fossil families should still be selected sometimes');
});
test('A manual V-create focus without five-Bench support fails visibly rather than making a dead CPU deck',()=>{
 const r=builder.buildDeck(owned,{sets:['bw3'],focusCardId:'bw3-15'});
 assert.ok(!r.ok);assert.match(r.errors.join(' '),/five Benched Pokemon/);
 const state=normalScene();assert.equal(state.sides.player.benchLimit,3);
 assert.equal(bw.cardById('bw3-15').attacks[0].name,'V-create');
});
test('Mysterious Evolution is genuinely optional and searches the actual evolution card',()=>{
 const s=normalScene(),p=s.sides.player;
 p.active=core.makePokemonSlot('bw3-8',4,'karr');
 p.bench=[core.makePokemonSlot('bw3-11',4,'shelm')];p.bench[0].benchSlot=0;
 p.deck=[{uid:'irrelevant',cardId:'bw3-1'},{uid:'evolution',cardId:'bw3-80'}];
 // Escavalier evolves from Karrablast; the printed search may be declined.
 const effect=bw.cardById('bw3-8').attacks[0].effect;
 const choice=apply(s,effect);assert.ok(choice);assert.equal(choice.kind,'deckCard');assert.equal(choice.optional,true);
 assert.deepEqual(choice.filter,{kind:'pokemon',evolvesFrom:'Karrablast'});
 const after=apply(s,choice.effect,{choiceDeckIndex:1},true);
 assert.equal(after,null);assert.equal(p.active.cardId,'bw3-80');assert.ok(!p.deck.some(x=>x.uid==='evolution'));
});
test('The original Noble Victories card registry remains fully playable',()=>{
 assert.deepEqual(bw.coverage(),{total:102,battleEnabled:102,gated:[]});
 const fossilA=bw.cardById('bw3-90'),fossilB=bw.cardById('bw3-93');
 assert.equal(fossilA.effect.rule,'bw3:coverFossil');assert.equal(fossilB.effect.rule,'bw3:plumeFossil');
 assert.equal(bw.cardById('bw3-26').evolvesFrom,'Tirtouga');
 assert.equal(bw.cardById('bw3-67').evolvesFrom,'Archen');
});
