var debug = require('debug'),
	errors = require('./errors'),
	GraphNode = require('./graph-node'),
	_ = require('underscore');

/**
# GraphType
*/
function GraphType(name, attributes) {
	var typedef = this;

	// initialise the type
	this.type = name;

	// if attributes have been provided, then initialize attributes
	if (typeof attributes == 'object') {
		// initialise the attribute mapping
		this.attributes = {};

		// copy the attribute values if provided
		// TODO: if an attribute type mapping is not provided, then complain
		_.without(_.keys(attributes), 'type').forEach(function(key) {
			if (attributes.hasOwnProperty(key)) {
				// if the attribute type mapping is empty, then complain
				if (! attributes[key]) throw new Error(errors.INVALID_TYPE);

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
	}
}

/**
## createProperties(target)

The createProperties function is used to create a number of object properties on the 
graph node object that relate to the definition of the type.  This is only relevant for
complex types (i.e. those types that define attributes)
*/
GraphType.prototype.createProperties = function(node) {
	// if the node is not a graph node object then complain
	if (! (node instanceof GraphNode)) {
		throw new Error(errors.INVALID_NODE);
	}

	// iterate through the attributes and create getters and setters on the target object
	_.each(this.attributes, function(value, key) {
		// create the property on the node
		// remembering that `this` relates to the GraphNode itself
		Object.defineProperty(node, key, {
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
};

// initialise some attribute modifiers

/**
## alias(aliasType)
Define an alias for the type, pointing to another type in the dictionary


*/
['alias'].forEach(function(attrModifier) {
	GraphType.prototype[attrModifier] = function(value) {
		this[attrModifier] = value;

		return this;
	};
});

/**
# GraphTypeDictionary

When a new graph is created, it is assigned a new GraphTypeDictionary.  The
base type dictionary that is created is based on the connectors type default
type dictionary if defined, or the default type dictionary if no connector
is provided or the connector does not implement a specific type dictionary.
*/
function GraphTypeDictionary() {
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

module.exports = GraphTypeDictionary;