import { AddIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Button,
  IconButton,
  Center,
  Container,
  Flex,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  Tooltip,
  Link as ExternalLink,
} from '@chakra-ui/react';
import { Link } from '@remix-run/react';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import { json } from '@remix-run/node';
import { z } from 'zod';
import { parseFormSafe } from 'zodix';
import DnsRecordsTable from '~/components/dns-records-table';
import {
  getDnsRecordById,
  getDnsRecordsByUsername,
  renewDnsRecordById,
  deleteDnsRecordById,
  getDnsRecordCountByUsername,
} from '~/models/dns-record.server';
import { requireUsername } from '~/session.server';
import logger from '~/lib/logger.server';

import type { LoaderArgs, ActionArgs } from '@remix-run/node';

export type DnsRecordActionIntent = 'renew-dns-record' | 'delete-dns-record';

export const loader = async ({ request }: LoaderArgs) => {
  const username = await requireUsername(request);

  return typedjson({
    dnsRecords: await getDnsRecordsByUsername(username),
    userDnsRecordCount: await getDnsRecordCountByUsername(username),
    userDnsRecordLimit: process.env.USER_DNS_RECORD_LIMIT ?? 'unlimited',
  });
};

export const action = async ({ request }: ActionArgs) => {
  await requireUsername(request);

  const dnsRecordActionParams = await parseFormSafe(
    request,
    z.object({
      id: z.string(),
      intent: z.enum(['renew-dns-record', 'delete-dns-record']),
    })
  );

  if (dnsRecordActionParams.success === false) {
    throw new Response(dnsRecordActionParams.error.message, {
      status: 400,
    });
  }

  const { id, intent } = dnsRecordActionParams.data;

  const dnsRecordID = Number(id);
  const dnsRecord = await getDnsRecordById(dnsRecordID);

  if (!dnsRecord) {
    throw new Response('The DNS record is not found', {
      status: 404,
    });
  }

  switch (intent) {
    case 'renew-dns-record':
      await renewDnsRecordById(dnsRecord.id);
      return json({
        result: 'ok',
        message: 'DNS record was renewed',
      });
    case 'delete-dns-record':
      await deleteDnsRecordById(dnsRecord.id);
      return json({
        result: 'ok',
        message: 'Deleting DNS record is requested',
      });
    default:
      logger.warn('Unknown intent', intent);
      return json({ result: 'error', message: 'Unknown intent' });
  }
};

export default function DnsRecordsIndexRoute() {
  const data = useTypedLoaderData<typeof loader>();

  return (
    <Container maxW="container.xl">
      <Flex flexDirection="column">
        <Heading as="h1" size="xl" mt="20">
          DNS Records
        </Heading>
        <Text mb="4" mt="2">
          This table shows all of the DNS records that you have created. Once you create a new
          record, you will immediately see that new record in the table. However, it will take some
          time to go into effect as your new domain needs to be spread in DNS servers around the
          globe. The expiration date is initially set to 6 months after the creation date and you
          can renew the DNS record using the renew button next to the expiry date.
        </Text>
        {data.dnsRecords.length ? (
          <>
            <Flex
              justifyContent="space-between"
              maxW="container.xl"
              alignItems="center"
              px={4}
              py={2}
            >
              <Stat>
                <StatLabel>Total User DNS Records</StatLabel>
                <StatNumber>
                  {data.userDnsRecordCount} / {data.userDnsRecordLimit}
                </StatNumber>
              </Stat>
              <Link to="/dns-records/new">
                <Button rightIcon={<AddIcon boxSize={3} />}>Create new DNS Record</Button>
              </Link>
              <ExternalLink href="https://dnschecker.org">
                <Tooltip label="DNS checker">
                  <IconButton
                    ml={3}
                    icon={<ExternalLinkIcon boxSize={5} />}
                    aria-label="DNS checker"
                    variant="ghost"
                  />
                </Tooltip>
              </ExternalLink>
            </Flex>
            <DnsRecordsTable dnsRecords={data.dnsRecords} />
          </>
        ) : (
          <Center mt="16">
            <Link to="/dns-records/new">
              <Button rightIcon={<AddIcon boxSize={3} />}>Create your first DNS Record!</Button>
            </Link>
          </Center>
        )}
      </Flex>
    </Container>
  );
}
