// import mysql from 'mysql2/promise';
require('dotenv').config()
// // create the connection to database

// console.log("Creating connection pool...");
const { Client, Pool } = require('pg')

// const connectionDB = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME
//     // password: 'password'
// })
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`

const connectionDB = new Pool({
    connectionString,
});

connectionDB.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack)
    }
    // client.query('SELECT NOW()', (err, result) => {
    //     release()
    //     if (err) {
    //         return console.error('Error executing query', err.stack)
    //     }
    //     console.log(result.rows)
    // })
})
// connectionDB.end(() => {
//     console.log('pool has ended')
// })

export default connectionDB;