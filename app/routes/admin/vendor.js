var handlebarsPaginate = require('handlebars-paginate');
var mongoose = require('mongoose');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var Vendor = require('../../models/vendor');
var pathConfig = require('../../config/path.js');
var pictPath = pathConfig.productPictPath;
var pictUrl = pathConfig.productPictUrl;
var storage = require('../../lib/pictStorage.js')(pictPath);

var upload = multer({
    storage: storage
});

module.exports = function (app, passport, exphbs) {

    app.get('/admin/vendor/index', isLoggedIn, function (req, res) {

        req.breadcrumbs('Vendors');

        // Using paginate for simplier pagination
        Vendor.paginate({}, {
            page: req.query.page ? req.query.page : 1,
            sort: '_id',
            limit: 50
        }, function (err, result) {
            if (!err) {
                res.render('vendor/index', {
                    breadcrumbs: req.breadcrumbs(),
                    vendors: result.docs,
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

    app.get('/admin/vendor/create', isLoggedIn, function (req, res) {
        req.breadcrumbs([{
            name: 'Vendors',
            url: '/admin/vendor/index'
        }, {
            name: 'New vendor'
        }]);

        res.render('vendor/create', {
            breadcrumbs: req.breadcrumbs()
        });
    });

    app.post('/admin/vendor/create', isLoggedIn, upload.single('image'), function (req, res) {
        var vendor = new Vendor(req.body.vendor);
        if (req.file) {
            vendor.pictureFile = req.file;
        }

        vendor.save(function (err, vendor) {
            if (err) throw err;
            console.log('Vendor added, id = ' + vendor._id);
            res.redirect('/admin/vendor/update/' + vendor._id);
        });
    });

    app.get('/admin/vendor/update/:id', isLoggedIn, function (req, res) {
        Vendor.findOne({
                _id: mongoose.Types.ObjectId(req.params.id)
            })
            .exec(function (err, vendor) {
                req.breadcrumbs([{
                    name: 'Vendors',
                    url: '/admin/vendor/index'
                }, {
                    name: vendor.name
                }]);

                res.render('vendor/create', {
                    breadcrumbs: req.breadcrumbs(),
                    vendor: vendor
                });
            });
    });

    // Update vendor with ID
    app.post('/admin/vendor/update/:id', isLoggedIn, upload.single('image'), function (req, res) {
        var vendor = req.body.vendor;
        if (req.file) {
            vendor.pictureFile = req.file;
        }

        Vendor.findByIdAndUpdate(req.params.id, {
            $set: vendor
        }, {
            new: true // return new model
        }, function (err, vendor) {
            if (err) throw err;
            res.redirect('/admin/vendor/update/' + vendor._id);
        });
    });

    app.get('/admin/vendor/delete/:id', isLoggedIn, function (req, res) {
        Vendor.findOne({
            _id: mongoose.Types.ObjectId(req.params.id)
        }, function (err, vendor) {
            if (err) throw err;
            vendor.remove(function (err) {
                if (err) throw err;
                res.redirect('/admin/vendor/index');
            });
        });
    });

    app.post('/admin/vendor/search', isLoggedIn, function (req, res) {
        Vendor.find({
                name: {
                    $regex: req.body.searchString ? req.body.searchString : '',
                    $options: 'i'
                }
            })
            .limit(parseInt(req.body.limit))
            .exec(function (err, docs) {
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
};