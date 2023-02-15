import path from 'path';
import express from 'express';
import compression from 'compression';
import { createRequestHandler } from '@remix-run/express';
import gracefulShutdown from 'http-graceful-shutdown';
import helmet from 'helmet';
import cors from 'cors';

import logger from '~/lib/logger.server';
import { notificationsWorker } from '~/queues/notifications.server';
import {
  orderCreatorWorker,
  dnsWaiterWorker,
  challengeCompleterWorker,
  orderCompleterWorker,
  dnsCleanerWorker,
} from '~/queues/certificate/certificate-flow.server';

const app = express();

app.use(
  helmet({
    // Disable CSP in development so that hot-reloads (e.g., inline scripts)
    // work, but use the default CSP config in production
    contentSecurityPolicy:
      process.env.NODE_ENV === 'production'
        ? { directives: helmet.contentSecurityPolicy.getDefaultDirectives() }
        : {
            directives: {
              scriptSrc: ["'self'", "'unsafe-inline'"],
              connectSrc: ["'self'", 'ws:'],
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

const MODE = process.env.NODE_ENV;
const BUILD_DIR = path.join(process.cwd(), 'build');

app.all(
  '*',
  MODE === 'production'
    ? createRequestHandler({ build: require(BUILD_DIR) })
    : (...args) => {
        purgeRequireCache();
        const requestHandler = createRequestHandler({
          build: require(BUILD_DIR),
          mode: MODE,
        });
        return requestHandler(...args);
      }
);

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  // require the built app so we're ready when the first request comes in
  require(BUILD_DIR);
  logger.info(`✅ app ready: http://localhost:${port}`);
});

gracefulShutdown(server, {
  forceExit: true,
  development: process.env.NODE_ENV !== 'production',
  onShutdown: async function (signal) {
    logger.info(`Received ${signal}, starting shutdown...`);
    try {
      await Promise.all([
        notificationsWorker.close(),
        orderCreatorWorker.close(),
        dnsWaiterWorker.close(),
        challengeCompleterWorker.close(),
        orderCompleterWorker.close(),
        dnsCleanerWorker.close(),
      ]);
    } catch (err) {
      logger.warn('Error closing database connections', err);
    }
  },
  finally: function () {
    logger.info('Graceful shutdown complete');
  },
});

function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, we prefer the DX of this though, so we've included it
  // for you by default
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete require.cache[key];
    }
  }
}
