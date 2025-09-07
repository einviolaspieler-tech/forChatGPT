export class Hold{
  constructor(){ this.type=null; this.locked=false; }
  can(){ return !this.locked; }
  use(currentType){
    if(!this.can()) return { swapped:false, outType: currentType };
    const prev=this.type; this.type=currentType; this.locked=true;
    return { swapped:true, outType: prev };
  }
  releaseLock(){ this.locked=false; }
}
