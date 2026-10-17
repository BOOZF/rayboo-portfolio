import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import { FAQ } from './src/content/faq.js'
import { FAQ as FAQ_ZH } from './src/content/faq.zh.js'

// Serves api/*.js in `npm run dev` the way Vercel does in production, with .env loaded server-side only.
const devApi = mode => ({
  name:'dev-api',
  configureServer(server) {
    Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
    server.middlewares.use('/api/', async (req, res) => {
      const name = req.url.split('?')[0].replace(/^\/+/, '');
      if (!/^[a-z-]+$/.test(name)) { res.statusCode = 404; return res.end(); }
      let raw = '';
      for await (const chunk of req) raw += chunk;
      try { req.body = raw ? JSON.parse(raw) : undefined; } catch { req.body = undefined; }
      let handler;
      try { ({ default: handler } = await server.ssrLoadModule(`/api/${name}.js`)); } catch { res.statusCode = 404; return res.end(); }
      await handler(req, res);
    });
  },
})

// every HTML page besides the English home (index.html); Chinese pages mirror the English ones under /zh
const PAGES = ['faq', 'privacy', 'zh', 'zh/faq', 'zh/privacy'];
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Static text pages for search engines: fills faq.html and zh/faq.html from src/content/faq*.js (visible Q&A +
// FAQPage JSON-LD), and in dev serves /faq, /zh, /zh/faq … the way Vercel's cleanUrls does in production.
const cleanUrls = (req, _res, next) => {
  const path = req.url.split('?')[0].replace(/\/$/, '');
  if (PAGES.includes(path.slice(1))) req.url = path + '.html';
  next();
};
const seoPages = () => ({
  name:'seo-pages',
  configureServer(server) { server.middlewares.use(cleanUrls); },
  configurePreviewServer(server) { server.middlewares.use(cleanUrls); },
  transformIndexHtml(html, ctx) {
    if (!html.includes('<!--FAQ_ITEMS-->')) return html;
    const faq = /(^|\/)zh\//.test(ctx.path || ctx.filename || '') ? FAQ_ZH : FAQ;
    const items = faq.map(({ q, a }) => `<section class="qa"><h2>${esc(q)}</h2>${a.split('\n\n').map(p => `<p>${esc(p)}</p>`).join('')}</section>`).join('\n        ');
    const ld = { '@context':'https://schema.org', '@type':'FAQPage', mainEntity:faq.map(({ q, a }) => ({ '@type':'Question', name:q, acceptedAnswer:{ '@type':'Answer', text:a.replace(/\n\n/g, ' ') } })) };
    return html.replace('<!--FAQ_ITEMS-->', items)
      .replace('<!--FAQ_JSONLD-->', `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`);
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), devApi(mode), seoPages()],
  // the e2e server keeps its own dependency cache: two dev servers sharing one re-optimise it under each other and stall page loads
  cacheDir: mode === 'e2e' ? 'node_modules/.vite-e2e' : undefined,
  build: {
    // hashed build output gets its own folder so it can be cached forever, apart from the un-hashed models in /assets
    assetsDir: '_app',
    chunkSizeWarningLimit: 800, // three.js alone is ~700 kB; it loads as its own chunk after the page has painted
    rollupOptions: { input: { main: resolve(import.meta.dirname, 'index.html'), ...Object.fromEntries(PAGES.map(p => [p, resolve(import.meta.dirname, p + '.html')])) } },
  },
  // listen on all interfaces so phones/laptops on the same Wi-Fi can open the dev server
  server: { host: true },
  preview: { host: true },
}))
