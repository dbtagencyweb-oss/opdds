import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const contentTypes: Record<string, string> = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.mp3': 'audio/mpeg',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.wav': 'audio/wav',
  '.webp': 'image/webp',
};

function mediaDevServer(): Plugin {
  const mediaRoot = path.resolve(__dirname, '..', 'media');

  return {
    name: 'opdds-media-dev-server',
    configureServer(server) {
      server.middlewares.use('/media', (request, response, next) => {
        if (!request.url) {
          next();
          return;
        }

        const requestedPath = decodeURIComponent(request.url.split('?')[0] ?? '/');
        const filePath = path.resolve(mediaRoot, `.${requestedPath}`);

        if (!filePath.startsWith(mediaRoot) || !fs.existsSync(filePath)) {
          next();
          return;
        }

        const stat = fs.statSync(filePath);
        if (!stat.isFile()) {
          next();
          return;
        }

        response.setHeader('Content-Type', contentTypes[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream');
        response.setHeader('Accept-Ranges', 'bytes');

        const range = request.headers.range;
        if (range) {
          const match = range.match(/bytes=(\d*)-(\d*)/);
          const start = match?.[1] ? Number(match[1]) : 0;
          const end = match?.[2] ? Number(match[2]) : stat.size - 1;
          const safeEnd = Math.min(end, stat.size - 1);

          if (start >= stat.size || safeEnd < start) {
            response.statusCode = 416;
            response.setHeader('Content-Range', `bytes */${stat.size}`);
            response.end();
            return;
          }

          response.statusCode = 206;
          response.setHeader('Content-Range', `bytes ${start}-${safeEnd}/${stat.size}`);
          response.setHeader('Content-Length', String(safeEnd - start + 1));
          fs.createReadStream(filePath, { start, end: safeEnd }).pipe(response);
          return;
        }

        response.setHeader('Content-Length', String(stat.size));
        fs.createReadStream(filePath).pipe(response);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 5173,
      host: '127.0.0.1',
    },
    plugins: [mediaDevServer(), react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
    },
  };
});
