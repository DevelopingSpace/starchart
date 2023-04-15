import type { LoaderArgs } from '@remix-run/node';
import { Response } from '@remix-run/node';

import { requireUsername } from '~/session.server';
import { getCertificateByUsername } from '~/models/certificate.server';
import { CertificateStatus } from '@prisma/client';

function createResponse(body: string | null, filename: string) {
  if (!body) {
    throw new Response('Unable to get certificate part', { status: 400 });
  }

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/x-pem-file',
      'Content-Disposition': `attachment; filename=${filename}`,
    },
  });
}

export async function loader({ request, params }: LoaderArgs) {
  const username = await requireUsername(request);

  try {
    const certificate = await getCertificateByUsername(username);

    // When the certificate is at a "pending" state, it will throw an error 409
    // A certificate will not have a certificate key until it is issued
    if (certificate.status !== CertificateStatus.issued) {
      throw new Response('Certificate not yet issued, try again later', { status: 409 });
    }

    // Return the desired part of the certificate
    switch (params.part) {
      case 'certificate':
        return createResponse(certificate.certificate, `${certificate.domain}.certificate.pem`);
      case 'privateKey':
        return createResponse(certificate.privateKey, `${certificate.domain}.privkey.pem`);
      case 'chain':
        return createResponse(certificate.certificate, `${certificate.domain}.chain.pem`);
      case 'fullChain':
        return createResponse(certificate.certificate, `${certificate.domain}.bundle.pem`);
      default:
        throw new Response(`Unknown certificate part: ${params.part}`, { status: 400 });
    }
  } catch (e) {
    throw new Response('Certificate Not Found', { status: 404 });
  }
}
