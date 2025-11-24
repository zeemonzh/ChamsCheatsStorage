import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import apiClient from '@/lib/api';
import MagicBento from '@/components/MagicBento';

const InviteManager = () => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/invites');
      setInvites(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvite = async () => {
    setGenerating(true);
    try {
      const { data } = await apiClient.post('/invites', { count: 1 });
      setInvites((prev) => [...data, ...prev]);
    } catch (error) {
      alert(error.message);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  return (
    <MagicBento radius="32px">
      <div className="glass-card p-6">
      <div className="flex flex-col gap-2 mb-4">
        <p className="text-xs uppercase tracking-[0.5em] text-textMuted">Access</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-2xl font-semibold">Invite codes</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={generating}
            onClick={generateInvite}
            className="btn-primary px-6 py-3 rounded-2xl disabled:opacity-60"
          >
            {generating ? 'Generating…' : 'Generate code'}
          </motion.button>
        </div>
        <p className="text-textMuted text-sm">Share codes with trusted users to let them sign up.</p>
      </div>

        {loading ? (
        <p className="text-textMuted text-sm">Loading invites…</p>
      ) : invites.length === 0 ? (
        <p className="text-textMuted text-sm">No invite codes yet.</p>
      ) : (
        <div className="space-y-3">
          {invites.map((invite) => {
            const isUsed = Boolean(invite.usedBy);
            return (
              <div
                key={invite.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl border border-white/5 bg-black/20 p-4"
              >
                <div>
                  <p className="font-semibold tracking-[0.3em]">{invite.code}</p>
                  <p className="text-xs text-textMuted">
                    Created {new Date(invite.createdAt).toLocaleString()}
                    {isUsed && <span> · Used {new Date(invite.usedAt).toLocaleString()}</span>}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    isUsed ? 'bg-white/10 text-textMuted' : 'bg-accent/20 text-accent'
                  }`}
                >
                  {isUsed ? 'Used' : 'Unused'}
                </span>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </MagicBento>
  );
};

export default InviteManager;

