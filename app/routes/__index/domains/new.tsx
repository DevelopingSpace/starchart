import { Container, Heading, Text } from '@chakra-ui/react';
import { json, redirect } from '@remix-run/node';

import DnsRecordForm from '~/components/dns-record/form';
import { createRecord } from '~/models/record.server';
import { getUsername } from '~/session.server';

import type { ActionArgs } from '@remix-run/node';
import { RecordType } from '@prisma/client';

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();
  const name = form.get('name')?.toString();
  const type = form.get('type')?.toString();
  const value = form.get('value')?.toString();
  const ports = form.get('ports')?.toString();
  const course = form.get('course')?.toString();
  const description = form.get('description')?.toString();
  const username = await getUsername(request);

  if (!username || !name || !value || !type || !(type in RecordType)) {
    return json({ status: 'error' }, { status: 400 });
  }

  const record = await createRecord(
    username,
    name,
    RecordType[type as keyof typeof RecordType],
    value,
    'pending',
    description,
    course,
    ports
  );

  return redirect(`/domains/${record.id}`);
};

export default function NewDomainRoute() {
  return (
    <Container maxW="container.xl" ml={[null, null, '10vw']}>
      <Heading as="h1" size="xl" mt="8">
        Create new domain
      </Heading>
      <Text maxW="lg" mb="3" mt="2">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
        been the industry's standard dummy text ever since the 1500s
      </Text>
      <DnsRecordForm />
    </Container>
  );
}
