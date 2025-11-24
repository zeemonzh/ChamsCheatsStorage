const multer = require('multer');

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (!file.originalname) {
    return cb(new Error('Invalid file name'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

module.exports = upload;

