var Graph = require('./lib/graph');

var graphdb = module.exports = function(opts) {
    return new Graph(opts);
};

// export some of the internal prototypes
graphdb.Graph = Graph;
graphdb.GraphEntity = require('./lib/graph-entity');