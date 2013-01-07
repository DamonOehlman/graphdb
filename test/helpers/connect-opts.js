var opts = {};

switch ((process.env.GRAPHDB_CONNECTOR || '').toLowerCase()) {
    case 'orientdb': {
        opts = {
            connector: require('graphdb-orient'),
        };

        break;
    }

    case 'neo4j': {

        break;
    }

    default: {
        opts = {
            type: 'memory'
        }
    }
}

module.exports = opts;
