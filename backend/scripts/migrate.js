// Explicit, additive upgrade. Back up an existing database before running.
const { DataTypes } = require('sequelize');
const { sequelize, User, Task, Transaction } = require('../models');
const { randomBytes } = require('crypto');
async function migrate() {
  const qi = sequelize.getQueryInterface();
  const Migration = sequelize.define('AppMigration', { name: { type: DataTypes.STRING, primaryKey: true } });
  await Migration.sync();
  const name = '2026-09-promottv-workspaces';
  if (await Migration.findByPk(name)) return console.log('Database already upgraded.');
  // sync without alter creates missing tables only; existing rows remain in place.
  await sequelize.sync();
  for (const model of [User, Task, Transaction]) {
    const existing = await qi.describeTable(model.getTableName());
    for (const [key, attribute] of Object.entries(model.rawAttributes)) {
      const field = attribute.field || key;
      if (!existing[field]) await qi.addColumn(model.getTableName(), field, attribute);
    }
  }
  await qi.changeColumn('users', 'role', User.rawAttributes.role);
  await qi.changeColumn('users', 'balance', User.rawAttributes.balance);
  await qi.changeColumn('tasks', 'budget', Task.rawAttributes.budget);
  await qi.changeColumn('transactions', 'amount', Transaction.rawAttributes.amount);
  const today = new Date().toISOString().slice(0, 10);
  for (const user of await User.findAll()) {
    await user.update({ referralCode: user.referralCode || randomBytes(8).toString('hex'), penaltyThrough: user.penaltyThrough || today });
  }
  await Migration.create({ name });
  console.log('Database upgraded. Existing accounts begin inactivity tracking after today (UTC).');
}
migrate().catch(error => { console.error('Migration failed:', error.message); process.exitCode = 1; }).finally(() => sequelize.close());
