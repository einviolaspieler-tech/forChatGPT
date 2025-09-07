export const COLS = 10;
export const ROWS = 22; // 20 + 2 hidden top
export const CELL = 24; // ↓ 36→24 に縮小
export const TICK_MS = 1000/60;
export const GRAVITY_BASE = 0.7;
export const LOCK_DELAY_MS = 500;
export const NEXT_COUNT = 5;
export const GAUGE_MAX = 100;
export const GAUGE_PER_LINE = 8;
export const GAUGE_ITEM_INTERVAL = 4;

export const KEY = {
  LEFT: 'KeyA', RIGHT:'KeyD', SOFT:'KeyS', HARD:'Space', HOLD:'ShiftLeft',
  ROT:'KeyW', ROT_CCW:'KeyQ', ROT_CW:'KeyE'
};

export const COLORS = {
  I:'#00f0f0', O:'#f0f000', T:'#a000f0', S:'#00f000', Z:'#f00000', J:'#0000f0', L:'#f0a000',
  G:'#65d1ff'
};

export const INPUT = {
  touch: { tapMs: 250, longPressMs: 450, swipeMin: 24, flickUpMin: 28 }
};
