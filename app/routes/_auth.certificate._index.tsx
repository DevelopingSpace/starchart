import { Flex, Heading } from '@chakra-ui/react';
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import { isRouteErrorResponse, useRevalidator, useRouteError } from '@remix-run/react';
import { useInterval } from 'react-use';

import { requireUser, requireUsername } from '~/session.server';
import pendingSvg from '~/assets/undraw_processing_re_tbdu.svg';
import Loading from '~/components/image-with-message';
import CertificateAvailable from '~/components/certificate/certificate-available';
import CertificateRequestView from '~/components/certificate/certificate-request';
import { getErrorMessageFromStatusCode, useEffectiveUser } from '~/utils';
import { getCertificateByUsername, deleteCertificateById } from '~/models/certificate.server';
import { addCertRequest } from '~/queues/certificate/certificate-flow.server';
import UnseenErrorLayout from '~/components/errors/unseen-error-layout';
import SeenErrorLayout from '~/components/errors/seen-error-layout';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const username = await requireUsername(request);

  try {
    const certificate = await getCertificateByUsername(username);
    return typedjson({ certificate });
  } catch (error: any) {
    throw new Error('Error retrieving certificate: ' + error.message);
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  if (request.method !== 'POST') {
    return json({
      result: 'error',
      message: 'Invalid Request Method',
    });
  }
  let certificate;
  const user = await requireUser(request);

  try {
    certificate = await getCertificateByUsername(user.username);

    if (certificate && certificate.status === 'pending') {
      return json({
        result: 'ok',
        message: 'A certificate request is already pending',
      });
    }
  } catch (error: any) {
    throw new Error('Error retrieving certificate: ' + error.message);
  }

  if (form.get('intent') === 'delete-certificate') {
    try {
      await deleteCertificateById(certificate.id);
    } catch (error: any) {
      throw new Error('Error deleting certificate: ' + error.message);
    }
    return json({
      result: 'ok',
      message: 'Certificate Deleted',
    });
  }
  try {
    await addCertRequest({
      rootDomain: user.baseDomain,
      username: user.username,
    });
  } catch (error: any) {
    throw new Error('Error requesting certificate: ' + error.message);
  }

  return json({
    result: 'ok',
    message: 'Certificate Requested',
  });
};

function formatDate(val: Date): string {
  const date = val.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  return date;
}

function mapStatusToErrorText(statusCode: number): string {
  switch (statusCode) {
    case 404:
      return 'Sorry we could not find your certificate';
    case 409:
      return 'Sorry, your certificate is not issued yet. Please try again later.';
    default:
      return getErrorMessageFromStatusCode(statusCode);
  }
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return <SeenErrorLayout result={error} mapStatusToErrorText={mapStatusToErrorText} />;
  }

  return (
    <UnseenErrorLayout errorText="We got an unexpected error working with your certificate, but don't worry our team is already on it's way to fix it" />
  );
}

export default function CertificateIndexRoute() {
  const user = useEffectiveUser();
  const revalidator = useRevalidator();
  const { certificate } = useTypedLoaderData<typeof loader>();

  useInterval(
    () => {
      revalidator.revalidate();
    },
    certificate?.status === 'pending' ? 5_000 : null
  );

  if (certificate?.status === 'pending') {
    return (
      <Loading
        img={pendingSvg}
        desc="We have received your request, and will notify you by email when your certificate is ready. This process will take some time. You can move to another page while we finish processing your request."
        alt="Two people processing a document together"
      />
    );
  }

  return (
    <Flex flexDirection="column" gap="5">
      <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mt={{ base: 6, md: 12 }}>
        Certificate
      </Heading>
      {certificate?.status === 'issued' ? (
        <CertificateAvailable
          certificate={certificate}
          validFromFormatted={formatDate(certificate.validFrom!)}
          validToFormatted={formatDate(certificate.validTo!)}
        />
      ) : (
        <CertificateRequestView
          domain={user.baseDomain}
          isFailed={certificate?.status === 'failed'}
        />
      )}
    </Flex>
  );
}
