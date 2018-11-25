var config = {
    database: {
        connectionString: "mongodb://localhost:27017/nms_db",
        // connectionString: "mongodb://localhost:3001/meteor",
        databaseName: "nms_db"
        // databaseName: "meteor"
    },
    debug: {
        database: {
            connectionString: "mongodb://localhost:27017/nms_db-dev",
            // connectionString: "mongodb://localhost:3001/meteor",
            databaseName: "nms_db-dev"
            // databaseName: "meteor"
        }
    }
};

module.exports = config;
