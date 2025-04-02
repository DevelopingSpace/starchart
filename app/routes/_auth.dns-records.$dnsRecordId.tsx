import { Container, Heading, Text, Link } from '@chakra-ui/react';
import { redirect, typedjson, useTypedLoaderData } from 'remix-typedjson';
import { parseFormSafe } from 'zodix';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import DnsRecordForm from '~/components/dns-record/form';
import { requireUser } from '~/session.server';
import { getDnsRecordById, updateDnsRecordById } from '~/models/dns-record.server';
import { isNameValid, UpdateDnsRecordSchema } from '~/lib/dns.server';
import {
  useActionData,
  useParams,
  Link as RemixLink,
  useRouteError,
  isRouteErrorResponse,
} from '@remix-run/react';
import { buildDomain, getErrorMessageFromStatusCode } from '~/utils';
import SeenErrorLayout from '~/components/errors/seen-error-layout';
import UnseenErrorLayout from '~/components/errors/unseen-error-layout';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireUser(request);

  const { dnsRecordId } = params;

  if (!dnsRecordId || !parseInt(dnsRecordId)) {
    throw new Response('DNS Record ID is not valid', {
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

export const action = async ({ request }: ActionFunctionArgs) => {
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

function mapStatusToErrorText(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'Provided Record ID is not valid';
    default:
      return getErrorMessageFromStatusCode(statusCode);
  }
}

export function ErrorBoundary() {
  const error = useRouteError();
  const { dnsRecordId } = useParams();

  if (isRouteErrorResponse(error)) {
    return <SeenErrorLayout result={error} mapStatusToErrorText={mapStatusToErrorText} />;
  }

  return (
    <UnseenErrorLayout
      errorText={`We got an unexpected error working with your dns record with id ${dnsRecordId}, but don't worry our team is already on it's way to fix it`}
    />
  );
}

export default function DnsRecordRoute() {
  const dnsRecord = useTypedLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <Container maxW="container.xl">
      <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mt={{ base: 6, md: 12 }}>
        Edit DNS Record
      </Heading>
      <Text maxW="lg" mb="3" mt="2">
        Choose a subdomain Name. This will be used to build your domain.
        <br /> (i.e. [subdomain].[username].mystudentproject.ca). <br />
        Then enter a Type and Value that will be mapped with your domain. For more info refer to our{' '}
        <Link asChild>
          <RemixLink to={{ pathname: '/dns-records/instructions' }}>instructions page.</RemixLink>
        </Link>
      </Text>
      <DnsRecordForm errors={actionData} dnsRecord={dnsRecord} mode="EDIT" />
    </Container>
  );
}
