import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {softwareRenderer} from './software.js';
const $ = s => document.querySelector(s);
const defaults = {background:'#101010',violet:'#210a51',red:'#b90b19',orange:'#ff871e',core:'#f2efa0',duration:4,phase:0,intensity:1,softness:1,radius:.19,gap:.04,stretch:1,glow:1,grain:0,zoom:1,easing:0,reverse:false};
const palettes={ember:{background:'#101010',violet:'#210a51',red:'#b90b19',orange:'#ff871e',core:'#f2efa0'},aurora:{background:'#091310',violet:'#12385c',red:'#087c80',orange:'#53d9a2',core:'#e5ffd3'},cobalt:{background:'#0a0c16',violet:'#211454',red:'#2536a4',orange:'#467dff',core:'#c4edff'},rose:{background:'#160d14',violet:'#3a154e',red:'#b82b69',orange:'#f28ba8',core:'#ffe1d6'}};
let settings={...defaults};
function validate(data){if(!data||typeof data!=='object')throw Error('Invalid settings');const result={};for(const key of Object.keys(defaults)){const v=data[key];if(v===undefined)continue;if(typeof defaults[key]==='string'){if(!/^#[\da-f]{6}$/i.test(v))throw Error('Invalid colour');}else if(typeof defaults[key]==='boolean'){if(typeof v!=='boolean')throw Error('Invalid switch');}else{if(typeof v!=='number'||!Number.isFinite(v))throw Error('Invalid number');const spec=specs.find(s=>s[1]===key);if(spec&&(v<spec[2]||v>spec[3]))throw Error('Value out of range');if(key==='easing'&&![0,1,2].includes(v))throw Error('Invalid easing');}result[key]=v;}return result;}
const specs=[['color','intensity',.3,1.8,.01,'Intensity','×'],['color','softness',.4,2,.01,'Gradient softness','×'],['motion','duration',1,12,.1,'Loop duration','s'],['motion','phase',0,1,.001,'Phase offset',''],['form','radius',.13,.3,.001,'Horizontal shape',''],['form','gap',.015,.18,.001,'Separation',''],['form','stretch',.5,1.7,.01,'Vertical stretch','×'],['form','glow',.4,1.8,.01,'Glow strength','×'],['form','grain',0,.12,.001,'Film grain',''],['form','zoom',.6,1.5,.01,'Scale','×']];
// Restore only after the control bounds exist.
try{const saved=JSON.parse(localStorage.getItem('gradient-loop-three-v1'));if(saved)settings={...defaults,...validate(saved)};}catch{settings={...defaults};}
for(const [key,label] of [['background','Background'],['violet','Outer glow'],['red','Deep warmth'],['orange','Midtone'],['core','Light core']]){const row=document.createElement('label');row.className='color-row';row.innerHTML=`${label}<span class="color-value"><span id="hex-${key}"></span><input type="color" data-key="${key}" aria-label="${label}"></span>`;$('#colors').append(row);}
for(const [group,key,min,max,step,label,unit] of specs){const row=document.createElement('label');row.className='control';row.innerHTML=`<span>${label}</span><output id="out-${key}"></output><input type="range" data-key="${key}" min="${min}" max="${max}" step="${step}" aria-label="${label}">`;$('#'+group+'-controls').append(row);}
function sync(){for(const input of document.querySelectorAll('[data-key]')){const key=input.dataset.key;input.value=settings[key];const output=$('#out-'+key);if(output)output.textContent=Number(settings[key]).toFixed(key==='duration'?1:2)+(specs.find(s=>s[1]===key)?.[6]||'');const hex=$('#hex-'+key);if(hex)hex.textContent=settings[key].toUpperCase();}$('#reverse').checked=settings.reverse;$('#easing').value=settings.easing;$('#duration-label').textContent=settings.duration.toFixed(2)+'s';}
function persist(){try{localStorage.setItem('gradient-loop-three-v1',JSON.stringify(settings));}catch{}sync();}
document.querySelectorAll('[data-key]').forEach(input=>input.addEventListener('input',()=>{settings[input.dataset.key]=input.type==='color'?input.value:Number(input.value);persist();}));
$('#reverse').onchange=e=>{settings.reverse=e.target.checked;persist();};$('#easing').onchange=e=>{settings.easing=Number(e.target.value);persist();};$('#preset').onchange=e=>{Object.assign(settings,palettes[e.target.value]);persist();};$('#reset').onclick=()=>{settings={...defaults};elapsed=0;$('#preset').value='ember';persist();};
const canvas=$('#canvas');
const vertex=`attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment=`precision highp float;
uniform vec2 resolution;
uniform sampler2D referenceAtlas;
uniform float phase,intensity,softness,radius,gap,stretch,glow,grain,zoom,easing;
uniform vec3 background,violet,red,orange,core;
vec3 palette(float t,vec3 c0,vec3 c1,vec3 c2,vec3 c3,vec3 c4){
 vec3 c=mix(c0,c1,smoothstep(0.,.18,t));c=mix(c,c2,smoothstep(.13,.43,t));c=mix(c,c3,smoothstep(.34,.7,t));return mix(c,c4,smoothstep(.65,.98,t));
}
vec4 frame(float index,vec2 uv){
 vec2 tile=vec2(mod(index,15.),floor(index/15.));
 return texture2D(referenceAtlas,(tile*vec2(216.,282.)+vec2(1.5)+uv*vec2(213.,279.))/vec2(3240.,2256.));
}
void main(){
 vec2 p=(gl_FragCoord.xy-.5*resolution)/resolution.y;
 p/=zoom;p.y/=stretch;
 p.x*=.19/radius;
 p.y-=sign(p.y)*(gap-.04)*.5;
 vec2 uv=vec2(p.x/(214./280.)+.5,.5-p.y);
 if(uv.x<0.||uv.x>1.||uv.y<0.||uv.y>1.){gl_FragColor=vec4(background,1.);return;}
 float a=phase*6.28318530718;
 float t=phase+(easing<.5?0.:(easing<1.5?.12:.04))*sin(a)/6.28318530718;
 float f=fract(t)*120.;
 float n=floor(f),w=fract(f);
 vec4 q0=frame(mod(n+119.,120.),uv),q1=frame(n,uv),q2=frame(mod(n+1.,120.),uv),q3=frame(mod(n+2.,120.),uv);
 vec4 source=clamp(.5*((2.*q1)+(-q0+q2)*w+(2.*q0-5.*q1+4.*q2-q3)*w*w+(-q0+3.*q1-3.*q2+q3)*w*w*w),0.,1.);
 source.a=dot(source.rgb,vec3(.2126,.7152,.0722));
 float level=pow(clamp(source.a*intensity,0.,1.),1./softness);
 vec3 original=palette(source.a,vec3(16.)/255.,vec3(33.,10.,81.)/255.,vec3(185.,11.,25.)/255.,vec3(255.,135.,30.)/255.,vec3(242.,239.,160.)/255.);
 vec3 edited=palette(level,background,violet,red,orange,core);
 vec3 color=source.rgb+edited-original;
 color=mix(background,color,glow);
 float noise=fract(sin(dot(gl_FragCoord.xy,vec2(127.1,311.7)))*43758.5453)-.5;
 gl_FragColor=vec4(clamp(color+noise*grain,0.,1.),1.);
}`;

let renderer,material,scene,camera,software,atlasReady=false;
function fail(message){$('#error').hidden=false;$('#error').textContent=message;}
const uniforms={resolution:{value:new THREE.Vector2()},phase:{value:0},referenceAtlas:{value:null}};
for(const [key,value] of Object.entries(defaults)){if(!(key in uniforms))uniforms[key]={value:typeof value==='string'?new THREE.Vector3(...[1,3,5].map(i=>parseInt(value.slice(i,i+2),16)/255)):value};}
try{
 renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:false,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 renderer.outputColorSpace=THREE.LinearSRGBColorSpace;
 material=new THREE.RawShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms,depthTest:false,depthWrite:false});
 scene=new THREE.Scene();camera=new THREE.Camera();
 scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));
 $('#status').textContent='● Three.js live';
}catch(error){software=softwareRenderer(canvas);$('#status').textContent='● Software preview';}
const atlasImage=new Image();
atlasImage.onload=()=>{if(renderer){const texture=new THREE.Texture(atlasImage);texture.flipY=false;texture.colorSpace=THREE.NoColorSpace;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;texture.needsUpdate=true;uniforms.referenceAtlas.value=texture;}atlasReady=true;};
atlasImage.onerror=()=>fail('Could not load animation field. Please reload.');
atlasImage.src='./reference-rgb.webp';
function render(){
 if(!atlasReady)return;
 const phase=(elapsed/settings.duration+settings.phase)%1,t=settings.reverse?1-phase:phase;
 if(software){software(settings,t,atlasImage);return;}
 const rect=canvas.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);renderer.getDrawingBufferSize(uniforms.resolution.value);uniforms.phase.value=t;
 for(const [key,value] of Object.entries(settings)){if(['phase','duration','reverse'].includes(key))continue;if(typeof value==='string')uniforms[key].value.set(...[1,3,5].map(i=>parseInt(value.slice(i,i+2),16)/255));else uniforms[key].value=value;}
 renderer.render(scene,camera);
}
let elapsed=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,last=performance.now();
function playUI(){$('#play').textContent=playing?'Ⅱ':'▶';$('#play').setAttribute('aria-label',playing?'Pause animation':'Play animation');}function tick(now){if(playing&&!document.hidden)elapsed=(elapsed+((now-last)/1000))%settings.duration;last=now;render();$('#time').textContent=elapsed.toFixed(2)+'s';$('#scrub').value=elapsed/settings.duration;requestAnimationFrame(tick);}$('#play').onclick=()=>{playing=!playing;playUI();};$('#restart').onclick=()=>{elapsed=0;};$('#scrub').oninput=e=>{playing=false;playUI();elapsed=Number(e.target.value)*settings.duration;};
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('#stage').requestFullscreen();}catch{notice('Fullscreen is unavailable in this browser.');}};
$('#format').onchange=e=>{canvas.style.aspectRatio={portrait:'858 / 1122',square:'1 / 1',wide:'16 / 9'}[e.target.value];canvas.style.width=e.target.value==='wide'?'100%':'auto';canvas.style.height=e.target.value==='wide'?'auto':'100%';};
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}function notice(text){$('#notice').textContent=text;}
$('#export').onclick=()=>download(new Blob([JSON.stringify({version:1,...settings},null,2)],{type:'application/json'}),'gradient-loop-settings.json');$('#save-image').onclick=()=>{if(!renderer&&!software)return;render();canvas.toBlob(blob=>{if(blob)download(blob,'gradient-loop.png');else notice('Could not capture the frame.');});};$('#import').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>100000)throw Error('File too large');settings={...defaults,...validate(JSON.parse(await file.text()))};persist();notice('Settings imported.');}catch(error){notice('Could not import settings: '+error.message);}e.target.value='';};
document.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(document.activeElement.tagName))return;if(e.code==='Space'){e.preventDefault();playing=!playing;playUI();}if(e.key.toLowerCase()==='h')document.body.classList.toggle('clean');});canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();playing=false;playUI();fail('Graphics context lost. Reload the page to restore the renderer.');});sync();playUI();requestAnimationFrame(tick);
