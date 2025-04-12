import * as crypto from 'crypto';
import path from 'path';
import express from 'express';
import compression from 'compression';
import { createRequestHandler } from '@remix-run/express';
import { broadcastDevReady } from '@remix-run/node';
import gracefulShutdown from 'http-graceful-shutdown';
import helmet from 'helmet';
import cors from 'cors';

import logger from '~/lib/logger.server';
import * as services from 'services';

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
const build = require(BUILD_DIR);

// Pass the nonce we're setting in the CSP headers down to the Remix Loader/Action functions
const getLoadContext = (_req: Request, res: Response) => ({ nonce: res.locals.nonce });

app.all('*', createRequestHandler({ build, getLoadContext }));

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  // start the various background jobs we run (reconciler, expire records, etc)
  services.init().then(() => {
    logger.info(`✅ app ready: http://localhost:${port}`);
  });

  if (process.env.NODE_ENV === 'development') {
    broadcastDevReady(build);
  }
});

gracefulShutdown(server, {
  development: process.env.NODE_ENV !== 'production',
});
