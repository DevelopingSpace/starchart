import { Container, Heading, Text } from '@chakra-ui/react';
import { parseFormSafe } from 'zodix';
import { redirect } from 'remix-typedjson';

import DnsRecordForm from '~/components/dns-record/form';
import { requireUser } from '~/session.server';
import { addDnsRequest } from '~/queues/dns/add-dns-record-flow.server';

import type { ActionArgs } from '@remix-run/node';
import { DnsRecordSchema } from '~/lib/dns.server';
import { useActionData } from '@remix-run/react';

export const action = async ({ request }: ActionArgs) => {
  const user = await requireUser(request);

  const newDnsRecordParams = await parseFormSafe(request, DnsRecordSchema);
  if (newDnsRecordParams.success === false) {
    return newDnsRecordParams.error.flatten();
  }

  const { data } = newDnsRecordParams;

  await addDnsRequest({
    username: user.username,
    type: data.type,
    subdomain: data.subdomain,
    value: data.value,
  });

  return redirect(`/dns-records`);
};

export default function NewDnsRecordRoute() {
  const actionData = useActionData();

  return (
    <Container maxW="container.xl" ml={[null, null, '10vw']}>
      <Heading as="h1" size="xl" mt="8">
        Create new DNS Record
      </Heading>
      <Text maxW="lg" mb="3" mt="2">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
        been the industry's standard dummy text ever since the 1500s
      </Text>
      <DnsRecordForm errors={actionData} mode="CREATE" />
    </Container>
  );
}
