var _ = require('underscore'),
    opts = module.exports = _.defaults({
        db: 'graphdb-test',
        connector: (process.env.GRAPHDB_CONNECTOR || '').toLowerCase() || undefined
    }, { connector: 'memory' });

switch (opts.connector) {
    case 'orient': {

        opts.protocol = {
            type:   'http',
            host:   process.env.ORIENTDB_HOST || 'localhost',
            port:   2480,
            https:  false
        };

        opts.users = {
            root:   process.env.ORIENTDB_ROOTPASS || 'FDB6C4ED52608E5942F84FE0CAE4C33462846C0B2F0FE0AAE5FA492BB72B6DDE',
            admin:  'admin',
            writer: 'writer',
            reader: 'reader'
        };

        opts.dbs = {
            'graphdb-test': {}
        };
    }
}