'use strict';
const { createHash } = require('node:crypto');
const { configuration, createClient } = require('../../server/health24');
let client, configKey, lastResult, lastAt = 0, pending;
const messages = {
  missing_configuration: 'Додайте відсутні змінні середовища та виконайте Redeploy.',
  test_environment_required: 'Для цього етапу встановіть HEALTH24_API_BASE_URL=https://dev-ehr.h24.ua і виконайте Redeploy.',
  invalid_configuration: 'Перевірте адресу API та HEALTH24_LEGAL_ENTITY_ID.',
  access_blocked: 'Health24 відхилив доступ (403). IP сервера Vercel може відрізнятися від IP вашого комп’ютера. Потрібне уточнення білого списку тестового середовища.',
  authorization_failed: 'Health24 відхилив авторизацію. Перевірте доступи для тестового середовища.',
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
        return { connected: true, environment: 'test', employeeCount: rows.filter(e => e.fired === false).length, message: 'Авторизація та доступ до списку працівників клініки підтверджені. Запис пацієнтів ще не увімкнено.' };
      } catch (e) {
        const code = Object.hasOwn(messages, e.code) ? e.code : 'upstream_error';
        return { connected: false, environment: 'test', code, ...(e.upstreamStatus ? { upstreamStatus: e.upstreamStatus } : {}), message: messages[code] };
      }
    })();
    try { lastResult = await pending; lastAt = Date.now(); } finally { pending = null; }
  }
  return res.status(lastResult.connected ? 200 : 502).json(lastResult);
};
