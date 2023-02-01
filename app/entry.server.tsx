import { PassThrough } from 'stream';
import type { EntryContext } from '@remix-run/node';
import { Response } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import isbot from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';
import createEmotionServer from '@emotion/server/create-instance';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from './createEmotionCache';

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
               const emotionServer = createEmotionServer(emotionCache);

               const bodyWithStyles = emotionServer.renderStylesToNodeStream();
               body.pipe(bodyWithStyles);

               responseHeaders.set('Content-Type', 'text/html');

               resolve(
                  new Response(body, {
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

               console.error(error);
            },
         }
      );

      setTimeout(abort, ABORT_DELAY);
   });
}
