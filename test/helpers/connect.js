var graphdb = require('../../'),
    graph = graphdb(require('./connect-opts'));

var connect = module.exports = function() {
    before(function(done) {
        graph.open(done);
    });

    after(function(done) {
        graph.close(done);
    });
    
    return graph;
};

connect.graph = graph;
