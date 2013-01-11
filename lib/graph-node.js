var uuid = require('node-uuid'),
    errors = require('./errors'),
    _ = require('underscore'),
    nonDataKeys = ['graph'];

function GraphNode(graph, data, nodeType) {
	var node = this;

    // save a reference to the owning graph
    this.graph = graph;

    // if the type of the node is defined, but unknown complain
    if (nodeType && (! graph.types[nodeType])) {
        throw new Error(errors.UNKNOWN_TYPE);
    }

    // if we have a node type, then get the type to create 
    // appropriate properties for this node
    if (nodeType) {
        graph.types[nodeType].createProperties(this);
    }

    // initialise the node type
    this.type = nodeType;

    // ensure the data has been initialized
    this.data = _.defaults(data || {}, {
        id: uuid.v4()
    });
}

/**
## linkTo(target, data)
*/
GraphNode.prototype.link = function(target, data) {
    // if the target is a node, then get the id
    if (target && target.id) {
        target = target.id;
    }

    // queue the create edge operation
    this.graph._queue('createEdge', this.id, target, data || {});
};

module.exports = GraphNode;