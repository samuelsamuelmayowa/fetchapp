const router = require('express').Router();
const { Op } = require('sequelize');
const { sequelize, User, Task, Transaction, Submission, Withdrawal, Audit } = require('../models');
const { protect, allow } = require('../middlewares/authMiddleware');
const { assert, url, money, publicUser, pricing, plans, activePlan, quote, creatorPaymentsPaused } = require('../lib/rules');
const { applyInactivity } = require('../lib/inactivity');
router.use(protect);
router.get('/overview', async (req, res) => {
  await applyInactivity(req.user.id);
  await req.user.reload();
  if (!req.user.referralCode && req.user.role === 'earner') await req.user.update({ referralCode: require('crypto').randomBytes(8).toString('hex') });
  const [transactions, referrals, submissions, withdrawals] = await Promise.all([
    Transaction.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']], limit: 100 }),
    User.count({ where: { referredBy: req.user.id, suspended: false } }),
    Submission.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']], limit: 200 }),
    Withdrawal.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']], limit: 100 }),
  ]);
  res.json({ user: publicUser(req.user), transactions, referrals, submissions, withdrawals, pricing, plans, activePlan: activePlan(req.user), paymentsEnabled: Boolean(process.env.FLW_SECRET_KEY), creatorPaymentsPaused: creatorPaymentsPaused() });
});
router.patch('/profile', async (req, res) => {
  const changes = {};
  for (const key of ['facebookLink', 'youtubeLink', 'instagramLink', 'tiktokLink']) {
    if (req.body[key] === undefined) continue;
    const value = String(req.body[key]).trim();
    assert(!value || (value.length <= 255 && url(value)), 'Enter a valid social profile URL.'); changes[key] = value || null;
  }
  await req.user.update(changes); res.json({ user: publicUser(req.user) });
});
router.get('/tasks', allow('earner'), async (req, res) => {
  const submitted = await Submission.findAll({ where: { userId: req.user.id }, attributes: ['taskId'] });
  const tasks = await Task.findAll({ where: { status: 'active', remaining: { [Op.gt]: 0 }, id: { [Op.notIn]: submitted.length ? submitted.map(s => s.taskId) : [0] } }, order: [['createdAt', 'DESC']], limit: 100 });
  res.json(tasks.map(task => ({ ...task.toJSON(), reward: money(Number(task.budget) * Number(task.earnerSharePercent) / task.count) })));
});
router.post('/tasks/:id/submit', allow('earner'), async (req, res) => {
  assert(['facebookLink', 'youtubeLink', 'instagramLink', 'tiktokLink'].some(k => req.user[k]), 'Add a social profile in Settings before starting tasks.');
  const proof = String(req.body.proof || '').trim();
  assert(proof.length >= 10 && proof.length <= 2000, 'Provide 10 to 2,000 characters of evidence, including your username or evidence link.');
  await applyInactivity(req.user.id);
  const submission = await sequelize.transaction(async transaction => {
    const task = await Task.findByPk(req.params.id, { transaction, lock: transaction.LOCK.UPDATE });
    assert(task && task.status === 'active' && task.remaining > 0, 'This task is no longer available.');
    assert(!(await Submission.findOne({ where: { userId: req.user.id, taskId: task.id }, transaction })), 'You already submitted this task.', 409);
    const created = await Submission.create({ userId: req.user.id, taskId: task.id, proof, reward: money(Number(task.budget) * Number(task.earnerSharePercent) / task.count) }, { transaction });
    await task.decrement('remaining', { transaction }); return created;
  });
  res.status(201).json(submission);
});
router.post('/withdrawals', allow('earner'), async (req, res) => {
  const { network, address } = req.body; const amount = Number(req.body.amount);
  assert(Number.isFinite(amount) && amount >= 10 && amount <= 100000 && Math.abs(amount * 100 - Math.round(amount * 100)) < 1e-6, 'Minimum withdrawal is $10, in whole cents.');
  assert(network === 'USDT (TRC20)' && /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(String(address)), 'Enter a TRC20 USDT wallet address.');
  await applyInactivity(req.user.id);
  const withdrawal = await sequelize.transaction(async transaction => {
    const user = await User.findByPk(req.user.id, { transaction, lock: transaction.LOCK.UPDATE });
    assert(await User.count({ where: { referredBy: user.id, suspended: false }, transaction }) >= 2, 'Invite two people who register before withdrawing.');
    assert(Number(user.balance) >= amount, 'Insufficient available balance.');
    assert(!(await Withdrawal.findOne({ where: { userId: user.id, status: 'pending' }, transaction })), 'You already have a pending withdrawal. Wait for finance to review it.', 409);
    const created = await Withdrawal.create({ userId: user.id, amount, network, address }, { transaction });
    await user.update({ balance: money(Number(user.balance) - amount) }, { transaction });
    await Transaction.create({ userId: user.id, amount, method: 'crypto', type: 'debit', note: 'Withdrawal reserved #' + created.id, reference: 'withdrawal:' + created.id }, { transaction }); return created;
  }); res.status(201).json(withdrawal);
});
router.get('/admin', allow('moderator', 'finance', 'manager'), async (req, res) => {
  const finance = ['finance', 'manager'].includes(req.user.role); const moderation = ['moderator', 'manager'].includes(req.user.role);
  res.json({
    users: await User.findAll({ attributes: ['id', 'fullName', 'email', 'role', 'suspended', 'verified', 'createdAt'], limit: 500, order: [['createdAt', 'DESC']] }),
    submissions: moderation ? await Submission.findAll({ where: { status: 'pending' }, limit: 200, order: [['createdAt', 'ASC']] }) : [],
    transactions: finance ? await Transaction.findAll({ order: [['createdAt', 'DESC']], limit: 200 }) : [],
    withdrawals: finance ? await Withdrawal.findAll({ order: [['createdAt', 'DESC']], limit: 200 }) : [],
    tasks: req.user.role === 'manager' ? await Task.findAll({ where: { type: 'admin' }, limit: 200, order: [['createdAt', 'DESC']] }) : [],
    audits: req.user.role === 'manager' ? await Audit.findAll({ order: [['createdAt', 'DESC']], limit: 100 }) : [],
  });
});
router.patch('/admin/users/:id', allow('moderator', 'finance', 'manager'), async (req, res) => {
  await sequelize.transaction(async transaction => {
    const user = await User.findByPk(req.params.id, { transaction, lock: transaction.LOCK.UPDATE });
    assert(user && ['earner', 'creator'].includes(user.role), 'Only member accounts can be managed here.'); const changes = {};
    if (typeof req.body.suspended === 'boolean') changes.suspended = req.body.suspended;
    if (typeof req.body.verified === 'boolean') { assert(['moderator', 'manager'].includes(req.user.role), 'Only moderation staff can verify accounts.', 403); changes.verified = req.body.verified; }
    assert(Object.keys(changes).length, 'No valid changes.');
    await user.update({ ...changes, tokenVersion: user.tokenVersion + 1 }, { transaction });
    await Audit.create({ actorId: req.user.id, action: 'member.update', targetId: user.id, detail: JSON.stringify(changes) }, { transaction });
  }); res.json({ message: 'Account updated.' });
});
router.post('/admin/submissions/:id/review', allow('moderator', 'manager'), async (req, res) => {
  const approved = req.body.status === 'approved'; assert(['approved', 'rejected'].includes(req.body.status), 'Invalid review decision.');
  const candidate = await Submission.findByPk(req.params.id); assert(candidate, 'Submission not found.', 404); await applyInactivity(candidate.userId);
  await sequelize.transaction(async transaction => {
    const task = await Task.findByPk(candidate.taskId, { transaction, lock: transaction.LOCK.UPDATE });
    const user = await User.findByPk(candidate.userId, { transaction, lock: transaction.LOCK.UPDATE });
    const submission = await Submission.findByPk(candidate.id, { transaction, lock: transaction.LOCK.UPDATE });
    assert(submission.status === 'pending', 'This submission was already reviewed.', 409);
    if (approved && Number(submission.reward) > 0) {
      await user.update({ balance: money(Number(user.balance) + Number(submission.reward)) }, { transaction });
      await Transaction.create({ userId: user.id, amount: submission.reward, type: 'credit', method: 'wallet', note: 'Approved task #' + task.id, reference: 'submission:' + submission.id }, { transaction });
    } else if (!approved) await task.increment('remaining', { transaction });
    await submission.update({ status: req.body.status, reviewedBy: req.user.id }, { transaction });
    await Audit.create({ actorId: req.user.id, action: 'submission.' + req.body.status, targetId: submission.id }, { transaction });
  }); res.json({ message: 'Submission reviewed.' });
});
router.post('/admin/withdrawals/:id/review', allow('finance', 'manager'), async (req, res) => {
  assert(['paid', 'rejected'].includes(req.body.status), 'Invalid payout decision.');
  assert(req.body.status !== 'paid' || /^[a-fA-F0-9]{64}$/.test(String(req.body.txHash)), 'Enter the 64-character transaction hash from the completed TRON transfer.');
  const candidate = await Withdrawal.findByPk(req.params.id); assert(candidate, 'Withdrawal not found.', 404); await applyInactivity(candidate.userId);
  await sequelize.transaction(async transaction => {
    const user = await User.findByPk(candidate.userId, { transaction, lock: transaction.LOCK.UPDATE });
    const withdrawal = await Withdrawal.findByPk(candidate.id, { transaction, lock: transaction.LOCK.UPDATE });
    assert(withdrawal.status === 'pending', 'This withdrawal was already reviewed.', 409);
    if (req.body.status === 'rejected') {
      await user.update({ balance: money(Number(user.balance) + Number(withdrawal.amount)) }, { transaction });
      await Transaction.create({ userId: user.id, amount: withdrawal.amount, type: 'credit', method: 'wallet', note: 'Withdrawal refunded #' + withdrawal.id, reference: 'refund:' + withdrawal.id }, { transaction });
    }
    await withdrawal.update({ status: req.body.status, txHash: req.body.status === 'paid' ? req.body.txHash : null, reviewedBy: req.user.id }, { transaction });
    await Audit.create({ actorId: req.user.id, action: 'withdrawal.' + req.body.status, targetId: withdrawal.id }, { transaction });
  }); res.json({ message: 'Withdrawal updated.' });
});
router.patch('/admin/staff/:id', allow('manager'), async (req, res) => {
  assert(Number(req.params.id) !== req.user.id, 'Use Settings to change your own password.');
  const changes = {};
  if (typeof req.body.suspended === 'boolean') changes.suspended = req.body.suspended;
  if (req.body.password !== undefined) {
    assert(typeof req.body.password === 'string' && req.body.password.length >= 12 && Buffer.byteLength(req.body.password) <= 72, 'Staff passwords need at least 12 characters (maximum 72 bytes).');
    changes.password = await require('bcryptjs').hash(req.body.password, 12);
  }
  assert(Object.keys(changes).length, 'No valid changes.');
  await sequelize.transaction(async transaction => {
    const user = await User.findByPk(req.params.id, { transaction, lock: transaction.LOCK.UPDATE });
    assert(user && ['manager', 'moderator', 'finance'].includes(user.role), 'Staff account not found.', 404);
    await user.update({ ...changes, tokenVersion: user.tokenVersion + 1 }, { transaction });
    await Audit.create({ actorId: req.user.id, action: 'staff.access.update', targetId: user.id, detail: JSON.stringify({ suspended: changes.suspended, passwordReset: Boolean(changes.password) }) }, { transaction });
  }); res.json({ message: 'Staff access updated.' });
});
router.post('/admin/tasks', allow('manager'), async (req, res) => {
  const count = Number(req.body.actionCount); const budget = quote(req.body.platform, count); assert(url(req.body.socialLink), 'Enter a valid task URL.');
  const task = await sequelize.transaction(async transaction => {
    const created = await Task.create({ title: String(req.body.title || req.body.platform).slice(0, 180), link: req.body.socialLink, platform: req.body.platform, budget, count, remaining: count, postedBy: req.user.id, postedByName: req.user.fullName, type: 'admin', earnerSharePercent: .2 }, { transaction });
    await Audit.create({ actorId: req.user.id, action: 'admin.task.create', targetId: created.id, detail: 'Platform-funded; 20% reward allocation' }, { transaction }); return created;
  }); res.status(201).json(task);
});
module.exports = router;
