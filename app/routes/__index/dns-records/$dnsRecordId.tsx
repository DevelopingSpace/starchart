import { Container, Heading, Text } from '@chakra-ui/react';
import { redirect, typedjson, useTypedLoaderData } from 'remix-typedjson';
import { parseFormSafe } from 'zodix';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import DnsRecordForm from '~/components/dns-record/form';
import { requireUser } from '~/session.server';
import { getDnsRecordById } from '~/models/dns-record.server';
import { updateDnsRequest } from '~/queues/dns/update-dns-record-flow.server';
import { isNameValid, UpdateDnsRecordSchema } from '~/lib/dns.server';
import { useActionData } from '@remix-run/react';
import { buildDomain } from '~/utils';

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

  const UpdateDnsRecordSchemaWithNameValidation = UpdateDnsRecordSchema.refine(
    (data) => {
      const fqdn = buildDomain(user.username, data.subdomain);
      return isNameValid(fqdn, user.username);
    },
    {
      message: 'Record name is invalid',
      path: ['subdomain'],
    }
  );

  const updatedDnsRecordParams = await parseFormSafe(
    request,
    UpdateDnsRecordSchemaWithNameValidation
  );
  if (updatedDnsRecordParams.success === false) {
    return updatedDnsRecordParams.error.flatten();
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
  const actionData = useActionData();

  return (
    <Container maxW="container.xl" ml={[null, null, '10vw']}>
      <Heading as="h1" size="xl" mt="8">
        Edit DNS Record
      </Heading>
      <Text maxW="lg" mb="3" mt="2">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
        been the industry's standard dummy text ever since the 1500s
      </Text>
      <DnsRecordForm errors={actionData} dnsRecord={dnsRecord} mode="EDIT" />
    </Container>
  );
}
