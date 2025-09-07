import { rnd } from './math.js';
import { GAUGE_ITEM_INTERVAL } from './config.js';

const BASE = ['I','O','T','S','Z','J','L'];

export class Bag{
  constructor(){ this.count=0; this.pool=[]; }
  refill(){
    const arr = BASE.slice();
    // every GAUGE_ITEM_INTERVAL bags, inject one 'G' piece (gauge item)
    this.count++;
    if(this.count % GAUGE_ITEM_INTERVAL === 0) arr.splice(rnd(arr.length+1),0,'G');
    // shuffle
    for(let i=arr.length-1;i>0;i--){ const j=rnd(i+1); [arr[i],arr[j]]=[arr[j],arr[i]]; }
    this.pool.push(...arr);
  }
  next(){ if(this.pool.length===0) this.refill(); return this.pool.shift(); }
  peek(n=5){ while(this.pool.length<n) this.refill(); return this.pool.slice(0,n); }
}
