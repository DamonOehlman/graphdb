var assert = require('assert'),
    graphdb = require('../'),
    graph,
    testNode;

describe('graph node creation tests', function() {
    before(function(done) {
        graph = graphdb(require('./helpers/connect-opts'), done);
    });

    it('should be able to create a new graph node', function() {
        testNode = graph.create({ type: 'Profile' });

        assert(testNode);
        assert(testNode.id);
        assert.equal(testNode.type, 'Profile');
    });

    it('should be able to save the graph', function(done) {
        graph.save(done);
    });

    it('should be able to retrieve the newly created node from the graph', function(done) {
        graph.find({ id: testNode.id }, function(err, results) {
            assert.ifError(err);
            assert.equal(results[0].id, testNode.id);

            done();
        });
    });

    after(function(done) {
        graph.close(done);
    });
});