/**
# GraphDB Memory Connector

The memory connector provides a template for creating GraphDB connectors, as well as a simple
in-memory store for working with the GraphDB abstraction.
*/

/**
## defineBaseTypes(dictionary)

The defineBaseTypes function is called on a new GraphTypeDictionary instance created when
a new Graph instance has been created.  The function is used to define the types that are 
supported natively by the graph connector.  

NOTE:  There are no default types created by any connector due to the variance in core
types in different connectors, so all connectors must define a full set of types.
*/
exports.defineBaseTypes = function(dictionary) {
    dictionary.define('string');
    dictionary.define('uuid'); // .alias('string');
};

/**
## connect(graph, opts, callback)

The connect function is called when the `graph.open` method is called.  The opts argument
contains the same arguments that were passed to the graph when it was created so any 
connector specific arguments should be supplied when the graph objectis created.

Once the connection to the graph backend has been established, the callback should be fired.
*/
exports.connect = function(graph, opts, callback) {
    callback();
};

/**
## close(callback)

The close function is used to close the graph connection using the connector appropriate 
logic.  Usually closing a connection will be an asynchronous operation, and so a callback
function is provided so the calling code can be notified upon successful completion.
*/
exports.close = function(callback) {
    callback();
};