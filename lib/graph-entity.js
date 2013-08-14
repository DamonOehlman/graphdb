var uuid = require('uuid'),
    errors = require('./errors'),
    _ = require('underscore'),
    nonDataKeys = ['graph'];

function GraphEntity(graph, data, nodeType) {
    // save a reference to the owning graph
    this.graph = graph;

    // if the type of the node is defined, but unknown complain
    if (nodeType && (! graph.types[nodeType])) {
        throw new Error(errors.UNKNOWN_TYPE + ': ' + nodeType);
    }

    // initialise the node type
    this.type = nodeType;

    // ensure the data has been initialized
    this.data = _.defaults(data || {}, {
        id: uuid.v4()
    });

    // initialise the isEdge member to false
    this.isEdge = false;
}

// attach an id accessor by default
Object.defineProperty(GraphEntity.prototype, 'id', {
    get: function() {
        return this.data.id;
    }
});

module.exports = GraphEntity;