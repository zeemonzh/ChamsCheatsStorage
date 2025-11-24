const mongoose = require('mongoose');

const shareLinkSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['file', 'collection'],
      required: true
    },
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File'
    },
    collection: {
      type: String,
      default: null
    },
    subCollection: {
      type: String,
      default: null
    },
    token: {
      type: String,
      unique: true,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShareLink', shareLinkSchema);

