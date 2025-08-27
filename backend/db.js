const mysql2 = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'testuser',
    password: 'huso',
    database: 'privatecloud'
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