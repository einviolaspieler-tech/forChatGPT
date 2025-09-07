import { COLS, ROWS, GRAVITY_BASE, LOCK_DELAY_MS, NEXT_COUNT } from './config.js';
import { makePiece, rotated } from './tetromino.js';
import { Board } from './board.js';
import { Bag } from './bag.js';
import { Hold } from './hold.js';
import { Gauge } from './gauge.js';
import { Renderer } from './renderer.js';
import { Input } from './input.js';
import { drawNext, drawHold } from './nextqueue.js';
import { CHARACTERS } from './characters.js';
import { runSpecial } from './specials.js';
import { FX } from './fx.js';
import { CPU } from './ai.js';

const ui = {
  start: document.getElementById('btnStart'),
  special: document.getElementById('btnSpecial'),
  char: document.getElementById('charSelect'),
  status: document.getElementById('status'),
  next: document.getElementById('nextCanvas').getContext('2d'),
  hold: document.getElementById('holdCanvas').getContext('2d'),
  gaugeFill: document.getElementById('gaugeFill'),
};

const canvasP1 = document.getElementById('canvasP1');
const canvasCPU = document.getElementById('canvasCPU');
const r1 = new Renderer(canvasP1);
const r2 = new Renderer(canvasCPU);
const fx = new FX();

r1.attachAPI({ ghostY:(p)=>pBoard.ghostY(p) });
r2.attachAPI({ ghostY:(p)=>cBoard.ghostY(p) });

let pBoard, cBoard, bag, hold, gauge, cur, nexts, gravity, lockT, over, cpu, lastT=0;
let character = CHARACTERS[ui.char.value];
const input = new Input(canvasP1);

function newGame(){
  pBoard = new Board(); cBoard = new Board();
  bag = new Bag(); hold = new Hold(); gauge = new Gauge();
  cur = makePiece(bag.next()); nexts = bag.peek(NEXT_COUNT);
  gravity = GRAVITY_BASE; lockT=0; over=false;
  cpu = new CPU(1);
  drawNext(ui.next, nexts); drawHold(ui.hold, hold.type); fx.setGaugeRatio(gauge.ratio());
  ui.status.textContent = '';
  loop(performance.now());
}

function spawn(){ cur = makePiece(bag.next()); nexts = bag.peek(NEXT_COUNT); drawNext(ui.next, nexts); hold.releaseLock(); if(pBoard.collides(cur)){ over=true; ui.status.textContent='GAME OVER'; } }

function tryMove(dx,dy){ const p={...cur, x:cur.x+dx, y:cur.y+dy}; if(!pBoard.collides(p)){ cur=p; return true;} return false; }
function tryRotate(dir){ const p=rotated(cur, dir); if(!pBoard.collides(p)){ cur=p; return true;} return false; }
function hardDrop(){ while(tryMove(0,1)); lockNow(); }
function softDrop(){ tryMove(0,1); }
function holdSwap(){ const { swapped, outType } = hold.use(cur.type); if(!swapped) return; if(outType){ cur = makePiece(outType);} else { spawn(); } drawHold(ui.hold, hold.type); }

function lockNow(){
  pBoard.place(cur); const cleared = pBoard.clearLines();
  if(cleared>0) gauge.addLines(cleared);
  fx.setGaugeRatio(gauge.ratio());
  spawn();
}

function sense(){
  return {
    canLeft: !pBoard.collides({...cur,x:cur.x-1}),
    canRight: !pBoard.collides({...cur,x:cur.x+1}),
    canRot: !pBoard.collides(rotated(cur,1)),
    canSoft: !pBoard.collides({...cur,y:cur.y+1}),
    canHard: true,
    prefDir: prefColumnDir(),
  };
}
function prefColumnDir(){ // choose direction toward lower columns naive
  const h = Array(COLS).fill(ROWS);
  for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) if(pBoard.grid[y][x] && h[x]===ROWS) h[x]=y;
  const min = Math.min(...h); const mid=cur.x; let bestIdx = h.indexOf(min); return Math.sign(bestIdx - mid);
}

function update(dt){
  if(over) return;
  // input
  if(input.state.left) { tryMove(-1,0); input.state.left=false; }
  if(input.state.right){ tryMove(1,0); input.state.right=false; }
  if(input.state.rot||input.state.rotCw){ tryRotate(1); input.state.rot=input.state.rotCw=false; }
  if(input.state.rotCcw){ tryRotate(-1); input.state.rotCcw=false; }
  if(input.state.soft){ softDrop(); input.state.soft=false; }
  if(input.state.hard){ hardDrop(); input.state.hard=false; }
  if(input.state.hold){ holdSwap(); input.state.hold=false; }

  // gravity
  cur._gy = (cur._gy||0) + (dt/1000)*gravity; while(cur._gy>=1){ if(!tryMove(0,1)){ lockT += dt; if(lockT>LOCK_DELAY_MS){ lockNow(); lockT=0; } break; } else { cur._gy--; lockT=0; } }

  // CPU simple step
  cpu.step(dt,{ sense, input:(k)=>{ input.state[{left:'left',right:'right',soft:'soft',hard:'hard',rot:'rot'}[k]] = true; } });
}

function render(){
  r1.clear(); r1.drawBoard(pBoard); r1.drawPiece(cur);
  r2.clear(); r2.drawBoard(cBoard); // CPU盤はv1では停止中（将来対戦/同期用）
}

function loop(t){
  const dt = t - (lastT||t); lastT=t; update(dt); render(); if(!over) requestAnimationFrame(loop);
}

ui.start.addEventListener('click', newGame);
ui.special.addEventListener('click', ()=>{
  const char = CHARACTERS[ui.char.value];
  const stage = gauge.v>=char.special.cost[2]?3 : gauge.v>=char.special.cost[1]?2 : gauge.v>=char.special.cost[0]?1 : 0;
  if(stage===0) return;
  const ok = runSpecial(char.special.id, stage, {
    fxCutin:(id)=>fx.cutin(`./assets/images/characters/cutin03.png`),
    fxShake:(ms)=>fx.shakeCanvas(canvasP1, ms),
    playSE:()=>{},
    clearBottomLines:(n)=>{ // bottom clear
      for(let k=0;k<n;k++){
        // find lowest non-empty row; if none, add flat clear
        let y = findLowestFilledRow(pBoard); if(y<0) break;
        pBoard.grid.splice(y,1); pBoard.grid.unshift(Array(COLS).fill(null));
      }
    }
  });
  if(ok){
    // spend minimal cost for that stage
    const cost = char.special.cost[stage-1]; gauge.spend(cost); fx.setGaugeRatio(gauge.ratio());
  }
});

function findLowestFilledRow(board){
  for(let y=ROWS-1;y>=0;y--){ if(board.grid[y].some(c=>!!c)) return y; } return -1;
}

// Default boot
ui.status.textContent = 'キャラを選んでStart！';
