import { useCallback, useMemo, useState, useId } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import apiClient from '@/lib/api';

const MAX_SIZE = 500 * 1024 * 1024; // 500MB

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
};

const normalizeCollections = (collections) =>
  collections
    .filter(Boolean)
    .map((item) =>
      typeof item === 'string'
        ? { name: item, subCollections: [] }
        : { name: item.name, subCollections: item.subCollections || [] }
    );

const UploadCard = ({ onUploadSuccess, collections = [] }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [collection, setCollection] = useState('');
  const [subCollection, setSubCollection] = useState('');
  const collectionInputId = useId();
  const subCollectionInputId = useId();

  const normalizedCollections = useMemo(() => normalizeCollections(collections), [collections]);
  const subCollectionOptions = useMemo(() => {
    const match = normalizedCollections.find((item) => item.name === collection.trim());
    return match ? match.subCollections : [];
  }, [collection, normalizedCollections]);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (!acceptedFiles.length) return;
      setUploading(true);
      setStatus('');
      setProgress(0);

      try {
        for (const file of acceptedFiles) {
          if (file.size > MAX_SIZE) {
            setStatus(`❌ ${file.name} exceeds 500MB limit.`);
            continue;
          }

          const formData = new FormData();
          formData.append('file', file);
          const trimmedCollection = collection.trim();
          if (trimmedCollection) {
            formData.append('collection', trimmedCollection);
          }
          const trimmedSubCollection = subCollection.trim();
          if (trimmedSubCollection) {
            formData.append('subCollection', trimmedSubCollection);
          }

          await apiClient.post('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (event) => {
              if (!event.total) return;
              setProgress(Math.round((event.loaded / event.total) * 100));
            }
          });
        }

        setStatus('✅ Upload complete.');
        onUploadSuccess?.();
      } catch (error) {
        setStatus(error.message || 'Upload failed.');
      } finally {
        setUploading(false);
        setTimeout(() => setProgress(0), 500);
      }
    },
    [collection, onUploadSuccess, subCollection]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  });

  const helperText = useMemo(() => {
    if (isDragActive) return 'Drop to initiate secure upload';
    if (uploading) return 'Uploading...';
    return 'Drag & drop files or click to browse';
  }, [isDragActive, uploading]);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="glass-card p-8 w-full"
    >
      <div className="mb-6">
        <label className="block text-sm font-medium">
          Collection
          <input
            type="text"
            list={collectionInputId}
            value={collection}
            onChange={(event) => setCollection(event.target.value)}
            placeholder="e.g. Internal QA, Release 1.2"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
          />
          <datalist id={collectionInputId}>
            {normalizedCollections.map((option) => (
              <option key={option.name} value={option.name} />
            ))}
          </datalist>
        </label>
        <label className="block text-sm font-medium mt-4">
          Sub-collection
          <input
            type="text"
            list={subCollectionInputId}
            value={subCollection}
            onChange={(event) => setSubCollection(event.target.value)}
            placeholder="Optional nested label"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
            disabled={!collection.trim()}
          />
          <datalist id={subCollectionInputId}>
            {subCollectionOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </label>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-3xl px-6 py-16 text-center transition-all cursor-pointer 
        ${isDragActive ? 'border-glow bg-glow/5 shadow-neon' : 'border-white/10 hover:border-accent/60'}`}
      >
        <input {...getInputProps()} />
        <p className="text-sm uppercase tracking-[0.5em] text-textMuted mb-3">Upload</p>
        <h2 className="text-3xl font-semibold mb-4">Secure file drop</h2>
        <p className="text-textMuted">{helperText}</p>
        <p className="text-xs text-textMuted mt-4">Max 500MB per file · All formats welcome</p>
      </div>

      {progress > 0 && (
        <div className="mt-6">
          <p className="text-sm text-textMuted mb-2">Progress {progress}%</p>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-accent to-glow"
            />
          </div>
        </div>
      )}

      {status && (
        <p className="mt-4 text-sm text-textMuted flex items-center gap-2">
          <span className="text-accent">●</span> {status}
        </p>
      )}
    </motion.div>
  );
};

export default UploadCard;

