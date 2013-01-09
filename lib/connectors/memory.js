/**
# GraphDB Memory Connector

The memory connector provides a template for creating GraphDB connectors, as well as a simple
in-memory store for working with the GraphDB abstraction.
*/

/**
## connect()
*/
exports.connect = function() {

};

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

