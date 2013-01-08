var uuid = require('node-uuid'),
    _ = require('underscore');

function GraphNode(data) {
	var node = this;

    // ensure the data has been initialized
    data = _.defaults(data || {}, {
        id: uuid.v4()
    });

    // copy the data attributes to the node
    _.each(data, function(value, key) {
		node[key] = value;
    });
}

module.exports = GraphNode;