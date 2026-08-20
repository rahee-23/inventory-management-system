const { Pool } = require("pg");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from the backend folder
dotenv.config({
    path: path.join(__dirname, ".env")
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;