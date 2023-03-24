import { Flex, Center } from '@chakra-ui/react';
import type { LoaderArgs, ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useTypedLoaderData } from 'remix-typedjson';
import { useRevalidator } from '@remix-run/react';
import { useInterval } from 'react-use';

import { requireUser } from '~/session.server';
import pendingSvg from '~/assets/undraw_processing_re_tbdu.svg';
import failedSvg from '~/assets/undraw_cancel_re_pkdm.svg';
import Loading from '~/components/display-page';
import CertificateAvailable from '~/components/certificate/certificate-available';
import CertificateRequestView from '~/components/certificate/certificate-request';
import { useUser } from '~/utils';
import { getCertificateStatusByUsername } from '~/models/certificate.server';
import { addCertRequest } from '~/queues/certificate/certificate-flow.server';

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);

  return await getCertificateStatusByUsername(user.username);
};

export const action = async ({ request }: ActionArgs) => {
  const user = await requireUser(request);

  await addCertRequest({
    rootDomain: user.baseDomain,
    username: user.username,
  });

  return json({
    result: 'ok',
    message: 'Certificate requested',
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
    certificate.status === 'pending' ||
      certificate.status === 'failed' ||
      certificate.status === 'issued' ||
      certificate.status === undefined
      ? 5_000
      : null
  );

  function formatDate(val: Date): string {
    // let date = val.toLocaleDateString('en-US', {
    //   month: 'short',
    //   day: '2-digit',
    //   year: 'numeric',
    // });

    return 'string';
  }

  if (certificate.status === 'failed') {
    return (
      <Loading
        img={failedSvg}
        desc="Unfortunately we were unable to process your certificate, please try again"
      />
    );
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
