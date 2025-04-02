import { AddIcon } from '@chakra-ui/icons';
import {
  Button,
  Center,
  Flex,
  Heading,
  Stat,
  Text,
  Link,
  useBreakpointValue,
  Show,
} from '@chakra-ui/react';
import { Link as RemixLink, isRouteErrorResponse, useRouteError } from '@remix-run/react';
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

import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import SeenErrorLayout from '~/components/errors/seen-error-layout';
import UnseenErrorLayout from '~/components/errors/unseen-error-layout';
import { getErrorMessageFromStatusCode } from '~/utils';

export type DnsRecordActionIntent = 'renew-dns-record' | 'delete-dns-record';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const username = await requireUsername(request);

  return typedjson({
    dnsRecords: await getDnsRecordsByUsername(username),
    userDnsRecordCount: await getDnsRecordCountByUsername(username),
    userDnsRecordLimit: process.env.USER_DNS_RECORD_LIMIT ?? 'unlimited',
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
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

function mapStatusToErrorText(statusCode: number): string {
  switch (statusCode) {
    case 404:
      return 'Sorry we could not find your DNS Record';
    case 400:
      return 'We got an error processing requested action on your DNS Record';
    default:
      return getErrorMessageFromStatusCode(statusCode);
  }
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return <SeenErrorLayout result={error} mapStatusToErrorText={mapStatusToErrorText} />;
  }

  return (
    <UnseenErrorLayout errorText="We got an unexpected error working with your DNS Records, but don't worry our team is already on it's way to fix it" />
  );
}

export default function DnsRecordsIndexRoute() {
  const data = useTypedLoaderData<typeof loader>();

  const isBelowSm = useBreakpointValue({ base: true, sm: false });

  return (
    <Flex flexDirection="column">
      <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mt={{ base: 6, md: 12 }}>
        DNS Records
      </Heading>
      <Text mb="4" mt="2" maxW={600}>
        This table shows all of the DNS records that you have created. Once you create a new record,
        you will immediately see that new record in the table. However, it will take some time to go
        into effect as your new domain needs to be spread in DNS servers around the globe. The
        expiration date is initially set to 6 months after the creation date and you can renew the
        DNS record using the renew button next to the expiry date. For more info refer to our{' '}
        <Link asChild>
          <RemixLink to={{ pathname: '/dns-records/instructions' }}>instructions page.</RemixLink>
        </Link>
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
            <Stat.Root>
              <Stat.Label>Total User DNS Records</Stat.Label>
              <Stat.ValueText>
                {data.userDnsRecordCount} / {data.userDnsRecordLimit}
              </Stat.ValueText>
            </Stat.Root>
            <RemixLink to="/dns-records/new">
              <Show when={isBelowSm}>
                <Button>
                  New <AddIcon boxSize={3} />
                </Button>
              </Show>
              <Show when={!isBelowSm}>
                <Button>
                  Create new DNS Record <AddIcon boxSize={3} />
                </Button>
              </Show>
            </RemixLink>
          </Flex>
          <DnsRecordsTable dnsRecords={data.dnsRecords} />
        </>
      ) : (
        <Center mt="16">
          <RemixLink to="/dns-records/new">
            <Button>
              Create your first DNS Record! <AddIcon boxSize={3} />
            </Button>
          </RemixLink>
        </Center>
      )}
    </Flex>
  );
}
