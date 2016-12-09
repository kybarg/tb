var fs = require('fs');
var XmlStream = require('xml-stream');
var Category = require('./models/category');
var Product = require('./models/product');
var Shop = require('./models/shop');
var Vendor = require('./models/vendor');
var Import = require('./models/import');
var async = require('async');
var mongoose = require('mongoose');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.Promise = global.Promise;
mongoose.connect(configDB.url); // connect to our database


// Pass the ReadStream object to xml-stream
var stream = fs.createReadStream('wildberries-ru_products_20161106_002302.xml');
// var stream = fs.createReadStream('lamoda-ru_products_20161106_190717.xml');
var xml = new XmlStream(stream);





// var colorWhitelist = ['бежевый', 'белый', 'бирюзовый', 'бордовый', 'голубой', 'желтый', 'зеленый', 'золотистый', 'коричневый', 'красный', 'оливковый', 'оранжевый', 'разноцветный', 'розовый', 'рыжий', 'салатовый', 'светло-розовый', 'серебристый', 'серый', 'синий', 'сиреневый', 'темно-зеленый', 'темно-коричневый', 'темно-серый', 'темно-синий', 'фиолетовый', 'хаки', 'черный', 'ярко-розовый'];


// var rules = {
//     'Женщине': {
//         age: 'Взрослый',
//         sex: 'Женский',
//     },
//     'Мужчине': {
//         age: 'Взрослый',
//         sex: 'Женский',
//     }
// };


var colors = [];


// var categories = {};
// console.time('FooTimer');
// xml.on('endElement: category', function (item) {
//     categories[parseInt(item.$.id)] = {
//         id: parseInt(item.$.id),
//         parentId: item.$.parentId !== undefined ? parseInt(item.$.parentId) : 0,
//         name: item.$text
//     };
// });

// function getCategoryPath(id, tree) {
//     var element = tree[id];
//     if (element.parentId !== undefined && element.parentId != 0 && tree[element.parentId] !== undefined) {
//         return getCategoryPath(element.parentId, tree) + '/' + element.name;
//     } else {
//         return element.name;
//     }
// }

// xml.on('endElement: categories', function (item) {
//     for (var key in categories) {
//         categories[key].path = getCategoryPath(categories[key].id, categories);
//     }
//     console.log(categories);

// });

// xml.on('endElement: offers', function (item) {
//     console.timeEnd('FooTimer');

// });



var importStats = {
    new: 0,
    updated: 0,
    deleted: 0
};




// var offer1 = {
//     product: '581bb37aba44240cb067a021',
//     groupId: '5534534',
//     offers: [{
//         id: 34534534534534,
//         diff: {}
//     }]
// };

// var offer = new Import(offer1);
// offer.save(function (err, offer) {
//     console.log('offer added, id = ' + offer._id);
// });



