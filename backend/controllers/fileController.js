const File = require('../models/File');
const { saveFile, deleteFile, getFileStream } = require('../services/storageService');

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const stored = await saveFile(req.file, req.user.id);
    const collection = req.body.collection?.trim() || null;
    const subCollection = req.body.subCollection?.trim() || null;
    const fileDoc = await File.create({
      user: req.user.id,
      filename: stored.storageKey,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      size: req.file.size,
      fileUrl: stored.fileUrl,
      storageKey: stored.storageKey,
      storageProvider: stored.storageProvider,
      collection,
      subCollection
    });

    res.status(201).json(fileDoc);
  } catch (error) {
    next(error);
  }
};

const getFiles = async (req, res, next) => {
  try {
    const { q, collection, subCollection } = req.query;
    const query = { user: req.user.id };
    if (collection) {
      query.collection = collection;
    }
    if (subCollection) {
      query.subCollection = subCollection;
    }
    if (q) {
      const regex = new RegExp(q, 'i');
      query.$or = [{ originalName: regex }, { filename: regex }, { fileType: regex }];
    }
    const files = await File.find(query).sort({ uploadedAt: -1 });
    res.json(files);
  } catch (error) {
    next(error);
  }
};

const deleteFileById = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user.id });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    await deleteFile(file.storageKey, file.storageProvider);
    await file.deleteOne();
    res.json({ message: 'File deleted' });
  } catch (error) {
    next(error);
  }
};

const updateFile = async (req, res, next) => {
  try {
    const updates = {};
    const { name, collection, subCollection } = req.body;
    if (typeof name === 'string' && name.trim()) {
      updates.originalName = name.trim();
    }
    if (typeof collection === 'string') {
      updates.collection = collection.trim() || null;
    }
    if (typeof subCollection === 'string') {
      updates.subCollection = subCollection.trim() || null;
    }
    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: 'No changes provided' });
    }

    const file = await File.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, updates, {
      new: true
    });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.json(file);
  } catch (error) {
    next(error);
  }
};

const downloadFile = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user.id });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const payload = await getFileStream(file);
    if (payload.contentLength) {
      res.setHeader('Content-Length', payload.contentLength);
    }
    res.setHeader('Content-Type', payload.contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);

    payload.stream.on('error', next);
    payload.stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile,
  getFiles,
  deleteFile: deleteFileById,
  updateFile,
  downloadFile
};

