const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('Adventure 2.0 authored scripts are loaded before location flow and UI',()=>{
  const html=read('app/src/main/assets/index.html');
  const authored=html.indexOf('adventure/adventure-authored-events.js');
  const kanto=html.indexOf('adventure/adventure-kanto-events.js');
  const flow=html.indexOf('adventure/adventure-location-flow.js');
  const ui=html.indexOf('adventure/adventure-regional-ui.js');
  assert.ok(authored>0&&kanto>authored&&flow>kanto&&ui>flow);
});

test('Adventure 2.0 Chapter 1 source modules are present',()=>{
  for(const f of ['adventure-authored-events.js','adventure-kanto-events.js'])assert.ok(fs.existsSync(path.join(root,'app/src/main/assets/adventure',f)),f+' missing');
});
