import assert from 'node:assert/strict';
const cubic=(a,b,c,d,t)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
const frames=Array.from({length:120},(_,i)=>Math.sin(i*.17));
const sample=t=>{const f=((t%1+1)%1)*120,n=Math.floor(f),w=f-n;return cubic(frames[(n+119)%120],frames[n],frames[(n+1)%120],frames[(n+2)%120],w);};
assert.equal(sample(0),sample(1));
const h=1e-7;
assert.ok(Math.abs((sample(0)-sample(-h))/h-(sample(h)-sample(0))/h)<.1);
for(let i=0;i<120;i++)assert.ok(Math.abs(sample(i/120)-frames[i])<1e-10);
console.log('Passed: cyclic interpolation visits every source frame and matches position and velocity at the seam.');
