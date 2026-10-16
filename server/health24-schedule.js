'use strict';
const dayFormat = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Kyiv' });
const timeFormat = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Kyiv', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const statuses = new Set(['available', 'unavailable', 'free', 'busy', 'booked', 'reserved', 'blocked', 'closed']);
const flags = ['available', 'is_available', 'is_busy', 'busy', 'booked', 'is_booked', 'blocked', 'is_blocked', 'reserved', 'is_reserved', 'online_available', 'is_online_available', 'allow_online_booking', 'is_online', 'online'];
function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
function instant(value) {
  // Offset is mandatory: never guess the timezone or a slot's duration.
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !validDate(value.slice(0, 10))) throw new Error('invalid_schedule');
  const time = Date.parse(value);
  if (!Number.isFinite(time)) throw new Error('invalid_schedule');
  return time;
}
function normalizeSchedule(days, start, end) {
  if (!days || typeof days !== 'object' || Array.isArray(days) || Object.keys(days).length > 31) throw new Error('invalid_schedule');
  const result = {};
  for (const [day, slots] of Object.entries(days)) {
    if (!validDate(day) || day < start || day > end || !Array.isArray(slots) || slots.length > 1000) throw new Error('invalid_schedule');
    result[day] = slots.map(slot => {
      // Older documentation describes strings. They remain diagnostic-only:
      // their end time and booking availability have not been established.
      if (typeof slot === 'string') return slot;
      if (!slot || typeof slot !== 'object' || Array.isArray(slot)) throw new Error('invalid_schedule');
      const from = instant(slot.period_start), to = instant(slot.period_end);
      if (to <= from || to - from > 86400000 || dayFormat.format(new Date(from)) !== day) throw new Error('invalid_schedule');
      const time = timeFormat.format(new Date(from));
      if (slot.time !== undefined && slot.time !== time) throw new Error('invalid_schedule');
      const status = typeof slot.status === 'string' ? slot.status.toLowerCase() : '';
      return {
        time, period_start: slot.period_start, period_end: slot.period_end,
        status: statuses.has(status) ? status : 'unknown',
        flags: Object.fromEntries(flags.filter(key => typeof slot[key] === 'boolean').map(key => [key, slot[key]]))
      };
    });
  }
  return result;
}
module.exports = { normalizeSchedule, validDate };
