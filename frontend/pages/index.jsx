import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-4xl p-12 text-center space-y-6"
      >
        <p className="text-xs uppercase tracking-[0.5em] text-textMuted">File Ops</p>
        <h1 className="text-4xl sm:text-5xl font-semibold">Upload. Manage. Share.</h1>
        <p className="text-textMuted max-w-2xl mx-auto">
          ChamsCheats Storage is a platform for uploading, managing, and sharing files. Upload up to 500MB per
          drop and manage them in an all in one sleek dashboard.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/login" className="btn-primary min-w-[160px]">
            Sign in
          </Link>
          <Link
            href="/register"
            className="min-w-[160px] rounded-2xl border border-white/10 px-5 py-3 font-semibold text-sm hover:border-accent transition"
          >
            Create account
          </Link>
        </div>
      </motion.section>
    </div>
  );
}

