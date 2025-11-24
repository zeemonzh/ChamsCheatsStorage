const express = require('express');
const {
  createShareLink,
  listShareLinks,
  deleteShareLink,
  getShareDetails,
  downloadSharedFile
} = require('../controllers/shareController');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/').get(auth, listShareLinks).post(auth, createShareLink);
router.delete('/:id', auth, deleteShareLink);
router.get('/:token', getShareDetails);
router.get('/:token/download/:fileId', downloadSharedFile);

module.exports = router;

