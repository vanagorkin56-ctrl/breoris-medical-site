import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const script=readFileSync(new URL('../dist/cinematic-hero.js',import.meta.url),'utf8');
function setup({mobile=false,reduced=false}={}){
 const element=()=>({style:{removeProperty(k){delete this[k]}},events:{},addEventListener(n,f){this.events[n]=f}});
 const room=element(),consult=element(),copy=element(),badge=element(),hero=element();hero.offsetHeight=800;hero.classList={toggle(){}};hero.querySelector=s=>({'.cinema-room':room,'.cinema-consult':consult,'.hero-content':copy}[s]);hero.querySelectorAll=()=>[badge];hero.getBoundingClientRect=()=>({left:0,top:0,width:1200,height:800});
 const media={reduce:{matches:reduced},desktop:{matches:!mobile},fine:{matches:true}};for(const m of Object.values(media))m.addEventListener=(_,f)=>m.change=f;
 let pending,observer,tweenCount=0,killed=0,update;
 const doc={hidden:false,events:{},querySelector:()=>hero,addEventListener(n,f){this.events[n]=f}};
 const gsap={registerPlugin(){},to(state,opts){tweenCount++;update=p=>{state.progress=p;opts.onUpdate()};return {kill(){killed++},scrollTrigger:{kill(){}}}}};
 vm.runInNewContext(script,{document:doc,window:{gsap,ScrollTrigger:{}},gsap,ScrollTrigger:{},matchMedia:q=>q.includes('reduced')?media.reduce:q.includes('min-width')?media.desktop:media.fine,requestAnimationFrame:f=>{pending=f;return 1},cancelAnimationFrame:()=>{pending=null},IntersectionObserver:class{constructor(f){observer=f}observe(){}}});
 return {media,room,copy,hero,doc,get count(){return tweenCount},get killed(){return killed},paint(){const f=pending;pending=null;f?.(100)},scroll(p){update(p)},visible(v){observer([{isIntersecting:v}])},get pending(){return !!pending}};
}
const a=setup();assert.equal(a.count,1);a.scroll(.25);a.paint();assert.ok(Math.abs(Number(a.copy.style.opacity)-.45)<.001);assert.match(a.room.style.transform,/140px/);a.media.reduce.matches=true;a.media.reduce.change();assert.equal(a.copy.style.opacity,undefined);assert.equal(a.room.style.transform,undefined);assert.equal(a.killed,1);assert.equal(a.pending,false);
assert.equal(setup({mobile:true}).count,0);assert.equal(setup({reduced:true}).count,0);
const b=setup();b.hero.events.pointermove({clientX:1100,clientY:700});assert.equal(b.pending,true);b.visible(false);assert.equal(b.pending,false);
console.log('PASS: scroll transform/opacity; reduced-motion reset; mobile gating; offscreen rAF cancellation.');
