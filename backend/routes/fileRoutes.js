const express = require('express');
const { uploadFile, getFiles, deleteFile, downloadFile, updateFile } = require('../controllers/fileController');
const auth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post('/upload', auth, upload.single('file'), uploadFile);
router.get('/', auth, getFiles);
router.get('/download/:id', auth, downloadFile);
router.delete('/:id', auth, deleteFile);
router.patch('/:id', auth, updateFile);

module.exports = router;

