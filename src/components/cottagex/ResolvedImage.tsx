'use client';

import { useEffect, useState } from 'react';

type ResolvedImageProps = {
  src?: string;
  alt?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
};

export default function ResolvedImage({ src, alt, className, loading = 'lazy' }: ResolvedImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    if (!src) {
      setResolvedSrc('');
      return;
    }
    if (src.startsWith('lib:')) {
      fetch(`/api/library/${src.slice(4)}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (!cancelled) setResolvedSrc(d?.url || ''); })
        .catch(() => { if (!cancelled) setResolvedSrc(''); });
    } else {
      setResolvedSrc(src);
    }
    return () => { cancelled = true; };
  }, [src]);

  if (!resolvedSrc) return null;

  return <img src={resolvedSrc} alt={alt || ''} className={className} loading={loading} />;
}