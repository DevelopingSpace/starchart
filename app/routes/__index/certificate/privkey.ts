import type { LoaderArgs } from '@remix-run/node';
import { Response } from '@remix-run/node';
import { requireUsername } from '~/session.server';
import { getCertificateByUsername } from '~/models/certificate.server';

export async function loader({ request }: LoaderArgs) {
  const username = await requireUsername(request);

  try {
    const certificate = await getCertificateByUsername(username);

    // When the certificate is at a "pending" state, it will throw an error 409
    // A certificate will not have a private key until it is issued
    if (!certificate.privateKey) {
      throw new Response('Private Key was not found', { status: 409 });
    }

    // Return certificate as pem file
    return new Response(certificate.privateKey, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-pem-file',
        'Content-Disposition': `attachment; filename=${certificate.domain}.privkey.pem`,
      },
    });
  } catch {
    throw new Response('Certificate Not Found', { status: 404 });
  }
}
