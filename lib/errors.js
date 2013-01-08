exports.UNKNOWN_TYPE = 'Attempting to create a node with an unknown type, ' +
	'define the type using graph.define prior to creating nodes';

exports.NOOP = 'Attempted to perform an undefined operation on db connector';

exports.OP_UNKNOWN = function(name) {
	return 'The "' + name + '" operation is unavailable for the current graph connector';
};