const $=id=>document.getElementById(id),C=$('c'),X=C.getContext('2d'),say=m=>$('msg').textContent=m;
const W=C.width,H=C.height,S=40,HW=S*1.7321,RH=S*1.5,N=1000,MM=130;
const T={knight:{hp:100,atk:10,rng:1.3,spd:8,col:'#e0a030',g:'K'},archer:{hp:60,atk:9,rng:4,spd:7,col:'#5fbf6a',g:'A'},mage:{hp:50,atk:15,rng:3,spd:6,col:'#b08cff',g:'M'}};
const B={capital:{hp:900,col:'#d9a441',g:'C',R:1.5},mine:{hp:250,col:'#e8c84a',g:'G',R:1},barracks:{hp:350,col:'#c0603a',g:'B',R:1},anvil:{hp:1,col:'#b08cff',g:'?',R:1},vault:{hp:1,col:'#b08cff',g:'?',R:1}};
const COST={mine:6,barracks:8,knight:3,archer:3,mage:4};
const DEF={pc:[80,920],ec:[920,80],secrets:[{type:'anvil',c:300,r:640,h:[325,610]},{type:'vault',c:640,r:330,h:[610,350]}]};
const wx=(c,r)=>HW*(c+.5*(r&1)),wy=(c,r)=>RH*r;
const hs=(c,r)=>{let h=Math.imul(c,374761393)^Math.imul(r,668265263);h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)%100};
let g,cam,z=.8,tool=null,drag=null,mouse={x:0,y:0},fx=[],shots=[],time=0;
function bld(type,c,r,team,secret){const b={type,c,r,team,x:wx(c,r),y:wy(c,r),hp:B[type].hp,max:B[type].hp,secret:!!secret,found:false,alive:true};g.b.push(b);return b}
const stat=u=>{const t=T[u.type],m=1+.5*(u.lvl-1);u.max=u.hp=t.hp*m;u.atk=t.atk*m};
function spawn(type,team,x,y,lvl){const u={type,team,lvl,x:x+(Math.random()-.5)*40,y:y+(Math.random()-.5)*40,cd:0,l:0,h:0,dx:0,dy:0,tg:null,rt:Math.random()*.4,alive:true};stat(u);g.u.push(u)}
async function newGame(){let m;try{m=await(await fetch('/api/map')).json()}catch(e){m=DEF}
 g={gold:20,eg:20,t:0,mode:'play',u:[],b:[],lvl:0,found:0,rally:null,cd:0,ecd:2,uit:0};
 g.pc=bld('capital',m.pc[0],m.pc[1],0);g.ec=bld('capital',m.ec[0],m.ec[1],1);m.secrets.forEach(s=>{bld(s.type,s.c,s.r,2,1).h=s.h});
 fx=[];shots=[];tool=null;cam={x:g.pc.x,y:g.pc.y};z=.8;say('Build a barracks and a gold mine near your capital, then train units. Find the 2 secrets.');ui()}
function ui(){$('gold').textContent=g.gold|0;$('time').textContent=(g.t/60|0)+':'+('0'+(g.t%60|0)).slice(-2);$('sec').textContent=g.found+'/2';
 document.querySelectorAll('[data-k]').forEach(b=>{b.classList.toggle('sel',b.dataset.k==tool);b.disabled=g.mode!='play'||g.gold<COST[b.dataset.k]})}
function train(k){const bs=g.b.filter(b=>b.alive&&b.team==0&&b.type=='barracks');if(!bs.length)return say('Build a barracks first.');
 if(g.gold<COST[k]||g.cd>0)return;const b=bs[Math.random()*bs.length|0];g.gold-=COST[k];g.cd=.3;spawn(k,0,b.x,b.y,1+g.lvl)}
