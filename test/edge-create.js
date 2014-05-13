var assert = require('assert'),
    graphdb = require('../'),
    graph,
    testNode;

describe('graph link creation tests', function() {
    var graph = require('./helpers/connect')(),
        testAuthor,
        testBook,
        testEdge;

    // include the base define relationship tests
    require('./define-relationship');

    describe('new object creation', function() {

        it('should have access to the author and book types', function() {
            assert(graph.types.book);
            assert(graph.types.author);
        });

        it('should be able to create a new author', function() {
            testAuthor = graph.create({ name: 'Oscar Wilde' }, 'author');

            assert(testAuthor);
            assert.equal(testAuthor.name, 'Oscar Wilde');
        });

        it('should be able to create a new book', function() {
            testBook = graph.create({ title: 'The Picture of Dorian Gray'}, 'book');

            assert(testBook);
            assert.equal(testBook.title, 'The Picture of Dorian Gray');
        });

        it('should be able to save the graph', function(done) {
            graph.save(done);
        });
    });

    describe('linking objects', function() {
        it('should be able to create a relationship between the author and book', function() {
            testEdge = testAuthor.wrote(testBook, {
                percentage: 100
            });

            assert(testEdge);
            assert(testEdge.id);
            assert.equal(testEdge.percentage, 100);
        });

        it('should be able to save the graph', function(done) {
            graph.save(done);
        });

        it('should be able to update a property of the edge', function() {
            testEdge.percentage = 50;
            assert.equal(testEdge.percentage, 50);
        });

        it('should be able to save the graph with the updated value', function(done) {
            graph.save(done);
        });

        it('should be able to retrieve the edge from the db', function(done) {
            graph.find(testEdge, function(err, results) {
                assert.ifError(err);
                assert(results.length > 0);

                assert.equal(results[0].id, testEdge.id);
                assert.equal(results[0].percentage, 50);
                done();
            });
        });
    });
});
