# graphdb

The GraphDB package is a simple node.js package designed to ease the process
of working with [graph databases](http://en.wikipedia.org/wiki/Graph_database).
GraphDB provides high level graph operations (create node, link, etc) that are
generally common amongst all graph databases.


[![NPM](https://nodei.co/npm/graphdb.png)](https://nodei.co/npm/graphdb/)


## Persistence

The GraphDB package itself has no persistence capabilities in it's own right,
but uses connector packages to implement store specific serialization:

- [graphdb-orient](https://github.com/DamonOehlman/graphdb-orient) -
  [OrientDB](http://www.orientdb.org) persistence.

## Usage

### Initialization

To initialize a new graph, code similar to the following should be used:

```js
var graphdb = require('graphdb');
var graph = graphdb({ connector: 'memory' });
```

Using the above will create a graph that will only persist in the process
memory, so this is probably not ideal.  Rather, choose one of the persistence
modules (see above) and initialize a db using appropriate connection details.

### Creating a Graph Node

To create a new node in the graph, use the `create` method of the graph object.

For example:

```js
var node = graph.create({ name: 'Bob' });

console.log(node.data.name); // --> Bob
```

The above is an example of creating an _untyped_ node in the graph, but you can
also created typed nodes, which have some distinct advantages:

- Better alignment with type structures in perstistence engines that support types.
- Helpful object properties and methods that make modelling graphs more intuitive.

### Defining a Graph Types

To define a new type in the graph, use the `graph.types` object:

```js
graph.types.define('profile', {
  name: graph.types.string
});
```

The above code will define a new type `profile`, which will be accessible at
`graph.types.profile`.  Our definition of the profile type specifies that it
has a name attribute which is of type string.  In addition to the specified
`name` attribute an `id` attribute is also created which is of type
`graph.types.uuid`.

Now, if we create a new node of the profile type (specified in the 2nd argument
of the `create` method), we will be able to able to access the `name` attribute
directly through the a JS property accessor:

```js
var node = graph.create({ name: 'Ted' }, 'profile');

console.log(node.name); // --> Ted
```

### In-built Basic Types

The following is a list of data-types that are expected to be implemented by
all graphdb connector modules:

- `uuid`
- `string`
- `integer`

## License(s)

### MIT

Copyright (c) 2014 Damon Oehlman <damon.oehlman@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
