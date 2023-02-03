const { setupServer } = require('msw/node');

const server = setupServer();

server.listen({ onUnhandledRequest: 'bypass' });

// eslint-disable-next-line no-console
console.info('🔶 Mock server running');

process.once('SIGINT', () => server.close());
process.once('SIGTERM', () => server.close());
