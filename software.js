import {field,smooth} from './field.js';
// Same periodic field as the GPU shader; reduced resolution keeps fallback responsive.
export function softwareRenderer(canvas){
 const ctx=canvas.getContext('2d'),buffer=document.createElement('canvas'),b=buffer.getContext('2d');
 let img;
 return(s,phase)=>{
  const rect=canvas.getBoundingClientRect(),h=180,w=Math.max(1,Math.round(h*rect.width/rect.height));
  if(canvas.width!==Math.round(rect.width)||canvas.height!==Math.round(rect.height)){canvas.width=Math.round(rect.width);canvas.height=Math.round(rect.height);}
  if(buffer.width!==w||buffer.height!==h||!img){buffer.width=w;buffer.height=h;img=b.createImageData(w,h);}
  const colors=['background','violet','red','orange','core'].map(k=>[1,3,5].map(i=>parseInt(s[k].slice(i,i+2),16)));
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const value=field((x+.5-w/2)/h/s.zoom,(h/2-y-.5)/h/s.zoom/s.stretch,phase,s);
   const factors=[smooth(0,.18,value),smooth(.13,.43,value),smooth(.34,.7,value),smooth(.65,.98,value)];
   const hash=Math.sin((x+.5)*127.1+(h-y-.5)*311.7)*43758.5453,noise=(hash-Math.floor(hash)-.5)*s.grain*255,index=(y*w+x)*4;
   for(let c=0;c<3;c++){let v=colors[0][c];for(let j=0;j<4;j++)v=v*(1-factors[j])+colors[j+1][c]*factors[j];img.data[index+c]=v+noise;}
   img.data[index+3]=255;
  }
  b.putImageData(img,0,0);ctx.drawImage(buffer,0,0,canvas.width,canvas.height);
 };
}
