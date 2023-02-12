import { Container, Heading } from '@chakra-ui/react';
import { useNavigate } from '@remix-run/react';
import type { DomainsTableAction } from '~/components/domains-table';
import DomainsTable from '~/components/domains-table';
import DOMAINS_MOCK from '~/mocks/domains';

export default function DomainsIndexRoute() {
  const navigate = useNavigate();

  function onDomainAction(domainID: number, action: DomainsTableAction) {
    switch (action) {
      case 'EDIT':
        navigate(domainID.toString());
        break;
      case 'DELETE':
        // TODO: implement delete functionaty
        break;
      case 'RENEW':
        // TODO: implement renew functionaty
        break;
    }
  }

  return (
    <Container maxW="contianer.xl">
      <Heading as="h1" size="2xl" mt="8">
        Domains List
      </Heading>
      <DomainsTable domains={DOMAINS_MOCK} onAction={onDomainAction} />
    </Container>
  );
}
