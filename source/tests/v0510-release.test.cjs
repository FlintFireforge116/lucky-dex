const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function atLeast(version,minimum){const a=String(version).split('.').map(Number),b=String(minimum).split('.').map(Number);for(let i=0;i<3;i++){if((a[i]||0)>(b[i]||0))return true;if((a[i]||0)<(b[i]||0))return false;}return true;}
test('release remains at least v0.51.0 while Android signing/application identity is preserved',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json')),g=read('app/build.gradle');
  assert.ok(atLeast(pkg.version,'0.51.0'),`release regressed to ${pkg.version}`);
  assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
  const versionCode=Number(g.match(/versionCode\s+(\d+)/)?.[1]||0),versionName=g.match(/versionName '([^']+)'/)?.[1];
  assert.ok(versionCode>=5100);assert.equal(versionName,pkg.version);
  assert.match(g,/applicationId 'com\.example\.luckydex'/);assert.match(g,/keyAlias 'luckydex'/);
  assert.match(read('app/src/main/assets/app-v0167.js'),new RegExp(`__LUCKYDEX_BUILD='${pkg.version.replace(/\./g,'\\.')}'`));
  assert.match(read('README.md'),new RegExp(`^# LuckyDex v${pkg.version.replace(/\./g,'\\.')}`));
  assert.match(read('app/src/main/assets/index.html'),new RegExp(`v${pkg.version.replace(/\./g,'\\.')}`));
});
