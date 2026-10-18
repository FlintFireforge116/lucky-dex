'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const file=path.resolve(__dirname,'../app/src/main/assets/adventure/adventure-move-view.js');
const V=fs.existsSync(file)?require(file):{};
test('shared move descriptions expose readable data and current PP',()=>{
  assert.equal(typeof V.describe,'function');const m=V.describe(85,{currentPP:7});assert.equal(m.name,'Thunderbolt');assert.equal(m.type,'Electric');assert.equal(m.category,'Special');assert.equal(m.power,'90');assert.equal(m.accuracy,'100%');assert.equal(m.pp,'7 / 15');assert.match(m.description,/paraly/i);
});
test('status and unsupported effects describe only the implemented behavior',()=>{
  assert.equal(typeof V.describe,'function');assert.equal(V.describe(150).power,'—');assert.match(V.describe(150).description,/No battle effect is currently implemented/);assert.match(V.describe(105).description,/Restores the user/);assert.match(V.describe(182).description,/protect/i);assert.match(V.describe(100).description,/wild|escape|teleport/i);
});
test('null accuracy and variable power are distinguishable from status moves',()=>{
  assert.equal(typeof V.describe,'function');const m=V.describe({id:1000,name:'Example',type:'normal',damageClass:'physical',power:null,accuracy:null,pp:5,role:'damage'});assert.equal(m.power,'Variable');assert.equal(m.accuracy,'Always hits');assert.equal(m.pp,'5');assert.match(m.description,/damage/i);
});
test('move card markup escapes labels and exposes the same factual details',()=>{
  assert.equal(typeof V.markup,'function');const html=V.markup({id:1000,name:'<script>',type:'normal',damageClass:'physical',power:20,accuracy:95,pp:5,role:'damage'},{currentPP:2});assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>/);for(const text of ['Normal','Physical','Power','Accuracy','PP','2 / 5'])assert.ok(html.includes(text));
});
