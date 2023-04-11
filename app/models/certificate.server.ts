import type { Certificate } from '@prisma/client';

import { prisma } from '~/db.server';

export type CertificateWithFullChain = Certificate & { fullChain?: string };

// If we have the certificate and chain, use them to add the fullChain
function computeFullChain(certificate: Certificate): CertificateWithFullChain {
  return certificate?.certificate && certificate?.chain
    ? { ...certificate, fullChain: `${certificate.certificate}${certificate.chain}` }
    : certificate;
}

export async function getCertificateByUsername(username: Certificate['username']) {
  return (
    prisma.certificate
      .findMany({
        where: { username },
        orderBy: { id: 'desc' },
        take: 1,
      })
      /**
       * There might be multiple certificates in the db for the same user, let's get
       * the most recent one that has been successfully issued.  Also, decorate it
       * with a fullChain property if possible.
       */
      .then(([certificate]) => computeFullChain(certificate))
  );
}

export function getCertificateById(id: Certificate['id']) {
  return prisma.certificate.findUniqueOrThrow({ where: { id }, include: { user: true } });
}

export function createCertificate(data: Pick<Certificate, 'username' | 'domain'>) {
  return prisma.certificate.create({ data: { ...data } });
}

export function updateCertificateById(
  id: number,
  data: Partial<
    Pick<
      Certificate,
      'orderUrl' | 'certificate' | 'chain' | 'privateKey' | 'validFrom' | 'validTo' | 'status'
    >
  >
) {
  return prisma.certificate.update({
    where: { id },
    data,
  });
}

export function deleteCertificateById(id: Certificate['id']) {
  return prisma.certificate.delete({ where: { id } });
}

export function getTotalCertificateCount() {
  return prisma.certificate.count();
}

export function getExpiredCertificates() {
  return prisma.certificate.findMany({
    where: {
      validTo: {
        lt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });
}
