import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from '@/context/AuthContext';
import '@/styles/globals.css';

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 }
};

function AppShell({ Component, pageProps }) {
  const router = useRouter();

  return (
    <AuthProvider>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={router.route}
          initial={pageTransition.initial}
          animate={pageTransition.animate}
          exit={pageTransition.exit}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="min-h-screen"
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </AuthProvider>
  );
}

export default AppShell;

