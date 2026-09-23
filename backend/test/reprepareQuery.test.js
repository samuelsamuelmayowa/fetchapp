const test = require('node:test');
const assert = require('node:assert/strict');
const wrap = require('../lib/reprepareQuery');
function fixture(code, failures) {
  let calls = 0;
  const evicted = [];
  const parameters = ['value'];
  const error = Object.assign(new Error('database failure'), { original: { code } });
  class Base {
    constructor() { this.connection = { unprepare: sql => evicted.push(sql) }; }
    async run(sql, values) {
      assert.equal(sql, 'SELECT ?'); assert.equal(values, parameters);
      if (++calls <= failures) throw error;
      return 'success';
    }
  }
  return { query: new (wrap(Base))(), parameters, error, evicted, calls: () => calls };
}
test('reprepares stale statement and preserves bound values', async () => {
  const f = fixture('ER_NEED_REPREPARE', 1);
  assert.equal(await f.query.run('SELECT ?', f.parameters), 'success');
  assert.equal(f.calls(), 2); assert.deepEqual(f.evicted, ['SELECT ?']);
});
test('persistent reprepare failures stop after three attempts', async () => {
  const f = fixture('ER_NEED_REPREPARE', Infinity);
  await assert.rejects(f.query.run('SELECT ?', f.parameters), error => error === f.error);
  assert.equal(f.calls(), 3); assert.equal(f.evicted.length, 2);
});
test('unrelated database errors are never retried', async () => {
  for (const code of ['ER_BAD_FIELD_ERROR', 'ER_DUP_ENTRY', 'ECONNRESET']) {
    const f = fixture(code, 1);
    await assert.rejects(f.query.run('SELECT ?', f.parameters), error => error === f.error);
    assert.equal(f.calls(), 1); assert.equal(f.evicted.length, 0);
  }
});
