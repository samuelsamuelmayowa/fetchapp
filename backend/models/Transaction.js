const { DataTypes } = require("sequelize");
const { sequelize } = require("../db.js");

const Transaction = sequelize.define("Transaction", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "user_id",
  },

  amount: {
    type: DataTypes.DECIMAL(18, 6),
    allowNull: false,
  },

  reference: { type: DataTypes.STRING, unique: true },
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
