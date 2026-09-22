const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { User } = require('../models');
const { assert, url, publicUser } = require('../lib/rules');
const cookie = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', path: '/' };
function session(res, user, status = 200) {
  const token = jwt.sign({ id: user.id, version: user.tokenVersion }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.cookie('token', token, { ...cookie, maxAge: 86400000 });
  res.status(status).json({ user: publicUser(user), token });
}
exports.signup = async (req, res) => {
  const { fullName, password, country, role, referralCode } = req.body;
  const email = String(req.body.email || '').trim().toLowerCase();
  assert(typeof fullName === 'string' && fullName.trim().length >= 2 && fullName.length <= 100, 'Enter your full name.');
  assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254, 'Enter a valid email.');
  assert(typeof password === 'string' && password.length >= 8 && Buffer.byteLength(password) <= 72, 'Use at least 8 characters (maximum 72 bytes).');
  assert(['earner', 'creator'].includes(role), 'Invalid account type.');
  const socials = {};
  for (const key of ['facebookLink', 'youtubeLink', 'instagramLink', 'tiktokLink']) {
    const value = String(req.body[key] || '').trim();
    assert(!value || (value.length <= 255 && url(value)), 'Enter valid social profile URLs.'); socials[key] = value || null;
  }
  assert(!(await User.findOne({ where: { email } })), 'An account already uses this email.', 409);
  const referrer = referralCode ? await User.findOne({ where: { referralCode: String(referralCode), role: 'earner', suspended: false } }) : null;
  assert(!referralCode || referrer, 'Referral code not found.');
  const user = await User.create({ fullName: fullName.trim(), email, password: await bcrypt.hash(password, 12), country: String(country || '').slice(0, 100), role, ...socials, referralCode: randomBytes(8).toString('hex'), referredBy: referrer?.id });
  session(res, user, 201);
};
exports.login = async (req, res) => {
  const user = await User.findOne({ where: { email: String(req.body.email || '').trim().toLowerCase() } });
  assert(typeof req.body.password === 'string' && user && await bcrypt.compare(req.body.password, user.password), 'Invalid email or password.', 401);
  assert(!user.suspended, 'Your account is suspended.', 403);
  session(res, user);
};
exports.me = (req, res) => res.json({ user: publicUser(req.user) });
exports.logout = async (req, res) => {
  await req.user.increment('tokenVersion');
  res.clearCookie('token', cookie).json({ message: 'Signed out.' });
};
exports.changePassword = async (req, res) => {
  const { currentPassword, password } = req.body;
  assert(typeof currentPassword === 'string' && await bcrypt.compare(currentPassword, req.user.password), 'Current password is incorrect.');
  assert(typeof password === 'string' && password.length >= 8 && Buffer.byteLength(password) <= 72, 'Use at least 8 characters (maximum 72 bytes).');
  await req.user.update({ password: await bcrypt.hash(password, 12), tokenVersion: req.user.tokenVersion + 1 });
  session(res, req.user);
};