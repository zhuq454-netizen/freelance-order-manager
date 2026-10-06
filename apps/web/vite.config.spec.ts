import { createServer as createHttpServer } from 'node:http';

import { createServer as createViteServer } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';

const webRoot = process.cwd();

describe('Vite development server', () => {
  const originalProxyTarget = process.env.VITE_API_PROXY_TARGET;

  afterEach(() => {
    if (originalProxyTarget === undefined) {
      delete process.env.VITE_API_PROXY_TARGET;
    } else {
      process.env.VITE_API_PROXY_TARGET = originalProxyTarget;
    }
  });

  it('proxies same-origin API requests to the local API server', async () => {
    const apiServer = createHttpServer((request, response) => {
      if (request.url !== '/api/health/live') {
        response.writeHead(404).end();
        return;
      }

      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ status: 'ok', service: 'api' }));
    });
    await new Promise<void>((resolve) => apiServer.listen(0, '127.0.0.1', resolve));

    const apiAddress = apiServer.address();
    if (!apiAddress || typeof apiAddress === 'string') {
      throw new Error('The test API server did not expose a TCP port.');
    }
    process.env.VITE_API_PROXY_TARGET = `http://127.0.0.1:${apiAddress.port}`;

    const viteServer = await createViteServer({
      configFile: `${webRoot}/vite.config.ts`,
      root: webRoot,
      server: { host: '127.0.0.1', port: 0 },
    });

    try {
      await viteServer.listen();
      const viteAddress = viteServer.httpServer?.address();
      if (!viteAddress || typeof viteAddress === 'string') {
        throw new Error('The Vite server did not expose a TCP port.');
      }

      const response = await fetch(`http://127.0.0.1:${viteAddress.port}/api/health/live`, {
        headers: { Accept: 'application/json' },
      });

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        status: 'ok',
        service: 'api',
      });
    } finally {
      await viteServer.close();
      await new Promise<void>((resolve, reject) =>
        apiServer.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });
});
