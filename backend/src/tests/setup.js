// backend/tests/setup.js
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
require("dotenv").config();

let mongoServer;

beforeAll(async () => {
    // Option A: Use mongodb-memory-server for isolated CI testing (Highly Recommended)
    // This spins up an in-memory DB so you don't pollute your Atlas DB during CI tests.
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Option B: Use your Atlas test URI (if you prefer hitting a real DB in CI)
    // const uri = process.env.MONGO_URI; 

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    await mongoose.connect(uri, {
        autoIndex: true,
    });
});

afterAll(async () => {
    // Drop database to ensure clean state for next runs
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }

    if (mongoServer) {
        await mongoServer.stop();
    }
});
