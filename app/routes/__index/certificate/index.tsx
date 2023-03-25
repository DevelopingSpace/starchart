import { Flex, Center } from '@chakra-ui/react';
import type { LoaderArgs, ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import { useRevalidator } from '@remix-run/react';
import { useInterval } from 'react-use';

import { requireUser } from '~/session.server';
import pendingSvg from '~/assets/undraw_processing_re_tbdu.svg';
import Loading from '~/components/display-page';
import CertificateAvailable from '~/components/certificate/certificate-available';
import CertificateRequestView from '~/components/certificate/certificate-request';
import { useUser } from '~/utils';
import { getCertificateStatusByUsername } from '~/models/certificate.server';
import { addCertRequest } from '~/queues/certificate/certificate-flow.server';

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  let certificate;

  try {
    certificate = await getCertificateStatusByUsername(user.username);
  } catch {
    certificate = {
      status: undefined,
    };
  }

  return typedjson(certificate);
};

export const action = async ({ request }: ActionArgs) => {
  const user = await requireUser(request);
  const certificate = await getCertificateStatusByUsername(user.username);

  if (request.method !== 'POST') {
    return json({
      result: 'error',
      message: 'Invalid Request Method',
    });
  }

  if (certificate.status !== 'pending' && certificate.status !== 'issued') {
    await addCertRequest({
      rootDomain: user.baseDomain,
      username: user.username,
    });

    return json({
      result: 'ok',
      message: 'Certificate requested',
    });
  }

  return json({
    result: 'ok',
    message: 'A certificate is already being requested',
  });
};

export default function CertificateIndexRoute() {
  const user = useUser();
  const revalidator = useRevalidator();
  const certificate = useTypedLoaderData<typeof loader>();

  useInterval(
    () => {
      revalidator.revalidate();
    },
    certificate.status === 'pending' ? 5_000 : null
  );

  function formatDate(val: Date): string {
    let date = val.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

    return date;
  }

  if (certificate.status === 'pending') {
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
        {certificate.status === 'issued' ? (
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
