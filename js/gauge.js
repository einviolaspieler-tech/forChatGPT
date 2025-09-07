import { GAUGE_MAX, GAUGE_PER_LINE } from './config.js';

export class Gauge{
  constructor(){ this.v=0; }
  addLines(n){ this.v = Math.min(GAUGE_MAX, this.v + GAUGE_PER_LINE*n); }
  canSpend(cost){ return this.v >= cost; }
  spend(cost){ if(this.canSpend(cost)){ this.v -= cost; return true; } return false; }
  ratio(){ return this.v/GAUGE_MAX; }
}