document.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(k=='mine'||k=='barracks')tool=tool==k?null:k;else train(k);ui()});
const clampCam=()=>{cam.x=Math.max(0,Math.min(wx(N-1,0)+HW,cam.x));cam.y=Math.max(0,Math.min(RH*(N-1),cam.y))};
const zoom=f=>z=Math.min(1.5,Math.max(.12,z*f));
$('zi').onclick=()=>zoom(1.3);$('zo').onclick=()=>zoom(1/1.3);$('home').onclick=()=>{cam={x:g.pc.x,y:g.pc.y}};$('new').onclick=newGame;
const pos=e=>{const r=C.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}};
function cellAt(x,y){const r0=Math.round(y/RH);let best=null,bd=S*.9;for(let r=r0-1;r<=r0+1;r++)for(let c=Math.floor(x/HW)-1;c<=Math.floor(x/HW)+1;c++){if(c<0||r<0||c>=N||r>=N)continue;const d=Math.hypot(wx(c,r)-x,wy(c,r)-y);if(d<bd){bd=d;best=[c,r]}}return best}
C.onpointerdown=e=>{mouse=pos(e);drag={p:mouse,m:false};C.setPointerCapture(e.pointerId)};
C.onpointermove=e=>{const p=pos(e);if(drag){if(Math.hypot(p.x-drag.p.x,p.y-drag.p.y)>5)drag.m=true;if(drag.m){cam.x-=(p.x-mouse.x)/z;cam.y-=(p.y-mouse.y)/z;clampCam()}}mouse=p};
C.onpointerup=e=>{const p=pos(e);if(drag&&!drag.m)click(p);drag=null};
C.onwheel=e=>{e.preventDefault();zoom(e.deltaY<0?1.15:1/1.15)};
function click(p){if(g.mode!='play')return;
 if(p.x>W-MM-6&&p.y<MM+6){cam.x=(p.x-(W-MM-6))/MM*N*HW;cam.y=(p.y-6)/MM*N*RH;clampCam();return}
 const cell=cellAt((p.x-W/2)/z+cam.x,(p.y-H/2)/z+cam.y);if(!cell)return;const x=wx(...cell),y=wy(cell[0],cell[1]);
 if(tool){if(Math.hypot(x-g.pc.x,y-g.pc.y)>14*HW)return say('Build within 14 hexes of your capital.');
  if(g.b.some(b=>b.alive&&Math.hypot(b.x-x,b.y-y)<HW*1.2))return say('That hex is taken.');
  if(g.gold<COST[tool])return;g.gold-=COST[tool];bld(tool,cell[0],cell[1],0);say(tool=='mine'?'Gold mine built (+1.5 gold/s).':'Barracks built. Train units now.');tool=null;ui()}
 else{g.rally={x,y};say('Rally point set. Your army gathers there.')}}
function hit(e,d){e.hp-=d;e.h=.12;fx.push({k:'num',x:e.x,y:e.y-16,t:0,s:Math.round(d)});
 if(e.hp<=0&&e.alive){e.alive=false;fx.push({k:'ring',x:e.x,y:e.y,t:0,col:e.type in T?T[e.type].col:'#fff'});if(e==g.ec)finish(1);if(e==g.pc)finish(0)}}
function finish(win){g.mode=win?'won':'over';say(win?'Victory! The red capital has fallen.':'Defeat. Your capital has fallen. Press New game.');ui()}
function step(dt){g.t+=dt;g.cd-=dt;g.ecd-=dt;
 g.gold+=(1+1.5*g.b.filter(b=>b.alive&&b.team==0&&b.type=='mine').length)*dt;g.eg+=(1.2+g.t/200)*dt;
 if(g.ecd<=0){const k=['knight','archer','mage'][Math.random()*3|0];if(g.eg>=COST[k]){g.eg-=COST[k];spawn(k,1,g.ec.x,g.ec.y,1+(g.t/150|0));g.ecd=2}}
 const us=g.u.filter(u=>u.alive),bs=g.b.filter(b=>b.alive&&!b.secret);
 for(const u of us){const t=T[u.type];u.l=Math.max(0,u.l-dt);u.h=Math.max(0,u.h-dt);u.cd-=dt;u.rt-=dt;
  if(u.rt<=0||(u.tg&&!u.tg.alive)){u.rt=.4;let e=null,d=9*HW;
   for(const v of us)if(v.team!=u.team){const k=Math.hypot(v.x-u.x,v.y-u.y);if(k<d){d=k;e=v}}
   for(const v of bs)if(v.team!=u.team){const k=Math.hypot(v.x-u.x,v.y-u.y)-HW*B[v.type].R;if(k<d){d=k;e=v}}
   u.tg=e}
  let tx,ty,att=false;
  if(u.tg){tx=u.tg.x;ty=u.tg.y;att=Math.hypot(tx-u.x,ty-u.y)<=t.rng*HW+(u.tg.c!=null?B[u.tg.type].R*HW*.7:0)}
  else{const G=u.team?g.pc:(g.rally||g.ec);tx=G.x;ty=G.y}
  const k=Math.hypot(tx-u.x,ty-u.y)||1;u.dx=(tx-u.x)/k;u.dy=(ty-u.y)/k;u.mv=!att&&k>HW*.8;
  if(u.mv){u.x+=u.dx*t.spd*HW*dt;u.y+=u.dy*t.spd*HW*dt}
  else if(att&&u.cd<=0){u.cd=.9;u.l=.2;if(t.rng>2)shots.push({x:u.x,y:u.y,t:u.tg,d:u.atk,col:t.col});else hit(u.tg,u.atk)}}
 for(const a of us)for(const b of us)if(a<b){const d=Math.hypot(a.x-b.x,a.y-b.y);if(d<22&&d>0){const p=(22-d)/2/d,dx=(a.x-b.x)*p,dy=(a.y-b.y)*p;a.x+=dx;a.y+=dy;b.x-=dx;b.y-=dy}}
 shots=shots.filter(s=>{if(!s.t.alive)return false;const dx=s.t.x-s.x,dy=s.t.y-s.y,d=Math.hypot(dx,dy);if(d<10){hit(s.t,s.d);return false}s.x+=dx/d*700*dt;s.y+=dy/d*700*dt;return true});
 for(const b of g.b)if(b.secret&&!b.found&&us.some(u=>u.team==0&&Math.hypot(u.x-b.x,u.y-b.y)<3*HW)){b.found=true;g.found++;fx.push({k:'ring',x:b.x,y:b.y,t:0,col:'#b08cff'});
  if(b.type=='vault'){g.gold+=200;say('Secret found: the Sunken Vault! +200 gold.')}
  else{g.lvl++;g.u.forEach(u=>{if(u.team==0){u.lvl++;stat(u)}});say('Secret found: the Ancient Anvil! Your army is forged up a level, and new units start stronger.')}}
 g.u=g.u.filter(u=>u.alive);if((g.uit-=dt)<=0){g.uit=.25;ui()}}