xml.collect('param');
xml.collect('picture');
xml.on('endElement: offer', function (item) {


    // Check if we need to delete product or offer
    if (item.$.deleted !== undefined && Boolean(item.$.deleted) == true && item.$.id !== undefined) {

        // async.waterfall([
        //     function (callback) {
        //         Import.findOne({
        //                 'offers.id': item.$.id
        //             })
        //             .exec(function (err, importProduct) {
        //                 callback(err, importProduct);
        //             });
        //     },
        //     function (importProduct, callback) {
        //         if (importProduct) {
        //             var offers = importProduct.offers;
        //             if (offers.length == 1) {
        //                 importProduct.remove(function (err) {
        //                     var result = {};
        //                     if (!err) {
        //                         result['deleted'] = 1;
        //                     }
        //                     callback(err, result);
        //                 });
        //             } else if (offers.length > 1) {
        //                 async.waterfall([
        //                     function (callback) {
        //                         Product.findOne({
        //                                 _id: importProduct.product
        //                             })
        //                             .exec(function (err, product) {
        //                                 callback(err, product);
        //                             });
        //                     },
        //                     function (product, callback) {
        //                         if (product) {
        //                             // Get needed offer
        //                             for (var i = 0; i < offers.length; i++) {
        //                                 var offer = offers[i];
        //                                 if (offer.id == item.$.id) {
        //                                     break;
        //                                 }
        //                             }
        //                             // Remove offer attributes from product
        //                             for (var key in offer.diff) {
        //                                 if (offer.diff.hasOwnProperty(key)) {
        //                                     product[key] = product[key].filter(function (el) {
        //                                         return !offer.diff.includes(el);
        //                                     });
        //                                 }
        //                             }
        //                             callback(null, product);
        //                         } else {
        //                             callback('Product by reference not found!');
        //                         }
        //                     },
        //                     function (product, callback) {
        //                         async.parallel([
        //                             function (callback) {
        //                                 product.save(function (err) {
        //                                     callback(err);
        //                                 });
        //                             },
        //                             function (callback) {
        //                                 // Unset deleted offer and save
        //                                 importProduct.offers.splice(i, 0);
        //                                 importProduct.save(function (err) {
        //                                     var result = {};
        //                                     if (!err) {
        //                                         result['updated'] = 1;
        //                                     }
        //                                     callback(err, result);
        //                                 });
        //                             }
        //                         ], function (err, result) {
        //                             callback(err, result);
        //                         });
        //                     },
        //                 ], function (err, result) {
        //                     callback(err, result);
        //                 });
        //             }
        //         } else {
        //             callback('Import product not found!', {
        //                 skipped: 1
        //             });
        //         }
        //     }
        // ], function (err, result) {
        //     console.log(err);
        //     console.log(result);
        // });
    }



    if (item.$.deleted === undefined || Boolean(item.$.deleted) == false) {
        // console.log(item);

        var productData = {
            name: item.name,
            description: item.description,
            // category: ,
            price: parseInt(item.price),
            oldPrice: item.oldprice !== undefined ? parseInt(item.oldprice) : null,
            url: item.url,
            // vendor: ,
            age: null,
            color: null,
            material: null,
            size: null, // need converter
            sex: null,
            season: null,
            // shop: ,
        };

        for (var i = 0; i < item.param.length; i++) {
            var param = item.param[i];
            if (param.$.name == 'Цвет') {
                productData.color = param.$text.split(', ');
                // console.log(element.$text);
                // colors = colors.concat(param.$text.split(/[\s,]+/)).filter(function (v, i, self) {
                //     return self.indexOf(v) === i;
                // });
            } else if (param.$.name == 'Пол') {
                var sex = {
                    'Женкский': 1,
                    'Мужской': 2,
                    'Женкский': 3
                }
                productData.sex = sex[param.$text] !== undefined ? sex[param.$text] : null;
            } else if (param.$.name == 'Возраст') {
                 var age = {
                    'Взрослый': 1,
                    'Детский': 2,
                    'Для малышей': 3
                }
                productData.age = age[param.$text] !== undefined ? age[param.$text] : null;
            } else if (param.$.name == 'Сезон' || param.$.name == 'Сезонность') {
                productData.season = param.$text;
            } else if (param.$.name == 'Размер') {
                productData.color = param.$text.split('|');
            }

        }

        var product = new Product(productData);
        product.save(function(err, product) {
            console.log(product._id);
        })

        // xml.pause();
    }



    // console.log(item);
    // xml.pause();
});

// xml.on('endElement: param', function (item) {

//      if (item.$.name.toLowerCase() == 'цвет') {
//         // console.log(element.$text);
//         colors = colors.concat(item.$text.split(/[\s,]+/)).filter(function (v, i, self) {
//             return self.indexOf(v) === i;
//         });
//     }

//     // console.log(item);
//     // xml.pause();
// });

// xml.on('endElement: offers', function (item) {
//     console.log(colors);
// });

// var urls = {};

// xml.on('endElement: url', function (item) {

//     if (urls[item.$text] !== undefined) {
//         console.log(item.$text);
//     } 
//     // console.log(element.$text);
//     // urls = urls.concat(item.$text.split(/[\s,]+/)).filter(function (v, i, self) {
//     //     if(self.indexOf(v) === i) console.log(v);
//     //     return self.indexOf(v) === i;
//     // });

//     // console.log(item);
//     // xml.pause();
// });

// xml.on('endElement: offers', function (item) {
//     console.log(urls);
// });


mongoose.connection.close()