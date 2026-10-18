const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const runtime=fs.readFileSync(path.join(root,'app/src/main/assets/arcade-fossil-museum.js'),'utf8');
const css=fs.readFileSync(path.join(root,'app/src/main/assets/arcade.css'),'utf8');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));

// Covered rock must be opaque until the final chipped layer.
for(const depth of [4,3,2]){
  const m=css.match(new RegExp(`\\.fossil-cell-v0250\\[data-depth="${depth}"\\]\\{([^}]*)\\}`));
  assert.ok(m,`missing depth ${depth} rock style`);
  assert.match(m[1],/opacity\s*:\s*1(?:[;}]|$)/,`depth ${depth} must be fully opaque`);
}
const depth1=css.match(/\.fossil-cell-v0250\[data-depth="1"\]\{([^}]*)\}/);
assert.ok(depth1,'missing final chipped-layer style');
const opacity1=Number((depth1[1].match(/opacity\s*:\s*([0-9.]+)/)||[])[1]);
assert.ok(opacity1>0&&opacity1<=0.6,'depth 1 may reveal the find, but should still retain visible chipped rock');

// End Dig must be an in-app confirmation, never a browser confirm dialog.
for(const token of ['id="fossilEndDig"','id="fossilEndConfirm"','END DIG','KEEP DIGGING','END & COLLECT',"finishDig('manual')"]){
  assert.ok(runtime.includes(token)||html.includes(token),`missing manual End Dig contract token: ${token}`);
}
assert.ok(!runtime.includes('window.confirm(')&&!runtime.includes('confirm('),'End Dig must not use a browser confirmation dialog');
assert.match(runtime,/reason==='manual'/,'manual finish must have its own result state');

// Museum presentation may advance beyond v0.25.1, but must retain a dedicated enlarged room composition.
assert.ok(html.includes('oreburgh-museum-dppt-landscape-v0252.png')||html.includes('oreburgh-museum-dppt-empty-v0251.png'),'museum must use corrected Oreburgh room art');
assert.ok(html.includes('museum-room-frame-v0253')||html.includes('museum-room-v0252')||html.includes('museum-room-v0251'),'museum stage must retain a dedicated enlarged/fullscreen presentation');
assert.ok(fs.existsSync(path.join(root,'app/src/main/assets/arcade/fossil-museum-v0252/oreburgh-museum-dppt-landscape-v0252.png'))||fs.existsSync(path.join(root,'app/src/main/assets/arcade/fossil-museum-v0250/oreburgh-museum-dppt-empty-v0251.png')),'corrected museum room asset missing');

const versionCode=Number((gradle.match(/versionCode\s+(\d+)/)||[])[1]);
assert.ok(versionCode>=251,'release must not regress below v0.25.1');
const versionName=(gradle.match(/versionName\s+'([^']+)'/)||[])[1];
assert.ok(versionName&&versionName.localeCompare('0.25.1',undefined,{numeric:true})>=0,'release must not regress below v0.25.1');
assert.ok(pkg.version.localeCompare('0.25.1',undefined,{numeric:true})>=0,'package version must not regress below v0.25.1');
console.log('PASS v0.25.1 Fossil Dig + Museum polish contract');
