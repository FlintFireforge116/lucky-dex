const t=require('node:test'),a=require('node:assert/strict');
const D=require('../app/src/main/assets/tcgp-battle-data.js'),K=require('../app/src/main/assets/tcgp-battle-decks.js'),W=require('../app/src/main/assets/tcgp-deck-workspace.js');
const all=D.CARDS.filter(c=>!c.loaner).map(c=>({gameplayId:c.id,quantity:2,variants:D.PRINTS.filter(p=>p.gameplayId===c.id).map(p=>({id:p.id,quantity:2}))}));
t('preferred owned artwork survives saving/copying and falls back after losing the physical print',()=>{
 const s={};const r=W.saveDraft(s,{name:'Ice',cards:['A1-083'],preferredPrints:{'A1-083':'B1-298'}},all);a.equal(r.deck.preferredPrints?.['A1-083'],'B1-298');
 const copy=W.duplicate(s,r.deck.id);copy.preferredPrints['A1-083']='A1-083';a.equal(r.deck.preferredPrints['A1-083'],'B1-298');
 a.equal(W.selectedPrint(r.deck,'A1-083',[{gameplayId:'A1-083',quantity:1,variants:[{id:'A1-083',quantity:1}]}]),'A1-083');
 a.equal(W.selectedPrint({preferredPrints:{'A1-083':'A1-001'}},'A1-083',all),'A1-083');
});
t('local recipes are complete FULL families with real synergies and legal Energy; missing ownership remains missing',()=>{
 a.ok(W.RECIPES?.length>=16);for(const r of W.RECIPES){a.equal(r.cards.length,20,r.id);a.ok(r.description.length>20,r.id);a.ok(W.readiness(r,all).ok,r.id+': '+JSON.stringify(W.readiness(r,all)));a.equal(K.analyzeDeck(r.cards,r.energyTypes).warnings.filter(w=>['orphan','unpowerable','missing-energy'].includes(w.code)).length,0,r.id);a.ok(r.cards.every(id=>D.cardById(id).support.status==='FULL'),r.id);a.ok(W.recipe(r.cards,[]).missing.length>0);}
 a.ok(W.RECIPES.find(r=>r.id==='darkness-poison').cards.includes('A1-175'));a.ok(W.RECIPES.find(r=>r.id==='metal-acceleration').cards.includes('A1-181'));a.ok(W.RECIPES.find(r=>r.id==='water-counter').cards.includes('A2-147'),'defensive plan must include its advertised Giant Cape');
});
