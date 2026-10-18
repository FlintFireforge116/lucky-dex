const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8'),gradle=read('app/build.gradle'),html=read('app/src/main/assets/index.html'),app=read('app/src/main/assets/app-v0167.js');
assert.match(gradle,/applicationId 'com\.example\.luckydex'/);
assert.ok(Number((gradle.match(/versionCode\s+(\d+)/)||[])[1])>=340);
const current=(gradle.match(/versionName '([^']+)'/)||[])[1];assert.ok(current.localeCompare('0.34.0',undefined,{numeric:true})>=0);
assert.equal(JSON.parse(read('package.json')).version,current);const lock=JSON.parse(read('package-lock.json'));assert.equal(lock.version,current);assert.equal(lock.packages[''].version,current);assert(html.includes('v'+current));assert(app.includes("window.__LUCKYDEX_BUILD='"+current+"'"));
const scripts=['arcade-dash-course-data.js','arcade-dash-course.js','arcade-dash-gen3-manifest.js','arcade-dash-assets.js','arcade-dash-renderer.js','arcade-dash.js'].map(n=>html.indexOf('src="'+n+'"'));assert(scripts.every((n,i)=>n>0&&(!i||n>scripts[i-1])));
console.log('PASS v0.34.0+ identity, matching release markers and offline Dash renderer dependencies');
