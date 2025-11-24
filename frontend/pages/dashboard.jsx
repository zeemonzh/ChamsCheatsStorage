import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import FileList from '@/components/FileList';
import FileFilters from '@/components/FileFilters';
import InviteManager from '@/components/InviteManager';
import ShareLinksCard from '@/components/ShareLinksCard';
import Modal from '@/components/Modal';
import useRequireAuth from '@/hooks/useRequireAuth';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';

const Dashboard = () => {
  const { isAuthenticated, loading: authLoading } = useRequireAuth();
  const { user } = useAuth();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('');
  const [subCollectionFilter, setSubCollectionFilter] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.q = searchTerm;
      if (collectionFilter) params.collection = collectionFilter;
      if (subCollectionFilter) params.subCollection = subCollectionFilter;
      const { data } = await apiClient.get('/files', { params });
      setFiles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [collectionFilter, searchTerm, subCollectionFilter]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    loadFiles();
  }, [authLoading, isAuthenticated, loadFiles]);

  const collectionOptions = useMemo(() => {
    const map = new Map();
    files.forEach((file) => {
      if (!file.collection) return;
      if (!map.has(file.collection)) {
        map.set(file.collection, new Set());
      }
      if (file.subCollection) {
        map.get(file.collection).add(file.subCollection);
      }
    });
    return Array.from(map.entries()).map(([name, subs]) => ({
      name,
      subCollections: Array.from(subs).sort()
    }));
  }, [files]);

  const handleDelete = async (file) => {
    if (!confirm(`Delete ${file.originalName || file.filename}?`)) return;
    try {
      await apiClient.delete(`/files/${file._id}`);
      loadFiles();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRename = async (file) => {
    const currentName = file.originalName || file.filename;
    const newName = prompt('Rename file', currentName);
    if (!newName || newName.trim() === currentName) return;
    try {
      await apiClient.patch(`/files/${file._id}`, { name: newName.trim() });
      loadFiles();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDownload = async (file) => {
    try {
      const { data } = await apiClient.get(`/files/download/${file._id}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName || file.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error.message);
    }
  };

  const promptExpiryHours = () => {
    const input = prompt('Share link duration in hours (default 72)', '72');
    if (input === null) return null;
    const value = Number(input || 72);
    if (Number.isNaN(value) || value <= 0) {
      alert('Please enter a positive number.');
      return null;
    }
    return value;
  };

  const handleShareFile = async (file) => {
    const hours = promptExpiryHours();
    if (!hours) return;
    try {
      const { data } = await apiClient.post('/share', {
        type: 'file',
        fileId: file._id,
        expiresInHours: hours
      });
      window.prompt('Share link (copy to clipboard)', data.url);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleShareSelection = async (collection, subCollection) => {
    const hours = promptExpiryHours();
    if (!hours) return;
    try {
      const payload = {
        type: 'collection',
        collection,
        expiresInHours: hours
      };
      if (subCollection) {
        payload.subCollection = subCollection;
      }
      const { data } = await apiClient.post('/share', payload);
      window.prompt('Share link (copy to clipboard)', data.url);
    } catch (error) {
      alert(error.message);
    }
  };

  const inviteAction =
    user?.isInviteAdmin ? (
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setInviteModalOpen(true)}
        className="px-4 py-2 rounded-2xl border border-white/10 text-xs font-semibold text-white/80 hover:border-white/30 hover:text-white transition"
      >
        Invite codes
      </motion.button>
    ) : null;

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-textMuted">Loading...</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Your vault"
      subtitle="Manage every drop with instant controls."
      extraActions={inviteAction}
    >
      <FileFilters
        collections={collectionOptions}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        selectedCollection={collectionFilter}
        onCollectionChange={(value) => {
          setCollectionFilter(value);
          setSubCollectionFilter('');
        }}
        selectedSubCollection={subCollectionFilter}
        onSubCollectionChange={setSubCollectionFilter}
        onShareSelection={handleShareSelection}
      />
      <FileList
        files={files}
        loading={loading}
        onDelete={handleDelete}
        onDownload={handleDownload}
        onRename={handleRename}
        onShare={handleShareFile}
      />
      <ShareLinksCard />
      <Modal isOpen={inviteModalOpen} onClose={() => setInviteModalOpen(false)}>
        <InviteManager />
      </Modal>
    </DashboardLayout>
  );
};

export default Dashboard;

