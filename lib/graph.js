var async = require('async'),
    debug = require('debug')('graphdb'),
    errors = require('./errors'),
    GraphNode = require('./graph-node'),
    GraphTypeDictionary = require('./type-dictionary'),
    _ = require('underscore');

/**
# Graph(opts)
*/
function Graph(initOpts) {
    var opts = this.opts = _.extend({}, initOpts),
        connectorModules,
        lastError;

    // create the operations array
    this._ops = [];

    // create the graph type dictionary
    this.types = new GraphTypeDictionary();

    // initialize the connector
    // if the connector opt is a string, attempt to require the package
    if (opts.connector) {
        // initialise the connector modules
        connectorModules = ['graphdb-' + opts.connector, './connectors/' + opts.connector];

        this.connector = connectorModules.reduce(function(connector, modPath) {
            try {
                return connector || require(modPath);
            }
            catch (e) {
                e.previousError = lastError;
                lastError = e;
            }
        }, undefined);

        // if we don't have a connector, throw the last error
        if (! this.connector) {
            throw lastError;
        }

         debug('created graph, using the ' + opts.connector + ' connector: ', this.connector);
     }

    // if we have a connector, then get it to initialize the type dictionary
    if (this.connector && typeof this.connector.defineBaseTypes == 'function') {
        this.connector.defineBaseTypes(this.types);
    }    
}

/**
## close(cb)

The close method is used to close the graph instance.  If a connector is associated with
the graph, then the connector is used to close the graph, otherwise the callback is fired
on nextTick.
*/
Graph.prototype.close = function(callback) {
    // ensure we have a callback
    callback = callback || function() {};

    if (this.connector) {
        this.connector.close(this, callback);
    }
    else {
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
    node = new CustomGraphNode(this, data);

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
    this._queue('createNode', node.data);

    // return the newly created node
    return node;
};

/**
## get(id, callback)

The get method is used to retrieve a particular node from the storage with
the specified id.
*/
Graph.prototype.get = function(id, dataType, callback) {
    // if a data type has not been supplied, then remap args
    if (typeof dataType == 'function') {
        callback = dataType;
        dataType = undefined;
    }

    // if the id is actually a graph node instance, then extract the id and type
    // from the node itself
    if (id instanceof GraphNode) {
        dataType = id.type;
        id = id.id;
    }

    // if we don't have a connector, then report a problem
    if (! this.connector) {
        return callback(new Error('A graph connector is required to retrieve items from the graph'));
    }

    // if the connector does not implement the getNode function, then complain
    if (typeof this.connector.getNode != 'function') {
        return callback(new Error('The graph connector does not implement getNode functionality'));
    }

    // ask the connector to retrieve the specified node
    this.connector.getNode(this, id, dataType, callback);
};

/**
## open(cb)

Open a connection to the graph backend.
*/
Graph.prototype.open = function(callback) {
    // ensure we have a callback function
    callback = callback || function() {};

    // if a connector is defined for the graph
    // then attempt to initiate a valid connection
    if (this.connector) {
        debug('opening the graph using the connector');
        this.connector.connect(this, this.opts, callback);
    }
    // otherwise, simply fire the supplied callback on the next tick
    else {
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

    // TODO: prevent save methods being called concurrently

    if (connector) {
        async.whilst(
            function() { return graph._ops.length > 0; },

            function(stepCb) {
                var nextOp = graph._ops.shift(),
                    opArgs;

                // if the operation does not have a type, then fire the callback
                // with an error
                if (! nextOp.type) {
                    return callback(new Error(errors.NOOP));
                }

                // if the op type is not supported by the connector then raise an error
                if (typeof connector[nextOp.type] != 'function') {
                    return callback(new Error(errors.OP_UNKNOWN(nextOp.type)));
                }

                // prepend the graph, and append a callback to the op args
                opArgs = [graph].concat(nextOp.args, function(err) {
                    async.parallel([].concat(nextOp.postCommit || []), stepCb);
                });

                // run the connector operation
                connector[nextOp.type].apply(connector, opArgs);
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