/* Ezyron · escenas, scroll y formulario. Fuera del HTML para que la política de seguridad (CSP) pueda prohibir scripts en línea. */
(() => {
const RED='#E3232D', CREAM='#F0E8DC', INK='#0B0B0D';
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const seg=(p,a,b)=>clamp((p-a)/(b-a));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const eOut=t=>1-Math.pow(1-t,3);
const eBack=t=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)};
const sst=t=>t*t*(3-2*t);
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const mix=(a,b,t)=>{const A=hex(a),B=hex(b);return `rgb(${A.map((v,i)=>Math.round(lerp(v,B[i],t))).join(',')})`};
const isMobile=()=>innerWidth<=900;
const SNAP=/[?&]snap/.test(location.search); // debug: sin suavizado (capturas)
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const LEAN={x:0,y:0}; let lastY=scrollY, vel=0; const mq=document.querySelector('.marquee');

/* ---------- logo geometry ---------- */
const P={
  E1:'M210,600 L379,600 L404,568 L274,568 L291,546 L361,546 L384,517 L275,517 Z',
  E2:'M279,494 L388,494 L411,465 L302,465 Z',
  Z:'M441,465 L552,465 L552,494 L488,568 L589,568 L562,600 L411,600 L502,494 L418,494 Z',
  Y:'M570,465 L609,465 L654,516 L699,465 L738,465 L672,543 L672,600 L636,600 L636,543 Z',
  R:'M759,465 L850,465 A36,42.5 0 0 1 850,550 L838,550 L903,611 L860,611 L795,550 L769,550 L769,600 L735,600 L735,522 L844,522 A11,14.5 0 0 0 844,493 L736,493 Z',
  N:'M1074,465 L1119,465 L1192,560 L1192,465 L1227,465 L1227,600 L1182,600 L1109,506 L1109,600 L1074,600 Z',
  O:'M 1057 533 A 76.5 73 0 1 0 904 533 A 76.5 73 0 1 0 1057 533 Z M 1025 533 A 44.5 44 0 1 1 936 533 A 44.5 44 0 1 1 1025 533 Z'
};
const PP={};for(const k in P)PP[k]=new Path2D(P[k]);
// letters revealed from the dot outward
const LETTERS=[['N'],['R'],['Y'],['Z'],['E1','E2']];
const DX=980.5, DY=533;

/* ---------- canvas helpers ---------- */
function setup(cv){
  const o={cv,ctx:cv.getContext('2d'),W:0,H:0,dpr:1};
  o.fit=()=>{const r=cv.getBoundingClientRect();// supermuestreo: en pantallas 1x se dibuja al doble (1,5x en monitores grandes) para bordes suaves, sin dientes de sierra
    o.dpr=Math.min(2,Math.max(devicePixelRatio||1,r.width*r.height>2.4e6?1.5:2));o.W=r.width;o.H=r.height;cv.width=Math.round(r.width*o.dpr);cv.height=Math.round(r.height*o.dpr);};
  o.fit();return o;
}
function glow(ctx,x,y,r,a){
  if(a<=0)return;const g=ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,`rgba(227,35,45,${a})`);g.addColorStop(.4,`rgba(227,35,45,${a*.35})`);g.addColorStop(1,'rgba(227,35,45,0)');
  ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
}
function dot(ctx,x,y,r,col=RED){ctx.beginPath();ctx.arc(x,y,Math.max(0,r),0,Math.PI*2);ctx.fillStyle=col;ctx.fill();}
function pulses(ctx,x,y,R,t,a,n=3,spread=6){
  if(a<=0)return;
  for(let i=0;i<n;i++){const ph=(t*.32+i/n)%1;ctx.beginPath();ctx.arc(x,y,R*(1+ph*spread),0,Math.PI*2);ctx.strokeStyle=`rgba(227,35,45,${(1-ph)*.5*a})`;ctx.lineWidth=1;ctx.stroke();}
}
const baseR=(W,H)=>Math.min(W,H)*.042;

