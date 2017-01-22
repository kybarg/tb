'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Vendor = mongoose.model('Vendor'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  vendor;

/**
 * Vendor routes tests
 */
describe('Vendor CRUD tests', function () {

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

    // Save a user to the test db and create new Vendor
    user.save(function () {
      vendor = {
        name: 'Vendor name'
      };

      done();
    });
  });

  it('should be able to save a Vendor if logged in', function (done) {
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

        // Save a new Vendor
        agent.post('/api/vendors')
          .send(vendor)
          .expect(200)
          .end(function (vendorSaveErr, vendorSaveRes) {
            // Handle Vendor save error
            if (vendorSaveErr) {
              return done(vendorSaveErr);
            }

            // Get a list of Vendors
            agent.get('/api/vendors')
              .end(function (vendorsGetErr, vendorsGetRes) {
                // Handle Vendors save error
                if (vendorsGetErr) {
                  return done(vendorsGetErr);
                }

                // Get Vendors list
                var vendors = vendorsGetRes.body;

                // Set assertions
                (vendors[0].user._id).should.equal(userId);
                (vendors[0].name).should.match('Vendor name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Vendor if not logged in', function (done) {
    agent.post('/api/vendors')
      .send(vendor)
      .expect(403)
      .end(function (vendorSaveErr, vendorSaveRes) {
        // Call the assertion callback
        done(vendorSaveErr);
      });
  });

  it('should not be able to save an Vendor if no name is provided', function (done) {
    // Invalidate name field
    vendor.name = '';

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

        // Save a new Vendor
        agent.post('/api/vendors')
          .send(vendor)
          .expect(400)
          .end(function (vendorSaveErr, vendorSaveRes) {
            // Set message assertion
            (vendorSaveRes.body.message).should.match('Please fill Vendor name');

            // Handle Vendor save error
            done(vendorSaveErr);
          });
      });
  });

  it('should be able to update an Vendor if signed in', function (done) {
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

        // Save a new Vendor
        agent.post('/api/vendors')
          .send(vendor)
          .expect(200)
          .end(function (vendorSaveErr, vendorSaveRes) {
            // Handle Vendor save error
            if (vendorSaveErr) {
              return done(vendorSaveErr);
            }

            // Update Vendor name
            vendor.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Vendor
            agent.put('/api/vendors/' + vendorSaveRes.body._id)
              .send(vendor)
              .expect(200)
              .end(function (vendorUpdateErr, vendorUpdateRes) {
                // Handle Vendor update error
                if (vendorUpdateErr) {
                  return done(vendorUpdateErr);
                }

                // Set assertions
                (vendorUpdateRes.body._id).should.equal(vendorSaveRes.body._id);
                (vendorUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Vendors if not signed in', function (done) {
    // Create new Vendor model instance
    var vendorObj = new Vendor(vendor);

    // Save the vendor
    vendorObj.save(function () {
      // Request Vendors
      request(app).get('/api/vendors')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Vendor if not signed in', function (done) {
    // Create new Vendor model instance
    var vendorObj = new Vendor(vendor);

    // Save the Vendor
    vendorObj.save(function () {
      request(app).get('/api/vendors/' + vendorObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', vendor.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Vendor with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/vendors/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Vendor is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Vendor which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Vendor
    request(app).get('/api/vendors/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Vendor with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Vendor if signed in', function (done) {
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

        // Save a new Vendor
        agent.post('/api/vendors')
          .send(vendor)
          .expect(200)
          .end(function (vendorSaveErr, vendorSaveRes) {
            // Handle Vendor save error
            if (vendorSaveErr) {
              return done(vendorSaveErr);
            }

            // Delete an existing Vendor
            agent.delete('/api/vendors/' + vendorSaveRes.body._id)
              .send(vendor)
              .expect(200)
              .end(function (vendorDeleteErr, vendorDeleteRes) {
                // Handle vendor error error
                if (vendorDeleteErr) {
                  return done(vendorDeleteErr);
                }

                // Set assertions
                (vendorDeleteRes.body._id).should.equal(vendorSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Vendor if not signed in', function (done) {
    // Set Vendor user
    vendor.user = user;

    // Create new Vendor model instance
    var vendorObj = new Vendor(vendor);

    // Save the Vendor
    vendorObj.save(function () {
      // Try deleting Vendor
      request(app).delete('/api/vendors/' + vendorObj._id)
        .expect(403)
        .end(function (vendorDeleteErr, vendorDeleteRes) {
          // Set message assertion
          (vendorDeleteRes.body.message).should.match('User is not authorized');

          // Handle Vendor error error
          done(vendorDeleteErr);
        });

    });
  });

  it('should be able to get a single Vendor that has an orphaned user reference', function (done) {
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

          // Save a new Vendor
          agent.post('/api/vendors')
            .send(vendor)
            .expect(200)
            .end(function (vendorSaveErr, vendorSaveRes) {
              // Handle Vendor save error
              if (vendorSaveErr) {
                return done(vendorSaveErr);
              }

              // Set assertions on new Vendor
              (vendorSaveRes.body.name).should.equal(vendor.name);
              should.exist(vendorSaveRes.body.user);
              should.equal(vendorSaveRes.body.user._id, orphanId);

              // force the Vendor to have an orphaned user reference
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

                    // Get the Vendor
                    agent.get('/api/vendors/' + vendorSaveRes.body._id)
                      .expect(200)
                      .end(function (vendorInfoErr, vendorInfoRes) {
                        // Handle Vendor error
                        if (vendorInfoErr) {
                          return done(vendorInfoErr);
                        }

                        // Set assertions
                        (vendorInfoRes.body._id).should.equal(vendorSaveRes.body._id);
                        (vendorInfoRes.body.name).should.equal(vendor.name);
                        should.equal(vendorInfoRes.body.user, undefined);

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
      Vendor.remove().exec(done);
    });
  });
});
