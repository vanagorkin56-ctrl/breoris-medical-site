/* Play the brand film once per page load, then keep its clean final frame. */
(() => {
 'use strict';
 const hero=document.querySelector('.hero');
 const video=document.querySelector('.hero-video');
 const poster=document.querySelector('.hero-poster');
 if(!hero||!video)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const connection=navigator.connection;
 let visible=false,posterReady=false,failed=false,finished=false;
 const allowed=()=>!failed&&!reduced.matches&&!connection?.saveData;
 const play=()=>{
  if(finished)return;
  hero.classList.toggle('is-static',!allowed());
  if(!allowed()){video.pause();video.classList.remove('is-playing');hero.classList.remove('is-playing-film');return;}
  if(!visible||document.hidden||!posterReady){video.pause();return;}
  if(!video.paused)return;
  hero.classList.add('is-playing-film');
  video.play().catch(error=>{
   if(error.name==='AbortError'&&(!visible||document.hidden))return;
   failed=true;play();
  });
 };
 video.muted=true;video.defaultMuted=true;video.playsInline=true;video.loop=false;
 video.addEventListener('canplay',play);
 // Reveal against a decoded, presented frame rather than coarse timeupdate events.
 const revealAt=4.25;
 let frameRequest=null;
 const presentFrame=(_now,metadata)=>{
  frameRequest=null;
  if(allowed())video.classList.add('is-playing');
  if(metadata.mediaTime>=revealAt)hero.classList.add('is-revealing');
  if(!video.paused&&!video.ended)frameRequest=video.requestVideoFrameCallback(presentFrame);
 };
 video.addEventListener('playing',()=>{
  if('requestVideoFrameCallback' in video){
   if(frameRequest===null)frameRequest=video.requestVideoFrameCallback(presentFrame);
  }else if(allowed())video.classList.add('is-playing');
 });
 video.addEventListener('timeupdate',()=>{
  if(!('requestVideoFrameCallback' in video)&&video.currentTime>=revealAt)hero.classList.add('is-revealing');
 });
 video.addEventListener('ended',()=>{
  finished=true;
  hero.classList.remove('is-playing-film');
  hero.classList.add('is-finished');
  // Keep the actual last video frame: switching to a poster causes a visible cut.
  hero.classList.add('is-revealing');
 });
 video.addEventListener('error',()=>{failed=true;play()});
 document.addEventListener('visibilitychange',play);
 reduced.addEventListener('change',play);
 connection?.addEventListener?.('change',play);
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;play()},{threshold:.05});observer.observe(hero);
 // Load the video after its poster is available.
 if(allowed())hero.classList.add('is-playing-film');
 const start=()=>{posterReady=true;play()};
 if(poster?.complete)start();else {poster?.addEventListener('load',start,{once:true});poster?.addEventListener('error',start,{once:true})}
})();
