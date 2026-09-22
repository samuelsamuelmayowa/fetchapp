const test = require('node:test');
const assert = require('node:assert/strict');
const { quote, money, activePlan, url } = require('../lib/rules');
test('campaigns reject invalid counts and unrecognised pricing keys', () => {
  for (const count of [-1, 0, 1.5, NaN, Infinity, 1000001]) assert.throws(() => quote('youtube_view', count));
  for (const platform of ['__proto__', 'constructor', 'invalid']) assert.throws(() => quote(platform, 100));
  assert.equal(quote('youtube_view', 1000), 7);
  assert.equal(quote('youtube_view', 1000, 'Premium'), 6.3);
  assert.equal(quote('youtube_view', 1000, 'Diamond'), 5.6);
});
test('expired or unpurchased memberships never grant a discount', () => {
  assert.equal(activePlan({ plan: 'Diamond' }), 'Standard');
  assert.equal(activePlan({ plan: 'Premium', planExpiresAt: '2000-01-01' }), 'Standard');
  assert.equal(activePlan({ plan: 'Diamond', planExpiresAt: new Date(Date.now() + 86400000) }), 'Diamond');
});
test('micro rewards and inactivity deductions preserve six decimal places', () => {
  assert.equal(money(.007 * .5), .0035);
  assert.equal(money(10 - money(10 * .3)), 7);
  assert.equal(money(7 - money(7 * .3)), 4.9);
});
test('campaign links cannot execute javascript or data URLs', () => {
  assert.equal(url('javascript:alert(1)'), false); assert.equal(url('data:text/html,test'), false);
  assert.equal(url('https://youtube.com/watch?v=example'), true);
});
