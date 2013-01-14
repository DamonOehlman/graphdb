var assert = require('assert');

describe('graph type definition', function() {
    var graph = require('./helpers/connect').graph;

    it('should be able to define a new profile type', function() {
        graph.types.define('profile', {
            name: graph.types.string
        });
    });

    it('should be able to validate the type dictionary has a profile', function() {
        assert(graph.types.profile);
    });

    it('should have defined the name attribute of a profile as a string', function() {
        assert(graph.types.profile.name, 'name attribute not defined on profile');
        assert.equal(graph.types.profile.name.type, 'string');
    });

    it('should raise an exception when an attribute type is missing', function() {
        assert.throws(function() {
            graph.types.define('profile2', {
                name: undefined
            });
        });
    });
});