const { Op } = require('sequelize');
const { sequelize, User, Submission, Transaction } = require('../models');
const { money } = require('./rules');
const day = date => new Date(date).toISOString().slice(0, 10);
const nextDay = date => day(new Date(date).getTime() + 86400000);
async function applyInactivity(userId, now = new Date()) {
  await sequelize.transaction(async transaction => {
    const user = await User.findByPk(userId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!user || user.role !== 'earner') return;
    let cursor = nextDay(user.penaltyThrough || day(user.createdAt));
    const today = day(now);
    let balance = Number(user.balance);
    while (cursor < today) {
      const end = nextDay(cursor);
      const activity = await Submission.count({ where: { userId, status: { [Op.ne]: 'rejected' }, createdAt: { [Op.gte]: new Date(cursor), [Op.lt]: new Date(end) } }, transaction });
      if (!activity && balance > 0) {
        const amount = money(balance * .3);
        if (amount > 0) await Transaction.create({ userId, amount, type: 'debit', method: 'wallet', note: '30% inactivity deduction for ' + cursor + ' (UTC)', reference: 'inactivity:' + userId + ':' + cursor }, { transaction });
        balance = money(balance - amount);
      }
      user.penaltyThrough = cursor;
      cursor = end;
    }
    await user.update({ balance, penaltyThrough: user.penaltyThrough }, { transaction });
  });
}
module.exports = { applyInactivity, day, nextDay };
