const express = require('express');
const { createInviteCodes, listInvites } = require('../controllers/inviteController');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(auth);
router.get('/', listInvites);
router.post('/', createInviteCodes);

module.exports = router;

