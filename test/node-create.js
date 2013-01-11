var assert = require('assert'),
    graphdb = require('../'),
    graph,
    testNode;

describe('graph node creation tests', function() {
    before(function(done) {
        graph = graphdb(require('./helpers/connect-opts')).open(done);
    });

    it('should be able to define a simple profile type', function() {
        graph.types.define('profile', {
            name: graph.types.string
        });
    });

    it('should be able to create a new graph node', function() {
        testNode = graph.create({ type: 'profile' });

        assert(testNode);
        assert(testNode.id);
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

    after(function(done) {
        graph.close(done);
    });
});