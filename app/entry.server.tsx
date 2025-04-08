import { PassThrough } from 'stream';
import type { EntryContext } from '@remix-run/node';
import { createReadableStreamFromReadable } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import logger from '~/lib/logger.server';
import { renderToPipeableStream } from 'react-dom/server';
import createEmotionServer from '@emotion/server/create-instance';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from './createEmotionCache';
import { createExpressApp } from 'remix-create-express-app';
import * as crypto from 'crypto';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import express from 'express';
import * as services from 'services';

import type { Application, Request as ExpressRequest, Response as ExpressResponse } from 'express';

const ABORT_DELAY = 5000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const callbackName = isbot(request.headers.get('user-agent')) ? 'onAllReady' : 'onShellReady';

  return new Promise((resolve, reject) => {
    let didError = false;
    const emotionCache = createEmotionCache();

    const { pipe, abort } = renderToPipeableStream(
      <CacheProvider value={emotionCache}>
        <RemixServer context={remixContext} url={request.url} />
      </CacheProvider>,
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          const emotionServer = createEmotionServer(emotionCache);

          const bodyWithStyles = emotionServer.renderStylesToNodeStream();
          body.pipe(bodyWithStyles);

          responseHeaders.set('Content-Type', 'text/html');

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError: (err: unknown) => {
          reject(err);
        },
        onError: (error: unknown) => {
          didError = true;

          logger.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

export const app = createExpressApp({
  configure: (app: Application) => {
    // setup additional express middleware here
    const MODE = process.env.NODE_ENV;

    app.use(compression());
    app.use(cors());
    app.use(
      helmet({
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            // Expect a nonce on scripts
            scriptSrc: [
              "'self'",
              (_req, res) => `'nonce-${(res as ExpressResponse).locals.nonce}'`,
            ],
            // Allow live reload to work over a web socket in development
            connectSrc: MODE === 'production' ? ["'self'"] : ["'self'", 'ws:'],
            // Don't force https unless in production
            upgradeInsecureRequests: MODE === 'production' ? [] : null,
          },
        },
      })
    );

    // Remix fingerprints its assets so we can cache forever.
    app.use('/build', express.static('build/client', { immutable: true, maxAge: '1y' }));

    // Everything else (like favicon.ico) is cached for an hour. You may want to be
    // more aggressive with this caching.
    app.use(express.static('public', { maxAge: '1h' }));

    app.use((_req, res, next) => {
      res.locals.nonce = crypto.randomBytes(16).toString('hex');
      next();
    });
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
  },
  // Pass the nonce we're setting in the CSP headers down to the Remix Loader/Action functions
  getLoadContext: (_req: ExpressRequest, res: ExpressResponse) => ({ nonce: res.locals.nonce }),
  createServer: (app: Application) => {
    const port = process.env.PORT || 8080;

    return app.listen(port, async () => {
      // start the various background jobs we run (reconciler, expire records, etc)
      await services.init();
      logger.info(`✅ app ready: http://localhost:${port}`);
    });
  },
});
