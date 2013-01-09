var _ = require('underscore'),
    opts = module.exports = _.defaults({
        connector: (process.env.GRAPHDB_CONNECTOR || '').toLowerCase() || undefined
    }, { connector: 'memory' });

switch (opts.connector) {
    case 'orient': {
        opts.server = {
            host: 'localhost',
            port: 2424,
            user_name: 'root',
            user_password: process.env.ORIENTDB_ROOTPASS || 'AE825CAAEE7971AC797A62751A88CE813664CD3DB4979BFAB881C393A7F958FB'
        };

        opts.db = {
            name: 'graphdb-test',
            user_name: 'admin',
            user_password: 'admin'
        };
    }
}