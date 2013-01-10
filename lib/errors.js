exports.UNKNOWN_TYPE = 'Attempting to create a node with an unknown type, ' +
	'define the type using graph.define prior to creating nodes';

exports.INVALID_TYPE = 'Cannot define a new type attribute of an unknown type';

exports.NOOP = 'Attempted to perform an undefined operation on db connector';

exports.OP_UNKNOWN = function(name) {
	return 'The "' + name + '" operation is unavailable for the current graph connector';
};