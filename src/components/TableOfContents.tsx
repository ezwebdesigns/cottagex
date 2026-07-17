'use client';

import { useState, useEffect } from 'react';
import type { TocItem } from '@/lib/extract-toc';

export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (items.length === 0) return;
    const ids = items.map(i => i.id);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="border-l-2 border-[#0f51ec]/20 pl-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Contents</h3>
      <nav className="space-y-1">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById(item.id);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`block text-sm transition-colors py-1 ${
              activeId === item.id
                ? 'text-[#0f51ec] font-semibold'
                : 'text-slate-500 hover:text-[#0f51ec]'
            } ${item.level === 3 ? 'pl-4' : ''}`}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
