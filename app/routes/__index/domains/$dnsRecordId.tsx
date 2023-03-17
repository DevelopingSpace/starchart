import { Container, Heading, Text } from '@chakra-ui/react';
import { RecordType } from '@prisma/client';
import { redirect, typedjson, useTypedLoaderData } from 'remix-typedjson';
import { z } from 'zod';
import { parseFormSafe } from 'zodix';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import DnsRecordForm from '~/components/dns-record/form';
import { updateDnsRequest } from '~/queues/dns/dns-flow.server';
import { requireUser } from '~/session.server';
import { getRecordById } from '~/models/record.server';

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireUser(request);
  const { dnsRecordId } = params;
  if (!dnsRecordId) {
    throw new Response('dnsRecordId should be string', {
      status: 400,
    });
  }

  const record = await getRecordById(Number(dnsRecordId));
  if (!record) {
    throw new Response('The record is not found', {
      status: 404,
    });
  }

  return typedjson(record);
};

export const action = async ({ request }: ActionArgs) => {
  const user = await requireUser(request);

  const DnsRecord = z.object({
    id: z.string(),
    name: z.string().min(1), // We do not want to consider '' a valid string
    type: z.nativeEnum(RecordType),
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
    name: data.name,
    value: data.value,
  });

  return redirect(`/domains`);
};

export default function DomainRoute() {
  const record = useTypedLoaderData<typeof loader>();

  return (
    <Container maxW="container.xl" ml={[null, null, '10vw']}>
      <Heading as="h1" size="xl" mt="8">
        Edit DNS Record
      </Heading>
      <Text maxW="lg" mb="3" mt="2">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
        been the industry's standard dummy text ever since the 1500s
      </Text>
      <DnsRecordForm defaultDnsRecord={record} mode="EDIT" />
    </Container>
  );
}
