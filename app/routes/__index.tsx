import { Box } from '@chakra-ui/react';
import { Outlet } from '@remix-run/react';
import Header from '~/components/header';

export default function Index() {
  return (
    <Box>
      <Header />
      <main>
        <Outlet />
      </main>
    </Box>
  );
}
