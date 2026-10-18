'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),baseline=require('../scripts/data/preserved-v0431-assets.json');
assert.equal(baseline.baselineVersion,'0.43.1');
for(const [file,sha]of Object.entries(baseline.files)){const p=path.join(root,file);assert(fs.existsSync(p),'Removed v0.43.1 file: '+file);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),sha,'Unrelated v0.43.1 production change: '+file);}
console.log('PASS '+Object.keys(baseline.files).length+' v0.43.1 production files remain byte-identical outside approved cosmetics/version surfaces');