/* ---------- SCENE 1 · ORIGEN ---------- */
const S1=setup(document.getElementById('c1'));
function drawS1(p,t){
  const {ctx,W,H,dpr}=S1;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  const R0=baseR(W,H), s0=R0/16, sL=Math.min(W*.8/1051,H*.4/180);
  const z1=ease(seg(p,.3,.6)), z2=ease(seg(p,.8,1));
  const s=lerp(lerp(s0,sL,z1),s0,z2);
  // reacción: el punto se inclina hacia el cursor mientras está solo
  const lw=(1-z1)+z2;
  const dx=W/2+265*s*(z1-z2)+LEAN.x*R0*1.4*lw, dy=H/2-4*s+LEAN.y*R0*1.4*lw;
  const intro=eBack(clamp(t/1.1));

  // ambient glow & pulses
  glow(ctx,dx,dy,Math.min(W,H)*(.55-.15*z1+.15*z2),.16+.06*Math.sin(t*1.4));
  const pv=(1-seg(p,.1,.22))+seg(p,.86,1);
  pulses(ctx,dx,dy,R0,t,pv*intro);

  // crosshair coordinates (blueprint feel) at start
  const ch=(1-seg(p,.04,.14))*clamp(t-0.6);
  if(ch>0){
    ctx.strokeStyle=`rgba(240,232,220,${.14*ch})`;ctx.lineWidth=1;ctx.beginPath();
    ctx.moveTo(0,dy+.5);ctx.lineTo(dx-R0*3,dy+.5);ctx.moveTo(dx+R0*3,dy+.5);ctx.lineTo(W,dy+.5);
    ctx.moveTo(dx+.5,0);ctx.lineTo(dx+.5,dy-R0*3);ctx.moveTo(dx+.5,dy+R0*3);ctx.lineTo(dx+.5,H);ctx.stroke();
    ctx.fillStyle=`rgba(240,232,220,${.45*ch})`;ctx.font='500 10px "JetBrains Mono"';
    ctx.fillText('x 980.5  y 533  r 16',dx+R0*1.6,dy-R0*1.6);
  }

  ctx.save();ctx.translate(dx,dy);ctx.scale(s,s);ctx.translate(-DX,-DY);
  // O ring sweep
  const oT=ease(seg(p,.1,.3)), oF=1-seg(p,.9,.99);
  if(oT>0&&oF>0){
    ctx.save();ctx.globalAlpha=oF;
    const a0=-Math.PI/2, a1=a0+Math.PI*2*oT;
    ctx.beginPath();ctx.moveTo(DX,DY);ctx.arc(DX,DY,220,a0,a1);ctx.closePath();ctx.clip();
    ctx.fillStyle=CREAM;ctx.fill(PP.O,'evenodd');ctx.restore();
    if(oT<1){ // bright head
      const hx=DX+Math.cos(a1)*60.5, hy=DY+Math.sin(a1)*58.5;
      ctx.save();ctx.translate(hx,hy);ctx.beginPath();ctx.arc(0,0,3.2,0,Math.PI*2);ctx.fillStyle=RED;ctx.shadowColor=RED;ctx.shadowBlur=24/s*.2+12;ctx.fill();ctx.restore();
    }
  }
  // letters
  const lF=1-seg(p,.76,.88);
  LETTERS.forEach((L,i)=>{
    const a=eOut(seg(p,.34+i*.05,.5+i*.05))*lF;if(a<=0)return;
    ctx.save();ctx.globalAlpha=a;ctx.translate(0,(1-a)*46*(i%2?-1:1));ctx.fillStyle=CREAM;L.forEach(k=>ctx.fill(PP[k]));ctx.restore();
  });
  ctx.restore();

  // the dot
  const breath=1+.04*Math.sin(t*2.1);
  ctx.save();ctx.shadowColor='rgba(227,35,45,.7)';ctx.shadowBlur=30;
  dot(ctx,dx,dy,16*s*intro*breath);ctx.restore();
}

