// CPUは「sense()で状況を取得」→「act('left'|'right'|'rot'|'soft'|'hard')で自分のミノを操作」
// ※プレイヤーの入力には一切触れません
export class CPU{
  constructor(level=1){
    this.level = level;
    this.delay = 260 - level*20; // 行動間隔ms（レベルで調整）
    this._timer = 0;
  }
  step(dt, api){
    this._timer += dt;
    if(this._timer < this.delay) return;
    this._timer = 0;

    const s = api.sense(); // {canLeft,canRight,canRot,canSoft,canHard,prefDir}
    if(s.canRot && Math.random()<0.3) api.act('rot');
    else if(s.prefDir<0 && s.canLeft) api.act('left');
    else if(s.prefDir>0 && s.canRight) api.act('right');
    else if(s.canHard) api.act('hard');
    else if(s.canSoft) api.act('soft');
  }
}
