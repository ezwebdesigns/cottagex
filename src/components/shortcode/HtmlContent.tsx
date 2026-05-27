'use client';

import React, { useMemo } from 'react';

type HtmlContentProps = {
  html: string;
};

export function HtmlContent({ html }: HtmlContentProps) {
  const parts = useMemo(() => {
    const result: { type: 'html' | 'shortcode'; value: string; keyword?: string; city?: string }[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const shortcodeRegex = /\[(.+?),\s*(.+?)\]/g;
    const regex = new RegExp(shortcodeRegex.source, 'g');
    while ((match = regex.exec(html)) !== null) {
      if (match.index > lastIndex) {
        result.push({ type: 'html', value: html.slice(lastIndex, match.index) });
      }
      result.push({ type: 'shortcode', value: match[0], keyword: match[1].trim().toLowerCase(), city: match[2].trim().toLowerCase().replace(/\s+/g, '-') });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < html.length) {
      result.push({ type: 'html', value: html.slice(lastIndex) });
    }
    return result;
  }, [html]);

  return (
    <>
      {parts.map((part, i) =>
        part.type === 'shortcode' ? null : (
          <div key={i} className="inline" dangerouslySetInnerHTML={{ __html: part.value }} />
        )
      )}
    </>
  );
}
