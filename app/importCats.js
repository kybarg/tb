var mongoose = require('mongoose');
var configDB = require('./config/database.js');
var categoriesArray = require('./categories.json')
var Category = require('./models/category');

mongoose.Promise = global.Promise;
mongoose.connect(configDB.url); // connect to our database

// console.log(categoriesArray);


function saveCategory(parentId, dbParentId) {

    for (var i = 0; i < categoriesArray.length; i++) {
        if (categoriesArray[i].parent_id == parentId) {

            var categoriesArrayItem = categoriesArray[i];

            var categoryNew = new Category({
                name: categoriesArrayItem.name
            });

            if (dbParentId) categoryNew.parent = dbParentId;
            saveT(categoryNew, categoriesArrayItem.id);
        }

    }
}

function saveT(categoryNew, id) {
    categoryNew.save(function (err, categorySaved) {
        if (err) console.log(err);
        saveCategory(id, categorySaved._id);
    });
}

saveCategory(0, null);





// mongoose.connection.close();