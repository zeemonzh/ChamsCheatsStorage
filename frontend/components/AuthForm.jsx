import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const spring = { type: 'spring', stiffness: 120, damping: 15 };

const AuthForm = ({ mode = 'login' }) => {
  const router = useRouter();
  const { login, register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isRegister = mode === 'register';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (isRegister && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
        router.push('/upload');
      } else {
        await login({ email: form.email.trim(), password: form.password });
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Unable to process request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="glass-card p-8 max-w-lg w-full mx-auto"
    >
      <div className="flex flex-col gap-2 text-center mb-8">
        <p className="text-sm uppercase tracking-[0.35em] text-textMuted">ChamsCheats Storage</p>
        <h1 className="text-3xl font-semibold">{isRegister ? 'Create account' : 'Welcome back'}</h1>
        <p className="text-textMuted">
          {isRegister ? 'Securely store and manage your builds in the cloud.' : 'Enter your credentials to continue.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {isRegister && (
          <label className="block text-sm font-medium">
            Display Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Spectre"
              className="mt-2 w-full rounded-2xl border border-white/5 bg-black/40 px-4 py-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
            />
          </label>
        )}
        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            className="mt-2 w-full rounded-2xl border border-white/5 bg-black/40 px-4 py-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            placeholder="••••••••"
            className="mt-2 w-full rounded-2xl border border-white/5 bg-black/40 px-4 py-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
          />
        </label>
        {isRegister && (
          <label className="block text-sm font-medium">
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
              placeholder="••••••••"
              className="mt-2 w-full rounded-2xl border border-white/5 bg-black/40 px-4 py-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
            />
          </label>
        )}

        {error && (
          <motion.p
            className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={loading}
          className="btn-primary w-full py-3 rounded-2xl text-white font-semibold tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : isRegister ? 'Create account' : 'Sign in'}
        </motion.button>
      </form>

      <p className="text-center text-sm text-textMuted mt-6">
        {isRegister ? 'Already have an account?' : `Need an account?`}{' '}
        <Link href={isRegister ? '/login' : '/register'} className="text-accent hover:text-glow transition">
          {isRegister ? 'Sign in' : 'Sign up'}
        </Link>
      </p>
    </motion.div>
  );
};

export default AuthForm;

