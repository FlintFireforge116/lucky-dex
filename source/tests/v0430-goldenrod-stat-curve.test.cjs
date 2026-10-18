const test=require('node:test');
const assert=require('node:assert/strict');
const curve=require('../app/src/main/assets/arcade-goldenrod-stat-curve.js');

test('shared curve hits approved reference points and clamps extremes',()=>{
  const refs=[[20,.65],[40,.78],[59,.90],[89,1.02],[119,1.12],[149,1.19],[180,1.24],[220,1.28]];
  for(const [stat,factor] of refs)assert.equal(curve.factor(stat),factor);
  assert.equal(curve.factor(-999),.65);
  assert.equal(curve.factor(999),1.28);
});

test('shared curve is monotonic and visibly separates rookie-low from rookie-high',()=>{
  let prev=-Infinity;
  for(let s=1;s<=260;s++){const f=curve.factor(s);assert.ok(Number.isFinite(f));assert.ok(f>=prev);prev=f;}
  assert.ok(curve.factor(58)-curve.factor(25)>.18);
  assert.ok(curve.factor(220)-curve.factor(180)<curve.factor(59)-curve.factor(20));
});
