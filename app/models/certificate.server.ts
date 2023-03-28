import type { Certificate } from '@prisma/client';

import { prisma } from '~/db.server';

export type { Certificate } from '@prisma/client';

export async function getCertificateByUsername(username: Certificate['username']) {
  /**
   * There might be multiple certificates in the db for the same user, let's get
   * the most recent one that has been successfully issued
   */

  return prisma.certificate
    .findMany({
      where: {
        username,
      },
      orderBy: { id: 'desc' },
      take: 1,
    })
    .then(([certificate]) => certificate);
}

export function getCertificateById(id: Certificate['id']) {
  return prisma.certificate.findUniqueOrThrow({ where: { id } });
}

export function createCertificate(data: Pick<Certificate, 'username' | 'domain'>) {
  return prisma.certificate.create({ data: { ...data } });
}

export function updateCertificateById(
  id: number,
  data: Partial<
    Pick<
      Certificate,
      'orderUrl' | 'certificate' | 'privateKey' | 'validFrom' | 'validTo' | 'status'
    >
  >
) {
  return prisma.certificate.update({
    where: { id },
    data,
  });
}

export function deleteAllCertificatesByUsername(username: Certificate['username']) {
  return prisma.certificate.deleteMany({ where: { username } });
}

export function deleteCertificateById(id: Certificate['id']) {
  return prisma.certificate.delete({ where: { id } });
}
