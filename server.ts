import * as crypto from 'crypto';
import path from 'path';
import express from 'express';
import compression from 'compression';
import { createRequestHandler } from '@remix-run/express';
import gracefulShutdown from 'http-graceful-shutdown';
import helmet from 'helmet';
import cors from 'cors';

import logger from '~/lib/logger.server';
import { addReconcilerJob } from './app/queues/reconciler/reconciler-queue.server';

import type { Request, Response } from 'express';

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

// Remix fingerprints its assets so we can cache forever.
app.use('/build', express.static('public/build', { immutable: true, maxAge: '1y' }));

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static('public', { maxAge: '1h' }));

const BUILD_DIR = path.join(process.cwd(), 'build');
// Pass the nonce we're setting in the CSP headers down to the Remix Loader/Action functions
const getLoadContext = (_req: Request, res: Response) => ({ nonce: res.locals.nonce });

app.all(
  '*',
  MODE === 'production'
    ? createRequestHandler({ build: require(BUILD_DIR), getLoadContext })
    : (...args) => {
        purgeRequireCache();
        const requestHandler = createRequestHandler({
          build: require(BUILD_DIR),
          getLoadContext,
          mode: MODE,
        });
        return requestHandler(...args);
      }
);

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  // require the built app so we're ready when the first request comes in
  require(BUILD_DIR);

  // start the DNS reconciler
  addReconcilerJob();

  logger.info(`✅ app ready: http://localhost:${port}`);
});

gracefulShutdown(server, {
  development: process.env.NODE_ENV !== 'production',
});

function purgeRequireCache() {
  // purge require cache on requests for "server side HMR." NOTE: doing
  // this means that any modules that have global values will lose them
  // and get re-initialized whenever the server reloads in development.
  // Store values you need to cache on the global to survive this.
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete require.cache[key];
    }
  }
}
