const NS='http://www.w3.org/2000/svg';
const W=1127,H=1396,K=240/H,X=(256-W*K)/2;
export async function createLightwingBody(base,{kit,host,loadImage,asset}){
  const [open,closed,peace,armBase]=await Promise.all(['idle.png','closed.png','peace.png','arm-base.png'].map(p=>loadImage(String(asset(p)))));
  const doc=host.root.ownerDocument,canvas=doc.createElement('canvas');
  canvas.width=564;canvas.height=698;canvas.style.cssText='display:block;width:100%;height:100%';
  const ctx=canvas.getContext('2d'),surface=doc.createElementNS(NS,'foreignObject');
  for(const [key,value] of Object.entries({x:X,y:16,width:W*K,height:240}))surface.setAttribute(key,String(value));
  surface.append(canvas);let mounted=false;
  const point=(x,y)=>[X+x*K,16+y*K];
  // Matched arm strips form a small deformable mesh. Geometry moves every frame;
  // texture mixing only joins the relaxed fingers to the V sign after alignment.
  const rings=[
    [[735,766],[774,748],[751,817],[817,807],[777,884],[865,879],[798,923],[857,917],[813,947],[862,939],[817,979],[883,972],[825,1026],[885,1020]],
    [[735,766],[774,748],[747,811],[795,776],[780,865],[887,859],[788,789],[876,813],[803,751],[857,774],[810,686],[909,718],[833,592],[920,632]]
  ];
  const outlines=[
    [[735,766],[773,748],[804,793],[837,839],[865,877],[860,911],[856,925],[863,944],[881,961],[887,989],[881,1011],[868,1024],[850,1027],[831,1019],[820,1004],[816,977],[811,948],[797,932],[783,900],[770,868],[755,833],[744,801]],
    [[735,766],[752,733],[775,711],[804,690],[817,660],[835,652],[842,607],[853,593],[865,602],[869,618],[865,648],[895,618],[908,613],[919,625],[914,640],[895,662],[906,678],[907,703],[889,727],[871,742],[864,776],[888,809],[898,835],[891,854],[875,869],[837,879],[805,875],[784,864],[767,843],[753,813]]
  ];
  // The forearm runs in opposite directions in the two source poses. Give it
  // its own elbow cross-section so it can rotate instead of flattening at halfway.
  for(let i=6;i<14;i+=2)[rings[1][i],rings[1][i+1]]=[rings[1][i+1],rings[1][i]];
  rings[0].push(rings[0][4],rings[0][5]);rings[1].push(rings[1][5],rings[1][4]);
  const triangles=[];
  for(const chain of [[14,6,8,10,12],[0,2,4]])for(let j=0;j<chain.length-1;j++){
    const a=chain[j],b=chain[j+1];triangles.push([a,a+1,b],[a+1,b+1,b]);
  }
  const lerp=(a,b,u)=>a+(b-a)*u;
  const angle=(a,b,u)=>{let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return a+d*u;};
  const centers=rings.map(r=>Array.from({length:7},(_,i)=>[(r[i*2][0]+r[i*2+1][0])/2,(r[i*2][1]+r[i*2+1][1])/2]));
  function armPoints(u){
    const c=[centers[0][0].map((v,j)=>lerp(v,centers[1][0][j],u))];
    for(let i=1;i<7;i++){
      const bone=centers.map(v=>[v[i][0]-v[i-1][0],v[i][1]-v[i-1][1]]);
      const a=angle(Math.atan2(bone[0][1],bone[0][0]),Math.atan2(bone[1][1],bone[1][0]),u),l=lerp(Math.hypot(...bone[0]),Math.hypot(...bone[1]),u);
      c.push([c[i-1][0]+Math.cos(a)*l,c[i-1][1]+Math.sin(a)*l]);
    }
    const out=[];
    for(let i=0;i<16;i+=2){
      const ci=i===14?2:i/2,v=rings.map(r=>[r[i+1][0]-r[i][0],r[i+1][1]-r[i][1]]);
      const a=angle(Math.atan2(v[0][1],v[0][0]),Math.atan2(v[1][1],v[1][0]),u),half=lerp(Math.hypot(...v[0]),Math.hypot(...v[1]),u)/2;
      const dx=Math.cos(a)*half,dy=Math.sin(a)*half;out.push([c[ci][0]-dx,c[ci][1]-dy],[c[ci][0]+dx,c[ci][1]+dy]);
    }
    return out;
  }
  const makeCanvas=()=>{const c=doc.createElement('canvas');c.width=W;c.height=H;return c;};
  const armImages=[open,peace].map((image,i)=>{
    const c=makeCanvas(),g=c.getContext('2d');g.beginPath();outlines[i].forEach(([x,y],j)=>j?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.clip();g.drawImage(image,0,0,W,H);return c;
  });
  const layers=[makeCanvas(),makeCanvas()],mixed=makeCanvas(),mix=mixed.getContext('2d');
  const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
  function triangle(g,image,src,dst){
    const [a,b,c]=src,[p,q,r]=dst;
    const sx=b[0]-a[0],sy=b[1]-a[1],tx=c[0]-a[0],ty=c[1]-a[1],det=sx*ty-sy*tx;
    if(Math.abs(det)<.01)return;
    const ux=q[0]-p[0],uy=q[1]-p[1],vx=r[0]-p[0],vy=r[1]-p[1];
    const A=(ux*ty-vx*sy)/det,B=(uy*ty-vy*sy)/det,C=(vx*sx-ux*tx)/det,D=(vy*sx-uy*tx)/det;
    g.save();g.beginPath();
    // A subpixel overlap prevents fine cracks between adjacent texture triangles.
    const cx=(p[0]+q[0]+r[0])/3,cy=(p[1]+q[1]+r[1])/3;
    for(const [i,v]of dst.entries()){const dx=v[0]-cx,dy=v[1]-cy,l=Math.hypot(dx,dy)||1,x=v[0]+dx/l*.65,y=v[1]+dy/l*.65;i?g.lineTo(x,y):g.moveTo(x,y);}
    g.closePath();g.clip();g.transform(A,B,C,D,p[0]-A*a[0]-C*a[1],p[1]-B*a[0]-D*a[1]);g.drawImage(image,0,0);g.restore();
  }
  let lastLift=-1;
  function arm(lift){
    if(lift===lastLift)return mixed;lastLift=lift;
    const target=armPoints(lift);
    for(let j=0;j<2;j++){
      const g=layers[j].getContext('2d');g.clearRect(0,0,W,H);
      // A cloth patch under the elbow covers the inside of the rotating joint.
      const e=[(target[4][0]+target[5][0])/2,(target[4][1]+target[5][1])/2],src=centers[j][2];
      g.save();g.beginPath();g.arc(e[0],e[1],34*Math.sin(Math.PI*lift),0,Math.PI*2);g.clip();g.drawImage(armImages[j],e[0]-src[0],e[1]-src[1]);g.restore();
      for(const tri of triangles)triangle(g,armImages[j],tri.map(i=>rings[j][i]),tri.map(i=>target[i]));
    }
    const texture=smooth((lift-.65)/.35);
    mix.clearRect(0,0,W,H);mix.globalCompositeOperation='source-over';mix.globalAlpha=1-texture;mix.drawImage(layers[0],0,0);
    mix.globalCompositeOperation='lighter';mix.globalAlpha=texture;mix.drawImage(layers[1],0,0);mix.globalAlpha=1;mix.globalCompositeOperation='source-over';return mixed;
  }
  const figure={colors:{z:'#c29356'},extent:[28,14,226,256],
    hits:[[...point(640,410),65],[...point(610,900),34]],
    anchors:{gaze:point(650,520),tear:point(548,565),tears:[point(548,565),point(735,558)],z:point(840,60),hearts:[...point(900,840),30],bubble:point(640,-30)},
    draw(group,face,f){
      if(!mounted){group.append(surface);mounted=true;}
      const moving=f.mode==='walk'||f.mode==='run',phase=f.t*(f.mode==='run'?17:10),step=moving?Math.sin(phase):0;
      ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);ctx.clearRect(0,0,W,H);ctx.save();
      const sit=Math.max(0,Math.min(1,f.sit||0));
      ctx.translate(620,1385);ctx.scale(1,1-.08*sit);ctx.translate(-620,-1385);
      ctx.translate(620,1218);ctx.rotate((Math.sin(f.t*1.6)*.35+step*.45)*Math.PI/180);ctx.translate(-620,-1218);
      // Lower panels and shoe strips cover disjoint regions; coat tails stay intact.
      ctx.save();ctx.beginPath();ctx.rect(0,0,W,1220);ctx.rect(0,1220,430,H-1220);ctx.rect(800,1220,W-800,H-1220);ctx.clip();ctx.drawImage(open,0,0,W,H);ctx.restore();
      const progress=f.gesture?.kind==='peace'?f.gesture.k:null;
      const lift=progress===null?0:progress<.30?smooth(progress/.30):progress>.68?1-smooth((progress-.68)/.30):1;
      // A stationary clean plate reveals the wing behind the moving arm.
      ctx.save();ctx.beginPath();ctx.rect(720,580,407,480);ctx.clip();ctx.clearRect(720,580,407,480);ctx.drawImage(armBase,0,0,W,H);ctx.drawImage(arm(lift),0,0);ctx.restore();
      for(const [i,x,w]of [[0,430,180],[1,610,190]]){
        const s=step*(i===0?1:-1);ctx.save();ctx.translate(x+w/2,1220);ctx.rotate(s*.11);ctx.translate(-x-w/2,-1220);
        ctx.drawImage(open,x*open.naturalWidth/W,1220*open.naturalHeight/H,w*open.naturalWidth/W,(H-1220)*open.naturalHeight/H,x,1220-Math.max(0,s)*7,w,H-1220);ctx.restore();
      }
      const shut=Math.max(f.blink||0,f.eyeClose||0)>.45||['sleep','sleepy','happy','love','cry','dizzy','bowing'].includes(f.face)||(f.face==='content'&&f.drowse>.7);
      if(shut||f.face==='wink'){
        ctx.save();ctx.beginPath();
        ctx.ellipse(548,522,83,76,0,0,Math.PI*2);
        if(shut){ctx.moveTo(806,510);ctx.ellipse(736,510,70,72,0,0,Math.PI*2);}
        ctx.clip();ctx.drawImage(closed,0,0,W,H);ctx.restore();
      }
      if(f.talk>.03){
        ctx.fillStyle='#8d3e3e';ctx.beginPath();ctx.ellipse(652,601,14,3+f.talk*12,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#ee9b96';ctx.beginPath();ctx.ellipse(652,607,9,3,0,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    }
  };
  return kit.createBody(host,{figure,words:{peace:{motion:{seconds:2.8}}}});
}
