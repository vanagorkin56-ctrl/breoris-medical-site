'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../dist/hero-motion.js'),'utf8');
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
function safari(reduce=false){
 const classes=new Set(),events={},windowEvents={},frames=new Map(),images=[],revoked=[];let serial=0,requests=0;
 const hero={classList:{add(...names){names.forEach(n=>classes.add(n));},remove(...names){names.forEach(n=>classes.delete(n));}},querySelector(){return {append(image){images.push(image);}};}};
 const video={pause(){},remove(){this.removed=true;}},still={decode:async()=>{}};
 const document={hidden:false,querySelector(s){return {'.hero':hero,'.hero-video':video,'.hero-static':still}[s];},addEventListener(name,fn){events[name]=fn;},createElement(){return {setAttribute(){},remove(){this.removed=true;},set src(value){this.source=value;queueMicrotask(()=>this.onload?.());}};}};
 const context={document,navigator:{userAgent:'Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 Version/26.0 Safari/605.1.15',maxTouchPoints:0},matchMedia:()=>({matches:reduce,addEventListener(){}}),window:{addEventListener(name,fn){windowEvents[name]=fn;}},performance:{now:()=>0},URL:{createObjectURL:()=>`blob:test-${++serial}`,revokeObjectURL:value=>revoked.push(value)},fetch:async()=>{requests++;return {ok:true,blob:async()=>({})};},requestAnimationFrame:fn=>{const id=++serial;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id)};
 vm.runInNewContext(source,context);
 return {classes,events,windowEvents,images,revoked,video,document,requests:()=>requests,tick(time){const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(time));}};
}
test('desktop Safari uses the same film as an image, reveals at the end and has no playback control',async()=>{
 const h=safari();await flush();assert.equal(h.video.removed,true);assert.equal(h.images.length,1);assert.equal(h.images[0].className,'hero-image-film');assert.equal(h.classes.has('is-playing-film'),true);
 h.tick(4200);assert.equal(h.classes.has('is-revealing'),false);h.tick(4300);assert.equal(h.classes.has('is-revealing'),true);h.tick(5000);await flush();assert.equal(h.classes.has('is-finished'),true);assert.equal(h.images[0].removed,true);
});
test('Safari restores and visibility returns create a fresh decoder while reusing the downloaded film',async()=>{
 const h=safari();await flush();const first=h.images[0].source;
 h.windowEvents.pageshow({persisted:true});await flush();assert.notEqual(h.images[1].source,first);assert.equal(h.requests(),1);
 h.document.hidden=true;h.events.visibilitychange();h.document.hidden=false;h.events.visibilitychange();await flush();assert.equal(h.images.length,3);assert.equal(h.classes.has('is-finished'),false);assert.equal(h.revoked.length,2);
});
test('Safari respects reduced motion without fetching animation or adding controls',async()=>{
 const h=safari(true);await flush();assert.equal(h.classes.has('is-static'),true);assert.equal(h.requests(),0);assert.equal(h.images.length,0);
});
