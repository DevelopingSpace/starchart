import { Box, Container } from '@chakra-ui/react';
import { Outlet } from '@remix-run/react';
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
