'use client';

import { useEffect, useState } from 'react';
import AdRenderer from '@/components/AdRenderer';

export default function SidebarAd({ scriptKey = 'sidebarScript' }: { scriptKey?: string }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings?section=ads')
      .then(r => r.json())
      .then(d => setHtml(((d?.data as Record<string, string>) ?? {})[scriptKey] ?? ''))
      .catch(() => {});
  }, [scriptKey]);

  if (!html) return null;
  return <AdRenderer html={html} />;
}