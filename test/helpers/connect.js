var graphdb = require('../../'),
    graph = graphdb(require('./connect-opts'));

module.exports = function() {
    before(function(done) {
        graph.open(done);
    });

    after(function(done) {
        graph.close(done);
    });
    
    return graph;
};
