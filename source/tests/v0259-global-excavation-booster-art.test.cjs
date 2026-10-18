'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const assets=path.join(ROOT,'app/src/main/assets');
const app=fs.readFileSync(path.join(assets,'app-v0167.js'),'utf8');
const html=fs.readFileSync(path.join(assets,'index.html'),'utf8');
const gradle=fs.readFileSync(path.join(ROOT,'app/build.gradle'),'utf8');

assert.match(gradle,/applicationId\s+["']com\.example\.luckydex["']/,'package ID must stay update-compatible');
const versionCode=Number((gradle.match(/versionCode\s+(\d+)/)||[])[1]||0);assert.ok(versionCode>=259,'versionCode must not regress below v0.25.9');
const versionName=(gradle.match(/versionName\s+["'](\d+)\.(\d+)\.(\d+)["']/)||[]).slice(1).map(Number);
assert.equal(versionName.length,3,'release version name must stay semantic');
assert.ok(versionName[0]>0 || versionName[1]>25 || (versionName[1]===25 && versionName[2]>=9),'release version name must be v0.25.9 or newer');

const artPath=path.join(assets,'booster-art-v0259.js');
assert.ok(fs.existsSync(artPath),'v0.25.9 needs a dedicated booster-art resolver');
const art=require(artPath);
assert.equal(art.setKey({id:'library:base1',_libraryKey:'base1'}),'base1');
assert.ok(art.apiUrl({id:'library:base1',_libraryKey:'base1'}).includes('/base1/packshots'),'Base Set must resolve against its real packshot folder');
const baseArt=art.known({id:'library:base1',_libraryKey:'base1'});
assert.ok(baseArt.length>=3,'Base Set needs its real three wrapper artworks as an immediate fallback');
assert.ok(baseArt.every(url=>/^https:\/\/raw\.githubusercontent\.com\/1niceroli\/ptcg-assets\/main\/base1\/packshots\//.test(url)),'Base Set fallbacks must be real ptcg-assets packshots');
const manifestPath=path.join(assets,'booster-art-index-v0259.json');
assert.ok(fs.existsSync(manifestPath),'source must include a booster-art manifest seed');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
assert.ok(Array.isArray(manifest.base1)&&manifest.base1.length>=3,'manifest seed must cover Base Set immediately');
const builder=path.join(ROOT,'scripts/build-booster-art-index.py');
assert.ok(fs.existsSync(builder),'GitHub build must include the full packshot-index generator');
const workflow=fs.readFileSync(path.join(ROOT,'.github/workflows/build-apk.yml'),'utf8');
assert.match(workflow,/build-booster-art-index\.py/,'APK workflow must generate the complete packshot index before tests/build');
assert.match(html,/booster-art-v0259\.js/,'booster art resolver must load before the app runtime');

const cardStart=app.indexOf('async function resolveBuriedCardV0259');
assert.ok(cardStart>=0,'v0.25.9 global buried-card resolver must exist');
const cardEnd=app.indexOf('\nfunction ',cardStart);
const cardBody=app.slice(cardStart,cardEnd>cardStart?cardEnd:cardStart+5000);
assert.match(cardBody,/LuckyDexCardArt\?\.catalog|LuckyDexCardArt\.catalog/,'buried cards must start from the complete physical card-art catalogue');
assert.doesNotMatch(cardBody,/state\.cards|cardDetailCache|fossilMuseumCandidateCards/,'buried card choice must not depend on owned/cached cards');
assert.doesNotMatch(cardBody,/boosterEligible/,'loose excavation cards must include promos and one-offs too');

const boostStart=app.indexOf('async function resolveBuriedBoosterV0259');
assert.ok(boostStart>=0,'v0.25.9 global buried-booster resolver must exist');
const boostEnd=app.indexOf('\nfunction ',boostStart);
const boostBody=app.slice(boostStart,boostEnd>boostStart?boostEnd:boostStart+7000);
assert.match(boostBody,/LuckyDexCardArt\?\.catalog|LuckyDexCardArt\.catalog/,'buried boosters must start from the complete physical set catalogue');
assert.match(boostBody,/boosterProductEligible[\s\S]*===true/,'buried booster finds must pass the strict audited booster-product gate');
assert.doesNotMatch(boostBody,/state\.cards|packCacheV13|fossilMuseumBoosterSetCandidates/,'buried booster selection must not depend on discovered/opened sets');
assert.match(boostBody,/LuckyDexBoosterArt\?\.resolve|LuckyDexBoosterArt\.resolve/,'buried booster must resolve its corresponding pack artwork');

const renderStart=app.indexOf('async function renderSealedPack');
assert.ok(renderStart>=0,'pack shop renderer must asynchronously resolve missing booster artwork');
const renderBody=app.slice(renderStart,renderStart+3500);
assert.match(renderBody,/LuckyDexBoosterArt\?\.resolve|LuckyDexBoosterArt\.resolve/,'normal Card Shop boosters must use the same real-art resolver');
console.log('PASS v0.25.9 global excavation pools + booster artwork contract');