/* ---------- SCENE 2 · SISTEMA ---------- */
const S2=setup(document.getElementById('c2'));
const NODES=['CRM','ERP','Web','Correo','Datos','IA','Pagos'];
const JIT=[1.05,.86,1.12,.94,1.08,.9,1.0];
let gridCache=null;
function drawS2(p,t){
  const {ctx,W,H,dpr}=S2;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  const mob=isMobile(), m=Math.min(W,mob?H*.62:H), R0=baseR(W,H);
  const move=ease(seg(p,0,.08)), end=ease(seg(p,.88,1));
  const hx0=mob?W/2:W*.64, hy0=mob?H*.36:H/2;
  const hx=lerp(lerp(W/2,hx0,move),W/2,end), hy=lerp(lerp(H/2,hy0,move),H/2,end);
  const morph=ease(seg(p,.3,.42)), zoom=ease(seg(p,.58,.72)), k=lerp(1,.5,zoom);
  const fade=1-ease(seg(p,.86,.94));
  const rS=m*.32*k;
  const rot=morph*(t*.12+p*3);

  // grid / scale phase
  const gv=seg(p,.56,.66)*fade;
  if(gv>0){
    const sp=Math.max(26,Math.min(W,H)*.055);
    const wr=seg(p,.62,.86)*Math.hypot(W,H)*.75;
    for(let x=sp/2;x<W;x+=sp)for(let y=sp/2;y<H;y+=sp){
      const d=Math.hypot(x-hx,y-hy);if(d<rS*1.25)continue;
      const lit=clamp((wr-d)/90);
      const fl=.5+.5*Math.sin(t*3+x*.05+y*.03);
      if(lit>0){
        dot(ctx,x,y,(1.2+lit*1.6)*gv,`rgba(227,35,45,${(.35+.65*lit*(.7+.3*fl))*gv})`);
        if(lit<1){ctx.beginPath();ctx.arc(x,y,4+lit*10,0,Math.PI*2);ctx.strokeStyle=`rgba(227,35,45,${(1-lit)*.6*gv})`;ctx.stroke();}
      }else dot(ctx,x,y,1*gv,`rgba(240,232,220,${.16*gv})`);
    }
  }

  glow(ctx,hx,hy,m*.6,.12*fade+.05);

  // node positions
  const pos=NODES.map((_,i)=>{
    const e=eBack(seg(p,.05+i*.02,.18+i*.02));
    const as=-Math.PI/2+i*Math.PI*2/NODES.length+.18;
    const sx=Math.cos(as)*rS*JIT[i], sy=Math.sin(as)*rS*JIT[i]*.92;
    const al=-Math.PI/2+i*Math.PI*2/NODES.length+rot;
    const lx=Math.cos(al)*rS, ly=Math.sin(al)*rS;
    return {x:hx+lerp(sx,lx,morph)*e, y:hy+lerp(sy,ly,morph)*e, e};
  });

  ctx.lineWidth=1;
  // spokes
  const spA=(1-morph*.75)*fade;
  pos.forEach((n,i)=>{
    if(n.e<=0)return;
    ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(n.x,n.y);ctx.strokeStyle=`rgba(240,232,220,${.22*spA*clamp(n.e)})`;ctx.stroke();
    // packet along spoke
    const u=((t*.45+i*.37+p*2.5)%1), dir=i%2;const uu=dir?u:1-u;
    const px=lerp(hx,n.x,uu), py=lerp(hy,n.y,uu);
    if(spA>.05){ctx.save();ctx.shadowColor=RED;ctx.shadowBlur=10;dot(ctx,px,py,2.6*clamp(n.e)*spA);ctx.restore();}
  });
  // loop ring
  const packets=[];
  if(morph>0){
    ctx.beginPath();ctx.arc(hx,hy,rS,0,Math.PI*2);ctx.strokeStyle=`rgba(240,232,220,${.35*morph*fade})`;ctx.stroke();
    ctx.save();ctx.setLineDash([2,7]);ctx.beginPath();ctx.arc(hx,hy,rS*1.18,0,Math.PI*2);ctx.strokeStyle=`rgba(240,232,220,${.18*morph*fade})`;ctx.stroke();ctx.restore();
    const speed=.18+zoom*.5;
    for(let j=0;j<4;j++){
      const a=-Math.PI/2+((t*speed+p*1.5+j/4)%1)*Math.PI*2;
      const x=hx+Math.cos(a)*rS, y=hy+Math.sin(a)*rS;packets.push([x,y]);
      // tail
      for(let q=1;q<10;q++){const aa=a-q*.035;dot(ctx,hx+Math.cos(aa)*rS,hy+Math.sin(aa)*rS,(3.2-q*.28)*morph*fade,`rgba(227,35,45,${(1-q/10)*.5*morph*fade})`);}
      ctx.save();ctx.shadowColor=RED;ctx.shadowBlur=14;dot(ctx,x,y,3.4*morph*fade);ctx.restore();
    }
    // rotating gear around hub
    ctx.save();ctx.translate(hx,hy);ctx.rotate(t*.6+p*6);ctx.setLineDash([3,6]);ctx.beginPath();ctx.arc(0,0,R0*2.3,0,Math.PI*2);ctx.strokeStyle=`rgba(240,232,220,${.5*morph*fade})`;ctx.stroke();ctx.restore();
  }
  // nodes
  const nr=Math.max(12,m*.034)*lerp(1,.75,zoom);
  ctx.font=`500 ${mob?9:10}px "JetBrains Mono"`;ctx.textAlign='center';
  pos.forEach((n,i)=>{
    const e=clamp(n.e);if(e<=0)return;
    let hot=0;packets.forEach(([x,y])=>{hot=Math.max(hot,1-clamp(Math.hypot(x-n.x,y-n.y)/(nr*2.2)))});
    ctx.globalAlpha=e*fade;
    ctx.beginPath();ctx.arc(n.x,n.y,nr*e,0,Math.PI*2);ctx.fillStyle=INK;ctx.fill();
    ctx.strokeStyle=hot>0?mix(CREAM,RED,hot):CREAM;ctx.lineWidth=1.2+hot;ctx.stroke();
    dot(ctx,n.x,n.y,2.4*e,hot>0?RED:CREAM);
    ctx.fillStyle=`rgba(240,232,220,${.7})`;ctx.fillText(NODES[i].toUpperCase(),n.x,n.y+nr+16);
    ctx.globalAlpha=1;
  });
  ctx.textAlign='left';ctx.lineWidth=1;

  // hub
  const big=ease(seg(p,.9,1));
  const hr=lerp(R0*(1+.05*Math.sin(t*2.1)),Math.hypot(W,H)*.75,big);
  // el velo lateral se funde a la vez que crece el rojo (sin corte); el rojo llena la pantalla justo antes del relevo, con el contador visible
  S2.cv.parentElement.style.setProperty('--veil',(1-ease(seg(p,.89,.96))).toFixed(3));
  pulses(ctx,hx,hy,R0,t,(1-morph)*fade*.8);
  ctx.save();ctx.shadowColor='rgba(227,35,45,.7)';ctx.shadowBlur=30*(1-big);dot(ctx,hx,hy,hr);ctx.restore();
}

