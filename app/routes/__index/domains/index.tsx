import { useMemo } from 'react';
import { AddIcon } from '@chakra-ui/icons';
import { Button, Container, Flex, Heading, Text } from '@chakra-ui/react';
import { Link, useRevalidator } from '@remix-run/react';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import { json } from '@remix-run/node';
import { z } from 'zod';
import { parseFormSafe } from 'zodix';
import { useInterval } from 'react-use';
import DnsRecordsTable from '~/components/domains-table';
import { getRecordById, getRecordsByUsername, renewDnsRecordById } from '~/models/record.server';
import { requireUsername } from '~/session.server';
import { deleteDnsRequest } from '~/queues/dns/delete-record-flow.server';
import logger from '~/lib/logger.server';

import type { LoaderArgs, ActionArgs } from '@remix-run/node';

export type DomainActionIntent = 'renew-record' | 'delete-record';

export const loader = async ({ request }: LoaderArgs) => {
  const username = await requireUsername(request);

  return typedjson(await getRecordsByUsername(username));
};

export const action = async ({ request }: ActionArgs) => {
  const username = await requireUsername(request);

  const dnsRecordActionParams = await parseFormSafe(
    request,
    z.object({
      id: z.string(),
      intent: z.enum(['renew-record', 'delete-record']),
    })
  );

  if (dnsRecordActionParams.success === false) {
    throw new Response(dnsRecordActionParams.error.message, {
      status: 400,
    });
  }

  const { id, intent } = dnsRecordActionParams.data;

  const recordID = Number(id);
  const record = await getRecordById(recordID);

  if (!record) {
    throw new Response('The record is not found', {
      status: 404,
    });
  }

  if (record.status !== 'active') {
    throw new Response('Record is not active, action forbidden', {
      status: 409,
    });
  }

  switch (intent) {
    case 'renew-record':
      await renewDnsRecordById(record.id);
      return json({
        result: 'ok',
        message: 'DNS record was renewed',
      });
    case 'delete-record':
      deleteDnsRequest({
        username,
        type: record.type,
        subdomain: record.subdomain,
        value: record.value,
        id: record.id,
      });
      return json({
        result: 'ok',
        message: 'Deleting DNS record is requested',
      });
    default:
      logger.warn('Unknown intent', intent);
      return json({ result: 'error', message: 'Unknown intent' });
  }
};

export default function DomainsIndexRoute() {
  const revalidator = useRevalidator();
  const dnsRecords = useTypedLoaderData<typeof loader>();
  const pending = useMemo(
    () => dnsRecords.some((dnsRecord) => dnsRecord.status === 'pending'),
    [dnsRecords]
  );

  // Check to see if any change is pending, and if so, reload every 5s until finished
  useInterval(
    () => {
      revalidator.revalidate();
    },
    pending ? 5_000 : null
  );

  return (
    <Container maxW="container.xl">
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
          <Link to="/domains/new">
            <Button rightIcon={<AddIcon boxSize={3} />}>Create new domain</Button>
          </Link>
        </Flex>
        <DnsRecordsTable dnsRecords={dnsRecords} />
      </Flex>
    </Container>
  );
}
