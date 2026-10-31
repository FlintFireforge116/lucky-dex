const t=require('node:test'),a=require('node:assert/strict'),D=require('../app/src/main/assets/tcgp-battle-data.js'),E=require('../app/src/main/assets/tcgp-battle-effects.js'),K=require('../app/src/main/assets/tcgp-battle-decks.js'),W=require('../app/src/main/assets/tcgp-deck-workspace.js'),N=require('../scripts/lib/tcgp-normalize.cjs');
t('C1 all217 prints are released, PB103 released, PromoC and First Partners remain unavailable at Oct30',()=>{
 a.equal(D.PRINTS.filter(p=>p.setId==='C1').length,217);a.ok(D.cardById('P-B-103'));a.equal(D.PRINTS.filter(p=>p.setId==='P-C'||p.setId==='SP1').length,0);
});
t('dual types preserve both types and match type filters, weakness once, and Energy only from actual costs',()=>{
 const c=D.cardById('C1-042');a.ok(c,'Mega Greninja must be imported');a.deepEqual(c.types,['Water','Darkness']);
 a.equal(D.hasType(c,'Darkness'),true);
 const slot={uid:'dual',cardId:c.id,damage:10,energy:{}},ctx={state:{sides:{player:{active:slot,bench:[]},opponent:{active:null,bench:[]}}},side:'player',foeSide:'opponent',attacker:slot,cardById:D.cardById};
 for(const type of ['Water','Darkness'])a.equal(E.choicesForEffect({type:'heal',target:'selfPokemon',amount:10,filter:{subtype:type}},ctx).length,1);
 a.equal(E.choicesForEffect({type:'heal',target:'selfPokemon',amount:10,filter:{subtype:'Psychic'}},ctx).length,0);
 a.equal(E.attackDamage(c,{damage:50},{weakness:'Darkness'}),70);a.equal(E.attackDamage(c,{damage:50},{weakness:'Water'}),70);
 const rows=[{gameplayId:c.id,card:c,quantity:2}];a.equal(W.query(rows,{filters:{types:['Water','Darkness']}}).total,1);
 a.deepEqual(K.analyzeDeck([c.id]).recommendedEnergyTypes,['Water']);
});
t('normalizer accepts actual two types but rejects missing, duplicate and unknown type entries',()=>{
 const raw={id:'C1-900',category:'Pokemon',name:'Fixture',setId:'C1',types:['Water','Darkness'],hp:100,stage:'Basic',retreat:1,weaknesses:[{type:'Lightning',value:'+20'}],attacks:[{name:'Hit',cost:['Water'],damage:'30'}]};
 a.equal(N.normalizeMechanics(raw).battleEnabled,true);a.deepEqual(N.normalizeMechanics(raw).types,['Water','Darkness']);
 for(const types of [[],['Water','Water'],['Water','Mystery']])a.equal(N.normalizeMechanics({...raw,types}).battleEnabled,false);
});
t('catalogue validation rejects invalid second types even when legacy subtype remains valid',()=>{
 const {validateCatalogue}=require('../scripts/lib/tcgp-validate.cjs'),base=require('../app/src/main/assets/tcgp/generated/catalogue.js');
 const broken={...base,cards:base.cards.map(c=>c.id==='C1-042'?{...c,types:['Water','Mystery']}:c)};a.ok(validateCatalogue(broken).some(e=>e.includes('type')));
});