/* ---------- sections & scroll engine ---------- */
const secs=[...document.querySelectorAll('.scrub')].map(el=>({el,id:el.id,p:0,sp:0,fades:[...el.querySelectorAll('[data-a]')]}));
const byId=Object.fromEntries(secs.map(s=>[s.id,s]));
const navEls=[...document.querySelectorAll('[data-nav]')];
const LAYOUT={nav:[],mLine:0,rail:0,max:1,mf:null};
function readProgress(){
  const vh=innerHeight;
  LAYOUT.nav=navEls.map(el=>[el,el.getBoundingClientRect()]);
  LAYOUT.mLine=document.querySelector('.m-line').offsetWidth;
  LAYOUT.rail=document.querySelector('.rail').offsetHeight;
  LAYOUT.max=Math.max(1,document.documentElement.scrollHeight-vh);
  LAYOUT.mf=document.getElementById('mf').getBoundingClientRect();
  secs.forEach(s=>{const r=s.r=s.el.getBoundingClientRect(),off=s.id==='servicios'?svPin.offsetHeight:0;s.p=clamp((-r.top-off)/(r.height-vh-off));s.vis=r.bottom>0&&r.top<vh;s.leave=clamp((-r.top-(r.height-vh))/vh);});
}
function applyFades(s){
  s.fades.forEach(el=>{
    const a=+el.dataset.a,b=+el.dataset.b,mode=el.dataset.fade||'both',w=Math.min(.06,(b-a)/3);
    let o;const p=s.sp;
    if(mode==='out')o=1-sst(seg(p,b-w,b));
    else if(mode==='in')o=sst(seg(p,a,a+w));
    else o=Math.min(sst(seg(p,a,a+w)),1-sst(seg(p,b-w,b)));
    const dir=p<(a+b)/2?1:-1;
    el.style.opacity=o.toFixed(3);
    const base=el.classList.contains('o-tag')?'translateX(-50%) ':el.classList.contains('s-chapter')&&!isMobile()?'translateY(-50%) ':'';
    el.style.transform=base+`translateY(${((1-o)*24*dir).toFixed(1)}px)`;
    el.style.filter=o<.99?`blur(${((1-o)*8).toFixed(1)}px)`:'none';
    el.style.visibility=o<.01?'hidden':'visible';
  });
}

