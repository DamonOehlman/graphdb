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
            root:   process.env.ORIENTDB_ROOTPASS || '5D2E27810D509BF350D44027205082F2584F3517E456411652B6AF8715219AA5',
            admin:  'admin',
            writer: 'writer',
            reader: 'reader'
        };

        opts.dbs = {
            'graphdb-test': {}
        };
    }
}
