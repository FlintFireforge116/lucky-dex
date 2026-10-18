/* Authoritative silhouette quiz owner; existing modes and reward formula retained. */
(() => { 'use strict';
let quizGameV166=null,quizTimerV166=null,quizDifficultyV166='normal';
const timeouts=new Set();
const setTimeout=(fn,ms)=>{const id=window.setTimeout(()=>{timeouts.delete(id);fn();},ms);timeouts.add(id);return id;};
function stopQuizV166(){if(quizTimerV166)clearInterval(quizTimerV166);quizTimerV166=null;for(const id of timeouts)window.clearTimeout(id);timeouts.clear();if(quizGameV166){quizGameV166.active=false;quizGameV166.token++;}}
const QUIZ_FALLBACK_V166=[
 [1,'bulbasaur'],[4,'charmander'],[7,'squirtle'],[12,'butterfree'],[25,'pikachu'],[26,'raichu'],[35,'clefairy'],[37,'vulpix'],[39,'jigglypuff'],[52,'meowth'],
 [54,'psyduck'],[58,'growlithe'],[63,'abra'],[66,'machop'],[74,'geodude'],[77,'ponyta'],[81,'magnemite'],[92,'gastly'],[94,'gengar'],[95,'onix'],
 [100,'voltorb'],[104,'cubone'],[113,'chansey'],[122,'mr-mime'],[129,'magikarp'],[130,'gyarados'],[131,'lapras'],[132,'ditto'],[133,'eevee'],[137,'porygon'],
 [138,'omanyte'],[140,'kabuto'],[142,'aerodactyl'],[143,'snorlax'],[147,'dratini'],[149,'dragonite'],[150,'mewtwo'],[151,'mew'],[155,'cyndaquil'],[158,'totodile'],
 [172,'pichu'],[175,'togepi'],[196,'espeon'],[197,'umbreon'],[202,'wobbuffet'],[212,'scizor'],[214,'heracross'],[225,'delibird'],[246,'larvitar'],[248,'tyranitar'],
 [252,'treecko'],[255,'torchic'],[258,'mudkip'],[280,'ralts'],[282,'gardevoir'],[302,'sableye'],[303,'mawile'],[304,'aron'],[328,'trapinch'],[333,'swablu'],
 [359,'absol'],[371,'bagon'],[374,'beldum'],[376,'metagross'],[387,'turtwig'],[390,'chimchar'],[393,'piplup'],[403,'shinx'],[408,'cranidos'],[410,'shieldon'],
 [425,'drifloon'],[443,'gible'],[447,'riolu'],[448,'lucario'],[479,'rotom'],[495,'snivy'],[498,'tepig'],[501,'oshawott'],[570,'zorua'],[571,'zoroark'],
 [607,'litwick'],[610,'axew'],[633,'deino'],[650,'chespin'],[653,'fennekin'],[656,'froakie'],[700,'sylveon'],[704,'goomy'],[722,'rowlet'],[725,'litten'],
 [728,'popplio'],[778,'mimikyu'],[810,'grookey'],[813,'scorbunny'],[816,'sobble'],[848,'toxel'],[906,'sprigatito'],[909,'fuecoco'],[912,'quaxly'],[926,'fidough'],
 [957,'tinkatink'],[996,'frigibax']
].map(([id,name])=>({id,name}));

function quizPoolV166(){const live=(species||[]).filter(s=>Number(s.id)>0&&Number(s.id)<=MAX_DEX_ID&&s.name&&!/^pokemon-\d+$/i.test(s.name)),map=new Map(QUIZ_FALLBACK_V166.map(x=>[x.id,x]));for(const x of live)map.set(Number(x.id),{id:Number(x.id),name:x.name});let pool=[...map.values()];if(quizDifficultyV166==='easy')pool=pool.filter(x=>x.id<=251);return pool;}
function generationForIdV166(id){return GENERATIONS.find(g=>id>=g.min&&id<=g.max)||GENERATIONS[GENERATIONS.length-1];}
function quizOptionsV166(correct,pool,count){const gen=generationForIdV166(correct.id),same=shuffleV166(pool.filter(x=>x.id!==correct.id&&generationForIdV166(x.id).id===gen.id)),rest=shuffleV166(pool.filter(x=>x.id!==correct.id&&!same.some(s=>s.id===x.id)));return shuffleV166([correct,...same,...rest].slice(0,count));}
function shuffleV166(arr){return [...arr].sort(()=>Math.random()-.5);}
function titlePokemonV166(name){return titleCase(String(name||" ").replace(/-/g," "));}
  function resetQuizGameV166(){
    stopQuizV166();quizGameV166={round:0,score:0,streak:0,correct:0,active:false,token:1,current:null,mode:quizDifficultyV166};
    document.getElementById('quizRound').textContent='0';document.getElementById('quizScore').textContent='0';document.getElementById('quizStreak').textContent='0';
    document.getElementById('quizBest').textContent=fmt(state.arcade.bestQuiz||0);document.getElementById('quizEndlessBest').textContent=fmt(state.arcade.bestQuizEndless||0);
    document.getElementById('quizPrompt').textContent="WHO'S THAT POKÉMON?";document.getElementById('quizSprite').src='arcade/sprites/actors/pokemon/25.png';
    const wrap=document.querySelector('.quiz-silhouette-wrap');wrap?.classList.remove('reveal','hard','super');if(wrap){wrap.style.removeProperty('--quiz-tilt');wrap.style.removeProperty('--quiz-x');wrap.style.removeProperty('--quiz-y');}
    document.getElementById('quizAnswers').innerHTML='';document.getElementById('quizTimerFill').style.width='0%';
    const b=document.getElementById('quizStartBtn');b.hidden=false;b.disabled=false;b.textContent=quizDifficultyV166==='endless'?'START ENDLESS':'START QUIZ';
    setQuizDifficultyV166(quizDifficultyV166||'normal');
  }

  function setQuizDifficultyV166(mode){
    if(quizGameV166?.active)return;quizDifficultyV166=['easy','normal','hard','super','endless'].includes(mode)?mode:'normal';
    document.querySelectorAll('[data-quiz-difficulty]').forEach(b=>b.classList.toggle('active',b.dataset.quizDifficulty===quizDifficultyV166));
    const copy={easy:'Kanto + Johto · 12 seconds',normal:'All regions · 9 seconds',hard:'All regions · mirrored silhouette · 6 seconds',super:'6 choices · cropped/rotated silhouette · 4.2 seconds',endless:'One miss ends the run · timer gets faster after every correct answer'};
    document.getElementById('quizHint').textContent=copy[quizDifficultyV166];
    document.getElementById('quizRoundLabel').textContent=quizDifficultyV166==='endless'?'Streak':'Question';document.getElementById('quizRoundMax').textContent=quizDifficultyV166==='endless'?'':'/10';
    const b=document.getElementById('quizStartBtn');if(b)b.textContent=quizDifficultyV166==='endless'?'START ENDLESS':'START QUIZ';
  }

  function startQuizV166(){
    stopQuizV166();quizGameV166={round:0,score:0,streak:0,correct:0,active:true,token:(quizGameV166?.token||0)+1,current:null,mode:quizDifficultyV166};
    document.getElementById('quizStartBtn').hidden=true;nextQuizQuestionV166();
  }

  function nextQuizQuestionV166(){
    const g=quizGameV166;if(!g||!g.active)return;const endless=g.mode==='endless';if(!endless&&g.round>=10){finishQuizV166();return;}
    const pool=quizPoolV166();if(pool.length<10){showToast('Pokédex data is still loading. Try again in a moment.');resetQuizGameV166();return;}
    g.round++;const correct=pool[Math.floor(Math.random()*pool.length)];
    const count=g.mode==='super'?6:g.mode==='hard'?5:endless?(g.round>20?6:g.round>10?5:4):4;
    const opts=quizOptionsV166(correct,pool,count);
    const duration=endless?Math.max(2500,9000-(g.round-1)*220):({easy:12000,normal:9000,hard:6000,super:4200}[g.mode]||9000);
    g.current={correct,answered:false,duration,started:performance.now()};const token=g.token;
    document.getElementById('quizRound').textContent=endless?g.streak:g.round;document.getElementById('quizPrompt').textContent="WHO'S THAT POKÉMON?";
    const gen=generationForIdV166(correct.id);
    document.getElementById('quizHint').textContent=g.mode==='super'?'No hints. Six choices.':g.mode==='hard'?'No hints · trust your Pokédex instincts':endless?(g.round<=5?`Generation ${gen.id} · ${gen.name}`:`${(duration/1000).toFixed(1)} seconds`):g.mode==='easy'?`${gen.name} Pokémon`:`Generation ${gen.id} · ${gen.name}`;
    const wrap=document.querySelector('.quiz-silhouette-wrap');wrap.classList.remove('reveal','hard','super');
    if(g.mode==='hard')wrap.classList.add('hard');if(g.mode==='super'){wrap.classList.add('super');wrap.style.setProperty('--quiz-tilt',`${Math.round(-15+Math.random()*30)}deg`);wrap.style.setProperty('--quiz-x',`${Math.round(-8+Math.random()*16)}%`);wrap.style.setProperty('--quiz-y',`${Math.round(-6+Math.random()*12)}%`);}else{wrap.style.removeProperty('--quiz-tilt');wrap.style.removeProperty('--quiz-x');wrap.style.removeProperty('--quiz-y');}
    const img=document.getElementById('quizSprite');img.src=`arcade/sprites/actors/pokemon/${correct.id}.png`;img.alt='Mystery Pokémon';
    const answers=document.getElementById('quizAnswers');answers.innerHTML=opts.map(x=>`<button data-quiz-answer="${x.id}">${escapeHtml(titlePokemonV166(x.name))}</button>`).join('');answers.querySelectorAll('[data-quiz-answer]').forEach(b=>b.onclick=()=>answerQuizV166(Number(b.dataset.quizAnswer)));
    if(quizTimerV166)clearInterval(quizTimerV166);const fill=document.getElementById('quizTimerFill');fill.style.width='100%';quizTimerV166=setInterval(()=>{if(!quizGameV166||token!==quizGameV166.token||!g.current||g.current.answered){clearInterval(quizTimerV166);quizTimerV166=null;return;}const remaining=Math.max(0,1-(performance.now()-g.current.started)/duration);fill.style.width=`${remaining*100}%`;if(remaining<=0)answerQuizV166(null);},80);
  }

  function answerQuizV166(id){
    const g=quizGameV166,q=g?.current;if(!g||!q||q.answered)return;q.answered=true;if(quizTimerV166){clearInterval(quizTimerV166);quizTimerV166=null;}
    const correct=id===q.correct.id,remaining=Math.max(0,1-(performance.now()-q.started)/q.duration),wrap=document.querySelector('.quiz-silhouette-wrap');wrap.classList.add('reveal');wrap.classList.remove('hard','super');
    document.getElementById('quizPrompt').textContent=correct?`${titlePokemonV166(q.correct.name)}!`:`It's ${titlePokemonV166(q.correct.name)}!`;document.getElementById('quizHint').textContent=correct?'Correct!':'That one caught you out.';
    document.querySelectorAll('[data-quiz-answer]').forEach(b=>{b.disabled=true;if(Number(b.dataset.quizAnswer)===q.correct.id)b.classList.add('correct');else if(id!=null&&Number(b.dataset.quizAnswer)===id)b.classList.add('wrong');});
    if(correct){g.correct++;g.streak++;const modeBoost=g.mode==='super'?1.5:g.mode==='hard'?1.2:g.mode==='endless'?1.25:1;g.score+=Math.round((100+remaining*120+Math.min(180,g.streak*14))*modeBoost);vibrate([10,14,20]);}else{if(g.mode!=='endless')g.streak=0;vibrate(22);}
    document.getElementById('quizScore').textContent=fmt(g.score);document.getElementById('quizStreak').textContent=g.streak;document.getElementById('quizRound').textContent=g.mode==='endless'?g.streak:g.round;document.getElementById('quizTimerFill').style.width='0%';
    if(g.mode==='endless'&&!correct)setTimeout(()=>{if(quizGameV166===g&&g.active)finishQuizV166();},950);else setTimeout(()=>{if(quizGameV166===g&&g.active)nextQuizQuestionV166();},850);
  }

  function finishQuizV166(){
    const g=quizGameV166;if(!g||!g.active)return;g.active=false;if(quizTimerV166){clearInterval(quizTimerV166);quizTimerV166=null;}
    if(g.mode==='endless'){
      const previousStreak=Number(state.arcade.bestQuizEndless||0),previousEndlessScore=Number(state.arcade.bestQuizEndlessScore||0);state.arcade.bestQuizEndless=Math.max(previousStreak,g.correct);state.arcade.bestQuizEndlessScore=Math.max(previousEndlessScore,g.score);save();document.getElementById('quizEndlessBest').textContent=fmt(state.arcade.bestQuizEndless);
      const finalTimer=Math.max(2.5,9-(Math.max(0,g.round-1)*.22)),payout=Math.max(80,Math.round(g.score*.55+g.correct*22)),awarded=awardArcadeCoins(payout,"Who's That Pokémon? Endless",'quiz');window.LuckyDexArcadeSession?.showResult?.('quiz',{title:`ENDLESS STREAK ${g.correct}`,metricLabel:'SCORE',metricValue:`${fmt(g.score)} · ${finalTimer.toFixed(1)}s final timer`,coinsAwarded:awarded,itemAwarded:null,bestText:g.correct>=state.arcade.bestQuizEndless?'BEST STREAK':'',review:{title:`ENDLESS STREAK ${g.correct}`,mode:'Endless',difficulty:'Endless',metricLabel:'SCORE',metricValue:fmt(g.score),stats:[{label:'Correct Answers',value:String(g.correct)},{label:'Final Timer',value:`${finalTimer.toFixed(1)}s`},{label:'Final Streak',value:String(g.streak)}],pbs:[{label:'Best Streak',value:String(state.arcade.bestQuizEndless),isNew:g.correct>previousStreak},{label:'Best Endless Score',value:fmt(state.arcade.bestQuizEndlessScore),isNew:g.score>previousEndlessScore}],rewards:[{label:'Lucky Coins',value:String(awarded||0)}]},onReplay:resetQuizGameV166,onBack:()=>window.LuckyDexArcadeWorld?.backFromGame?.(true)});return;
    }
    const previousBest=Number(state.arcade.bestQuiz||0),mult={easy:.42,normal:.52,hard:.64,super:.78}[g.mode]||.52,payout=Math.max(100,Math.round(g.score*mult+g.correct*20));state.arcade.bestQuiz=Math.max(previousBest,g.score);if(g.correct===10)state.arcade.quizPerfect=1;save();document.getElementById('quizBest').textContent=fmt(state.arcade.bestQuiz);const awarded=awardArcadeCoins(payout,"Who's That Pokémon?",'quiz'),modeLabel=g.mode.toUpperCase().replace('SUPER','SUPER HARD');window.LuckyDexArcadeSession?.showResult?.('quiz',{title:g.correct===10?'PERFECT 10/10!':`${g.correct}/10 CORRECT`,metricLabel:'SCORE',metricValue:`${fmt(g.score)} · ${modeLabel}`,coinsAwarded:awarded,itemAwarded:null,bestText:g.correct===10?'PERFECT RUN':'',review:{title:g.correct===10?'PERFECT 10/10!':`${g.correct}/10 CORRECT`,mode:modeLabel,difficulty:modeLabel,metricLabel:'SCORE',metricValue:fmt(g.score),stats:[{label:'Correct Answers',value:`${g.correct}/10`},{label:'Final Streak',value:String(g.streak)},{label:'Perfect Run',value:g.correct===10?'YES':'NO'}],pbs:[{label:'Best Score',value:fmt(state.arcade.bestQuiz),isNew:g.score>previousBest}],rewards:[{label:'Lucky Coins',value:String(awarded||0)}]},onReplay:resetQuizGameV166,onBack:()=>window.LuckyDexArcadeWorld?.backFromGame?.(true)});
  }


document.querySelectorAll('[data-quiz-difficulty]').forEach(b=>b.onclick=()=>setQuizDifficultyV166(b.dataset.quizDifficulty));
document.getElementById('quizStartBtn').onclick=startQuizV166;
window.LuckyDexQuiz={open:resetQuizGameV166,close:stopQuizV166,start:startQuizV166};
})();
