var assert = require('assert'),
    graphdb = require('../'),
    graph;

describe('graph relationship definition', function() {
    before(function(done) {
        graph = graphdb(require('./helpers/connect-opts')).open(done);
    });

    it('should be able to define a new author type', function() {
        graph.types.define('author', {
            name: graph.types.string
        });

        assert(graph.types.author);
    });

    it('should be able to define a new book type', function() {
        graph.types.define('book', {
            title: graph.types.string
        });

        assert(graph.types.book);
    });

    it('should be able to define a linkage between authors and books', function() {
        graph.types.relate(graph.types.author, graph.types.book, 'wrote');
    });

    after(function(done) {
        graph.close(done);
    });
});