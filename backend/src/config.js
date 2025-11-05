const fs = require("fs");
const mysql = require("mysql2/promise");

const readFileSync = filename => fs.readFileSync(filename).toString("utf8");

const dbConfig = {
  host: process.env.DATABASE_HOST || "localhost",
  database: process.env.DATABASE_DB,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD
    ? readFileSync(process.env.DATABASE_PASSWORD)
    : null
};

const pool = mysql.createPool({
  host: dbConfig.host,
  database: dbConfig.database,
  user: dbConfig.user,
  password: dbConfig.password,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = {
  port: process.env.PORT || 8080,
  pool
};