var assert = require('assert');

describe('graph node creation tests', function() {
    var graph = require('./helpers/connect'),
        testNode;

    it('should be able to define a simple profile type', function() {
        graph.types.define('profile', {
            name: graph.types.string
        });
    });

    it('should be able to create a new graph node', function() {
        testNode = graph.create({ name: 'Jack O\'Neill' }, 'profile');

        assert(testNode, 'Node creation failure');
        assert(testNode.id, 'Created node does not have a valid id');
        assert.equal(testNode.type, 'profile');
    });

    it('should be able to save the graph', function(done) {
        graph.save(done);
    });

    it('should be able to get the node from the db', function(done) {
        graph.get(testNode, function(err, node) {
            assert.ifError(err);
            assert.equal(node.id, testNode.id);

            done();
        });
    });
});