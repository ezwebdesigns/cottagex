'use client';

import { useEffect, useState } from 'react';
import AdRenderer from '@/components/AdRenderer';

export default function SidebarAd() {
  const [html, setHtml] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings?section=ads')
      .then(r => r.json())
      .then(d => setHtml((d?.data as { sidebarScript?: string })?.sidebarScript ?? ''))
      .catch(() => {});
  }, []);

  if (!html) return null;
  return <AdRenderer html={html} />;
}