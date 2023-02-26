import { AddIcon } from '@chakra-ui/icons';
import { Button, Container, Flex, Heading, Text } from '@chakra-ui/react';
import type { LoaderArgs, ActionArgs } from '@remix-run/node';
import { Link, useNavigate, useSubmit, useTransition } from '@remix-run/react';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import type { DomainsTableAction } from '~/components/domains-table';
import DomainsTable from '~/components/domains-table';
import { getRecordsByUsername } from '~/models/record.server';
import { requireUsername } from '~/session.server';
import type { Record } from '@prisma/client';

export const loader = async ({ request }: LoaderArgs) => {
  const username = await requireUsername(request);

  return typedjson(await getRecordsByUsername(username));
};

export const action = async ({ request }: ActionArgs) => {
  if (request.method === 'PUT') {
    // TODO: Call the appropriate code to prolong record
  } else if (request.method === 'DELETE') {
    // TODO: Call the appropriate code to delete record
  }

  return null;
};

export default function DomainsIndexRoute() {
  const domains = useTypedLoaderData<typeof loader>();
  const navigate = useNavigate();
  const submit = useSubmit();
  const transition = useTransition();

  function onDomainAction(domain: Record, action: DomainsTableAction) {
    switch (action) {
      case 'EDIT':
        navigate(domain.id.toString());
        break;
      case 'DELETE':
        submit({ id: domain.id.toString() }, { method: 'delete' });
        break;
      case 'RENEW':
        submit({ id: domain.id.toString() }, { method: 'put' });
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
      <Flex justifyContent="flex-end">
        <Link to="/domains/new">
          <Button rightIcon={<AddIcon boxSize={3} />}>Create new domain</Button>
        </Link>
      </Flex>
      <DomainsTable domains={domains} onAction={onDomainAction} transition={transition} />
    </Container>
  );
}
