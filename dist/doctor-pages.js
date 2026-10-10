(() => {
  'use strict';
  const q = selector => document.querySelector(selector);
  const config = window.BreorisDoctorConfig || {};
  const pageDoctor = document.body.dataset.pageDoctor || '';
  const booking = q('#physician-booking');
  const review = q('#physician-review');
  const pending = new WeakSet();
  const previousFocus = new WeakMap();
  function track(event, doctorId = pageDoctor) {
    const detail = {event, doctorId, path: location.pathname};
    window.dispatchEvent(new CustomEvent('breoris:analytics', {detail}));
    if (typeof config.onAnalyticsEvent === 'function') {
      try { config.onAnalyticsEvent(detail); } catch (_) { /* Analytics must not block booking. */ }
    }
  }
  function status(form, message, state = 'error') {
    const element = form.querySelector('.form-status');
    element.textContent = message;
    element.dataset.state = state;
    element.hidden = false;
  }
  function open(dialog, doctorId) {
    const form = dialog.querySelector('form');
    if (!pending.has(form)) {
      form.reset();
      form.querySelector('.form-status').hidden = true;
      form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
      form.querySelectorAll('input,select,textarea').forEach(el => el.setCustomValidity(''));
      form.querySelector('[name=doctorId]').value = doctorId;
      if (dialog === review) q('#review-count').textContent = '0 / 400';
    }
    previousFocus.set(dialog, document.activeElement);
    dialog.showModal();
  }
  q('.menu-toggle')?.addEventListener('click', function () {
    const expanded = this.getAttribute('aria-expanded') !== 'true';
    this.setAttribute('aria-expanded', String(expanded));
    q('#navigation').classList.toggle('open', expanded);
  });
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-book],[data-service]');
    if (button) {
      const id = button.dataset.physician || pageDoctor;
      track('booking_click', id);
      open(booking, id);
      return;
    }
    const reviewButton = event.target.closest('[data-review]');
    if (reviewButton) open(review, reviewButton.dataset.physician || pageDoctor);
    const closeButton = event.target.closest('[data-dialog-close]');
    if (closeButton) closeButton.closest('dialog').close();
    if (event.target.closest('a[href^="tel:"]')) track('phone_click');
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => previousFocus.get(dialog)?.focus());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
  });
  const phone = q('#appointment-phone');
  function formatPhone(value) {
    let digits = value.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('380')) digits = digits.slice(3);
    if (digits.startsWith('0')) digits = digits.slice(1);
    return '+380' + [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7)].filter(Boolean).map(part => ' ' + part).join('');
  }
  phone.addEventListener('input', () => {phone.value = formatPhone(phone.value); phone.setCustomValidity('');});
  phone.addEventListener('focus', () => {if (!phone.value) phone.value = '+380 ';});
  q('#review-text').addEventListener('input', event => {q('#review-count').textContent = `${event.target.value.length} / 400`;});
  document.querySelectorAll('form[data-form]').forEach(form => {
    form.addEventListener('input', event => {event.target.setCustomValidity?.('');event.target.removeAttribute('aria-invalid');});
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (pending.has(form)) return;
      const kind = form.dataset.form;
      const name = form.elements.name;
      name.setCustomValidity(name.value.trim().length >= 2 ? '' : 'Вкажіть ПІБ — щонайменше 2 символи.');
      if (kind === 'booking') phone.setCustomValidity(/^380\d{9}$/.test(phone.value.replace(/\D/g, '')) ? '' : 'Вкажіть номер у форматі +380 та 9 цифр.');
      if (kind === 'review') form.elements.text.setCustomValidity(form.elements.text.value.trim().length >= 2 && form.elements.text.value.length <= 400 ? '' : 'Напишіть відгук від 2 до 400 символів.');
      if (!form.checkValidity()) {
        const invalid = form.querySelector('input:invalid,select:invalid,textarea:invalid');
        invalid?.setAttribute('aria-invalid', 'true');
        status(form, invalid?.validationMessage || 'Перевірте поля форми.');
        invalid?.focus();
        return;
      }
      const endpoint = config[kind === 'booking' ? 'bookingEndpoint' : 'reviewEndpoint'];
      if (!endpoint) {
        status(form, kind === 'booking' ? 'Онлайн-запис поки недоступний. Зателефонуйте: +380 97 532 36 64.' : 'Надсилання відгуків поки недоступне. Спробуйте пізніше.');
        return;
      }
      let target;
      try {
        target = new URL(endpoint, location.href);
        const localHttp = target.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(target.hostname);
        if (target.protocol !== 'https:' && !localHttp) throw new Error('Invalid endpoint');
      } catch (_) {status(form, 'Форма тимчасово недоступна. Спробуйте пізніше.');return;}
      const payload = {name: name.value.trim(), doctorId: form.elements.doctorId.value};
      if (kind === 'booking') Object.assign(payload, {phone: '+' + phone.value.replace(/\D/g, ''), branchId: form.elements.branchId.value});
      else Object.assign(payload, {rating: Number(form.elements.rating.value), text: form.elements.text.value.trim()});
      const submit = form.querySelector('[type=submit]');
      const label = submit.textContent;
      pending.add(form);submit.disabled = true;submit.textContent = 'Надсилаємо…';form.setAttribute('aria-busy', 'true');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(target.href, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload), signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer'});
        if (!response.ok) throw new Error('Request rejected');
        const result = await response.json();
        if (result.accepted !== true || (kind === 'review' && result.moderationStatus !== 'pending')) throw new Error('Unconfirmed receipt');
        form.reset();form.elements.doctorId.value = payload.doctorId;
        if (kind === 'review') q('#review-count').textContent = '0 / 400';
        status(form, kind === 'booking' ? 'Дякуємо! Заявку отримано. Адміністратор зв’яжеться з вами для узгодження візиту.' : 'Дякуємо! Відгук піде на модерацію.', 'success');
      } catch (_) {
        status(form, 'Не вдалося підтвердити надсилання. Спробуйте пізніше або зателефонуйте: +380 97 532 36 64.');
      } finally {
        clearTimeout(timeout);pending.delete(form);submit.disabled = false;submit.textContent = label;form.removeAttribute('aria-busy');
      }
    });
  });
})();
