(function(root){
  'use strict';
  const core=root.LuckyDexPicrossCore;
  const data=root.LuckyDexPicrossData;
  if(!core||!data)return;
  const puzzleById=new Map((data.puzzles||[]).map(p=>[p.resource_id,p]));
  const areaById=new Map((data.areas||[]).map(a=>[Number(a.area),a]));
  const $=id=>typeof document!=='undefined'?document.getElementById(id):null;
  let opened=false,selectedArea=0,selectedPuzzleId=null,board=null,tool='fill',timer=null,finished=false;
  const FOCUS_CELL_SIZES=[24,28,32,36,40,44];
  let focusZoomIndex=2;
  let focusPreviousTool='fill';
  let drag={active:false,pointerId:null,tool:null,mark:null,start:null,last:null,startClient:null,travel:0,tapThresholdPx:6,moved:false,geometry:null,visited:new Set()};

  function platform(){return root.LuckyDexArcadePlatform||null;}
  function session(){return root.LuckyDexArcadeSession||null;}
  function state(){return root.state||globalThis.state||null;}
  function save(){try{root.save?.();}catch(_){}}
  function arcadeRecord(){
    const s=state();if(!s)return {completed:{},bestTimesMs:{},totalClears:0,noMistakeClears:0};
    s.arcade=platform()?.ensureArcadeState?platform().ensureArcadeState(s.arcade):(s.arcade||{});
    s.arcade.picross=s.arcade.picross||{completed:{},bestTimesMs:{},totalClears:0,noMistakeClears:0};
    return s.arcade.picross;
  }
  const completed=id=>!!arcadeRecord().completed?.[id];
  function stageLabel(area,resourceId){const slot=(area?.slots||[]).find(s=>s.resource_id===resourceId),number=Math.max(1,Number(slot?.stage_number)||1);return core.stageNumber(area?.area,number-1);}
  function progress(){return core.progressSummary(data.areas,arcadeRecord());}
  function setView(which){
    if(which!=='picrossPuzzleView')closeFocusMode();
    for(const id of ['picrossAreaView','picrossLevelView','picrossPuzzleView']){const n=$(id);if(n)n.hidden=id!==which;}
  }
  function setStatus(text='',complete=false){const n=$('picrossStatus');if(!n)return;n.textContent=String(text||'');n.classList.toggle('picross-complete-note',!!complete);}
  function miniature(puzzle,large=false){
    if(!puzzle)return '';
    const maxW=large?120:40,maxH=large?90:36;
    const cell=Math.max(1,Math.floor(Math.min(maxW/puzzle.width,maxH/puzzle.height)));
    const cells=puzzle.solution_rows.flatMap((row,y)=>[...row].map((v,x)=>`<i class="picross-mini-cell${v==='1'?' on':''}" aria-hidden="true"></i>`)).join('');
    return `<span class="picross-mini-grid" style="grid-template-columns:repeat(${puzzle.width},${cell}px);grid-template-rows:repeat(${puzzle.height},${cell}px);--mini-cell:${cell}px">${cells}</span>`;
  }
  function renderOverview(){
    const p=progress(),host=$('picrossOverview');if(!host)return;
    host.innerHTML=`<div><small>PICTURES</small><b>${p.uniqueClears} / ${p.totalStages}</b></div><div><small>AREAS</small><b>${p.areasCleared} / ${p.totalAreas}</b></div><div><small>ERRORLESS</small><b>${Number(arcadeRecord().noMistakeClears||0)}</b></div>`;
  }
  function showAreas(){
    stopTimer();board=null;selectedPuzzleId=null;finished=false;setView('picrossAreaView');renderOverview();
    const host=$('picrossAreaGrid');if(!host)return;
    const r=arcadeRecord();host.innerHTML=(data.areas||[]).map(area=>{
      const slots=area.slots||[],done=slots.filter(s=>r.completed?.[s.resource_id]).length,full=slots.length>0&&done===slots.length;
      return `<button type="button" class="picross-area-card${full?' is-complete':''}" data-picross-area="${area.area}"><span class="picross-area-card-head"><b>AREA ${String(area.area).padStart(2,'0')}</b><span class="picross-area-card-progress">${done}/${slots.length}</span></span><span class="picross-area-card-action">${full?'COMPLETE':'SELECT AREA'}</span></button>`;
    }).join('');
  }
  function showLevels(areaId=selectedArea){
    stopTimer();board=null;selectedPuzzleId=null;finished=false;selectedArea=Number(areaId)||0;const area=areaById.get(selectedArea);if(!area)return showAreas();setView('picrossLevelView');
    const r=arcadeRecord(),slots=area.slots||[],done=slots.filter(s=>r.completed?.[s.resource_id]).length;
    if($('picrossLevelTitle'))$('picrossLevelTitle').textContent=`AREA ${String(selectedArea).padStart(2,'0')}`;
    if($('picrossLevelProgress'))$('picrossLevelProgress').textContent=`${done} / ${slots.length} COMPLETE`;
    const host=$('picrossLevelGrid');if(!host)return;
    const placed=new Map((area.slots||[]).map(slot=>[`${slot.x}:${slot.y}`,slot]));let html='';
    for(let y=0;y<3;y++)for(let x=0;x<5;x++){
      const slot=placed.get(`${x}:${y}`);if(!slot){html+='<div class="picross-empty-slot" aria-hidden="true"></div>';continue;}
      const puzzle=puzzleById.get(slot.resource_id),isDone=!!r.completed?.[slot.resource_id],label=core.stageNumber(selectedArea,Math.max(0,(Number(slot.stage_number)||1)-1));
      const preview=isDone?miniature(puzzle):'<span aria-hidden="true">?</span>';
      const name=puzzle?.kind==='tutorial'?String(puzzle.display_name||'Tutorial'):(isDone?String(puzzle?.display_name||'POKÉMON'):'HIDDEN');
      html+=`<button type="button" class="picross-level-card${isDone?' is-complete':''}" data-picross-puzzle="${slot.resource_id}"><b>${label}</b><div class="picross-level-preview">${preview}</div><span>${puzzle?.width||slot.width}×${puzzle?.height||slot.height} · ${name}</span></button>`;
    }
    host.innerHTML=html;
  }
  function cellSizeFor(puzzle){const w=Math.max(1,puzzle.width),h=Math.max(1,puzzle.height),vw=Math.max(300,Math.min(760,(typeof window!=='undefined'?window.innerWidth:480)-36));return Math.max(15,Math.min(27,Math.floor((vw-88)/w),Math.floor(480/h)));}
  function focusModeActive(){return !!$('picrossPuzzleView')?.classList?.contains('picross-focus-mode');}
  function applyBoardGeometry(){
    if(!board)return;const puzzle=board.puzzle,host=$('picrossBoard');if(!host)return;
    const focus=focusModeActive(),cell=focus?FOCUS_CELL_SIZES[focusZoomIndex]:cellSizeFor(puzzle),rowClue=Math.max(focus?64:48,Math.min(focus?112:84,Math.max(...puzzle.row_clues.map(c=>c.length),1)*(focus?16:14)+10)),columnClue=Math.max(focus?58:44,Math.max(...puzzle.column_clues.map(c=>c.length),1)*(focus?14:12)+8);
    host.style.setProperty('--picross-cell',`${cell}px`);host.style.setProperty('--picross-row-clue',`${rowClue}px`);
    host.style.gridTemplateColumns=`${rowClue}px repeat(${puzzle.width},${cell}px)`;
    host.style.gridTemplateRows=`${columnClue}px repeat(${puzzle.height},${cell}px)`;
    const label=$('picrossZoomLabel');if(label)label.textContent=`${cell}px`;const out=$('picrossZoomOut'),inc=$('picrossZoomIn');if(out)out.disabled=focusZoomIndex<=0;if(inc)inc.disabled=focusZoomIndex>=FOCUS_CELL_SIZES.length-1;
  }
  function resetBoardViewport(){const wrap=$('picrossBoardWrap');if(!wrap)return;const reset=()=>{wrap.scrollLeft=0;wrap.scrollTop=0;try{wrap.scrollTo?.({left:0,top:0,behavior:'auto'});}catch(_){}};reset();if(typeof requestAnimationFrame==='function')requestAnimationFrame(reset);setTimeout(reset,0);}
  function openFocusMode(){if(!board)return false;const view=$('picrossPuzzleView'),bar=$('picrossFocusBar');if(!view)return false;resetDrag();focusPreviousTool=tool==='x'?'x':'fill';view.classList.add('picross-focus-mode');if(bar)bar.hidden=false;const btn=$('picrossFocusBtn');if(btn)btn.setAttribute('aria-pressed','true');setTool('pan');applyBoardGeometry();resetBoardViewport();return true;}
  function closeFocusMode(){const view=$('picrossPuzzleView'),bar=$('picrossFocusBar'),wasFocus=focusModeActive();if(view)view.classList.remove('picross-focus-mode','picross-pan-mode');if(wasFocus)setTool(focusPreviousTool);if(bar)bar.hidden=true;const btn=$('picrossFocusBtn');if(btn)btn.setAttribute('aria-pressed','false');resetDrag();if(board){applyBoardGeometry();resetBoardViewport();}return true;}
  function changeFocusZoom(delta){if(!focusModeActive()||!board)return false;focusZoomIndex=Math.max(0,Math.min(FOCUS_CELL_SIZES.length-1,focusZoomIndex+Number(delta||0)));resetDrag();applyBoardGeometry();return true;}
  function renderBoard(){
    if(!board)return;const puzzle=board.puzzle,host=$('picrossBoard');if(!host)return;
    let html='<div class="picross-corner"></div>';
    for(let x=0;x<puzzle.width;x++)html+=`<div class="picross-column-clue" data-picross-col-clue="${x}" style="grid-column:${x+2};grid-row:1">${puzzle.column_clues[x].map(n=>`<span>${n}</span>`).join('')}</div>`;
    for(let y=0;y<puzzle.height;y++){
      html+=`<div class="picross-row-clue" data-picross-row-clue="${y}" style="grid-column:1;grid-row:${y+2}">${puzzle.row_clues[y].map(n=>`<span>${n}</span>`).join('')}</div>`;
      for(let x=0;x<puzzle.width;x++)html+=`<button type="button" class="picross-cell" aria-label="Row ${y+1}, column ${x+1}" data-picross-cell data-x="${x}" data-y="${y}" data-x5="${(x+1)%5===0&&x<puzzle.width-1}" data-y5="${(y+1)%5===0&&y<puzzle.height-1}" style="grid-column:${x+2};grid-row:${y+2}"></button>`;
    }
    host.innerHTML=html;applyBoardGeometry();renderBoardState();
  }
  function renderBoardState(){
    if(!board)return;
    document.querySelectorAll('#picrossBoard [data-picross-cell]').forEach(node=>{const x=Number(node.dataset.x),y=Number(node.dataset.y),mark=board.cells[y][x];node.classList.toggle('is-fill',mark==='fill');node.classList.toggle('is-x',mark==='x');});
    document.querySelectorAll('#picrossBoard [data-picross-row-clue]').forEach(node=>{const y=Number(node.dataset.picrossRowClue),done=core.resolvedCluesForLine(board.cells[y],board.puzzle.row_clues[y]);node.querySelectorAll('span').forEach((span,i)=>span.classList.toggle('is-resolved',!!done[i]));});
    document.querySelectorAll('#picrossBoard [data-picross-col-clue]').forEach(node=>{const x=Number(node.dataset.picrossColClue),line=board.cells.map(row=>row[x]),done=core.resolvedCluesForLine(line,board.puzzle.column_clues[x]);node.querySelectorAll('span').forEach((span,i)=>span.classList.toggle('is-resolved',!!done[i]));});
    if($('picrossMistakes'))$('picrossMistakes').textContent=String(board.mistakes||0);
    const undo=$('picrossUndo');if(undo)undo.disabled=!board.history.length||finished;
    const reset=$('picrossReset');if(reset)reset.disabled=finished;
    document.querySelectorAll('[data-picross-tool]').forEach(node=>{node.disabled=finished;});
  }
  function updateTimer(){if(board&&$('picrossTimer'))$('picrossTimer').textContent=core.formatTime(core.elapsedMs(board));}
  function startTimer(){stopTimer();updateTimer();timer=setInterval(updateTimer,250);}
  function stopTimer(){if(timer){clearInterval(timer);timer=null;}}
  function setTool(next){tool=next==='x'?'x':next==='pan'?'pan':'fill';const view=$('picrossPuzzleView');if(view)view.classList.toggle('picross-pan-mode',tool==='pan'&&focusModeActive());document.querySelectorAll('[data-picross-tool]').forEach(b=>b.classList.toggle('active',b.dataset.picrossTool===tool));}
  function startPuzzle(resourceId,{beginRun=true,replay=false}={}){
    closeFocusMode();
    const puzzle=puzzleById.get(String(resourceId));if(!puzzle)return false;const area=(data.areas||[]).find(a=>(a.slots||[]).some(s=>s.resource_id===puzzle.resource_id));if(area)selectedArea=Number(area.area)||0;
    const previous=arcadeRecord().completed?.[puzzle.resource_id],reviewCompleted=!!previous&&!replay;
    selectedPuzzleId=puzzle.resource_id;board=reviewCompleted?core.createSolvedBoard(puzzle,previous):core.createBoard(puzzle);finished=reviewCompleted;setTool('fill');setView('picrossPuzzleView');
    const label=stageLabel(area,puzzle.resource_id);if($('picrossStageLabel'))$('picrossStageLabel').textContent=label;if($('picrossPuzzleSize'))$('picrossPuzzleSize').textContent=`${puzzle.width}×${puzzle.height}`;
    if($('picrossBest'))$('picrossBest').textContent=previous?.timeMs?core.formatTime(previous.timeMs):'—';
    $('picrossSolvedReveal')?.remove();renderBoard();updateTimer();
    if(reviewCompleted){stopTimer();revealSolved({allowReplay:true});setStatus(`Completed: ${String(puzzle.display_name||'Picture')}`,true);setTimeout(()=>$('picrossSolvedReveal')?.scrollIntoView?.({block:'center',behavior:'smooth'}),40);return true;}
    setStatus(replay?'Replay started — this level stays completed.':'Drag across cells to mark them.');if(beginRun)session()?.beginRun?.('picross');startTimer();return true;
  }
  function flashMistake(node){if(!node)return;node.classList.remove('is-mistake');void node.offsetWidth;node.classList.add('is-mistake');setTimeout(()=>node.classList.remove('is-mistake'),320);try{navigator.vibrate?.(25);}catch(_){}setStatus('That square is empty — marked X instead.');}
  function markCell(node,mark,{render=true,complete=true}={}){
    if(!board||finished||!node)return null;const x=Number(node.dataset.x),y=Number(node.dataset.y),result=core.setMark(board,x,y,mark);if(!result.accepted)return result;if(result.mistake)flashMistake(node);if(render)renderBoardState();if(complete&&result.solved)completePuzzle();return result;
  }
  function cellNode(x,y){return $('picrossBoard')?.querySelector?.(`[data-picross-cell][data-x="${x}"][data-y="${y}"]`)||null;}
  function tapCell(node){
    if(!board||finished||!node||tool==='pan')return false;const x=Number(node.dataset.x),y=Number(node.dataset.y),current=board.cells[y][x],mark=current===tool?'blank':tool;return !!markCell(node,mark)?.accepted;
  }
  function applyDragCells(points){
    if(!board||finished||!Array.isArray(points))return false;let changed=false,solved=false;
    for(const point of points){const x=Number(point?.x),y=Number(point?.y),key=`${x}:${y}`;if(drag.visited.has(key))continue;drag.visited.add(key);const current=board.cells?.[y]?.[x];if(!core.dragMarkAllowed(current,drag.tool,drag.mark))continue;const node=cellNode(x,y);if(!node)continue;const result=markCell(node,drag.mark,{render:false,complete:false});if(result?.accepted)changed=true;if(result?.solved)solved=true;}
    if(changed)renderBoardState();if(solved&&!finished)completePuzzle();return changed;
  }
  function captureDragGeometry(){
    if(!board)return null;const xs=[],ys=[];
    for(let x=0;x<board.puzzle.width;x++){const r=cellNode(x,0)?.getBoundingClientRect?.();if(!r)return null;xs.push({min:r.left,max:r.right});}
    for(let y=0;y<board.puzzle.height;y++){const r=cellNode(0,y)?.getBoundingClientRect?.();if(!r)return null;ys.push({min:r.top,max:r.bottom});}
    return {xs,ys};
  }
  function resetDrag(){drag={active:false,pointerId:null,tool:null,mark:null,start:null,last:null,startClient:null,travel:0,tapThresholdPx:6,moved:false,geometry:null,visited:new Set()};}
  function beginDrag(e,node){
    if(!board||finished||!node||tool==='pan')return;e.preventDefault();const x=Number(node.dataset.x),y=Number(node.dataset.y),current=board.cells[y][x],selectedTool=tool;drag={active:true,pointerId:e.pointerId,tool:selectedTool,mark:current===selectedTool?'blank':selectedTool,start:{x,y},last:{x,y},startClient:{x:Number(e.clientX),y:Number(e.clientY)},travel:0,tapThresholdPx:6,moved:false,geometry:captureDragGeometry(),visited:new Set()};try{node.setPointerCapture?.(e.pointerId);}catch(_){}
  }
  function consumeDragSample(sample){
    if(!drag.active||!board||finished||!sample)return;const cx=Number(sample.clientX),cy=Number(sample.clientY);if(!Number.isFinite(cx)||!Number.isFinite(cy))return;
    if(drag.startClient){drag.travel=Math.max(drag.travel,Math.hypot(cx-drag.startClient.x,cy-drag.startClient.y));}
    if(drag.travel>=drag.tapThresholdPx&&!drag.moved){drag.moved=true;applyDragCells([drag.start]);}
    if(!drag.moved)return;const point=drag.geometry?core.gridCellAtPoint(drag.geometry.xs,drag.geometry.ys,cx,cy):null;if(!point||!drag.last)return;
    if(point.x===drag.last.x&&point.y===drag.last.y)return;applyDragCells(core.cellsBetween(drag.last.x,drag.last.y,point.x,point.y));drag.last=point;
  }
  function consumeDragEvent(e){
    let samples=[];try{samples=typeof e?.getCoalescedEvents==='function'?e.getCoalescedEvents():[];}catch(_){samples=[];}
    if(!Array.isArray(samples)||!samples.length)samples=[e];else{const last=samples[samples.length-1];if(Number(last?.clientX)!==Number(e?.clientX)||Number(last?.clientY)!==Number(e?.clientY))samples=[...samples,e];}
    for(const sample of samples)consumeDragSample(sample);
  }
  function moveDrag(e){
    if(!drag.active||e.pointerId!==drag.pointerId||!board||finished)return;e.preventDefault();consumeDragEvent(e);
  }
  function endDrag(e,cancelled=false){
    if(!drag.active||(e.pointerId!=null&&e.pointerId!==drag.pointerId))return;if(!cancelled&&e?.clientX!=null)consumeDragEvent(e);const wasTap=!cancelled&&drag.travel<drag.tapThresholdPx&&!drag.moved&&board&&!finished&&drag.start,point=drag.start;resetDrag();if(wasTap){const node=cellNode(point.x,point.y);if(node)tapCell(node);}
  }
  function undo(){if(!board||finished)return;core.undo(board);renderBoardState();setStatus('Last mark undone.');}
  function reset(){if(!board||finished)return;core.reset(board);renderBoardState();updateTimer();setStatus('Puzzle reset.');}
  function revealSolved({allowReplay=false}={}){
    const puzzle=board?.puzzle;if(!puzzle)return;let n=$('picrossSolvedReveal');if(!n){n=document.createElement('div');n.id='picrossSolvedReveal';n.className='picross-solved-reveal';$('picrossBoardWrap')?.after(n);}const name=String(puzzle.display_name||'Picture complete');n.innerHTML=`<b>PICTURE COMPLETE</b>${miniature(puzzle,true)}<strong>${name}</strong>${allowReplay?'<button type="button" class="picross-replay-button" data-picross-replay>REPLAY PUZZLE</button>':''}`;
  }
  function viewSolvedPicture(){
    if(!board||!finished)return false;setView('picrossPuzzleView');renderBoardState();revealSolved({allowReplay:true});setStatus(`Solved: ${String(board.puzzle.display_name||'Picture')}`,true);setTimeout(()=>$('picrossSolvedReveal')?.scrollIntoView?.({block:'center',behavior:'smooth'}),40);return true;
  }
  function completePuzzle(){
    if(!board||finished)return false;finished=true;stopTimer();closeFocusMode();renderBoardState();revealSolved({allowReplay:true});setStatus('Picture complete!',true);
    const puzzle=board.puzzle,r=arcadeRecord(),id=puzzle.resource_id,previous=r.completed?.[id]||null,elapsed=core.elapsedMs(board),firstClear=!previous,errorlessFirst=!previous||Number(previous.bestMistakes??Infinity)>0;
    r.completed=r.completed||{};r.bestTimesMs=r.bestTimesMs||{};r.completed[id]={area:selectedArea,timeMs:previous?.timeMs?Math.min(Number(previous.timeMs),elapsed):elapsed,bestMistakes:previous?.bestMistakes==null?board.mistakes:Math.min(Number(previous.bestMistakes),Number(board.mistakes||0)),completedAt:previous?.completedAt||Date.now()};
    r.bestTimesMs[id]=r.bestTimesMs[id]?Math.min(Number(r.bestTimesMs[id]),elapsed):elapsed;r.totalClears=Math.max(0,Number(r.totalClears)||0)+1;if(board.mistakes===0&&errorlessFirst)r.noMistakeClears=Math.max(0,Number(r.noMistakeClears)||0)+1;
    let award={coinsAwarded:0,itemAwarded:null};if(firstClear){const coins=core.firstClearCoins(puzzle);award=platform()?.awardRun?platform().awardRun({gameId:'picross',label:'Pokémon Picross',score:1,coins,dailyEligible:false}):{coinsAwarded:coins,itemAwarded:null};}
    save();const p=progress(),label=stageLabel(areaById.get(selectedArea),id),best=r.completed[id].timeMs;
    const review={title:'PUZZLE COMPLETE',mode:label,difficulty:`${puzzle.width}×${puzzle.height}`,metricLabel:'TIME',metricValue:core.formatTime(elapsed),stats:[{label:'Mistakes',value:String(board.mistakes)},{label:'Unique pictures',value:`${p.uniqueClears} / ${p.totalStages}`},{label:'Areas complete',value:`${p.areasCleared} / ${p.totalAreas}`}],pbs:[{label:'Best time',value:core.formatTime(best),isNew:firstClear||elapsed<=best}],rewards:[{label:'Lucky Coins',value:firstClear?String(award.coinsAwarded||0):'First clear already claimed'}]};
    setTimeout(()=>session()?.showResult?.('picross',{title:'PUZZLE COMPLETE',metricLabel:'TIME',metricValue:core.formatTime(elapsed),coinsAwarded:award.coinsAwarded||0,bestText:firstClear?'FIRST CLEAR':`BEST ${core.formatTime(best)}`,review,replayLabel:'VIEW PICTURE',onReplay:()=>viewSolvedPicture(),changeLabel:'LEVEL SELECT',onChange:()=>showLevels(selectedArea),onBack:()=>root.LuckyDexArcadeWorld?.backFromGame?.(true)}),280);
    return true;
  }
  function open(){opened=true;session()?.mount?.('picross',$('picrossGame'));showAreas();return true;}
  function close(){opened=false;stopTimer();closeFocusMode();endDrag({pointerId:null},true);board=null;finished=false;return true;}
  function wire(){
    if(typeof document==='undefined')return;
    document.addEventListener('click',e=>{const area=e.target.closest?.('[data-picross-area]');if(area){showLevels(area.dataset.picrossArea);return;}const level=e.target.closest?.('[data-picross-puzzle]');if(level){startPuzzle(level.dataset.picrossPuzzle);return;}const replay=e.target.closest?.('[data-picross-replay]');if(replay&&selectedPuzzleId){startPuzzle(selectedPuzzleId,{replay:true});return;}const t=e.target.closest?.('[data-picross-tool]');if(t&&!t.disabled){setTool(t.dataset.picrossTool);}});
    $('picrossBackAreas')?.addEventListener('click',showAreas);$('picrossBackLevels')?.addEventListener('click',()=>showLevels(selectedArea));$('picrossUndo')?.addEventListener('click',undo);$('picrossReset')?.addEventListener('click',reset);$('picrossFocusBtn')?.addEventListener('click',openFocusMode);$('picrossFocusClose')?.addEventListener('click',closeFocusMode);$('picrossZoomOut')?.addEventListener('click',()=>changeFocusZoom(-1));$('picrossZoomIn')?.addEventListener('click',()=>changeFocusZoom(1));
    $('picrossBoard')?.addEventListener('pointerdown',e=>{const node=e.target.closest?.('[data-picross-cell]');if(node)beginDrag(e,node);});
    document.addEventListener('pointermove',moveDrag,{passive:false});document.addEventListener('pointerup',endDrag);document.addEventListener('pointercancel',e=>endDrag(e,true));
  }
  if(typeof document!=='undefined')wire();
  root.LuckyDexPicross={open,close,showAreas,showLevels,startPuzzle,progress,isOpen:()=>opened};
})(typeof window!=='undefined'?window:globalThis);
