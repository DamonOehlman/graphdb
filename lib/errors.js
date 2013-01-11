exports.UNKNOWN_TYPE = 'Attempting to create a node with an unknown type, ' +
	'define the type using graph.define prior to creating nodes';

exports.INVALID_TYPE = 'Cannot define a new type attribute of an unknown type';
exports.INVALID_NODE = 'A GraphNode instance is required for this operation';

exports.NOOP = 'Attempted to perform an undefined operation on db connector';

exports.CONNECTOR_MISSING_UUID_TYPE = 'The current connector does not specified a uuid type.' + 
    'The uuid type is required, but can be aliased to another local type if required';

exports.OP_UNKNOWN = function(name) {
	return 'The "' + name + '" operation is unavailable for the current graph connector';
};