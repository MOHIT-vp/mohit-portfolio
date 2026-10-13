import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Canonical and absolute Open Graph URLs need the real domain, which is not
 * known yet. Set SITE_URL (e.g. https://example.com) at build time, or deploy
 * on Vercel, which provides VERCEL_PROJECT_PRODUCTION_URL. Without either,
 * those tags are left out rather than pointing at an invented domain.
 */
function siteMeta(): Plugin {
  const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const site = (process.env.SITE_URL || (fromVercel ? `https://${fromVercel}` : '')).replace(/\/$/, '');
  return {
    name: 'site-meta',
    transformIndexHtml(html) {
      const tags = site
        ? [
            `<link rel="canonical" href="${site}/" />`,
            `<meta property="og:url" content="${site}/" />`,
            `<meta property="og:image" content="${site}/og.jpg" />`,
            `<meta name="twitter:image" content="${site}/og.jpg" />`,
          ].join('\n    ')
        : '<meta property="og:image" content="/og.jpg" />';
      return html.replace('<!--site-meta-->', tags);
    },
  };
}

export default defineConfig({
  plugins: [react(), siteMeta()],
  build: { target: 'es2022' },
});
