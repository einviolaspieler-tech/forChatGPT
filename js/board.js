import { COLS, ROWS, COLORS, LOCK_DELAY_MS } from './config.js';
import { getBlocks } from './tetromino.js';

export class Board{
  constructor(){
    this.grid = Array.from({length:ROWS},()=>Array(COLS).fill(null));
    this.lockTimer = 0;
  }
  clone(){
    const b=new Board(); b.grid=this.grid.map(r=>r.slice()); return b;
  }
  inside(x,y){ return x>=0 && x<COLS && y>=0 && y<ROWS; }
  collides(piece){
    for(const [dx,dy] of getBlocks(piece)){
      const x = piece.x + dx, y = piece.y + dy;
      if(!this.inside(x,y) || this.grid[y][x]) return true;
    }
    return false;
  }
  place(piece){
    for(const [dx,dy] of getBlocks(piece)){
      const x = piece.x + dx, y = piece.y + dy;
      if(y>=0) this.grid[y][x] = piece.type;
    }
  }
  clearLines(){
    let cleared=0;
    for(let y=ROWS-1;y>=0;y--){
      if(this.grid[y].every(c=>!!c)){
        this.grid.splice(y,1);
        this.grid.unshift(Array(COLS).fill(null));
        cleared++; y++;
      }
    }
    return cleared;
  }
  ghostY(piece){
    const p={...piece};
    while(!this.collides({...p, y:p.y+1})) p.y++;
    return p.y;
  }
}
