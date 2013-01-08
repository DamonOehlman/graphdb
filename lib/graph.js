var errors = require('./errors'),
    GraphNode = require('./graph-node'),
    GraphTypeDictionary = require('./type-dictionary'),
    _ = require('underscore');

/**
# Graph(opts)
*/
function Graph(initOpts) {
    var TypeDict = GraphTypeDictionary,
        opts = this.opts = _.extend({}, initOpts);

    // if the connector opt is a string, attempt to require the package
    if (typeof opts.connector == 'string' || (opts.connector instanceof String)) {
        this.connector = require(opts.connector);
    }
    else {
        this.connector = opts.connector;
    }

    // create the operations array
    this._ops = [];

    // if we have a connector and the graph has a specific type dictionary
    // then update the the type dictionary prototype
    if (this.connector) {
        TypeDict = this.connector.TypeDictConstructor || TypeDict;
    }

    // create the graph type dictionary
    this.types = new TypeDict();
}

/**
## close(cb)

The close method is used to close the graph instance.  If a connector is associated with
the graph, then the connector is used to close the graph, otherwise the callback is fired
on nextTick.
*/
Graph.prototype.close = function(callback) {
    if (this.connector) {
        this.connector.close(callback);
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
    var CustomGraphNode = GraphNode,
        node,
        typeDef;

    // ensure we have data
    data = data || {};

    // if we have a connector defined, then look for a custom graph node type
    if (this.connector) {
        CustomGraphNode = this.connector.CustomGraphNode || GraphNode;
    }

    // create the new node
    node = new CustomGraphNode(data);

    // if we have a type specified, then ensure the type has been defined
    if (data.type && (! this.types[data.type])) {
        throw new Error(errors.UNKNOWN_TYPE);
    }

    // get the type definition
    typeDef = data.type ? this.types[data.type] : null;

    // if the type definition is not active, then activate
    if (typeDef && (! typeDef.active)) {
        this._queue('activateType', typeDef);
    }

    // queue the create operation and return the node
    this._queue('createNode', node);

    // return the newly created node
    return node;
};

/**
## open(cb)

Open a connection to the graph backend.
*/
Graph.prototype.open = function(callback) {
    // if a connector is defined for the graph
    // then attempt to initiate a valid connection
    if (this.connector) {
        this.connector.connect(this.opts, callback);
    }
    // otherwise, simply fire the supplied callback on the next tick
    else if (typeof callback == 'function') {
        process.nextTick(callback.bind(this, null, this));
    }

    return this;
};

/**
## save(cb)

The save method applies any queued operations using the graph connector.  If no
connector is configured, the operation queue is reset and the callback fired
on the next tick.
*/
Graph.prototype.save = function(callback) {
    var graph = this,
        connector = this.connector;

    if (connector) {
        async.whilst(
            function() { return graph._ops.length > 0; },

            function(stepCb) {
                connector.process(graph.ops.splice(0), stepCb);
            },

            callback
        );
    }
    else if (typeof callback == 'function') {
        process.nextTick(callback);
    }
};

/** internal methods */

Graph.prototype._queue = function(type) {
    // add the operation to the ops queue
    this._ops.push({
        type: type,
        args: Array.prototype.slice.call(arguments, 1)
    });

    // return the graph for chaining
    return this;
};

module.exports = Graph;