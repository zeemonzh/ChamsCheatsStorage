import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

const ShareLinksCard = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [terminatingId, setTerminatingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get('/share');
        setLinks(data);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load share links');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleCopy = (url, id) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleTerminate = async (id) => {
    if (!confirm('Terminate this share link?')) return;
    try {
      setTerminatingId(id);
      await apiClient.delete(`/share/${id}`);
      setLinks((prev) => prev.filter((link) => link.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to terminate link');
    } finally {
      setTerminatingId(null);
    }
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.4em] text-textMuted">Share links</p>
        <h2 className="text-2xl font-semibold">Keep track of every drop</h2>
        <p className="text-textMuted text-sm">
          Review active share URLs and quickly copy them without regenerating.
        </p>
      </div>

      {loading ? (
        <p className="text-textMuted text-sm">Loading share links…</p>
      ) : error ? (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-2">{error}</p>
      ) : !links.length ? (
        <p className="text-textMuted text-sm">No active links yet.</p>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="rounded-3xl border border-white/5 bg-black/20 p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3 text-sm font-semibold">
                  <span className="capitalize">{link.type}</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-200">Active</span>
                </div>
                {link.type === 'file' && link.file ? (
                  <p className="text-xs text-textMuted">
                    File: {link.file.name} ·{' '}
                    {link.file.size ? `${(link.file.size / (1024 * 1024)).toFixed(1)} MB` : 'Size unavailable'}
                  </p>
                ) : (
                  <p className="text-xs text-textMuted">
                    Collection: {link.collection}
                    {link.subCollection ? ` / ${link.subCollection}` : ''}
                  </p>
                )}
                <p className="text-xs text-textMuted">Expires {formatDate(link.expiresAt)}</p>
              </div>
              <div className="flex flex-col gap-2 md:items-end">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(link.url, link.id)}
                    className="px-4 py-2 rounded-2xl border border-white/10 text-xs font-semibold hover:border-accent transition"
                  >
                    {copiedId === link.id ? 'Copied!' : 'Copy link'}
                  </button>
                  <button
                    onClick={() => handleTerminate(link.id)}
                    className="px-4 py-2 rounded-2xl border border-red-500/40 text-xs font-semibold text-red-200 hover:border-red-400 transition"
                    disabled={terminatingId === link.id}
                  >
                    {terminatingId === link.id ? 'Terminating…' : 'Terminate'}
                  </button>
                </div>
                <p className="text-[11px] text-textMuted break-all max-w-xs md:text-right">{link.url}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShareLinksCard;

