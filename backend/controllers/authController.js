const User = require('../models/User');
const InviteCode = require('../models/InviteCode');
const generateToken = require('../utils/generateToken');

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email
});

const inviteAdmins = (process.env.INVITE_ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const isInviteAdmin = (email = '') => inviteAdmins.includes(email.toLowerCase());

const register = async (req, res, next) => {
  try {
    const { name, email, password, inviteCode } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!inviteCode) {
      return res.status(403).json({ message: 'Invite code required' });
    }

    const invite = await InviteCode.findOne({ code: inviteCode.trim() });
    if (!invite) {
      return res.status(403).json({ message: 'Invalid invite code' });
    }
    if (invite.usedBy) {
      return res.status(403).json({ message: 'Invite already used' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken({ id: user._id });

    invite.usedBy = user._id;
    invite.usedAt = new Date();
    await invite.save();

    res.status(201).json({
      user: sanitizeUser(user),
      token,
      isInviteAdmin: isInviteAdmin(user.email)
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ id: user._id });
    res.json({
      user: sanitizeUser(user),
      token,
      isInviteAdmin: isInviteAdmin(user.email)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login
};

