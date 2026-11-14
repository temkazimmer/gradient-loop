import {softwareRenderer} from './software.js';
const $ = s => document.querySelector(s);
const defaults = {background:'#101010',violet:'#210a51',red:'#b90b19',orange:'#ff871e',core:'#f2efa0',duration:4,phase:0,intensity:1,softness:1,radius:.19,gap:.04,stretch:1,glow:1,grain:0,zoom:1,easing:0,reverse:false};
const palettes={ember:{background:'#101010',violet:'#210a51',red:'#b90b19',orange:'#ff871e',core:'#f2efa0'},aurora:{background:'#091310',violet:'#12385c',red:'#087c80',orange:'#53d9a2',core:'#e5ffd3'},cobalt:{background:'#0a0c16',violet:'#211454',red:'#2536a4',orange:'#467dff',core:'#c4edff'},rose:{background:'#160d14',violet:'#3a154e',red:'#b82b69',orange:'#f28ba8',core:'#ffe1d6'}};
let settings={...defaults};
function validate(data){if(!data||typeof data!=='object')throw Error('Invalid settings');const result={};for(const key of Object.keys(defaults)){const v=data[key];if(v===undefined)continue;if(typeof defaults[key]==='string'){if(!/^#[\da-f]{6}$/i.test(v))throw Error('Invalid colour');}else if(typeof defaults[key]==='boolean'){if(typeof v!=='boolean')throw Error('Invalid switch');}else{if(typeof v!=='number'||!Number.isFinite(v))throw Error('Invalid number');const spec=specs.find(s=>s[1]===key);if(spec&&(v<spec[2]||v>spec[3]))throw Error('Value out of range');if(key==='easing'&&![0,1,2].includes(v))throw Error('Invalid easing');}result[key]=v;}return result;}
const specs=[['color','intensity',.3,1.8,.01,'Intensity','×'],['color','softness',.4,2,.01,'Gradient softness','×'],['motion','duration',1,12,.1,'Loop duration','s'],['motion','phase',0,1,.001,'Phase offset',''],['form','radius',.13,.3,.001,'Horizontal shape',''],['form','gap',.015,.18,.001,'Separation',''],['form','stretch',.5,1.7,.01,'Vertical stretch','×'],['form','glow',.4,1.8,.01,'Glow strength','×'],['form','grain',0,.12,.001,'Film grain',''],['form','zoom',.6,1.5,.01,'Scale','×']];
// Restore only after the control bounds exist.
try{const saved=JSON.parse(localStorage.getItem('gradient-loop-v3'));if(saved)settings={...defaults,...validate(saved)};}catch{settings={...defaults};}
for(const [key,label] of [['background','Background'],['violet','Outer glow'],['red','Deep warmth'],['orange','Midtone'],['core','Light core']]){const row=document.createElement('label');row.className='color-row';row.innerHTML=`${label}<span class="color-value"><span id="hex-${key}"></span><input type="color" data-key="${key}" aria-label="${label}"></span>`;$('#colors').append(row);}
for(const [group,key,min,max,step,label,unit] of specs){const row=document.createElement('label');row.className='control';row.innerHTML=`<span>${label}</span><output id="out-${key}"></output><input type="range" data-key="${key}" min="${min}" max="${max}" step="${step}" aria-label="${label}">`;$('#'+group+'-controls').append(row);}
function sync(){for(const input of document.querySelectorAll('[data-key]')){const key=input.dataset.key;input.value=settings[key];const output=$('#out-'+key);if(output)output.textContent=Number(settings[key]).toFixed(key==='duration'?1:2)+(specs.find(s=>s[1]===key)?.[6]||'');const hex=$('#hex-'+key);if(hex)hex.textContent=settings[key].toUpperCase();}$('#reverse').checked=settings.reverse;$('#easing').value=settings.easing;$('#duration-label').textContent=settings.duration.toFixed(2)+'s';}
function persist(){try{localStorage.setItem('gradient-loop-v3',JSON.stringify(settings));}catch{}sync();}
document.querySelectorAll('[data-key]').forEach(input=>input.addEventListener('input',()=>{settings[input.dataset.key]=input.type==='color'?input.value:Number(input.value);persist();}));
$('#reverse').onchange=e=>{settings.reverse=e.target.checked;persist();};$('#easing').onchange=e=>{settings.easing=Number(e.target.value);persist();};$('#preset').onchange=e=>{Object.assign(settings,palettes[e.target.value]);persist();};$('#reset').onclick=()=>{settings={...defaults};elapsed=0;$('#preset').value='ember';persist();};
const canvas=$('#canvas'),gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true});
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

let program,uniforms={};
function fail(message){$('#error').hidden=false;$('#error').textContent=message;$('#status').textContent='Renderer unavailable';}
let software;
if(!gl){software=softwareRenderer(canvas);$('#status').textContent='● Software preview';}else{try{function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);for(const key of ['referenceAtlas','resolution','phase',...Object.keys(defaults)])uniforms[key]=gl.getUniformLocation(program,key);}catch(error){fail('Shader failed: '+error.message);program=null;}}
let atlasReady=false;
const atlasImage=new Image();
atlasImage.onload=()=>{
 if(gl&&program){const tex=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlasImage);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.uniform1i(uniforms.referenceAtlas,0);}
 atlasReady=true;
};
atlasImage.onerror=()=>fail('Could not load the animation field. Please reload.');
atlasImage.src='./reference-rgb.webp';
function resize(){const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio,2);const w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}}
function render(){if(!atlasReady)return;if(software){const phase=(elapsed/settings.duration+settings.phase)%1;software(settings,settings.reverse?1-phase:phase,atlasImage);return;}if(!program||gl.isContextLost())return;resize();gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);const t=(elapsed/settings.duration+settings.phase)%1;gl.uniform1f(uniforms.phase,settings.reverse?1-t:t);for(const [key,value] of Object.entries(settings)){if(key==='phase'||key==='duration'||key==='reverse')continue;if(typeof value==='string')gl.uniform3fv(uniforms[key],[1,3,5].map(i=>parseInt(value.slice(i,i+2),16)/255));else gl.uniform1f(uniforms[key],value);}gl.drawArrays(gl.TRIANGLES,0,6);}
let elapsed=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,last=performance.now();
function playUI(){$('#play').textContent=playing?'Ⅱ':'▶';$('#play').setAttribute('aria-label',playing?'Pause animation':'Play animation');}function tick(now){if(playing&&!document.hidden)elapsed=(elapsed+((now-last)/1000))%settings.duration;last=now;render();$('#time').textContent=elapsed.toFixed(2)+'s';$('#scrub').value=elapsed/settings.duration;requestAnimationFrame(tick);}$('#play').onclick=()=>{playing=!playing;playUI();};$('#restart').onclick=()=>{elapsed=0;};$('#scrub').oninput=e=>{playing=false;playUI();elapsed=Number(e.target.value)*settings.duration;};
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('#stage').requestFullscreen();}catch{notice('Fullscreen is unavailable in this browser.');}};
$('#format').onchange=e=>{canvas.style.aspectRatio={portrait:'858 / 1122',square:'1 / 1',wide:'16 / 9'}[e.target.value];canvas.style.width=e.target.value==='wide'?'100%':'auto';canvas.style.height=e.target.value==='wide'?'auto':'100%';};
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}function notice(text){$('#notice').textContent=text;}
$('#export').onclick=()=>download(new Blob([JSON.stringify({version:1,...settings},null,2)],{type:'application/json'}),'gradient-loop-settings.json');$('#save-image').onclick=()=>{if(!program&&!software)return;render();canvas.toBlob(blob=>{if(blob)download(blob,'gradient-loop.png');else notice('Could not capture the frame.');});};$('#import').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>100000)throw Error('File too large');settings={...defaults,...validate(JSON.parse(await file.text()))};persist();notice('Settings imported.');}catch(error){notice('Could not import settings: '+error.message);}e.target.value='';};
document.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(document.activeElement.tagName))return;if(e.code==='Space'){e.preventDefault();playing=!playing;playUI();}if(e.key.toLowerCase()==='h')document.body.classList.toggle('clean');});canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();playing=false;playUI();fail('Graphics context lost. Reload the page to restore the renderer.');});sync();playUI();requestAnimationFrame(tick);
