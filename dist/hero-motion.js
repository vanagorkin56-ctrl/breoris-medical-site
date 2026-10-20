/* Play the brand film once per page load, then keep its clean final frame. */
(() => {
 'use strict';
 const hero=document.querySelector('.hero');
 const video=document.querySelector('.hero-video');
 const poster=document.querySelector('.hero-poster');
 const still=document.querySelector('.hero-static');
 if(!hero||!video)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const mobile=matchMedia('(max-width:760px)');
 const source=video.querySelector('source');
 const desktopSrc=source?.getAttribute('src');
 const desktopPoster=video.getAttribute('poster');
 const selectFilm=()=>{
  if(!source)return;
  source.src=mobile.matches&&video.dataset.mobileSrc?video.dataset.mobileSrc:desktopSrc;
  video.poster=mobile.matches&&video.dataset.mobilePoster?video.dataset.mobilePoster:desktopPoster;
  if(!reduced.matches&&!navigator.connection?.saveData){video.preload='auto';video.load();}
 };
 const connection=navigator.connection;
 let visible=hero.getBoundingClientRect().bottom>0&&hero.getBoundingClientRect().top<innerHeight,posterReady=false,failed=false,finished=false,pending=false,blocked=false,retryTimer,interruptions=0;
 const allowed=()=>!failed&&!reduced.matches&&!connection?.saveData;
 const play=()=>{
  if(finished){hero.classList.add('is-finished','is-revealing');return;}
  hero.classList.toggle('is-static',!allowed()||blocked);
  if(!allowed()){video.pause();video.classList.remove('is-playing');hero.classList.remove('is-playing-film');return;}
  if(!visible||document.hidden||!posterReady){video.pause();return;}
  if(!video.paused||pending||blocked)return;
  pending=true;
  hero.classList.add('is-playing-film');
  Promise.resolve(video.play()).then(()=>{blocked=false;interruptions=0;hero.classList.remove('is-static');}).catch(error=>{
   if(error.name==='AbortError'&&++interruptions<=3){
    // A visibility change or a cached load may interrupt play without breaking the film.
    clearTimeout(retryTimer);retryTimer=setTimeout(play,200);return;
   }
   blocked=true;hero.classList.add('is-static');hero.classList.remove('is-playing-film');
  }).finally(()=>{pending=false;});
 };
 video.muted=true;video.defaultMuted=true;video.playsInline=true;video.loop=false;
 video.addEventListener('canplay',play);
 video.addEventListener('loadeddata',play);
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
  if(video.currentTime>=revealAt)hero.classList.add('is-revealing');
 });
 video.addEventListener('ended',()=>{
  finished=true;
  hero.classList.remove('is-playing-film');
  // Switch only after the final image is decoded, avoiding an empty frame.
  const hold=()=>hero.classList.add('is-finished');
  if(still?.decode)still.decode().then(hold).catch(()=>{});
  else if(still?.complete)hold();
  hero.classList.add('is-revealing');
 });
 video.addEventListener('error',()=>{failed=true;play()});
 document.addEventListener('visibilitychange',play);
 window.addEventListener('pageshow',event=>{
  if(event.persisted){finished=false;blocked=false;video.currentTime=0;hero.classList.remove('is-finished','is-revealing');}
  play();
 });
 window.addEventListener('pagehide',()=>video.pause());
 reduced.addEventListener('change',play);
 connection?.addEventListener?.('change',play);
 mobile.addEventListener('change',()=>{
  clearTimeout(retryTimer);finished=false;failed=false;blocked=false;pending=false;interruptions=0;
  if(frameRequest!==null&&video.cancelVideoFrameCallback)video.cancelVideoFrameCallback(frameRequest);
  frameRequest=null;video.classList.remove('is-playing');hero.classList.remove('is-finished','is-revealing','is-static','is-playing-film');
  posterReady=true;if(allowed())hero.classList.add('is-playing-film');selectFilm();play();
 });
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;play()},{threshold:.05});observer.observe(hero);
 // Load the video after its poster is available.
 if(allowed())hero.classList.add('is-playing-film');
 selectFilm();
 const start=()=>{posterReady=true;play()};
 if(!poster||poster.complete)start();else {poster.addEventListener('load',start,{once:true});poster.addEventListener('error',start,{once:true})}
})();
