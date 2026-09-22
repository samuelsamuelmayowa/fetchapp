const router = require('express').Router();
const { randomUUID } = require('crypto');
const { sequelize, User, Payment, Transaction } = require('../models');
const { protect, allow } = require('../middlewares/authMiddleware');
const { assert, plans, money } = require('../lib/rules');
async function flutterwave(path, body) {
  assert(process.env.FLW_SECRET_KEY, 'Payments are not configured yet.', 503);
  const response = await fetch('https://api.flutterwave.com/v3/' + path, {
    method: body ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + process.env.FLW_SECRET_KEY, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000),
  });
  const result = await response.json(); assert(response.ok && result.status === 'success', 'The payment provider could not process this request.', 502); return result.data;
}
router.use(protect, allow('creator'));
router.post('/checkout', async (req, res) => {
  assert(process.env.FLW_SECRET_KEY, 'Payments are not configured yet.', 503);
  const { purpose, plan } = req.body;
  assert(['wallet', 'membership'].includes(purpose), 'Invalid payment purpose.');
  assert(purpose !== 'membership' || ['Premium', 'Diamond'].includes(plan), 'Choose a paid membership.');
  const amount = purpose === 'membership' ? plans[plan].monthly : Number(req.body.amount);
  assert(Number.isFinite(amount) && amount >= 1 && amount <= 10000 && Math.abs(amount * 100 - Math.round(amount * 100)) < 1e-6, 'Enter $1 to $10,000 in whole cents.');
  const payment = await Payment.create({ userId: req.user.id, reference: randomUUID(), amount, purpose, plan: purpose === 'membership' ? plan : null });
  const data = await flutterwave('payments', { tx_ref: payment.reference, amount, currency: 'USD', redirect_url: process.env.FRONTEND_URL + '/creator-dashboard?payment=return', customer: { email: req.user.email, name: req.user.fullName }, customizations: { title: 'PROMOTtv', description: purpose === 'membership' ? plan + ' membership (30 days)' : 'Campaign wallet funding' } });
  assert(typeof data.link === 'string' && new URL(data.link).hostname === 'checkout.flutterwave.com', 'Unexpected checkout URL.', 502);
  res.json({ url: data.link, reference: payment.reference });
});
router.post('/verify', async (req, res) => {
  assert(/^\d+$/.test(String(req.body.transactionId)), 'Invalid payment transaction.');
  const data = await flutterwave('transactions/' + req.body.transactionId + '/verify');
  const payment = await Payment.findOne({ where: { reference: String(data.tx_ref), userId: req.user.id } });
  assert(payment && data.status === 'successful' && data.currency === 'USD' && money(data.amount) === money(payment.amount), 'Payment has not been verified. No funds were credited.');
  await sequelize.transaction(async transaction => {
    const user = await User.findByPk(req.user.id, { transaction, lock: transaction.LOCK.UPDATE });
    const record = await Payment.findByPk(payment.id, { transaction, lock: transaction.LOCK.UPDATE });
    if (record.status === 'paid') return;
    if (record.purpose === 'wallet') await user.update({ balance: money(Number(user.balance) + Number(record.amount)) }, { transaction });
    else {
      const start = user.plan === record.plan && new Date(user.planExpiresAt) > new Date() ? new Date(user.planExpiresAt).getTime() : Date.now();
      await user.update({ plan: record.plan, planExpiresAt: new Date(start + 30 * 86400000) }, { transaction });
    }
    await Transaction.create({ userId: user.id, amount: record.amount, type: 'credit', method: 'card', note: record.purpose === 'wallet' ? 'Flutterwave wallet funding' : record.plan + ' membership purchase (not wallet credit)', reference: 'payment:' + record.id }, { transaction });
    await record.update({ status: 'paid', providerId: String(data.id) }, { transaction });
  }); res.json({ message: 'Payment verified.' });
});
module.exports = router;
