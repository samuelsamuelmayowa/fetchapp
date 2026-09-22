const { User, sequelize } = require('../models');
const { applyInactivity } = require('../lib/inactivity');
(async () => {
  const users = await User.findAll({ where: { role: 'earner' }, attributes: ['id'] });
  for (const user of users) await applyInactivity(user.id);
  console.log('Daily inactivity checks complete:', users.length);
})().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => sequelize.close());
