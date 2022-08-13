require('dotenv').config();


const {
    DB_CONN_STRING
} = process.env;

module.exports = {
    port: process.env.PORT || 2023,
    database: {
        dialect: 'mongodb',
        string: DB_CONN_STRING
    }
}