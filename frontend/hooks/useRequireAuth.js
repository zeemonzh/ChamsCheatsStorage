import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

const useRequireAuth = () => {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const redirectingRef = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      if (!redirectingRef.current) {
        redirectingRef.current = true;
        router.replace('/login');
      }
    } else {
      redirectingRef.current = false;
    }
  }, [isAuthenticated, loading, router]);

  return { isAuthenticated, loading };
};

export default useRequireAuth;

