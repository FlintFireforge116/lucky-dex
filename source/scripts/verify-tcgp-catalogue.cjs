'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..'),{validateCatalogue}=require('./lib/tcgp-validate.cjs');
function verify(root=ROOT){
 const file=path.join(root,'app/src/main/assets/tcgp/generated/catalogue.js');delete require.cache[require.resolve(file)];const data=require(file),errors=validateCatalogue(data),coverage=JSON.parse(fs.readFileSync(path.join(root,'generated/tcgp-card-coverage.json'),'utf8'));
 for(const [rel,hash]of Object.entries(data.inputHashes||{})){const p=path.join(root,rel);if(!fs.existsSync(p)||crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')!==hash)errors.push('Generated input changed; regenerate: '+rel);}
 if(!data.inputHashes||Object.keys(data.inputHashes).length<10)errors.push('Missing generated-input provenance');
 const counts={FULL:0,PARTIAL:0,UNSUPPORTED:0};for(const c of data.cards)counts[c.support.status]++;
 if(JSON.stringify(counts)!==JSON.stringify(coverage.statusCounts)||data.prints.length!==coverage.releasedPrints||data.cards.length!==coverage.gameplayIdentities)errors.push('Coverage report disagrees with runtime data');
 const notice=fs.readFileSync(path.join(root,'app/src/main/assets/tcgp/generated/THIRD_PARTY_NOTICES.txt'),'utf8');for(const name of ['PocketDecks-LICENSE-MIT.txt','flibustier-LICENSE-MIT.txt','TCGdex-LICENSE-MIT.txt'])if(!notice.includes(fs.readFileSync(path.join(root,'data/tcgp/import',name),'utf8')))errors.push('Packaged MIT notice missing: '+name);
 return {errors,cutoff:data.cutoff,prints:data.prints.length,identities:data.cards.length,...counts};
}
if(require.main===module){const result=verify();console.log(JSON.stringify(result,null,2));if(result.errors.length)process.exitCode=1;}module.exports={verify};
