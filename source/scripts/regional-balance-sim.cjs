const fs=require('fs'),path=require('path'),a=path.resolve(__dirname,'../app/src/main/assets/adventure');
const E=require(path.join(a,'adventure-regional-engine.js')),P=require(path.join(a,'adventure-progression.js')),S=require(path.join(a,'adventure-species.js')),D=require(path.join(a,'adventure-move-data.js')),B=require(path.join(a,'adventure-battle.js')),T=require(path.join(a,'adventure-tools.js'));
function learn(save,j){
 for(const id of Object.keys(save.tmInventory).map(Number)){if(save.tmInventory[id]>0&&D.moves[id].damageClass!=='status'){const target=j.party.filter(p=>P.canTeach(save.pokemon[p.key],id)&&!p.moves.includes(id)).sort((x,y)=>Number(y.types.includes(D.moves[id].type))-Number(x.types.includes(D.moves[id].type)))[0];if(target){const owned=save.pokemon[target.key],score=mid=>D.moves[mid].damageClass==='status'?0:D.moves[mid].power||40;let os=0,js=0;owned.moves.forEach((mid,i)=>{if(score(mid)<score(owned.moves[os]))os=i});target.moves.forEach((mid,i)=>{if(score(mid)<score(target.moves[js]))js=i});if(score(id)>score(target.moves[js])&&P.teachTM(save,target.key,id,os).applied){target.moves[js]=id;target.pp[id]=D.moves[id].pp||10;target.tmLearned=[...new Set([...target.tmLearned,id])];}}}}
 for(const p of j.party)for(const id of [...p.pendingMoves]){const m=D.moves[id];let slot=0;for(let i=1;i<p.moves.length;i++)if((D.moves[p.moves[i]].damageClass==='status'?0:D.moves[p.moves[i]].power||40)<(D.moves[p.moves[slot]].damageClass==='status'?0:D.moves[p.moves[slot]].power||40))slot=i;if(m.damageClass!=='status'&&(m.power||40)>(D.moves[p.moves[slot]].power||0)){P.learnPending(p,id,slot);p.pp[id]=m.pp||10}else P.skipPending(p,id);}
}
function simulate(region,seed,collectionLevel=5){
 const save={pokemon:{},team:[],profile:{coins:1000,xp:0},inventory:{potion:5,berry:5,pokeball:20},stats:{}};for(const id of [3,6,9]){const key=id+':n';save.pokemon[key]={...S.byId[id],level:collectionLevel,xp:0,count:1};save.team.push(key)}
 const j=E.start(save,region,seed),initialLevels=j.party.map(p=>p.level),tx=T.createTransactions(()=>save,()=>{});let turns=0,steps=0,potions=0,purchases=0,defeats=0,battles=0,leagueTurns=0,lastRecovery=null;const battlesByGym=Array(8).fill(0),levelsByBadge=[];
 function stock(target){while(save.inventory.potion<target){const q=tx.preparePurchase('potion');if(!q.allowed||!tx.confirmPurchase(q.token).applied)break;purchases++;}}
 while(j.phase!=='complete'&&turns<1500&&steps++<3000&&defeats<4){
  if(j.phase==='map'){
   if(j.recovery&&j.recovery.at!==lastRecovery){lastRecovery=j.recovery.at;defeats++;}
   // Centers and the League preparation point provide a normal chance to visit the Mart.
   if(j.sectionIndex===0)stock(j.chapterIndex>=9?15:4);
   for(const p of j.party)if(p.hp>0&&p.hp<p.maxHp*.7&&save.inventory.potion>0){E.useFieldPotion(save,p.key);potions++}
   const options=E.available(j),n=options.find(n=>n.optional&&n.type==='cache')||options.find(n=>!n.optional);if(!n)break;E.enter(save,n.id);if(j.battle){battles++;if(n.chapterIndex<8)battlesByGym[n.chapterIndex]++;}
  }else if(j.phase==='node')E.resolveNode(save,'safe');
  else if(j.phase==='result'){learn(save,j);const n=E.current(j);if(n.type==='gym')levelsByBadge.push(j.party.map(p=>p.level));E.advance(save);}
  else if(j.phase==='battle'){
   const f=j.battle,p=f.party.find(p=>p.key===f.leadKey);if(j.chapterIndex>=9)leagueTurns++;
   if(p.hp<p.maxHp*.35&&save.inventory.potion>0){E.act(save,'potion');potions++}else{
    const scores=f.party.filter(p=>p.hp>0).map(p=>{const moves=p.moves.filter(id=>p.pp[id]>0&&D.moves[id].damageClass!=='status').map(id=>{const m=D.moves[id],special=m.damageClass==='special',atk=p.stats?.[special?'spAttack':'attack']||p.stats?.attack||1,def=f.enemy.stats?.[special?'spDefense':'defense']||f.enemy.stats?.defense||1;return {id,score:(m.power||40)*B.effectiveness(m.type,f.enemy.types)*(p.types.includes(m.type)?1.1:1)*atk/Math.max(1,def)}}).sort((x,y)=>y.score-x.score);return {p,m:moves[0]||{id:165,score:15}}}),best=scores.sort((x,y)=>y.m.score-x.m.score)[0],selected=scores.find(x=>x.p.key===p.key);
    if(best.p.key!==p.key&&best.m.score>selected.m.score*1.7&&p.hp>p.maxHp*.4)E.act(save,'switch',{key:best.p.key});else E.act(save,'move',{moveId:selected.m.id});
   }turns++;
  }
 }
 return {region,seed,collectionLevel,initialLevels,phase:j.phase,badges:j.badges,elite:j.eliteWins,turns,leagueTurns,battles,battlesByGym,potions,purchases,defeats,levels:j.party.map(p=>p.level),levelsByBadge,remainingPotions:save.inventory.potion,coins:save.profile.coins,coinIncome:j.loot.coins,coinSpent:purchases*180,tms:j.loot.tms,remainingTM:Object.values(save.tmInventory).reduce((n,x)=>n+x,0),lastNode:j.current,lastEnemy:j.battle?.enemy.name};
}
const runs=[];for(const region of ['kanto','johto','hoenn']){for(const seed of [17,71,999])runs.push(simulate(region,seed));runs.push(simulate(region,17,50));}
const report={version:'0.40.0',method:'Prepared Venusaur, Charizard and Blastoise; collection levels5 and50; real battle reducer, local cache detours, owned TMs, Poké Mart3Potions/180coins before route chapters and League. No injected victory/heal/reward.',runs};
const output=path.resolve(__dirname,'../artifacts/v0400/regional-balance.json');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
