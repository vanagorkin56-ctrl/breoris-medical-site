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
 let visible=hero.getBoundingClientRect().bottom>0&&hero.getBoundingClientRect().top<innerHeight,posterReady=false,failed=false,finished=false,pending=false,blocked=false,retryTimer,interruptions=0;
 const replay=document.createElement('button');replay.type='button';replay.className='hero-replay';replay.hidden=true;hero.append(replay);
 const replayLabel=()=>{replay.textContent=({uk:'Переглянути анімацію',ru:'Посмотреть анимацию',en:'Play animation'})[document.documentElement.lang]||'Переглянути анімацію';};replayLabel();
 const allowed=()=>!failed&&!reduced.matches&&!connection?.saveData;
 const play=()=>{
  if(finished){hero.classList.add('is-finished','is-revealing');return;}
  hero.classList.toggle('is-static',!allowed()||blocked);
  if(!allowed()){video.pause();video.classList.remove('is-playing');hero.classList.remove('is-playing-film');return;}
  if(!visible||document.hidden||!posterReady){video.pause();return;}
  if(!video.paused||pending||blocked)return;
  pending=true;
  hero.classList.add('is-playing-film');
  Promise.resolve(video.play()).then(()=>{blocked=false;interruptions=0;replay.hidden=true;hero.classList.remove('is-static');}).catch(error=>{
   if(error.name==='AbortError'&&++interruptions<=3){
    // A visibility change or a cached load may interrupt play without breaking the film.
    clearTimeout(retryTimer);retryTimer=setTimeout(play,200);return;
   }
   blocked=true;hero.classList.add('is-static');hero.classList.remove('is-playing-film');replay.hidden=false;
  }).finally(()=>{pending=false;});
 };
 video.muted=true;video.defaultMuted=true;video.playsInline=true;video.loop=false;
 video.addEventListener('canplay',play);
 video.addEventListener('loadeddata',play);
 replay.addEventListener('click',()=>{blocked=false;failed=false;finished=false;interruptions=0;visible=true;posterReady=true;hero.classList.remove('is-finished','is-revealing');if(video.error)video.load();video.currentTime=0;play();});
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
 video.addEventListener('error',()=>{failed=true;replay.hidden=reduced.matches||!!connection?.saveData;play()});
 document.addEventListener('visibilitychange',play);
 window.addEventListener('pageshow',event=>{
  if(event.persisted){finished=false;blocked=false;video.currentTime=0;hero.classList.remove('is-finished','is-revealing');}
  play();
 });
 window.addEventListener('pagehide',()=>video.pause());
 document.addEventListener('change',replayLabel);
 reduced.addEventListener('change',play);
 connection?.addEventListener?.('change',play);
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;play()},{threshold:.05});observer.observe(hero);
 // Load the video after its poster is available.
 if(allowed())hero.classList.add('is-playing-film');
 const start=()=>{posterReady=true;play()};
 if(!poster||poster.complete)start();else {poster.addEventListener('load',start,{once:true});poster.addEventListener('error',start,{once:true})}
})();
