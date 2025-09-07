export const COLS = 10;
export const ROWS = 22; // 20 + 2 hidden top
export const CELL = 36; // px per block (canvas size aligns)
export const TICK_MS = 1000/60; // frame tick
export const GRAVITY_BASE = 0.7; // cells per second
export const LOCK_DELAY_MS = 500; // after landing
export const NEXT_COUNT = 5;
export const GAUGE_MAX = 100;
export const GAUGE_PER_LINE = 8; // per cleared line
export const GAUGE_ITEM_INTERVAL = 4; // every 4th bag includes gauge item

export const KEY = {
  LEFT: 'KeyA', RIGHT:'KeyD', SOFT:'KeyS', HARD:'Space', HOLD:'ShiftLeft',
  ROT:'KeyW', ROT_CCW:'KeyQ', ROT_CW:'KeyE'
};

export const COLORS = {
  I:'#00f0f0', O:'#f0f000', T:'#a000f0', S:'#00f000', Z:'#f00000', J:'#0000f0', L:'#f0a000',
  G:'#65d1ff' // gauge item color
};

export const INPUT = {
  touch: {
    tapMs: 250,
    longPressMs: 450,
    swipeMin: 24,
    flickUpMin: 28
  }
};
