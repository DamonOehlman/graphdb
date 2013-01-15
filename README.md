# GraphDB

The GraphDB package is a simple node.js package designed to ease the process of working with [graph databases](http://en.wikipedia.org/wiki/Graph_database).  GraphDB provides high level graph operations (create node, link, etc) that are generally common amongst all graph databases.

The GraphDB package itself has no persistence capabilities in it's own right, but uses connector packages to implement store specific serialization:

- [graphdb-orient](https://github.com/DamonOehlman/graphdb-orient) - [OrientDB](http://www.orientdb.org) persistence.

## Usage

### Initialization

To initialize a new graph, code similar to the following should be used:

```js
var graphdb = require('graphdb'),
	graph = graphdb({ connector: 'memory' });
```

Using the above will create a graph that will only persist in the process memory, so this is probably not ideal.  Rather, choose one of the persistence modules (see above) and initialize a db using appropriate connection details.

### Creating a Graph Node

To create a new node in the graph, use the `create` method of the graph object.  For example:

```js
var node = graph.create({ name: 'Bob' });

console.log(node.data.name); // --> Bob
```

The above is an example of creating an _untyped_ node in the graph, but you can also created typed nodes, which have some distinct advantages:

- Better alignment with type structures in perstistence engines that support types.
- Helpful object properties and methods that make modelling graphs more intuitive.

### Defining a Graph Types

To define a new type in the graph, use the `graph.types` object:

```js
graph.types.define('profile', {
	name: graph.types.string
});
```

The above code will define a new type `profile`, which will be accessible at `graph.types.profile`.  Our definition of the profile type specifies that it has a name attribute which is of type string.  In addition to the specified `name` attribute an `id` attribute is also created which is of type `graph.types.uuid`.

Now, if we create a new node of the profile type (specified in the 2nd argument of the `create` method), we will be able to able to access the `name` attribute directly through the a JS property accessor:

```js
var node = graph.create({ name: 'Ted' }, 'profile');

console.log(node.name); // --> Ted
```

## Licence

MIT. Clean and Simple.