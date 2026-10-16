'use strict';
// Describe a schedule response without copying arbitrary strings or field names.
const fields = new Set(['data','result','results','response','schedule','schedules','slots','times','date','day','time','start','end','from','to','period_start','period_end','start_time','end_time','time_start','time_end','starts_at','ends_at','start_at','end_at','duration','id','employee_id','status','available','is_available','meta','pagination','error','errors','message','details','work_days','intervals','time_off_intervals','count','total']);
const timeString = value => typeof value === 'string' && /^[0-9TZtz:+.,/ \-]{1,200}$/.test(value) && /\d{2}:\d{2}/.test(value);
function responseShape(value) {
  let budget = 200;
  function describe(item, depth) {
    if (--budget < 0) return { type: 'truncated' };
    if (item === null) return { type: 'null' };
    if (typeof item === 'string') return { type: 'string', length: item.length, ...(timeString(item) ? { timeExample: item } : {}) };
    if (typeof item !== 'object') return { type: typeof item };
    if (Array.isArray(item)) return { type: 'array', length: item.length, ...(depth < 5 ? { examples: item.slice(0, 3).map(row => describe(row, depth + 1)) } : {}) };
    const entries = Object.entries(item);
    const keyName = key => fields.has(key) || /^\d{4}-\d{2}-\d{2}$/.test(key) ? key : timeString(key) ? key : '[other_field]';
    // Date maps can begin with empty days: include nonempty days first in examples.
    const examples = [...entries].sort((a,b) => Number(Array.isArray(b[1]) && b[1].length > 0) - Number(Array.isArray(a[1]) && a[1].length > 0));
    return { type: 'object', fieldCount: entries.length, keys: entries.slice(0, 40).map(([key]) => keyName(key)), ...(depth < 5 ? { examples: examples.slice(0, 6).map(([key, row]) => ({ key: keyName(key), value: describe(row, depth + 1) })) } : {}) };
  }
  return describe(value, 0);
}
module.exports = { responseShape };
