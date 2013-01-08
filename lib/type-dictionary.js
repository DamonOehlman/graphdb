var _ = require('underscore');

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
	_.without(_.keys(attributes), 'type').forEach(function(key) {
		if (attributes.hasOwnProperty(key)) {
			typedef[key] = attributes[key];
		}
	});
}

/**
# GraphTypeDictionary

When a new graph is created, it is assigned a new GraphTypeDictionary.  The
base type dictionary that is created is based on the connectors type default
type dictionary if defined, or the default type dictionary if no connector
is provided or the connector does not implement a specific type dictionary.
*/
function GraphTypeDictionary() {
	// define some base types
	this.define('string', { active: true });
	this.define('uuid', { alias: 'string', active: true });
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

	// create the new type definition
	this[name] = new GraphType(name, attributes);

	// return the type dictionary for chaining
	return this;
};

module.exports = GraphTypeDictionary;