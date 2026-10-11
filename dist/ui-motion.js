(() => {
  const sections = document.querySelectorAll('.intro,.about-detail,.services,.feature,.additional,.doctors,.statement,.location,.contact-banner');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sections.forEach(section => section.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => entries.forEach(({isIntersecting, target}) => {
    if (!isIntersecting) return;
    target.classList.add('is-visible');
    observer.unobserve(target);
  }), {rootMargin:'0px 0px -8% 0px', threshold:0.08});
  sections.forEach(section => { section.dataset.reveal = ''; observer.observe(section); });
})();
