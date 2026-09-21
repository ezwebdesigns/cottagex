const SITE_HOST = 'chaletexpress.com';

/**
 * qualifyExternalLinks — render-time guard for CMS-authored HTML.
 * Any external <a> without a rel qualifier gets rel="sponsored nofollow"
 * (Google paid-link guidelines: affiliate/commercial outbounds must be
 * qualified). Existing rel values are preserved and extended; internal
 * links (relative or chaletexpress.com) are never touched.
 */
export function qualifyExternalLinks(html: string): string {
  if (!html || !html.includes('<a')) return html;
  return html.replace(/<a\b[^>]*>/gi, (tag) => {
    const href = /href\s*=\s*["'](https?:\/\/[^"']+)["']/i.exec(tag);
    if (!href || href[1].toLowerCase().includes(SITE_HOST)) return tag;
    if (/rel\s*=\s*["'][^"']*(sponsored|nofollow)/i.test(tag)) return tag;
    if (/rel\s*=\s*["']/i.test(tag)) {
      return tag.replace(
        /rel\s*=\s*["']([^"']*)["']/i,
        (_m, v: string) => `rel="${v} sponsored nofollow"`,
      );
    }
    return tag.replace(/<a\b/i, '<a rel="sponsored nofollow"');
  });
}
