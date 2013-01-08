var assert = require('assert'),
    graphdb = require('../'),
    graph;

describe('graph type definition', function() {
    before(function(done) {
        graph = graphdb(require('./helpers/connect-opts'), done);
    });

    it('should be able to define a new profile type', function() {
        graph.types.define('profile', {
            id: graph.types.uuid,
            name: graph.types.string
        });
    });

    it('should be able to validate the type dictionary has a profile', function() {
        assert(graph.types.profile);

        assert.deepEqual(graph.types.profile.id, { type: 'uuid' });
        assert.deepEqual(graph.types.profile.name, { type: 'string' });
    });

    after(function(done) {
        graph.close(done);
    });
});