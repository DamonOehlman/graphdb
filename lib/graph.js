var _ = require('underscore');

/**
# Graph(opts)
*/
function Graph(opts) {
    // ensure opts is a valid object
    opts = opts || {};

    // if the connector opt is a string, attempt to require the package
    if (typeof opts.connector == 'string' || (opts.connector instanceof String)) {
        this.connector = require(opts.connector);
    }
    else {
        this.connector = opts.connector;
    }

    // create the operations array
    this._ops = [];
}

/**
## close(cb)

The close method is used to close the graph instance.  If a connector is associated with
the graph, then the connector is used to close the graph, otherwise the callback is fired
on nextTick.
*/
Graph.prototype.close = function(callback) {
    if (this.connector) {
        this.connector.close(callback)
    }
    else if (typeof callback == 'function') {
        process.nextTick(callback);
    }
};

/**
## create(data)

The create method is used to create a new node in the graph.  There are two fields 
in the data that are considered more significant than others:

    - type: Used to classify the node as a particular type in the graph.

    - id: The internal graphdb id that is assigned to the node.  While a graph
      databse provider may provide an standard id field, this may not map well to 
      a UUID value.  If this is the case then the internal id will be different from
      the exposed id field, and the internal id will be made available in the `_id` 
      property.

All remaining fields will be mapped directly to attributes of the node once created.      
*/
Graph.prototype.create = function(data) {
    // create the new graph node
    var NodeProto = (this.connector ? this.connector.NodeProto : null) || GraphNode,
        operation = this._queue('create', { node : new NodeProto(data) });

    // return the new node
    return operation.node;
};

/**
## save(cb)

The save method applies any queued operations using the graph connector.  If no
connector is configured, the operation queue is reset and the callback fired
on the next tick.
*/
Graph.prototype.save = function(callback) {
    if (this.connector) {
        this.connector.save(callback);
    }
    else if (typeof callback == 'function') {
        process.nextTick(callback);
    }
};

/** internal methods */

Graph.prototype._queue = function(type, data) {
    // create a shallow copy of the data
    var operation = _.extend({}, data, {
        type: type
    });

    // add the operation to the ops queue
    this._ops.push(operation);

    return operation;
};

module.exports = Graph;