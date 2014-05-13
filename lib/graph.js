var assert = require('assert');
var async = require('async');
var debug = require('debug')('graphdb');
var errors = require('./errors');
var GraphEntity = require('./graph-entity');
var GraphTypeDictionary = require('./type-dictionary');
var _ = require('underscore')'

// the base types that all graphdb connector libraries must implement
var requiredTypes = [
  'uuid',
  'integer',
  'string',
  'float',
  'boolean
];

/**
# Graph(opts)
*/
function Graph(initOpts) {
  var opts = this.opts = _.extend({}, initOpts);
  var connectorModules;
  var lastError;
  var types;

  // create the operations array
  this._ops = [];

  // create the graph type dictionary
  this.types = types = new GraphTypeDictionary(this);

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

    debug('created graph, using the ' + opts.connector + ' connector');
  }

  // if we have a connector, then get it to initialize the type dictionary
  if (this.connector && typeof this.connector.defineBaseTypes == 'function') {
    this.connector.defineBaseTypes(this.types);
  }

  // ensure we have the base types defined
  requiredTypes.forEach(function(typeName) {
    assert(types[typeName], 'graphdb connector (' + opts.connector + ') missing required ' + typeName + ' type');
  });
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
## create(data, nodeType)

The create method is used to create a new node in the graph.  There are two fields
in the data that are considered more significant than others:

    - id: The internal graphdb id that is assigned to the node.  While a graph
      databse provider may provide an standard id field, this may not map well to
      a UUID value.  If this is the case then the internal id will be different from
      the exposed id field, and the internal id will be made available in the `_id`
      property.

All remaining fields will be mapped directly to attributes of the node once created.
*/
Graph.prototype.create = function(data, nodeType) {
  // create the new graph node
  var EntityType;
  var node;
  var typeDef;

  // ensure we have data
  data = data || {};

  // if we have a type specified, then ensure the type has been defined
  if (nodeType && (! this.types[nodeType])) {
    throw new Error(errors.UNKNOWN_TYPE);
  }

  // get the type definition
  typeDef = nodeType ? this.types[nodeType] : null;

  // if the type definition is not active, then activate
  if (typeDef && (! typeDef.active)) {
    this._queue('activateNodeType', typeDef);
  }

  // determine the appropriate graph node constructor
  EntityType = (typeDef ? typeDef.EntityType : null) || GraphEntity;

  // create the new node
  node = new EntityType(this, data, nodeType);

  // queue the create operation and return the node
  this._queue('saveNode', node);

  // return the newly created node
  return node;
};

/**
## createEdge(source, target, data, nodeType)

The link method is used to create an edge between the specified source and
target nodes.
*/
Graph.prototype.createEdge = function(source, target, data, edgeType) {
  // create the new graph node
  var EntityType;
  var edge;
  var typeDef;

  // ensure we have data
  data = data || {};

  // if we have a type specified, then ensure the type has been defined
  if (edgeType && (! this.types[edgeType])) {
    throw new Error(errors.UNKNOWN_TYPE);
  }

  // get the type definition
  typeDef = edgeType ? this.types[edgeType] : null;

  // if the type definition is not active, then activate
  if (typeDef && (! typeDef.active)) {
    this._queue('activateEdgeType', typeDef);
  }

  // determine the appropriate graph node constructor
  EntityType = (typeDef ? typeDef.EntityType : null) || GraphEntity;

  // create the new node
  edge = new EntityType(this, data, edgeType);

  // flag that the entity is an edge
  edge.isEdge = true;

  // queue the create operation and return the node
  this._queue('saveEdge', source, target, edge);

  // return the newly created node
  return edge;
};

/**
## find(searchParams, opts*, callback)

The find method is used to find a node or edge within the graphdb persistence engine. While each
persistence engine may implement subtle differences in find behaviour, core behaviour specifies
that the searchParams object will contain fields that should be matched against the db for a match.
*/
Graph.prototype.find = function(searchParams, opts, callback) {
  var graph = this;

  // get a copy of the targetType string
  var targetType = ''.concat((searchParams && searchParams.type) || '');
  var EntityType;

  // check for the two argument call
  if (typeof opts == 'function') {
    callback = opts;
    opts = {};
  }

  // initialise the entity type
  EntityType = (targetType && this.types[targetType] && this.types[targetType].EntityType) ||
    GraphEntity;

  // if we don't have a connector, then report a problem
  if (! this.connector) {
    return callback(new Error('A graph connector is required to retrieve items from the graph'));
  }

  // get the connector to find based on the params
  // find functionality may differ from implementation to implementation
  // so by simply passing the details through we support the widest possible implementation
  return this.connector.find(this, searchParams, opts, function(err, results) {
    if (err) return callback(err);

    // coerce the objects into valid node objects
    callback(null, results.map(function(data) {
      return new EntityType(graph, data, targetType);
    }));
  });
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
  var graph = this;
  var connector = this.connector;

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

Graph.prototype._queueOnce = function(type) {
  var args = Array.prototype.slice.call(arguments, 1);
  var existing = false;

  // check the ops push
  this._ops.forEach(function(op) {
    existing = existing || op.type === type && _.isEqual(args, op.args);
  });

  // if the operation is not sitting in the queue then, then queue it
  if (! existing) {
    this._queue.apply(this, arguments);
  }

  return this;
};

module.exports = Graph;
