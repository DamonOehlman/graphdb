var _ = require('underscore'),
    opts = module.exports = _.defaults({
        connector: (process.env.GRAPHDB_CONNECTOR || '').toLowerCase() || undefined
    }, { connector: 'memory' });