/* services */
const SV=[{bg:'#E3232D',fg:'#0B0B0D',dot:'cream'},{bg:'#0B0B0D',fg:'#F0E8DC'},{bg:'#F0E8DC',fg:'#0B0B0D'},{bg:'#141417',fg:'#F0E8DC'}];
const svPin=document.getElementById('sv-pin');
const svQ=sel=>[...svPin.querySelectorAll(sel)];
const svWords=svQ('.sv-word'),svGlyphs=svQ('.sv-glyph'),svInfo=svQ('.sv-info'),svStat=svQ('.sv-stat'),svDots=svQ('.sv-pager i');
const svNum=document.getElementById('sv-num');
let svState={bgLight:false,onRed:true};
function drawServices(p){
  const N=SV.length, x=p*(N-1)*1.0;
  const i0=Math.floor(x), f=x-i0;
  const h=i0+ease(clamp((f-.22)/.56)); // hold then move
  const a=Math.min(N-1,Math.floor(h)), b=Math.min(N-1,a+1), ft=h-a;
  svPin.style.background=mix(SV[a].bg,SV[b].bg,ft);
  svPin.style.color=mix(SV[a].fg,SV[b].fg,ft);
  const cur=Math.round(h);
  svState.bgLight=SV[cur].bg==='#F0E8DC';svState.onRed=cur===0;
  svNum.textContent=String(cur+1).padStart(2,'0');
  svDots.forEach((d,i)=>d.classList.toggle('on',i===cur));
  const vh=innerHeight;
  for(let i=0;i<N;i++){
    const d=h-i, ad=Math.abs(d);
    const g=svGlyphs[i];
    g.style.transform=`perspective(900px) rotateY(${(LEAN.x*12).toFixed(2)}deg) rotateX(${(-LEAN.y*12).toFixed(2)}deg) translateY(${(-d*vh*.72).toFixed(1)}px) rotate(${(d*-28).toFixed(1)}deg) scale(${(1-Math.min(ad,1)*.28).toFixed(3)})`;
    g.style.filter=ad>.02?`blur(${Math.min(ad*16,14).toFixed(1)}px)`:'none';
    g.style.opacity=(1-clamp(ad-.6)*2.5).toFixed(3);
    const w=svWords[i];
    w.style.opacity=(clamp(1-ad*1.6)*.95).toFixed(3);
    w.style.transform=`translateY(-50%) translateX(${(d*-18).toFixed(2)}vw)`;
    const vis=clamp(1-ad*3);
    svInfo[i].style.opacity=vis.toFixed(3);svInfo[i].style.transform=`translateY(${(d*-40).toFixed(1)}px)`;
    svStat[i].style.opacity=vis.toFixed(3);svStat[i].style.transform=`translateY(${(d*-60).toFixed(1)}px)`;
  }
}

/* v3 · móvil vertical: la palabra gigante de cada servicio cabe entera en pantalla */
function fitSvWords(){
  svWords.forEach(w=>{w.style.fontSize='';
    if(innerWidth>900)return;
    const max=innerWidth*.94, cur=w.scrollWidth;
    if(cur>max){const fs=parseFloat(getComputedStyle(w).fontSize);w.style.fontSize=(fs*max/cur).toFixed(1)+'px';}
  });
}
fitSvWords();addEventListener('resize',fitSvWords);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitSvWords);

/* manifesto word reveal */
const mf=document.getElementById('mf');
(function splitWords(el){
  const walk=n=>{[...n.childNodes].forEach(c=>{
    if(c.nodeType===3){const frag=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(tok=>{if(!tok)return;if(/^\s+$/.test(tok))frag.appendChild(document.createTextNode(tok));else{const s=document.createElement('span');s.className='w';s.textContent=tok;frag.appendChild(s);}});c.replaceWith(frag);}
    else if(c.classList&&c.classList.contains('serif')){c.classList.add('w');}
    else if(c.classList&&c.classList.contains('dotw')){c.classList.add('w');}
    else walk(c);
  })};walk(el);
})(mf);
const mfWords=[...mf.querySelectorAll('.w')];

/* method */
const mSteps=[...document.querySelectorAll('.m-step')];
const mFill=document.querySelector('.m-line .fill'),mRun=document.querySelector('.m-line .runner'),mBig=document.getElementById('m-big');
const mStops=[0,.27,.53,.79];
function drawMethod(p){
  const q=ease(seg(p,.05,.95));
  const line=LAYOUT.mLine;
  const pos=isMobile()?q:q*.79+.0;
  mFill.style.transform=`scaleX(${pos.toFixed(4)})`;mRun.style.transform=`translateX(${pos*line}px)`;
  let cur=0;mStops.forEach((s,i)=>{if((isMobile()?q*.999:pos)>=(isMobile()?i/4:s)-.001)cur=i;});
  mSteps.forEach((el,i)=>{el.classList.toggle('on',i<=cur);el.classList.toggle('cur',i===cur);});
  mBig.textContent=String(cur+1).padStart(2,'0');
}

/* closing */
const cDot=document.getElementById('c-dot');
function drawClose(p){
  const W=innerWidth,H=innerHeight,diag=Math.hypot(W,H);
  const g=ease(seg(p,.12,.55));
  const sc=lerp(1,diag/40*1.05,g)*(1+.05*Math.sin(perf()*2.1)*(1-g));
  cDot.style.clipPath=`circle(${(20*sc).toFixed(2)}px at 50% 50%)`;
}
const perf=()=>performance.now()/1000;

