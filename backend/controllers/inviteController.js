const { v4: uuidv4 } = require('uuid');
const InviteCode = require('../models/InviteCode');

const inviteAdmins = (process.env.INVITE_ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const isInviteAdmin = (email = '') => inviteAdmins.includes(email.toLowerCase());

const formatInvite = (invite) => ({
  id: invite._id,
  code: invite.code,
  createdAt: invite.createdAt,
  createdBy: invite.createdBy,
  usedBy: invite.usedBy,
  usedAt: invite.usedAt
});

const createInviteCodes = async (req, res, next) => {
  try {
    if (!req.user || !isInviteAdmin(req.user.email)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const count = Math.min(Math.max(Number(req.body.count) || 1, 1), 20);
    const invites = [];
    for (let i = 0; i < count; i += 1) {
      invites.push({
        code: uuidv4().replace(/-/g, '').slice(0, 10).toUpperCase(),
        createdBy: req.user._id
      });
    }
    const docs = await InviteCode.insertMany(invites);
    res.status(201).json(docs.map(formatInvite));
  } catch (error) {
    next(error);
  }
};

const listInvites = async (req, res, next) => {
  try {
    if (!req.user || !isInviteAdmin(req.user.email)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const invites = await InviteCode.find().sort({ createdAt: -1 }).limit(100);
    res.json(invites.map(formatInvite));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInviteCodes,
  listInvites
};

