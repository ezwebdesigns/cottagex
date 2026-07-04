'use client';

import { useSession } from 'next-auth/react';
import { User, Shield, Mail } from 'lucide-react';

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-10">
      <h1 className="text-2xl font-bold text-[#191e3b] mb-8">Profile</h1>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#0f51ec]/10 flex items-center justify-center">
            <User className="w-10 h-10 text-[#0f51ec]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#191e3b]">{session?.user?.name || 'Admin'}</h2>
            <p className="text-sm text-slate-500">Administrator</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
            <User className="w-5 h-5 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Username</p>
              <p className="text-sm font-medium text-[#191e3b]">{session?.user?.name || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
            <Mail className="w-5 h-5 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Email</p>
              <p className="text-sm font-medium text-[#191e3b]">{session?.user?.email || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
            <Shield className="w-5 h-5 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Role</p>
              <p className="text-sm font-medium text-[#191e3b]">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
