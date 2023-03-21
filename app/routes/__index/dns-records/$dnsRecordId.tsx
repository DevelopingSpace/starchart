import { Container, Heading, Text } from '@chakra-ui/react';
import { DnsRecordType } from '@prisma/client';
import { redirect, typedjson, useTypedLoaderData } from 'remix-typedjson';
import { z } from 'zod';
import { parseFormSafe } from 'zodix';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import DnsRecordForm from '~/components/dns-record/form';
import { requireUser } from '~/session.server';
import { getDnsRecordById } from '~/models/dns-record.server';
import { updateDnsRequest } from '~/queues/dns/update-dns-record-flow.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireUser(request);
  const { dnsRecordId } = params;
  if (!dnsRecordId) {
    throw new Response('dnsRecordId should be string', {
      status: 400,
    });
  }

  const dnsRecord = await getDnsRecordById(Number(dnsRecordId));
  if (!dnsRecord) {
    throw new Response('The DNS record is not found', {
      status: 404,
    });
  }

  if (dnsRecord.status !== 'active') {
    return redirect('/dns-records');
  }

  return typedjson(dnsRecord);
};

export const action = async ({ request }: ActionArgs) => {
  const user = await requireUser(request);

  const DnsRecord = z.object({
    id: z.string(),
    subdomain: z.string().min(1), // We do not want to consider '' a valid string
    type: z.nativeEnum(DnsRecordType),
    value: z.string().min(1),
    ports: z.string().optional(),
    course: z.string().optional(),
    description: z.string().optional(),
  });

  const updatedDnsRecordParams = await parseFormSafe(request, DnsRecord);

  if (updatedDnsRecordParams.success === false) {
    throw new Response(updatedDnsRecordParams.error.message, {
      status: 400,
    });
  }

  const { data } = updatedDnsRecordParams;

  await updateDnsRequest({
    id: Number(data.id),
    username: user.username,
    type: data.type,
    subdomain: data.subdomain,
    value: data.value,
  });

  return redirect(`/dns-records`);
};

export default function DnsRecordRoute() {
  const dnsRecord = useTypedLoaderData<typeof loader>();

  return (
    <Container maxW="container.xl" ml={[null, null, '10vw']}>
      <Heading as="h1" size="xl" mt="8">
        Edit DNS Record
      </Heading>
      <Text maxW="lg" mb="3" mt="2">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
        been the industry's standard dummy text ever since the 1500s
      </Text>
      <DnsRecordForm dnsRecord={dnsRecord} mode="EDIT" />
    </Container>
  );
}