/* nav, rail, cursor */
const nav=document.getElementById('nav'),rail=document.querySelector('.rail'),railDot=rail.querySelector('b');
const navLinks=[...document.querySelectorAll('.nav-links a')];
function navTheme(){
  const y=40;let theme='dark',red=false,solid=false;
  for(const [el,r] of LAYOUT.nav){if(r.top<=y&&r.bottom>y){
    const n=el.dataset.nav;
    if(n==='red'){theme='light';red=true;}
    else if(n==='dynamic'){
      if(el.id==='servicios'){theme=svState.bgLight?'light':'dark';red=svState.onRed;}
      else {const s=byId.cierre;const red2=s.sp>.4;theme=red2?'light':'dark';red=red2;}
    } else theme=n;
    solid=!el.classList.contains('scrub');
    break;}}
  nav.classList.toggle('solid',solid);
  nav.classList.toggle('light',theme==='light');nav.classList.toggle('on-red',red);
  rail.classList.toggle('light',theme==='light');rail.classList.toggle('on-red',red);
  railDot.style.transform=`translateY(${(clamp(scrollY/LAYOUT.max)*LAYOUT.rail).toFixed(1)}px)`;
  let act=null;secs.forEach(s=>{const r=s.r;if(r.top<=innerHeight*.5&&r.bottom>innerHeight*.5)act=s.id;});
  navLinks.forEach(a=>a.classList.toggle('active',a.dataset.sec===act));
}

const cur=document.querySelector('.cursor'),ring=document.querySelector('.cursor-ring'),ringLbl=ring.querySelector('span');
let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my,cx=mx,cy=my;
addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;if(e.pointerType==='mouse')document.body.classList.add('has-pointer');});
document.querySelectorAll('a,button,[data-cursor]').forEach(el=>{
  el.addEventListener('pointerenter',()=>{if(el.dataset.cursor){ringLbl.textContent=el.dataset.cursor;ring.classList.add('big');}else ring.style.borderColor='rgba(227,35,45,.9)';});
  el.addEventListener('pointerleave',()=>{ring.classList.remove('big');ring.style.borderColor='';});
});

/* sistema index + counter */
const sIdx=[...document.querySelectorAll('.s-index span')],sNum=document.getElementById('s-num');

