const mongoose = require('mongoose');

const inviteCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    usedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    usedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('InviteCode', inviteCodeSchema);

