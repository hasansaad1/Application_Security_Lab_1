const fs = require("fs");
const path = require("path");

const readFileSync = filename => fs.readFileSync(filename, "utf8").trim();

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads');
const PORFILE_PICTURE_DIR = path.join(UPLOAD_ROOT, 'profile_pictures');

module.exports = {
    auth: {
        jwtExpiresIn: process.env.JWT_EXPIRES_IN,
        jwtSecret: process.env.JWT_SECRET
            ? readFileSync(process.env.JWT_SECRET)
            : null
    },
    database: {
        host: process.env.DATABASE_HOST || "localhost",
        database: process.env.DATABASE_DB,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD
            ? readFileSync(process.env.DATABASE_PASSWORD)
            : null
    },
    port: process.env.PORT || 8080,
    uploads: {
        root: UPLOAD_ROOT,
        profilePictures: PORFILE_PICTURE_DIR
    }
};