var debug = require('debug'),
	errors = require('./errors'),
	_ = require('underscore');

/**
# GraphType
*/
function GraphType(name, attributes) {
	var typedef = this;

	// ensure attributes has been defined
	attributes = attributes || {};

	// initialise the type
	this.type = name;

	// copy the attribute values if provided
	// TODO: if an attribute type mapping is not provided, then complain
	_.without(_.keys(attributes), 'type').forEach(function(key) {
		if (attributes.hasOwnProperty(key)) {
			// if the attribute type mapping is empty, then complain
			if (! attributes[key]) throw new Error(errors.INVALID_TYPE);

			typedef[key] = attributes[key];
		}
	});
}

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

	// if the type has already been defined on the dictionary
	// then raise an exception
	if (this[name] instanceof GraphType) {
		throw new Error('Type "' + name + '" has already been defined for this graph');
	}

	// create the new type definition and return it
	return this[name] = new GraphType(name, attributes);
};

module.exports = GraphTypeDictionary;