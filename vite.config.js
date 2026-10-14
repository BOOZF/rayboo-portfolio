import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

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

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), devApi(mode)],
  // listen on all interfaces so phones/laptops on the same Wi-Fi can open the dev server
  server: { host: true },
  preview: { host: true },
}))
