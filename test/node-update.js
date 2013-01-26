var assert = require('assert'),
    GraphEntity = require('../lib/graph-entity');

describe('graph node update tests', function() {
    var graph = require('./helpers/connect')(),
        testNode;

    it('should be able to define a simple profile type', function() {
        graph.types.define('profile', {
            name: graph.types.string
        });
    });

    it('should be able to create a new graph node', function() {
        testNode = graph.create({ name: 'Jack O\'Neill' }, 'profile');

        assert(testNode);
        assert(testNode.id);
        assert.equal(testNode.type, 'profile');
    });

    it('should be able to save the graph', function(done) {
        graph.save(done);
    });

    it('should be able to update the node', function() {
        testNode.name = 'Daniel Jackson';
    });

    it('should be able to save the graph', function(done) {
        graph.save(done);
    });

    it('should be able to get the node from the db', function(done) {
        graph.find(testNode, function(err, results) {
            assert.ifError(err);
            assert(results.length > 0);

            assert(results[0] instanceof GraphEntity, 'find result node is not a valid GraphEntity object');
            assert.equal(results[0].type, 'profile');

            assert.equal(results[0].id, testNode.id);
            assert.equal(results[0].name, 'Daniel Jackson');

            done();
        });
    });
});