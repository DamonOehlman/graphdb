var debug = require('debug')('graphdb');
var errors = require('./errors');
var GraphEntity = require('./graph-entity');
var _ = require('underscore');

/**
# GraphType
*/
function GraphType(name, attributes) {
  var typedef = this;

  // initialise the type
  this.type = name;

  // if attributes have been provided, then initialize attributes
  debug('defining new graph type of "' + name + '", attributes: ', attributes);
  if (typeof attributes == 'object') {
    // initialise the attribute mapping
    this.attributes = {};

    // copy the attribute values if provided
    // TODO: if an attribute type mapping is not provided, then complain
    _.without(_.keys(attributes), 'type').forEach(function(key) {
      if (attributes.hasOwnProperty(key)) {
        // if the attribute type mapping is empty, then complain
        if (! attributes[key]) {
          throw new Error(errors.INVALID_TYPE + ' ("' + key + '" attribute)');
        }

        // save the attribute value to the type definition
        typedef.attributes[key] = attributes[key];

        // create an accessor property for the attribute
        Object.defineProperty(typedef, key, {
          get: function() {
            return typedef.attributes[key];
          }
        });
      }
    });

    // create the new graph node prototype for this object
    this.EntityType = extendDataType(GraphEntity, this.attributes);
  }
}

// initialise some attribute modifiers

/**
## alias(aliasType)
Define an alias for the type, pointing to another type in the dictionary


*/
['alias'].forEach(function(attrModifier) {
  GraphType.prototype[attrModifier] = function(value) {
    if (typeof value != 'undefined') {
      this['_' + attrModifier] = value;
      return this;
    }
    else {
      return this['_' + attrModifier];
    }
  };
});

/**
# GraphTypeDictionary

When a new graph is created, it is assigned a new GraphTypeDictionary.  The
base type dictionary that is created is based on the connectors type default
type dictionary if defined, or the default type dictionary if no connector
is provided or the connector does not implement a specific type dictionary.
*/
function GraphTypeDictionary(graph) {
  this.graph = graph;
}

/**
## define(name, attributes)

The define method is used to provide a type definition for the graph. While some
graph databases are weakly typed and require no prior type definitions to store
node data, others require / prefer type definition prior to node insertion.

As such it is recommended that types be defined as part of application initialization:

    graph.types.define('profile', {
        name: graph.types.string
    });

*/
GraphTypeDictionary.prototype.define = function(name, attributes) {
  // TODO: check for reserve type names

  // if we have attributes, then make sure an id field has been provided
  if (typeof attributes == 'object') {
    attributes.id = attributes.id || this.uuid;
  }

  // create the new type definition and return it
  return this[name] = new GraphType(name, attributes);
};

/**
## getBaseType(name)

The `getBaseType` method is used to get the original base typename for the requseted
type name.  This method will follow the type alias chain until it gets to a non-aliased
type and then return that name.
*/
GraphTypeDictionary.prototype.getBaseType = function(name) {
  var targetType = this[name];

  while (targetType && targetType.alias()) {
    if (! (this[targetType.alias()] instanceof GraphType)) {
      break;
    }

    targetType = this[targetType.alias()];
  }

  return targetType.alias() || targetType.type;
};

/**
## listOf(targetType)
..
The `listOf` method is used to define a new list type of a particular target type
*/
// TODO: add setOf implementation also
GraphTypeDictionary.prototype.listOf = function(targetType, opts) {
  var typeDef;

  // if the target type is not a string, then look for the type name
  if (typeof targetType == 'object' && (! (targetType instanceof String))) {
    targetType = targetType.type;
  }

  // get the new custom list type
  typeDef = new GraphType(targetType + 'List').alias('list');

  // add the original type to the definition
  typeDef.itemType = targetType;

  // return an instance of the list type
  return _.extend(typeDef, opts);
};

/**
## relate(sourceType, targetType, name, attributes)
*/
GraphTypeDictionary.prototype.relate = function(sourceType, targetType, name, attributes) {
  // first define the relationship type and attributes if not already defined
  var graph = this.graph,
      relationshipType = this[name] || this.define(name, attributes);

  // ensure that the source type has a method for linking to the target type
  if (sourceType.EntityType.prototype[name] != 'function') {
    sourceType.EntityType.prototype[name] = function(target, data) {
      // if the target is not an instance of GraphEntity, make it one
      if (! (target instanceof GraphEntity)) {
        target = new GraphEntity(graph, { id: target }, targetType);
      }

      // create a link from the source to the target node
      return graph.createEdge(this, target, data, name);
    };
  }
};

/* internal helper functions */

function extendDataType(BaseConstructor, attributes) {
  function CustomGraphEntity() {
    BaseConstructor.apply(this, arguments);
  }

  // define the custom graph node type
  CustomGraphEntity.prototype = new BaseConstructor();

  // iterate through the attributes and create getters and setters on the target object
  _.each(attributes, function(value, key) {
    // create the property on the node
    // remembering that `this` relates to the GraphNode itself
    Object.defineProperty(CustomGraphEntity.prototype, key, {
      get: function() {
        return this.data[key];
      },

      set: function(value) {
        this.data[key] = value;

        // ensure the graph will update the node on next save
        this.graph._queueOnce('saveNode', this);
      }
    });
  });

  return CustomGraphEntity;
}

module.exports = GraphTypeDictionary;
