const pricing = { facebook_follow: .01, facebook_view: .007, youtube_sub: .02, youtube_view: .007, tiktok_follow: .01, tiktok_view: .005, instagram_follow: .01, instagram_view: .005, app_install: .03 };
const plans = { Standard: { monthly: 0, discount: 0 }, Premium: { monthly: 20, discount: 10 }, Diamond: { monthly: 30, discount: 20 } };
const money = n => Math.round(Number(n) * 1e6) / 1e6;
function assert(condition, message, status = 400) { if (!condition) throw Object.assign(new Error(message), { status }); }
function url(value) { try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol); } catch { return false; } }
function quote(platform, count, plan = 'Standard') {
  assert(Object.hasOwn(pricing, platform), 'Choose a supported task.');
  assert(Number.isInteger(count) && count >= 1 && count <= 1000000, 'Action count must be 1 to 1,000,000.');
  assert(Object.hasOwn(plans, plan), 'Invalid membership.');
  return money(pricing[platform] * count * (1 - plans[plan].discount / 100));
}
const publicUser = user => { const safe = user.toJSON(); delete safe.password; delete safe.tokenVersion; return safe; };
const activePlan = user => user.planExpiresAt && new Date(user.planExpiresAt) > new Date() ? user.plan : 'Standard';
module.exports = { pricing, plans, money, assert, url, quote, publicUser, activePlan };