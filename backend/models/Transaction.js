const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");

const Transaction = sequelize.define("Transaction", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "user_id",
  },

  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  note: {
    type: DataTypes.STRING,
  },

  method: {
    type: DataTypes.ENUM("card", "crypto", "bank", "wallet"),
  },

  type: {
    type: DataTypes.ENUM("credit", "debit"),
    allowNull: false,
  },
}, {
  tableName: "transactions",
  timestamps: true,
});

module.exports = Transaction;