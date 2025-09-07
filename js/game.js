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

// === Player state ===
let pBoard, bag, hold, gauge, cur, nexts, gravity, lockT, over, lastT=0;
let character = CHARACTERS[ui.char.value];
const input = new Input(canvasP1);

// === CPU state (完全分離) ===
let cBoard, cBag, cCur, cGravity, cLockT, cpu;

function newGame(){
  // Player
  pBoard = new Board();
  bag = new Bag(); hold = new Hold(); gauge = new Gauge();
  cur = makePiece(bag.next()); nexts = bag.peek(NEXT_COUNT);
  gravity = GRAVITY_BASE; lockT=0; over=false;

  // CPU
  cBoard = new Board();
  cBag = new Bag();
  cCur = makePiece(cBag.next());
  cGravity = GRAVITY_BASE * 0.9; // CPUはやや遅めに
  cLockT = 0;
  cpu = new CPU(1);

  drawNext(ui.next, nexts);
  drawHold(ui.hold, hold.type);
  fx.setGaugeRatio(gauge.ratio());
  ui.status.textContent = '';

  loop(performance.now());
}

// ===== Player helpers =====
function spawn(){
  cur = makePiece(bag.next());
  nexts = bag.peek(NEXT_COUNT);
  drawNext(ui.next, nexts);
  hold.releaseLock();
  if(pBoard.collides(cur)){ over=true; ui.status.textContent='GAME OVER'; }
}
function tryMove(dx,dy){
  const p={...cur, x:cur.x+dx, y:cur.y+dy};
  if(!pBoard.collides(p)){ cur=p; return true; }
  return false;
}
function tryRotate(dir){
  const p=rotated(cur, dir);
  if(!pBoard.collides(p)){ cur=p; return true; }
  return false;
}
function hardDrop(){ while(tryMove(0,1)); lockNow(); }
function softDrop(){ tryMove(0,1); }
function holdSwap(){
  const { swapped, outType } = hold.use(cur.type);
  if(!swapped) return;
  if(outType){ cur = makePiece(outType); }
  else { spawn(); }
  drawHold(ui.hold, hold.type);
}
function lockNow(){
  pBoard.place(cur);
  const cleared = pBoard.clearLines();
  if(cleared>0) gauge.addLines(cleared);
  fx.setGaugeRatio(gauge.ratio());
  spawn();
}

// ===== CPU helpers =====
function cSpawn(){
  cCur = makePiece(cBag.next());
  if(cBoard.collides(cCur)){ /* 将来: プレイヤー勝利演出 */ }
}
function cTryMove(dx,dy){
  const p={...cCur, x:cCur.x+dx, y:cCur.y+dy};
  if(!cBoard.collides(p)){ cCur=p; return true; }
  return false;
}
function cTryRotate(dir){
  const p=rotated(cCur, dir);
  if(!cBoard.collides(p)){ cCur=p; return true; }
  return false;
}
function cHardDrop(){ while(cTryMove(0,1)); cLockNow(); }
function cSoftDrop(){ cTryMove(0,1); }
function cLockNow(){
  cBoard.place(cCur);
  cBoard.clearLines(); // v1: ゲージ等は未使用
  cSpawn();
}
function cPrefColumnDir(){
  const h = Array(COLS).fill(ROWS);
  for(let y=0;y<ROWS;y++){
    for(let x=0;x<COLS;x++){
      if(cBoard.grid[y][x] && h[x]===ROWS) h[x]=y;
    }
  }
  const min = Math.min(...h);
  const mid = cCur.x;
  const bestIdx = h.indexOf(min);
  return Math.sign(bestIdx - mid);
}
function cSense(){
  return {
    canLeft: !cBoard.collides({...cCur,x:cCur.x-1}),
    canRight: !cBoard.collides({...cCur,x:cCur.x+1}),
    canRot: !cBoard.collides(rotated(cCur,1)),
    canSoft: !cBoard.collides({...cCur,y:cCur.y+1}),
    canHard: true,
    prefDir: cPrefColumnDir(),
  };
}

// ===== Main update/render loop =====
function update(dt){
  if(over) return;

  // --- Player input ---
  if(input.state.left) { tryMove(-1,0); input.state.left=false; }
  if(input.state.right){ tryMove(1,0); input.state.right=false; }
  if(input.state.rot||input.state.rotCw){ tryRotate(1); input.state.rot=input.state.rotCw=false; }
  if(input.state.rotCcw){ tryRotate(-1); input.state.rotCcw=false; }
  if(input.state.soft){ softDrop(); input.state.soft=false; }
  if(input.state.hard){ hardDrop(); input.state.hard=false; }
  if(input.state.hold){ holdSwap(); input.state.hold=false; }

  // --- Player gravity & lock ---
  cur._gy = (cur._gy||0) + (dt/1000)*gravity;
  while(cur._gy>=1){
    if(!tryMove(0,1)){
      lockT += dt;
      if(lockT>LOCK_DELAY_MS){ lockNow(); lockT=0; }
      break;
    }else{
      cur._gy--; lockT=0;
    }
  }

  // --- CPU decision (独立行動) ---
  cpu.step(dt,{
    sense: cSense,
    act: (k)=>{
      if(k==='left') cTryMove(-1,0);
      else if(k==='right') cTryMove(1,0);
      else if(k==='rot') cTryRotate(1);
      else if(k==='soft') cSoftDrop();
      else if(k==='hard') cHardDrop();
    }
  });

  // --- CPU gravity & lock ---
  cCur._gy = (cCur._gy||0) + (dt/1000)*cGravity;
  while(cCur._gy>=1){
    if(!cTryMove(0,1)){
      cLockT += dt;
      if(cLockT>LOCK_DELAY_MS){ cLockNow(); cLockT=0; }
      break;
    }else{
      cCur._gy--; cLockT=0;
    }
  }
}

function render(){
  r1.clear(); r1.drawBoard(pBoard); r1.drawPiece(cur);
  r2.clear(); r2.drawBoard(cBoard); r2.drawPiece(cCur);
}

function loop(t){
  const dt = t - (lastT||t);
  lastT=t;
  update(dt);
  render();
  if(!over) requestAnimationFrame(loop);
}

// ===== UI =====
ui.start.addEventListener('click', newGame);
ui.special.addEventListener('click', ()=>{
  const char = CHARACTERS[ui.char.value];
  const stage = gauge.v>=char.special.cost[2]?3 : gauge.v>=char.special.cost[1]?2 : gauge.v>=char.special.cost[0]?1 : 0;
  if(stage===0) return;
  const ok = runSpecial(char.special.id, stage, {
    fxCutin:(id)=>fx.cutin(`./assets/images/characters/cutin03.png`),
    fxShake:(ms)=>fx.shakeCanvas(canvasP1, ms),
    playSE:()=>{},
    clearBottomLines:(n)=>{
      for(let k=0;k<n;k++){
        let y = findLowestFilledRow(pBoard); if(y<0) break;
        pBoard.grid.splice(y,1); pBoard.grid.unshift(Array(COLS).fill(null));
      }
    }
  });
  if(ok){
    const cost = char.special.cost[stage-1];
    gauge.spend(cost);
    fx.setGaugeRatio(gauge.ratio());
  }
});

function findLowestFilledRow(board){
  for(let y=ROWS-1;y>=0;y--){ if(board.grid[y].some(c=>!!c)) return y; } return -1;
}

// 初期メッセージ
ui.status.textContent = 'キャラを選んでStart！';
