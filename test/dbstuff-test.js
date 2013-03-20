/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var should = require("should");

var dbstuff = require("../dbstuff");

var test_collection = "Mocha";

describe("dbstuff", function() {
    describe("util.open", function() {
        it('should open the database Wolken', function(done) {
            dbstuff.util.open(function(err, p_client) {
                p_client._state.should.equal('connected');
                p_client.close();
                done();
            });
        });
    });

    describe("util.col", function() {
        it('should give back an open collection', function(done) {
            dbstuff.util.open(function(open_err, p_client) {
                dbstuff.util.col(test_collection, function(err, collection) {
                    should.strictEqual(err, null);
                    collection.should.be.a('object');
                    p_client.close();
                    done();
                });
            });
        });
    });

    describe("util.save", function() {
        it('should save the to the collection Test', function(done) {
            dbstuff.util.open(function(open_err, p_client) {
                dbstuff.util.col(test_collection, function(err, collection) {
                    collection.remove(null, {w: 0});
                    var testData = {Test: "test", numb: 123, mydate: new Date, obj: {a: 1, b: 2, d: 3}, arr: [12, 34, 56]};
                    dbstuff.util.save(test_collection, testData, function() {
                        testData.should.have.property('_id');
                        p_client.close();
                        done();
                    });
                });
            });
        });
    });
});