/* ---------- main loop ---------- */
addEventListener('resize',()=>{S1.fit();S2.fit();});
function frame(){
  const t=perf();
  readProgress();
  secs.forEach(s=>{s.sp+= (s.p-s.sp)*(SNAP?1:.12); s.sp=clamp(s.sp,s.p-.035,s.p+.035); if(Math.abs(s.p-s.sp)<1e-4)s.sp=s.p;});
  const o=byId.origen,s2=byId.sistema,sv=byId.servicios,me=byId.metodo,cl=byId.cierre;
  if(o.vis){drawS1(o.sp,t);applyFades(o);}
  // al soltarse, Sistema (ya todo rojo) se desvanece y deja ver Servicios, que espera fijado debajo
  s2.el.firstElementChild.style.opacity=(1-sst(seg(s2.leave,0,.4))).toFixed(3);
  if(s2.vis){drawS2(s2.sp,t);applyFades(s2);
    const ci=s2.sp<.32?0:s2.sp<.6?1:2;sIdx.forEach((e,i)=>e.classList.toggle('on',i===ci));
    const n=Math.round(1+ Math.pow(seg(s2.sp,.05,.88),2.2)*9998);sNum.textContent=String(n).padStart(4,'0');}
  if(sv.vis)drawServices(sv.sp);
  if(me.vis)drawMethod(me.sp);
  if(cl.vis){drawClose(cl.sp);applyFades(cl);}
  // manifesto
  const r=LAYOUT.mf;const mp=clamp((innerHeight*.85-r.top)/(r.height+innerHeight*.35));
  const on=Math.floor(mp*mfWords.length);mfWords.forEach((w,i)=>w.classList.toggle('on',i<on));
  navTheme();
  // lean del cursor (máx. ±0.5) y marquee que se inclina con la velocidad del scroll
  LEAN.x+=((mx/innerWidth-.5)-LEAN.x)*.06;LEAN.y+=((my/innerHeight-.5)-LEAN.y)*.06;
  const v=scrollY-lastY;lastY=scrollY;vel+=(v-vel)*.1;
  if(mq)mq.style.transform=`skewX(${clamp(-vel*.25,-12,12).toFixed(2)}deg)`;
  cx+=(mx-cx)*.55;cy+=(my-cy)*.55;rx+=(mx-rx)*.16;ry+=(my-ry)*.16;
  cur.style.transform=`translate(${cx}px,${cy}px)`;ring.style.transform=`translate(${rx}px,${ry}px)`;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------- v2 · LOADER: progreso real (fuentes + recursos), mínimo 2,5 s, el visitante decide cuándo entrar ---------- */
(function loader(){
  const L=document.getElementById('loader');if(!L)return;
  const bar=document.getElementById('ld-bar'),num=document.getElementById('ld-n'),enter=document.getElementById('ld-enter');
  const t0=performance.now(),MIN=RM?600:2500;
  let real=.08,shown=0,done=false,gone=false;
  const steps={fonts:false,load:document.readyState==='complete'};
  const upd=()=>{real=Math.max(real,.08+.46*steps.fonts+.46*steps.load)};
  (document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{steps.fonts=true;upd()});
  addEventListener('load',()=>{steps.load=true;upd()});upd();
  const go=()=>{if(!done||gone)return;gone=true;L.classList.add('out');document.documentElement.classList.remove('loading');
    ['wheel','touchmove','keydown'].forEach(e=>removeEventListener(e,tryGo));setTimeout(()=>L.remove(),900);};
  const tryGo=e=>{if(!done)return;if(e.type==='wheel'||e.type==='touchmove')e.preventDefault();go();};
  addEventListener('wheel',tryGo,{passive:false});addEventListener('touchmove',tryGo,{passive:false});addEventListener('keydown',tryGo);
  enter.addEventListener('click',go);L.addEventListener('click',go);
  (function tick(){
    const target=Math.min(real,(performance.now()-t0)/MIN);
    const dlt=target-shown;shown+=dlt>0?Math.min(dlt,Math.max(dlt*.1,.006)):0;if(target>=1&&shown>.995)shown=1;
    bar.style.strokeDashoffset=(1-shown).toFixed(4);
    num.textContent=String(Math.round(shown*100)).padStart(3,'0');
    if(shown===1&&!done){done=true;enter.classList.add('on');enter.tabIndex=0;num.parentElement.lastChild.textContent='Núcleo listo';}
    if(!gone)requestAnimationFrame(tick);
  })();
})();

/* ---------- v2 · texto que se descifra (una vez, al 50 % visible) ---------- */
const GLY='*#%&/+=';
const scr=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;scr.unobserve(e.target);
  const el=e.target,txt=el.dataset.final;if(RM){el.textContent=txt;return;}
  const per=1200/Math.max(txt.length,1),t0=performance.now();
  const id=setInterval(()=>{
    const k=Math.floor((performance.now()-t0)/per);
    el.textContent=[...txt].map((c,i)=>i<k||c===' '?c:GLY[Math.random()*GLY.length|0]).join('');
    if(k>=txt.length){clearInterval(id);el.textContent=txt;}
  },30);
}),{threshold:.5});
document.querySelectorAll('[data-scramble]').forEach(el=>{el.dataset.final=el.textContent;el.setAttribute('aria-label',el.textContent);scr.observe(el);});

/* ---------- v2 · censura que se retira (120 ms entre barras; una queda sellada hasta el clic) ---------- */
const reds=[...document.querySelectorAll('.redact')];
reds.forEach(r=>r.style.setProperty('--r',(Math.random()*2-1).toFixed(2)+'deg'));
const redIO=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;redIO.unobserve(e.target);
  [...e.target.querySelectorAll('.redact:not([data-seal])')].forEach((r,i)=>{r.style.setProperty('--d',(i*120+200)+'ms');r.classList.add('open');});
}),{threshold:.45});
document.querySelectorAll('.pain-card').forEach(c=>redIO.observe(c));
document.querySelectorAll('.redact[data-seal]').forEach(r=>{r.setAttribute('role','button');r.tabIndex=0;
  const open=()=>{r.style.setProperty('--d','0ms');r.classList.add('open');r.removeAttribute('data-cursor');};
  r.addEventListener('click',open);r.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});});

/* ---------- v2 · calculadora ---------- */
const $=id=>document.getElementById(id);
const fmt=n=>n.toLocaleString('es-ES',{maximumFractionDigits:1});
const ranges=['r-team','r-hours','r-share'].map($);
// los tres resultados se mueven juntos y con suavidad hacia el valor nuevo; el bucle se para cuando llega
const resWeek=$('res-week'),resYear=$('res-year'),resMonths=$('res-months');
let shownWeek=12,targetWeek=12,rolling=false,lastTxt='';
function calc(){
  ranges.forEach(r=>r.style.setProperty('--p',((r.value-r.min)/(r.max-r.min)*100)+'%'));
  const team=+ranges[0].value,h=+ranges[1].value,sh=+ranges[2].value/100;
  $('o-team').textContent=team;$('o-hours').textContent=h+' h';$('o-share').textContent=Math.round(sh*100)+' %';
  return team*h*sh;
}
function paint(w){
  const week=Math.round(w*2)/2, year=Math.round(w*46), months=Math.round(w*46/160*2)/2;
  const txt=week+'|'+year+'|'+months;if(txt===lastTxt)return;lastTxt=txt;
  resWeek.textContent=fmt(week);resYear.textContent=fmt(year)+' h';resMonths.textContent=fmt(months);
}
function roll(){
  shownWeek+=(targetWeek-shownWeek)*.2;
  if(Math.abs(targetWeek-shownWeek)<.02){shownWeek=targetWeek;rolling=false;}
  paint(shownWeek);if(rolling)requestAnimationFrame(roll);
}
targetWeek=shownWeek=calc();paint(shownWeek);
ranges.forEach(r=>r.addEventListener('input',()=>{targetWeek=calc();if(!rolling){rolling=true;requestAnimationFrame(roll);}}));

