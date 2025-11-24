const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    storageKey: {
      type: String,
      required: true
    },
    storageProvider: {
      type: String,
      enum: ['local', 's3'],
      default: 'local'
    },
    collection: {
      type: String,
      trim: true,
      default: null
    },
    subCollection: {
      type: String,
      trim: true,
      default: null
    },
    checksum: {
      type: String
    }
  },
  {
    timestamps: { createdAt: 'uploadedAt', updatedAt: 'updatedAt' }
  }
);

module.exports = mongoose.model('File', fileSchema);

