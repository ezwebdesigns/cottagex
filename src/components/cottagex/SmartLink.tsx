import Link from 'next/link';
import type { ReactNode } from 'react';

/** Absolute http(s) URL that does not point to chaletexpress.com. */
export function isExternalUrl(url?: string): boolean {
  return !!url && /^https?:\/\//.test(url) && !url.includes('chaletexpress.com');
}

type SmartLinkProps = {
  href?: string;
  className?: string;
  children: ReactNode;
  target?: string;
  rel?: string;
  locale?: string;
};

/**
 * Rewrites a hardcoded /en/ or /fr/ prefix (or chaletexpress.com absolute
 * URL) to the current locale. DB links are often stored with a fixed
 * /en/ prefix — without this, FR visitors get bounced to EN pages.
 * External (affiliate) URLs are never touched.
 */
export function localizeHref(href: string, locale?: string): string {
  if (!href || !locale) return href;
  const abs = href.match(/^https?:\/\/[^/]+(\/(en|fr)\/.*)$/);
  if (abs) return `/${locale}/${abs[1].replace(/^\/(en|fr)\//, '')}`;
  return href.replace(/^\/(en|fr)\//, `/${locale}/`);
}

/**
 * Internal links (relative or chaletexpress.com absolute) render as
 * next/link (prefetch, client-side navigation). External links render
 * as plain <a>. No href renders a <div> (same as previous Wrapper pattern).
 */
export default function SmartLink({ href, className, children, target, rel, locale }: SmartLinkProps) {
  const localized = localizeHref(href || '', locale);
  if (!localized) return <div className={className}>{children}</div>;
  if (isExternalUrl(localized)) {
    // Affiliate/commercial outbounds must be qualified for Google
    // (paid-link guidelines); callers can still override via `rel`.
    return <a href={localized} className={className} target={target} rel={rel || 'sponsored nofollow noopener'}>{children}</a>;
  }
  const internal = localized.includes('chaletexpress.com')
    ? localized.replace(/^https?:\/\/[^/]+/, '') || '/'
    : localized;
  return <Link href={internal} className={className}>{children}</Link>;
}
