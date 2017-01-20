var handlebarsPaginate = require('handlebars-paginate');
var mongoose = require('mongoose');
var multer = require('multer');
var Vendor = require('../../models/vendor');
var pathConfig = require('../../config/path.js');
var pictPath = pathConfig.vendorPictPath;
var pictUrl = pathConfig.vendorPictUrl;
var storage = require('../../lib/pictStorage.js')(pictPath);
var errorLogger = require('log4js').getLogger('error_log');
var dbLogger = require('log4js').getLogger('db_log');

var upload = multer({
    storage: storage
});

module.exports = function (app, passport, exphbs) {

    app.get('/admin/vendor/index', function (req, res) {

        req.breadcrumbs(__('Vendors'));

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
                    },
                    pictUrl: pictUrl
                });
            } else {
                errorLogger.error(err.message);
            }
        });
    });

    app.get('/admin/vendor/create', function (req, res) {
        req.breadcrumbs([{
            name: __('Vendors'),
            url: '/admin/vendor/index'
        }, {
            name: __('New vendor')
        }]);

        res.render('vendor/create', {
            breadcrumbs: req.breadcrumbs()
        });
    });

    app.post('/admin/vendor/create', upload.single('image'), function (req, res) {
        var vendor = new Vendor(req.body.vendor);
        if (req.file) {
            vendor.pictureFile = req.file;
        }

        vendor.save(function (err, vendor) {
            if (err) {
                var errors = {
                    [err.errors.name.path + 'HasError']: true
                }
                res.render('vendor/create', {
                    breadcrumbs: req.breadcrumbs(),
                    vendor: req.body.vendor,
                    errors: errors
                });
            } else {
                dbLogger.info('Vendor added, id = ' + vendor._id);
                res.redirect('/admin/vendor/update/' + vendor._id);
            }

        });
    });

    app.get('/admin/vendor/update/:id', function (req, res) {
        Vendor.findOne({
                _id: mongoose.Types.ObjectId(req.params.id)
            })
            .exec(function (err, vendor) {
                req.breadcrumbs([{
                    name: __('Vendors'),
                    url: '/admin/vendor/index'
                }, {
                    name: vendor.name
                }]);

                res.render('vendor/create', {
                    breadcrumbs: req.breadcrumbs(),
                    vendor: vendor,
                    pictUrl: pictUrl
                });
            });
    });

    // Update vendor with ID
    app.post('/admin/vendor/update/:id', upload.single('image'), function (req, res) {
        Vendor.findById(req.params.id, function (err, vendor) {
            if (err) {
                res.redirect('/admin/vendor/update/' + req.params.id);
                return errorLogger.error(err.message);
            }

            // Update vendor object with new values
            if (req.file) {
                vendor.pictureFile = req.file;
            }
            vendor = Object.assign(vendor, req.body.vendor);

            vendor.save(function (err) {
                if (err) {
                    var errors = {
                        [err.errors.name.path + 'HasError']: true
                    }
                    res.render('vendor/update/' + req.params.id, {
                        breadcrumbs: req.breadcrumbs(),
                        vendor: req.body.vendor,
                        errors: errors
                    });
                } else {
                    dbLogger.info('Vendor updated, id = ' + vendor._id);
                    res.redirect('/admin/vendor/update/' + req.params.id);
                }
            });
        });
    });

    app.get('/admin/vendor/delete/:id', function (req, res) {
        Vendor.findById(req.params.id).exec(function (err, vendor) {
            if (vendor) {
                vendor.remove();
                dbLogger.info('Vendor removed, id = ' + vendor._id);
            }
            res.redirect('/admin/vendor/index');
        });
    });

    app.post('/admin/vendor/search', function (req, res) {
        Vendor.find({
                name: {
                    $regex: req.body.searchString ? req.body.searchString : '',
                    $options: 'i'
                }
            })
            .limit(parseInt(req.body.limit))
            .exec(function (err, docs) {
                if (err) errorLogger.error(err.message);
                res.send(docs);
            });
    });
}