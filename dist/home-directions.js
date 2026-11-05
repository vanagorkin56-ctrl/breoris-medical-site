(() => {
  const hero = document.querySelector('.direction-hero');
  if (!hero) return;
  const slides = [...hero.querySelectorAll('.direction-slide')];
  const dots = [...hero.querySelectorAll('[data-direction-index]')];
  const pause = hero.querySelector('[data-direction-pause]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, timer, paused = reduced.matches, hover = false, focused = false, visible = true;
  const t = value => window.BreorisLocale?.t(value) || value;
  function schedule() {
    clearInterval(timer);
    if (!paused && !hover && !focused && visible && !document.hidden && !document.querySelector('dialog[open]')) timer = setInterval(() => show(index + 1), 3000);
  }
  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide,i) => slide.hidden = i !== index);
    dots.forEach((dot,i) => dot.setAttribute('aria-pressed',String(i===index)));
    hero.querySelector('.direction-count').textContent = `0${index+1} / 03`;
  }
  function sync() {
    pause.textContent = t(paused ? 'Відтворити' : 'Пауза');
    pause.setAttribute('aria-pressed',String(paused));
    const lang = document.documentElement.lang === 'en' ? 'en' : 'ua';
    hero.querySelectorAll('[data-direction-link]').forEach(a => a.href = `${lang}/directions/${a.dataset.directionLink}/`);
  }
  function move(next) { show(next); schedule(); }
  hero.querySelector('[data-direction-prev]').addEventListener('click',()=>move(index-1));
  hero.querySelector('[data-direction-next]').addEventListener('click',()=>move(index+1));
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>move(i)));
  pause.addEventListener('click',()=>{paused=!paused;sync();schedule();});
  hero.addEventListener('mouseenter',()=>{hover=true;schedule();});
  hero.addEventListener('mouseleave',()=>{hover=false;schedule();});
  hero.addEventListener('focusin',()=>{focused=true;schedule();});
  hero.addEventListener('focusout',()=>{setTimeout(()=>{focused=hero.contains(document.activeElement);schedule();},0);});
  hero.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?2:index+(e.key==='ArrowRight'?1:-1);move(next);dots[index].focus();});
  let touch;
  hero.addEventListener('touchstart',e=>{touch=[e.changedTouches[0].clientX,e.changedTouches[0].clientY];clearInterval(timer);},{passive:true});
  hero.addEventListener('touchend',e=>{if(touch){const dx=e.changedTouches[0].clientX-touch[0],dy=e.changedTouches[0].clientY-touch[1];if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy))show(index+(dx<0?1:-1));}touch=null;schedule();},{passive:true});
  document.addEventListener('visibilitychange',schedule);
  reduced.addEventListener('change',()=>{paused=reduced.matches;sync();schedule();});
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:0.2}).observe(hero);
  document.querySelectorAll('dialog').forEach(dialog=>new MutationObserver(schedule).observe(dialog,{attributes:true,attributeFilter:['open']}));
  sync();show(0);schedule();
})();
