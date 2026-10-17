const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('lib/photo-calendar.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const calendar = {};
new Function('exports', source)(calendar);
const { validDate, indexPhotoDates, calendarDate } = calendar;
assert(validDate('2024-02-29'));
for (const invalid of ['2026-02-29', '2026-02-30', '2026-13-01', 'bad', undefined]) assert(!validDate(invalid));
assert.equal(calendarDate(2026, 0, 0), '2025-12-31');
assert.equal(calendarDate(2024, 1, 29), '2024-02-29');
const index = indexPhotoDates([
  { id: 'a', date: '2025-01-01' },
  { id: 'b', date: '2026-05-02' },
  { id: 'c', date: '2026-05-02' },
  { id: 'd' },
  { id: 'e', date: 'invalid' },
]);
assert.equal(index.dated.get('2026-05-02').length, 2);
assert.equal(index.undated.length, 2);
assert.deepEqual(index.dates, ['2025-01-01', '2026-05-02']);
assert.deepEqual(indexPhotoDates([]).dates, []);
console.log('Calendar data checks passed: strict dates, leap years, rollover, multiple years, counts, unknown and empty metadata.');
