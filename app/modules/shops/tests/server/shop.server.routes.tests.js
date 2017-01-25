'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Shop = mongoose.model('Shop'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  shop;

/**
 * Shop routes tests
 */
describe('Shop CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Shop
    user.save(function () {
      shop = {
        name: 'Shop name'
      };

      done();
    });
  });

  it('should be able to save a Shop if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Shop
        agent.post('/api/shops')
          .send(shop)
          .expect(200)
          .end(function (shopSaveErr, shopSaveRes) {
            // Handle Shop save error
            if (shopSaveErr) {
              return done(shopSaveErr);
            }

            // Get a list of Shops
            agent.get('/api/shops')
              .end(function (shopsGetErr, shopsGetRes) {
                // Handle Shops save error
                if (shopsGetErr) {
                  return done(shopsGetErr);
                }

                // Get Shops list
                var shops = shopsGetRes.body;

                // Set assertions
                (shops[0].user._id).should.equal(userId);
                (shops[0].name).should.match('Shop name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Shop if not logged in', function (done) {
    agent.post('/api/shops')
      .send(shop)
      .expect(403)
      .end(function (shopSaveErr, shopSaveRes) {
        // Call the assertion callback
        done(shopSaveErr);
      });
  });

  it('should not be able to save an Shop if no name is provided', function (done) {
    // Invalidate name field
    shop.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Shop
        agent.post('/api/shops')
          .send(shop)
          .expect(400)
          .end(function (shopSaveErr, shopSaveRes) {
            // Set message assertion
            (shopSaveRes.body.message).should.match('Please fill Shop name');

            // Handle Shop save error
            done(shopSaveErr);
          });
      });
  });

  it('should be able to update an Shop if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Shop
        agent.post('/api/shops')
          .send(shop)
          .expect(200)
          .end(function (shopSaveErr, shopSaveRes) {
            // Handle Shop save error
            if (shopSaveErr) {
              return done(shopSaveErr);
            }

            // Update Shop name
            shop.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Shop
            agent.put('/api/shops/' + shopSaveRes.body._id)
              .send(shop)
              .expect(200)
              .end(function (shopUpdateErr, shopUpdateRes) {
                // Handle Shop update error
                if (shopUpdateErr) {
                  return done(shopUpdateErr);
                }

                // Set assertions
                (shopUpdateRes.body._id).should.equal(shopSaveRes.body._id);
                (shopUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Shops if not signed in', function (done) {
    // Create new Shop model instance
    var shopObj = new Shop(shop);

    // Save the shop
    shopObj.save(function () {
      // Request Shops
      request(app).get('/api/shops')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Shop if not signed in', function (done) {
    // Create new Shop model instance
    var shopObj = new Shop(shop);

    // Save the Shop
    shopObj.save(function () {
      request(app).get('/api/shops/' + shopObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', shop.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Shop with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/shops/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Shop is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Shop which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Shop
    request(app).get('/api/shops/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Shop with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Shop if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Shop
        agent.post('/api/shops')
          .send(shop)
          .expect(200)
          .end(function (shopSaveErr, shopSaveRes) {
            // Handle Shop save error
            if (shopSaveErr) {
              return done(shopSaveErr);
            }

            // Delete an existing Shop
            agent.delete('/api/shops/' + shopSaveRes.body._id)
              .send(shop)
              .expect(200)
              .end(function (shopDeleteErr, shopDeleteRes) {
                // Handle shop error error
                if (shopDeleteErr) {
                  return done(shopDeleteErr);
                }

                // Set assertions
                (shopDeleteRes.body._id).should.equal(shopSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Shop if not signed in', function (done) {
    // Set Shop user
    shop.user = user;

    // Create new Shop model instance
    var shopObj = new Shop(shop);

    // Save the Shop
    shopObj.save(function () {
      // Try deleting Shop
      request(app).delete('/api/shops/' + shopObj._id)
        .expect(403)
        .end(function (shopDeleteErr, shopDeleteRes) {
          // Set message assertion
          (shopDeleteRes.body.message).should.match('User is not authorized');

          // Handle Shop error error
          done(shopDeleteErr);
        });

    });
  });

  it('should be able to get a single Shop that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Shop
          agent.post('/api/shops')
            .send(shop)
            .expect(200)
            .end(function (shopSaveErr, shopSaveRes) {
              // Handle Shop save error
              if (shopSaveErr) {
                return done(shopSaveErr);
              }

              // Set assertions on new Shop
              (shopSaveRes.body.name).should.equal(shop.name);
              should.exist(shopSaveRes.body.user);
              should.equal(shopSaveRes.body.user._id, orphanId);

              // force the Shop to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Shop
                    agent.get('/api/shops/' + shopSaveRes.body._id)
                      .expect(200)
                      .end(function (shopInfoErr, shopInfoRes) {
                        // Handle Shop error
                        if (shopInfoErr) {
                          return done(shopInfoErr);
                        }

                        // Set assertions
                        (shopInfoRes.body._id).should.equal(shopSaveRes.body._id);
                        (shopInfoRes.body.name).should.equal(shop.name);
                        should.equal(shopInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Shop.remove().exec(done);
    });
  });
});
