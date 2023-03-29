import { Container, Heading, Text } from '@chakra-ui/react';
import { parseFormSafe } from 'zodix';
import { redirect } from 'remix-typedjson';

import DnsRecordForm from '~/components/dns-record/form';
import { requireUser } from '~/session.server';
import { addCreateDnsRequest } from '~/queues/dns/index.server';

import type { ActionArgs } from '@remix-run/node';
import { DnsRecordSchema, isNameValid } from '~/lib/dns.server';
import { useActionData } from '@remix-run/react';
import { buildDomain } from '~/utils';

export const action = async ({ request }: ActionArgs) => {
  const user = await requireUser(request);
  const DnsRecordSchemaWithNameValidation = DnsRecordSchema.refine(
    (data) => {
      const fqdn = buildDomain(user.username, data.subdomain);
      return isNameValid(fqdn, user.username);
    },
    {
      message:
        'Record name is invalid or inappropriate (only alphanumerical character, -, and _ allowed)',
      path: ['subdomain'],
    }
  );

  const newDnsRecordParams = await parseFormSafe(request, DnsRecordSchemaWithNameValidation);
  if (newDnsRecordParams.success === false) {
    return newDnsRecordParams.error.flatten();
  }

  const { data } = newDnsRecordParams;

  await addCreateDnsRequest({
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
