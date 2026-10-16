'use strict';
const { createHash } = require('node:crypto');
const { configuration, createClient } = require('../../server/health24');
let client, configKey, lastResult, lastAt = 0, pending;
const messages = {
  missing_configuration: 'Додайте відсутні змінні середовища та виконайте Redeploy.',
  unsupported_api_host: 'Дозволені лише https://dev-ehr.h24.ua або https://ehr.h24.ua без додаткового шляху.',
  production_clinic_required: 'Для робочого API встановіть HEALTH24_LEGAL_ENTITY_ID=17027 і виконайте Redeploy.',
  test_clinic_required: '17027 — робоча клініка. Для тестового API використовуйте підтверджений тестовий профіль 22356.',
  invalid_configuration: 'Перевірте адресу API та HEALTH24_LEGAL_ENTITY_ID.',
  access_blocked: 'Health24 повернув 403. Причина не підтверджена: потрібна перевірка запиту їхньою підтримкою.',
  authorization_failed: 'Health24 відхилив авторизацію. Перевірте доступи для вибраного середовища.',
  network_error: 'Не вдалося отримати відповідь Health24. Можливе обмеження доступу або тимчасова недоступність.',
  unexpected_response: 'Health24 повернув неочікуваний формат відповіді.',
  upstream_error: 'Health24 повернув помилку. Потрібна перевірка доступу з їхньою підтримкою.'
};
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ code: 'method_not_allowed' }); }
  let config;
  try { config = configuration(); } catch (e) { return res.status(503).json({ connected: false, code: e.code, message: messages[e.code] }); }
  if (config.missing) return res.status(503).json({ connected: false, code: 'missing_configuration', missing: config.missing, message: messages.missing_configuration });
  const key = createHash('sha256').update(JSON.stringify(config)).digest('hex');
  if (key !== configKey) { client = createClient(config); configKey = key; lastResult = null; lastAt = 0; }
  // Coalesce requests and cache diagnostic results; no tokens or patient data are returned.
  if (!lastResult || Date.now() - lastAt > 300000) {
    if (!pending) pending = (async () => {
      try {
        const rows = await client.employees();
        return { connected: true, environment: config.environment, legalEntityId: Number(config.entity), employeeCount: rows.filter(e => e.fired === false).length, message: 'Авторизація та доступ до списку працівників клініки підтверджені. Створення та підтвердження запису перевіряються окремо.' };
      } catch (e) {
        const code = Object.hasOwn(messages, e.code) ? e.code : 'upstream_error';
        return { connected: false, environment: config.environment, legalEntityId: Number(config.entity), code, ...(e.upstreamStatus ? { upstreamStatus: e.upstreamStatus } : {}), ...(e.diagnostic ? { diagnostic: e.diagnostic } : {}), message: messages[code] };
      }
    })();
    try { lastResult = await pending; lastAt = Date.now(); } finally { pending = null; }
  }
  return res.status(lastResult.connected ? 200 : 502).json(lastResult);
};
