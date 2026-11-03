const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const classic=require('../app/src/main/assets/tcg-classic-base1.js');

test('Classic ownership maps LuckyDex physical Base Set library cards onto base1 gameplay ids',()=>{
  const rows=classic.projectOwnedCards({
    alakazam:{id:'BS-1',name:'Alakazam',source:'tcg',setId:'library:BS',setName:'Base Set',setTotal:102,localId:'1',count:4,_librarySetKey:'BS',_libraryCanonicalId:'BS-1',image:'alakazam.jpg'},
    blastoise:{id:'BS-2',name:'Blastoise',source:'tcg',setId:'library:BS',setName:'Base Set',setTotal:102,localId:'2',count:5,_librarySetKey:'BS',_libraryCanonicalId:'BS-2',image:'blastoise.jpg'},
    wrongSet:{id:'B2-1',name:'Alakazam',source:'tcg',setId:'library:B2',setName:'Base Set 2',setTotal:130,localId:'1',count:9,_librarySetKey:'B2'}
  });
  assert.equal(rows.length,2);
  assert.deepEqual(rows.map(r=>[r.gameplayId,r.quantity]),[['base1-1',4],['base1-2',5]]);
  assert.equal(rows[0].variants[0].id,'BS-1');
  assert.equal(rows[0].variants[0].image,'alakazam.jpg');
});

test('Classic deck result pane has the same vertical scrolling contract as Pocket',()=>{
  const css=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/tcgp-deck-editor.css'),'utf8');
  assert.match(css,/body\.tcgp-deck-editing[^\n]*#classicDeckResults[^\n]*overflow\s*:\s*auto/i);
});

test('A complete LuckyDex library Base Set projects all 102 owned cards and can feed the Classic auto builder',()=>{
  const battleData=require('../app/src/main/assets/tcg-classic-battle-data.js');
  const decks=require('../app/src/main/assets/tcg-classic-decks.js');
  const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
  const owned={};
  for(let number=1;number<=102;number++)owned[`card${number}`]={id:`BS-${number}`,name:battleData.cardById(`base1-${number}`).name,source:'tcg',setId:'library:BS',setName:'Base Set',setTotal:102,localId:String(number),count:4,_librarySetKey:'BS',_libraryCanonicalId:`BS-${number}`};
  const rows=decks.ownedRows(owned);
  assert.equal(rows.length,102);
  assert.equal(rows.filter(row=>row.card.deckEligible!==false).length,96);
  const result=builder.buildDeck(rows,{style:'competitive'});
  assert.equal(result.ok,true,result.errors?.join(' '));
  assert.equal(result.cards.length,30);
  assert.equal(decks.validateDraft(result.cards,rows,{requireFull:true}).ok,true);
});

test('v0.69.67 release markers agree',()=>{
  const root=path.resolve(__dirname,'..');
  const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
  const runtime=fs.readFileSync(path.join(root,'app/src/main/assets/app-v0167.js'),'utf8');
  const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
  assert.ok(Number((gradle.match(/versionCode (\d+)/)||[])[1])>=7047);
  assert.match(gradle,/versionName '0\.69\.(?:6[7-9]|[7-9]\d+)'/);
  assert.match(runtime,/window\.__LUCKYDEX_BUILD='0\.69\.(?:6[7-9]|[7-9]\d+)'/);
  assert.match(html,/LUCKY DEX · v0\.69\.(?:6[7-9]|[7-9]\d+)/);
});

