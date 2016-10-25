var handlebarsPaginate = require('handlebars-paginate');
var mongoose = require('mongoose');
var pagination = require('mongoose-pagination');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var Category = require('../../models/category');
var pictPath = require('../../config/path.js').categoryPictPath;
var storage = require('../../lib/pictStorage.js')(pictPath);

var upload = multer({
    storage: storage
});

module.exports = function(app, passport, exphbs) {

    app.get('/admin/category/index', isLoggedIn, function(req, res) {

        req.breadcrumbs('Categories');

        Category.paginate({}, {
            page: req.query.page ? req.query.page : 1,
            sort: 'ancestors.0.name ancestors.1.name ancestors.2.name ancestors.3.name ancestors.4.name',
            // Maybe there less ugly way to solve sorting
            limit: 50,
            lean: 1
        }, function(err, result) {
            if (!err) {

                var lasts = [];
                for (var i = 0; i < result.docs.length; i++) {
                    lasts[result.docs[i].ancestors.length] = i;

                    if( i == (result.docs.length-1) || result.docs[i].ancestors.length == 1 ) {
                        lasts.forEach(function(k){
                           result.docs[k].class = 'last';
                        });
                        lasts = [];
                    }
                }

                res.render('category/index', {
                    breadcrumbs: req.breadcrumbs(),
                    categories: result.docs,
                    pagination: {
                        page: result.page,
                        pageCount: result.pages
                    },
                    showPagination: result.pages > 1 ? true : false,
                    helpers: {
                        paginate: handlebarsPaginate
                    }
                });
            } else {
                throw err;
            }
        });

    });

    app.post('/admin/category/delete', isLoggedIn, function(req, res) {
        var categoriesIds = req.body.categories;
        if (!categoriesIds) {
            res.redirect('/admin/category/index');
        }

        // Removes all categories with IDs
        Category.find({
            _id: {
                $in: categoriesIds
            }
        }, function(err, categories) {
            if (err) throw err;
            categories.forEach(function(category) {
                category.remove();
            });
            res.redirect('/admin/category/index');
        });
    });

    app.get('/admin/category/create', isLoggedIn, function(req, res) {
        req.breadcrumbs([{
            name: 'Categories',
            url: '/admin/category/index'
        }, {
            name: 'New category'
        }]);

        res.render('category/create', {
            breadcrumbs: req.breadcrumbs()
        });
    });

    app.post('/admin/category/create', isLoggedIn, upload.single('image'), function(req, res) {
        req.breadcrumbs([{
            name: 'Categories',
            url: '/admin/category/index'
        }, {
            name: 'New category'
        }]);

        var category = new Category(req.body.category);
        if (req.file) { 
            category.pictureFile = req.file; 
        }

        category.save(function(err, category) {
            if (err) {
                // var c = new Category(req.body.category)
                
                // res.send(JSON.stringify(err, null, " "));

                var errors = {
                    [err.errors.name.path + 'HasError']: true
                }

                res.render('category/create', {
                    breadcrumbs: req.breadcrumbs(),
                    category: req.body.category,
                    errors: errors
                });
               
            } else
                res.redirect('/admin/category/update/' + category._id);
        });
    });

    app.get('/admin/category/update/:id', isLoggedIn, function(req, res) {
        Category.findById(req.params.id)
            // .populate('ancestors')
            .populate('parent')
            .exec(function(err, category) {
                req.breadcrumbs([{
                    name: 'Categories',
                    url: '/admin/category/index'
                }, {
                    name: category.name
                }]);

                res.render('category/create', {
                    breadcrumbs: req.breadcrumbs(),
                    category: category
                });
            });
    });

    // Update category with ID
    app.post('/admin/category/update/:id', isLoggedIn, upload.single('image'), function(req, res) {
        if (req.file) { 
            category.pictureFile = req.file; 
        }
        
        Category.findById(req.params.id, function(err, category) {
            if (err) throw err;

            // Update category object with new values
            category = Object.assign(category, req.body.category);

            category.save(function(err) {
                if (err) throw err;
                res.redirect('/admin/category/update/' + req.params.id);
            });
        });

    });

    app.get('/admin/category/delete/:id', isLoggedIn, function(req, res) {

        Category.findOne({
            _id: mongoose.Types.ObjectId(req.params.id)
        }, function(err, category) {
            if (err) throw err;
            category.remove(function(err) {
                if (err) throw err;

                res.redirect('/admin/category/index');
            });
        });
    });

    app.post('/admin/category/search', function(req, res) {
        Category.find({
                name: {
                    $regex: req.body.searchString ? req.body.searchString : '',
                    $options: 'i'
                }
            })
            .populate('ancestors')
            .populate('parent')
            .limit(parseInt(req.body.limit))
            .exec(function(err, docs) {
                if (err) throw err;
                res.send(docs);
            });
    });

}

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}