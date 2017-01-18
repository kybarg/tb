'use strict';

module.exports = {
  tests: {
    client: ['modules/*/tests/client/{admin|public}/**/*.js'],
    server: ['modules/*/tests/server/**/*.js'],
    e2e: ['modules/*/tests/e2e/**/*.js']
  }
};
