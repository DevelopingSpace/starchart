import { Container, Heading, Text, Link } from '@chakra-ui/react';
import { parseFormSafe } from 'zodix';
import { redirect } from 'remix-typedjson';

import DnsRecordForm from '~/components/dns-record/form';
import { requireUser } from '~/session.server';
import { createDnsRecord } from '~/models/dns-record.server';

import type { ActionArgs } from '@remix-run/node';
import { DnsRecordSchema, isNameValid } from '~/lib/dns.server';
import { useActionData, Link as RemixLink } from '@remix-run/react';
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

  await createDnsRecord({
    username: user.username,
    type: data.type,
    subdomain: data.subdomain,
    value: data.value,
    ports: data.ports,
    course: data.course,
    description: data.description,
  });

  return redirect(`/dns-records`);
};

export default function NewDnsRecordRoute() {
  const actionData = useActionData();

  return (
    <Container maxW="container.xl">
      <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mt={{ base: 6, md: 12 }}>
        Create new DNS Record
      </Heading>
      <Text maxW="lg" mb="3" mt="2">
        Choose a subdomain Name. This will be used to build your domain.
        <br /> (i.e. [subdomain].[username].mystudentproject.ca). <br />
        Then enter a Type and Value that will be mapped with your domain. For more info refer to our{' '}
        <Link as={RemixLink} to={{ pathname: '/dns-records/instructions' }}>
          instructions page.
        </Link>
      </Text>
      <DnsRecordForm errors={actionData} mode="CREATE" />
    </Container>
  );
}
