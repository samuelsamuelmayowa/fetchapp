const { sequelize, User, Task, Transaction } = require('../models');
const { assert, url, quote, activePlan, money, creatorPaymentsPaused } = require('../lib/rules');
exports.createTask = async (req, res) => {
  const { platform, socialLink, title } = req.body;
  const count = Number(req.body.actionCount);
  assert(url(socialLink) && socialLink.length <= 2000, 'Enter a valid campaign URL.');
  const task = await sequelize.transaction(async transaction => {
    const user = await User.findByPk(req.user.id, { transaction, lock: transaction.LOCK.UPDATE });
    const plan = activePlan(user);
    const quotedBudget = quote(platform, count, plan);
    const testing = creatorPaymentsPaused();
    // Persist zero budget so test tasks never become payable when the switch is disabled.
    const budget = testing ? 0 : quotedBudget;
    if (!testing) assert(Number(user.balance) >= budget, 'Add funds to your wallet before publishing.');
    const created = await Task.create({ title: ((testing ? '[TEST] ' : '') + String(title || platform.replaceAll('_', ' '))).slice(0, 180), link: socialLink, platform, budget, count, remaining: count, postedBy: user.id, postedByName: user.fullName, plan, creatorPaymentMethod: testing ? null : 'card', earnerSharePercent: .5 }, { transaction });
    if (!testing) {
      await user.update({ balance: money(Number(user.balance) - budget) }, { transaction });
      await Transaction.create({ userId: user.id, amount: budget, type: 'debit', method: 'wallet', note: 'Campaign #' + created.id, reference: 'campaign:' + created.id }, { transaction });
    }
    return created;
  });
  res.status(201).json(task);
};
exports.getCreatorTasks = async (req, res) => res.json(await Task.findAll({ where: { postedBy: req.user.id }, order: [['createdAt', 'DESC']] }));
exports.getCreatorPayments = async (req, res) => res.json(await Transaction.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']], limit: 200 }));
