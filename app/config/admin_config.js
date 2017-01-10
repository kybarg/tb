var adminConfig = require('nconf');

adminConfig.add('admin', { type: 'file', file: './config/admin_settings.json' });
adminConfig.add('public', { type: 'file', file: './config/public_settings.json' });
adminConfig.add('global', { type: 'file', file: './config/global_settings.json' });
adminConfig.use('memory');

adminConfig.defaults({
   "admin": {
    "product": {
      "meta": {
        "title": {
          "template": ""
        },
        "description": {
          "template": ""
        }
      },
      "perPage": "50"
    },
    "category": {
      "meta": {
        "title": {
          "template": ""
        },
        "description": {
          "template": ""
        }
      },
      "perPage": "50"
    }
  }
})

adminConfig.stores.memory.set('admin', adminConfig.get('admin'));
adminConfig.stores.memory.set('global', adminConfig.get('global'));
adminConfig.stores.memory.logicalSeparator = ".";

module.exports = adminConfig;