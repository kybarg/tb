
 var fs    = require('fs'),
      nconf = require('nconf');

nconf.env().argv();

nconf.use('file', { file: './config/setting.json' })


nconf.set('product:limit', 50);
nconf.set('vendor:limit', 50);

 nconf.save();
  
module.exports = function(app, passport, exphbs) {
    //later
}    