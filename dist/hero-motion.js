/* Play the brand film once per page load, then keep its clean final frame. */
(() => {
 'use strict';
 const hero=document.querySelector('.hero');
 const video=document.querySelector('.hero-video');
 const poster=document.querySelector('.hero-poster');
 const still=document.querySelector('.hero-static');
 if(!hero||!video)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const connection=navigator.connection;
 // Desktop Safari can refuse muted video autoplay. An image animation uses
 // the same frames and timing without a media playback permission or controls.
 const desktopSafari=/Safari\//.test(navigator.userAgent)&&!/Chrome|Chromium|CriOS|Edg|OPR|FxiOS|Mobile/.test(navigator.userAgent)&&navigator.maxTouchPoints<2;
 if(desktopSafari){
  video.pause();video.remove();
  let generation=0,frame=null,objectURL=null,image=null,complete=false,blobPromise=null;
  const cleanup=()=>{generation++;if(frame!==null)cancelAnimationFrame(frame);frame=null;image?.remove();image=null;if(objectURL)URL.revokeObjectURL(objectURL);objectURL=null;};
  const staticFrame=()=>{cleanup();hero.classList.add('is-static','is-revealing');hero.classList.remove('is-playing-film');};
  const start=async()=>{
   cleanup();complete=false;hero.classList.remove('is-finished','is-static','is-revealing');
   if(reduced.matches||connection?.saveData){staticFrame();return;}
   if(document.hidden)return;
   const current=generation;hero.classList.add('is-playing-film');
   try{
    blobPromise??=fetch('assets/motion/breoris-opening-once.webp?v=1').then(response=>{if(!response.ok)throw new Error('animation_unavailable');return response.blob();});
    const blob=await blobPromise;if(current!==generation||document.hidden)return;
    objectURL=URL.createObjectURL(blob);image=document.createElement('img');image.className='hero-image-film';image.alt='';image.setAttribute('aria-hidden','true');
    image.onload=()=>{
     if(current!==generation)return;
     const started=performance.now();
     const tick=now=>{
      if(current!==generation)return;
      if(now-started>=4250)hero.classList.add('is-revealing');
      if(now-started>=5000){complete=true;hero.classList.remove('is-playing-film');hero.classList.add('is-revealing');const hold=()=>{if(current===generation){hero.classList.add('is-finished');cleanup();}};if(still?.decode)still.decode().then(hold).catch(()=>{});else if(still?.complete)hold();return;}
      frame=requestAnimationFrame(tick);
     };frame=requestAnimationFrame(tick);
    };
    image.onerror=()=>{if(current===generation)staticFrame();};
    image.src=objectURL;hero.querySelector('.hero-media').append(image);
   }catch{if(current===generation){blobPromise=null;staticFrame();}}
  };
  document.addEventListener('visibilitychange',()=>{if(!complete){if(document.hidden)cleanup();else start();}});
  window.addEventListener('pageshow',event=>{if(event.persisted)start();});
  window.addEventListener('pagehide',cleanup);
  reduced.addEventListener('change',start);connection?.addEventListener?.('change',start);
  start();return;
 }

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
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;play()},{threshold:.05});observer.observe(hero);
 // Load the video after its poster is available.
 if(allowed())hero.classList.add('is-playing-film');
 const start=()=>{posterReady=true;play()};
 if(!poster||poster.complete)start();else {poster.addEventListener('load',start,{once:true});poster.addEventListener('error',start,{once:true})}
})();