const hex=(x,y,s)=>{X.beginPath();for(let i=0;i<6;i++){const a=Math.PI/180*(60*i-30);X[i?'lineTo':'moveTo'](x+s*Math.cos(a),y+s*Math.sin(a))}X.closePath()};
const sc=(x,y)=>[(x-cam.x)*z+W/2,(y-cam.y)*z+H/2];
function draw(){X.fillStyle='#141c28';X.fillRect(0,0,W,H);X.textAlign='center';
 const r0=Math.max(0,Math.floor((cam.y-H/2/z)/RH)-1),r1=Math.min(N-1,Math.ceil((cam.y+H/2/z)/RH)+1),c0=Math.max(0,Math.floor((cam.x-W/2/z)/HW)-1),c1=Math.min(N-1,Math.ceil((cam.x+W/2/z)/HW)+1);
 for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){const[x,y]=sc(wx(c,r),wy(c,r)),v=hs(c,r);X.fillStyle=v<10?'#1f3550':v<55?'#26354a':'#2c3d56';hex(x,y,S*z-(z>.35?1:0));X.fill();if(z>.35){X.strokeStyle='#8a7340';X.lineWidth=1;X.stroke()}}
 if(tool||!drag){const cl=cellAt((mouse.x-W/2)/z+cam.x,(mouse.y-H/2)/z+cam.y);if(cl&&z>.35){const[x,y]=sc(wx(...cl),wy(cl[0],cl[1]));hex(x,y,S*z-1);X.strokeStyle=tool?'#ffd34d':'#6ab8ff';X.lineWidth=2;X.stroke()}}
 if(g.rally){const[x,y]=sc(g.rally.x,g.rally.y);X.fillStyle='#6ab8ff';X.fillRect(x-1,y-16,2,16);X.beginPath();X.moveTo(x+1,y-16);X.lineTo(x+11,y-12);X.lineTo(x+1,y-8);X.fill()}
 for(const b of g.b){if(!b.alive||(b.secret&&!b.found))continue;const[x,y]=sc(b.x,b.y);if(x<-60||x>W+60||y<-60||y>H+60)continue;const d=B[b.type],s=Math.max(5,S*z*d.R);
  hex(x,y,s);X.fillStyle=d.col;X.fill();X.strokeStyle=b.team==0?'#6ab8ff':b.team==1?'#ff6a3d':'#fff';X.lineWidth=2;X.stroke();
  if(s>9){X.fillStyle='#1c2431';X.font='bold '+(s*.9|0)+'px system-ui';X.fillText(d.g,x,y+s*.3)}
  if(b.hp<b.max&&!b.secret){X.fillStyle='#2a1418';X.fillRect(x-s,y+s+3,2*s,4);X.fillStyle=b.team?'#ff6a3d':'#5fd06f';X.fillRect(x-s,y+s+3,2*s*Math.max(0,b.hp/b.max),4)}}
 for(const u of g.u){if(!u.alive)continue;let[x,y]=sc(u.x,u.y);if(x<-20||x>W+20||y<-20||y>H+20)continue;const t=T[u.type],r=Math.max(2.5,13*z),mv=u.mv&&g.mode=='play',
  bob=(mv?Math.sin(time*12+u.x)*2:Math.sin(time*2+u.y)*1.2)*z,lg=u.l>0?Math.sin(u.l/.2*Math.PI)*10*z:0,px=x+u.dx*lg,py=y+bob+u.dy*lg;
  X.fillStyle=u.h>0?'#fff':t.col;X.strokeStyle=u.team?'#ff6a3d':'#6ab8ff';X.lineWidth=Math.max(1,3*z);X.beginPath();X.arc(px,py,r,0,7);X.fill();X.stroke();
  if(r>8){X.fillStyle='#1c2431';X.font='bold '+(r|0)+'px system-ui';X.fillText(t.g,px,py+r*.35)}
  if(z>.5){for(let i=0;i<u.lvl;i++){X.fillStyle='#ffd34d';X.fillRect(px-u.lvl*3+i*6,py-r-8,4,4)}
   X.fillStyle='#2a1418';X.fillRect(px-r,py+r+4,2*r,4);X.fillStyle=u.team?'#ff6a3d':'#5fd06f';X.fillRect(px-r,py+r+4,2*r*Math.max(0,u.hp/u.max),4)}}
 for(const s of shots){const[x,y]=sc(s.x,s.y);X.fillStyle=s.col;X.shadowColor=s.col;X.shadowBlur=10;X.beginPath();X.arc(x,y,Math.max(2,4*z),0,7);X.fill();X.shadowBlur=0}
 for(const f of fx){const k=f.t/.6,[x,y]=sc(f.x,f.y);if(f.k=='ring'){X.strokeStyle=f.col;X.globalAlpha=1-k;X.lineWidth=3;X.beginPath();X.arc(x,y,(10+k*26)*Math.max(z,.5),0,7);X.stroke();X.globalAlpha=1}
  else if(z>.5){X.globalAlpha=1-k;X.fillStyle='#fff';X.font='bold 13px system-ui';X.fillText(f.s,x,y-k*22);X.globalAlpha=1}}
 const ox=W-MM-6,oy=6,m=MM/N;X.fillStyle='rgba(14,20,29,.85)';X.fillRect(ox,oy,MM,MM);X.strokeStyle='#8a7340';X.lineWidth=1;X.strokeRect(ox,oy,MM,MM);
 for(const b of g.b){if(!b.alive)continue;if(b.secret){if(b.found){X.fillStyle='#b08cff';X.fillRect(ox+b.c*m-2,oy+b.r*m-2,4,4)}else{X.strokeStyle='rgba(176,140,255,'+(.4+.3*Math.sin(time*3))+')';X.beginPath();X.arc(ox+b.h[0]*m,oy+b.h[1]*m,60*m,0,7);X.stroke()}continue}
  X.fillStyle=b.team?'#ff6a3d':'#6ab8ff';const s=b.type=='capital'?5:3;X.fillRect(ox+b.c*m-s/2,oy+b.r*m-s/2,s,s)}
 for(const u of g.u){X.fillStyle=u.team?'#ff6a3d':'#6ab8ff';X.fillRect(ox+u.x/HW*m,oy+u.y/RH*m,1.5,1.5)}
 X.strokeStyle='#fff';X.strokeRect(ox+(cam.x-W/2/z)/HW*m,oy+(cam.y-H/2/z)/RH*m,W/z/HW*m,H/z/RH*m);
 if(g.mode!='play'){X.fillStyle='rgba(0,0,0,.55)';X.fillRect(0,0,W,H);X.fillStyle=g.mode=='won'?'#d9a441':'#ff6a3d';X.font='bold 44px Georgia,serif';X.fillText(g.mode=='won'?'Victory':'Defeat',W/2,H/2+10)}}
let last=performance.now();
newGame().then(()=>(function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;time+=dt;if(g.mode=='play')step(dt);fx=fx.filter(f=>(f.t+=dt)<.6);draw();requestAnimationFrame(loop)})(last));
