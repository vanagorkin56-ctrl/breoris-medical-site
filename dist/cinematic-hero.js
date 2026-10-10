(() => {
 const hero=document.querySelector('.cinematic-hero');if(!hero)return;
 const room=hero.querySelector('.cinema-room'),consult=hero.querySelector('.cinema-consult'),copy=hero.querySelector('.hero-content'),badges=[...hero.querySelectorAll('.cinema-badge')];
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),desktop=matchMedia('(min-width:761px)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
 let frame=0,active=true,tx=0,ty=0,x=0,y=0,last=0,tween;
 const state={progress:0};
 function paint(now){
  frame=0;const delta=Math.min(48,now-(last||now));last=now;const damping=1-Math.exp(-delta/110);x+=(tx-x)*damping;y+=(ty-y)*damping;
  const p=state.progress,h=hero.offsetHeight;
  room.style.transform=`translate3d(${-x*7}px,${-y*7+p*h*.7}px,0)`;
  consult.style.transform=`translate3d(${-x*18}px,${-y*18+p*h*.4}px,0)`;
  badges.forEach((el,i)=>{el.style.transform=`translate3d(${-x*(25+i)}px,${-y*(25+i)-p*60}px,0)`});
  copy.style.transform=`translate3d(0,${-p*45}px,0)`;copy.style.opacity=String(Math.max(0,1-p*2.2));
  if(active&&!document.hidden&&(Math.abs(tx-x)>.001||Math.abs(ty-y)>.001))queue();
 }
 function queue(){if(!frame&&!reduce.matches&&desktop.matches&&active&&!document.hidden)frame=requestAnimationFrame(paint)}
 function reset(){cancelAnimationFrame(frame);frame=0;tx=ty=x=y=0;last=0;state.progress=0;[room,consult,copy,...badges].forEach(el=>{el.style.removeProperty('transform');el.style.removeProperty('opacity')})}
 function configure(){tween?.scrollTrigger?.kill();tween?.kill();reset();if(reduce.matches||!desktop.matches||!window.gsap||!window.ScrollTrigger)return;
  gsap.registerPlugin(ScrollTrigger);
  tween=gsap.to(state,{progress:1,ease:'none',onUpdate:queue,scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.6,invalidateOnRefresh:true}});
 }
 hero.addEventListener('pointermove',event=>{if(!fine.matches||!desktop.matches||reduce.matches)return;const r=hero.getBoundingClientRect();tx=Math.max(-1,Math.min(1,(event.clientX-r.left)/r.width*2-1));ty=Math.max(-1,Math.min(1,(event.clientY-r.top)/r.height*2-1));queue()},{passive:true});
 hero.addEventListener('pointerleave',()=>{tx=ty=0;queue()});
 const observer=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;hero.classList.toggle('is-offscreen',!active||document.hidden);if(active)queue();else{cancelAnimationFrame(frame);frame=0}},{threshold:0});observer.observe(hero);
 document.addEventListener('visibilitychange',()=>{hero.classList.toggle('is-offscreen',document.hidden||!active);if(document.hidden){cancelAnimationFrame(frame);frame=0}else queue()});
 reduce.addEventListener('change',configure);desktop.addEventListener('change',configure);fine.addEventListener('change',()=>{tx=ty=0;queue()});
 configure();
})();
