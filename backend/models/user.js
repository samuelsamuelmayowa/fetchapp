const { DataTypes } = require("sequelize");
const { sequelize } = require("../db.js");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    role: {
      type: DataTypes.ENUM("earner", "creator"),
      allowNull: false,
    },
    plan: {
  type: DataTypes.ENUM("Standard", "Premium", "Diamond"),
  defaultValue: "Standard",
},

balance: {
  type: DataTypes.DECIMAL(10, 2),
  defaultValue: 0.0,
},

suspended: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
},

verified: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
},

    facebookLink: DataTypes.STRING,
    youtubeLink: DataTypes.STRING,
    instagramLink: DataTypes.STRING,
    tiktokLink: DataTypes.STRING,
  },

  
  {
    tableName: "users",
    timestamps: true,
  }
);

module.exports = User;