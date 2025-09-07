import { KEY, INPUT } from './config.js';

export class Input{
  constructor(targetEl){
    this.state={left:false,right:false,soft:false,rot:false,rotCw:false,rotCcw:false,hard:false,hold:false};
    this._bindKeys();
    this._bindTouch(targetEl);
  }
  _bindKeys(){
    const on=(e,v)=>{
      switch(e.code){
        case KEY.LEFT: this.state.left=v; break;
        case KEY.RIGHT: this.state.right=v; break;
        case KEY.SOFT: this.state.soft=v; break;
        case KEY.HARD: this.state.hard=v; break;
        case KEY.HOLD: this.state.hold=v; break;
        case KEY.ROT: this.state.rot=v; break;
        case KEY.ROT_CW: this.state.rotCw=v; break;
        case KEY.ROT_CCW: this.state.rotCcw=v; break;
      }
    };
    addEventListener('keydown', e=>on(e,true));
    addEventListener('keyup', e=>on(e,false));
  }
  _bindTouch(el){
    let sx=0, sy=0, t0=0, pressed=false, moved=false, longTimer=null;
    const reset=()=>{ pressed=false; moved=false; clearTimeout(longTimer); longTimer=null; };
    el.addEventListener('touchstart', e=>{
      const t=e.changedTouches[0]; sx=t.clientX; sy=t.clientY; t0=performance.now(); pressed=true; moved=false;
      longTimer=setTimeout(()=>{ if(pressed){ this.state.hold=true; setTimeout(()=>this.state.hold=false,60);} }, INPUT.touch.longPressMs);
    },{passive:true});
    el.addEventListener('touchmove', e=>{
      if(!pressed) return; const t=e.changedTouches[0]; const dx=t.clientX-sx; const dy=t.clientY-sy; moved = Math.abs(dx)>8 || Math.abs(dy)>8;
      if(Math.abs(dx)>Math.abs(dy)){
        if(dx>INPUT.touch.swipeMin){ this.state.right=true; setTimeout(()=>this.state.right=false,60); sx=t.clientX; sy=t.clientY; }
        else if(dx<-INPUT.touch.swipeMin){ this.state.left=true; setTimeout(()=>this.state.left=false,60); sx=t.clientX; sy=t.clientY; }
      }else{
        if(dy>INPUT.touch.swipeMin){ this.state.soft=true; setTimeout(()=>this.state.soft=false,60); sy=t.clientY; }
      }
    },{passive:true});
    el.addEventListener('touchend', e=>{
      const t=e.changedTouches[0]; const dt=performance.now()-t0; const dy=t.clientY-sy;
      clearTimeout(longTimer);
      if(!moved){
        if(dt<INPUT.touch.tapMs){ // tap -> rotate
          this.state.rot=true; setTimeout(()=>this.state.rot=false,60);
        }
      }
      // flick up -> hard drop
      if(-dy>INPUT.touch.flickUpMin){ this.state.hard=true; setTimeout(()=>this.state.hard=false,60); }
      reset();
    },{passive:true});
  }
}
