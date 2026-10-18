'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

function pngPixel(rel,x,y){
  const buf=fs.readFileSync(path.join(root,rel));
  let off=8,width=0,height=0,bit=0,color=0,interlace=0,idat=[];
  while(off<buf.length){
    const len=buf.readUInt32BE(off),type=buf.toString('ascii',off+4,off+8),data=buf.subarray(off+8,off+8+len);off+=12+len;
    if(type==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);bit=data[8];color=data[9];interlace=data[12];}
    else if(type==='IDAT')idat.push(data);else if(type==='IEND')break;
  }
  assert.equal(bit,8);assert.equal(color,6);assert.equal(interlace,0);assert.ok(x>=0&&x<width&&y>=0&&y<height);
  const raw=zlib.inflateSync(Buffer.concat(idat)),bpp=4,stride=width*bpp,rows=[];let pos=0,prev=Buffer.alloc(stride);
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
  for(let row=0;row<height;row++){
    const filter=raw[pos++],src=raw.subarray(pos,pos+stride),out=Buffer.alloc(stride);pos+=stride;
    for(let i=0;i<stride;i++){
      const left=i>=bpp?out[i-bpp]:0,up=prev[i]||0,ul=i>=bpp?(prev[i-bpp]||0):0,v=src[i];
      out[i]=(filter===0?v:filter===1?v+left:filter===2?v+up:filter===3?v+Math.floor((left+up)/2):v+paeth(left,up,ul))&255;
    }
    rows.push(out);prev=out;
  }
  return [...rows[y].subarray(x*bpp,x*bpp+4)];
}

test('Beach stage keeps a stable full width during ready and live combat layouts',()=>{
  const css=read('app/src/main/assets/arcade-pikachu-beach.css');
  const ui=read('app/src/main/assets/arcade-pikachu-beach-dx.js');
  assert.match(css,/\.pikachu-beach-stage[^\{]*\{[^}]*width\s*:\s*100%[^}]*min-width\s*:\s*0/s);
  assert.match(css,/\.pikachu-beach-mode-view[^\{]*\{[^}]*width\s*:\s*100%[^}]*min-width\s*:\s*0/s);
  assert.match(css,/\.dx-hud[^\{]*,[^\{]*\.pikachu-beach-dx-playfield[^\{]*,[^\{]*\.dx-controls[^\{]*\{[^}]*width\s*:\s*100%[^}]*min-width\s*:\s*0/s);
  assert.match(ui,/pikachuBeachStage[^\n]*is-ready-stage|is-ready-stage[^\n]*pikachuBeachStage/);
  assert.match(css,/\.pikachu-beach-stage\.is-ready-stage\s*\{[^}]*flex\s*:\s*0\s+0\s+auto[^}]*height\s*:\s*auto/s);
});

test('DX lower playfield is wave-blue instead of the old purple field',()=>{
  const [r,g,b]=pngPixel('app/src/main/assets/arcade/pikachu-beach/dx/sprites/s_background/000.png',10,200);
  assert.ok(g>r+30,`expected green channel to exceed red in wave-blue field, got ${r},${g},${b}`);
  assert.ok(b>g+20,`expected blue channel to lead in wave-blue field, got ${r},${g},${b}`);
});

test('Iron Tail exposes a timed visual state and renderer draws a metallic melee swipe',()=>{
  const core=require('../app/src/main/assets/arcade-pikachu-beach-dx-core.js');
  const run=core.createRun({difficulty:'normal',distance:'short',rng:()=>0.5});
  run.player.airborne=true;run.player.y=.35;run.player.landingY=.7;run.player.vy=-.1;
  core.setInput(run,{attack:true});
  const events=core.step(run,20);
  assert.ok(events.some(e=>e.type==='ironTail'));
  const snap=core.snapshot(run);
  assert.ok(snap.player.ironTailMs>0,'Iron Tail should remain visually active after the attack frame');
  const ui=read('app/src/main/assets/arcade-pikachu-beach-dx.js');
  const css=read('app/src/main/assets/arcade-pikachu-beach.css');
  assert.match(ui,/dx-iron-tail-swipe/);
  assert.match(ui,/ironTailMs/);
  assert.match(css,/\.dx-iron-tail-swipe\s*\{/);
  assert.match(css,/@keyframes\s+dxIronTailSwipe/);
});

test('card artwork identity helper rejects metadata-mismatched TCGdex art and accepts exact identity art',()=>{
  const identity=require('../app/src/main/assets/card-art-identity-v0533.js');
  const energy={id:'base4-119',name:'Energy Removal',source:'tcg',setId:'base4',localId:'119'};
  assert.equal(identity.isTrusted(energy,'https://assets.tcgdex.net/en/base/base4/119'),true);
  assert.equal(identity.isTrusted(energy,'https://assets.tcgdex.net/en/xy/xy11/61'),false);
  assert.equal(identity.isTrusted({...energy,_artIdentityVerified:true},'https://assets.tcgdex.net/en/xy/xy11/61'),false,'known-provider identity mismatch must beat a stale verified flag');
  assert.equal(identity.isTrusted({...energy,_artIdentityVerified:true},'https://images.scrydex.com/pokemon/base4-119/large'),true);
  assert.equal(identity.isTrusted(energy,'https://images.scrydex.com/pokemon/xy11-61/large'),false);
});

test('card modal refuses unverified mismatched cached artwork and re-resolves by card identity',()=>{
  const html=read('app/src/main/assets/index.html'),app=read('app/src/main/assets/app-v0167.js');
  assert.match(html,/card-art-identity-v0533\.js[\s\S]*app-v0167\.js/);
  assert.match(app,/LuckyDexCardArtIdentityV0533/);
  const bodies=[...app.matchAll(/async function openCardModal\(card\)\{([\s\S]*?)\n\}/g)].map(m=>m[1]);
  const body=bodies.at(-1)||'';
  assert.match(body,/isTrusted/);
  assert.match(body,/resolveCardArtwork/);
  assert.match(body,/state\.cards\[.*\]\.image/);
});

test('v0.53.3 release metadata is consistent for Beach and card identity polish',()=>{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const gradle=read('app/build.gradle'),app=read('app/src/main/assets/app-v0167.js'),html=read('app/src/main/assets/index.html');
  assert.equal(pkg.version,'0.53.3');assert.equal(lock.version,'0.53.3');assert.equal(lock.packages[''].version,'0.53.3');
  assert.match(gradle,/versionCode\s+5303/);assert.match(gradle,/versionName\s+['"]0\.53\.3['"]/);assert.match(gradle,/LuckyDex-asset-builder\/0\.53\.3/);
  assert.match(app,/__LUCKYDEX_BUILD=['"]0\.53\.3['"]/);assert.ok((html.match(/v0\.53\.3/g)||[]).length>=2);
});

test('v0.53.3 artwork repair clears stale cross-catalog identity hints as well as the bad image',()=>{
  const app=read('app/src/main/assets/app-v0167.js');
  const migration=app.match(/function migrateArtworkIdentityV0533\(\)\{([\s\S]*?)\n\}/)?.[1]||'';
  assert.match(migration,/_limitlessSetCode/);
  assert.match(migration,/_limitlessNumber/);
  assert.match(migration,/_tcgdexImage/);
});
