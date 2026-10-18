const assert=require('assert'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gradle=read('app/build.gradle'),html=read('app/src/main/assets/index.html'),app=read('app/src/main/assets/app-v0167.js');
assert.match(gradle,/applicationId 'com\.example\.luckydex'/);assert.ok(Number((gradle.match(/versionCode\s+(\d+)/)||[])[1])>=310);const current=(gradle.match(/versionName '([^']+)'/)||[])[1];assert.ok(current.localeCompare('0.31.0',undefined,{numeric:true})>=0);assert.match(gradle,/luckydex-dev\.keystore/);
assert.equal(JSON.parse(read('package.json')).version,current);const lock=JSON.parse(read('package-lock.json'));assert.equal(lock.version,current);assert.equal(lock.packages[''].version,current);assert(html.includes('v'+current));assert.ok(app.includes("window.__LUCKYDEX_BUILD='"+current+"'"));
const scripts=['arcade-dash-config.js','arcade-dash-league.js','arcade-dash-course.js','arcade-dash-assets.js','arcade-dash-renderer.js','arcade-dash.js'].map(x=>html.indexOf('src="'+x+'"'));assert(scripts.every((v,i)=>v>0&&(!i||v>scripts[i-1])));
assert(!html.includes('Faster Pokémon can still enter easier races.'));assert(fs.existsSync(path.join(root,'docs/DASH_ASSET_SOURCES.md')));
console.log('PASS v0.31.0/310 identity, signing config, offline renderer order and restriction copy');
