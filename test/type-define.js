var assert = require('assert'),
    graphdb = require('../'),
    graph;

describe('graph type definition', function() {
    before(function(done) {
        graph = graphdb(require('./helpers/connect-opts')).open(done);
    });

    it('should be able to define a new profile type', function() {
        graph.types.define('profile', {
            id: graph.types.uuid,
            name: graph.types.string
        });
    });

    it('should be able to validate the type dictionary has a profile', function() {
        assert(graph.types.profile);
    });

    it('should have defined the id attribute of a profile as a uuid', function() {
        assert(graph.types.profile.id, 'id attribute not defined on profile');
        assert.equal(graph.types.profile.id.type, 'uuid');
    });

    it('should have defined the name attribute of a profile as a string', function() {
        assert(graph.types.profile.name, 'name attribute not defined on profile');
        assert.equal(graph.types.profile.name.type, 'string');
    });

    after(function(done) {
        graph.close(done);
    });
});