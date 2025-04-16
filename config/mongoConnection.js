import { MongoClient } from 'mongodb';

const mongoConfig = {
    serverUrl: 'mongodb://127.0.0.1:27017',
    database: 'QuackMatchDB'
};

let _client;
let _db;

export const connectToDb = async () => {
    if (!_client) {
        _client = new MongoClient(mongoConfig.serverUrl);
        await _client.connect();
        _db = _client.db(mongoConfig.database);
        console.log("Connected to MongoDB");
    }
    return _db;
};
