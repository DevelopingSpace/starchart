import { Container, Heading, Text } from '@chakra-ui/react';
import { redirect, typedjson, useTypedLoaderData } from 'remix-typedjson';
import { parseFormSafe } from 'zodix';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import DnsRecordForm from '~/components/dns-record/form';
import { requireUser } from '~/session.server';
import { getDnsRecordById, updateDnsRecordById } from '~/models/dns-record.server';
import { isNameValid, UpdateDnsRecordSchema } from '~/lib/dns.server';
import { useActionData, Link } from '@remix-run/react';
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
      message:
        'Record name is invalid or inappropriate (only alphanumerical character, -, and _ allowed)',
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
  const { id, ...rest } = data;
  await updateDnsRecordById(Number(id), rest);

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
        Choose a subdomain Name. This will be used to build your domain.
        <br /> (i.e. [subdomain].[username].mystudentproject.ca). <br />
        Then enter a Type and Value that will be mapped with your domain. For more info refer to our{' '}
        <Link to={{ pathname: '/dns-records/instructions' }}>
          <Text as="span" textDecoration="underline">
            instructions page.
          </Text>
        </Link>
      </Text>
      <DnsRecordForm errors={actionData} dnsRecord={dnsRecord} mode="EDIT" />
    </Container>
  );
}
