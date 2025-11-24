const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const storageProvider = (process.env.STORAGE_PROVIDER || 'local').toLowerCase();

const resolveEnv = (key, fallback) => process.env[key] || fallback;
const normalizeEndpoint = (value) => {
  if (!value) return undefined;
  let endpoint = value.trim();
  if (endpoint.endsWith('/')) endpoint = endpoint.slice(0, -1);
  if (!endpoint.startsWith('http')) {
    endpoint = `https://${endpoint}`;
  }
  try {
    const parsed = new URL(endpoint);
    if (parsed.pathname && parsed.pathname !== '/') {
      // Remove bucket name from path; use bucket via request params instead.
      parsed.pathname = '';
      endpoint = parsed.toString().replace(/\/$/, '');
    }
    return endpoint;
  } catch {
    return endpoint;
  }
};

const ensureUploadsDir = async () => {
  await fsp.mkdir(uploadsDir, { recursive: true });
};

let s3Client;
const getS3Client = () => {
  if (s3Client) return s3Client;
  const endpoint = normalizeEndpoint(process.env.AWS_ENDPOINT);
  const region = resolveEnv('AWS_REGION', 'us-east-1');
  s3Client = new S3Client({
    region,
    endpoint,
    forcePathStyle: Boolean(endpoint),
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
          }
        : undefined
  });
  return s3Client;
};

const saveFile = async (file, userId) => {
  if (!file) {
    throw new Error('No file provided');
  }

  if (storageProvider === 's3') {
    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) throw new Error('Missing AWS_S3_BUCKET');
    const key = `${userId}/${Date.now()}-${file.originalname}`;
    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    );

    const endpoint = normalizeEndpoint(process.env.AWS_ENDPOINT);
    const region = resolveEnv('AWS_REGION', 'us-east-1');
    const baseUrl =
      (process.env.CDN_BASE_URL || '').replace(/\/$/, '') ||
      (endpoint ? `${endpoint}/${bucket}` : `https://${bucket}.s3.${region}.amazonaws.com`);

    return {
      fileUrl: `${baseUrl}/${key}`,
      storageKey: key,
      storageProvider: 's3'
    };
  }

  await ensureUploadsDir();
  const uniqueName = `${userId}-${uuidv4()}-${file.originalname}`;
  const filePath = path.join(uploadsDir, uniqueName);
  await fsp.writeFile(filePath, file.buffer);

  const appUrl = process.env.APP_BASE_URL || 'http://localhost:5000';
  return {
    fileUrl: `${appUrl}/uploads/${uniqueName}`,
    storageKey: uniqueName,
    storageProvider: 'local'
  };
};

const deleteFile = async (storageKey, provider = storageProvider) => {
  if (!storageKey) return;
  if (provider === 's3') {
    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) return;
    const client = getS3Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: storageKey
      })
    );
    return;
  }
  const filePath = path.join(uploadsDir, storageKey);
  await fsp.rm(filePath, { force: true });
};

const getFileStream = async (file) => {
  if (file.storageProvider === 's3') {
    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) throw new Error('Missing AWS_S3_BUCKET');
    const client = getS3Client();
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: file.storageKey
      })
    );
    return {
      stream: response.Body,
      contentLength: response.ContentLength,
      contentType: response.ContentType || file.fileType
    };
  }

  await ensureUploadsDir();
  const filePath = path.join(uploadsDir, file.storageKey);
  return {
    stream: fs.createReadStream(filePath),
    path: filePath,
    contentType: file.fileType
  };
};

module.exports = {
  saveFile,
  deleteFile,
  getFileStream
};

