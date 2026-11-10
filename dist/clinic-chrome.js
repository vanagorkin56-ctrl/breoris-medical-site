/* Shared contact disclosure and accessible navigation, November 2026. */
(() => {
 const header=document.querySelector('.header');if(!header)return;
 const words={uk:{address:'м. Дніпро, вул. Української Добровольчої армії, 2-Б',hours:'Пн–Пт 08:00–18:00 · Сб 08:00–14:00',show:'Показати номер телефону',hide:'Сховати номер телефону',call:'Зателефонувати'},en:{address:'Dnipro, 2-B Ukrainskoi Dobrovolchoi Armii St',hours:'Mon–Fri 08:00–18:00 · Sat 08:00–14:00',show:'Show phone number',hide:'Hide phone number',call:'Call the clinic'}};
 const language=()=>document.documentElement.lang==='en'?'en':'uk';
 const original=header.querySelector('.header-phone');
 let trigger,panel;
 if(original){
  const call=document.createElement('div');call.className='header-call';
  call.innerHTML='<button type="button" class="header-call-toggle" aria-expanded="false" aria-controls="header-call-panel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h4l2 5-3 2a13 13 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2C10 21 3 14 3 5a2 2 0 0 1 2-2Z"/></svg></button><div id="header-call-panel" class="header-call-panel" hidden><a class="header-call-number" href="tel:+380975323664" translate="no">+380 97 532 36 64</a><span data-chrome-text="call"></span></div>';
  original.replaceWith(call);trigger=call.querySelector('button');panel=call.querySelector('.header-call-panel');
  function close(restore=false){panel.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-label',words[language()].show);if(restore)trigger.focus();}
  trigger.addEventListener('click',event=>{const open=trigger.getAttribute('aria-expanded')!=='true';panel.hidden=!open;trigger.setAttribute('aria-expanded',String(open));trigger.setAttribute('aria-label',words[language()][open?'hide':'show']);call.classList.toggle('keyboard-open',event.detail===0);});
  document.addEventListener('click',event=>{if(!call.contains(event.target))close()});
  document.addEventListener('focusin',event=>{if(!call.contains(event.target))close()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){event.preventDefault();close(true)}});
 }
 function sync(){const copy=words[language()];document.querySelectorAll('[data-chrome-text]').forEach(el=>{el.textContent=copy[el.dataset.chromeText]||''});if(trigger)trigger.setAttribute('aria-label',copy[panel.hidden?'show':'hide']);}
 new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});sync();
 // Direction pages use static translated navigation and the same booking module.
 if(document.body.classList.contains('direction-detail')){
  const menu=header.querySelector('.menu-toggle'),nav=header.querySelector('#navigation');
  const close=()=>{menu.setAttribute('aria-expanded','false');nav.classList.remove('open')};
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){close();menu.focus()}});
  header.querySelector('.language-select').addEventListener('change',event=>{const folder=event.target.value==='en'?'en':'ua';location.assign('../../../'+folder+'/directions/'+document.body.dataset.direction+'/')});
 }
})();
