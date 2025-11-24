import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import UploadCard from '@/components/UploadCard';
import useRequireAuth from '@/hooks/useRequireAuth';
import apiClient from '@/lib/api';

const Upload = () => {
  const { isAuthenticated, loading: authLoading } = useRequireAuth();
  const [collections, setCollections] = useState([]);

  const refreshCollections = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/files');
      const map = new Map();
      data.forEach((file) => {
        if (!file.collection) return;
        if (!map.has(file.collection)) {
          map.set(file.collection, new Set());
        }
        if (file.subCollection) {
          map.get(file.collection).add(file.subCollection);
        }
      });
      const tree = Array.from(map.entries()).map(([name, subs]) => ({
        name,
        subCollections: Array.from(subs).sort()
      }));
      setCollections(tree);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    refreshCollections();
  }, [authLoading, isAuthenticated, refreshCollections]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-textMuted">Loading...</p>
      </div>
    );
  }

  return (
    <DashboardLayout title="Upload center" subtitle="Drag n' drop with neon-grade progress tracking.">
      <UploadCard onUploadSuccess={refreshCollections} collections={collections} />
    </DashboardLayout>
  );
};

export default Upload;

