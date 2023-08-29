
var mysql = require('mysql')

// Creating pool connections for Mysql //
// Using pool connections instead as create connections is vulnerable to unexpected Mysql server shutdowns //  
var pool = mysql.createPool({
    connectionLimit: 10,  // Limit the number of connections that can be made to the mysql server // 
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'sp_air',
    dateStrings: true,    // Ensures that timestamp value from mysql db is converted to string (proper formatting) // 
    multipleStatements: true // Allows for multiple statments in a single sql query //
});

// Each connection in pool // 
// Pooled connections do not need to be manually closed, they can remain open and be re-used. // 
pool.getConnection((err, connection) => {
    // For error handling for connections // 
    if (err) {
        // Connection is lost with database //
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        // There is no available connections left in pool (limit connections is reached ) // 
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        // Database Refused to connect // 
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }

    //  pool.query() is a shortcut for pool.getConnection() + connection.query() + connection.release(). // 

    // Automatically releases the connection back to pool once finished query // 
    if (connection) {
        connection.release()
    }

    return
})

module.exports = pool

// POOL CONNECT //
// Link: https://mhagemann.medium.com/create-a-mysql-database-middleware-with-node-js-8-and-async-await-6984a09d49f4 //
