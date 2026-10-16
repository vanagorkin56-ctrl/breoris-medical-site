'use strict';
// Local report: retain only numeric employee IDs and time-shaped slot samples.
// Unknown slot strings are described by length; their content is never exported.
async function scheduleReport(client, entity, employees, now = new Date()) {
  const start = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Kyiv' }).format(now);
  const end = new Date(Date.parse(start) + 13 * 86400000).toISOString().slice(0, 10);
  const active = employees.filter(row => row.fired === false && Number.isSafeInteger(row.id) && row.id > 0);
  const report = { environment: 'test', legalEntityId: Number(entity), checkedAt: now.toISOString(), periodStart: start, periodEnd: end, activeEmployeeCount: active.length, employees: [] };
  // Keep a local diagnostic bounded even if access unexpectedly covers a large clinic.
  for (const employee of active.slice(0, 10)) {
    let days;
    try { days = await client.schedule(employee.id, start, end); }
    catch (error) {
      // Keep the useful partial report, including safe schema diagnostics.
      report.employees.push({ employeeId: employee.id, scheduleRead: false, code: error.code || 'connection_failed', ...(error.upstreamStatus ? { upstreamStatus: error.upstreamStatus } : {}), ...(error.diagnostic ? { diagnostic: error.diagnostic } : {}) });
      continue;
    }
    const occupied = Object.entries(days).filter(([, slots]) => slots.length);
    report.employees.push({
      employeeId: employee.id,
      scheduleRead: true,
      daysReturned: Object.keys(days).length,
      daysWithSlots: occupied.length,
      slotCount: occupied.reduce((sum, [, slots]) => sum + slots.length, 0),
      samples: occupied.slice(0, 3).map(([date, slots]) => ({ date, slots: slots.slice(0, 3).map(slot => /^[0-9TZtz:+.,/ \-]{1,200}$/.test(slot) && /\d{2}:\d{2}/.test(slot) ? { kind: 'time_string', value: slot } : { kind: 'other_string', length: slot.length }) }))
    });
  }
  return report;
}
module.exports = { scheduleReport };
