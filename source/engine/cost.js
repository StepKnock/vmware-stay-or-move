// Exact rational arithmetic keeps decimal prices exact until the final dollar rounding.
const decimal = value => {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const s = String(value).replace(/[, ]/g, '');
  const m = s.match(/^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:e([+-]?\d+))?$/i);
  if (!m || Math.abs(Number(m[5] || 0)) > 100) return null;
  const fraction = m[3] ?? m[4] ?? '';
  const exponent = Number(m[5] || 0) - fraction.length;
  let n = BigInt((m[2] || '0') + fraction) * (m[1] === '-' ? -1n : 1n);
  return exponent >= 0 ? [n * 10n ** BigInt(exponent), 1n] : [n, 10n ** BigInt(-exponent)];
};
const add = (a, b) => [a[0] * b[1] + b[0] * a[1], a[1] * b[1]];
const mul = (a, b) => [a[0] * b[0], a[1] * b[1]];
const compare = (a, b) => a[0] * b[1] < b[0] * a[1] ? -1 : a[0] * b[1] > b[0] * a[1] ? 1 : 0;
const zero = () => [0n, 1n];
const asNumber = a => Number(a[0]) / Number(a[1]);
const whole = a => {
  const sign = a[0] < 0n ? -1n : 1n;
  return Number(sign * ((2n * sign * a[0] + a[1]) / (2n * a[1])));
};

export function hostsFrom(tabs) {
  const rows = tabs.vHost || [];
  const header = (rows[0] || []).map(value => String(value).trim().toLowerCase());
  const indexes = ['# cpu', 'cores per cpu', '# cores'].map(name => header.indexOf(name));
  const cell = (row, i) => i < 0 ? '' : String(row[i] ?? '').replace(/[, ]/g, '');
  const value = s => asNumber(decimal(s) || zero());
  return rows.slice(1).filter(row => row.some(v => String(v).trim())).map(row => {
    const [s, c, total] = indexes.map(i => cell(row, i));
    if (s && c) return {sockets: value(s), coresPerCpu: value(c)};
    if (s && total) { const sockets = value(s); return {sockets, coresPerCpu: sockets ? value(total) / sockets : 0}; }
    if (total) return {sockets: 1, coresPerCpu: value(total)};
    return {sockets: 0, coresPerCpu: 0};
  });
}

export function cost({hosts, minPerCpu = 16, minPerOrder = null, hourly, options = {}}) {
  const minimum = decimal(minPerCpu) || zero();
  let cores = zero();
  for (const host of hosts) {
    const sockets = decimal(host.sockets) || zero(), actual = decimal(host.coresPerCpu) || zero();
    cores = add(cores, mul(sockets, compare(actual, minimum) < 0 ? minimum : actual));
  }
  const order = decimal(minPerOrder);
  if (order && compare(cores, order) < 0) cores = order;
  // Match the reference's integer licensed-core result.
  const licensed = Number(cores[0] / cores[1]);
  const rate = decimal(hourly), totals = {};
  for (const name of ['stay', 'hypervisor', 'cloud']) {
    const opt = options[name] || {};
    const perCore = name === 'stay' ? decimal(opt.price_per_core) : null;
    const yearly = perCore ? mul(perCore, decimal(licensed)) : decimal(opt.yearly_total);
    const hours = decimal(opt.yearly_hours), oneTime = decimal(opt.one_time), onceHours = decimal(opt.one_time_hours);
    if (!yearly || !hours || !oneTime || !onceHours || (!rate && (hours[0] !== 0n || onceHours[0] !== 0n))) { totals[name] = null; continue; }
    const effectiveRate = rate || zero();
    const annual = add(yearly, mul(hours, effectiveRate));
    totals[name] = whole(add(add(mul(decimal(3), annual), oneTime), mul(onceHours, effectiveRate)));
  }
  const names = Object.keys(totals);
  const cheapest = names.some(name => totals[name] === null) ? null : names.sort((a, b) => totals[a] - totals[b] || a.localeCompare(b))[0];
  return {licensed_cores: licensed, three_year: totals, cheapest};
}
