/* Appointment contact route until the clinic's production scheduling is connected. */
(() => {
  'use strict';
  const copy = {
    uk: ['Записатися на прийом', 'Зателефонуйте або напишіть адміністратору в Telegram. Разом оберемо лікаря та зручний час прийому.', 'Зателефонувати', 'Написати в Telegram', 'Час прийому підтверджує адміністратор клініки.', 'Закрити запис'],
    ru: ['Записаться на приём', 'Позвоните или напишите администратору в Telegram. Вместе выберем врача и удобное время приёма.', 'Позвонить', 'Написать в Telegram', 'Время приёма подтверждает администратор клиники.', 'Закрыть запись'],
    en: ['Book an appointment', 'Call or message our administrator on Telegram. We will help you choose a doctor and arrange a suitable appointment time.', 'Call us', 'Message on Telegram', 'The clinic administrator confirms your appointment time.', 'Close booking']
  };
  const dialog = document.createElement('dialog');
  dialog.id = 'contact-booking-dialog';
  dialog.setAttribute('aria-labelledby', 'contact-booking-title');
  dialog.setAttribute('aria-describedby', 'contact-booking-description');
  dialog.innerHTML = '<button type="button" class="dialog-close" aria-label="Закрити запис">×</button><h2 id="contact-booking-title"></h2><p id="contact-booking-context" class="contact-booking-context" hidden></p><p id="contact-booking-description"></p><div class="contact-booking-actions"><a class="button primary" href="tel:+380975323664"><span></span><small translate="no">+380 97 532 36 64</small></a><a class="button secondary" href="https://t.me/Breoris_Medical" target="_blank" rel="noopener noreferrer"></a></div><p class="contact-booking-note"></p>';
  document.body.append(dialog);
  let previousFocus, context = {};
  function render() {
    const lang = window.BreorisLocale?.language || document.documentElement.lang;
    const text = copy[lang] || copy.uk;
    dialog.querySelector('h2').textContent = text[0];
    dialog.querySelector('#contact-booking-description').textContent = text[1];
    dialog.querySelector('a[href^="tel:"] span').textContent = text[2];
    dialog.querySelector('a[target]').textContent = text[3];
    dialog.querySelector('.contact-booking-note').textContent = text[4];
    dialog.querySelector('button').setAttribute('aria-label', text[5]);
    const id = context.doctorId;
    const doctor = window.breorisData?.doctors.find(row => row.id === id);
    const option = [...document.querySelectorAll('#appointment-doctor option')].find(row => row.value === id);
    const label = doctor?.name || option?.textContent || context.service || '';
    const element = dialog.querySelector('#contact-booking-context');
    element.textContent = window.BreorisLocale?.t(label) || label;
    element.hidden = !label;
  }
  function open(service, doctorId) {
    if (dialog.open) return;
    previousFocus = document.activeElement;
    document.querySelectorAll('dialog[open]').forEach(other => other.close());
    context = { service, doctorId };
    render();
    dialog.showModal();
  }
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { if (previousFocus?.isConnected) previousFocus.focus(); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-book],[data-service],[data-doctor]');
    if (!trigger) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    open(trigger.dataset.service, trigger.dataset.doctor || trigger.dataset.physician || document.body.dataset.pageDoctor);
  }, true);
  document.addEventListener('change', event => { if (event.target.matches('.language-select') && dialog.open) render(); });
  window.BreorisContactBooking = { open };
})();
