import { Box, Container } from '@chakra-ui/react';
import { Outlet, useCatch } from '@remix-run/react';
import SeenErrorLayout from '~/components/errors/seen-error-layout';
import UnseenErrorLayout from '~/components/errors/unseen-error-layout';
import Header from '~/components/header';

export default function Index() {
  return (
    <Box>
      <Header />
      <main>
        <Container maxW="container.xl" px={{ base: 4, md: 45 }}>
          <Outlet />
        </Container>
      </main>
    </Box>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <UnseenErrorLayout errorText={`Unexpected error: ${error.message}`} />;
}

export function CatchBoundary() {
  const caught = useCatch();

  return <SeenErrorLayout result={caught} />;
}
