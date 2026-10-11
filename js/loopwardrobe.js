/* Loop Python wardrobe — Canvas 2D runtime. No browser dependencies. */
(function(global){
 'use strict';
 const TAU=Math.PI*2, P=(x,y)=>({x,y}), ease=x=>x*x*(3-2*x);
 const GROUP={torso:'upper','upper-arm':'upper',forearm:'upper',palm:'upper',thigh:'lower',shin:'lower',shoe:'shoes'};
 const PARTS=['head','torso','tail','upper-arm','forearm','thigh','shin','shoe','palm'];
 function stamp(g,p,x,y,w,h,ax=.5,ay=.5,angle=0,dark=false){g.save();g.translate(x,y);g.rotate(angle);if(dark)g.filter='brightness(0.84)';if(p.flipX){g.scale(-1,1);g.drawImage(p.image,-(1-ax)*w,-ay*h,w,h)}else g.drawImage(p.image,-ax*w,-ay*h,w,h);g.restore()}
 function opposite(A){const R={...A};for(const n of ['upper-arm','forearm','palm','thigh','shin','shoe']){const p=A[n];R[n]={...p,flipX:true,anchors:p.anchors?[1-p.anchors[0],p.anchors[1],1-p.anchors[2],p.anchors[3]]:undefined}}return R}
 function bone(g,p,a,b,width,dark=false){const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),[ax,ay,bx,by]=p.anchors||[.5,.1,.5,.9],sx=width*(bx-ax),height=Math.sqrt(Math.max(1,len*len-sx*sx))/(by-ay),angle=Math.atan2(dy,dx)-Math.atan2(height*(by-ay),sx);stamp(g,p,a.x,a.y,width,height,ax,ay,angle,dark)}
 function knee(hip,ankle,bend,L1=49,L2=49){const dx=ankle.x-hip.x,dy=ankle.y-hip.y,D=Math.max(.1,Math.hypot(dx,dy)),d=Math.min(D,L1+L2-.01),a=(L1*L1-L2*L2+d*d)/(2*d),h=Math.sqrt(Math.max(0,L1*L1-a*a));return P(hip.x+dx/D*a+bend*(-dy/D)*h,hip.y+dy/D*a+bend*(dx/D)*h)}
 function gait(u){u=(u%1+1)%1;if(u<.5)return{travel:1-4*u,lift:0,stance:true};const t=(u-.5)*2;return{travel:-1+2*t,lift:Math.sin(Math.PI*t),stance:false}}
 function leg(g,A,hip,ankle,bend,opt,far=false){const k=opt.front?P(hip.x+(ankle.x-hip.x)*.48-bend*3,hip.y+(ankle.y-hip.y)*.49):knee(hip,ankle,bend);bone(g,A.shin,k,ankle,30,far);bone(g,A.thigh,hip,k,35,far);stamp(g,A.shoe,ankle.x,ankle.y,opt.w,opt.h,opt.ax,opt.ay,opt.angle||0,far);return{hip,knee:k,ankle,stance:opt.stance}}
 function armSide(g,A,sh,u,far,held){const q=Math.cos(TAU*u),a=-q*.64+.08,e=P(sh.x+Math.sin(a)*37,sh.y+Math.cos(a)*37),f=a+.46,hand=P(e.x+Math.sin(f)*37,e.y+Math.cos(f)*37);if(held)held(hand,-f*.55);bone(g,A.forearm,e,hand,40,far);bone(g,A['upper-arm'],sh,e,32,far);return{shoulder:sh,elbow:e,hand}}
 function armFront(g,A,sh,u,side,held){const v=Math.cos(TAU*u),e=P(sh.x+side*(10+4*v),sh.y+33-6*v),hand=P(e.x-side*4,e.y+36-5*v);if(held)held(hand,side*.06*v);bone(g,A.forearm,e,hand,39);bone(g,A['upper-arm'],sh,e,29);return{shoulder:sh,elbow:e,hand}}
 class LoopWardrobe{
  constructor(manifest,images){this.manifest=manifest;this.images=images instanceof Map?images:new Map(Object.entries(images));this.lastPose=null}
  static assetPaths(m){const s=new Set();for(const v of Object.values(m.rig.views))Object.values(v).forEach(p=>s.add(p.file));for(const o of Object.values(m.outfits))for(const v of Object.values(o.views))Object.values(v).forEach(p=>s.add(p.file));for(const a of Object.values(m.accessories))for(const v of Object.values(a.views))s.add(v.file);(m.blinkHeads||[]).forEach(p=>s.add(p));return [...s]}
  static async load(baseURL='.',manifest){const base=baseURL.replace(/\/$/,'');const m=manifest||await(await fetch(base+'/wardrobe.json')).json();const pairs=await Promise.all(LoopWardrobe.assetPaths(m).map(async p=>{const image=new Image();image.src=base+'/'+p;await new Promise((r,j)=>{if(image.complete&&image.naturalWidth)return r();image.onload=r;image.onerror=()=>j(Error('Missing wardrobe asset: '+p))});return[p,image]}));return new LoopWardrobe(m,new Map(pairs))}
  static phaseAt(timeMs,animation,manifest){const a=manifest.animations[animation];if(!a)throw Error('Unknown animation: '+animation);return ((timeMs%a.cycleMs)+a.cycleMs)%a.cycleMs/a.cycleMs}
  normalize(input={}){
   const outfit=input.outfit||'base';if(outfit!=='base'&&!this.manifest.outfits[outfit])throw Error('Unknown outfit: '+outfit);
   const equipment={};for(const group of ['upper','lower','shoes']){const id=input.equipment?.[group]||outfit;if(id!=='base'&&!this.manifest.outfits[id])throw Error('Unknown '+group+' item: '+id);equipment[group]=id}
   const slots=new Map();for(const id of input.accessories||[]){const a=this.manifest.accessories[id];if(!a)throw Error('Unknown accessory: '+id);slots.set(a.slot,id)}
   if(slots.get('head')==='space-helmet'){slots.delete('ears');slots.delete('face')}
   return{outfit,equipment,accessories:[...slots.values()]};
  }
  part(view,name,equipment){const id=equipment[GROUP[name]],spec=id&&id!=='base'?this.manifest.outfits[id].views[view][name]:this.manifest.rig.views[view][name];const image=this.images.get(spec.file);if(!image)throw Error('Asset not loaded: '+spec.file);return{image,anchors:spec.joints||this.manifest.rig.joints[view][name],file:spec.file}}
  attachment(g,id,view,bob,u,mount){const a=this.manifest.accessories[id],s=a.views[view],f=s.fit;let x=f.x,y=f.y+bob,angle=(f.angle||0);if(mount){x=mount.x;y=mount.y;angle+=mount.angle||0}else angle+=(a.secondaryMotion?.amplitude||0)*Math.sin(TAU*u-(a.secondaryMotion?.lag||0));const image=this.images.get(s.file);if(!image)throw Error('Asset not loaded: '+s.file);stamp(g,{image},x,y,f.w,f.h,f.ax,f.ay,angle);return{position:P(x,y),angle,slot:a.slot,file:s.file}}
  draw(g,options={}){
   const selected=this.normalize(options),animation=options.animation||'idle',spec=this.manifest.animations[animation];if(!spec)throw Error('Unknown animation: '+animation);
   const u=((options.phase??LoopWardrobe.phaseAt(options.timeMs||0,animation,this.manifest))%1+1)%1,view=spec.view,mode=spec.mode,A={};for(const p of PARTS)A[p]=this.part(view,p,selected.equipment);
   const pose={animation,view,phase:u,equipment:selected.equipment,accessories:{},mirrored:!!spec.mirror};
   const walking=mode==='walk',breath=walking?0:Math.sin(TAU*u),bob=view==='side'?3*Math.cos(TAU*2*u):walking?2.5*Math.cos(TAU*2*u):-1.5*breath;
   const attachment=(id,mount)=>{pose.accessories[id]=this.attachment(g,id,view,bob,u,mount)};
   const layer=(stage)=>{for(const id of selected.accessories){const s=this.manifest.accessories[id].views[view];if(s.layer===stage)attachment(id)}};
   const handId=selected.accessories.find(id=>this.manifest.accessories[id].slot==='hand');const held=handId?(hand,angle)=>attachment(handId,{x:hand.x,y:hand.y,angle}):null;
   g.save();if(options.clear!==false)g.clearRect(0,0,g.canvas.width,g.canvas.height);const size=options.size||512;g.translate(options.x||0,options.y||0);g.scale(size/512,size/512);if(spec.mirror){g.translate(512,0);g.scale(-1,1)}
   layer('behind');
   if(view==='side'){
    const hip=P(251,328+bob),fa=gait(u+.5),na=gait(u),near=P(251+43*na.travel,414-26*na.lift),far=P(251+43*fa.travel,414-26*fa.lift);
    pose.farLeg=leg(g,A,P(hip.x-8,hip.y-1),far,-1,{w:75,h:46,ax:.27,ay:.16,angle:fa.lift>0?-.12*fa.lift:0,stance:fa.stance},true);pose.farArm=armSide(g,A,P(268,269+bob),u+.5,true,null);
    stamp(g,A.tail,226,323+bob,161,135,.96,.74,-.06+.035*Math.sin(TAU*u));stamp(g,A.torso,hip.x,hip.y,98,133,.5,.94);
    pose.nearLeg=leg(g,A,P(hip.x+4,hip.y),near,-1,{w:78,h:48,ax:.27,ay:.16,angle:na.lift>0?-.12*na.lift:0,stance:na.stance});stamp(g,A.torso,hip.x,hip.y,98,133,.5,.94);
    layer('torso');stamp(g,A.head,257,226+bob,183,147,.5,.92);pose.nearArm=armSide(g,A,P(244,270+bob),u,false,held);
    pose.head={position:P(257,226+bob)};pose.torso={position:hip};
   }else{
    const R=opposite(A),hipL=P(239,330+bob),hipR=P(275,330+bob),fL=gait(u),fR=gait(u+.5),left=walking?P(231-3*fL.lift,403+13*fL.travel-18*fL.lift):P(231,413),right=walking?P(283+3*fR.lift,403+13*fR.travel-18*fR.lift):P(283,413),scL=walking?.94+.10*fL.travel:1,scR=walking?.94+.10*fR.travel:1;
    stamp(g,A.tail,283,331+bob,119,131,.09,.7,.025*Math.sin(TAU*u));pose.leftLeg=leg(g,A,hipL,left,1,{w:69*scL,h:56*scL,ax:.5,ay:.15,front:true,stance:walking?fL.stance:true});pose.rightLeg=leg(g,R,hipR,right,-1,{w:69*scR,h:56*scR,ax:.5,ay:.15,front:true,stance:walking?fR.stance:true});
    if(mode!=='wave')pose.leftArm=armFront(g,A,P(213,269+bob),walking?u:.25,-1,held);pose.rightArm=armFront(g,R,P(300,269+bob),walking?u+.5:.25,1,null);
    stamp(g,A.torso,257,332+bob,104,135+(walking?0:breath*1.2),.5,.95);layer('torso');
    let head=A.head;if(mode==='blink'&&this.manifest.blinkHeads?.length){let ms=u*spec.cycleMs,index=0;const d=spec.durations;while(index<d.length-1&&ms>=d[index]){ms-=d[index];index++}head={image:this.images.get(this.manifest.blinkHeads[index])};pose.blinkFrame=index}
    stamp(g,head,257,232+bob,174,145,.5,.94);
    if(mode==='wave'){
     const lift=u<.20?ease(u/.2):u>.8?ease((1-u)/.2):1,osc=u>.2&&u<.8?Math.sin((u-.2)/.6*TAU*2)*.17:0,a=-.22-lift*2.25,sh=P(213,270),el=P(sh.x+Math.sin(a)*42,sh.y+Math.cos(a)*42),b=a-lift*.28+osc,hand=P(el.x+Math.sin(b)*49,el.y+Math.cos(b)*49);if(held)held(hand,b*.25);bone(g,held?A.forearm:lift>.3?A.palm:A.forearm,el,hand,held?39:lift>.3?47:39);bone(g,A['upper-arm'],sh,el,29);pose.leftArm={shoulder:sh,elbow:el,hand};
    }
    pose.head={position:P(257,232+bob)};pose.torso={position:P(257,332+bob)};
   }
   layer('head');layer('face');g.restore();this.lastPose=pose;return pose;
  }
 }
 if(typeof module==='object'&&module.exports)module.exports=LoopWardrobe;else global.LoopWardrobe=LoopWardrobe;
})(typeof globalThis!=='undefined'?globalThis:this);
