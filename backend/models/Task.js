const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");

const Task = sequelize.define("Task", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  link: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  platform: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  budget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  count: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  remaining: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  postedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "posted_by",
  },

  postedByName: {
    type: DataTypes.STRING,
    field: "posted_by_name",
  },

  type: {
    type: DataTypes.ENUM("creator", "admin"),
    defaultValue: "creator",
  },

  plan: {
    type: DataTypes.ENUM("Standard", "Premium", "Diamond"),
    defaultValue: "Standard",
  },

  creatorPaymentMethod: {
    type: DataTypes.ENUM("card", "crypto", "bank"),
    field: "creator_payment_method",
  },

  earnerSharePercent: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.4,
    field: "earner_share_percent",
  },

  status: {
    type: DataTypes.ENUM("active", "paused", "completed", "cancelled"),
    defaultValue: "active",
  },
}, {
  tableName: "tasks",
  timestamps: true,
});

module.exports = Task;