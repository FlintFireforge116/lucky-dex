'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const data=require(path.join(assets,'tcgp-battle-data.js'));
const decks=require(path.join(assets,'tcgp-battle-decks.js'));
const rows=data.CARDS.filter(card=>card.battleEnabled&&!card.loaner).map(card=>({gameplayId:card.id,quantity:2,battleEnabled:true,variants:[]}));
const pokemonNames=result=>result.cards.map(id=>data.cardById(id)).filter(c=>c?.kind==='pokemon').map(c=>c.name);
const trainerNames=result=>result.cards.map(id=>data.cardById(id)).filter(c=>c?.kind==='trainer').map(c=>c.name);

test('random Lightning does not bolt the same Pikachu ex partner onto most unrelated archetypes',()=>{
  let pikachuPartnerBuilds=0,eligible=0;
  const history=[];
  for(let seed=1;seed<=24;seed++){
    const result=decks.buildQuickDeck(rows,{type:'Lightning',style:'random',randomSeed:seed,excludeArchetypes:history});
    assert.equal(result.ok,true);
    history.push(result.archetypeKey);
    if(result.archetypeKey==='pikachu ex'||result.archetypeKey==='pikachu')continue;
    eligible++;
    if(result.cards.includes('A2b-022'))pikachuPartnerBuilds++;
  }
  assert.ok(pikachuPartnerBuilds<=Math.floor(eligible/2),`Pikachu ex A2b-022 appeared as partner in ${pikachuPartnerBuilds}/${eligible} unrelated random Lightning builds`);
});

test('Ultra Beast focus decks recognise Ultra Beast-specific Trainer filters',()=>{
  const result=decks.buildQuickDeck(rows,{cardId:'A3a-006'}); // Buzzwole ex
  assert.equal(result.ok,true);
  const trainers=new Set(trainerNames(result));
  assert.ok(['Beast Wall','Beastite','Lusamine'].some(name=>trainers.has(name)),`expected Ultra Beast support, got ${[...trainers].join(', ')}`);
});

test('Dialga ex focus recognises an energy-scaling Gholdengo payoff',()=>{
  const result=decks.buildQuickDeck(rows,{cardId:'A2-119'});
  assert.equal(result.ok,true);
  const names=pokemonNames(result);
  assert.ok(names.includes('Gholdengo')||names.includes('Gholdengo ex'),`expected a Gholdengo partner, got ${names.join(', ')}`);
});

test('Puppy Pile focus builds around the named-attack package and its Trainer',()=>{
  const result=decks.buildQuickDeck(rows,{cardId:'P-B-077'}); // Growlithe with Puppy Pile
  assert.equal(result.ok,true);
  const pokemon=pokemonNames(result);
  const puppyCount=result.cards.map(id=>data.cardById(id)).filter(c=>c?.kind==='pokemon'&&(c.attacks||[]).some(a=>a.name==='Puppy Pile')).length;
  assert.ok(puppyCount>=4,`expected several Puppy Pile Pokémon, got ${pokemon.join(', ')}`);
  assert.ok(trainerNames(result).includes('Puppy-Loving Girl'),'expected Puppy-Loving Girl in a Puppy Pile deck');
});

test('competitive type build evaluates more than one family per energy/stage shape',()=>{
  const result=decks.buildQuickDeck(rows,{type:'Lightning',style:'competitive'});
  assert.equal(result.ok,true);
  assert.ok(result.alternativesAvailable>=8,`expected broader competitive search, got ${result.alternativesAvailable} alternatives`);
});

test('secondary evolution packages stay balanced and do not stack multiple endpoints onto one base',()=>{
  const result=decks.buildQuickDeck(rows,{cardId:'A2-119'}); // Dialga ex -> Gholdengo payoff
  assert.equal(result.ok,true);
  const selected=result.cards.map(id=>data.cardById(id));
  const gimmighoulCount=selected.filter(c=>c?.name==='Gimmighoul').length;
  const gholdengoCards=selected.filter(c=>c?.evolvesFrom==='Gimmighoul');
  assert.ok(gimmighoulCount>=1,'expected the Gimmighoul pre-evolution');
  assert.equal(new Set(gholdengoCards.map(c=>c.id)).size,1,`expected one Gholdengo endpoint, got ${gholdengoCards.map(c=>c.id).join(', ')}`);
  assert.ok(gholdengoCards.length<=gimmighoulCount,`expected balanced Gimmighoul/Gholdengo counts, got ${gimmighoulCount}/${gholdengoCards.length}`);
});
