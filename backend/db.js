const dotenv = require("dotenv");
dotenv.config();

const { Sequelize } = require("sequelize");

// 🔒 HARD SAFETY CHECK — DO NOT REMOVE
if (
  process.env.NODE_ENV !== "production" &&
  process.env.DB_NAME &&
  /prod/i.test(process.env.DB_NAME)
) {
  throw new Error(
    "❌ BLOCKED: Non-production environment tried to connect to PROD database"
  );
}

console.log("🔎 ENV:", process.env.NODE_ENV);
console.log("🔎 DB:", process.env.DB_NAME);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    dialectModule: require("mysql2"),
    logging: false,
   
  pool: {
    max: 20,          // 🔼 increase
    min: 0,
    acquire: 60000,   // 🔼 wait longer
    idle: 10000,
  },
    dialectOptions: {
      ssl: false,
    },
  }
);

sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => {
    console.error("❌ Unable to connect:", err);
    process.exit(1); // fail fast
  });

module.exports = { sequelize };

