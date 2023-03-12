import { AddIcon } from '@chakra-ui/icons';
import { Button, Container, Flex, Heading, Icon, IconButton, Text } from '@chakra-ui/react';
import type { LoaderArgs, ActionArgs } from '@remix-run/node';
import { Link, useNavigate, useSubmit, useTransition } from '@remix-run/react';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import { FaRedoAlt } from 'react-icons/fa';
import type { DomainsTableAction } from '~/components/domains-table';
import DomainsTable from '~/components/domains-table';
import { getRecordById, getRecordsByUsername } from '~/models/record.server';
import { requireUsername } from '~/session.server';
import type { Record } from '@prisma/client';
import { addDnsRequest, deleteDnsRequest, updateDnsRequest } from '~/queues/dns/dns-flow.server';
import invariant from 'tiny-invariant';
import { json } from '@remix-run/node';
import logger from '~/lib/logger.server';

export const loader = async ({ request }: LoaderArgs) => {
  const username = await requireUsername(request);

  return typedjson(await getRecordsByUsername(username));
};

export const action = async ({ request }: ActionArgs) => {
  const username = await requireUsername(request);
  const formData = await request.formData();
  const intent = formData.get('intent');
  const id = formData.get('id');
  invariant(intent, 'Missing `intent` in posted form data');
  invariant(id, 'Missing `id` in posted form data');

  const recordID = Number(id);
  const record = await getRecordById(recordID);

  if (!record) {
    throw new Response('The record is not found', {
      status: 404,
    });
  }

  switch (intent) {
    case 'renew-record':
      await updateDnsRequest({
        id: recordID,
        type: record.type,
        name: record.name,
        value: record.value,
        username,
      });
      return json({
        result: 'ok',
        message: 'DNS record was renewed',
      });
    case 'delete-record':
      await deleteDnsRequest({
        id: recordID,
        type: record.type,
        name: record.name,
        value: record.value,
        username,
      });
      return json({
        result: 'ok',
        message: 'DNS record was deleted',
      });
    default:
      logger.warn('Unknown intent', intent);
      return json({ result: 'error', message: 'Unknown intent' });
  }
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
        submit({ id: domain.id.toString(), intent: 'delete-record' }, { method: 'delete' });
        break;
      case 'RENEW':
        submit({ id: domain.id.toString(), intent: 'renew-record' }, { method: 'put' });
        break;
    }
  }

  return (
    <Container maxW="contianer.xl">
      <Flex flexDirection="column">
        <Heading as="h1" size="xl" mt="20">
          Domains
        </Heading>
        <Text maxW="container.sm" mb="4" mt="2">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
          been the industry's standard dummy text ever since the 1500s, when an unknown printer took
          a galley of type and scrambled it to make a type specimen book.
        </Text>
        <Flex justifyContent="flex-end">
          <form method="get">
            <Button rightIcon={<Icon as={FaRedoAlt} />} sx={{ mr: '2' }} type="submit">
              Reload domains
            </Button>
          </form>
          <Link to="/domains/new">
            <Button rightIcon={<AddIcon boxSize={3} />}>Create new domain</Button>
          </Link>
        </Flex>
        <DomainsTable domains={domains} onAction={onDomainAction} transition={transition} />
      </Flex>
    </Container>
  );
}
