const express = require('express');
const { createShareLink, getShareDetails, downloadSharedFile } = require('../controllers/shareController');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', auth, createShareLink);
router.get('/:token', getShareDetails);
router.get('/:token/download/:fileId', downloadSharedFile);

module.exports = router;

