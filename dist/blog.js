(() => {
  const search=document.querySelector('#blog-search');
  if(!search)return;
  const cards=[...document.querySelectorAll('#blog-library-grid .blog-card')];
  const buttons=[...document.querySelectorAll('[data-blog-filter]')];
  let group='all';
  const normalize=s=>s.toLocaleLowerCase().normalize('NFKC').replace(/[’'`-]/g,' ').trim();
  const update=()=>{
    const words=normalize(search.value).split(/\s+/).filter(Boolean);
    let count=0;
    cards.forEach(card=>{card.hidden=(group!=='all'&&card.dataset.blogGroup!==group)||!words.every(word=>normalize(card.dataset.blogSearch+' '+card.textContent).includes(word));if(!card.hidden)count++});
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.blogFilter===group)));
    document.querySelector('.blog-results').textContent=`Знайдено матеріалів: ${count}`;
    document.querySelector('.blog-no-results').hidden=count>0;
  };
  search.closest('.blog-search').hidden=false;
  search.addEventListener('input',update);
  buttons.forEach(button=>button.addEventListener('click',()=>{group=button.dataset.blogFilter;update()}));
  update();
})();
