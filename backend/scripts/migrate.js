// Explicit, additive upgrade. Back up an existing database before running.
const { DataTypes } = require('sequelize');
const { sequelize, User, Task, Transaction } = require('../models');
const { randomBytes } = require('crypto');
async function migrate() {
  const qi = sequelize.getQueryInterface();
  const Migration = sequelize.define('AppMigration', { name: { type: DataTypes.STRING, primaryKey: true } });
  await Migration.sync();
  const name = '2026-09-promottv-workspaces';
  const completed = await Migration.findByPk(name);
  let addedColumns = 0;
  // sync without alter creates missing tables only; existing rows remain in place.
  await sequelize.sync();
  for (const model of [User, Task, Transaction]) {
    const existing = await qi.describeTable(model.getTableName());
    for (const [key, attribute] of Object.entries(model.rawAttributes)) {
      const field = attribute.field || key;
      if (!existing[field]) {
        await qi.addColumn(model.getTableName(), field, attribute);
        addedColumns++;
        console.log('Added missing column:', model.getTableName() + '.' + field);
      }
    }
  }
  if (!completed) {
    await qi.changeColumn('users', 'role', User.rawAttributes.role);
    await qi.changeColumn('users', 'balance', User.rawAttributes.balance);
    await qi.changeColumn('tasks', 'budget', Task.rawAttributes.budget);
    await qi.changeColumn('transactions', 'amount', Transaction.rawAttributes.amount);
  }
  const today = new Date().toISOString().slice(0, 10);
  for (const user of await User.findAll()) {
    const changes = {};
    if (!user.referralCode) changes.referralCode = randomBytes(8).toString('hex');
    if (!user.penaltyThrough) changes.penaltyThrough = today;
    if (Object.keys(changes).length) await user.update(changes);
  }
  if (!completed) await Migration.create({ name });
  console.log(completed
    ? 'Database schema checked. Missing columns repaired: ' + addedColumns + '.'
    : 'Database upgraded. Existing accounts begin inactivity tracking after today (UTC).');
}
migrate().catch(error => { console.error('Migration failed:', error.message); process.exitCode = 1; }).finally(() => sequelize.close());
