module.exports = {
  verifyConditions: ['@semantic-release/npm', '@semantic-release/gitlab'],
  getLastRelease: '@semantic-release/npm',
  publish: ['@semantic-release/npm', '@semantic-release/gitlab'],
};
