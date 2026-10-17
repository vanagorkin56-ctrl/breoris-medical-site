/* Patient booking through the clinic's server-side Health24 integration. */
(() => {
 'use strict';
 const strings={
 uk:{title:'Записатися на прийом',intro:'Оберіть лікаря, вільний час і заповніть дані для запису.',doctor:'Лікар і напрям',choose:'Оберіть лікаря',loading:'Завантажуємо…',next:'Далі',back:'Назад',close:'Закрити запис',dates:'Вільні дати',period:'Шукати починаючи з',time:'Вільний час',timezone:'Час прийому — за Києвом.',more:'Наступні 14 днів',empty:'На ці дати у розкладі немає вільного часу. Оберіть інший період або лікаря.',missing:'Онлайн-розклад обраного лікаря поки недоступний. Оберіть іншого лікаря або зверніться до клініки.',mismatch:'Напрям цього лікаря в онлайн-розкладі відрізняється від картки на сайті. Уточніть його у клініці.',first:'Ім’я',last:'Прізвище',phone:'Телефон',birth:'Дата народження',gender:'Стать',female:'Жіноча',male:'Чоловіча',consent:'Погоджуюся на обробку цих даних клінікою для запису на прийом.',submit:'Підтвердити запис',sending:'Створюємо запис…',success:'Ви записані на прийом',pending:'Заявку на запис отримано',pendingText:'Клініка підтвердить прийом. За потреби зв’яжеться з вами.',reference:'Номер запису',done:'Повернутися на сайт',help:'Потрібна допомога?',telegram:'Написати в Telegram',call:'Зателефонувати',selectTime:'Оберіть вільний час.',selectDoctor:'Оберіть лікаря та напрям.',invalid_patient:'Перевірте ім’я, прізвище, телефон, дату народження та згоду.',invalidPhone:'Вкажіть український номер: +380 та 9 цифр.',invalid_request:'Не вдалося перевірити дані. Відкрийте запис ще раз.',slot_taken:'Цей час уже зайняли. Оберіть інший інтервал.',slot_expired:'Оновимо розклад — оберіть час ще раз.',doctor_unavailable:'Цей лікар наразі недоступний для онлайн-запису.',booking_rejected:'Не вдалося підтвердити цей інтервал. Оберіть інший час або зверніться до клініки.',booking_uncertain:'Не вдалося отримати підтвердження. Щоб не створити повторний запис, зателефонуйте до клініки та уточніть результат.',too_many_requests:'Забагато спроб. Зачекайте кілька хвилин або зверніться до клініки.',health24_unavailable:'Не вдалося завантажити дані клініки. Спробуйте пізніше або зателефонуйте.',step1:'1. Лікар',step2:'2. Дата і час',step3:'3. Ваші дані',loadingSchedule:'Завантажуємо розклад…'},
 ru:{title:'Записаться на приём',intro:'Выберите врача, свободное время и заполните данные для записи.',doctor:'Врач и направление',choose:'Выберите врача',loading:'Загружаем…',next:'Далее',back:'Назад',close:'Закрыть запись',dates:'Свободные даты',period:'Искать начиная с',time:'Свободное время',timezone:'Время приёма — по Киеву.',more:'Следующие 14 дней',empty:'На эти даты в расписании нет свободного времени. Выберите другой период или врача.',missing:'Онлайн-расписание выбранного врача пока недоступно. Выберите другого врача или свяжитесь с клиникой.',mismatch:'Направление этого врача в онлайн-расписании отличается от карточки на сайте. Уточните его в клинике.',first:'Имя',last:'Фамилия',phone:'Телефон',birth:'Дата рождения',gender:'Пол',female:'Женский',male:'Мужской',consent:'Соглашаюсь на обработку этих данных клиникой для записи на приём.',submit:'Подтвердить запись',sending:'Создаём запись…',success:'Вы записаны на приём',pending:'Заявка на запись получена',pendingText:'Клиника подтвердит приём. При необходимости свяжется с вами.',reference:'Номер записи',done:'Вернуться на сайт',help:'Нужна помощь?',telegram:'Написать в Telegram',call:'Позвонить',selectTime:'Выберите свободное время.',selectDoctor:'Выберите врача и направление.',invalid_patient:'Проверьте имя, фамилию, телефон, дату рождения и согласие.',invalidPhone:'Укажите украинский номер: +380 и 9 цифр.',invalid_request:'Не удалось проверить данные. Откройте запись ещё раз.',slot_taken:'Это время уже заняли. Выберите другой интервал.',slot_expired:'Обновим расписание — выберите время ещё раз.',doctor_unavailable:'Этот врач сейчас недоступен для онлайн-записи.',booking_rejected:'Не удалось подтвердить этот интервал. Выберите другое время или свяжитесь с клиникой.',booking_uncertain:'Не удалось получить подтверждение. Чтобы не создать повторную запись, позвоните в клинику и уточните результат.',too_many_requests:'Слишком много попыток. Подождите несколько минут или свяжитесь с клиникой.',health24_unavailable:'Не удалось загрузить данные клиники. Попробуйте позже или позвоните.',step1:'1. Врач',step2:'2. Дата и время',step3:'3. Ваши данные',loadingSchedule:'Загружаем расписание…'},
 en:{title:'Book an appointment',intro:'Choose a doctor, an available time and enter your details.',doctor:'Doctor and specialty',choose:'Choose a doctor',loading:'Loading…',next:'Continue',back:'Back',close:'Close booking',dates:'Available dates',period:'Search from',time:'Available times',timezone:'Appointment times are shown in Kyiv time.',more:'Next 14 days',empty:'There are no available times for these dates. Choose another date range or doctor.',missing:'This doctor’s online schedule is currently unavailable. Choose another doctor or contact the clinic.',mismatch:'This doctor’s specialty in the online schedule differs from the website profile. Please check with the clinic.',first:'First name',last:'Last name',phone:'Phone',birth:'Date of birth',gender:'Sex',female:'Female',male:'Male',consent:'I agree to the clinic processing these details to arrange my appointment.',submit:'Confirm appointment',sending:'Creating your appointment…',success:'Your appointment is booked',pending:'Appointment request received',pendingText:'The clinic will confirm your appointment and contact you if needed.',reference:'Appointment reference',done:'Return to the website',help:'Need help?',telegram:'Message on Telegram',call:'Call the clinic',selectTime:'Choose an available time.',selectDoctor:'Choose a doctor and specialty.',invalid_patient:'Check your name, phone, date of birth and consent.',invalidPhone:'Enter a Ukrainian phone number: +380 and 9 digits.',invalid_request:'We could not verify your details. Please reopen booking.',slot_taken:'This time is no longer available. Choose another slot.',slot_expired:'We need to refresh the schedule. Please choose your time again.',doctor_unavailable:'This doctor is currently unavailable for online booking.',booking_rejected:'We could not confirm this slot. Choose another time or contact the clinic.',booking_uncertain:'We could not confirm the result. To avoid a duplicate appointment, call the clinic and check whether your booking was received.',too_many_requests:'Too many attempts. Wait a few minutes or contact the clinic.',health24_unavailable:'We could not load the clinic’s data. Please try later or call the clinic.',step1:'1. Doctor',step2:'2. Date and time',step3:'3. Your details',loadingSchedule:'Loading available times…'}
 };
 const priceStrings={uk:{estimate:'Орієнтовна вартість консультації',from:'від',priceNote:'Остаточну вартість підтвердить адміністратор. Додаткові обстеження та процедури оплачуються окремо.',priceUnknown:'Вартість обраної послуги уточнить адміністратор.'},ru:{estimate:'Ориентировочная стоимость консультации',from:'от',priceNote:'Окончательную стоимость подтвердит администратор. Дополнительные обследования и процедуры оплачиваются отдельно.',priceUnknown:'Стоимость выбранной услуги уточнит администратор.'},en:{estimate:'Estimated consultation price',from:'from',priceNote:'The administrator will confirm the final price. Additional examinations and procedures are charged separately.',priceUnknown:'The administrator will confirm the price of this service.'}};
 for(const lang of Object.keys(priceStrings))Object.assign(strings[lang],priceStrings[lang]);
 const dialog=document.createElement('dialog');dialog.id='health24-booking-dialog';dialog.setAttribute('aria-labelledby','h24-title');
 dialog.innerHTML=`<button type="button" class="dialog-close" data-h24-close aria-label="Закрити запис">×</button><h2 id="h24-title" data-h24-text="title"></h2><nav class="h24-steps" aria-label="Етапи запису"><span data-h24-step="0" data-h24-text="step1"></span><span data-h24-step="1" data-h24-text="step2"></span><span data-h24-step="2" data-h24-text="step3"></span></nav><p class="h24-intro" data-h24-text="intro"></p><p id="h24-context" hidden></p><p id="h24-status" role="status" aria-live="polite" hidden></p><form id="h24-form" novalidate><section data-h24-panel="0"><label for="h24-doctor" data-h24-text="doctor"></label><select id="h24-doctor" required></select><p id="h24-doctor-note" hidden></p></section><section data-h24-panel="1" hidden><p class="h24-summary"></p><label for="h24-period" data-h24-text="period"></label><div class="h24-date-search"><input id="h24-period" type="date" required><button type="button" class="h24-more" data-h24-text="more"></button></div><h3 data-h24-text="dates"></h3><div id="h24-days" class="h24-days" role="group"></div><h3 data-h24-text="time"></h3><div id="h24-times" class="h24-times" role="group"></div><p class="h24-hint" data-h24-text="timezone"></p></section><section data-h24-panel="2" hidden><p class="h24-summary"></p><div class="h24-fields"><div><label for="h24-first" data-h24-text="first"></label><input id="h24-first" name="firstName" autocomplete="given-name" required minlength="2" maxlength="80"></div><div><label for="h24-last" data-h24-text="last"></label><input id="h24-last" name="lastName" autocomplete="family-name" required minlength="2" maxlength="80"></div><div><label for="h24-phone" data-h24-text="phone"></label><input id="h24-phone" name="phone" type="tel" autocomplete="tel" placeholder="+380 97 000 00 00" required maxlength="30"></div><div><label for="h24-birth" data-h24-text="birth"></label><input id="h24-birth" name="birthDate" type="date" autocomplete="bday" required></div><div><label for="h24-gender" data-h24-text="gender"></label><select id="h24-gender" name="gender" required><option value="">—</option><option value="female" data-h24-text="female"></option><option value="male" data-h24-text="male"></option></select></div></div><label class="h24-consent"><input id="h24-consent" name="consent" type="checkbox" required><span data-h24-text="consent"></span></label></section><div class="h24-actions"><button type="button" class="text-link" id="h24-back" data-h24-text="back" hidden></button><button type="submit" class="button primary" id="h24-next" data-h24-text="next"></button></div></form><section id="h24-success" hidden aria-live="polite"><h3></h3><p class="h24-result-summary"></p><p class="h24-pending" data-h24-text="pendingText" hidden></p><p class="h24-reference"></p><button type="button" class="button primary" data-h24-close data-h24-text="done"></button></section><div class="h24-help"><span data-h24-text="help"></span> <a href="tel:+380975323664" data-h24-text="call"></a> · <a href="https://t.me/Breoris_Medical" target="_blank" rel="noopener noreferrer" data-h24-text="telegram"></a></div>`;
 for(const selector of ['[data-h24-panel="0"]','[data-h24-panel="2"]','#h24-success']){
  const price=document.createElement('p');price.className='h24-price';price.setAttribute('aria-live','polite');dialog.querySelector(selector).append(price);
 }
 document.body.append(dialog);
 const q=s=>dialog.querySelector(s),form=q('form');let state={},previousFocus,generation=0,requestVersion=0;
 const locale=()=>window.BreorisLocale?.language||document.documentElement.lang||'uk';
 const t=key=>(strings[locale()]||strings.uk)[key]||strings.uk[key]||strings.uk.health24_unavailable;
 const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Kyiv'}).format(new Date());
 const addDays=(day,n)=>new Date(Date.parse(day)+n*86400000).toISOString().slice(0,10);
 const doctor=()=>state.doctors?.find(d=>String(d.id)===q('#h24-doctor').value);
 const dateLabel=(date)=>new Intl.DateTimeFormat({uk:'uk-UA',ru:'ru-RU',en:'en-GB'}[locale()]||'uk-UA',{weekday:'short',day:'numeric',month:'short',timeZone:'Europe/Kyiv'}).format(new Date(date+'T12:00:00Z'));
 function status(key){state.status=key;q('#h24-status').textContent=key?t(key):'';q('#h24-status').hidden=!key;}
 function summary(){const d=doctor();return d?[d.name,d.specialty,state.date?dateLabel(state.date):'',state.slot?.time||''].filter(Boolean).join(' · '):'';}
 function render(){
  dialog.querySelectorAll('[data-h24-text]').forEach(el=>el.textContent=t(el.dataset.h24Text));
  q('[data-h24-close]').setAttribute('aria-label',t('close'));
  dialog.querySelectorAll('[data-h24-panel]').forEach(el=>el.hidden=Number(el.dataset.h24Panel)!==state.step);
  dialog.querySelectorAll('[data-h24-step]').forEach(el=>{if(Number(el.dataset.h24Step)===state.step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  dialog.querySelectorAll('.h24-summary').forEach(el=>el.textContent=summary());
  const selected=doctor(),amount=state.complete?state.result?.consultationFrom:selected?.consultationFrom;
  dialog.querySelectorAll('.h24-price').forEach(el=>{el.hidden=!selected&&!state.complete;el.textContent=Number.isFinite(amount)?t('estimate')+': '+t('from')+' '+new Intl.NumberFormat('uk-UA').format(amount)+' грн. '+t('priceNote'):t('priceUnknown');});
  q('#h24-back').hidden=state.step===0||state.complete;
  q('#h24-next').textContent=t(state.posting?'sending':state.step===2?'submit':'next');
  q('#h24-next').disabled=!!(state.loading||state.posting||state.uncertain);
  q('#h24-days').setAttribute('aria-label',t('dates'));q('#h24-times').setAttribute('aria-label',t('time'));q('.h24-more').disabled=!!state.loading||addDays(q('#h24-period').value||today(),14)>addDays(today(),90);
  q('#h24-back').disabled=!!state.posting;q('[data-h24-close]').disabled=!!state.posting;
  form.hidden=!!state.complete;q('#h24-success').hidden=!state.complete;q('.h24-steps').hidden=!!state.complete;q('.h24-intro').hidden=!!state.complete;
  if(state.status)q('#h24-status').textContent=t(state.status);
  if(state.note)q('#h24-doctor-note').textContent=t(state.note);
 }
 function option(value,label){const el=document.createElement('option');el.value=value;el.textContent=label;return el;}
 function renderDoctors(){
  const select=q('#h24-doctor');select.replaceChildren(option('',t('choose')),...state.doctors.map(d=>option(String(d.id),d.name+' — '+d.specialty)));
  const matches=state.context.doctorId?state.doctors.filter(d=>d.siteId===state.context.doctorId):[];
  const preferred={sushko:596096,sokrut:595938};
  const mismatch=['hrytsai','pokaichuk'].includes(state.context.doctorId);
  if(!mismatch&&matches.length===1)select.value=String(matches[0].id);
  else if(!mismatch&&preferred[state.context.doctorId]&&matches.some(d=>d.id===preferred[state.context.doctorId]))select.value=String(preferred[state.context.doctorId]);
  state.note=state.context.doctorId?(mismatch?'mismatch':matches.length?'':'missing'):'';
  q('#h24-doctor-note').hidden=!state.note;render();
 }
 async function api(path,options={}){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),65000);
  try{const response=await fetch('/api/health24/'+path,{...options,signal:controller.signal,credentials:'same-origin',headers:{Accept:'application/json',...options.headers}});const data=await response.json();if(!response.ok||data.ok!==true){const error=new Error(data.code||'health24_unavailable');error.code=data.code||'health24_unavailable';throw error;}return data;}
  finally{clearTimeout(timer);}
 }
 function renderTimes(){
  const container=q('#h24-times');container.replaceChildren();
  const day=state.days?.find(row=>row.date===state.date);
  for(const slot of day?.slots||[]){const button=document.createElement('button');button.type='button';button.textContent=slot.time;button.setAttribute('aria-pressed',String(state.slot===slot));button.addEventListener('click',()=>{state.slot=slot;state.attemptId=crypto.randomUUID();status('');renderTimes();});container.append(button);}
  render();
 }
 function renderDays(){
  const container=q('#h24-days');container.replaceChildren();
  const days=(state.days||[]).filter(day=>day.slots.length);
  for(const day of days){const button=document.createElement('button');button.type='button';button.textContent=dateLabel(day.date);button.setAttribute('aria-pressed',String(day.date===state.date));button.addEventListener('click',()=>{state.date=day.date;state.slot=null;status('');renderDays();renderTimes();});container.append(button);}
  if(!days.length)status('empty');renderTimes();
 }
 async function loadSlots(start=q('#h24-period').value){
  const d=doctor();if(!d)return;
  const currentGeneration=generation,version=++requestVersion;state.loading=true;state.slot=null;state.date=null;state.days=[];q('#h24-days').replaceChildren();q('#h24-times').replaceChildren();status('loadingSchedule');render();
  try{const result=await api('availability?employeeId='+d.id+'&start='+encodeURIComponent(start));if(currentGeneration!==generation||version!==requestVersion||!dialog.open)return;state.days=result.days;state.date=result.days.find(day=>day.slots.length)?.date||null;status('');renderDays();}
  catch(error){if(currentGeneration===generation&&version===requestVersion)status(error.code||'health24_unavailable');}
  finally{if(currentGeneration===generation&&version===requestVersion){state.loading=false;render();}}
 }
 async function open(service,doctorId){
  if(dialog.open)return;previousFocus=document.activeElement;document.querySelectorAll('dialog[open]').forEach(other=>other.close());form.reset();
  state={step:0,context:{service,doctorId},doctors:[],days:[],slot:null,loading:true,posting:false,complete:false,attemptId:crypto.randomUUID()};const currentGeneration=++generation;
  q('#h24-doctor').replaceChildren(option('',t('loading')));q('#h24-period').min=today();q('#h24-period').max=addDays(today(),90);q('#h24-period').value=today();q('#h24-birth').max=today();q('#h24-birth').min=addDays(today(),-130*366);q('#h24-doctor-note').hidden=true;
  const localDoctor=window.breorisData?.doctors.find(d=>d.id===doctorId);const localOption=[...document.querySelectorAll('#appointment-doctor option')].find(el=>el.value===doctorId);
  q('#h24-context').textContent=localDoctor?.name||localOption?.textContent||window.BreorisLocale?.t(service)||service||'';q('#h24-context').hidden=!q('#h24-context').textContent;status('');render();dialog.showModal();
  try{const result=await api('catalog');if(currentGeneration!==generation||!dialog.open)return;state.doctors=result.doctors;renderDoctors();}
  catch(error){if(currentGeneration===generation)status(error.code||'health24_unavailable');}
  finally{if(currentGeneration===generation){state.loading=false;render();}}
 }
 dialog.addEventListener('click',event=>{if(event.target.closest('[data-h24-close]')&&!state.posting)dialog.close();if(event.target===dialog&&!state.posting){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
 dialog.addEventListener('cancel',event=>{if(state.posting)event.preventDefault();});
 dialog.addEventListener('close',()=>{generation++;requestVersion++;form.reset();if(previousFocus?.isConnected)previousFocus.focus();});
 q('#h24-doctor').addEventListener('change',()=>{state.slot=null;state.days=[];status('');render();});
 q('#h24-period').addEventListener('change',()=>{if(q('#h24-period').reportValidity())loadSlots();});
 q('.h24-more').addEventListener('click',()=>{const next=addDays(q('#h24-period').value,14);if(next<=q('#h24-period').max){q('#h24-period').value=next;loadSlots(next);}});
 q('#h24-back').addEventListener('click',()=>{if(state.posting)return;state.step=Math.max(0,state.step-1);status('');render();if(state.step===0)q('#h24-doctor').focus();});
 form.addEventListener('input',event=>event.target.setCustomValidity?.(''));
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(state.loading||state.posting||state.uncertain)return;
  if(state.step===0){if(!doctor()){status('selectDoctor');q('#h24-doctor').focus();return;}state.step=1;render();await loadSlots();return;}
  if(state.step===1){if(!state.slot){status('selectTime');q('#h24-times button')?.focus();return;}state.step=2;status('');render();q('#h24-first').focus();return;}
  const phone=q('#h24-phone').value.replace(/\D/g,'');q('#h24-phone').setCustomValidity(/^(380\d{9}|0\d{9})$/.test(phone)?'':t('invalidPhone'));
  if(!form.reportValidity())return;
  const patient={firstName:q('#h24-first').value,lastName:q('#h24-last').value,phone:q('#h24-phone').value,birthDate:q('#h24-birth').value,gender:q('#h24-gender').value,consent:q('#h24-consent').checked};
  state.posting=true;form.setAttribute('aria-busy','true');status('sending');render();
  try{
   const result=await api('appointments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({attemptId:state.attemptId,token:state.slot.token,patient})});
   state.complete=true;state.result=result;status('');q('#h24-success h3').textContent=t(result.confirmed?'success':'pending');q('.h24-result-summary').textContent=summary()+(result.location?' · '+result.location:'');q('.h24-pending').hidden=result.confirmed;q('.h24-reference').textContent=t('reference')+': '+result.reference;form.reset();
  }catch(error){
   const code=error.code||'booking_uncertain';status(code);
   if(['slot_taken','slot_expired','booking_rejected','doctor_unavailable'].includes(code)){state.step=1;await loadSlots();status(code);}
   else if(code==='booking_uncertain')state.uncertain=true;
   else state.attemptId=crypto.randomUUID();
  }finally{state.posting=false;form.removeAttribute('aria-busy');render();if(state.complete)q('#h24-success button').focus();}
 });
 document.addEventListener('click',event=>{const trigger=event.target.closest('[data-book],[data-service],[data-doctor]');if(!trigger)return;event.preventDefault();event.stopImmediatePropagation();open(trigger.dataset.service,trigger.dataset.doctor||trigger.dataset.physician||document.body.dataset.pageDoctor);},true);
 document.addEventListener('change',event=>{if(event.target.matches('.language-select')&&dialog.open){const selected=q('#h24-doctor').value;render();q('#h24-doctor option[value=""]').textContent=t('choose');q('#h24-doctor').value=selected;if(state.step===1)renderDays();}});
 window.BreorisBooking={open};
})();
