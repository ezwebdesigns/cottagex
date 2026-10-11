import type { MetadataRoute } from 'next';

// Bots/scrapers aggressively crawling or training AI models.
// Merged from the former public/robots.txt (deleted: Next.js serves this
// file for /robots.txt, the static one was never served).
// AI policy: citation bots are ALLOWED (ChatGPT-User, Claude-Web,
// PerplexityBot) so our content can be cited with links; training
// crawlers stay BLOCKED (GPTBot, CCBot, anthropic-ai) so our content
// is not absorbed into models without attribution.
const BLOCKED_BOTS = [
  'AhrefsBot',
  'SemrushBot',
  'SemrushBot-SA',
  'MJ12bot',
  'DotBot',
  'BLEXBot',
  'DataForSeoBot',
  'SeekportBot',
  'PetalBot',
  'Cliqzbot',
  'Barkrowler',
  'MegaIndex',
  'YandexBot',
  'Baiduspider',
  'Sogou web spider',
  'Exabot',
  'SeznamBot',
  'GPTBot',
  'CCBot',
  'anthropic-ai',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/en/admin/',
          '/fr/admin/',
          '/en/admin/login',
          '/fr/admin/login',
          '/_next/',
          '/private/',
          '/temp/',
          '/tmp/',
        ],
      },
      ...BLOCKED_BOTS.map((userAgent) => ({
        userAgent,
        disallow: '/',
      })),
    ],
    sitemap: 'https://chaletexpress.com/sitemap.xml',
  };
}
