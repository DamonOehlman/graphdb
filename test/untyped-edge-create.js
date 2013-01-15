var assert = require('assert'),
    graphdb = require('../'),
    graph,
    testNode;

describe('untyped graph link creation tests', function() {
    var graph = require('./helpers/connect')(),
        testAuthor,
        testBook,
        testEdge;

    describe('new object creation', function() {

        it('should be able to create a new author', function() {
            testAuthor = graph.create({ name: 'Oscar Wilde' });

            assert(testAuthor);
            assert.equal(testAuthor.data.name, 'Oscar Wilde');
        });

        it('should be able to create a new book', function() {
            testBook = graph.create({ title: 'The Picture of Dorian Gray'});

            assert(testBook);
            assert.equal(testBook.data.title, 'The Picture of Dorian Gray');
        });

        it('should be able to save the graph', function(done) {
            graph.save(done);
        });
    });

    describe('linking objects', function() {
        it('should be able to create a relationship between the author and book', function() {
            testEdge = graph.createEdge(testAuthor, testBook);

            assert(testEdge);
            assert(testEdge.id);
        });

        it('should be able to save the graph', function(done) {
            graph.save(done);
        });

        it('should be able to retrieve the edge from the db', function(done) {
            graph.get(testEdge, function(err, edge) {
                assert.ifError(err);
                assert(edge, 'edge was not successfully retrieved from the db');

                assert.equal(edge.id, testEdge.id);
                done();
            });
        });
    });
});