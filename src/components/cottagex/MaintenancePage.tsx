'use client';

import { Construction } from 'lucide-react';
import { useTranslations } from '@/lib/useTranslations';

export default function MaintenancePage() {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#0f51ec]/10 flex items-center justify-center">
          <Construction className="w-10 h-10 text-[#0f51ec]" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#191e3b] mb-4" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
          {t.maintenance?.title || 'Under Maintenance'}
        </h1>
        <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
          {t.maintenance?.description || 'We are currently performing scheduled maintenance to improve your experience. Please check back shortly.'}
        </p>
      </div>
    </div>
  );
}