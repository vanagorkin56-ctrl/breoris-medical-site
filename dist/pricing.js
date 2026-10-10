// Patient-facing prices transcribed from Breoris Medical's Instagram price stories, supplied 2026-10-02.
// Keep this list in sync with the clinic's current approved price list before publishing.
window.BreorisPricing = (() => {
  const details = {
    'Ортопедія та травматологія': [
      ['consult', 'Консультація ортопеда-травматолога', 1200],
      ['release', 'Міофасціальний реліз', 850],
      ['joint', 'Внутрішньосуглобове введення / пункція + УЗД контроль', 1000, 'medicines'],
      ['block', 'Паравертебральна блокада', 1000, 'medicines']
    ],
    'Гінекологія': [
      ['consult', 'Консультація гінеколога', 1000],
      ['consult-us', 'Консультація + УЗД органів малого таза', 1500],
      ['colposcopy', 'Відеокольпоскопія', 700],
      ['biopsy', 'Біопсія', 2000, 'from']
    ],
    'Ультразвукова діагностика': [
      ['thyroid', 'УЗД щитоподібної залози', 600],
      ['abdomen', 'УЗД органів черевної порожнини', 800],
      ['kidneys', 'УЗД нирок та сечового міхура', 800],
      ['breast', 'УЗД молочних залоз', 800],
      ['soft', 'УЗД м’яких тканин', 500],
      ['joint', 'УЗД суглоба', 700],
      ['echo', 'ЕхоКГ / УЗД серця', 1000],
      ['head-vessels', 'УЗД судин голови та шиї', 1100],
      ['leg-vessels', 'УЗД судин нижніх кінцівок: артерії + вени', 800],
      ['renal-vessels', 'Доплерографія ниркових судин', 600],
      ['prostate', 'УЗД передміхурової залози + нирки + сечовий міхур', 800],
      ['testicular', 'УЗД органів калитки', 600]
    ],
    'Функціональна діагностика': [
      ['eeg', 'ЕЕГ', 1000], ['ecg', 'ЕКГ', 200],
      ['ecg-report', 'ЕКГ з розшифровкою', 300],
      ['bp-monitor', 'Добове моніторування артеріального тиску', 800, 'from']
    ],
    'Процедурний кабінет': [
      ['intramuscular', 'Внутрішньом’язове введення', 100, 'medicines'],
      ['intravenous', 'Внутрішньовенне введення', 500, 'medicines'],
      ['infusion', 'Інфузійна терапія', 700, 'medicines']
    ],
    'Виїзд медичних спеціалістів додому': [
      ['doctor-home', 'Виїзд лікаря додому', 1500, 'from']
    ]
  };
  const consultation = new Set(['Терапія','Неврологія','Кардіологія','Ендокринологія','Гастроентерологія','Ревматологія','Дерматологія','Ортопедія та травматологія','Гінекологія']);
  const seniorDoctors = new Set(['tomakh','pokaichuk','polnytska','kovalchuk','hrytsai','honchar']);
  const language=()=>window.BreorisLocale?.language||'uk';
  const word=(uk,ru,en)=>({uk,ru,en})[language()]||uk;
  const money=amount=>`${amount.toLocaleString({uk:'uk-UA',ru:'ru-RU',en:'en-GB'}[language()])} ${word('грн','грн','UAH')}`;
  const unknown=()=>({label:word('Уточніть в адміністратора','Уточните у администратора','Ask the administrator'),note:word('Ціна залежить від конкретного дослідження або плану лікування.','Цена зависит от конкретного исследования или плана лечения.','The price depends on the test or treatment plan.')});
  const exact = (amount,note='') => ({label:money(amount),amount,note});
  const from = (amount,note='') => ({label:`${word('від','от','from')} ${money(amount)}`,amount,note});
  function quote(service,detail,doctorId,repeat=false) {
    if (details[service] && detail) {
      const row=details[service].find(item=>item[0]===detail);
      if(row && detail!=='consult') return row[3]==='from'?from(row[2]):exact(row[2],row[3]==='medicines'?word('Без вартості препаратів.','Без стоимости препаратов.','Medicines are excluded.'):'');
    }
    if(service==='Електроенцефалографія (ЕЕГ)') return exact(1000);
    if(service==='Інфузійна терапія') return exact(700,word('Без вартості препаратів.','Без стоимости препаратов.','Medicines are excluded.'));
    if(service==='Денний стаціонар') return {label:`${money(300)} / ${word('год','час','hour')}`,amount:300,note:word('Без вартості препаратів. Підсумок залежить від тривалості.','Без стоимости препаратов. Итог зависит от продолжительности.','Medicines are excluded. The total depends on duration.')};
    if(!consultation.has(service)) return unknown();
    if(service==='Ортопедія та травматологія') return exact(repeat?900:1200);
    if(service==='Гінекологія') return exact(repeat?800:1000);
    if(seniorDoctors.has(doctorId)) return exact(repeat?900:1200);
    if(doctorId==='any') return {label:repeat?`${money(800)}–${money(900)}`:`${money(1000)}–${money(1200)}`,note:word('Точна сума залежить від лікаря.','Точная сумма зависит от врача.','The exact amount depends on the doctor.')};
    return exact(repeat?800:1000);
  }
  // Starting prices supplied by the clinic owner on 2026-10-07.
  const additionalStartingPrices = {'Проктологія':1000,'Урологія':1000,'Лікувальний та відновлювальний масаж':600};
  function summary(service) {
    if (additionalStartingPrices[service] != null) return from(additionalStartingPrices[service]).label;
    const physicianPrice = window.BreorisConsultationPrices?.[service];
    if (physicianPrice != null) return from(physicianPrice).label;
    const rows = details[service];
    if (rows?.length) return from(Math.min(...rows.map(row=>row[2]))).label;
    if (service === 'Електроенцефалографія (ЕЕГ)') return from(1000).label;
    if (service === 'Інфузійна терапія') return from(700).label;
    if (service === 'Денний стаціонар') return `${from(300).label} / ${word('год','час','hour')}`;
    return word('Ціну уточнюйте','Цену уточняйте','Ask for pricing');
  }
  return {details,consultation,quote,summary};
})();
