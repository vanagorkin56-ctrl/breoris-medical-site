(() => {
 'use strict';
 const assets = new URL('.', document.currentScript.src);
 const strings = {
  uk: {
   title:'Зв’яжіться з нами', tab:'Запис на прийом', quick:'Швидкий зв’язок',
   intro:'Залиште контакти та побажання щодо візиту. Адміністратор зв’яжеться з вами й узгодить прийом.',
   name:'ПІБ', service:'Послуга або напрям', doctor:'Лікар', anyService:'Допоможіть обрати напрям', anyDoctor:'Допоможіть обрати лікаря',
   date:'Бажана дата', time:'Бажаний час', phone:'Телефон', email:'E-mail (необов’язково)', comment:'Коментар (необов’язково)',
   commentHint:'Наприклад, коли вам зручно відповісти на дзвінок.', consent:'Погоджуюся на обробку контактних даних для узгодження прийому.',
   note:'Бажані дата й час не є бронюванням. Усі записи, зокрема через Health24, узгоджує адміністратор.',
   submit:'Надіслати заявку', sending:'Надсилаємо…', received:'Заявку отримано', pending:'Адміністратор зв’яжеться з вами для узгодження дати та часу. Прийом ще не підтверджено.',
   reference:'Номер заявки', done:'Готово', close:'Закрити форму', call:'Зателефонувати', telegram:'Написати в Telegram',
   loading:'Завантажуємо форму…', unavailable:'Не вдалося надіслати заявку. Зателефонуйте або напишіть адміністратору.',
   uncertain:'Не вдалося перевірити отримання заявки. Уточніть її статус у адміністратора, перш ніж надсилати повторно.',
   invalid:'Перевірте заповнені поля.', phoneError:'Вкажіть український номер телефону: +380 та 9 цифр.',
   dateError:'Оберіть сьогоднішню або майбутню дату за Києвом.', invalidName:'Вкажіть ПІБ літерами.',
   limit:'Забагато спроб. Зачекайте кілька хвилин або зателефонуйте до клініки.',
   price:'Орієнтовна вартість — від', priceNote:'грн. Остаточну суму та склад послуги підтвердить адміністратор.',
   unknownPrice:'Вартість обраної послуги уточнить адміністратор.'
  },
  en: {
   title:'Contact us', tab:'Appointment request', quick:'Quick contact',
   intro:'Leave your contact details and visit preferences. An administrator will contact you to arrange your appointment.',
   name:'Full name', service:'Service or specialty', doctor:'Doctor', anyService:'Help me choose a service', anyDoctor:'Help me choose a doctor',
   date:'Preferred date', time:'Preferred time', phone:'Phone', email:'E-mail (optional)', comment:'Comment (optional)',
   commentHint:'For example, a convenient time to call you.', consent:'I agree to the processing of my contact details to arrange an appointment.',
   note:'Your preferred date and time are not a reservation. All appointments, including Health24 visits, are arranged by an administrator.',
   submit:'Send request', sending:'Sending…', received:'Request received', pending:'An administrator will contact you to agree a date and time. Your appointment is not yet confirmed.',
   reference:'Request reference', done:'Done', close:'Close form', call:'Call us', telegram:'Message on Telegram',
   loading:'Loading the form…', unavailable:'We could not send your request. Please call or message the administrator.',
   uncertain:'We could not verify receipt of your request. Please check with the administrator before sending it again.',
   invalid:'Please check the fields.', phoneError:'Enter a Ukrainian phone number: +380 followed by 9 digits.',
   dateError:'Choose today or a future date in Kyiv time.', invalidName:'Enter your full name using letters.',
   limit:'Too many attempts. Please wait a few minutes or call the clinic.',
   price:'Estimated price — from', priceNote:'UAH. The administrator will confirm the final price and what is included.',
   unknownPrice:'The administrator will confirm the price of your selected service.'
  }
 };
 const declarationStrings={
  uk:{title:'Декларація з терапевтом',tab:'Заявка на декларацію',intro:'Залиште контакти — адміністратор Breoris Medical зв’яжеться з вами та пояснить подальші кроки оформлення декларації.',consent:'Погоджуюся на обробку контактних даних для зв’язку щодо оформлення декларації.',note:'Це звернення до адміністратора. Надсилання заявки не означає, що декларацію вже оформлено.',pending:'Адміністратор Breoris Medical зв’яжеться з вами щодо оформлення декларації.',commentHint:'Залиште запитання або вкажіть зручний час для дзвінка.'},
  en:{title:'Declaration with a primary care doctor',tab:'Declaration request',intro:'Leave your contact details. A Breoris Medical administrator will contact you and explain the next steps for arranging your declaration.',consent:'I agree to the processing of my contact details regarding my declaration request.',note:'This is a request to the administrator. Submitting it does not complete a declaration.',pending:'A Breoris Medical administrator will contact you about arranging your declaration.',commentHint:'Leave a question or suggest a convenient time to call.'}
 };
 const dialog=document.createElement('dialog');
 dialog.id='administrator-booking-dialog';
 dialog.setAttribute('aria-labelledby','request-title');
 dialog.innerHTML=`<button type="button" class="dialog-close" data-request-close>×</button>
 <div class="request-layout"><div class="request-content"><p class="request-eyebrow">Breoris Medical</p>
 <h2 id="request-title" data-request-text="title"></h2>
 <div class="request-tabs"><span class="request-tab" data-request-text="tab"></span><a href="#request-quick-contact" data-request-text="quick"></a></div>
 <p class="request-intro" data-request-text="intro"></p>
 <p id="request-status" role="status" aria-live="polite" hidden></p>
 <form id="administrator-request-form"><div class="request-fields">
 <div class="request-wide"><label for="request-name" data-request-text="name"></label><input id="request-name" name="name" autocomplete="name" minlength="2" maxlength="80" required></div>
 <div class="request-wide"><label for="request-service" data-request-text="service"></label><select id="request-service" name="service"></select></div>
 <div class="request-wide"><label for="request-doctor" data-request-text="doctor"></label><select id="request-doctor" name="doctorId"></select><p id="request-selection-details" class="request-selection-details" aria-live="polite" hidden></p></div>
 <div><label for="request-date" data-request-text="date"></label><input id="request-date" name="preferredDate" type="date"></div>
 <div><label for="request-time" data-request-text="time"></label><input id="request-time" name="preferredTime" type="time" step="60"></div>
 <div><label for="request-phone" data-request-text="phone"></label><input id="request-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+380 97 000 00 00" maxlength="30" required></div>
 <div><label for="request-email" data-request-text="email"></label><input id="request-email" name="email" type="email" autocomplete="email" maxlength="254"></div>
 <div class="request-wide"><label for="request-comment" data-request-text="comment"></label><textarea id="request-comment" name="comment" rows="3" maxlength="600"></textarea><p class="request-hint" data-request-text="commentHint"></p></div>
 </div><div class="request-trap" aria-hidden="true"><label for="request-website">Website</label><input id="request-website" name="website" tabindex="-1" autocomplete="off"></div>
 <p class="request-price" aria-live="polite"></p><p class="request-note" data-request-text="note"></p>
 <label class="request-consent"><input id="request-consent" name="consent" type="checkbox" required><span data-request-text="consent"></span></label>
 <button type="submit" class="button primary" id="request-submit" data-request-text="submit"></button>
 </form><section id="request-success" hidden tabindex="-1"><h3 data-request-text="received"></h3><p data-request-text="pending"></p><p class="request-reference"></p><button type="button" class="button primary" data-request-close data-request-text="done"></button></section>
 <div id="request-quick-contact" class="request-help"><a href="tel:+380975323664" data-request-text="call"></a><a href="https://t.me/Breoris_Medical" target="_blank" rel="noopener noreferrer" data-request-text="telegram"></a></div>
 </div><figure class="request-photo"><img src="${new URL('assets/campaigns/contact-consultation-nov24.jpg',assets)}" alt="" width="1086" height="1448" loading="lazy"></figure></div>`;
 document.body.append(dialog);
 const q=s=>dialog.querySelector(s),form=q('form');
 let cataloguePromise, catalogue, previousFocus, posting=false, attemptId, generation=0, statusKey='', complete=false, ambiguous=false,requestKind='appointment';
 const locale=()=>(window.BreorisLocale?.language||document.documentElement.lang)==='en'?'en':'uk';
 const t=key=>(requestKind==='declaration'?declarationStrings[locale()][key]:null)||strings[locale()][key];
 const translate=value=>window.BreorisLocale?.t(value)||value;
 const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Kyiv'}).format(new Date());
 const option=(value,label)=>{const node=document.createElement('option');node.value=value;node.textContent=label;return node;};
 function notice(key){statusKey=key;q('#request-status').hidden=!key;q('#request-status').textContent=key?t(key):'';}
 function price(){const service=q('#request-service').value,amount=catalogue?.startingPrices[service];q('.request-price').textContent=amount?t('price')+' '+new Intl.NumberFormat('uk-UA').format(amount)+' '+t('priceNote'):t('unknownPrice');const doctor=catalogue?.doctors.find(d=>d.id===q('#request-doctor').value),details=q('#request-selection-details');details.textContent=doctor?translate(doctor.name)+' — '+translate(doctor.specialty):service==='Гастроентерологія'?translate('Гастроентерологія, нутриціологія, дієтологія'):'';details.hidden=!details.textContent;}
 function render(){dialog.querySelectorAll('[data-request-text]').forEach(el=>el.textContent=t(el.dataset.requestText));q('[data-request-close]').setAttribute('aria-label',t('close'));q('#request-submit').textContent=t(posting?'sending':'submit');q('#request-submit').disabled=posting||(requestKind!=='declaration'&&!catalogue)||ambiguous;for(const id of ['request-service','request-doctor','request-date','request-time'])q('#'+id).closest('div').hidden=requestKind==='declaration';q('.request-price').hidden=requestKind==='declaration';form.hidden=complete;q('#request-success').hidden=!complete;notice(statusKey);price();}
 function populateDoctors(selected=''){
  const service=q('#request-service').value;
  const list=catalogue.doctors.filter(d=>!service||d.services.includes(service));
  q('#request-doctor').replaceChildren(option('',t('anyDoctor')),...list.map(d=>option(d.id,translate(d.name)+' — '+translate(d.specialty))));
  if(list.some(d=>d.id===selected))q('#request-doctor').value=selected;
 }
 function populate(service='',doctorId=''){
  if(!catalogue)return;
  const selected=catalogue.doctors.find(d=>d.id===doctorId);
  if(selected&&(!service||!selected.services.includes(service)))service=selected.services[0]||'';
  q('#request-service').replaceChildren(option('',t('anyService')),...catalogue.services.map(s=>option(s,translate(s==='Гастроентерологія'?'Гастроентерологія, нутриціологія, дієтологія':s))));
  q('#request-service').value=catalogue.services.includes(service)?service:'';populateDoctors(doctorId);price();
 }
 async function open(service,doctorId,kind='appointment'){
  if(service==='Підготовка до ЕКОПФО')service='ЕКОПФО';
  if(dialog.open)return;previousFocus=document.activeElement;
  document.querySelectorAll('dialog[open]').forEach(other=>other.close());
  form.reset();requestKind=kind==='declaration'?'declaration':'appointment';complete=false;ambiguous=false;attemptId=crypto.randomUUID();const version=++generation;
  q('#request-date').min=today();notice('');render();dialog.showModal();
  if(requestKind==='declaration'){q('#request-name').focus();return;}
  try{
   if(!catalogue){notice('loading');cataloguePromise ||= fetch(new URL('appointment-catalog.json?v=20261124',assets)).then(r=>{if(!r.ok)throw Error();return r.json();}).catch(e=>{cataloguePromise=null;throw e;});catalogue=await cataloguePromise;}
   if(version!==generation||!dialog.open)return;
   populate(service,doctorId);notice('');render();q('#request-name').focus();
  }catch{if(version===generation){notice('unavailable');render();}}
 }
 dialog.addEventListener('close',()=>{generation++;form.reset();q('.request-reference').textContent='';if(previousFocus?.isConnected)previousFocus.focus();});
 dialog.addEventListener('cancel',event=>{if(posting)event.preventDefault();});
 dialog.addEventListener('click',event=>{if(event.target.closest('[data-request-close]')&&!posting)dialog.close();if(event.target===dialog&&!posting){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 q('#request-service').addEventListener('change',()=>{populateDoctors();price();});
 q('#request-doctor').addEventListener('change',price);
 form.addEventListener('input',event=>{event.target.setCustomValidity?.('');});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(posting||complete||ambiguous||(requestKind!=='declaration'&&!catalogue))return;
  const phone=q('#request-phone').value.replace(/\D/g,'');q('#request-phone').setCustomValidity(/^(380\d{9}|0\d{9})$/.test(phone)?'':t('phoneError'));
  const name=q('#request-name').value.trim();q('#request-name').setCustomValidity(name.length>=2&&/^[\p{L}\p{M}\s'’ʼ-]+$/u.test(name)?'':t('invalidName'));
  const date=q('#request-date').value;q('#request-date').setCustomValidity(date&&date<today()?t('dateError'):'');
  q('#request-time').setCustomValidity(q('#request-time').value&&!date?t('dateError'):'');
  if(!form.reportValidity())return;
  const declaration=requestKind==='declaration';
  const payload={attemptId,requestKind,doctorId:declaration?'':q('#request-doctor').value,service:declaration?'':q('#request-service').value,preferredDate:declaration?'':date,preferredTime:declaration?'':q('#request-time').value,email:q('#request-email').value.trim(),comment:q('#request-comment').value.trim(),website:q('#request-website').value,patient:{name,phone:q('#request-phone').value,consent:q('#request-consent').checked}};
  posting=true;form.setAttribute('aria-busy','true');form.querySelectorAll('input,select,textarea,button').forEach(el=>el.disabled=true);q('[data-request-close]').disabled=true;notice('sending');render();
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{
   const response=await fetch('/api/booking/administrator-requests',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload),signal:controller.signal});
   const result=await response.json();
   if(!response.ok||result.ok!==true){const error=new Error();error.code=result.code;throw error;}
   if(result.accepted!==true||result.confirmed!==false||typeof result.reference!=='string')throw Error();
   complete=true;q('.request-reference').textContent=t('reference')+': '+result.reference;notice('');form.reset();
  }catch(error){
   if(['invalid_request','invalid_patient','invalid_date','doctor_unavailable'].includes(error.code)){notice('invalid');attemptId=crypto.randomUUID();}
   else if(error.code==='too_many_requests'){notice('limit');}
   else if(error.code==='service_unavailable'){notice('unavailable');}
   else{ambiguous=true;notice('uncertain');}
  }finally{clearTimeout(timer);posting=false;form.removeAttribute('aria-busy');form.querySelectorAll('input,select,textarea,button').forEach(el=>el.disabled=false);q('[data-request-close]').disabled=false;render();if(complete)q('#request-success').focus();}
 });
 document.addEventListener('click',event=>{const trigger=event.target.closest('[data-declaration],[data-book],[data-service],[data-doctor]');if(!trigger)return;event.preventDefault();event.stopImmediatePropagation();open(trigger.dataset.service,trigger.dataset.doctor||trigger.dataset.physician||document.body.dataset.pageDoctor,trigger.hasAttribute('data-declaration')?'declaration':'appointment');},true);
 document.addEventListener('change',event=>{if(event.target.matches('.language-select')&&dialog.open){populate(q('#request-service').value,q('#request-doctor').value);render();}});
 window.BreorisBooking={open};
})();
