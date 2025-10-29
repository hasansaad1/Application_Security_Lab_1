const fs = require("fs");

const readFileSync = filename => fs.readFileSync(filename).toString("utf8");

module.exports = {
    database: {
        host: process.env.DATABASE_HOST || "localhost",
        database: process.env.DATABASE_DB,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD
            ? readFileSync(process.env.DATABASE_PASSWORD)
            : null
    },
    port: process.env.PORT || 8080
};