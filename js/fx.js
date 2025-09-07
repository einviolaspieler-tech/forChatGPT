export class FX{
  constructor(){
    this.cutinEl = document.getElementById('cutin');
    this.cutinImg = document.getElementById('cutinImg');
    this.gaugeFill = document.getElementById('gaugeFill');
  }
  setGaugeRatio(r){ this.gaugeFill.style.width = `${Math.floor(r*100)}%`; }
  cutin(src){
    this.cutinImg.src = src; this.cutinEl.classList.remove('hidden');
    setTimeout(()=>this.cutinEl.classList.add('hidden'), 900);
  }
  shakeCanvas(canvas, ms=200){
    const start=performance.now();
    const orig = canvas.style.transform;
    const raf=()=>{
      const t=performance.now()-start; if(t>ms){ canvas.style.transform=orig; return; }
      const dx=(Math.random()-0.5)*6, dy=(Math.random()-0.5)*6;
      canvas.style.transform=`translate(${dx}px,${dy}px)`; requestAnimationFrame(raf);
    }; raf();
  }
}
