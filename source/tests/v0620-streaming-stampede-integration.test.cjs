'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('Streaming Stampede is registered across the Stadium 2 world, shared help, and page assets',()=>{
  const world=read('app/src/main/assets/arcade-world.js');
  const help=read('app/src/main/assets/arcade-help.js');
  const html=read('app/src/main/assets/index.html');
  assert.match(world,/stadium2KidsClub[\s\S]*streamingStampede/);
  assert.match(world,/streamingStampede:'Streaming Stampede'/);
  assert.match(world,/streamingStampede:\(\)=>window\.LuckyDexStreamingStampede/);
  assert.match(help,/streamingStampede:\{name:'Streaming Stampede'/);
  assert.match(html,/id="streamingStampedeGame"/);
  assert.match(html,/arcade-streaming-stampede\.css/);
  assert.match(html,/arcade-streaming-stampede-core\.js/);
  assert.match(html,/arcade-streaming-stampede\.js/);
});

test('Streaming Stampede has persistent records and achievements without inventing a rare-event setting',()=>{
  const platform=read('app/src/main/assets/arcade-platform.js');
  const achievements=read('app/src/main/assets/achievements-v0341.js');
  const app=read('app/src/main/assets/app-v0167.js');
  assert.match(platform,/streamingStampede:\{gamesPlayed:0,wins:0,podiums:0,bestScore:0/);
  assert.match(achievements,/streaming_stampede_first_match/);
  assert.match(achievements,/streaming_stampede_first_win/);
  assert.match(achievements,/streaming_stampede_hard_win/);
  assert.match(achievements,/streaming_stampede_perfect/);
  assert.doesNotMatch(app,/forceStreamingStampedeRare/i);
});
