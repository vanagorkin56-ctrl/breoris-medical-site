'use strict';
const { responseShape } = require('./health24-response-shape');
const { normalizeSchedule, validDate } = require('./health24-schedule');
// Server-only: never import this file into dist/ or return upstream JSON.
class Health24Error extends Error {
  constructor(code, upstreamStatus, diagnostic) { super(code); this.code = code; this.upstreamStatus = upstreamStatus; this.diagnostic = diagnostic; }
}
function configuration(env = process.env) {
  const required = ['HEALTH24_API_BASE_URL', 'HEALTH24_CLIENT_ID', 'HEALTH24_CLIENT_SECRET', 'HEALTH24_LEGAL_ENTITY_ID'];
  const missing = required.filter(key => !env[key]?.trim());
  if (missing.length) return { missing };
  let base;
  try { base = new URL(env.HEALTH24_API_BASE_URL.trim()); } catch { throw new Health24Error('invalid_configuration'); }
  const environment = { 'https://dev-ehr.h24.ua': 'test', 'https://ehr.h24.ua': 'production' }[base.origin];
  if (!environment || !['', '/'].includes(base.pathname) || base.search || base.hash || base.username || base.password) {
    throw new Health24Error('unsupported_api_host');
  }
  const entity = env.HEALTH24_LEGAL_ENTITY_ID.trim();
  if (!/^[1-9]\d*$/.test(entity) || !Number.isSafeInteger(Number(entity))) throw new Health24Error('invalid_configuration');
  if (environment === 'production' && entity !== '17027') throw new Health24Error('production_clinic_required');
  if (environment === 'test' && entity === '17027') throw new Health24Error('test_clinic_required');
  return { base: base.origin, environment, clientId: env.HEALTH24_CLIENT_ID.trim(), secret: env.HEALTH24_CLIENT_SECRET.trim(), entity };
}
function createClient(config, fetcher = fetch) {
  let token = null, expires = 0, pendingToken;
  async function json(path, options = {}) {
    let response;
    try {
      response = await fetcher(config.base + path, { ...options, redirect: 'error', signal: AbortSignal.timeout(8000), headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...options.headers } });
    } catch { throw new Health24Error('network_error'); }
    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      const ray = response.headers.get('cf-ray') || '';
      const diagnostic = {
        method: options.method || 'GET', path: path.split('?')[0],
        checkedAt: new Date().toISOString(),
        responseKind: contentType.includes('application/json') ? 'json' : contentType.includes('text/html') ? 'html' : 'other',
        ...(response.headers.get('server')?.toLowerCase() === 'cloudflare' ? { server: 'cloudflare' } : {}),
        ...(/^[a-f0-9]{8,32}(?:-[a-z]{3})?$/i.test(ray) ? { cloudflareRayId: ray } : {})
      };
      // Only documented OAuth error codes may leave the server; no raw response text.
      if (diagnostic.responseKind === 'json') {
        try {
          const body = await response.json();
          if (['invalid_client', 'invalid_grant', 'invalid_scope', 'unauthorized_client', 'unsupported_grant_type', 'access_denied'].includes(body.error)) diagnostic.oauthError = body.error;
        } catch { /* The HTTP status remains useful even with invalid JSON. */ }
      }
      throw new Health24Error(response.status === 403 ? 'access_blocked' : response.status === 401 ? 'authorization_failed' : 'upstream_error', response.status, diagnostic);
    }
    if (!response.headers.get('content-type')?.includes('application/json')) throw new Health24Error('unexpected_response');
    try { return await response.json(); } catch { throw new Health24Error('unexpected_response'); }
  }
  async function authorize() {
    if (token && Date.now() < expires) return token;
    if (pendingToken) return pendingToken;
    pendingToken = (async () => {
      const data = await json('/oauth/token', { method: 'POST', body: JSON.stringify({ client_id: config.clientId, client_secret: config.secret, grant_type: 'client_credentials', scope: 'portal' }) });
      if (typeof data.access_token !== 'string' || !data.access_token || /[\r\n]/.test(data.access_token) || data.token_type?.toLowerCase() !== 'bearer' || !Number.isFinite(data.expires_in) || data.expires_in <= 0) throw new Health24Error('unexpected_response');
      token = data.access_token;
      expires = Date.now() + Math.max(0, data.expires_in * 1000 - 60000);
      return token;
    })();
    try { return await pendingToken; } finally { pendingToken = null; }
  }
  async function legalEntities() {
    const bearer = await authorize();
    const rows = await json('/api/v4/legal_entities', { headers: { Authorization: 'Bearer ' + bearer } });
    if (!Array.isArray(rows)) throw new Health24Error('unexpected_response');
    return rows.map(row => ({ id: row.id, name: row.name }));
  }
  async function employees(entity = config.entity) {
    if (!/^[1-9]\d*$/.test(String(entity)) || !Number.isSafeInteger(Number(entity))) throw new Health24Error('invalid_configuration');
    const bearer = await authorize();
    try {
      const rows = await json('/api/v4/employees?legal_entity_id=' + encodeURIComponent(entity), { headers: { Authorization: 'Bearer ' + bearer } });
      if (!Array.isArray(rows)) throw new Health24Error('unexpected_response');
      return rows;
    } catch (error) {
      if (error.upstreamStatus === 401) { token = null; expires = 0; }
      throw error;
    }
  }
  async function schedule(employeeId, periodStart, periodEnd) {
    if (!/^[1-9]\d*$/.test(String(employeeId)) || !Number.isSafeInteger(Number(employeeId))) throw new Health24Error('invalid_configuration');
    if (!validDate(periodStart) || !validDate(periodEnd) || periodEnd < periodStart || Date.parse(periodEnd) - Date.parse(periodStart) > 30 * 86400000) throw new Health24Error('invalid_schedule_range');
    const bearer = await authorize();
    const query = new URLSearchParams({ period_start: periodStart, period_end: periodEnd });
    const days = await json('/api/v4/employees/' + employeeId + '/schedule?' + query, { headers: { Authorization: 'Bearer ' + bearer } });
    try { return normalizeSchedule(days, periodStart, periodEnd); }
    catch { throw new Health24Error('unexpected_schedule_response', 200, { method: 'GET', path: '/api/v4/employees/' + employeeId + '/schedule', checkedAt: new Date().toISOString(), responseKind: 'json', structure: responseShape(days) }); }
  }
  async function createVisit(payload) {
    const bearer = await authorize();
    // A POST is never automatically retried: a lost response may still mean a visit was created.
    return json('/api/v4/visit_moderations', { method: 'POST', headers: { Authorization: 'Bearer ' + bearer }, body: JSON.stringify(payload) });
  }
  return { employees, legalEntities, schedule, createVisit };
}
module.exports = { configuration, createClient, Health24Error };
