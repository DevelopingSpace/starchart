import * as crypto from 'crypto';
import express from 'express';
import compression from 'compression';
import { createRequestHandler } from '@remix-run/express';
import { installGlobals, ServerBuild } from '@remix-run/node';
import gracefulShutdown from 'http-graceful-shutdown';
import helmet from 'helmet';
import cors from 'cors';

import logger from '~/lib/logger.server';
import * as services from 'services';

import type { Request, Response } from 'express';

installGlobals();

const viteDevServer =
  process.env.NODE_ENV === 'production'
    ? undefined
    : await import('vite').then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );

const MODE = process.env.NODE_ENV;
const app = express();

app.use((_req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('hex');
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        // Expect a nonce on scripts
        scriptSrc: ["'self'", (_req, res) => `'nonce-${(res as Response).locals.nonce}'`],
        // Allow live reload to work over a web socket in development
        connectSrc: MODE === 'production' ? ["'self'"] : ["'self'", 'ws:'],
        // Don't force https unless in production
        upgradeInsecureRequests: MODE === 'production' ? [] : null,
      },
    },
  })
);

app.use(cors());

app.use((req, res, next) => {
  // /clean-urls/ -> /clean-urls
  if (req.path.endsWith('/') && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    const safepath = req.path.slice(0, -1).replace(/\/+/g, '/');
    res.redirect(301, safepath + query);
    return;
  }
  next();
});

app.use(compression());

// handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  // Remix fingerprints its assets so we can cache forever.
  app.use('/build', express.static('build/client', { immutable: true, maxAge: '1y' }));
}

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static('public', { maxAge: '1h' }));

// Pass the nonce we're setting in the CSP headers down to the Remix Loader/Action functions
const getLoadContext = (_req: Request, res: Response) => ({ nonce: res.locals.nonce });

// handle SSR requests
// we need to do these assertions because viteDevServer.ssrLoadModule
// returns a Promise<Record<string,any>>
app.all(
  '*',
  createRequestHandler({
    build: viteDevServer
      ? async () => {
          const mod = await viteDevServer.ssrLoadModule('virtual:remix/server-build');
          return mod as unknown as ServerBuild;
        }
      : async () => {
          // Need to disable these rules here
          // because the imported file needs to be generated first
          // @ts-ignore  eslint-disable-next-line import/no-unresolved
          const mod = await import('./build/server/index.js');
          return mod as unknown as ServerBuild;
        },
    getLoadContext,
  })
);

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  // start the various background jobs we run (reconciler, expire records, etc)
  services.init().then(() => {
    logger.info(`✅ app ready: http://localhost:${port}`);
  });
});

gracefulShutdown(server, {
  development: process.env.NODE_ENV !== 'production',
});
