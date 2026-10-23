/* Progressive enhancement: all service links remain available without JavaScript. */
(() => {
  'use strict';
  const root = document.querySelector('.service-explorer');
  if (!root) return;
  const search = root.querySelector('#service-search');
  const cards = [...root.querySelectorAll('.service-card')];
  const filters = [...root.querySelectorAll('[data-service-group]')];
  const more = root.querySelector('#service-show-all');
  const clear = root.querySelector('#service-search-clear');
  const status = root.querySelector('#service-results');
  let group = 'all', expanded = root.dataset.showAll === 'true';
  const copy = {
    ru: ['Найти услугу или направление','Например: УЗИ, кардиолог, щитовидка','Показать все услуги','Показать меньше','Найдено направлений:','Показано направлений:'],
    en: ['Find a service or specialty','For example: ultrasound, cardiology, thyroid','Show all services','Show fewer','Specialties found:','Specialties shown:'],
    uk: ['Знайти послугу або напрям','Наприклад: УЗД, кардіолог, щитовидка','Показати всі послуги','Показати менше','Знайдено напрямів:','Показано напрямів:']
  };
  const normalize = value => value.toLocaleLowerCase().normalize('NFKC').replace(/[’'`\-–]/g,' ').replace(/\s+/g,' ').trim();
  function render() {
    const language = window.BreorisLocale?.language || 'uk';
    const text = copy[language];
    const words = normalize(search.value).split(' ').filter(Boolean);
    const matches = cards.filter(card => (group === 'all' || card.dataset.group === group) && words.every(word => normalize(card.dataset.search+' '+card.textContent).includes(word)));
    const filtering = words.length > 0 || group !== 'all';
    const visible = !filtering && !expanded ? matches.slice(0,8) : matches;
    cards.forEach(card => card.hidden = !visible.includes(card));
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.serviceGroup === group)));
    more.hidden = filtering;
    more.setAttribute('aria-expanded', String(expanded));
    more.textContent = expanded ? text[3] : text[2];
    clear.hidden = !search.value;
    root.querySelector('#service-empty').hidden = matches.length > 0;
    status.textContent = filtering ? `${text[4]} ${matches.length}` : `${text[5]} ${visible.length} / ${cards.length}`;
    root.querySelector('label[for="service-search"]').textContent = text[0];
    search.placeholder = text[1];
    cards.forEach(card => {
      const price = card.querySelector('.service-price');
      if (window.BreorisPricing) price.textContent = window.BreorisPricing.summary(card.dataset.serviceName);
    });
  }
  root.querySelector('.service-search').hidden = false;
  root.querySelector('.service-filters').hidden = false;
  status.hidden = false;
  search.addEventListener('input',render);
  clear.addEventListener('click',()=>{search.value='';render();search.focus()});
  filters.forEach(button=>button.addEventListener('click',()=>{group=button.dataset.serviceGroup;expanded=false;render()}));
  more.addEventListener('click',()=>{expanded=!expanded;render()});
  document.addEventListener('change',event=>{if(event.target.matches('.language-select'))render()});
  render();
})();
