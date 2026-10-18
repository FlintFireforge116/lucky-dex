const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const expected={
  idle:'66f62f21757f32631bd13f1b446d47bff763522cb3e659ec0d3a961b6a8d163e',
  star:'c1e28062afb7e8b340f4a5c83b14a5ca0d463211947d661ffece19024558de1a',
  song:'9a98280fd68829996617d0f5f68af97712768c2a41c3b62e58893a204cc1afd3',
  moon:'2272aac005ffe10b12d250ebd1c90ad3a7dc340057ccca147e728e7fdc7180bb',
  spin:'bdeb1050a14374bbe82850fbaf83dbffc85a8d7c2b13e60278cc85b692f0b1d6'
};
for(const [name,hash] of Object.entries(expected)){
  assert.equal(sha(path.join(root,'app/src/main/assets',`clefairy_pose_${name}.png`)),hash,`${name} pose should use the v0.28.9 transparent generated art`);
}
assert.notEqual(expected.idle,expected.moon,'moon should no longer duplicate idle');
assert.notEqual(expected.idle,expected.star,'star should remain a distinct move pose');
assert.notEqual(expected.song,expected.spin,'song and spin should remain distinct move poses');
console.log('PASS v0.28.9 regenerated Clefairy pose assets');
