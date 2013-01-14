var assert = require('assert');

describe('graph relationship definition', function() {
    var graph = require('./helpers/connect').graph;

    before(function() {
        // undefine the author and the book type
        graph.types.author = undefined;
        graph.types.book = undefined;
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
        graph.types.relate(graph.types.author, graph.types.book, 'wrote', {
            percentage: graph.types.float
        });
    });
});