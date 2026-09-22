const test = require('node:test');
const assert = require('node:assert/strict');
test('MySQL-backed member, campaign, moderation, wallet and security workflows', { skip: process.env.RUN_MYSQL_TESTS !== '1', timeout: 120000 }, async () => {
  require('dotenv').config({ quiet: true });
  assert.ok(['localhost', '127.0.0.1', '::1'].includes(process.env.DB_HOST), 'Integration tests require local MySQL.');
  const mysql = require('mysql2/promise');
  const connection = await mysql.createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PASS });
  const database = 'promottv_test_' + Date.now();
  assert.match(database, /^promottv_test_\d+$/);
  await connection.query('CREATE DATABASE `' + database + '`');
  process.env.DB_NAME = database;
  process.env.JWT_SECRET = 'integration-test-secret-never-use-in-production';
  process.env.NODE_ENV = 'test'; process.env.FLW_SECRET_KEY = 'test-only';
  process.env.FRONTEND_URL = 'http://localhost:5173'; process.env.ALLOWED_ORIGINS = 'http://localhost:5173';
  const { sequelize, User, Task, Transaction, Submission, Withdrawal, Payment } = require('../models');
  const bcrypt = require('bcryptjs'); const jwt = require('jsonwebtoken');
  const { applyInactivity } = require('../lib/inactivity');
  const app = require('../app'); let server;
  const realFetch = global.fetch;
  try {
    const { DataTypes } = require('sequelize');
    const qi = sequelize.getQueryInterface();
    // Reconstruct the old schema to exercise the upgrade, not just fresh installs.
    const oldUser = { ...User.rawAttributes, role: { type: DataTypes.ENUM('earner', 'creator'), allowNull: false }, balance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 } };
    for (const key of ['referralCode', 'referredBy', 'penaltyThrough', 'tokenVersion', 'planExpiresAt']) delete oldUser[key];
    const oldTransaction = { ...Transaction.rawAttributes, amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false } }; delete oldTransaction.reference;
    await qi.createTable('users', oldUser);
    await qi.createTable('tasks', { ...Task.rawAttributes, budget: { type: DataTypes.DECIMAL(10, 2), allowNull: false } });
    await qi.createTable('transactions', oldTransaction);
    await qi.bulkInsert('users', [{ fullName: 'Existing Member', email: 'legacy@example.test', password: await bcrypt.hash('Testing123!', 4), role: 'earner', balance: 12.5, createdAt: new Date('2025-01-01'), updatedAt: new Date('2025-01-01') }]);
    const { spawnSync } = require('node:child_process');
    for (let n = 0; n < 2; n++) {
      const migration = spawnSync(process.execPath, ['scripts/migrate.js'], { env: process.env, encoding: 'utf8', timeout: 30000 });
      assert.equal(migration.status, 0, migration.stderr || migration.error?.message);
    }
    const legacy = await User.findOne({ where: { email: 'legacy@example.test' } });
    assert.equal(Number(legacy.balance), 12.5); assert.ok(legacy.referralCode);
    assert.equal(legacy.penaltyThrough, new Date().toISOString().slice(0, 10));
    server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
    const base = 'http://127.0.0.1:' + server.address().port + '/api';
    async function request(path, body, token, method = 'POST') {
      const response = await realFetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
      return { status: response.status, data: await response.json() };
    }
    async function signup(email, role = 'earner', extra = {}) {
      const result = await request('/auth/signup', { fullName: 'Test Member', email, password: 'Testing123!', role, country: 'Nigeria', ...extra });
      assert.equal(result.status, 201, JSON.stringify(result.data)); return result.data;
    }
    const creator = await signup('creator@example.test', 'creator');
    const earner = await signup('earner@example.test');
    assert.equal((await request('/workspace/overview', null, null, 'GET')).status, 401);
    assert.equal((await request('/auth/signup', { fullName: 'Wrong Role', email: 'bad@example.test', password: 'Testing123!', role: 'manager' })).status, 400);
    assert.equal((await request('/workspace/admin', null, earner.token, 'GET')).status, 403);
    assert.equal((await request('/creator/tasks', {}, earner.token)).status, 403);
    const staff = {};
    for (const role of ['manager', 'moderator', 'finance']) {
      const user = await User.create({ fullName: role, email: role + '@example.test', password: await bcrypt.hash('Testing123!', 4), role });
      staff[role] = jwt.sign({ id: user.id, version: 0 }, process.env.JWT_SECRET);
    }
    await User.update({ balance: 10 }, { where: { id: creator.user.id } });
    const body = { title: 'A test video', platform: 'youtube_view', actionCount: 1000, socialLink: 'https://youtube.com/watch?v=test', plan: 'Diamond' };
    const competing = await Promise.all([request('/creator/tasks', body, creator.token), request('/creator/tasks', body, creator.token)]);
    assert.deepEqual(competing.map(x => x.status).sort(), [201, 400]);
    const task = competing.find(x => x.status === 201).data;
    assert.equal(Number(task.budget), 7, 'Client cannot grant itself membership discounts.');
    assert.equal(Number((await User.findByPk(creator.user.id)).balance), 3);
    assert.equal((await request('/workspace/tasks/' + task.id + '/submit', { proof: 'My username completed this video.' }, earner.token)).status, 400);
    assert.equal((await request('/workspace/profile', { youtubeLink: 'https://youtube.com/@test' }, earner.token, 'PATCH')).status, 200);
    const proofs = await Promise.all([1, 2].map(() => request('/workspace/tasks/' + task.id + '/submit', { proof: 'My username completed this video.' }, earner.token)));
    assert.deepEqual(proofs.map(x => x.status).sort(), [201, 409]);
    const submission = proofs.find(x => x.status === 201).data;
    assert.equal(Number((await User.findByPk(earner.user.id)).balance), 0, 'Unreviewed proof must not earn money.');
    assert.equal((await request('/workspace/admin/submissions/' + submission.id + '/review', { status: 'approved' }, staff.finance)).status, 403);
    const reviews = await Promise.all([1, 2].map(() => request('/workspace/admin/submissions/' + submission.id + '/review', { status: 'approved' }, staff.moderator)));
    assert.deepEqual(reviews.map(x => x.status).sort(), [200, 409]);
    assert.equal(Number((await User.findByPk(earner.user.id)).balance), .0035);
    await User.update({ balance: 30 }, { where: { id: earner.user.id } });
    const withdraw = { amount: 10, network: 'USDT (TRC20)', address: 'T' + 'A'.repeat(33) };
    assert.equal((await request('/workspace/withdrawals', withdraw, earner.token)).status, 400);
    await signup('friend1@example.test', 'earner', { referralCode: earner.user.referralCode });
    await signup('friend2@example.test', 'earner', { referralCode: earner.user.referralCode });
    const payouts = await Promise.all([1, 2].map(() => request('/workspace/withdrawals', withdraw, earner.token)));
    assert.deepEqual(payouts.map(x => x.status).sort(), [201, 409]);
    assert.equal(Number((await User.findByPk(earner.user.id)).balance), 20);
    const payout = payouts.find(x => x.status === 201).data;
    assert.equal((await request('/workspace/admin/withdrawals/' + payout.id + '/review', { status: 'rejected' }, staff.moderator)).status, 403);
    const refunds = await Promise.all([1, 2].map(() => request('/workspace/admin/withdrawals/' + payout.id + '/review', { status: 'rejected' }, staff.finance)));
    assert.deepEqual(refunds.map(x => x.status).sort(), [200, 409]);
    assert.equal(Number((await User.findByPk(earner.user.id)).balance), 30);
    const inactive = await signup('inactive@example.test');
    await User.update({ balance: 10, penaltyThrough: '2026-01-01' }, { where: { id: inactive.user.id } });
    await applyInactivity(inactive.user.id, new Date('2026-01-04T02:00:00Z'));
    await applyInactivity(inactive.user.id, new Date('2026-01-04T02:00:00Z'));
    assert.equal(Number((await User.findByPk(inactive.user.id)).balance), 4.9);
    assert.equal(await Transaction.count({ where: { userId: inactive.user.id } }), 2);
    const payment = await Payment.create({ userId: creator.user.id, reference: 'test-payment', amount: 5, purpose: 'wallet' });
    let verifiedAmount = 4;
    global.fetch = async endpoint => { assert.match(endpoint, /^https:\/\/api.flutterwave.com\/v3\/transactions\/123\/verify$/); return { ok: true, json: async () => ({ status: 'success', data: { id: 123, tx_ref: payment.reference, status: 'successful', currency: 'USD', amount: verifiedAmount } }) }; };
    assert.equal((await request('/payments/verify', { transactionId: 123 }, creator.token)).status, 400);
    verifiedAmount = 5;
    for (let n = 0; n < 2; n++) assert.equal((await request('/payments/verify', { transactionId: 123 }, creator.token)).status, 200);
    assert.equal(Number((await User.findByPk(creator.user.id)).balance), 8, 'Payment must credit exactly once.');
    global.fetch = realFetch;
    assert.equal((await request('/workspace/admin/users/' + creator.user.id, { suspended: true }, staff.finance, 'PATCH')).status, 200);
    assert.equal((await request('/creator/tasks', null, creator.token, 'GET')).status, 401);
    assert.equal((await request('/auth/login', { email: creator.user.email, password: 'Testing123!' })).status, 403);
    const changed = await request('/auth/password', { currentPassword: 'Testing123!', password: 'Replacement123!' }, earner.token);
    assert.equal(changed.status, 200);
    assert.equal((await request('/auth/me', null, earner.token, 'GET')).status, 401);
    assert.equal((await request('/auth/me', null, changed.data.token, 'GET')).status, 200);
    assert.equal((await request('/auth/logout', {}, changed.data.token)).status, 200);
    assert.equal((await request('/auth/me', null, changed.data.token, 'GET')).status, 401);
    assert.equal(await Task.count(), 1); assert.equal(await Submission.count(), 1); assert.equal(await Withdrawal.count(), 1);
  } finally {
    global.fetch = realFetch;
    if (server) await new Promise(resolve => server.close(resolve));
    await sequelize.close();
    // Only the generated, local scratch database can be removed.
    assert.match(database, /^promottv_test_\d+$/); await connection.query('DROP DATABASE `' + database + '`'); await connection.end();
  }
});
