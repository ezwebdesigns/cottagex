'use client';

import { useEffect, useState } from 'react';

type ResolvedImageProps = {
  src?: string;
  alt?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
};

export default function ResolvedImage({ src, alt, className, loading = 'lazy' }: ResolvedImageProps) {
  // On ne stocke que la résolution asynchrone des références `lib:`.
  // Les URL directes sont dérivées pendant le rendu (pas de setState dans un effet).
  const [resolved, setResolved] = useState<{ id: string; url: string }>({ id: '', url: '' });
  const libId = src?.startsWith('lib:') ? src.slice(4) : '';

  useEffect(() => {
    if (!libId) return;
    let cancelled = false;
    fetch(`/api/library/${libId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!cancelled) setResolved({ id: libId, url: d?.url || '' }); })
      .catch(() => { if (!cancelled) setResolved({ id: libId, url: '' }); });
    return () => { cancelled = true; };
  }, [libId]);

  const resolvedSrc = !src ? '' : libId
    ? (resolved.id === libId ? resolved.url : '')
    : src;

  if (!resolvedSrc) return null;

  return <img src={resolvedSrc} alt={alt || ''} className={className} loading={loading} />;
}
