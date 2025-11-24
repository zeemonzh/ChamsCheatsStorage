const crypto = require('crypto');
const ShareLink = require('../models/ShareLink');
const File = require('../models/File');
const { getFileStream } = require('../services/storageService');

const DEFAULT_EXPIRY_HOURS = 72;

const buildToken = () => crypto.randomBytes(16).toString('hex');

const createShareLink = async (req, res, next) => {
  try {
    const { type, fileId, collection, subCollection, expiresInHours } = req.body;
    if (!['file', 'collection'].includes(type)) {
      return res.status(400).json({ message: 'Invalid share type' });
    }

    let fileDoc;
    if (type === 'file') {
      if (!fileId) {
        return res.status(400).json({ message: 'fileId is required' });
      }
      fileDoc = await File.findOne({ _id: fileId, user: req.user.id });
      if (!fileDoc) {
        return res.status(404).json({ message: 'File not found' });
      }
    } else if (!collection) {
      return res.status(400).json({ message: 'Collection is required' });
    }

    const hours = Number(expiresInHours) > 0 ? Number(expiresInHours) : DEFAULT_EXPIRY_HOURS;
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    const token = buildToken();

    const payload = {
      owner: req.user.id,
      type,
      token,
      expiresAt
    };

    if (type === 'file') {
      payload.file = fileDoc._id;
    } else {
      payload.collection = collection;
      payload.subCollection = subCollection || null;
    }

    const share = await ShareLink.create(payload);
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl.replace(/\/$/, '')}/share/${token}`;

    res.status(201).json({
      token: share.token,
      expiresAt: share.expiresAt,
      url
    });
  } catch (error) {
    next(error);
  }
};

const findShare = async (token) => {
  const share = await ShareLink.findOne({ token });
  if (!share) {
    const err = new Error('Share link not found');
    err.statusCode = 404;
    throw err;
  }
  if (share.expiresAt < new Date()) {
    const err = new Error('Share link expired');
    err.statusCode = 410;
    throw err;
  }
  return share;
};

const getShareDetails = async (req, res, next) => {
  try {
    const share = await findShare(req.params.token);
    let files = [];
    if (share.type === 'file') {
      const file = await File.findById(share.file);
      if (file) {
        files = [file];
      }
    } else {
      const query = {
        user: share.owner,
        collection: share.collection
      };
      if (share.subCollection) {
        query.subCollection = share.subCollection;
      }
      files = await File.find(query);
    }
    res.json({
      type: share.type,
      collection: share.collection,
      subCollection: share.subCollection,
      expiresAt: share.expiresAt,
      files: files.map((file) => ({
        id: file._id,
        name: file.originalName || file.filename,
        size: file.size,
        fileType: file.fileType,
        uploadedAt: file.uploadedAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

const downloadSharedFile = async (req, res, next) => {
  try {
    const share = await findShare(req.params.token);
    const { fileId } = req.params;

    let file;
    if (share.type === 'file') {
      if (String(share.file) !== fileId) {
        return res.status(404).json({ message: 'File not part of share' });
      }
      file = await File.findById(fileId);
    } else {
      file = await File.findOne({
        _id: fileId,
        user: share.owner,
        collection: share.collection,
        ...(share.subCollection ? { subCollection: share.subCollection } : {})
      });
    }

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const payload = await getFileStream(file);
    if (payload.contentLength) {
      res.setHeader('Content-Length', payload.contentLength);
    }
    res.setHeader('Content-Type', payload.contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName || file.filename}"`);
    payload.stream.on('error', next);
    payload.stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createShareLink,
  getShareDetails,
  downloadSharedFile
};

