(() => {
  const track = document.querySelector('#patient-review-track');
  if (!track) return;
  const prev = document.querySelector('[data-review-prev]');
  const next = document.querySelector('[data-review-next]');
  const update = () => {
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
  };
  const move = direction => {
    track.querySelectorAll('details[open]').forEach(item => item.open = false);
    const card = track.querySelector('.review-card');
    const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
    track.scrollBy({left: direction * step, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  };
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('keydown', event => {
    if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
  });
  track.addEventListener('scroll', update, {passive:true});
  new ResizeObserver(update).observe(track);
  update();
})();
