// 必殺技の効果本体。段階(1..3)とIDで分岐。ここではサンプル実装のみ。
// 効果例：
//  - blade: 盤面下から2/4/6段のラインを即時クリア（自陣整地）
//  - flare: N段分のソフトドロップ速度大幅UP（一定時間）
//  - aqua: 直近のホールド/ロックディレイを一時的に緩和
//  - nova: 直後の3ミノをT化（上級者向け）
//  - gaia: ガベージ抵抗（対戦時。CPU実装段階では演出のみ）

export function runSpecial(id, level, api){
  switch(id){
    case 'blade': return blade(level, api);
    default: return false;
  }
}

function blade(level, api){
  const lines = level===1?2: level===2?4:6;
  api.fxCutin('blade');
  api.fxShake(250);
  api.playSE('special');
  // 下から指定段クリア（固有ロジック）
  api.clearBottomLines(lines);
  return true;
}
