const { DataTypes: D } = require('sequelize');
const { sequelize } = require('../db');
const User = require('./user');
const Task = require('./Task');
const Transaction = require('./Transaction');
const Submission = sequelize.define('Submission', {
  userId: { type: D.INTEGER, allowNull: false }, taskId: { type: D.INTEGER, allowNull: false },
  proof: { type: D.TEXT, allowNull: false }, status: { type: D.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  reward: { type: D.DECIMAL(18, 6), allowNull: false }, reviewedBy: D.INTEGER,
}, { indexes: [{ unique: true, fields: ['userId', 'taskId'] }] });
const Withdrawal = sequelize.define('Withdrawal', {
  userId: { type: D.INTEGER, allowNull: false }, amount: { type: D.DECIMAL(18, 6), allowNull: false },
  network: { type: D.STRING, allowNull: false }, address: { type: D.STRING, allowNull: false },
  status: { type: D.ENUM('pending', 'paid', 'rejected'), defaultValue: 'pending' },
  txHash: { type: D.STRING, unique: true }, reviewedBy: D.INTEGER,
});
const Payment = sequelize.define('Payment', {
  userId: { type: D.INTEGER, allowNull: false }, reference: { type: D.STRING, unique: true, allowNull: false },
  amount: { type: D.DECIMAL(18, 6), allowNull: false }, purpose: D.STRING, plan: D.STRING,
  status: { type: D.ENUM('pending', 'paid'), defaultValue: 'pending' }, providerId: { type: D.STRING, unique: true },
});
const Audit = sequelize.define('Audit', { actorId: D.INTEGER, action: { type: D.STRING, allowNull: false }, targetId: D.INTEGER, detail: D.TEXT });
User.hasMany(Task, { foreignKey: 'postedBy', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'postedBy', as: 'creator' });
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
module.exports = { sequelize, User, Task, Transaction, Submission, Withdrawal, Payment, Audit };