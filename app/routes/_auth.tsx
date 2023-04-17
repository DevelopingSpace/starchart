import { Flex, Container } from '@chakra-ui/react';
import { Outlet, isRouteErrorResponse, useRouteError } from '@remix-run/react';
import SeenErrorLayout from '~/components/errors/seen-error-layout';
import UnseenErrorLayout from '~/components/errors/unseen-error-layout';
import Header from '~/components/header';
import Footer from '~/components/footer';

export default function Index() {
  return (
    <Flex flexDir="column">
      <Header />
      <main>
        <Container flex="1" maxW="container.xl" px={{ base: 4, md: 45 }} minHeight="100vh">
          <Outlet />
        </Container>
      </main>
      <Footer />
    </Flex>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return <SeenErrorLayout result={error} />;
  }

  if (error instanceof Error) {
    return <UnseenErrorLayout errorText={`Unexpected error: ${error.message}`} />;
  }

  return <UnseenErrorLayout errorText={'Unexpected error'} />;
}
