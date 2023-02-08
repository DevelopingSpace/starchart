import { Outlet } from '@remix-run/react';

import Header from '~/components/header';

export default function CertificatesRoute() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
