const { upload } = require('../config/cloudinary');

// single file upload — used in note upload route
const uploadSingle = upload.single('file');

// wrap multer in a promise so we can handle errors cleanly
const handleUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large — max 20MB allowed' });
      }
      return res.status(400).json({ message: err.message || 'File upload error' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    next();
  });
};

module.exports = { handleUpload };