'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { MapPin } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });
      if (!result?.ok) {
        setError('Invalid credentials');
        return;
      }
      const locale = window.location.pathname.split('/')[1];
      router.push(`/${locale}/admin/dashboard`);
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 text-[#1F51C6] font-bold text-2xl tracking-tight">
            <MapPin className="fill-[#1F51C6] text-white w-8 h-8" />
            Cottage Escape
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h1 className="text-xl font-bold text-[#0B1B40] mb-2 text-center">Admin Login</h1>
          <p className="text-sm text-gray-500 mb-6 text-center">Sign in to manage your content</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6] focus:border-transparent" placeholder="admin" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1F51C6] focus:border-transparent" placeholder="••••••••" required />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-full px-4 py-2.5">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-[#1F51C6] hover:bg-[#163FA3] text-white font-semibold py-2.5 rounded-full disabled:opacity-60 transition-colors">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
