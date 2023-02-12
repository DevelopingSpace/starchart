import { Container, Heading, Text } from '@chakra-ui/react';
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
      <Heading as="h1" size="xl" mt="8">
        Domains
      </Heading>
      <Text maxW="container.sm" mb="4" mt="2">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
        been the industry's standard dummy text ever since the 1500s, when an unknown printer took a
        galley of type and scrambled it to make a type specimen book.
      </Text>
      <DomainsTable domains={DOMAINS_MOCK} onAction={onDomainAction} />
    </Container>
  );
}
