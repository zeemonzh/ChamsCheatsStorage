import { motion, AnimatePresence } from 'framer-motion';

const tableVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const formatBytes = (bytes = 0) => {
  if (!Number(bytes)) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

const FileList = ({ files = [], loading, onDelete, onDownload, onRename, onShare }) => {
  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-14 bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!files.length) {
    return (
      <motion.div className="glass-card p-8 text-center" variants={tableVariants} initial="hidden" animate="visible">
        <p className="text-textMuted">No files yet. Upload something epic.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="glass-card p-4 sm:p-6"
      variants={tableVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3 }}
    >
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-textMuted">
              <th className="py-3 font-medium">File</th>
              <th className="py-3 font-medium">Collection</th>
              <th className="py-3 font-medium">Sub-collection</th>
              <th className="py-3 font-medium">Size</th>
              <th className="py-3 font-medium">Uploaded</th>
              <th className="py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {files.map((file) => (
                <motion.tr
                  key={file._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="border-t border-white/5"
                >
                  <td className="py-4 pr-4">
                    <p className="font-medium">{file.originalName || file.filename}</p>
                    <p className="text-xs text-textMuted">{file.fileType}</p>
                  </td>
                  <td className="py-4 pr-4">
                    {file.collection ? (
                      <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs text-textMuted">
                        {file.collection}
                      </span>
                    ) : (
                      <span className="text-xs text-textMuted/60">—</span>
                    )}
                  </td>
                  <td className="py-4 pr-4">
                    {file.subCollection ? (
                      <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs text-textMuted">
                        {file.subCollection}
                      </span>
                    ) : (
                      <span className="text-xs text-textMuted/60">—</span>
                    )}
                  </td>
                  <td className="py-4 align-middle">{formatBytes(file.size)}</td>
                  <td className="py-4 align-middle text-textMuted">{formatDate(file.uploadedAt)}</td>
                  <td className="py-4 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => onDownload(file)}
                        className="px-4 py-2 rounded-2xl bg-white/5 text-xs font-semibold hover:bg-white/10 transition"
                      >
                        Download
                      </button>
                      {onRename && (
                        <button
                          onClick={() => onRename(file)}
                          className="px-4 py-2 rounded-2xl bg-white/5 text-xs font-semibold hover:bg-white/10 transition"
                        >
                          Rename
                        </button>
                      )}
                      {onShare && (
                        <button
                          onClick={() => onShare(file)}
                          className="px-4 py-2 rounded-2xl bg-white/5 text-xs font-semibold hover:bg-white/10 transition"
                        >
                          Share
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(file)}
                        className="px-4 py-2 rounded-2xl bg-red-500/10 text-red-200 text-xs font-semibold hover:bg-red-500/20 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {files.map((file) => (
          <div key={file._id} className="rounded-3xl border border-white/5 bg-black/30 p-4 space-y-3">
            <div>
              <p className="font-semibold text-base">{file.originalName || file.filename}</p>
              <p className="text-xs text-textMuted">{file.fileType}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-white/5 text-textMuted">
                {file.collection || 'No collection'}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-textMuted">
                {file.subCollection || 'No sub'}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-textMuted">
                {formatBytes(file.size)}
              </span>
            </div>
            <p className="text-xs text-textMuted">Uploaded {formatDate(file.uploadedAt)}</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onDownload(file)}
                className="flex-1 min-w-[120px] px-4 py-2 rounded-2xl bg-white/10 text-xs font-semibold hover:bg-white/20 transition"
              >
                Download
              </button>
              {onRename && (
                <button
                  onClick={() => onRename(file)}
                  className="flex-1 min-w-[120px] px-4 py-2 rounded-2xl bg-white/10 text-xs font-semibold hover:bg-white/20 transition"
                >
                  Rename
                </button>
              )}
              {onShare && (
                <button
                  onClick={() => onShare(file)}
                  className="flex-1 min-w-[120px] px-4 py-2 rounded-2xl bg-white/10 text-xs font-semibold hover:bg-white/20 transition"
                >
                  Share
                </button>
              )}
              <button
                onClick={() => onDelete(file)}
                className="flex-1 min-w-[120px] px-4 py-2 rounded-2xl bg-red-500/20 text-xs font-semibold hover:bg-red-500/30 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default FileList;

