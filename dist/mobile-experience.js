/* Native swipe tracks with explicit controls; never advance automatically. */
(() => {
  'use strict';
  const mobile = matchMedia('(max-width:760px)');
  const translations = {
    uk: ['Попередня картка','Наступна картка','Гортайте картки','Лікарі клініки','Наш підхід','Клініка зсередини','Статті блогу'],
    ru: ['Предыдущая карточка','Следующая карточка','Листайте карточки','Врачи клиники','Наш подход','Клиника изнутри','Статьи блога'],
    en: ['Previous card','Next card','Browse cards','Clinic doctors','Our approach','Inside the clinic','Blog articles']
  };
  const configs = [['#doctor-grid',3],['.trust-grid',4],['.clinic-gallery-grid',5],['.blog-preview-grid',6]];
  const tracks = [];
  configs.forEach(([selector,labelIndex],number) => {
    const track = document.querySelector(selector);
    if (!track) return;
    track.id ||= `mobile-track-${number}`;
    track.classList.add('mobile-swipe-track');
    const controls = document.createElement('div');
    controls.className = 'mobile-carousel-controls';
    controls.hidden = true;
    controls.setAttribute('role','group');
    controls.innerHTML = `<button type="button" data-carousel-prev aria-controls="${track.id}"><span aria-hidden="true">←</span></button><span class="mobile-carousel-position" aria-live="polite" aria-atomic="true"></span><button type="button" data-carousel-next aria-controls="${track.id}"><span aria-hidden="true">→</span></button>`;
    track.after(controls);
    const prev = controls.querySelector('[data-carousel-prev]');
    const next = controls.querySelector('[data-carousel-next]');
    const counter = controls.querySelector('.mobile-carousel-position');
    let frame = 0;
    const children = () => [...track.children].filter(card=>!card.hidden);
    const index = () => {
      const cards = children();
      if (!cards.length) return 0;
      const step = cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
      return Math.max(0,Math.min(cards.length-1,Math.round(track.scrollLeft / (step || 1))));
    };
    function update() {
      const cards = children(), current = index();
      const text = translations[window.BreorisLocale?.language || 'uk'];
      controls.hidden = !mobile.matches;
      prev.disabled = current === 0;
      next.disabled = current >= cards.length-1;
      prev.setAttribute('aria-label',text[0]);
      next.setAttribute('aria-label',text[1]);
      controls.setAttribute('aria-label',text[labelIndex]);
      counter.textContent = `${current+1} / ${cards.length}`;
      if (mobile.matches) {
        track.tabIndex = 0;
        track.setAttribute('role','region');
        track.setAttribute('aria-label',`${text[labelIndex]}. ${text[2]}`);
      } else {
        track.removeAttribute('tabindex');track.removeAttribute('role');track.removeAttribute('aria-label');
      }
    }
    function move(direction) {
      const cards = children();
      const target = cards[Math.max(0,Math.min(cards.length-1,index()+direction))];
      if (!target) return;
      track.scrollTo({left:target.offsetLeft-cards[0].offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    }
    prev.addEventListener('click',()=>move(-1));
    next.addEventListener('click',()=>move(1));
    track.addEventListener('keydown',event=>{
      if (!mobile.matches || event.target!==track || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      if(event.key==='Home'||event.key==='End')track.scrollTo({left:event.key==='Home'?0:track.scrollWidth,behavior:'instant'});
      else move(event.key==='ArrowRight'?1:-1);
    });
    track.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update)},{passive:true});
    new ResizeObserver(update).observe(track);
    tracks.push({track,update});
    update();
  });
  document.addEventListener('breoris:doctors-rendered',()=>{
    const entry = tracks.find(x=>x.track.id==='doctor-grid');
    if(entry){entry.track.scrollLeft=0;entry.update()}
  });
  mobile.addEventListener('change',()=>tracks.forEach(x=>x.update()));
  document.addEventListener('change',event=>{if(event.target.matches('.language-select'))tracks.forEach(x=>x.update())});
})();
