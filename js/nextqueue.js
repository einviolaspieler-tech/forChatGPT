import { CELL } from './config.js';
import { makePiece, getBlocks } from './tetromino.js';

export function drawNext(ctx, types){
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  types.slice(0,5).forEach((t,i)=>{
    const p = makePiece(t); p.x=0; p.y=0; p.rot=0;
    drawMini(ctx,p,8, i*60+8);
  });
}

export function drawHold(ctx, type){
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  if(!type) return; const p= makePiece(type); drawMini(ctx,p,8,8);
}

function drawMini(ctx,p,ox,oy){
  ctx.fillStyle = '#123'; ctx.fillRect(ox,oy,80,80);
  for(const [dx,dy] of getBlocks(p)){
    const x = ox + dx*16, y = oy + dy*16;
    ctx.fillStyle = p.color; ctx.fillRect(x,y,16,16);
    ctx.strokeStyle = '#000'; ctx.strokeRect(x+0.5,y+0.5,15,15);
  }
}
