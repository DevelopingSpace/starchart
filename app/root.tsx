import { ChakraProvider, chakra } from '@chakra-ui/react';
import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';

import { getUser } from './session.server';
import theme from './theme';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Starchart',
  viewport: 'width=device-width,initial-scale=1',
});

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await getUser(request),
  });
}

function Document({ children }: { children: React.ReactNode }) {
  return (
    <chakra.html lang="en" minHeight="full">
      <head>
        <Meta />
        <Links />
      </head>
      <chakra.body minHeight="full">
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </chakra.body>
    </chakra.html>
  );
}

export default function App() {
  return (
    <Document>
      <ChakraProvider theme={theme}>
        <Outlet />
      </ChakraProvider>
    </Document>
  );
}
