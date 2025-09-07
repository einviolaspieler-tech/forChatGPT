// 将来のオンライン対戦用抽象IF。今は未実装でローカルCPUのみ。
export class NetIF{
  constructor(){ this.connected=false; }
  createRoom(code){ /* TODO: WebRTC/WS */ }
  joinRoom(code){ /* TODO */ }
  sendState(state){ /* TODO */ }
  onState(cb){ this._onState=cb; }
}
