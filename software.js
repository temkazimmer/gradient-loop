import {smooth} from './field.js';
const original=['#101010','#210a51','#b90b19','#ff871e','#f2efa0'];
const parse=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
function palette(t,colors){const factors=[smooth(0,.18,t),smooth(.13,.43,t),smooth(.34,.7,t),smooth(.65,.98,t)];return [0,1,2].map(c=>{let v=colors[0][c];for(let j=0;j<4;j++)v=v*(1-factors[j])+colors[j+1][c]*factors[j];return v;});}
export function softwareRenderer(canvas){
 const ctx=canvas.getContext('2d'),buffer=document.createElement('canvas'),b=buffer.getContext('2d');let pixels;
 return(s,phase,image)=>{
  if(!pixels){buffer.width=image.width;buffer.height=image.height;b.drawImage(image,0,0);pixels=b.getImageData(0,0,image.width,image.height).data;}
  const rect=canvas.getBoundingClientRect(),h=280,w=Math.max(1,Math.round(h*rect.width/rect.height));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  const output=ctx.createImageData(w,h),colors=['background','violet','red','orange','core'].map(k=>parse(s[k])),base=original.map(parse);
  const t=phase+(s.easing<.5?0:s.easing<1.5?.12:.04)*Math.sin(phase*2*Math.PI)/(2*Math.PI),f=((t%1+1)%1)*120,i=Math.floor(f),j=(i+1)%120,blend=f-i;
  function sample(frame,u,v){const x=(frame%15)*216+1+Math.round(u*213),y=Math.floor(frame/15)*282+1+Math.round(v*279),index=(y*3240+x)*4;return [0,1,2].map(c=>pixels[index+c]/255);}
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   let px=(x+.5-w/2)/h/s.zoom*.19/s.radius,py=(h/2-y-.5)/h/s.zoom/s.stretch;py-=Math.sign(py)*(s.gap-.04)*.5;
   const u=px/(214/280)+.5,v=.5-py,index=(y*w+x)*4;let c=colors[0];
   if(u>=0&&u<=1&&v>=0&&v<=1){const a=sample(i,u,v),z=sample(j,u,v),q0=sample((i+119)%120,u,v),q3=sample((i+2)%120,u,v),rgb=a.map((b,k)=>Math.max(0,Math.min(1,.5*(2*b+(-q0[k]+z[k])*blend+(2*q0[k]-5*b+4*z[k]-q3[k])*blend**2+(-q0[k]+3*b-3*z[k]+q3[k])*blend**3)))),l=rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
    const old=palette(l,base),edited=palette(Math.min(1,l*s.intensity)**(1/s.softness),colors);c=rgb.map((a,k)=>colors[0][k]+(a+edited[k]-old[k]-colors[0][k])*s.glow);
   }
   for(let k=0;k<3;k++)output.data[index+k]=(c[k]+(Math.sin(x*127.1+y*311.7)*43758.5453%1)*s.grain*.5)*255;output.data[index+3]=255;
  }
  ctx.putImageData(output,0,0);
 };
}
