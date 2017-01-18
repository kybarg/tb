var mongoose = require('mongoose');
var fs = require('fs');
require('./modules/categories/server/models/category.server.model.js');
mongoose.connect('mongodb://localhost/mean-dev');

mongoose.model('Category').aggregate([{
  $graphLookup: {
    from: "categories",
    startWith: "$parent",
    connectFromField: "parent",
    connectToField: "_id",
    as: "ancestors"
  }
}, {
  "$project": {
    "_id": 1,
    "name": 1,
    "parent": 1,
    "ancestors": {
      _id: 1,
      name: 1
    },
    "path": {
      "$concatArrays": [
        {
          "$map": {
            "input": "$ancestors",
            "as": "a",
            "in": "$$a.name"
          }
        },
        ["$name"]
      ]
    }
  }
},{
    $sort: {
        path: 1
    }
}]).exec(function (error, docs) {
  // use doc

  //   console.log(error)
  //   console.log(docs)

  fs.writeFile('helloworld.json', JSON.stringify(error || docs), function (err) {
    if (err) return console.log(err);
    console.log('Hello World > helloworld.json');
  });

});
