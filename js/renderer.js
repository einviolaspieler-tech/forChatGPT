import { CELL, COLS, ROWS, COLORS } from './config.js';
import { getBlocks } from './tetromino.js';

export class Renderer{
  constructor(canvas){
    this.canvas=canvas; this.ctx=canvas.getContext('2d');
    this.scale=1; this._fit(); addEventListener('resize',()=>this._fit());
  }
  _fit(){
    // keep aspect by CSS; canvas internal pixels fixed by HTML attrs
  }
  clear(){ this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height); }
  drawBoard(board){
    const ctx=this.ctx;
    for(let y=2;y<ROWS;y++){
      for(let x=0;x<COLS;x++){
        const t=board.grid[y][x];
        if(t){ this._cell(x,y-2, COLORS[t]||'#888'); }
      }
    }
  }
  drawPiece(piece){
    const ctx=this.ctx;
    const gy = this.api.ghostY(piece);
    // ghost
    this._blocks(piece, (x,y)=> this._cell(x,y-2,'#1f3347', true, 0.5, gy));
    // piece
    this._blocks(piece, (x,y)=> this._cell(x,y-2, piece.color));
  }
  _blocks(piece, fn){ for(const [dx,dy] of getBlocks(piece)){ fn(piece.x+dx, piece.y+dy); } }
  _cell(x,y,color,ghost=false,alpha=1){
    const ctx=this.ctx; const px=x*CELL, py=y*CELL; ctx.save(); ctx.globalAlpha=alpha; ctx.fillStyle=color; ctx.fillRect(px,py,CELL,CELL); ctx.globalAlpha=1;
    ctx.strokeStyle='#000'; ctx.strokeRect(px+0.5,py+0.5,CELL-1,CELL-1);
  }
  attachAPI(api){ this.api=api; }
}
