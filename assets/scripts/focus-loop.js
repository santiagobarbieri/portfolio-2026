window.createPortfolioFocusLoop=function(bridge){
const $=id=>document.getElementById(id), {stage,cam,idx}=bridge, meta=$('focusMeta'); const P=bridge.items.map(p=>({...p,t:p.title,k:p.type,y:p.year,d:p.description,bg:p.surface}));
const N=P.length, CW=544, CH=364.4665, COUNT=41, HALF=20;
const mod=(n,m)=>((n%m)+m)%m, clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), mix=(a,b,t)=>a+(b-a)*t;
// Quintic easing: first and second derivatives are zero at both endpoints.
const smooth=t=>{t=clamp(t);return t*t*t*(10+t*(-15+6*t))};
const rm=matchMedia('(prefers-reduced-motion: reduce)');
// One continuous scroll coordinate. Input is accepted even during a transition.
const SETTINGS={hold:0,autoSpeed:.12,autoRamp:1000,maxSpeed:2.2,response:.10,engageTime:.15,closeTime:.13,quiet:90,reverseMin:8,impulseMin:2,renewMin:100,browsePixels:180,browseMaxLead:2.5,browseSpeed:9,browseResponse:.085};
let pos=0,target=0,last=0,drag=null,active=-1,metaSeq=null,geo;
let mode='idle',engagement=0,lastInput=-Infinity,idleStart=performance.now();
let wheelGesture=null, pending=[], pointerGesture=null;
let hovered=null;
const hoverOK=matchMedia('(hover:hover) and (pointer:fine)');
function setHover(seq){
 if(hovered===seq)return;
 if(hovered!==null&&seq===null&&mode==='idle')idleStart=performance.now();
 hovered=seq;bridge.hover?.(seq);
}
function hoverAllowed(){return mode==='idle'||(mode==='active'&&engagement>.99&&Math.abs(target-pos)<.003&&!pending.length)}
function cardAt(x,y){const el=document.elementFromPoint(x,y)?.closest('.study-plane');return el?Number(el.dataset.s):null}

