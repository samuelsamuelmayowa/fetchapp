// const User = require("./User");
// const Task = require("./Task");
// const Transaction = require("./Transaction");

User.hasMany(Task, {
  foreignKey: "posted_by",
  as: "tasks",
});

Task.belongsTo(User, {
  foreignKey: "posted_by",
  as: "creator",
});

User.hasMany(Transaction, {
  foreignKey: "user_id",
  as: "transactions",
});

Transaction.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

module.exports = {
  User,
  Task,
  Transaction,
};