const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");

// Load the .env file from the backend folder
dotenv.config({
    path: path.join(__dirname, ".env")
});

console.log("Database user loaded:", process.env.DB_USER);

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;