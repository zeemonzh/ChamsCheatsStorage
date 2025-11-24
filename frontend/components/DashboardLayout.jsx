import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Aurora from '@/components/Aurora';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Upload', href: '/upload' }
];

const DashboardLayout = ({ title, subtitle, children, extraActions }) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="relative min-h-screen px-4 sm:px-8 py-10">
      <div className="absolute inset-0 -z-10 opacity-70 pointer-events-none">
        <Aurora colorStops={['#1C0F2B', '#7B2FFF', '#A855F7']} amplitude={0.9} blend={0.35} speed={0.4} />
      </div>
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-textMuted mb-2">ChamsCheats Storage</p>
          <h1 className="text-3xl sm:text-4xl font-semibold">{title}</h1>
          {subtitle && <p className="text-textMuted mt-2 max-w-xl">{subtitle}</p>}
        </div>
        <motion.div
          className="glass-card px-5 py-4 rounded-3xl flex flex-col sm:flex-row sm:items-center gap-3 text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <p className="text-textMuted text-xs">Signed in as</p>
            <p className="font-semibold">{user?.name || user?.email}</p>
          </div>
          {extraActions && <div className="flex items-center gap-2">{extraActions}</div>}
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="px-4 py-2 bg-white/5 rounded-2xl hover:bg-white/10 transition text-sm"
          >
            Logout
          </button>
        </motion.div>
      </header>

      <nav className="flex gap-3 mb-10">
        {navItems.map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-5 py-2 rounded-2xl text-sm font-semibold transition ${
                isActive ? 'bg-white/15 text-white' : 'bg-white/5 text-textMuted hover:bg-white/10'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <main className="space-y-8">{children}</main>
    </div>
  );
};

export default DashboardLayout;

