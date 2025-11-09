const mysql = require("mysql2/promise");
const { database } = require("./config");

const pool = mysql.createPool({
  host: database.host,
  database: database.database,
  user: database.user,
  password: database.password,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;