var uuid = require('node-uuid'),
    _ = require('underscore');

function GraphNode(data) {
    // ensure the data has been initialized
    data = _.defaults(data || {}, {
        id: uuid.v4()
    });

    // copy items across to this object
    _.extend(this, data);
}

GraphNode.prototype = {
};

module.exports = GraphNode;