'use client';

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CategoryScrollerProps = {
  variant?: 'dark' | 'light';
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export default function CategoryScroller({ variant = 'light', className = '', style, children }: CategoryScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateArrows();
    const ro = new ResizeObserver(updateArrows);
    if (scrollRef.current) ro.observe(scrollRef.current);
    window.addEventListener('resize', updateArrows);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateArrows);
    };
  }, []);

  const scrollByDir = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const btnClass = variant === 'dark'
    ? 'bg-black/40 backdrop-blur text-white border-white/30 hover:bg-black/60'
    : 'bg-white text-[#191e3b] border-slate-200 shadow-lg hover:bg-slate-50';

  return (
    <div className="relative">
      <div ref={scrollRef} onScroll={updateArrows} className={className} style={style}>
        {children}
      </div>
      {canLeft && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByDir(-1)}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${btnClass}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      {canRight && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByDir(1)}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${btnClass}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}