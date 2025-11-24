import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DarkVeil from '@/components/DarkVeil';
import Aurora from '@/components/Aurora';

const SharePage = () => {
  const router = useRouter();
  const { token } = router.query;
  const [data, setData] = useState({ files: [], type: '', expiresAt: null, collection: null, subCollection: null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/share/${token}`);
        if (!response.ok) {
          throw new Error('Link expired or invalid.');
        }
        const payload = await response.json();
        setData(payload);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load share');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink text-textPrimary">
        <p>Loading share…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink text-textPrimary">
        <div className="glass-card p-8 text-center">
          <p className="text-lg font-semibold mb-4">Share unavailable</p>
          <p className="text-textMuted">{error}</p>
        </div>
      </div>
    );
  }

  const downloadUrl = (fileId) =>
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/share/${token}/download/${fileId}`;

  return (
    <div className="relative min-h-screen text-textPrimary overflow-hidden">
      <div className="absolute inset-0 -z-20 pointer-events-none">
        <Aurora colorStops={['#1C0F2B', '#7B2FFF', '#A855F7']} amplitude={0.95} blend={0.35} speed={0.45} />
      </div>
      <div className="absolute inset-0 -z-10">
        <DarkVeil
          hueShift={-50}
          noiseIntensity={0.015}
          scanlineIntensity={0.01}
          scanlineFrequency={5}
          speed={0.25}
          warpAmount={0.1}
        />
      </div>
      <div className="absolute inset-0 -z-5 bg-gradient-to-b from-[#1C0F2B]/70 via-[#0a0615]/85 to-[#040109]/92" />
      <div className="relative z-10 min-h-screen px-6 py-20 flex items-center justify-center">
        <div className="max-w-3xl w-full space-y-10">
          <header className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-textMuted">Shared files</p>
          <h1 className="text-4xl font-semibold">ChamsCheats Drop</h1>
          {data.collection && (
            <p className="text-textMuted">
              Collection: <span className="text-white">{data.collection}</span>
              {data.subCollection && <> / {data.subCollection}</>}
            </p>
          )}
          {data.expiresAt && (
            <p className="text-xs text-textMuted">
              Expires on {new Date(data.expiresAt).toLocaleString()}
            </p>
          )}
          </header>

          <div className="glass-card p-6 bg-black/55 backdrop-blur-2xl">
          {!data.files.length ? (
            <p className="text-textMuted text-center">No files are available anymore.</p>
          ) : (
            <div className="space-y-4">
              {data.files.map((file) => (
                <div
                  key={file.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-white/5 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-semibold">{file.name}</p>
                    <p className="text-xs text-textMuted">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB · {file.fileType}
                    </p>
                  </div>
                  <a
                    href={downloadUrl(file.id)}
                    className="px-4 py-2 rounded-2xl bg-white/10 text-sm font-semibold hover:bg-white/20 transition text-center"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
          </div>

          <footer className="flex flex-wrap justify-center gap-4 text-sm text-textMuted">
          <a
            href="https://discord.gg/chams"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full border border-white/10 hover:border-accent transition"
          >
            Join our Discord
          </a>
          <a
            href="https://www.trustpilot.com/review/chamscheats.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full border border-white/10 hover:border-accent transition"
          >
            Trustpilot Reviews
          </a>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default SharePage;

