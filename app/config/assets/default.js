'use strict';

/* eslint comma-dangle:[0, "only-multiline"] */

module.exports = {
  client: {
    admin: {
      lib: {
        css: [
          // bower:css
          'public/lib/bootstrap/dist/css/bootstrap.css',
          'public/lib/bootstrap/dist/css/bootstrap-theme.css',
          'public/lib/angular-ui-notification/dist/angular-ui-notification.css',
          'public/lib/angular-material/angular-material.css',
          'public/lib/angular-material-data-table/dist/md-data-table.css',
          'public/lib/textAngular/dist/textAngular.css',
          'public/lib/md-color-picker/dist/mdColorPicker.min.css'
          // endbower
        ],
        js: [
          // bower:js
          'public/lib/angular/angular.js',
          'public/lib/angular-animate/angular-animate.js',
          'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
          'public/lib/ng-file-upload/ng-file-upload.js',
          'public/lib/angular-aria/angular-aria.js',
          'public/lib/angular-messages/angular-messages.js',
          'public/lib/angular-material/angular-material.js',
          'public/lib/angular-mocks/angular-mocks.js',
          'public/lib/angular-resource/angular-resource.js',
          'public/lib/angular-ui-notification/dist/angular-ui-notification.js',
          'public/lib/angular-ui-router/release/angular-ui-router.js',
          'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
          'public/lib/angular-material-data-table/dist/md-data-table.js',
          'public/lib/textAngular/dist/textAngular-rangy.min.js',
          'public/lib/textAngular/dist/textAngular-sanitize.min.js',
          'public/lib/textAngular/dist/textAngular.min.js',
          'public/lib/tinycolor/dist/tinycolor-min.js',
          'public/lib/md-color-picker/dist/mdColorPicker.min.js'
          // endbower
        ],
        tests: ['public/lib/angular-mocks/angular-mocks.js']
      },
      css: [
        'modules/*/client/admin/{css,less,scss}/*.css'
      ],
      less: [
        'modules/*/client/admin/less/*.less'
      ],
      sass: [
        'modules/*/client/admin/scss/*.scss'
      ],
      js: [
        'modules/core/client/admin/app/config.js',
        'modules/core/client/admin/app/init.js',
        'modules/*/client/admin/*.js',
        'modules/*/client/admin/**/*.js'
      ],
      img: [
        'modules/**/*/admin/img/**/*.jpg',
        'modules/**/*/admin/img/**/*.png',
        'modules/**/*/admin/img/**/*.gif',
        'modules/**/*/admin/img/**/*.svg'
      ],
      views: ['modules/*/client/admin/views/**/*.html'],
      templates: ['build/admin.templates.js']
    },
    public: {
      lib: {
        css: [
          // bower:css
          'public/lib/bootstrap/dist/css/bootstrap.css',
          'public/lib/bootstrap/dist/css/bootstrap-theme.css',
          'public/lib/angular-ui-notification/dist/angular-ui-notification.css',
          'public/lib/angular-material/angular-material.css',
          'public/lib/angular-material-data-table/dist/md-data-table.css',
          'public/lib/textAngular/dist/textAngular.css'
          // endbower
        ],
        js: [
          // bower:js
          'public/lib/angular/angular.js',
          'public/lib/angular-animate/angular-animate.js',
          'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
          'public/lib/ng-file-upload/ng-file-upload.js',
          'public/lib/angular-aria/angular-aria.js',
          'public/lib/angular-messages/angular-messages.js',
          'public/lib/angular-material/angular-material.js',
          'public/lib/angular-mocks/angular-mocks.js',
          'public/lib/angular-resource/angular-resource.js',
          'public/lib/angular-ui-notification/dist/angular-ui-notification.js',
          'public/lib/angular-ui-router/release/angular-ui-router.js',
          'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
          'public/lib/angular-material-data-table/dist/md-data-table.js',
          'public/lib/textAngular/dist/textAngular-rangy.min.js',
          'public/lib/textAngular/dist/textAngular-sanitize.min.js',
          'public/lib/textAngular/dist/textAngular.min.js'
          // endbower
        ],
        tests: ['public/lib/angular-mocks/angular-mocks.js']
      },
      css: [
        'modules/*/client/public/{css,less,scss}/*.css'
      ],
      less: [
        'modules/*/client/public/less/*.less'
      ],
      sass: [
        'modules/*/client/public/scss/*.scss'
      ],
      js: [
        'modules/core/client/public/app/config.js',
        'modules/core/client/public/app/init.js',
        'modules/*/client/public/*.js',
        'modules/*/client/public/**/*.js'
      ],
      img: [
        'modules/**/*/public/img/**/*.jpg',
        'modules/**/*/public/img/**/*.png',
        'modules/**/*/public/img/**/*.gif',
        'modules/**/*/public/img/**/*.svg'
      ],
      views: ['modules/*/client/public/views/**/*.html'],
      templates: ['build/public.templates.js']
    }
  },
  server: {
    gulpConfig: ['gulpfile.js'],
    allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
    models: 'modules/*/server/models/**/*.js',
    routes: ['modules/!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
    sockets: 'modules/*/server/sockets/**/*.js',
    config: ['modules/*/server/config/*.js'],
    policies: 'modules/*/server/policies/*.js',
    views: ['modules/*/server/views/*.html']
  }
};
