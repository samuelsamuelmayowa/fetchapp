const test = require('node:test');
const assert = require('node:assert/strict');
const details = require('../lib/errorDetails');
test('database diagnostics report missing columns without logging SQL or values', () => {
  const result = details({ name: 'SequelizeDatabaseError', sql: 'private SQL', original: {
    code: 'ER_BAD_FIELD_ERROR', errno: 1054, sqlState: '42S22',
    sqlMessage: "Unknown column 'User.tokenVersion' in 'field list'", parameters: ['private password'],
  } });
  assert.deepEqual(result, { name: 'SequelizeDatabaseError', code: 'ER_BAD_FIELD_ERROR', errno: 1054, sqlState: '42S22', column: 'User.tokenVersion' });
});
test('other database messages containing private values are omitted', () => {
  assert.deepEqual(details({ name: 'SequelizeDatabaseError', original: {
    code: 'ER_TRUNCATED_WRONG_VALUE', sqlMessage: 'private account value', sql: 'private SQL',
  } }), { name: 'SequelizeDatabaseError', code: 'ER_TRUNCATED_WRONG_VALUE' });
});
