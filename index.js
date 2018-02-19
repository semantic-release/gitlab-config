module.exports = {
  verifyConditions: ['@semantic-release/npm', '@semantic-release/gitlab'],
  prepare: ['@semantic-release/npm'],
  publish: ['@semantic-release/npm', '@semantic-release/gitlab'],
  success: false,
  fail: false,
};
