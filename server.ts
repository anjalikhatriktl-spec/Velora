import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { registerRoutes } from './server/routes.ts';
import { getDatabase, UPLOADS_DIR } from './server/store.ts';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Ensure initial DB state and uploads folder are ready
  getDatabase();
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  app.use(express.json({ limit: '8mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  registerRoutes(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VELORA server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start VELORA server:', err);
  process.exit(1);
});
