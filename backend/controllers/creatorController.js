const { sequelize, User, Task, Transaction } = require('../models');
const { assert, url, quote, activePlan, money } = require('../lib/rules');
exports.createTask = async (req, res) => {
  const { platform, socialLink, title } = req.body;
  const count = Number(req.body.actionCount);
  assert(url(socialLink) && socialLink.length <= 2000, 'Enter a valid campaign URL.');
  const task = await sequelize.transaction(async transaction => {
    const user = await User.findByPk(req.user.id, { transaction, lock: transaction.LOCK.UPDATE });
    const plan = activePlan(user);
    const budget = quote(platform, count, plan);
    assert(Number(user.balance) >= budget, 'Add funds to your wallet before publishing.');
    const created = await Task.create({ title: String(title || platform.replaceAll('_', ' ')).slice(0, 180), link: socialLink, platform, budget, count, remaining: count, postedBy: user.id, postedByName: user.fullName, plan, creatorPaymentMethod: 'card', earnerSharePercent: .5 }, { transaction });
    await user.update({ balance: money(Number(user.balance) - budget) }, { transaction });
    await Transaction.create({ userId: user.id, amount: budget, type: 'debit', method: 'wallet', note: 'Campaign #' + created.id, reference: 'campaign:' + created.id }, { transaction });
    return created;
  });
  res.status(201).json(task);
};
exports.getCreatorTasks = async (req, res) => res.json(await Task.findAll({ where: { postedBy: req.user.id }, order: [['createdAt', 'DESC']] }));
exports.getCreatorPayments = async (req, res) => res.json(await Transaction.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']], limit: 200 }));