var graphdb = require('../../'),
    graph = module.exports = graphdb(require('./connect-opts'));

before(function(done) {
    graph.open(done);
});

after(function(done) {
    graph.close(done);
});
