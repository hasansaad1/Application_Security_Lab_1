const { createUploadMiddleware } = require("./baseUpload");
const { uploads } = require("../../config");

const uploadProfilePicture = createUploadMiddleware({
  uploadDir: uploads.profilePictures,
  limits: { fileSizeMB: 5 },
  mode: { type: 'single', field: 'profile_picture' },
});

module.exports = { uploadProfilePicture };