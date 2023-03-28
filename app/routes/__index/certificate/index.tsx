import { Flex, Center } from '@chakra-ui/react';
import type { LoaderArgs, ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import { useRevalidator } from '@remix-run/react';
import { useInterval } from 'react-use';

import { requireUser, requireUsername } from '~/session.server';
import pendingSvg from '~/assets/undraw_processing_re_tbdu.svg';
import Loading from '~/components/display-page';
import CertificateAvailable from '~/components/certificate/certificate-available';
import CertificateRequestView from '~/components/certificate/certificate-request';
import { useUser } from '~/utils';
import { getCertificateByUsername } from '~/models/certificate.server';
import { addCertRequest } from '~/queues/certificate/certificate-flow.server';

export const loader = async ({ request }: LoaderArgs) => {
  const username = await requireUsername(request);

  try {
    const certificate = await getCertificateByUsername(username);
    return typedjson({ certificate });
  } catch (error: any) {
    throw new Error('Error retrieving certificate: ' + error.message);
  }
};

export const action = async ({ request }: ActionArgs) => {
  if (request.method !== 'POST') {
    return json({
      result: 'error',
      message: 'Invalid Request Method',
    });
  }

  const user = await requireUser(request);

  try {
    const certificate = await getCertificateByUsername(user.username);

    if (certificate && certificate.status === 'pending') {
      return json({
        result: 'ok',
        message: 'A certificate request is already pending',
      });
    }
  } catch (error: any) {
    throw new Error('Error retrieving certificate: ' + error.message);
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

export default function CertificateIndexRoute() {
  const user = useUser();
  const revalidator = useRevalidator();
  const certificate = useTypedLoaderData<typeof loader>().certificate;

  useInterval(
    () => {
      revalidator.revalidate();
    },
    certificate?.status === 'pending' ? 15_000 : null
  );

  function formatDate(val: Date): string {
    let date = val.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

    return date;
  }

  if (certificate?.status === 'pending') {
    return (
      <Loading
        img={pendingSvg}
        desc="We have received your request, and will notify you when your certificate is ready"
      />
    );
  }

  return (
    <Center>
      <Flex
        flexDirection="column"
        gap="5"
        width={{ base: 'md', sm: 'lg', md: '2xl', lg: '4xl' }}
        marginTop={{ base: '16', md: '5' }}
      >
        {certificate?.status === 'issued' ? (
          <CertificateAvailable
            publicKey={certificate.certificate!}
            privateKey={certificate.privateKey!}
            validFromFormatted={formatDate(certificate.validFrom!)}
            validToFormatted={formatDate(certificate.validTo!)}
          />
        ) : (
          <CertificateRequestView domain={user.baseDomain} />
        )}
      </Flex>
    </Center>
  );
}
