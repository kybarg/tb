'use strict';

/* eslint comma-dangle:[0, "only-multiline"] */

module.exports = {
  // Production assets
  client: {
    admin: {
      lib: {
        css: false,
        js: false
      },
      css: 'public/dist/admin*.min.css',
      js: 'public/dist/admin*.min.js',
      views: ['modules/*/client/views/admin/**/*.html']
    }
  }
};
