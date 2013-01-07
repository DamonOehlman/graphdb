# GraphDB

The GraphDB package is a simple node.js package designed to ease the process of working with [graph databases](http://en.wikipedia.org/wiki/Graph_database).  GraphDB provides high level graph operations (create node, link, etc) that are generally common amongst all graph databases.

The GraphDB package itself has no persistence capabilities in it's own right, but uses connector packages to implement store specific serialization:

- [graphdb-orient](https://github.com/DamonOehlman/graphdb-orient) - [OrientDB](http://www.orientdb.org) persistence.

## Example Usage

The GraphDB package is currently under development, and the API is currently evolving.  To have a look at the emerging API please have a look at the `test/` directory in the source tree.

## Licence

MIT. Clean and Simple.