import assert from 'node:assert/strict';
import {field} from './field.js';
for(const easing of [0,1,2]){
 const s={radius:.19,gap:.04,glow:1,softness:1,intensity:1,easing};
 for(let y=-.5;y<=.5;y+=.025)for(let x=-.4;x<=.4;x+=.025){
  assert.ok(Math.abs(field(x,y,0,s)-field(x,y,1,s))<1e-12,'Loop endpoints differ');
  const h=1e-5,left=(field(x,y,0,s)-field(x,y,-h,s))/h,right=(field(x,y,h,s)-field(x,y,0,s))/h;
  assert.ok(Math.abs(left-right)<.003,'Loop velocity discontinuity');
  for(const t of [0,.125,.25,.5,.75,1])assert.ok(Number.isFinite(field(x,y,t,s)));
 }
}
console.log('Passed: identical loop endpoints, continuous boundary velocity, finite field values for all easing modes.');
