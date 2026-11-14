export const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function field(x,y,phase,s){
 let a=phase*2*Math.PI;
 a+=s.easing<.5?.12*Math.sin(a):s.easing<1.5?.28*Math.sin(a):0;
 const center=s.radius+s.gap*.5;
 const d=Math.min(Math.hypot(x,y-center),Math.hypot(x,y+center))-s.radius;
 const inside=1-smooth(-.002,.002,d),travel=y*5.5;
 const carrier=.5+.5*Math.cos(a-travel),band=.5+.5*Math.cos(a-travel-5*d);
 const fill=carrier**2.2,rim=band**5*Math.exp(-Math.abs(d)/(.13*s.glow*s.softness));
 const exterior=Math.exp(-Math.max(d,0)/(.16*s.glow))*(.5+.5*Math.sin(a-travel))**2;
 return Math.min(1,Math.max(0,(exterior*(1-inside)+fill*inside+rim*.48)*s.intensity)**(1/s.softness));
}
