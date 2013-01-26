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

    it('should be able to define a complicated type', function() {
        graph.types.define('company', {
            name: graph.types.string,
            created: graph.types.date,
            members: graph.types.listOf('profile')
        });
    });

    it('should have the complicated type definition available', function() {
        assert(graph.types.company);
        console.log(graph.types.company);
    });

    it('should be able to define an alias chain for a known type', function() {
        graph.types.define('color').alias('string');
        graph.types.define('fillColor').alias('color');

        // validate that the base type name for fillColor -> string
        assert.equal(graph.types.getBaseType('fillColor'), 'string');
    });
});