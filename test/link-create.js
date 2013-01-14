var assert = require('assert'),
    graphdb = require('../'),
    graph,
    testNode;

describe('graph link creation tests', function() {
    var graph = require('./helpers/connect'),
        testAuthor,
        testBook;

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
            testAuthor.wrote(testBook);
        });

        it('should be able to save the graph', function(done) {
            graph.save(done);
        });
    });
});