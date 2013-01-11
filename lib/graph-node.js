var uuid = require('node-uuid'),
    _ = require('underscore'),
    nonDataKeys = ['graph'];

function GraphNode(graph, nodeType, data) {
	var node = this;

    // save a reference to the owning graph
    this.graph = graph;

    // initialise the node type
    this.type = nodeType;

    // ensure the data has been initialized
    data = _.defaults(data || {}, {
        id: uuid.v4()
    });

    // copy the data attributes to the node
    _.each(_.omit(data, 'type'), function(value, key) {
		node[key] = value;
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

Object.defineProperty(GraphNode.prototype, 'data', {
    get: function() {
        var node = this,
            data = {};

        // create a copy of the data from the node without
        // some of the internal fields
        _.each(node, function(value, key) {
            if (node.hasOwnProperty(key) && (nonDataKeys.indexOf(key) < 0)) {
                data[key] = node[key];
            }
        });

        return data;
    }
});

module.exports = GraphNode;