/* ---------- v3 · formulario: se envía directo a info.ezyron@gmail.com (Web3Forms), sin abrir el correo del visitante ---------- */
// Clave pública de Web3Forms (no es secreta: solo permite enviar a info.ezyron@gmail.com). Se obtiene gratis en https://web3forms.com
const W3F_KEY='PEGAR_AQUI_LA_CLAVE_DE_WEB3FORMS';
const MAIL_TO='info.ezyron@gmail.com';
const leadForm=$('lead-form'),leadBtn=leadForm.querySelector('button[type=submit]'),leadLbl=leadBtn.lastChild;
leadForm.addEventListener('submit',async e=>{
  e.preventDefault();const f=e.target,msg=$('form-msg');
  msg.classList.remove('ok','err');
  // todos los campos rellenos (sin contar espacios) y email válido
  [...f.elements].forEach(x=>{if(x.required){x.setCustomValidity(x.value.trim()?'':'vacío');}});
  if(!f.checkValidity()){const bad=[...f.elements].find(x=>x.willValidate&&!x.checkValidity());bad&&bad.focus();
    const name=bad&&bad.closest('.lf')?bad.closest('.lf').querySelector('span').textContent.toLowerCase():'un campo';
    msg.textContent=(bad&&bad.type==='email'&&bad.value.trim()?'Revisa el email.':'Falta '+name+'.');msg.classList.add('err');return;}
  if(f.botcheck&&f.botcheck.checked)return; // trampa anti-spam
  const d=Object.fromEntries(new FormData(f));
  const body=`Hola Ezyron,\n\nSoy ${d.nombre} (${d.email}).\n\nLo que se repite cada semana:\n${d.tarea}\n`;
  const fallback=()=>{location.href='mailto:'+MAIL_TO+'?subject='+encodeURIComponent('Diagnóstico · '+d.nombre)+'&body='+encodeURIComponent(body);};
  if(!/^[0-9a-f-]{36}$/i.test(W3F_KEY)){fallback();msg.textContent='Listo: revisa tu programa de correo.';return;}
  leadBtn.disabled=true;leadBtn.setAttribute('aria-busy','true');const lbl=leadLbl.textContent;leadLbl.textContent='Enviando…';msg.textContent='';
  try{
    const r=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},
      body:JSON.stringify({access_key:W3F_KEY,subject:'Diagnóstico web · '+d.nombre.trim(),from_name:'Web Ezyron',replyto:d.email.trim(),
        nombre:d.nombre.trim(),email:d.email.trim(),'Qué se repite':d.tarea.trim(),botcheck:''})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok||j.success===false)throw new Error(j.message||r.status);
    f.reset();msg.textContent='Recibido. Te respondemos muy pronto.';msg.classList.add('ok');leadLbl.textContent='Enviado';
    setTimeout(()=>{leadLbl.textContent=lbl;},4000);
  }catch(err){
    leadLbl.textContent=lbl;
    msg.innerHTML='';msg.classList.add('err');
    msg.append('No se pudo enviar. Prueba otra vez o escríbenos a ');const a=document.createElement('a');a.href='mailto:'+MAIL_TO;a.textContent=MAIL_TO;msg.append(a,'.');
  }finally{leadBtn.disabled=false;leadBtn.removeAttribute('aria-busy');}
});
leadForm.addEventListener('input',e=>{e.target.setCustomValidity&&e.target.setCustomValidity('');});

/* ---------- v2 · sacudida corta en los CTA (sin congelar el resto de animaciones) ---------- */
if(!RM)document.querySelectorAll('.btn,.pill.cta').forEach(b=>b.addEventListener('pointerdown',()=>{
  b.animate([{transform:'translateX(0)'},{transform:'translateX(4px)'},{transform:'translateX(-3px)'},{transform:'translateX(2px)'},{transform:'translateX(0)'}],{duration:150});
}));
})();
