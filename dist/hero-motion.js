/* Native video and a reusable SVG signal. No animation framework shipped. */
(() => {
 'use strict';
 const hero=document.querySelector('.hero');
 const video=document.querySelector('.hero-video');
 const poster=document.querySelector('.hero-poster img');
 if(!hero||!video)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const mobile=matchMedia('(max-width: 760px)');
 const connection=navigator.connection;
 let visible=true,variant='',generation=0;
 const allowed=()=>!reduced.matches&&!connection?.saveData;
 const play=()=>{
  if(!variant||!allowed()||!visible||document.hidden){video.pause();return;}
  const current=generation;
  video.play().then(()=>{if(current===generation&&allowed()&&visible&&!document.hidden)video.classList.add('is-playing');else video.pause()}).catch(()=>video.classList.remove('is-playing'));
 };
 const configure=()=>{
  if(!allowed()){
   generation++;video.pause();video.classList.remove('is-playing');video.replaceChildren();video.removeAttribute('src');video.load();variant='';return;
  }
  const next=mobile.matches?'mobile':'desktop';
  if(next===variant){play();return;}
  generation++;variant=next;video.pause();video.classList.remove('is-playing');
  video.poster=`assets/motion/${next}-poster.webp`;
  video.replaceChildren();
  for(const [ext,type] of [['webm','video/webm'],['mp4','video/mp4']]){
   const source=document.createElement('source');source.src=`assets/motion/${next}.${ext}?v=inside-insight-5`;source.type=type;video.append(source);
  }
  video.muted=true;video.defaultMuted=true;video.load();play();
 };
 video.addEventListener('loadeddata',play);
 video.addEventListener('error',()=>{video.classList.remove('is-playing');video.pause()});
 document.addEventListener('visibilitychange',play);
 reduced.addEventListener('change',configure);mobile.addEventListener('change',configure);
 connection?.addEventListener?.('change',configure);
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;play()},{threshold:.05});observer.observe(hero);
 // The picture is the LCP asset. Request video only after it has loaded.
 const start=()=>{if('requestIdleCallback' in window)requestIdleCallback(configure,{timeout:1500});else setTimeout(configure,150)};
 if(poster.complete)start();else {poster.addEventListener('load',start,{once:true});poster.addEventListener('error',start,{once:true})}

 const bridge=document.querySelector('.signal-bridge');
 const path=document.querySelector('#bridge-signal');
 const organ=document.querySelector('#bridge-organ');
 let scheduled=false;
 const draw=()=>{
  scheduled=false;if(!bridge||!path)return;
  const rect=bridge.getBoundingClientRect();
  if(rect.bottom<0||rect.top>innerHeight)return;
  const p=reduced.matches?1:Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight*.8)));
  const amp=Math.sin(p*Math.PI)*42;
  let d='';for(let i=0;i<=120;i++){const x=i*10;const z=(x-600)/35;const y=100+amp*(-Math.exp(-z*z)+.38*Math.exp(-((z-1.1)**2)/.25));d+=`${i?'L':'M'}${x} ${y.toFixed(2)} `}
  path.setAttribute('d',d);path.style.strokeDashoffset=String((1-p)*1200);
  if(organ)organ.style.opacity=String(reduced.matches?0:Math.sin(p*Math.PI)*.24);
 };
 const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(draw)}};
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});reduced.addEventListener('change',schedule);draw();
})();
