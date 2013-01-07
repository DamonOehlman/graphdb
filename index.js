var Graph = require('./lib/graph');

var graphdb = module.exports = function(opts, callback) {
    var graph = new Graph(opts);

    // if a connector is defined for the graph
    // then attempt to initiate a valid connection
    if (graph.connector) {
        graph.connector.connect(opts, callback);
    }
    // otherwise, simply fire the supplied callback on the next tick
    else if (typeof callback == 'function') {
        process.nextTick(callback.bind(graph, null, graph));
    }

    return graph;
};

// export some of the internal prototypes
graphdb.Graph = Graph;
graphdb.GraphNode = require('./lib/graph-node');