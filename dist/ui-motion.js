/* One-time scroll entrances. Content stays readable if JS or motion is disabled. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window) || !Element.prototype.animate || reduce.matches) return;
  const selectors = [
    '.hero-follow-copy', '.hero-follow-photo', '.trust-heading', '.trust-card',
    '.intro > h2', '.intro-copy', '.about-photo', '.about-text',
    '.services .section-heading', '.service-tabs', '.service-list',
    '.feature-tabs', '.feature-photo', '.feature-copy',
    '.additional > h2', '#additional-list', '.doctors .section-heading',
    '.doctor-card', '.doctors-bottom', '.statement > img', '.statement > h2',
    '.reviews-head', '.patient-reviews-static', '.location-copy', '.map-frame',
    '.contact-banner > h2', '.contact-banner > div'
  ];
  const running = new Map();
  const ease = getComputedStyle(document.documentElement).getPropertyValue('--ease-out').trim();
  let keyboard = false;
  const finish = element => {
    const animation = running.get(element);
    if (animation) { animation.cancel(); running.delete(element); }
  };
  const observer = new IntersectionObserver(entries => {
    const groups = new Map();
    entries.filter(entry => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      .forEach(({target, boundingClientRect: rect}) => {
        observer.unobserve(target);
        target.dataset.scrollRevealed = 'true';
        if (reduce.matches || keyboard || target.contains(document.activeElement) || rect.bottom < 0) return;
        const group = target.closest('section');
        const order = groups.get(group) || 0;
        groups.set(group, order + 1);
        const photo = target.matches('.hero-follow-photo,.about-photo,.feature-photo,.map-frame');
        const distance = matchMedia('(max-width:760px)').matches ? 12 : 20;
        const animation = target.animate([
          {opacity: 0, transform: `translateY(${distance}px)${photo ? ' scale(.97)' : ''}`},
          {opacity: 1, transform: 'translateY(0) scale(1)'}
        ], {duration: 600, delay: Math.min(order, 3) * 50, easing: ease, fill: 'backwards'});
        running.set(target, animation);
        animation.finished.then(() => running.delete(target), () => running.delete(target));
      });
  }, {threshold: 0, rootMargin: '0px 0px -24px 0px'});
  document.querySelectorAll(selectors.join(',')).forEach(element => {
    const rect = element.getBoundingClientRect();
    // Do not animate content already being read, including restored hash/scroll positions.
    if (rect.top < innerHeight && rect.bottom > 0) return;
    observer.observe(element);
  });
  document.addEventListener('keydown', event => {
    if (['Tab', 'PageDown', 'PageUp', 'Home', 'End', 'ArrowDown', 'ArrowUp', ' '].includes(event.key)) {
      keyboard = true;
      [...running.keys()].forEach(finish);
    }
  });
  document.addEventListener('pointerdown', () => { keyboard = false; }, {passive: true});
  document.addEventListener('wheel', () => { keyboard = false; }, {passive: true});
  document.addEventListener('focusin', event => {
    for (const element of running.keys()) if (element.contains(event.target)) finish(element);
  });
  reduce.addEventListener('change', () => {
    if (reduce.matches) { observer.disconnect(); [...running.keys()].forEach(finish); }
  });
  addEventListener('pagehide', () => { [...running.keys()].forEach(finish); });
})();
