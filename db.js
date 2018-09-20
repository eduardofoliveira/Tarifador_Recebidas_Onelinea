const mysql = require('mysql2/promise')

module.exports = mysql.createPool({
    host: '54.233.223.179',
    user: 'root',
    password: '190790edu',
    database: 'astpp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})