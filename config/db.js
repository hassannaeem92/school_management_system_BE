const mysql = require('mysql2/promise'); // Use `mysql2/promise` for async/await
const dotenv = require('dotenv');
dotenv.config();

// Create a single shared connection pool
const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    connectionLimit: 10
});

// Gracefully close the connection pool when the app exits
const closePool = async () => {
    try {
        await pool.end();
        console.log('Database connection pool closed.');
    } catch (error) {
        console.error('Error closing the database connection pool:', error);
    }
};

// Handle shutdown signals
process.on('SIGINT', async () => {
    console.log('SIGINT signal received.');
    await closePool();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received.');
    await closePool();
    process.exit(0);
});

module.exports = pool; // Export the pool instance
