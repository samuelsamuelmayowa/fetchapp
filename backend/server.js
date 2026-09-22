const app = require('./app');
const { sequelize } = require('./models');
async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters.');
  if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) throw new Error('FRONTEND_URL is required.');
  await sequelize.authenticate();
  return app.listen(process.env.PORT || 5000, '0.0.0.0', () => console.log('PROMOTtv API listening'));
}
if (require.main === module) start().catch(error => { console.error('Startup failed:', error.message); process.exit(1); });
module.exports = { app, start };
