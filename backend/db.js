const mysql2 = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.HOST_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME
}

async function connectToDatabase(){
    try {
        const connection = await mysql2.createConnection(dbConfig);
        console.log('Connection to DB was successful!');
        return connection;
    } catch (error) {
        console.error('Connection to DB failed:', error.message);
    }
}

module.exports = { connectToDatabase }; 