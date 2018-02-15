var chai = require('chai');  
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

const bookmarks = require('../lib/db/bookmarks');

describe('db/bookmarks', function () {
  
  var bookmarId = 0;

  before(function(done) {
    bookmarks.deleteAll(function(err){
      if(err) {
        console.log("Test.Before failed. Aborting");
        done(err);
      }
    });
    const params = {
      user_id: 1,
      name: 'My Best bookmark',
      url: 'http://www.nba.com'
    };
    bookmarks.create(params, function(err, result) {
      if (err) done(err);
      bookmarId = result;
      done();
    });
  });

  it('findAll should return all items', function(done) {
    bookmarks.findAll(function(err, result) {
      if (err) done(err);
      expect(result.length).to.be.equal(1);
      done();
    });
  });
  
  it('create should insert new record', function(done) {
    const params = {
      user_id: 1,
      name: 'My best bookmark',
      url: 'http://www.nba.com'
    };
    bookmarks.create(params, function(err, result) {
      if (err) done(err);
    });
    done();
  }); 

  it('updateStatus should update checked and is_ok', function(done) {
    const params = {
      id: bookmarId,
      is_ok: true
    };
    bookmarks.updateStatus(params, function(err, result) {
      if (err) done(err);
    });
    done();
  }); 

});
