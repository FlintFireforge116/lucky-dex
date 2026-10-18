(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.LuckyDexPicrossCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const MARKS=new Set(['blank','fill','x']);
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

  function cluesForLine(line){
    const values=Array.isArray(line)?line:String(line||'').split('');
    const clues=[];let run=0;
    for(const value of values){
      const filled=value===1||value==='1'||value===true||value==='fill';
      if(filled)run+=1;else if(run){clues.push(run);run=0;}
    }
    if(run)clues.push(run);
    return clues.length?clues:[0];
  }
  function cluesForRows(rows){return (rows||[]).map(cluesForLine);}
  function cluesForColumns(rows){
    const grid=(rows||[]).map(row=>String(row||''));
    const width=grid.reduce((m,row)=>Math.max(m,row.length),0),out=[];
    for(let x=0;x<width;x++)out.push(cluesForLine(grid.map(row=>row[x]||'0')));
    return out;
  }
  function normalizePuzzle(puzzle){
    const rows=Array.isArray(puzzle?.solution_rows)?puzzle.solution_rows.map(row=>String(row)):[];
    const height=Math.max(0,Math.trunc(Number(puzzle?.height)||rows.length));
    const width=Math.max(0,Math.trunc(Number(puzzle?.width)||(rows[0]?.length||0)));
    if(!height||!width||rows.length!==height||rows.some(row=>row.length!==width||/[^01]/.test(row)))throw new Error('Invalid Picross puzzle grid');
    return {...puzzle,width,height,solution_rows:rows,row_clues:Array.isArray(puzzle.row_clues)?puzzle.row_clues:cluesForRows(rows),column_clues:Array.isArray(puzzle.column_clues)?puzzle.column_clues:cluesForColumns(rows)};
  }
  function createBoard(puzzle,startedAt=Date.now()){
    const p=normalizePuzzle(puzzle);
    return {puzzle:p,cells:Array.from({length:p.height},()=>Array(p.width).fill('blank')),mistakes:0,history:[],startedAt:Number(startedAt)||0,completedAt:null};
  }
  function createSolvedBoard(puzzle,record={}){
    const p=normalizePuzzle(puzzle),completedAt=Number(record?.completedAt)||Date.now(),timeMs=Math.max(0,Number(record?.timeMs)||0);
    return {puzzle:p,cells:p.solution_rows.map(row=>[...row].map(value=>value==='1'?'fill':'x')),mistakes:Math.max(0,Number(record?.bestMistakes)||0),history:[],startedAt:completedAt-timeMs,completedAt};
  }
  function validCell(board,x,y){return !!board&&Number.isInteger(x)&&Number.isInteger(y)&&y>=0&&y<board.cells.length&&x>=0&&x<(board.cells[y]?.length||0);}
  function targetAt(board,x,y){return board?.puzzle?.solution_rows?.[y]?.[x]==='1'?'fill':'x';}
  function applyMark(board,x,y,tool='fill',at=Date.now()){
    x=Math.trunc(Number(x));y=Math.trunc(Number(y));
    if(!validCell(board,x,y))return {accepted:false,reason:'cell'};
    let requested=MARKS.has(tool)?tool:'fill';if(requested==='blank')requested='blank';
    const before=board.cells[y][x];let after=requested,mistake=false;
    if(requested!=='blank'&&before===requested)after='blank';
    if(requested==='fill'&&after==='fill'&&targetAt(board,x,y)!=='fill'){after='x';mistake=true;board.mistakes+=1;}
    if(before===after)return {accepted:false,reason:'unchanged',mistake:false};
    board.history.push({x,y,before,after,mistake,at:Number(at)||0});
    board.cells[y][x]=after;
    if(isSolved(board)&&board.completedAt==null)board.completedAt=Number(at)||Date.now();
    else if(!isSolved(board))board.completedAt=null;
    return {accepted:true,mistake,before,after,solved:!!board.completedAt};
  }
  function setMark(board,x,y,mark='fill',at=Date.now()){
    if(!validCell(board,Math.trunc(Number(x)),Math.trunc(Number(y))))return {accepted:false,reason:'cell'};
    const current=board.cells[Math.trunc(Number(y))][Math.trunc(Number(x))];
    if(current===mark)return {accepted:false,reason:'unchanged',mistake:false};
    return applyMark(board,x,y,mark,at);
  }
  function undo(board){
    if(!board?.history?.length)return false;
    const entry=board.history.pop();board.cells[entry.y][entry.x]=entry.before;
    if(entry.mistake)board.mistakes=Math.max(0,Number(board.mistakes||0)-1);
    board.completedAt=null;return true;
  }
  function reset(board,startedAt=Date.now()){
    if(!board)return false;
    board.cells=Array.from({length:board.puzzle.height},()=>Array(board.puzzle.width).fill('blank'));
    board.mistakes=0;board.history=[];board.startedAt=Number(startedAt)||Date.now();board.completedAt=null;return true;
  }
  function isSolved(board){
    if(!board?.puzzle)return false;
    for(let y=0;y<board.puzzle.height;y++)for(let x=0;x<board.puzzle.width;x++){
      const filled=board.cells[y][x]==='fill',required=board.puzzle.solution_rows[y][x]==='1';
      if(filled!==required)return false;
    }
    return true;
  }
  function rowSolved(board,y){
    if(!board?.puzzle||y<0||y>=board.puzzle.height)return false;
    for(let x=0;x<board.puzzle.width;x++)if((board.cells[y][x]==='fill')!==(board.puzzle.solution_rows[y][x]==='1'))return false;
    return true;
  }
  function columnSolved(board,x){
    if(!board?.puzzle||x<0||x>=board.puzzle.width)return false;
    for(let y=0;y<board.puzzle.height;y++)if((board.cells[y][x]==='fill')!==(board.puzzle.solution_rows[y][x]==='1'))return false;
    return true;
  }
  function resolvedCluesForLine(cells,clues){
    const line=Array.isArray(cells)?cells.map(v=>MARKS.has(v)?v:'blank'):[];
    const raw=Array.isArray(clues)?clues.map(n=>Math.max(0,Math.trunc(Number(n)||0))):[];
    if(raw.length===1&&raw[0]===0)return [line.length>0&&line.every(v=>v==='x')];
    const values=raw.filter(n=>n>0);
    if(!values.length)return raw.map(()=>false);
    const starts=[],placements=[];
    const suffix=[];let total=0;
    for(let i=values.length-1;i>=0;i--){total+=values[i];if(i<values.length-1)total+=1;suffix[i]=total;}
    function walk(i,minStart){
      if(i>=values.length){
        const covered=Array(line.length).fill(false);
        for(let k=0;k<values.length;k++)for(let p=starts[k];p<starts[k]+values[k];p++)covered[p]=true;
        for(let p=0;p<line.length;p++){if(line[p]==='fill'&&!covered[p])return;if(line[p]==='x'&&covered[p])return;}
        placements.push(starts.slice());return;
      }
      const maxStart=line.length-suffix[i];
      for(let start=minStart;start<=maxStart;start++){
        let blocked=false;for(let p=start;p<start+values[i];p++)if(line[p]==='x'){blocked=true;break;}
        if(blocked)continue;
        starts[i]=start;walk(i+1,start+values[i]+1);
      }
    }
    walk(0,0);
    if(!placements.length)return raw.map(()=>false);
    return values.map((len,i)=>{
      const start=placements[0][i];
      if(!placements.every(p=>p[i]===start))return false;
      for(let p=start;p<start+len;p++)if(line[p]!=='fill')return false;
      return true;
    });
  }
  function elapsedMs(board,now=Date.now()){
    if(!board)return 0;const end=board.completedAt==null?Number(now)||Date.now():Number(board.completedAt);return Math.max(0,end-(Number(board.startedAt)||0));
  }
  function progressSummary(areas,record){
    const completed=record?.completed&&typeof record.completed==='object'?record.completed:{};
    const list=Array.isArray(areas)?areas:[];let areasCleared=0,totalStages=0;
    for(const area of list){const slots=Array.isArray(area?.slots)?area.slots:[];totalStages+=slots.length;if(slots.length&&slots.every(s=>completed[s.resource_id]))areasCleared++;}
    return {uniqueClears:Object.keys(completed).filter(key=>completed[key]).length,totalStages,areasCleared,totalAreas:list.length};
  }
  function firstClearCoins(puzzle){
    const cells=Math.max(0,Number(puzzle?.width)||0)*Math.max(0,Number(puzzle?.height)||0);
    if(cells<=25)return 60;if(cells<=100)return 150;if(cells<=225)return 300;return 450;
  }
  function cellsBetween(x0,y0,x1,y1){
    x0=Math.trunc(Number(x0));y0=Math.trunc(Number(y0));x1=Math.trunc(Number(x1));y1=Math.trunc(Number(y1));
    const out=[],dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let err=dx+dy,x=x0,y=y0;
    while(true){out.push({x,y});if(x===x1&&y===y1)break;const e2=2*err;if(e2>=dy){err+=dy;x+=sx;}if(e2<=dx){err+=dx;y+=sy;}}
    return out;
  }
  function dragMarkAllowed(current,selectedTool,dragMark){
    const cell=MARKS.has(current)?current:'blank',tool=selectedTool==='x'?'x':'fill',mark=MARKS.has(dragMark)?dragMark:tool;
    if(mark==='blank')return cell===tool;
    return mark===tool&&cell==='blank';
  }

  function gridCellAtPoint(xSegments,ySegments,clientX,clientY){
    const xs=Array.isArray(xSegments)?xSegments:[],ys=Array.isArray(ySegments)?ySegments:[];
    const px=Number(clientX),py=Number(clientY);if(!Number.isFinite(px)||!Number.isFinite(py))return null;
    const find=(segments,value)=>{for(let i=0;i<segments.length;i++){const min=Number(segments[i]?.min),max=Number(segments[i]?.max);if(Number.isFinite(min)&&Number.isFinite(max)&&value>=min&&value<=max)return i;}return -1;};
    const x=find(xs,px),y=find(ys,py);return x<0||y<0?null:{x,y};
  }
  function formatTime(ms){const total=Math.max(0,Math.round((Number(ms)||0)/1000));const min=Math.floor(total/60),sec=total%60;return `${min}:${String(sec).padStart(2,'0')}`;}
  function stageNumber(area,slotIndex){return `S${String(Number(area)||0).padStart(2,'0')}-${String(Number(slotIndex)+1).padStart(2,'0')}`;}

  return {MARKS,clamp,cluesForLine,cluesForRows,cluesForColumns,normalizePuzzle,createBoard,createSolvedBoard,applyMark,setMark,undo,reset,isSolved,rowSolved,columnSolved,resolvedCluesForLine,elapsedMs,progressSummary,firstClearCoins,cellsBetween,dragMarkAllowed,gridCellAtPoint,formatTime,stageNumber};
});
