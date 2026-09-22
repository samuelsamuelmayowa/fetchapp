const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../models');
(async () => {
  const { STAFF_EMAIL: email, STAFF_PASSWORD: password, STAFF_ROLE: role, STAFF_NAME: fullName } = process.env;
  if (!email || !fullName || !password || password.length < 12 || Buffer.byteLength(password) > 72 || !['moderator', 'finance', 'manager'].includes(role)) throw new Error('Set STAFF_EMAIL, STAFF_NAME, STAFF_ROLE and STAFF_PASSWORD (12+ characters, max 72 bytes).');
  if (await User.findOne({ where: { email: email.toLowerCase().trim() } })) throw new Error('Account already exists; no changes made.');
  await User.create({ email: email.toLowerCase().trim(), password: await bcrypt.hash(password, 12), role, fullName, verified: true });
  console.log('Staff account created.');
})().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => sequelize.close());
