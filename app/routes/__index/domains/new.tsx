import { Container, Heading, Text } from '@chakra-ui/react';
import { RecordType } from '@prisma/client';
import { z } from 'zod';
import { parseFormSafe } from 'zodix';
import { redirect, typedjson, useTypedActionData } from 'remix-typedjson';

import DnsRecordForm from '~/components/dns-record/form';
import { requireUser } from '~/session.server';

import type { ActionArgs } from '@remix-run/node';
import type { ZodError } from 'zod';
import { addDnsRequest } from '~/queues/dns/dns-flow.server';

function errorForField(error: ZodError, field: string) {
  return error.issues.find((issue) => issue.path[0] === field)?.message;
}

export const action = async ({ request }: ActionArgs) => {
  const user = await requireUser(request);

  // Create a Zod schema for validation
  // Optional is not needed as we get '' if nothing is entered
  const DnsRecord = z.object({
    name: z.string().min(1), // We do not want to consider '' a valid string
    type: z.nativeEnum(RecordType),
    value: z.string().min(1),
    ports: z.string(),
    course: z.string(),
    description: z.string(),
  });

  const newDnsRecordParams = await parseFormSafe(request, DnsRecord);

  // If validations failed, we return the errors to show on the form
  // Currently only returns 'type' field errors as no other validations exist
  // Also, form cannot be submitted without required values
  if (newDnsRecordParams.success === false) {
    return typedjson({
      typeError: errorForField(newDnsRecordParams.error, 'type'),
    });
  }

  // Update the DNS record's name with the user's full base domain.
  // In the UI, we only ask the user to give us the first part of
  // the domain name (e.g., `foo` in `foo.username.root.com`).
  const { data } = newDnsRecordParams;

  // Create a pending record... for now
  // This will most likely be replaced by some other logic
  await addDnsRequest({
    username: user.username,
    type: data.type,
    name: data.name,
    value: data.value,
  });

  return redirect(`/domains`);
};

export default function NewDomainRoute() {
  const errors = useTypedActionData<typeof action>();

  return (
    <Container maxW="container.xl" ml={[null, null, '10vw']}>
      <Heading as="h1" size="xl" mt="8">
        Create new DNS Record
      </Heading>
      <Text maxW="lg" mb="3" mt="2">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
        been the industry's standard dummy text ever since the 1500s
      </Text>
      <DnsRecordForm {...errors} />
    </Container>
  );
}
