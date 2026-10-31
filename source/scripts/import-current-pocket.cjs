'use strict';
// Independent factual supplement from primary community card pages, not MIT
// software/data. Keep raw transcriptions, exact alternate-print evidence and
// hashes intact; Pokémon card text/art remain their owners' intellectual property.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'data/tcgp/import'),read=n=>JSON.parse(fs.readFileSync(path.join(dir,n),'utf8')),write=(n,v)=>fs.writeFileSync(path.join(dir,n),JSON.stringify(v,null,2)+'\n');
function adapt(){
 const raw=read('limitless-current-source.json'),joins=read('limitless-current-design-joins.json'),oldEvidence=read('identity-evidence.json').prints;
 if(raw.filter(c=>c.setId==='C1').length!==217)throw Error('Incomplete C1 primary-source capture.');
 const legacy=[...read('tcgdex-pocket-cards.json'),...read('tcgdex-A4b-cards.json'),...read('vociferix-missing-mechanics.json')],known=new Set(legacy.map(c=>c.id)),identity={};
 for(const j of joins){const prior=j.equivalentPrintIds.find(id=>oldEvidence[id]);identity[j.id]=prior?oldEvidence[prior]:j.suggestedDesignKey;}
 const mechanics=raw.filter(c=>!known.has(c.id)&&!oldEvidence[c.id]&&(!identity[c.id]||identity[c.id].startsWith('limitless:'))).map(c=>{
  const out=JSON.parse(JSON.stringify(c));
  // Printed dash means no weakness; a blank damage field is an effect-only
  // attack, not a malformed number. Unknown effect text still disables it.
  out.weaknesses=(out.weaknesses||[]).filter(w=>w.type!=='none');
  for(const attack of out.attacks||[])if(attack.damage==='')attack.damage=0;
  if(['C1-015','C1-135'].includes(c.id)){
   if(out.abilities[0].effect!=='Once during your turn, you may use this Ability. Put a rental card into your hand.')throw Error('Ribombee erratum precondition changed.');
   out.abilities[0].effect='Once during your turn, you may use this Ability. Put a Sweet Honey rental card into your hand.';
  }
  return out;
 });
 const prints=raw.filter(c=>!known.has(c.id)||c.setId==='C1'||c.setId==='P-C').map(c=>({id:c.id,name:c.name,type:c.category==='Pokemon'?c.types[0]:'Trainer',health:c.hp||null,rarity:c.rarity,image:c.image}));
 write('current-pocket-mechanics.json',mechanics);write('current-pocket-prints.json',prints);write('current-pocket-identity.json',identity);
 write('current-pocket-provenance.json',{retrieved:'2026-10-30',source:'https://pocket.limitlesstcg.com/cards/C1?display=full&show=all',sourceRole:'Primary community card transcription; factual independent extraction, not licensed MIT code.',copyright:'Pokémon card names, rules and artwork belong to The Pokémon Company, Nintendo, Creatures and GAME FREAK. No upstream AGPL implementation/data incorporated.',sourceHashes:[...new Set(raw.map(c=>c.sourceSha256))],rawPrints:raw.length,c1Prints:217,errata:[{ids:['C1-015','C1-135'],field:'abilities[0].effect',correction:'Sweet Honey rental card',evidence:'https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/pocket/C1/C1_015_EN_SM.webp'}],releaseSources:['https://www.pokemon.com/us/news/pokemon-tcg-pocket-dual-fusion-expansion-coming-soon','https://www.pokemon.com/us/news/complete-special-pika-pika-pikachu-missions-in-pokemon-tcg-pocket'],excludedPromoC:raw.filter(c=>c.setId==='P-C').map(c=>({id:c.id,reason:Number(c.id.slice(-3))===1?'November premium shop, no earlier than 2026-11-01':Number(c.id.slice(-3))<=9?'Promo C Vol1, November 17 PDT onward':Number(c.id.slice(-3))<=12?'Themed promo missions, November 25 PDT onward':'December premium shop'}))});
 return {prints:prints.length,mechanics:mechanics.length};
}
if(require.main===module)console.log(JSON.stringify(adapt()));module.exports={adapt};