const planes=bridge.planes;
for(let i=0;i<COUNT;i++){const r=bridge.createPlane();r.el=r.element;r.seq=null;r.hover=0;r.label=document.createElement('span');r.label.className='project-hover';r.label.setAttribute('aria-hidden','true');r.el.append(r.label);planes.push(r)}
idx.querySelectorAll('[data-project]').forEach((b,i)=>b.addEventListener('click',()=>{bridge.seek();goTo(Math.round((pos-i)/N)*N+i)}));
function measure(){
 const w=innerWidth,h=innerHeight,m=w<=700;
 const focusW=Math.min(w*(m?.86:.51),Math.max(72,h-(m?235:190))*CW/CH);
 const deckW=Math.min(w*(m?.57:.32),h*(m?.40:.44)*CW/CH,focusW*.79);
 geo={w,h,m,focusW,deckW,focusY:Math.min(h*.46,h-focusW*CH/CW/2-(m?132:100))-h/2,gap:Math.max(15,w*.024),stack:Math.max(40,deckW*.42),persp:Math.max(1800,w*3.9)};
 for(const r of planes)Object.assign(r.el.style,{width:CW+'px',height:CH+'px',marginLeft:-CW/2+'px',marginTop:-CH/2+'px'});

}
function fill(r,seq){const p=P[mod(seq,N)];r.seq=r.sequence=seq;r.hover=0;r.el.dataset.s=r.el.dataset.sequence=seq;r.label.textContent=p.t;r.face.style.background=p.bg;r.image.src=p.cover;r.image.alt=p.alt;r.face.classList.remove('has-preview')}
// Single physical card per sequence; shared transforms in every phase.
function pose(d,f=0){
 const w=mix(geo.deckW,geo.focusW,f), s=w/CW;
 const m=new DOMMatrix();m.m34=-1/geo.persp;
 m.rotateAxisAngleSelf(1,0,0,-11*(1-f));m.rotateAxisAngleSelf(0,1,0,-31*(1-f));m.scaleSelf(s,s,s);
 let l=Infinity,r=-Infinity,t=Infinity,b=-Infinity;
 for(const x of [-CW/2,CW/2])for(const y of [-CH/2,CH/2]){const v=m.transformPoint(new DOMPoint(x,y,0,1));l=Math.min(l,v.x/v.w);r=Math.max(r,v.x/v.w);t=Math.min(t,v.y/v.w);b=Math.max(b,v.y/v.w)}
 return {m,f,l,r,t,b,x:0,y:0};
}
// Direct hand-off: the central opening is shared by two consecutive cards.
// No intermediate closed deck. At each integer the next interval starts
// at exactly the same pose, with zero derivative at the ends of the easing.
function focusedLayout(position){
 const floor=Math.floor(position), fraction=position-floor;
 const u=smooth((fraction-SETTINGS.hold)/(1-2*SETTINGS.hold));
 const center= u<.5?floor:floor+1, map=new Map();
 for(let i=floor-HALF;i<=floor+HALF;i++)map.set(i,pose(i-position,i===floor?1-u:i===floor+1?u:0));
 const A=map.get(floor), B=map.get(floor+1);
 // Fixed endpoint anchors: each card and both outer stacks move in one direction.
 // Their positions are interpolated, not pushed out and pulled back by scale changes.
 const deck=pose(0,0), full=pose(0,1);
 const dl=deck.r-full.l+geo.gap, dr=full.r-deck.l+geo.gap;
 A.x=-u*dl; B.x=(1-u)*dr;
 for(const [seq,p] of map){
  if(seq<floor)p.x=-dl-(floor-1-seq+u)*geo.stack;
  else if(seq>floor+1)p.x=dr+(seq-floor-1-u)*geo.stack;
  p.y=-p.x*(geo.m?.20:.27)+geo.focusY*p.f;
 }
 return {floor,center,map};
}
// The resting stack never enters focus, regardless of its scroll coordinate.
function deckLayout(position){
 const floor=Math.floor(position),center=Math.round(position),map=new Map();
 for(let seq=floor-HALF;seq<=floor+HALF;seq++){
  const p=pose(0,0);p.x=(seq-position)*geo.stack;p.y=-p.x*(geo.m?.20:.27);map.set(seq,p);
 }
 return {floor,center,map};
}
// Blend the two layouts at the SAME coordinate. No frozen anchor or reset
// when a new wheel event arrives while opening or closing.
function layout(){
 if(engagement<=0)return deckLayout(pos);
 const focused=focusedLayout(pos);
 if(engagement>=1)return focused;
 const {floor,center,map}=focused;
 for(const [seq,g] of map){
  const p=pose(0,g.f*engagement),x=(seq-pos)*geo.stack;
  p.x=mix(x,g.x,engagement);p.y=mix(-x*(geo.m?.20:.27),g.y,engagement);map.set(seq,p);
 }
 return {floor,center,map};
}
// The absolute sequence never resets at the end of a lap. Each new lap
// paints the previous color with the other color, following the same direction.
let ringPosition=1;
function updateProjectRing(seq,dt){
 const goal=seq+1;
 ringPosition=rm.matches?goal:approach(ringPosition,goal,dt,.075);
 const lap=Math.floor(ringPosition/N), fraction=mod(ringPosition,N)/N;
 const odd=mod(lap,2)===1;
 $('projectTrack').style.stroke=odd?'var(--ring-a)':'var(--ring-b)';
 $('projectRing').style.stroke=odd?'var(--ring-b)':'var(--ring-a)';
 $('projectRing').style.strokeDashoffset=100*(1-fraction);
}
function draw(dt=0){
 const {floor,center,map}=layout();
 for(const [seq,g] of map){
  const r=planes[mod(seq,COUNT)];if(r.seq!==seq)fill(r,seq);
  const matrix=new DOMMatrix().translate(g.x,g.y,0).multiply(g.m);
  const hoverGoal=hovered===seq&&hoverAllowed()&&!drag&&g.f<.05?1:0;
  r.hover=rm.matches?hoverGoal:approach(r.hover,hoverGoal,dt,hoverGoal?.085:.115);
  const localShift=52*r.hover;
  r.face.style.transform=`translateX(${localShift}px)`;
  r.label.style.transform=`translate(${localShift}px,${6*(1-r.hover)}px)`;
  r.label.style.opacity=smooth(r.hover);

  r.el.style.transform=matrix.toString();
  r.el.style.zIndex=String(60-(seq-floor));
  // The pool recycles only offscreen; fade far edges rather than snapping at a clip boundary.
  const edge=1-smooth((Math.abs(seq-pos)-17)/2);r.el.style.opacity=edge;
  r.el.style.visibility=edge<.0001?'hidden':'visible';r.element.hidden=false;
 }
 const g=map.get(center), f=g.f;
 // While seeking, only an already visible outgoing fiche may fade out.
 const reveal=mode==='seeking' && metaSeq!==center ? 0 : smooth((f-.83)/.17);
 if(reveal>0&&metaSeq!==center){const p=P[mod(center,N)];metaSeq=center;$('focusTitle').textContent=p.t;$('focusDesc').textContent=p.d;$('focusKind').textContent=p.k+' / '+p.y;$('focusOpen').dataset.sequence=center}
 const mw=geo.focusW;
 Object.assign(meta.style,{left:(geo.w-mw)/2+g.x+'px',width:mw+'px',top:(geo.h/2+g.y+g.b+12)+'px',opacity:reveal,transform:`translateY(${10*(1-reveal)}px)`,visibility:reveal>0?'visible':'hidden'});
 meta.setAttribute('aria-hidden',String(reveal<.99));
 idx.style.opacity=1-smooth((f-.1)/.6);idx.style.pointerEvents=f>.45?'none':'';
 const ringSeq=mode==='seeking'?target:center;updateProjectRing(ringSeq,dt);const a=mod(ringSeq,N);if(a!==active){active=a;idx.querySelectorAll('button').forEach((b,i)=>i===a?b.setAttribute('aria-current','true'):b.removeAttribute('aria-current'));$('projectProgress').setAttribute('aria-valuemax',N);$('projectProgress').setAttribute('aria-valuenow',a+1);$('projectProgress').setAttribute('aria-valuetext',`${P[a].t}, ${a+1} de ${N}`)}
}
// Monotone first-order filter: no spring, no overshoot and no input lock.
function approach(value,goal,dt,tau,maxSpeed=Infinity){
 const e=goal-value;if(Math.abs(e)<.0001)return goal;
 return value+Math.sign(e)*Math.min(Math.abs(e),Math.abs(e)*(1-Math.exp(-dt/tau)),maxSpeed*dt);
}
// WheelEvent does not expose native trackpad gesture phases. Group the
// entire burst (including momentum) by its inter-event silence and direction.
// Only a new burst requests a step, independently of animation progress.
// Browsing and focused navigation have independent input dynamics.
function browseBy(amount,now=performance.now()){
 if(!amount)return;
 setHover(null);
 if(mode!=='browsing'){pending.length=0;target=pos;mode='browsing'}
 const lead=target-pos;
 // Discard old momentum on direction changes; never store a long backlog.
 if(lead&&Math.sign(lead)!==Math.sign(amount))target=pos;
 target=pos+clamp(target-pos+amount,-SETTINGS.browseMaxLead,SETTINGS.browseMaxLead);
 lastInput=now;
}
function step(dir,now=performance.now(),explicit=false){
 if(!dir)return;
 setHover(null);
 if(mode==='seeking'){pending.push(dir);lastInput=now;return}
 if(mode!=='active'){
  // Buttons and discrete swipes move one card without activating focus.
  const anchor=mode==='browsing'?Math.round(target):Math.round(pos);
  browseBy(anchor+dir-(mode==='browsing'?target:pos),now);return;
 }
 lastInput=now;
 const moving=Math.abs(target-pos)>.003;
 if(moving&&Math.sign(target-pos)!==dir){
  pending.length=0;target=Math.round(target)+dir;return;
 }
 if(moving)pending.push(dir);
 else target=Math.round(target)+dir;
}
// Trackpad momentum can bridge two deliberate swipes with no silent gap.
// Detect a renewed acceleration after the previous impulse has decayed.
// The gesture detector is independent of the animation and its queue.
function wheelInput(delta,now=performance.now()){
 if(!Number.isFinite(delta)||!delta)return;
 if(mode!=='active'&&mode!=='seeking'){
  wheelGesture=null;
  browseBy(clamp(delta/SETTINGS.browsePixels,-1.5,1.5),now);
  return;
 }
 const dir=Math.sign(delta),mag=Math.abs(delta),g=wheelGesture;
 const gap=g?now-g.at:Infinity;
 const fresh=!g||gap>=SETTINGS.quiet;
 const reversal=g&&!fresh&&dir!==g.dir&&mag>=SETTINGS.reverseMin;
 const renewed=g&&!fresh&&g.fired&&dir===g.dir&&
  now-g.firedAt>=SETTINGS.renewMin&&g.valley<=g.peak*.55&&
  mag>=Math.max(SETTINGS.impulseMin*2,g.valley*2.1,g.previous*1.35,g.peak*.20);
 if(fresh||reversal||renewed){
  wheelGesture={at:now,dir,fired:false,firedAt:now,peak:mag,valley:mag,previous:mag};
 }
 const current=wheelGesture;
 current.at=now;
 if(dir===current.dir){
  if(mag>=current.peak){current.peak=mag;current.valley=mag}
  else current.valley=Math.min(current.valley,mag);
  current.previous=mag;
  if(!current.fired&&mag>=SETTINGS.impulseMin){
   current.fired=true;current.firedAt=now;step(dir,now);
  }
 }
 if(mode==='active')lastInput=now;
}
function goTo(next){
 setHover(null);
 // Sidebar navigation is a separate route: close, travel in deck mode,
 // then focus only the exact selected sequence. Never focus passing cards.
 pending.length=0;target=next;lastInput=performance.now();
 if(mode==='active'&&Math.abs(pos-next)<.003){pos=next;return}
 mode='seeking';
 // Keep the existing wheel detector so residual trackpad momentum is not
 // interpreted as a new gesture simply because a menu item was clicked.
}
function closeFocus(){
 setHover(null);
 if(mode==='idle'||mode==='closing'||mode==='browsing')return;
 pending.length=0;target=pos;mode='closing';
 // Preserve gesture recognition so residual momentum cannot reopen focus.
}
function isFocused(seq){return mode==='active'&&Math.round(pos)===seq&&engagement>.99&&Math.abs(target-pos)<.003&&!pending.length}
function activate(seq){if(isFocused(seq))bridge.open(seq);else goTo(seq)}
function updateControls(){
 const canClose=mode==='active'||mode==='seeking';
 $('focusOpen').disabled=!isFocused(Math.round(pos));
 stage.dataset.focusMode=mode;stage.dataset.focusTarget=target;stage.dataset.focusEngagement=engagement;
 $('closeFocus').disabled=false;$('closeFocus').setAttribute('aria-label',canClose?'Cerrar foco':'Enfocar proyecto');$('closeFocus').dataset.focus=String(canClose);$('focusCounter').textContent=String(mod(Math.round(pos),N)+1).padStart(2,'0')+' / '+String(N).padStart(2,'0');
}
$('closeFocus').addEventListener('click',()=>mode==='active'||mode==='seeking'?closeFocus():goTo(Math.round(pos)));$('focusOpen').addEventListener('click',()=>{const seq=Number($('focusOpen').dataset.sequence);if(isFocused(seq))bridge.open(seq)});
function frame(t){
 if(bridge.blocked()){last=t;return;}
 const dt=Math.min(.033,last?(t-last)/1000:1/60);last=t;
 if(mode==='active'){
  pos=rm.matches?target:approach(pos,target,dt,SETTINGS.response,SETTINGS.maxSpeed);
  engagement=rm.matches?1:approach(engagement,1,dt,SETTINGS.engageTime);
  if(Math.abs(target-pos)<.003){
   pos=target;
   if(pending.length){target+=pending.shift();lastInput=t}
  }
 }else if(mode==='browsing'){
  engagement=rm.matches?0:approach(engagement,0,dt,SETTINGS.closeTime);
  pos=rm.matches?target:approach(pos,target,dt,SETTINGS.browseResponse,SETTINGS.browseSpeed);
  if(Math.abs(target-pos)<.003&&engagement<.002){
   pos=target;engagement=0;mode='idle';idleStart=t;
  }
 }else if(mode==='seeking'){
  // Hold the current position while closing; move only when fully stacked.
  engagement=rm.matches?0:approach(engagement,0,dt,SETTINGS.closeTime);
  if(engagement<.002){
   engagement=0;
   pos=rm.matches?target:approach(pos,target,dt,SETTINGS.response,SETTINGS.maxSpeed);
   if(Math.abs(target-pos)<.003){pos=target;mode='active';lastInput=t}
  }
 }else if(mode==='closing'){
  engagement=rm.matches?0:approach(engagement,0,dt,SETTINGS.closeTime);
  if(engagement<.002){engagement=0;mode='idle';idleStart=t;target=pos}
 }else if(!rm.matches&&!drag&&hovered===null){
  pos+=SETTINGS.autoSpeed*dt*smooth((t-idleStart)/SETTINGS.autoRamp);target=pos;
 }
 draw(dt);updateControls();bridge.paint(pos,hovered,planes);
}
window.addEventListener('wheel',e=>{
 if(bridge.blocked())return;
 if(e.ctrlKey||e.metaKey||e.target.closest('input,textarea,select,.study-submenu'))return;e.preventDefault();
 const raw=Math.abs(e.deltaY)>=Math.abs(e.deltaX)?e.deltaY:e.deltaX;
 const d=raw*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
 wheelInput(d);
},{passive:false});
stage.addEventListener('pointerdown',e=>{
 if(bridge.blocked()||!e.isPrimary||e.button!==0||drag)return;
 drag={id:e.pointerId,x:e.clientX,y:e.clientY,seq:cardAt(e.clientX,e.clientY)};
 pointerGesture={fired:false};stage.setPointerCapture(e.pointerId);
});
stage.addEventListener('pointermove',e=>{
 bridge.pointer?.(e);
 if(drag&&drag.id===e.pointerId){
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  const d=Math.abs(dx)>Math.abs(dy)?-dx:-dy;
  if(!pointerGesture.fired&&Math.hypot(dx,dy)>=10){pointerGesture.fired=true;step(Math.sign(d))}
  else if(pointerGesture.fired)lastInput=performance.now();
  return;
 }
 if(bridge.blocked()||e.pointerType!=='mouse'||!hoverOK.matches||!hoverAllowed()){setHover(null);return}
 const seq=cardAt(e.clientX,e.clientY);
 setHover(seq!==null&&(mode==='idle'||seq!==Math.round(pos))?seq:null);
});
stage.addEventListener('pointerleave',()=>{if(!drag)setHover(null)});
function release(e){
 if(drag?.id!==e.pointerId)return;
 const d=drag, fired=pointerGesture?.fired;
 drag=null;pointerGesture=null;
 if(mode==='active')lastInput=performance.now();
 if(e.type==='pointerup'&&!fired&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<10&&d.seq!==null){
  // Use the exact visible instance, not a rounded scroll coordinate.
  activate(d.seq);
 }else if(e.type!=='pointerup'||fired)setHover(null);
}
for(const k of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(k,release);
$('prev').addEventListener('click',()=>step(-1,performance.now(),true));
$('next').addEventListener('click',()=>step(1,performance.now(),true));
window.addEventListener('keydown',e=>{if(bridge.blocked()||e.target.closest('input,textarea,select,summary'))return;if(e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='Escape'){e.preventDefault();closeFocus();return}const dir=['ArrowDown','ArrowRight','PageDown',' '].includes(e.key)?1:['ArrowUp','ArrowLeft','PageUp'].includes(e.key)?-1:0;if(!dir)return;if(e.key===' '&&e.target.closest('button'))return;e.preventDefault();if(!e.repeat)step(dir,performance.now(),true)});
measure();draw();return {tick:frame,measure,draw,step,goTo,closeFocus,activate,isFocused,move(value){pos=target=value;pending.length=0;draw()},get position(){return pos}};

};
