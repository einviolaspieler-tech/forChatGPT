// ごく簡易なCPU（Lv1）。今後ヒューリスティックを強化/速度差/ミス率導入予定。
export class CPU{
  constructor(level=1){ this.level=level; this.delay=260 - level*20; this._timer=0; }
  step(dt, api){
    this._timer += dt; if(this._timer < this.delay) return;
    this._timer=0;
    const s = api.sense(); // {canLeft,canRight,canRot,canSoft,canHard, heightMap}
    // naive: try rotate toward fitting, prefer lower height columns
    if(s.canRot && Math.random()<0.3) api.input('rot');
    else if(s.prefDir<0 && s.canLeft) api.input('left');
    else if(s.prefDir>0 && s.canRight) api.input('right');
    else if(s.canHard) api.input('hard');
    else if(s.canSoft) api.input('soft');
  }
}
